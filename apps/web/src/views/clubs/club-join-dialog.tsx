import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuth } from '../../contexts/auth-context';
import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';

interface ClubJoinDialogProps {
  open: boolean;
  clubId: string;
  clubName: string;
  onClose: () => void;
}

const ClubJoinDialog: React.FC<ClubJoinDialogProps> = ({ open, clubId, clubName, onClose }) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    setName(displayName);
    setEmail(user?.email || '');
    setMessage('');
  }, [open, user]);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      showError(t('pages.clubs.joinRequestRequired', 'Name and email are required'));
      return;
    }

    try {
      setSubmitting(true);
      await apiService.submitClubJoinRequest(clubId, {
        name: name.trim(),
        email: email.trim(),
        message: message.trim() || undefined,
      });
      showSuccess(t('pages.clubs.joinRequestSent', 'Join request sent successfully'));
      onClose();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.clubs.joinRequestError', 'Failed to send join request'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('pages.clubs.joinClub', 'Join club')}</DialogTitle>
      <DialogContent>
        <TextField
          margin="dense"
          label={t('pages.clubs.joinRequestName', 'Your name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />
        <TextField
          margin="dense"
          label={t('pages.clubs.joinRequestEmail', 'Email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
          disabled={!!user}
        />
        <TextField
          margin="dense"
          label={t('pages.clubs.joinRequestMessage', 'Message (optional)')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          fullWidth
          multiline
          minRows={3}
          placeholder={t('pages.clubs.joinRequestMessagePlaceholder', {
            clubName,
            defaultValue: `Tell ${clubName} a bit about yourself...`,
          })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting
            ? t('common.sending', 'Sending...')
            : t('pages.clubs.sendJoinRequest', 'Send request')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClubJoinDialog;
