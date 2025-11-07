# Frontend File Upload Implementation

## ✅ Backend Status
- Upload module created and configured
- Migration completed (banner and attachments fields added)
- API endpoints ready:
  - POST `/api/upload/image` - Upload and process images
  - POST `/api/upload/attachment` - Upload tournament attachments
  - DELETE `/api/upload/attachment/:tournamentId/:filename` - Delete attachment

## 📋 Frontend Implementation Steps

### 1. Update API Service (`src/services/api.ts`)

Add these methods to the apiService class:

```typescript
// Upload image (avatar or banner)
uploadImage(
  file: Blob,
  type: 'avatar' | 'banner',
  options?: {
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    quality?: number;
  }
): Promise<{ url: string; filename: string; size: number; dimensions: { width: number; height: number } }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  if (options) {
    if (options.cropX !== undefined) formData.append('cropX', options.cropX.toString());
    if (options.cropY !== undefined) formData.append('cropY', options.cropY.toString());
    if (options.cropWidth !== undefined) formData.append('cropWidth', options.cropWidth.toString());
    if (options.cropHeight !== undefined) formData.append('cropHeight', options.cropHeight.toString());
    if (options.quality !== undefined) formData.append('quality', options.quality.toString());
  }

  return this.request('/upload/image', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });
},

// Upload attachment
uploadAttachment(
  file: File,
  tournamentId: string
): Promise<{ id: string; url: string; filename: string; size: number; mimeType: string; uploadedAt: string }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tournamentId', tournamentId);

  return this.request('/upload/attachment', {
    method: 'POST',
    body: formData,
  });
},

// Delete attachment
deleteAttachment(tournamentId: string, filename: string): Promise<void> {
  return this.request(`/upload/attachment/${tournamentId}/${filename}`, {
    method: 'DELETE',
  });
},
```

### 2. Update BannerUploader Component

Replace the `handleSave` method in `src/components/BannerUploader/BannerUploader.tsx`:

```typescript
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState<string | null>(null);

const handleSave = async () => {
  if (!imageEl || !naturalSize) return;

  try {
    setUploading(true);
    setUploadError(null);

    // Create canvas and get image data (keep existing crop logic)
    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseScaleW = width / naturalSize.w;
    const baseScaleH = height / naturalSize.h;
    const baseScale = Math.max(baseScaleW, baseScaleH);
    const scale = baseScale * zoom;
    const sx = Math.max(0, Math.min(naturalSize.w - width / scale, -offset.x / scale));
    const sy = Math.max(0, Math.min(naturalSize.h - height / scale, -offset.y / scale));
    const sWidth = width / scale;
    const sHeight = height / scale;
    ctx.clearRect(0, 0, outputWidth, outputHeight);
    ctx.drawImage(imageEl, sx, sy, sWidth, sHeight, 0, 0, outputWidth, outputHeight);

    // Convert canvas to Blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.9);
    });

    if (!blob) {
      throw new Error('Failed to create blob');
    }

    // Upload to server
    const result = await apiService.uploadImage(blob, 'banner', {
      quality: 90,
    });

    // Pass URL to parent component (not base64!)
    onChange(result.url);

    // Update local preview
    setImageSrc(result.url);
  } catch (error) {
    console.error('Upload failed:', error);
    setUploadError(t('pages.tournaments.uploadFailed', 'Failed to upload image'));
  } finally {
    setUploading(false);
  }
};
```

Update the button to show upload state:

```typescript
<Button
  variant="contained"
  onClick={handleSave}
  disabled={!imageEl || uploading}
>
  {uploading
    ? t('pages.tournaments.uploading', 'Uploading...')
    : t('profile.cropAndSave', 'Crop and Save')}
</Button>

{uploadError && (
  <Typography variant="caption" color="error">{uploadError}</Typography>
)}
```

### 3. Update AvatarUploader Component

Same changes as BannerUploader, but use `type: 'avatar'`:

```typescript
const result = await apiService.uploadImage(blob, 'avatar', {
  quality: 90,
});
```

### 4. Update FileAttachments Component

Major changes needed to upload files directly instead of base64:

