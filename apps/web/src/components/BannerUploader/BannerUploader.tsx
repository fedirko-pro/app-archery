import './BannerUploader.scss';

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

interface BannerUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  /** Cropped banner file kept locally until the tournament form is saved. */
  onPendingFileChange?: (file: File | null) => void;
  width?: number; // viewport width in px
  height?: number; // viewport height in px
  outputWidth?: number; // output canvas width
  outputHeight?: number; // output canvas height
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB (API limit)
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const BannerUploader: React.FC<BannerUploaderProps> = ({
  value,
  onChange,
  onPendingFileChange,
  width = 600,
  height = 200,
  outputWidth = 1200,
  outputHeight = 400,
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
    if (requiresCrossOriginForCanvas(imageSrc)) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => {
      setImageEl(img);
      setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
      setZoom(1);
      const baseScaleW = width / img.naturalWidth;
      const baseScaleH = height / img.naturalHeight;
      const baseScale = Math.max(baseScaleW, baseScaleH);
      const scaledW = img.naturalWidth * baseScale;
      const scaledH = img.naturalHeight * baseScale;
      setOffset({ x: (width - scaledW) / 2, y: (height - scaledH) / 2 });
    };
    img.src = imageSrc;
  }, [imageSrc, width, height]);

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
    const baseScaleW = width / naturalSize.w;
    const baseScaleH = height / naturalSize.h;
    const baseScale = Math.max(baseScaleW, baseScaleH);
    const scale = baseScale * zoom;
    const scaledW = naturalSize.w * scale;
    const scaledH = naturalSize.h * scale;
    const minX = Math.min(0, width - scaledW);
    const minY = Math.min(0, height - scaledH);
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
    const baseScaleW = width / naturalSize.w;
    const baseScaleH = height / naturalSize.h;
    const baseScale = Math.max(baseScaleW, baseScaleH);
    const prevScale = baseScale * prevZoom;
    const nextScale = baseScale * z;
    const centerX = width / 2;
    const centerY = height / 2;
    const relX = (centerX - offset.x) / prevScale;
    const relY = (centerY - offset.y) / prevScale;
    const nextOffsetX = centerX - relX * nextScale;
    const nextOffsetY = centerY - relY * nextScale;
    const clamped = clampOffset(nextOffsetX, nextOffsetY);
    setZoom(z);
    setOffset(clamped);
  };

  const getCropSource = () => {
    if (!naturalSize) return null;
    const baseScaleW = width / naturalSize.w;
    const baseScaleH = height / naturalSize.h;
    const baseScale = Math.max(baseScaleW, baseScaleH);
    const scale = baseScale * zoom;
    const sx = Math.max(0, Math.min(naturalSize.w - width / scale, -offset.x / scale));
    const sy = Math.max(0, Math.min(naturalSize.h - height / scale, -offset.y / scale));
    return {
      sx: Math.round(sx),
      sy: Math.round(sy),
      sWidth: Math.round(width / scale),
      sHeight: Math.round(height / scale),
    };
  };

  const cropToLocalFile = async (): Promise<{ file: File; previewUrl: string }> => {
    if (!imageEl || !naturalSize) {
      throw new Error('Image not ready');
    }
    const crop = getCropSource();
    if (!crop) {
      throw new Error('Crop not ready');
    }

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas unavailable');
    }

    ctx.drawImage(
      imageEl,
      crop.sx,
      crop.sy,
      crop.sWidth,
      crop.sHeight,
      0,
      0,
      outputWidth,
      outputHeight,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to encode banner'));
        },
        'image/jpeg',
        0.85,
      );
    });

    const file = new File([blob], 'banner.jpg', { type: 'image/jpeg' });
    return { file, previewUrl: URL.createObjectURL(blob) };
  };

  const handleSave = async () => {
    if (!imageEl || !naturalSize || !currentFileRef.current) return;

    setUploading(true);
    setError(null);

    try {
      // Keep cropped image local until the tournament form is saved.
      const { file, previewUrl } = await cropToLocalFile();
      onPendingFileChange?.(file);
      onChange(previewUrl);
      setImageSrc(previewUrl);
      showSuccess(
        t('pages.tournaments.bannerReady', 'Banner ready — it will upload when you save'),
      );
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
    onPendingFileChange?.(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getBaseScale = () => {
    if (!naturalSize) return 1;
    const baseScaleW = width / naturalSize.w;
    const baseScaleH = height / naturalSize.h;
    return Math.max(baseScaleW, baseScaleH);
  };

  return (
    <Card className="banner-uploader">
      <CardHeader
        title={t('pages.tournaments.banner', 'Tournament Banner')}
        subheader={t(
          'pages.tournaments.bannerSubheader',
          'Select an image, then drag to reposition (PNG, JPG up to 3MB)',
        )}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="banner-uploader__viewport"
            style={
              {
                ['--banner-width' as string]: `${width}px`,
                ['--banner-height' as string]: `${height}px`,
              } as React.CSSProperties
            }
          >
            {imageEl ? (
              <img
                src={imageSrc}
                alt="banner-crop"
                draggable={false}
                className="banner-uploader__image"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${getBaseScale() * zoom})`,
                }}
              />
            ) : (
              <div className="banner-uploader__placeholder">
                {t(
                  'pages.tournaments.dragToReposition',
                  'Select an image, then drag to reposition',
                )}
              </div>
            )}
          </div>
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%', maxWidth: width }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {t('profile.zoom', 'Zoom')}
            </Typography>
            <Slider
              value={zoom}
              onChange={handleZoomChange}
              min={1}
              max={3}
              step={0.01}
              sx={{ flex: 1 }}
              disabled={!imageEl}
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <input
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFileChange}
              ref={fileInputRef}
              className="banner-uploader__file-input"
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
              <Typography
                variant="caption"
                color="error"
                sx={{ width: '100%', textAlign: 'center' }}
              >
                {error}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BannerUploader;
