import { Check, Close, Visibility, Groups } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import apiService from '../../../services/api';
import userIcon from '../../../img/icons/user.svg';
import { formatDate, getApplicationDeadline } from '../../../utils/date-utils';

interface TournamentApplication {
  id: string;
  tournament: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    applicationDeadline?: string;
  };
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    picture?: string;
    gender?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  category?: string;
  division?: { id: string; name: string } | null;
  bowCategory?: { id: string; name: string; code?: string } | null;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

const AdminApplications: React.FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { tournamentId, lang } = useParams<{ tournamentId?: string; lang?: string }>();
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [currentTournament, setCurrentTournament] = useState<any>(null);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    application: TournamentApplication | null;
    newStatus: string;
    rejectionReason: string;
  }>({ open: false, application: null, newStatus: '', rejectionReason: '' });
  const [updatingApplicationId, setUpdatingApplicationId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchApplications();
      fetchStats();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const data = await apiService.getAllTournaments();
      setTournaments(data);
      // If tournamentId is provided in URL, use it, otherwise use first tournament
      if (tournamentId) {
        setSelectedTournament(tournamentId);
        const tournament = data.find((t: any) => t.id === tournamentId);
        setCurrentTournament(tournament);
      } else if (data.length > 0) {
        setSelectedTournament(data[0].id);
        setCurrentTournament(data[0]);
      }
    } catch {
      setError(t('pages.adminApplications.fetchTournamentsError'));
    }
  };

  const fetchApplications = async () => {
    if (!selectedTournament) return;

    try {
      setLoading(true);
      const data =
        await apiService.getTournamentApplications(selectedTournament);
      // Sort applications by applicant name (firstName + lastName)
      const sortedData = [...data].sort((a, b) => {
        const nameA = `${a.applicant.firstName} ${a.applicant.lastName}`.toLowerCase();
        const nameB = `${b.applicant.firstName} ${b.applicant.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setApplications(sortedData);
    } catch (error) {
      setError(t('pages.adminApplications.fetchError'));
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedTournament) return;

    try {
      const data =
        await apiService.getTournamentApplicationStats(selectedTournament);
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.application) return;

    try {
      await apiService.updateApplicationStatus(
        statusDialog.application.id,
        statusDialog.newStatus,
        statusDialog.rejectionReason || undefined,
      );
      
      // Update local state to keep position in list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === statusDialog.application!.id
            ? { ...app, status: statusDialog.newStatus as any, rejectionReason: statusDialog.rejectionReason }
            : app
        )
      );
      
      setStatusDialog({
        open: false,
        application: null,
        newStatus: '',
        rejectionReason: '',
      });
      fetchStats();
      setSnackbar({
        open: true,
        message: t('pages.adminApplications.notifications.updateSuccess'),
        severity: 'success',
      });
    } catch (error) {
      setError(t('pages.adminApplications.notifications.updateFailed'));
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: t('pages.adminApplications.notifications.updateFailed'),
        severity: 'error',
      });
    }
  };

  const handleQuickStatusUpdate = async (
    applicationId: string,
    newStatus: 'approved' | 'rejected',
  ) => {
    const application = applications.find((app) => app.id === applicationId);
    const applicantName = application
      ? `${application.applicant.firstName} ${application.applicant.lastName}`
      : '';

    try {
      setUpdatingApplicationId(applicationId);
      setError(null);

      await apiService.updateApplicationStatus(applicationId, newStatus);

      // Update local state to keep position in list
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );
      
      fetchStats();

      const messageKey =
        newStatus === 'approved'
          ? 'pages.adminApplications.notifications.approvedSuccess'
          : 'pages.adminApplications.notifications.rejectedSuccess';

      setSnackbar({
        open: true,
        message: t(messageKey, { name: applicantName }),
        severity: 'success',
      });
    } catch (error) {
      const errorMessageKey =
        newStatus === 'approved'
          ? 'pages.adminApplications.notifications.approveFailed'
          : 'pages.adminApplications.notifications.rejectFailed';

      const fallbackKey =
        newStatus === 'approved'
          ? 'pages.adminApplications.notifications.approveFailedGeneric'
          : 'pages.adminApplications.notifications.rejectFailedGeneric';

      setError(
        applicantName
          ? t(errorMessageKey, { name: applicantName })
          : t(fallbackKey),
      );
      console.error('Error updating status:', error);
      setSnackbar({
        open: true,
        message: applicantName
          ? t(errorMessageKey, { name: applicantName })
          : t(fallbackKey),
        severity: 'error',
      });
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'withdrawn':
        return 'default';
      default:
        return 'warning';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('pages.adminApplications.status.pending');
      case 'approved':
        return t('pages.adminApplications.status.approved');
      case 'rejected':
        return t('pages.adminApplications.status.rejected');
      case 'withdrawn':
        return t('pages.adminApplications.status.withdrawn');
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">
          {t('pages.adminApplications.title')}
        </Typography>
        {selectedTournament && (
          <Button
            variant="contained"
            startIcon={<Groups />}
            onClick={() =>
              navigate(`/${lang}/tournaments/${selectedTournament}/patrols`)
            }
          >
            Manage Patrols
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {currentTournament && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <a
                href={`/tournaments`}
                style={{ color: 'inherit', textDecoration: 'none' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.textDecoration = 'underline')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.textDecoration = 'none')
                }
              >
                {currentTournament.title}
              </a>
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('pages.adminApplications.tournament.startDate')}:</strong>{' '}
                  {formatDate(currentTournament.startDate)}
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('pages.adminApplications.tournament.endDate')}:</strong>{' '}
                  {formatDate(currentTournament.endDate)}
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('pages.adminApplications.tournament.applicationDeadline')}:</strong>{' '}
                  {currentTournament.applicationDeadline
                    ? formatDate(currentTournament.applicationDeadline)
                    : formatDate(
                        getApplicationDeadline(currentTournament.startDate),
                      )}
                </Typography>
              </Box>
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>{t('pages.tournaments.rules', 'Rules')}:</strong>{' '}
                  {currentTournament.rule?.ruleName || currentTournament.ruleCode || t('pages.tournaments.notSpecified', 'Not specified')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>{t('pages.adminApplications.selectTournament')}</InputLabel>
          <Select
            value={selectedTournament}
            label={t('pages.adminApplications.selectTournament')}
            onChange={(e) => {
              const tournamentId = e.target.value;
              setSelectedTournament(tournamentId);
              const tournament = tournaments.find((t) => t.id === tournamentId);
              setCurrentTournament(tournament);
            }}
          >
            {tournaments.map((tournament) => (
              <MenuItem key={tournament.id} value={tournament.id}>
                {tournament.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ minWidth: '200px', flex: '1 1 200px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  {t('pages.adminApplications.statsTotal')}: {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ minWidth: '200px', flex: '1 1 200px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  {t('pages.adminApplications.statsPending')}: {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ minWidth: '200px', flex: '1 1 200px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  {t('pages.adminApplications.statsApproved')}: {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ minWidth: '200px', flex: '1 1 200px' }}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  {t('pages.adminApplications.statsRejected')}: {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              {t('pages.adminApplications.noApplications')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '60px' }}>{t('pages.adminApplications.table.avatar')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.applicant')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.gender', 'Gender')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.category')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.division')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.status')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.applied')}</TableCell>
                <TableCell>{t('pages.adminApplications.table.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Avatar
                      alt={`${application.applicant.firstName} ${application.applicant.lastName}`}
                      src={application.applicant.picture || userIcon}
                      sx={{ width: 40, height: 40 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {application.applicant.firstName}{' '}
                      {application.applicant.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.applicant.email}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {application.applicant.gender ? (
                      <Chip
                        label={application.applicant.gender}
                        size="small"
                        variant="outlined"
                        color={application.applicant.gender === 'M' ? 'info' : application.applicant.gender === 'F' ? 'secondary' : 'default'}
                        sx={{ height: 20, minWidth: 28, '& .MuiChip-label': { px: 0.5 } }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.disabled">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>{application.bowCategory?.name || application.bowCategory?.code || application.category || '-'}</TableCell>
                  <TableCell>{application.division?.name || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(application.createdAt)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() =>
                          setStatusDialog({
                            open: true,
                            application,
                            newStatus: application.status,
                            rejectionReason: application.rejectionReason || '',
                          })
                        }
                      >
                        {t('pages.adminApplications.actions.view')}
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<Check />}
                            onClick={() =>
                              handleQuickStatusUpdate(application.id, 'approved')
                            }
                            disabled={updatingApplicationId === application.id}
                          >
                            {updatingApplicationId === application.id
                              ? t('pages.adminApplications.actions.approving')
                              : t('pages.adminApplications.actions.approve')}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Close />}
                            onClick={() =>
                              handleQuickStatusUpdate(application.id, 'rejected')
                            }
                            disabled={updatingApplicationId === application.id}
                          >
                            {updatingApplicationId === application.id
                              ? t('pages.adminApplications.actions.rejecting')
                              : t('pages.adminApplications.actions.reject')}
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={statusDialog.open}
        onClose={() =>
          setStatusDialog({
            open: false,
            application: null,
            newStatus: '',
            rejectionReason: '',
          })
        }
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {statusDialog.application
            ? t('pages.adminApplications.dialog.title', {
                name: `${statusDialog.application.applicant.firstName} ${statusDialog.application.applicant.lastName}`,
              })
            : t('pages.adminApplications.dialog.titleFallback')}
        </DialogTitle>
        <DialogContent>
          {statusDialog.application && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="subtitle2">{t('pages.adminApplications.dialog.tournament')}</Typography>
                    <Typography variant="body2" gutterBottom>
                      {statusDialog.application.tournament.title}
                    </Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="subtitle2">{t('pages.adminApplications.dialog.category')}</Typography>
                    <Typography variant="body2" gutterBottom>
                      {statusDialog.application.bowCategory?.name || statusDialog.application.category || '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ flex: '1 1 300px' }}>
                    <Typography variant="subtitle2">{t('pages.adminApplications.dialog.division')}</Typography>
                    <Typography variant="body2" gutterBottom>
                      {statusDialog.application.division?.name || '-'}
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2">{t('pages.adminApplications.dialog.notes')}</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.notes || t('pages.adminApplications.dialog.noNotes')}
                  </Typography>
                </Box>
                <Box>
                  <FormControl fullWidth>
                    <InputLabel>{t('pages.adminApplications.dialog.statusLabel')}</InputLabel>
                    <Select
                      value={statusDialog.newStatus}
                      label={t('pages.adminApplications.dialog.statusLabel')}
                      onChange={(e) =>
                        setStatusDialog((prev) => ({
                          ...prev,
                          newStatus: e.target.value,
                        }))
                      }
                    >
                      <MenuItem value="pending">{t('pages.adminApplications.status.pending')}</MenuItem>
                      <MenuItem value="approved">{t('pages.adminApplications.status.approved')}</MenuItem>
                      <MenuItem value="rejected">{t('pages.adminApplications.status.rejected')}</MenuItem>
                      <MenuItem value="withdrawn">{t('pages.adminApplications.status.withdrawn')}</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {statusDialog.newStatus === 'rejected' && (
                  <Box>
                    <TextField
                      fullWidth
                      label={t('pages.adminApplications.dialog.rejectionReason')}
                      multiline
                      rows={3}
                      value={statusDialog.rejectionReason}
                      onChange={(e) =>
                        setStatusDialog((prev) => ({
                          ...prev,
                          rejectionReason: e.target.value,
                        }))
                      }
                      placeholder={t('pages.adminApplications.dialog.rejectionReasonPlaceholder')}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setStatusDialog({
                open: false,
                application: null,
                newStatus: '',
                rejectionReason: '',
              })
            }
          >
            {t('pages.adminApplications.dialog.cancel')}
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            {t('pages.adminApplications.dialog.updateStatus')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminApplications;
