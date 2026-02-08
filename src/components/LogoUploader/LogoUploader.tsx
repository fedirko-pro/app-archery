import './LogoUploader.scss';

import { Box, Button, Card, CardContent, CardHeader, Slider, Typography, CircularProgress } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotification } from '../../contexts/error-feedback-context';
import { apiService } from '../../services/api';

interface LogoUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  size?: number; // viewport size in px (square)
  outputSize?: number; // output canvas size (square)
  entityId?: string; // ID of the entity (club, etc.) for the logo
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (API limit)
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const LogoUploader: React.FC<LogoUploaderProps> = ({
  value,
  onChange,
  size = 240,
  outputSize: _outputSize = 512,
  entityId,
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

  useEffect(() => {
    setImageSrc(value);
  }, [value]);

  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
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
      // Don't set error state, just don't show the preview
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

  const handleSave = async () => {
    if (!imageEl || !naturalSize || !currentFileRef.current) return;

    setUploading(true);
    setError(null);

    try {
      const baseScale = Math.max(size / naturalSize.w, size / naturalSize.h);
      const scale = baseScale * zoom;
      const sx = Math.max(0, Math.min(naturalSize.w - size / scale, -offset.x / scale));
      const sy = Math.max(0, Math.min(naturalSize.h - size / scale, -offset.y / scale));
      const sSize = size / scale;

      // Validate crop parameters
      const cropX = Math.round(sx);
      const cropY = Math.round(sy);
      const cropWidth = Math.round(sSize);
      const cropHeight = Math.round(sSize);

      if (isNaN(cropX) || isNaN(cropY) || isNaN(cropWidth) || isNaN(cropHeight) ||
          cropX < 0 || cropY < 0 || cropWidth <= 0 || cropHeight <= 0) {
        setError(t('profile.invalidCrop', 'Invalid crop parameters. Please try adjusting the image.'));
        setUploading(false);
        return;
      }

      // Upload to backend with crop parameters
      const result = await apiService.uploadImage(
        currentFileRef.current,
        'logo',
        {
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          quality: 85,
          entityId,
        }
      );

      // Backend returns full URL, so we can use it directly
      onChange(result.url);
      setImageSrc(result.url);
      showSuccess(t('clubs.logoSaved', 'Club logo saved successfully'));
    } catch (err) {
      setError(t('pages.tournaments.uploadFailed', 'Upload failed. Please try again.'));
      console.error('Upload failed:', err);
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
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="logo-uploader">
      <CardHeader
        title={t('clubs.clubLogo', 'Club Logo')}
        subheader={t('clubs.logoSubheader', 'Select an image, then drag to reposition (PNG, JPG up to 10MB)')}
      />
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
            {value && !imageEl && (
              <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 1, width: '100%' }}>
                <Typography variant="body2" color="info.contrastText">
                  Current logo: {value}
                  <br />
                  <Typography variant="caption" color="info.contrastText">
                    (Preview unavailable - CORS restriction. Upload a new image to edit.)
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
                style={{ ['--logo-size' as any]: `${size}px` }}
            >
                {imageEl ? (
                <img
                    src={imageSrc}
                    alt="logo-crop"
                    draggable={false}
                    className="logo-uploader__image"
                    style={{
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${Math.max(size / (naturalSize?.w || 1), size / (naturalSize?.h || 1)) * zoom})`
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
                onChange={handleZoomChange as any}
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
            <Button variant="outlined" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                {imageEl ? t('profile.changePhoto', 'Change Photo') : t('profile.uploadPhoto', 'Upload Photo')}
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!imageEl || uploading}
              startIcon={uploading ? <CircularProgress size={16} /> : null}
            >
                {uploading ? t('pages.tournaments.uploading', 'Uploading...') : t('profile.cropAndSave', 'Crop and Save')}
            </Button>
            <Button color="error" onClick={handleRemove} disabled={!imageEl || uploading}>
                {t('profile.removePhoto', 'Remove Photo')}
            </Button>
            {error && (
                <Typography variant="caption" color="error">{error}</Typography>
            )}
            </Box>
        </Box>
        </CardContent>
    </Card>
  );
};

export default LogoUploader;