```typescript
// Update interface to NOT include dataUrl
export interface FileAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

// Update props to include tournamentId
interface FileAttachmentsProps {
  value: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  tournamentId: string; // Required for upload
  maxFiles?: number;
  maxSizeBytes?: number;
}

// Update handleFileChange
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);

  if (value.length + files.length > maxFiles) {
    setError(t('pages.tournaments.tooManyFiles', {
      maxFiles,
      remaining: maxFiles - value.length,
      defaultValue: `Maximum ${maxFiles} files allowed.`
    }));
    return;
  }

  const validFiles: FileAttachment[] = [];
  const errors: string[] = [];

  setError(null);

  for (const file of files) {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      errors.push(t('pages.tournaments.unsupportedFileType', {
        fileName: file.name,
        defaultValue: `${file.name}: Unsupported file type.`
      }));
      continue;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      errors.push(t('pages.tournaments.fileTooLarge', {
        fileName: file.name,
        maxSize: formatFileSize(maxSizeBytes),
        defaultValue: `${file.name}: File is too large.`
      }));
      continue;
    }

    // Upload file
    try {
      const result = await apiService.uploadAttachment(file, tournamentId);
      validFiles.push(result);
    } catch (err) {
      errors.push(t('pages.tournaments.fileReadError', {
        fileName: file.name,
        defaultValue: `${file.name}: Failed to upload.`
      }));
    }
  }

  if (errors.length > 0) {
    setError(errors.join('; '));
  }

  if (validFiles.length > 0) {
    onChange([...value, ...validFiles]);
  }

  // Reset input
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

// Update handleRemove to delete from server
const handleRemove = async (id: string) => {
  const attachment = value.find(f => f.id === id);
  if (!attachment) return;

  try {
    // Extract filename from URL
    const filename = attachment.url.split('/').pop();
    if (!filename) return;

    // Delete from server
    await apiService.deleteAttachment(tournamentId, filename);

    // Remove from state
    onChange(value.filter((file) => file.id !== id));
    setError(null);
  } catch (error) {
    console.error('Delete failed:', error);
    setError(t('pages.tournaments.deleteFileFailed', 'Failed to delete file'));
  }
};
```

### 5. Update Tournament Create/Edit Forms

In `tournament-create.tsx` and `tournament-edit.tsx`:

```typescript
// For create: Generate temporary tournamentId for attachments
const [tempTournamentId] = useState(() => uuid());

// For edit: Use actual tournamentId
const { tournamentId } = useParams();

// Update FileAttachments usage
<FileAttachments
  value={formData.attachments}
  onChange={(files) => {
    setFormData({ ...formData, attachments: files });
  }}
  tournamentId={editingTournament ? tournamentId : tempTournamentId}
/>
```

**Note**: For create form, attachments will be stored with temp ID, then need to be moved/reassigned after tournament is created. Alternative: Only allow attachments on edit, not create.

### 6. Add Translation Keys

Add to `src/locales/en/common.json`:

```json
{
  "pages": {
    "tournaments": {
      "uploadFailed": "Failed to upload image",
      "uploading": "Uploading...",
      "deleteFileFailed": "Failed to delete file"
    }
  }
}
```

### 7. Important: Remove Base64 Logic

Remove these from components:
- `readAsDataURL` usage
- `dataUrl` field in interfaces
- Base64 string handling

### 8. Testing Checklist

- [ ] Upload avatar in profile
- [ ] Upload tournament banner in create form
- [ ] Upload tournament banner in edit form
- [ ] Upload attachments (PDF, images, DOC)
- [ ] Delete attachments
- [ ] Verify images are WebP format on server
- [ ] Verify file sizes are reasonable
- [ ] Verify URLs work (images display correctly)
- [ ] Test with large files (should reject)
- [ ] Test with invalid file types (should reject)

## 🔧 Simplified Alternative (If Time-Constrained)

For attachments in create form, you have two options:

**Option A**: Disable attachments in create, only allow in edit
```typescript
{editingTournament && (
  <FileAttachments
    value={formData.attachments}
    onChange={(files) => setFormData({ ...formData, attachments: files })}
    tournamentId={tournamentId}
  />
)}
```

**Option B**: Upload attachments after tournament creation
1. Create tournament without attachments
2. Get tournament ID from response
3. Upload attachments with real ID
4. Update tournament with attachment URLs

## 🚀 Deployment Notes

1. Create `uploads` directory on server:
   ```bash
   mkdir -p uploads/images/avatars
   mkdir -p uploads/images/banners
   mkdir -p uploads/attachments
   ```

2. Set proper permissions:
   ```bash
   chmod 755 uploads
   chmod 755 uploads/images uploads/attachments
   ```

3. Ensure backend serves static files (already configured in main.ts)

4. Consider adding `.gitignore` entry:
   ```
   uploads/
   ```

5. For production, consider:
   - CDN for images
   - S3/cloud storage
   - Image optimization service
   - Backup strategy for uploads
