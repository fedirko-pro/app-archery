import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Alert from '@mui/material/Alert';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { User } from '../../../contexts/types';
import apiService from '../../../services/api';

interface SendAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}

const SendAnnouncementDialog: React.FC<SendAnnouncementDialogProps> = ({
  open,
  onClose,
  onSent,
}) => {
  const { t } = useTranslation('common');
  const [global, setGlobal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setError(null);
    setTitle('');
    setMessage('');
    setGlobal(false);
    setSelectedUsers([]);
    setLoading(true);

    Promise.all([apiService.getAllUsers(), apiService.getAnnouncementAudienceCount()])
      .then(([userList, count]) => {
        setUsers(userList);
        setAudienceCount(count.count);
      })
      .catch(() => setError(t('pages.communications.loadError')))
      .finally(() => setLoading(false));
  }, [open, t]);

  const handleClose = () => {
    if (!sending) onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError(t('pages.communications.messageRequired'));
      return;
    }
    if (!global && selectedUsers.length === 0) {
      setError(t('pages.communications.selectUsers'));
      return;
    }

    try {
      setSending(true);
      setError(null);
      await apiService.sendAnnouncement({
        mode: global ? 'all' : 'users',
        userIds: selectedUsers.map((u) => u.id),
        title: title.trim() || undefined,
        message: message.trim(),
      });
      onSent();
      onClose();
    } catch (err) {
      console.error('Failed to send announcement:', err);
      setError(t('pages.communications.sendError'));
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('pages.communications.dialog.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={global}
                onChange={(e) => setGlobal(e.target.checked)}
                disabled={loading}
              />
            }
            label={t('pages.communications.dialog.global')}
          />

          {global && audienceCount != null && (
            <Alert severity="warning">
              {t('pages.communications.dialog.globalWarning', { count: audienceCount })}
            </Alert>
          )}

          {!global && (
            <Autocomplete
              multiple
              options={users}
              value={selectedUsers}
              onChange={(_, value) => setSelectedUsers(value)}
              getOptionLabel={(option) =>
                `${option.firstName ?? ''} ${option.lastName ?? ''} (${option.email})`.trim()
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loading}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('pages.communications.dialog.recipients')}
                  placeholder={t('pages.communications.dialog.searchPlaceholder')}
                />
              )}
            />
          )}

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
          disabled={sending || loading || !message.trim()}
        >
          {sending
            ? t('pages.communications.dialog.sending')
            : t('pages.communications.dialog.send')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SendAnnouncementDialog;
