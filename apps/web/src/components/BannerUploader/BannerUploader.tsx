import './BannerUploader.scss';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from '@mui/material';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { downscaleImageFile } from '../../utils/image-resize';

interface BannerUploaderProps {
  value?: string;
  onChange: (url: string | null) => void;
  onPendingFileChange?: (file: File | null) => void;
}

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_BANNER_DIMENSION = 1200;
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

const BannerUploader: React.FC<BannerUploaderProps> = ({
  value,
  onChange,
  onPendingFileChange,
}) => {
  const { t } = useTranslation('common');
  const [previewSrc, setPreviewSrc] = useState<string | undefined>(value);
  const [preparing, setPreparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setPreviewSrc(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const replacePreview = (url: string | undefined) => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    if (url?.startsWith('blob:')) {
      previewUrlRef.current = url;
    }
    setPreviewSrc(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setPreparing(true);
    setError(null);
    try {
      const prepared = await downscaleImageFile(file, {
        maxDimension: MAX_BANNER_DIMENSION,
        quality: 0.85,
      });
      const previewUrl = URL.createObjectURL(prepared.file);
      replacePreview(previewUrl);
      onPendingFileChange?.(prepared.file);
      onChange(previewUrl);
    } catch (err) {
      setError(t('pages.tournaments.uploadFailed', 'Upload failed. Please try again.'));
      console.error('Prepare banner failed:', err);
    } finally {
      setPreparing(false);
    }
  };

  const handleRemove = () => {
    replacePreview(undefined);
    onPendingFileChange?.(null);
    onChange(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Card className="banner-uploader">
      <CardHeader
        title={t('pages.tournaments.banner', 'Tournament Banner')}
        subheader={t(
          'pages.tournaments.bannerSubheader',
          'PNG or JPG up to 10MB. The whole image is kept at its original proportions.',
        )}
      />
      <CardContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
          <div className="banner-uploader__preview">
            {previewSrc ? (
              <img src={previewSrc} alt="" className="banner-uploader__image" />
            ) : (
              <div className="banner-uploader__placeholder">
                {t('pages.tournaments.dragToReposition', 'No banner selected')}
              </div>
            )}
          </div>

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
              disabled={preparing}
            >
              {previewSrc
                ? t('profile.changePhoto', 'Change Photo')
                : t('profile.uploadPhoto', 'Upload Photo')}
            </Button>
            <Button color="error" onClick={handleRemove} disabled={!previewSrc || preparing}>
              {t('profile.removePhoto', 'Remove Photo')}
            </Button>
            {preparing && <CircularProgress size={24} />}
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
