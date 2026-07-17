'use client';

import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import SafeDialog from '@/components/SafeDialog/SafeDialog';
import { useAuth } from '@/contexts/auth-context';
import type { ProfileVisibility } from '@/types/profile-visibility';

export function usePrivacyShareGate(canShare = true) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { lang } = useParams();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const [notEarnedDialogOpen, setNotEarnedDialogOpen] = useState(false);

  const visibility: ProfileVisibility = user?.profileVisibility ?? 'personal';
  const visibilityLabel = t(`privacy.visibility.${visibility}.label`);

  const checkCanShare = useCallback((): boolean => {
    if (!user) {
      setAuthDialogOpen(true);
      return false;
    }
    if (!canShare) {
      setNotEarnedDialogOpen(true);
      return false;
    }
    if (visibility === 'personal') {
      setPrivacyDialogOpen(true);
      return false;
    }
    return true;
  }, [user, canShare, visibility]);

  const goToProfileSettings = () => {
    setPrivacyDialogOpen(false);
    navigate(`/${lang}/profile/edit`);
  };

  const goToSignIn = () => {
    setAuthDialogOpen(false);
    navigate(`/${lang}/signin`);
  };

  const goToSignUp = () => {
    setAuthDialogOpen(false);
    navigate(`/${lang}/signup`);
  };

  const PrivacyShareDialogs = (
    <>
      <SafeDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t('sharing.authRequiredTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('sharing.authRequiredMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuthDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="outlined" onClick={goToSignUp}>
            {t('auth.signUp')}
          </Button>
          <Button variant="contained" onClick={goToSignIn}>
            {t('auth.signIn')}
          </Button>
        </DialogActions>
      </SafeDialog>

      <SafeDialog open={privacyDialogOpen} onClose={() => setPrivacyDialogOpen(false)}>
        <DialogTitle>{t('sharing.privacyPersonalTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('sharing.privacyPersonalMessage', { visibility: visibilityLabel })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrivacyDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={goToProfileSettings}>
            {t('sharing.goToProfileSettings')}
          </Button>
        </DialogActions>
      </SafeDialog>

      <SafeDialog open={notEarnedDialogOpen} onClose={() => setNotEarnedDialogOpen(false)}>
        <DialogTitle>{t('sharing.notEarnedTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('sharing.notEarnedMessage')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotEarnedDialogOpen(false)}>{t('buttons.ok', 'OK')}</Button>
        </DialogActions>
      </SafeDialog>
    </>
  );

  return { checkCanShare, PrivacyShareDialogs };
}
