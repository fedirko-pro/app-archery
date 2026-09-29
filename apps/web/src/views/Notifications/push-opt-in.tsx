import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { usePushNotifications } from '../../hooks/usePushNotifications';

const PushOptIn: React.FC = () => {
  const { t } = useTranslation('common');
  const { status, busy, enable, disable } = usePushNotifications();

  if (status === 'loading' || status === 'disabled') return null;

  if (status === 'ios-install') {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('notifications.push.iosInstall')}
      </Alert>
    );
  }

  if (status === 'unsupported') {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        {t('notifications.push.unavailable')}
      </Alert>
    );
  }

  if (status === 'denied') {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        {t('notifications.push.denied')}
      </Alert>
    );
  }

  if (status === 'error') {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {t('notifications.push.error')}
      </Alert>
    );
  }

  if (status === 'subscribed') {
    return (
      <Alert
        severity="success"
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" disabled={busy} onClick={() => void disable()}>
            {t('notifications.push.disable')}
          </Button>
        }
      >
        {t('notifications.push.enabled')}
      </Alert>
    );
  }

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<NotificationsActiveOutlinedIcon />}
      disabled={busy}
      onClick={() => void enable()}
      sx={{ mb: 2 }}
    >
      {t('notifications.push.enable')}
    </Button>
  );
};

export default PushOptIn;
