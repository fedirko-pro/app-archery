import { Delete } from '@mui/icons-material';
import {
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
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import apiService from '../../../services/api';
import { formatDate } from '../../../utils/date-utils';

interface TournamentApplication {
  id: string;
  tournament: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  category?: string;
  division?: string;
  equipment?: string;
  notes?: string;
  rejectionReason?: string;
  createdAt: string;
}

const UserApplications: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation('common');
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null,
  );
  const [withdrawDialog, setWithdrawDialog] = useState<{
    open: boolean;
    applicationId: string | null;
  }>({ open: false, applicationId: null });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyApplications();
      setApplications(data);
    } catch (error) {
      setError(t('pages.applications.fetchError'));
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawDialog.applicationId) return;

    try {
      await apiService.withdrawApplication(withdrawDialog.applicationId);
      setWithdrawDialog({ open: false, applicationId: null });
      fetchApplications();
    } catch (error) {
      setError('Failed to withdraw application');
      console.error('Error withdrawing application:', error);
    }
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
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'withdrawn':
        return 'Withdrawn';
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
      <Typography variant="h4" gutterBottom>
        {t('pages.applications.title')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              {t('pages.applications.empty')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          {applications.map((application) => (
            <Box key={application.id}>
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 2,
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      {application.tournament.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    <strong>{t('pages.applications.dates')}:</strong>{' '}
                    {formatDate(application.tournament.startDate)} -{' '}
                    {formatDate(application.tournament.endDate)}
                  </Typography>

                  {application.category && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>{t('pages.applications.category')}:</strong> {application.category}
                    </Typography>
                  )}

                  {application.division && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>{t('pages.applications.division')}:</strong> {application.division}
                    </Typography>
                  )}

                  {application.equipment && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>{t('pages.applications.equipment')}:</strong> {application.equipment}
                    </Typography>
                  )}

                  {application.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>{t('pages.applications.notes')}:</strong> {application.notes}
                    </Typography>
                  )}

                  {application.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <strong>{t('pages.applications.rejectionReason')}:</strong>{' '}
                      {application.rejectionReason}
                    </Alert>
                  )}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mt: 1 }}
                  >
                    {t('pages.applications.appliedOn')}: {formatDate(application.createdAt)}
                  </Typography>

                  {application.status === 'pending' && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() =>
                          setWithdrawDialog({
                            open: true,
                            applicationId: application.id,
                          })
                        }
                      >
                        {t('pages.applications.withdraw')}
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      )}

      <Dialog
        open={withdrawDialog.open}
        onClose={() => setWithdrawDialog({ open: false, applicationId: null })}
      >
        <DialogTitle>{t('pages.applications.withdrawTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('pages.applications.withdrawConfirm')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setWithdrawDialog({ open: false, applicationId: null })
            }
          >
            {t('common.cancel')}
          </Button>
          <Button onClick={handleWithdraw} color="error" variant="contained">
            {t('pages.applications.withdraw')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserApplications;
