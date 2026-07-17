import {
  ArrowBack,
  Assignment,
  AttachFile,
  CalendarToday,
  Description,
  Edit,
  EventBusy,
  GetApp,
  Gavel,
  GpsFixed,
  Image,
  LocationOn,
  PersonAdd,
  PictureAsPdf,
  RateReview,
  Send,
} from '@mui/icons-material';
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
import { isBefore, parseISO, startOfDay } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';

import AdminApplyUserDialog from '../../../components/dialogs/admin-apply-user-dialog';
import { FileAttachment } from '../../../components/FileAttachments/FileAttachments';
import NotFoundPage from '../../../components/NotFound/NotFoundPage';
import ShareMenu from '../../../components/share/ShareMenu';
import { getCountryName } from '../../../config/countries';
import { canApplyOtherUsers, canEditTournament } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import { useNotification } from '../../../contexts/error-feedback-context';
import apiService from '../../../services/api';
import type { TournamentDto } from '../../../services/types';
import { formatDate } from '../../../utils/date-utils';
import { resolveTournamentBanner } from '../../../utils/placeholder-images';

const TournamentDetail: React.FC = () => {
  const { tournamentId, lang } = useParams<{ tournamentId: string; lang: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('common');
  const { showSuccess } = useNotification();
  const [tournament, setTournament] = useState<TournamentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [applyUserDialogOpen, setApplyUserDialogOpen] = useState(false);

  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;
      try {
        setLoading(true);
        const data = await apiService.getTournament(tournamentId);
        setTournament(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('status: 404')) {
          setNotFound(true);
        } else {
          setError(t('pages.tournaments.fetchError', 'Failed to fetch tournament'));
          console.error('Error fetching tournament:', error);
        }
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

  const isPastTournament = (tournament: TournamentDto): boolean => {
    const today = startOfDay(new Date());
    const tournamentEndDate = tournament.endDate
      ? parseISO(tournament.endDate)
      : parseISO(tournament.startDate);
    return isBefore(startOfDay(tournamentEndDate), today);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (notFound) {
    return <NotFoundPage variant="tournament" lang={lang} />;
  }

  if (error || !tournament) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {error || t('pages.tournaments.notFound', 'Tournament not found')}
        </Alert>
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

  const shareUrl = `${window.location.origin}/${lang}/tournaments/${tournament.id}`;

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
          image={resolveTournamentBanner(tournament.banner)}
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
                  <strong>{t('pages.tournaments.rules', 'Rules')}:</strong>{' '}
                  {tournament.rule?.ruleName || tournament.ruleCode}
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
                  <strong>
                    {t('pages.tournaments.applicationDeadline', 'Application Deadline')}:
                  </strong>{' '}
                  {formatDate(tournament.applicationDeadline)}
                </Typography>
              </Box>
            )}

            {(tournament.address || tournament.country) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>{t('pages.tournaments.location')}:</strong> {tournament.address}
                  {tournament.address && tournament.country && ', '}
                  {tournament.country && getCountryName(tournament.country)}
                </Typography>
              </Box>
            )}

            {tournament.targetCount && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GpsFixed color="action" fontSize="small" />
                <Typography variant="body1">
                  <strong>{t('pages.tournaments.targetCount', 'Number of Targets')}:</strong>{' '}
                  {tournament.targetCount}
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ShareMenu
                  url={shareUrl}
                  title={tournament.title}
                  text={tournament.description}
                  imageUrl={resolveTournamentBanner(tournament.banner)}
                  fullWidth
                  sx={{ justifyContent: 'center' }}
                />
              </Box>
              {!isPastTournament(tournament) && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  component={Link}
                  to={`/${lang}/apply/${tournament.id}`}
                  sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                >
                  {t('pages.tournaments.apply', 'Apply to tournament')}
                </Button>
              )}
            </Box>
            {user &&
              (canEditTournament(user.role, tournament.createdBy?.id ?? '', user.id) ||
                (canApplyOtherUsers(user.role) && !isPastTournament(tournament))) && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {user &&
                    canEditTournament(user.role, tournament.createdBy?.id ?? '', user.id) && (
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
                        {tournament.collectFeedback && (
                          <Button
                            variant="outlined"
                            size="large"
                            startIcon={<RateReview />}
                            component={Link}
                            to={`/${lang}/tournaments/${tournament.id}/feedback/admin`}
                          >
                            {t('pages.tournaments.viewFeedback')}
                          </Button>
                        )}
                      </>
                    )}
                  {user && canApplyOtherUsers(user.role) && !isPastTournament(tournament) && (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PersonAdd />}
                      onClick={() => setApplyUserDialogOpen(true)}
                    >
                      {t('pages.tournaments.applyOtherUser', 'Apply Other User')}
                    </Button>
                  )}
                </Box>
              )}
          </Box>
        </CardContent>
      </Card>

      {/* Admin Apply User Dialog */}
      {tournament && (
        <AdminApplyUserDialog
          open={applyUserDialogOpen}
          tournamentId={tournament.id}
          tournamentTitle={tournament.title}
          tournamentRuleCode={tournament.ruleCode}
          onClose={() => setApplyUserDialogOpen(false)}
          onSuccess={() => {
            showSuccess(
              t('pages.tournaments.applicationSubmitted', 'Application submitted successfully!'),
            );
          }}
        />
      )}
    </Box>
  );
};

export default TournamentDetail;
