import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Check, Close, Visibility } from '@mui/icons-material';
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
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  category?: string;
  division?: string;
  equipment?: string;
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
  const { user } = useAuth();
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [stats, setStats] = useState<ApplicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [statusDialog, setStatusDialog] = useState<{
    open: boolean;
    application: TournamentApplication | null;
    newStatus: string;
    rejectionReason: string;
  }>({ open: false, application: null, newStatus: '', rejectionReason: '' });

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
      if (data.length > 0) {
        setSelectedTournament(data[0].id);
      }
    } catch (error) {
      setError('Failed to fetch tournaments');
    }
  };

  const fetchApplications = async () => {
    if (!selectedTournament) return;

    try {
      setLoading(true);
      const data = await apiService.getTournamentApplications(selectedTournament);
      setApplications(data);
    } catch (error) {
      setError('Failed to fetch applications');
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedTournament) return;

    try {
      const data = await apiService.getTournamentApplicationStats(selectedTournament);
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
        statusDialog.rejectionReason || undefined
      );
      setStatusDialog({ open: false, application: null, newStatus: '', rejectionReason: '' });
      fetchApplications();
      fetchStats();
    } catch (error) {
      setError('Failed to update application status');
      console.error('Error updating status:', error);
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
        Tournament Applications Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>Select Tournament</InputLabel>
          <Select
            value={selectedTournament}
            label="Select Tournament"
            onChange={(e) => setSelectedTournament(e.target.value)}
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
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="primary">
                  Total: {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="warning.main">
                  Pending: {stats.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="success.main">
                  Approved: {stats.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="error.main">
                  Rejected: {stats.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No applications found for this tournament.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Division</TableCell>
                <TableCell>Equipment</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applied</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    <Typography variant="body2">
                      {application.applicant.firstName} {application.applicant.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {application.applicant.email}
                    </Typography>
                  </TableCell>
                  <TableCell>{application.category || '-'}</TableCell>
                  <TableCell>{application.division || '-'}</TableCell>
                  <TableCell>{application.equipment || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(application.status)}
                      color={getStatusColor(application.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(application.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => setStatusDialog({
                          open: true,
                          application,
                          newStatus: application.status,
                          rejectionReason: application.rejectionReason || ''
                        })}
                      >
                        View
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button
                            size="small"
                            color="success"
                            startIcon={<Check />}
                            onClick={() => setStatusDialog({
                              open: true,
                              application,
                              newStatus: 'approved',
                              rejectionReason: ''
                            })}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Close />}
                            onClick={() => setStatusDialog({
                              open: true,
                              application,
                              newStatus: 'rejected',
                              rejectionReason: ''
                            })}
                          >
                            Reject
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
        onClose={() => setStatusDialog({ open: false, application: null, newStatus: '', rejectionReason: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {statusDialog.application ? `Application Details - ${statusDialog.application.applicant.firstName} ${statusDialog.application.applicant.lastName}` : 'Application Details'}
        </DialogTitle>
        <DialogContent>
          {statusDialog.application && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Tournament</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.tournament.title}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Category</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.category || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Division</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.division || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2">Equipment</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.equipment || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Notes</Typography>
                  <Typography variant="body2" gutterBottom>
                    {statusDialog.application.notes || 'No notes provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusDialog.newStatus}
                      label="Status"
                      onChange={(e) => setStatusDialog(prev => ({ ...prev, newStatus: e.target.value }))}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="approved">Approved</MenuItem>
                      <MenuItem value="rejected">Rejected</MenuItem>
                      <MenuItem value="withdrawn">Withdrawn</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {statusDialog.newStatus === 'rejected' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Rejection Reason"
                      multiline
                      rows={3}
                      value={statusDialog.rejectionReason}
                      onChange={(e) => setStatusDialog(prev => ({ ...prev, rejectionReason: e.target.value }))}
                      placeholder="Please provide a reason for rejection..."
                    />
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, application: null, newStatus: '', rejectionReason: '' })}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminApplications; 