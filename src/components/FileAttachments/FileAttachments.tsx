import './FileAttachments.scss';

import { Delete, AttachFile, PictureAsPdf, Description, Image } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Chip,
  CircularProgress,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { apiService } from '../../services/api';

export interface FileAttachment {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
}

interface FileAttachmentsProps {
  value: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  tournamentId?: string;
  maxFiles?: number;
  maxSizeBytes?: number;
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50MB per file (backend limit)
const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ACCEPTED_EXTENSIONS = '.png,.jpg,.jpeg,.pdf,.doc,.docx';

const FileAttachments: React.FC<FileAttachmentsProps> = ({
  value,
  onChange,
  tournamentId,
  maxFiles = 10,
  maxSizeBytes = MAX_SIZE_BYTES,
}) => {
  const { t } = useTranslation('common');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image />;
    if (type === 'application/pdf') return <PictureAsPdf />;
    if (type.includes('word') || type.includes('document')) return <Description />;
    return <AttachFile />;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tournamentId) {
      setError('Tournament must be saved before adding attachments.');
      return;
    }
    const files = Array.from(e.target.files || []);

    if (value.length + files.length > maxFiles) {
      setError(
        t('pages.tournaments.tooManyFiles', {
          maxFiles,
          remaining: maxFiles - value.length,
          defaultValue: `Maximum ${maxFiles} files allowed. You can upload ${maxFiles - value.length} more file(s).`
        })
      );
      return;
    }

    setUploading(true);
    setError(null);

    const uploadedFiles: FileAttachment[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(
          t('pages.tournaments.unsupportedFileType', {
            fileName: file.name,
            defaultValue: `${file.name}: Unsupported file type. Allowed: PNG, JPG, PDF, DOC, DOCX`
          })
        );
        continue;
      }

      // Check file size
      if (file.size > maxSizeBytes) {
        errors.push(
          t('pages.tournaments.fileTooLarge', {
            fileName: file.name,
            maxSize: formatFileSize(maxSizeBytes),
            defaultValue: `${file.name}: File is too large (max ${formatFileSize(maxSizeBytes)})`
          })
        );
        continue;
      }

      // Upload file to backend
      try {
        const result = await apiService.uploadAttachment(file, tournamentId);
        uploadedFiles.push(result);
      } catch (err) {
        errors.push(
          t('pages.tournaments.uploadFailed', {
            fileName: file.name,
            defaultValue: `${file.name}: Upload failed. Please try again.`
          })
        );
        console.error(`Upload failed for ${file.name}:`, err);
      }
    }

    if (errors.length > 0) {
      setError(errors.join('; '));
    }

    if (uploadedFiles.length > 0) {
      onChange([...value, ...uploadedFiles]);
    }

    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async (id: string, filename: string) => {
    if (!tournamentId) return;
    setError(null);

    try {
      await apiService.deleteAttachment(tournamentId, filename);
      onChange(value.filter((file) => file.id !== id));
    } catch (err) {
      setError(t('pages.tournaments.deleteFileFailed', 'Failed to delete file. Please try again.'));
      console.error('Delete failed:', err);
    }
  };

  const handleAddFiles = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="file-attachments">
      <CardHeader
        title={t('pages.tournaments.attachments', 'Additional Attachments (Optional)')}
        subheader={t('pages.tournaments.attachmentsSubheader', {
          maxSize: formatFileSize(maxSizeBytes),
          maxFiles,
          defaultValue: `Upload custom rules, images, or documents (PNG, JPG, PDF, DOC, DOCX up to ${formatFileSize(maxSizeBytes)} each, max ${maxFiles} files)`
        })}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <input
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="file-attachments__file-input"
              multiple
            />
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={16} /> : <AttachFile />}
              onClick={handleAddFiles}
              disabled={value.length >= maxFiles || uploading}
            >
              {uploading ? t('pages.tournaments.uploading', 'Uploading...') : t('pages.tournaments.addFiles', 'Add Files')}
            </Button>
            {value.length > 0 && (
              <Chip
                label={t('pages.tournaments.filesCount', {
                  count: value.length,
                  max: maxFiles,
                  defaultValue: `${value.length}/${maxFiles} files`
                })}
                size="small"
                sx={{ ml: 2 }}
              />
            )}
          </Box>

          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}

          {value.length > 0 && (
            <List className="file-attachments__list">
              {value.map((file) => (
                <ListItem key={file.id} className="file-attachments__list-item">
                  <Box sx={{ mr: 2, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                    {getFileIcon(file.mimeType)}
                  </Box>
                  <ListItemText
                    primary={file.filename}
                    secondary={formatFileSize(file.size)}
                    primaryTypographyProps={{ noWrap: true }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleRemove(file.id, file.filename)}
                      color="error"
                      size="small"
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}

          {value.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              {t('pages.tournaments.noAttachments', 'No attachments added yet')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileAttachments;
