import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';

interface Tournament {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  address?: string;
  createdBy: any;
  createdAt: string;
}

const TournamentList: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    address: '',
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

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

  const handleCreateTournament = async () => {
    try {
      await apiService.createTournament(formData);
      setOpenDialog(false);
      setFormData({ title: '', description: '', startDate: '', endDate: '', address: '' });
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
      } catch (error) {
        setError('Failed to delete tournament');
        console.error('Error deleting tournament:', error);
      }
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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

      <Grid container spacing={3}>
        {tournaments.map((tournament) => (
          <Grid item xs={12} md={6} lg={4} key={tournament.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {tournament.title}
                </Typography>
                {tournament.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {tournament.description}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Start:</strong> {new Date(tournament.startDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>End:</strong> {new Date(tournament.endDate).toLocaleDateString()}
                </Typography>
                {tournament.address && (
                  <Typography variant="body2">
                    <strong>Location:</strong> {tournament.address}
                  </Typography>
                )}
                {user?.role === 'admin' && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Edit />}
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
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Tournament</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            label="Start Date"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTournament} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TournamentList; 