import './LogoUploader.scss';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Slider,
  Typography,
  CircularProgress,
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotification } from '../../contexts/error-feedback-context';
import { requiresCrossOriginForCanvas } from '../../utils/placeholder-images';

interface LogoUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  /** Cropped logo file kept locally until the club form is saved. */
  onPendingFileChange?: (file: File | null) => void;
  size?: number; // viewport size in px (square)
  outputSize?: number; // output canvas size (square)
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (API limit)
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const LogoUploader: React.FC<LogoUploaderProps> = ({
  value,
  onChange,
  onPendingFileChange,
  size = 240,
  outputSize = 512,
}) => {
  const { t } = useTranslation('common');
  const { showSuccess } = useNotification();
  const [imageSrc, setImageSrc] = useState<string | undefined>(value);
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const didDragRef = useRef<boolean>(false);
  const offsetStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const currentFileRef = useRef<File | null>(null);
  const autoPrepareAfterSelectRef = useRef(false);
  const onPendingFileChangeRef = useRef(onPendingFileChange);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPendingFileChangeRef.current = onPendingFileChange;
    onChangeRef.current = onChange;
  }, [onPendingFileChange, onChange]);

  useEffect(() => {
    setImageSrc(value);
  }, [value]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    if (requiresCrossOriginForCanvas(imageSrc)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      setImageEl(img);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      const baseScale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
      const scaledW = img.naturalWidth * baseScale;
      const scaledH = img.naturalHeight * baseScale;
      setOffset({ x: (size - scaledW) / 2, y: (size - scaledH) / 2 });
    };
    img.onerror = () => {
      console.warn('Failed to load logo image (possibly CORS issue):', imageSrc);
      setImageEl(null);
    };
    img.src = imageSrc;
  }, [imageSrc, size]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError(t('profile.unsupportedType', 'Unsupported file type. Allowed: PNG, JPG, JPEG'));
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(t('profile.imageTooLarge', 'Image is too large (max 10MB).'));
      return;
    }
    setError(null);
    currentFileRef.current = file;
    autoPrepareAfterSelectRef.current = true;
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  const clampOffset = (nx: number, ny: number) => {
    if (!naturalSize) return { x: nx, y: ny };
    const baseScale = Math.max(size / naturalSize.w, size / naturalSize.h);
    const scale = baseScale * zoom;
    const scaledW = naturalSize.w * scale;
    const scaledH = naturalSize.h * scale;
    const minX = Math.min(0, size - scaledW);
    const minY = Math.min(0, size - scaledH);
    const maxX = 0;
    const maxY = 0;
    return {
      x: Math.min(maxX, Math.max(minX, nx)),
      y: Math.min(maxY, Math.max(minY, ny)),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageEl) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...offset };
    didDragRef.current = false;
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    const { x, y } = clampOffset(offsetStart.current.x + dx, offsetStart.current.y + dy);
    setOffset({ x, y });
    didDragRef.current = true;
  };
  const handleMouseUp = () => {
    setDragging(false);
    dragStart.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageEl) return;
    const touch = e.touches[0];
    setDragging(true);
    dragStart.current = { x: touch.clientX, y: touch.clientY };
    offsetStart.current = { ...offset };
    didDragRef.current = false;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !dragStart.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.current.x;
    const dy = touch.clientY - dragStart.current.y;
    const { x, y } = clampOffset(offsetStart.current.x + dx, offsetStart.current.y + dy);
    setOffset({ x, y });
    didDragRef.current = true;
  };
  const handleTouchEnd = () => {
    setDragging(false);
    dragStart.current = null;
    didDragRef.current = false;
  };

  const handleZoomChange = (_: Event, value: number | number[]) => {
    if (!naturalSize) return;
    const z = Array.isArray(value) ? value[0] : value;
    const prevZoom = zoom;
    const baseScale = Math.max(size / naturalSize.w, size / naturalSize.h);
    const prevScale = baseScale * prevZoom;
    const nextScale = baseScale * z;
    const centerX = size / 2;
    const centerY = size / 2;
    const relX = (centerX - offset.x) / prevScale;
    const relY = (centerY - offset.y) / prevScale;
    const nextOffsetX = centerX - relX * nextScale;
    const nextOffsetY = centerY - relY * nextScale;
    const clamped = clampOffset(nextOffsetX, nextOffsetY);
    setZoom(z);
    setOffset(clamped);
  };

  const cropToLocalFile = async (
    source: {
      image: HTMLImageElement;
      natural: { w: number; h: number };
      zoomValue: number;
      offsetValue: { x: number; y: number };
    } = {
      image: imageEl!,
      natural: naturalSize!,
      zoomValue: zoom,
      offsetValue: offset,
    },
  ): Promise<{ file: File; previewUrl: string }> => {
    const { image, natural, zoomValue, offsetValue } = source;
    if (!image || !natural) {
      throw new Error('Image not ready');
    }

    const baseScale = Math.max(size / natural.w, size / natural.h);
    const scale = baseScale * zoomValue;
    const sx = Math.max(0, Math.min(natural.w - size / scale, -offsetValue.x / scale));
    const sy = Math.max(0, Math.min(natural.h - size / scale, -offsetValue.y / scale));
    const sSize = size / scale;

    const cropX = Math.round(sx);
    const cropY = Math.round(sy);
    const cropWidth = Math.round(sSize);
    const cropHeight = Math.round(sSize);

    if (
      isNaN(cropX) ||
      isNaN(cropY) ||
      isNaN(cropWidth) ||
      isNaN(cropHeight) ||
      cropX < 0 ||
      cropY < 0 ||
      cropWidth <= 0 ||
      cropHeight <= 0
    ) {
      throw new Error('Invalid crop parameters');
    }

    const canvas = document.createElement('canvas');
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas unavailable');
    }

    ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, outputSize, outputSize);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to encode logo'));
        },
        'image/jpeg',
        0.85,
      );
    });

    const file = new File([blob], 'logo.jpg', { type: 'image/jpeg' });
    return { file, previewUrl: URL.createObjectURL(blob) };
  };

  // After selecting a file, auto-prepare a cropped logo so club Save uploads it
  // even if the user never clicks "Crop and Use".
  useEffect(() => {
    if (!autoPrepareAfterSelectRef.current || !imageEl || !naturalSize) return;

    let cancelled = false;
    autoPrepareAfterSelectRef.current = false;

    const baseScale = Math.max(size / naturalSize.w, size / naturalSize.h);
    const scaledW = naturalSize.w * baseScale;
    const scaledH = naturalSize.h * baseScale;
    const defaultOffset = { x: (size - scaledW) / 2, y: (size - scaledH) / 2 };

    void (async () => {
      try {
        const { file, previewUrl } = await cropToLocalFile({
          image: imageEl,
          natural: naturalSize,
          zoomValue: 1,
          offsetValue: defaultOffset,
        });
        if (cancelled) return;
        onPendingFileChangeRef.current?.(file);
        onChangeRef.current?.(previewUrl);
        setImageSrc(previewUrl);
      } catch (err) {
        if (cancelled) return;
        // Fallback: keep the original selected file pending so Save still uploads something.
        if (currentFileRef.current) {
          onPendingFileChangeRef.current?.(currentFileRef.current);
          onChangeRef.current?.(imageSrc || null);
        }
        console.error('Auto-prepare logo failed:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [imageEl, naturalSize, size, outputSize]);

  const handleSave = async () => {
    if (!imageEl || !naturalSize || !currentFileRef.current) return;

    setUploading(true);
    setError(null);

    try {
      const { file, previewUrl } = await cropToLocalFile();
      onPendingFileChange?.(file);
      onChange(previewUrl);
      setImageSrc(previewUrl);
      showSuccess(t('clubs.logoReady', 'Logo ready — it will upload when you save'));
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'Invalid crop parameters'
          ? t('profile.invalidCrop', 'Invalid crop parameters. Please try adjusting the image.')
          : t('pages.tournaments.uploadFailed', 'Upload failed. Please try again.');
      setError(message);
      console.error('Logo prepare failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setImageSrc(undefined);
    setImageEl(null);
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    currentFileRef.current = null;
    onPendingFileChange?.(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="logo-uploader">
      <CardHeader
        title={t('clubs.clubLogo', 'Club Logo')}
        subheader={t(
          'clubs.logoSubheader',
          'Select an image, then drag to reposition (PNG, JPG up to 10MB)',
        )}
      />
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {value && !imageEl && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, width: '100%' }}>
              <Typography variant="body2" color="info.contrastText">
                {t('logoUploader.currentLogo', { name: value })}
                <br />
                <Typography variant="caption" color="info.contrastText">
                  {t('logoUploader.corsPreviewUnavailable')}
                </Typography>
              </Typography>
            </Box>
          )}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="logo-uploader__viewport"
            style={{ '--logo-size': `${size}px` } as React.CSSProperties}
          >
            {imageEl ? (
              <img
                src={imageSrc}
                alt="logo-crop"
                draggable={false}
                className="logo-uploader__image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${Math.max(size / (naturalSize?.w || 1), size / (naturalSize?.h || 1)) * zoom})`,
                }}
              />
            ) : (
              <div className="logo-uploader__placeholder">
                {t('profile.dragToReposition', 'Select an image, then drag to reposition')}
              </div>
            )}
          </div>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('profile.zoom', 'Zoom')}
            </Typography>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              min={1}
              max={3}
              step={0.01}
              sx={{ width: size - 80 }}
              disabled={!imageEl}
            />
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="logo-uploader__file-input"
            />
            <Button
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {imageEl
                ? t('profile.changePhoto', 'Change Photo')
                : t('profile.uploadPhoto', 'Upload Photo')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!imageEl || uploading}
              startIcon={uploading ? <CircularProgress size={16} /> : null}
            >
              {uploading
                ? t('pages.tournaments.preparing', 'Preparing...')
                : t('profile.cropAndUse', 'Crop and Use')}
            </Button>
            <Button color="error" onClick={handleRemove} disabled={!imageEl || uploading}>
              {t('profile.removePhoto', 'Remove Photo')}
            </Button>
            {error && (
              <Typography variant="caption" color="error">
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LogoUploader;
