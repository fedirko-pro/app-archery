import { Add, Edit, Delete, Send } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import { formatDate } from '../../../utils/date-utils';

interface Tournament {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  address?: string;
  allowMultipleApplications?: boolean;
  createdBy: any;
  createdAt: string;
}

const TournamentList: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userApplications, setUserApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    applicationDeadline: '',
    address: '',
    allowMultipleApplications: true,
  });
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(
    null,
  );

  useEffect(() => {
    fetchTournaments();
    if (user) {
      fetchUserApplications();
    }
  }, [user]);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllTournaments();
      setTournaments(data);
    } catch (error) {
      setError('Failed to fetch tournaments');
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const data = await apiService.getMyApplications();
      setUserApplications(data);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  };

  const hasApplicationForTournament = (tournamentId: string) => {
    return userApplications.some((app) => app.tournament.id === tournamentId);
  };

  const getApplicationCountForTournament = (tournamentId: string) => {
    return userApplications.filter((app) => app.tournament.id === tournamentId)
      .length;
  };

  const handleCreateTournament = async () => {
    try {
      await apiService.createTournament(formData);
      setOpenDialog(false);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        applicationDeadline: '',
        address: '',
        allowMultipleApplications: true,
      });
      fetchTournaments();
    } catch (error) {
      setError('Failed to create tournament');
      console.error('Error creating tournament:', error);
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await apiService.deleteTournament(id);
        fetchTournaments();
      } catch (error: any) {
        setError('Failed to delete tournament');
        if (error?.response?.data?.message) {
          console.error(
            'Error deleting tournament:',
            error.response.data.message,
          );
        } else {
          console.error('Error deleting tournament:', error);
        }
      }
    }
  };

  const handleEditTournament = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      title: tournament.title,
      description: tournament.description || '',
      startDate: tournament.startDate.split('T')[0],
      endDate: tournament.endDate.split('T')[0],
      applicationDeadline: '', // Will be handled by backend
      address: tournament.address || '',
      allowMultipleApplications: tournament.allowMultipleApplications ?? true,
    });
    setOpenDialog(true);
  };

  const handleUpdateTournament = async () => {
    if (!editingTournament) return;

    try {
      await apiService.updateTournament(editingTournament.id, formData);
      setOpenDialog(false);
      setEditingTournament(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        applicationDeadline: '',
        address: '',
        allowMultipleApplications: true,
      });
      fetchTournaments();
    } catch (error) {
      setError('Failed to update tournament');
      console.error('Error updating tournament:', error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTournament(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      applicationDeadline: '',
      address: '',
      allowMultipleApplications: true,
    });
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
          mb: 3,
        }}
      >
        <Typography variant="h4">Tournaments</Typography>
        {user?.role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Tournament
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        {tournaments.map((tournament) => (
          <Box key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tournament.title}
                </Typography>
                {tournament.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {tournament.description}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Start:</strong> {formatDate(tournament.startDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>End:</strong> {formatDate(tournament.endDate)}
                </Typography>
                {tournament.address && (
                  <Typography variant="body2">
                    <strong>Location:</strong> {tournament.address}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  <strong>Multiple applications:</strong>{' '}
                  {tournament.allowMultipleApplications
                    ? 'Allowed (different categories)'
                    : 'Not allowed'}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {hasApplicationForTournament(tournament.id) && (
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      component={Link}
                      to="/applications"
                    >
                      View Applications (
                      {getApplicationCountForTournament(tournament.id)})
                    </Button>
                  )}
                  {(tournament.allowMultipleApplications ||
                    !hasApplicationForTournament(tournament.id)) && (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<Send />}
                      component={Link}
                      to={`/apply/${tournament.id}`}
                    >
                      Apply
                    </Button>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEditTournament(tournament)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteTournament(tournament.id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTournament ? 'Edit Tournament' : 'Create Tournament'}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date (optional - defaults to start date)"
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty to use start date"
          />
          <TextField
            label="Application Deadline (optional - defaults to 5 days before start)"
            type="date"
            value={formData.applicationDeadline}
            onChange={(e) =>
              setFormData({ ...formData, applicationDeadline: e.target.value })
            }
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            helperText="Leave empty to set 5 days before start date"
          />
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            fullWidth
            margin="normal"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.allowMultipleApplications}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    allowMultipleApplications: e.target.checked,
                  })
                }
              />
            }
            label="Allow multiple applications from one user (different categories only)"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={
              editingTournament
                ? handleUpdateTournament
                : handleCreateTournament
            }
            variant="contained"
          >
            {editingTournament ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentList;
