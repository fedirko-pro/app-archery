'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '@/contexts/auth-context';
import type { ProfileVisibility } from '@/types/profile-visibility';

export function usePrivacyShareGate(canShare = true) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useParams();
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [notEarnedDialogOpen, setNotEarnedDialogOpen] = useState(false);

  const visibility: ProfileVisibility = user?.profileVisibility ?? 'personal';
  const visibilityLabel = t(`privacy.visibility.${visibility}.label`);

  const checkCanShare = useCallback((): boolean => {
    if (!canShare) {
      setNotEarnedDialogOpen(true);
      return false;
    }
    if (visibility === 'personal') {
      setPrivacyDialogOpen(true);
      return false;
    }
    return true;
  }, [canShare, visibility]);

  const goToProfileSettings = () => {
    setPrivacyDialogOpen(false);
    navigate(`/${lang}/profile/edit`);
  };

  const PrivacyShareDialogs = (
    <>
      <Dialog open={privacyDialogOpen} onClose={() => setPrivacyDialogOpen(false)}>
        <DialogTitle>{t('sharing.privacyPersonalTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('sharing.privacyPersonalMessage', { visibility: visibilityLabel })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyDialogOpen(false)}>
            {t('buttons.cancel', 'Cancel')}
          </Button>
          <Button variant="contained" onClick={goToProfileSettings}>
            {t('sharing.goToProfileSettings')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={notEarnedDialogOpen} onClose={() => setNotEarnedDialogOpen(false)}>
        <DialogTitle>{t('sharing.notEarnedTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('sharing.notEarnedMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotEarnedDialogOpen(false)}>{t('buttons.ok', 'OK')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );

  return { checkCanShare, PrivacyShareDialogs };
}
