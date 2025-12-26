import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Paper,
} from '@mui/material';
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  Send,
  Edit,
  PictureAsPdf,
  Image,
  Description,
  AttachFile,
  GetApp,
  Assignment,
  Gavel,
  EventBusy,
  GpsFixed,
  Share,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { parseISO, isBefore, startOfDay } from 'date-fns';

import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import { formatDate } from '../../../utils/date-utils';
import defaultBanner from '../../../img/default_turnament_bg.png';
import { FileAttachment } from '../../../components/FileAttachments/FileAttachments';

interface Tournament {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  applicationDeadline?: string;
  address?: string;
  allowMultipleApplications?: boolean;
  targetCount?: number;
  banner?: string;
  attachments?: FileAttachment[];
  ruleCode?: string;
  rule?: {
    id: string;
    ruleCode: string;
    ruleName: string;
  };
  createdBy: any;
  createdAt: string;
}

const TournamentDetail: React.FC = () => {
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const data = await apiService.getTournament(tournamentId);
        setTournament(data);
      } catch (error) {
        setError(t('pages.tournaments.fetchError', 'Failed to fetch tournament'));
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, t]);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image color="primary" />;
    if (type === 'application/pdf') return <PictureAsPdf color="error" />;
    if (type.includes('word') || type.includes('document')) return <Description color="primary" />;
    return <AttachFile color="action" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPastTournament = (tournament: Tournament): boolean => {
    const today = startOfDay(new Date());
    const tournamentEndDate = tournament.endDate 
      ? parseISO(tournament.endDate)
      : parseISO(tournament.startDate);
    return isBefore(startOfDay(tournamentEndDate), today);
  };

  const handleShare = async () => {
    const tournamentUrl = `${window.location.origin}/${lang}/tournaments/${tournamentId}`;
    const shareData = {
      title: tournament?.title || 'Tournament',
      text: tournament?.description || `Check out this tournament: ${tournament?.title}`,
      url: tournamentUrl,
    };

    // Check if Web Share API is supported (mainly mobile devices)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error occurred
        if ((err as Error).name !== 'AbortError') {
          console.error('Error sharing:', err);
        }
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(tournamentUrl);
        // You could show a toast notification here
        alert(t('pages.tournaments.linkCopied', 'Link copied to clipboard!'));
      } catch (err) {
        console.error('Failed to copy link:', err);
        // Fallback: Show URL in a prompt
        prompt(t('pages.tournaments.copyLink', 'Copy this link:'), tournamentUrl);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !tournament) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error || t('pages.tournaments.notFound', 'Tournament not found')}</Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/${lang}/tournaments`)}
          sx={{ mt: 2 }}
        >
          {t('common.backToList', 'Back to list')}
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/${lang}/tournaments`)}
        sx={{ mb: 2 }}
      >
        {t('pages.tournaments.backToList', 'Back to tournaments')}
      </Button>

      <Card>
        <CardMedia
          component="img"
          height="300"
          image={tournament.banner || defaultBanner}
          alt={tournament.title}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {tournament.title}
          </Typography>

          {tournament.description && (
            <Typography variant="body1" color="text.secondary" paragraph>
              {tournament.description}
            </Typography>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tournament.ruleCode && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Gavel color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>{t('pages.tournaments.rules', 'Rules')}:</strong> {tournament.rule?.ruleName || tournament.ruleCode}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body1">
                <strong>{t('pages.tournaments.start')}:</strong> {formatDate(tournament.startDate)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday color="action" fontSize="small" />
              <Typography variant="body1">
                <strong>{t('pages.tournaments.end')}:</strong> {formatDate(tournament.endDate)}
              </Typography>
            </Box>

            {tournament.applicationDeadline && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EventBusy color="warning" fontSize="small" />
                <Typography variant="body1" color="warning.main">
                  <strong>{t('pages.tournaments.applicationDeadline', 'Application Deadline')}:</strong> {formatDate(tournament.applicationDeadline)}
                </Typography>
              </Box>
            )}

            {tournament.address && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>{t('pages.tournaments.location')}:</strong> {tournament.address}
                </Typography>
              </Box>
            )}

            {tournament.targetCount && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GpsFixed color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>{t('pages.tournaments.targetCount', 'Number of Targets')}:</strong> {tournament.targetCount}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1">
                <strong>{t('pages.tournaments.multipleApplications')}:</strong>
              </Typography>
              <Chip
                label={
                  tournament.allowMultipleApplications
                    ? t('pages.tournaments.multipleAllowed', 'Allowed')
                    : t('pages.tournaments.multipleNotAllowed', 'Not allowed')
                }
                color={tournament.allowMultipleApplications ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>

          {tournament.attachments && tournament.attachments.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                {t('pages.tournaments.attachments', 'Additional Attachments')}
              </Typography>
              <Paper variant="outlined" sx={{ mt: 2 }}>
                <List>
                  {tournament.attachments.map((attachment, index) => (
                    <React.Fragment key={attachment.id}>
                      {index > 0 && <Divider />}
                      <ListItem
                        secondaryAction={
                          <Button
                            size="small"
                            startIcon={<GetApp />}
                            onClick={() => handleDownload(attachment)}
                          >
                            {t('common.download', 'Download')}
                          </Button>
                        }
                      >
                        <ListItemIcon>{getFileIcon(attachment.mimeType)}</ListItemIcon>
                        <ListItemText
                          primary={attachment.filename}
                          secondary={formatFileSize(attachment.size)}
                        />
                      </ListItem>
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="large"
              startIcon={<Share />}
              onClick={handleShare}
            >
              {t('pages.tournaments.share', 'Share')}
            </Button>
            {!isPastTournament(tournament) && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Send />}
                component={Link}
                to={`/${lang}/apply/${tournament.id}`}
              >
                {t('pages.tournaments.apply', 'Apply to tournament')}
              </Button>
            )}
            {user?.role === 'admin' && (
              <>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Edit />}
                  component={Link}
                  to={`/${lang}/tournaments/${tournament.id}/edit`}
                >
                  {t('pages.tournaments.edit', 'Edit')}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Assignment />}
                  component={Link}
                  to={`/${lang}/admin/applications/${tournament.id}`}
                >
                  {t('pages.tournaments.checkApplications', 'Check Applications')}
                </Button>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TournamentDetail;
