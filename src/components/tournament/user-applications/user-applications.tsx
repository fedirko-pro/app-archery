import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';

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
  const { user } = useAuth();
  const location = useLocation();
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.message || null
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
      setError('Failed to fetch applications');
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        My Tournament Applications
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              You haven't submitted any tournament applications yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {applications.map((application) => (
            <Grid item xs={12} md={6} key={application.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {application.tournament.title}
                    </Typography>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Dates:</strong> {new Date(application.tournament.startDate).toLocaleDateString()} - {new Date(application.tournament.endDate).toLocaleDateString()}
                  </Typography>

                  {application.category && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Category:</strong> {application.category}
                    </Typography>
                  )}

                  {application.division && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Division:</strong> {application.division}
                    </Typography>
                  )}

                  {application.equipment && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Equipment:</strong> {application.equipment}
                    </Typography>
                  )}

                  {application.notes && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Notes:</strong> {application.notes}
                    </Typography>
                  )}

                  {application.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <strong>Rejection Reason:</strong> {application.rejectionReason}
                    </Alert>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    Applied on: {new Date(application.createdAt).toLocaleDateString()}
                  </Typography>

                  {application.status === 'pending' && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => setWithdrawDialog({ open: true, applicationId: application.id })}
                      >
                        Withdraw Application
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={withdrawDialog.open} onClose={() => setWithdrawDialog({ open: false, applicationId: null })}>
        <DialogTitle>Withdraw Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to withdraw this application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWithdrawDialog({ open: false, applicationId: null })}>
            Cancel
          </Button>
          <Button onClick={handleWithdraw} color="error" variant="contained">
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserApplications; 