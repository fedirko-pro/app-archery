import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../../../services/api';
import type { AnnouncementDto, AnnouncementRecipientDto } from '../../../services/types';
import { formatDateTime } from '../../../utils/date-utils';
import SendAnnouncementDialog from './send-announcement-dialog';

const Communications: React.FC = () => {
  const { t } = useTranslation('common');
  const [items, setItems] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sentToast, setSentToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAnnouncements({ limit: 100 });
      setItems(data.items);
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setError(t('pages.communications.loadError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSent = () => {
    void load();
    setSentToast(t('pages.communications.sendSuccess'));
    window.setTimeout(() => setSentToast(null), 4000);
  };

  const audienceLabel = (audienceType: string) => {
    switch (audienceType) {
      case 'all':
        return t('pages.communications.audience.all');
      case 'tournament':
        return t('pages.communications.audience.tournament');
      default:
        return t('pages.communications.audience.users');
    }
  };

  const AudienceChip = ({
    audienceType,
    recipients,
  }: {
    audienceType: string;
    recipients?: AnnouncementRecipientDto[];
  }) => {
    const label = audienceLabel(audienceType);

    if (audienceType !== 'users' || !recipients?.length) {
      return <Chip label={label} size="small" />;
    }

    return (
      <Tooltip
        title={
          <List sx={{ minWidth: 280, maxWidth: 400, p: 1 }}>
            {recipients.map((recipient) => (
              <ListItem key={recipient.id} dense>
                <ListItemText
                  primary={`${recipient.firstName ?? ''} ${recipient.lastName ?? ''}`.trim()}
                  secondary={recipient.email}
                />
              </ListItem>
            ))}
          </List>
        }
        arrow
        enterDelay={200}
        leaveDelay={100}
      >
        <Chip label={label} size="small" icon={<InfoOutlinedIcon fontSize="small" />} />
      </Tooltip>
    );
  };

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', px: 2, py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography variant="h4" component="h1">
            {t('pages.communications.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('pages.communications.description')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SendOutlinedIcon />}
          onClick={() => setDialogOpen(true)}
        >
          {t('pages.communications.sendButton')}
        </Button>
      </Box>

      {sentToast && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {sentToast}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && items.length === 0 && (
        <Alert severity="info">{t('pages.communications.empty')}</Alert>
      )}

      {!loading && items.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => (
            <Card key={item.id} variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {item.title || item.message}
                  </Typography>
                  <AudienceChip audienceType={item.audienceType} recipients={item.recipients} />
                </Box>
                {item.title && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.message}
                  </Typography>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {t('pages.communications.recipients', { count: item.recipientCount })}
                  {' · '}
                  {formatDateTime(item.createdAt)}
                  {item.tournamentTitle ? ` · ${item.tournamentTitle}` : ''}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <SendAnnouncementDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSent={handleSent}
      />
    </Box>
  );
};

export default Communications;
