'use client';

import {
  ContentCopy,
  Email,
  Facebook,
  IosShare,
  LinkedIn,
  Share,
  Telegram,
  WhatsApp,
  X,
} from '@mui/icons-material';
import {
  Button,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useNotification } from '@/contexts/error-feedback-context';
import { buildShareLinks } from '@/utils/share-links';
import { shareTournamentNative } from '@/utils/share-native';

interface ShareMenuProps {
  url: string;
  title: string;
  text?: string;
  imageUrl?: string;
  buttonLabel?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'button' | 'icon';
  onBeforeOpen?: () => boolean;
}

export default function ShareMenu({
  url,
  title,
  text,
  imageUrl,
  buttonLabel,
  size = 'large',
  variant = 'button',
  onBeforeOpen,
}: ShareMenuProps) {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useNotification();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sharing, setSharing] = useState(false);
  const open = Boolean(anchorEl);
  const links = buildShareLinks(url, title, text);
  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  const sharePayload = { title, description: text, url, imageUrl };

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onBeforeOpen && !onBeforeOpen()) {
      return;
    }
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      showSuccess(t('pages.tournaments.linkCopied', 'Link copied to clipboard!'));
    } catch {
      showError(t('pages.tournaments.copyFailed', 'Failed to copy link to clipboard'));
    }
    handleClose();
  };

  const runNativeShare = async (): Promise<boolean> => {
    setSharing(true);
    try {
      return await shareTournamentNative(sharePayload);
    } finally {
      setSharing(false);
    }
  };

  const handleNativeShare = async () => {
    handleClose();
    await runNativeShare();
  };

  const handleWhatsApp = async () => {
    handleClose();
    const isMobile =
      typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isMobile && canNativeShare && imageUrl) {
      const shared = await runNativeShare();
      if (shared) {
        return;
      }
    }

    window.open(links.whatsapp, '_blank', 'noopener,noreferrer');
  };

  const openExternal = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  return (
    <>
      {variant === 'icon' ? (
        <IconButton
          size="small"
          onClick={handleOpen}
          disabled={sharing}
          aria-label={buttonLabel ?? t('pages.tournaments.share', 'Share')}
        >
          <Share fontSize="small" />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          size={size}
          startIcon={<Share />}
          onClick={handleOpen}
          disabled={sharing}
        >
          {buttonLabel ?? t('pages.tournaments.share', 'Share')}
        </Button>
      )}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {canNativeShare && (
          <MenuItem onClick={handleNativeShare} disabled={sharing}>
            <ListItemIcon>
              <IosShare fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t('pages.tournaments.shareNative', 'Share…')}</ListItemText>
          </MenuItem>
        )}
        <MenuItem onClick={handleCopyLink}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareCopyLink', 'Copy link')}</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleWhatsApp} disabled={sharing}>
          <ListItemIcon>
            <WhatsApp fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareWhatsApp', 'WhatsApp')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openExternal(links.telegram)}>
          <ListItemIcon>
            <Telegram fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareTelegram', 'Telegram')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openExternal(links.facebook)}>
          <ListItemIcon>
            <Facebook fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareFacebook', 'Facebook')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openExternal(links.twitter)}>
          <ListItemIcon>
            <X fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareX', 'X')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openExternal(links.linkedin)}>
          <ListItemIcon>
            <LinkedIn fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareLinkedIn', 'LinkedIn')}</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => openExternal(links.email)}>
          <ListItemIcon>
            <Email fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('pages.tournaments.shareEmail', 'Email')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
