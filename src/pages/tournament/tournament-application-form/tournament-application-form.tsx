import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import apiService from '../../../services/api';

interface TournamentApplicationFormProps {
  tournamentId: string;
  tournamentTitle: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TournamentApplicationForm: React.FC<TournamentApplicationFormProps> = ({
  tournamentId,
  tournamentTitle,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    division: '',
    equipment: '',
    notes: '',
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiService.createTournamentApplication({
        tournamentId,
        ...formData,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to submit application',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Submit Application for {tournamentTitle}
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={formData.category}
                      label="Category"
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                    >
                      <MenuItem value="recurve">Recurve</MenuItem>
                      <MenuItem value="compound">Compound</MenuItem>
                      <MenuItem value="barebow">Barebow</MenuItem>
                      <MenuItem value="traditional">Traditional</MenuItem>
                      <MenuItem value="longbow">Longbow</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={{ flex: '1 1 300px' }}>
                  <FormControl fullWidth>
                    <InputLabel>Division</InputLabel>
                    <Select
                      value={formData.division}
                      label="Division"
                      onChange={(e) =>
                        handleInputChange('division', e.target.value)
                      }
                    >
                      <MenuItem value="men">Men</MenuItem>
                      <MenuItem value="women">Women</MenuItem>
                      <MenuItem value="mixed">Mixed</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Equipment</InputLabel>
                <Select
                  value={formData.equipment}
                  label="Equipment"
                  onChange={(e) =>
                    handleInputChange('equipment', e.target.value)
                  }
                >
                  <MenuItem value="olympic">Olympic Recurve</MenuItem>
                  <MenuItem value="compound">Compound Bow</MenuItem>
                  <MenuItem value="barebow">Barebow</MenuItem>
                  <MenuItem value="traditional">Traditional Bow</MenuItem>
                  <MenuItem value="longbow">Longbow</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Any additional information about your participation..."
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                {onCancel && (
                  <Button
                    variant="outlined"
                    onClick={onCancel}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TournamentApplicationForm;
