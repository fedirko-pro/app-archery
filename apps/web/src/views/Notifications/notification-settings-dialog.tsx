import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import CircularProgress from '@mui/material/CircularProgress';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../components/SafeDialog/SafeDialog';
import type { PushOptInStatus } from '../../hooks/usePushNotifications';

export interface PushController {
  status: PushOptInStatus;
  busy: boolean;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
}

interface NotificationSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  newTournaments: boolean;
  streakReminder: boolean;
  appUpdates: boolean;
  onToggleNewTournaments: (value: boolean) => Promise<boolean>;
  onToggleStreakReminder: (value: boolean) => Promise<boolean>;
  onToggleAppUpdates: (value: boolean) => Promise<boolean>;
  push: PushController;
}

interface SettingRowProps {
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onToggle: (checked: boolean) => void;
  title: string;
  description: string;
  caption?: string;
  captionSeverity?: 'info' | 'warning' | 'error';
}

const SettingRow: React.FC<SettingRowProps> = ({
  checked,
  disabled,
  indeterminate,
  onToggle,
  title,
  description,
  caption,
  captionSeverity = 'info',
}) => (
  <Box sx={{ py: 0.5 }}>
    <FormControlLabel
      sx={{ alignItems: 'flex-start', m: 0 }}
      control={
        <Checkbox
          checked={checked}
          disabled={disabled}
          indeterminate={indeterminate}
          onChange={(event) => onToggle(event.target.checked)}
          sx={{ mt: -0.75, ml: -1.25 }}
        />
      }
      label={
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {description}
          </Typography>
          {caption && (
            <Typography
              variant="caption"
              display="block"
              color={
                captionSeverity === 'warning'
                  ? 'warning.main'
                  : captionSeverity === 'error'
                    ? 'error.main'
                    : 'text.secondary'
              }
            >
              {caption}
            </Typography>
          )}
        </Box>
      }
    />
  </Box>
);

const NotificationSettingsDialog: React.FC<NotificationSettingsDialogProps> = ({
  open,
  onClose,
  newTournaments,
  streakReminder,
  appUpdates,
  onToggleNewTournaments,
  onToggleStreakReminder,
  onToggleAppUpdates,
  push,
}) => {
  const { t } = useTranslation('common');
  const [error, setError] = useState<string | null>(null);

  const pushChecked = push.status === 'subscribed';
  const pushBlocked =
    push.status === 'ios-install' ||
    push.status === 'unsupported' ||
    push.status === 'denied' ||
    push.status === 'disabled';

  const pushCaption = (() => {
    switch (push.status) {
      case 'ios-install':
        return t('notifications.push.iosInstall');
      case 'unsupported':
      case 'disabled':
        return t('notifications.push.unavailable');
      case 'denied':
        return t('notifications.push.denied');
      case 'error':
        return t('notifications.push.error');
      default:
        return undefined;
    }
  })();

  const pushCaptionSeverity = ((): SettingRowProps['captionSeverity'] => {
    if (push.status === 'denied' || push.status === 'error') return 'warning';
    if (pushBlocked) return 'info';
    return undefined;
  })();

  const handlePushToggle = async (checked: boolean) => {
    setError(null);
    try {
      if (checked) {
        await push.enable();
      } else {
        await push.disable();
      }
      if (push.status === 'error') setError(t('notifications.push.error'));
    } catch {
      setError(t('notifications.push.error'));
    }
  };

  const handleSettingToggle = async (
    toggle: (value: boolean) => Promise<boolean>,
    value: boolean,
  ) => {
    setError(null);
    const saved = await toggle(value);
    if (!saved) setError(t('notifications.settings.saveError'));
  };

  return (
    <SafeDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('notifications.settings.title')}</DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}
        <FormGroup>
          <SettingRow
            checked={pushChecked}
            disabled={pushBlocked || push.busy || push.status === 'loading'}
            indeterminate={push.busy}
            onToggle={(value) => void handlePushToggle(value)}
            title={t('notifications.settings.phone.title')}
            description={t('notifications.settings.phone.description')}
            caption={pushCaption}
            captionSeverity={pushCaptionSeverity}
          />
          <SettingRow
            checked={newTournaments}
            onToggle={(value) => void handleSettingToggle(onToggleNewTournaments, value)}
            title={t('notifications.settings.newTournaments.title')}
            description={t('notifications.settings.newTournaments.description')}
          />
          <SettingRow
            checked={streakReminder}
            onToggle={(value) => void handleSettingToggle(onToggleStreakReminder, value)}
            title={t('notifications.settings.streakReminder.title')}
            description={t('notifications.settings.streakReminder.description')}
          />
          <SettingRow
            checked={appUpdates}
            onToggle={(value) => void handleSettingToggle(onToggleAppUpdates, value)}
            title={t('notifications.settings.appUpdates.title')}
            description={t('notifications.settings.appUpdates.description')}
          />
        </FormGroup>
        {push.busy && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
            <CircularProgress size={20} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('notifications.settings.close')}</Button>
      </DialogActions>
    </SafeDialog>
  );
};

export default NotificationSettingsDialog;
