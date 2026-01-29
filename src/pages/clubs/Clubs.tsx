import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';
import type { ClubDto } from '../../services/types';

/**
 * Clubs page displays a list of all archery clubs.
 * Admins can create, edit, and delete clubs.
 */
const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<ClubDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t: _t } = useTranslation('common');
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiService.getClubs();
        setClubs(data || []);
      } catch (error) {
        console.error('Failed to load clubs:', error);
        setClubs([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (clubId: string) => {
    if (!confirm('Are you sure you want to delete this club?')) {
      return;
    }

    try {
      await apiService.deleteClub(clubId);
      setClubs(clubs.filter((c) => c.id !== clubId));
    } catch (error) {
      console.error('Failed to delete club:', error);
      alert('Failed to delete club. This is a stub for now.');
    }
  };

  if (loading) {
    return (
      <section>
        <div className="container">
          <Typography>Loading...</Typography>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="container">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4">Clubs</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/${lang}/admin/clubs/create`)}
            >
              Create Club
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            '& > *': {
              flex: '1 1 calc(33.333% - 16px)',
              minWidth: '280px',
              maxWidth: 'calc(33.333% - 16px)',
            },
          }}
        >
          {clubs.map((club) => (
            <Card
              key={club.id}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Box
                sx={{
                  height: 300,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'grey.100',
                  p: 2,
                }}
              >
                {club.clubLogo ? (
                  <CardMedia
                    component="img"
                    image={club.clubLogo}
                    alt={club.name}
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                    }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.warn('Failed to load club logo (possibly CORS):', club.clubLogo);
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <Typography variant="h6" color="text.secondary">
                    {club.name.charAt(0)}
                  </Typography>
                )}
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {club.name}
                </Typography>
                {club.location && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {club.location}
                  </Typography>
                )}
                {club.description && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {club.description}
                  </Typography>
                )}
                {isAdmin && (
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() =>
                        navigate(`/${lang}/admin/clubs/${club.id}/edit`)
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(club.id!)}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        {clubs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              No clubs found. {isAdmin && 'Click "Create Club" to add one.'}
            </Typography>
          </Box>
        )}
      </div>
    </section>
  );
};

export default Clubs;
