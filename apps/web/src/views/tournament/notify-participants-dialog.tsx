import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import type React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import apiService from '../../services/api';

interface NotifyParticipantsDialogProps {
  open: boolean;
  onClose: () => void;
  tournamentId: string;
  participantCount: number;
  onSent: () => void;
}

const NotifyParticipantsDialog: React.FC<NotifyParticipantsDialogProps> = ({
  open,
  onClose,
  tournamentId,
  participantCount,
  onSent,
}) => {
  const { t } = useTranslation('common');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!sending) {
      setTitle('');
      setMessage('');
      setError(null);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError(t('pages.communications.messageRequired'));
      return;
    }

    try {
      setSending(true);
      setError(null);
      await apiService.sendTournamentAnnouncement(tournamentId, {
        title: title.trim() || undefined,
        message: message.trim(),
      });
      setTitle('');
      setMessage('');
      onSent();
      onClose();
    } catch (err) {
      console.error('Failed to notify participants:', err);
      setError(t('pages.communications.sendError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('pages.communications.tournament.dialogTitle')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Alert severity="warning">
            {t('pages.communications.tournament.warning', { count: participantCount })}
          </Alert>

          <TextField
            label={t('pages.communications.dialog.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('pages.communications.dialog.message')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={sending}>
          {t('pages.communications.dialog.cancel')}
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          variant="contained"
          startIcon={
            sending ? <CircularProgress size={18} color="inherit" /> : <SendOutlinedIcon />
          }
          disabled={sending || !message.trim()}
        >
          {sending
            ? t('pages.communications.dialog.sending')
            : t('pages.communications.dialog.send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotifyParticipantsDialog;
