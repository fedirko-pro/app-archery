import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { ALL_COUNTRIES_FILTER, COUNTRIES, getCountryName } from '../../config/countries';
import { canManageReferenceData } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';
import type { ClubDto } from '../../services/types';
import { LOCAL_CLUB_LOGO, resolveClubLogo } from '../../utils/placeholder-images';

const Clubs: React.FC = () => {
  const [clubs, setClubs] = useState<ClubDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [countryFilter, setCountryFilter] = useState<string>(ALL_COUNTRIES_FILTER);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReady, setFilterReady] = useState(false);
  const navigate = useNavigate();
  const { lang } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  const isAdmin = user && canManageReferenceData(user.role);

  useEffect(() => {
    const fromUrl = searchParams.get('country');
    if (fromUrl) {
      setCountryFilter(fromUrl);
    }
    setFilterReady(true);
  }, [searchParams]);

  const fetchClubs = useCallback(async () => {
    if (!filterReady) return;
    try {
      setLoading(true);
      const params: { country?: string; visibility?: string; search?: string } = {};
      if (countryFilter !== ALL_COUNTRIES_FILTER) {
        params.country = countryFilter;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const data = await apiService.getClubs(params);
      setClubs(data || []);
    } catch (error) {
      console.error('Failed to load clubs:', error);
      setClubs([]);
    } finally {
      setLoading(false);
    }
  }, [countryFilter, searchQuery, filterReady]);

  useEffect(() => {
    void fetchClubs();
  }, [fetchClubs]);

  const handleCountryFilterChange = (value: string) => {
    setCountryFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === ALL_COUNTRIES_FILTER) {
      next.delete('country');
    } else {
      next.set('country', value);
    }
    setSearchParams(next, { replace: true });
  };

  const handleDelete = async (clubId: string) => {
    if (
      !window.confirm(t('pages.clubs.deleteConfirm', 'Are you sure you want to delete this club?'))
    ) {
      return;
    }

    try {
      await apiService.deleteClub(clubId);
      setClubs(clubs.filter((c) => c.id !== clubId));
      showSuccess(t('pages.clubs.deleteSuccess', 'Club deleted successfully'));
    } catch (error) {
      console.error('Failed to delete club:', error);
      showError(
        error instanceof Error
          ? error.message
          : t('pages.clubs.deleteError', 'Failed to delete club'),
      );
    }
  };

  if (!filterReady || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
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
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4">{t('nav.clubs', 'Clubs')}</Typography>
          {isAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/${lang}/admin/clubs/create`)}
            >
              {t('pages.clubs.create', 'Create Club')}
            </Button>
          )}
        </Box>

        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', maxWidth: 600 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>{t('pages.tournaments.countryFilter', 'Country')}</InputLabel>
            <Select
              value={countryFilter}
              label={t('pages.tournaments.countryFilter', 'Country')}
              onChange={(e) => handleCountryFilterChange(e.target.value)}
            >
              <MenuItem value={ALL_COUNTRIES_FILTER}>
                {t('pages.tournaments.allCountries', 'All countries')}
              </MenuItem>
              {COUNTRIES.map((c) => (
                <MenuItem key={c.code} value={c.code}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            size="small"
            placeholder={t('pages.clubs.search', 'Search clubs...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 200 }}
          />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 3,
          }}
        >
          {clubs.map((club) => {
            const isPrivate = club.visibility === 'private';
            return (
              <Card key={club.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
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
                  {isPrivate ? (
                    <LockIcon sx={{ fontSize: 64, color: 'grey.400' }} />
                  ) : (
                    <CardMedia
                      component="img"
                      image={resolveClubLogo(club.clubLogo)}
                      alt={club.name}
                      sx={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = LOCAL_CLUB_LOGO;
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    component={Link}
                    to={`/${lang}/clubs/${club.id}`}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'block',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {isPrivate ? (
                      <>
                        <LockIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} />
                        {t('pages.clubs.privateClub', 'Private Club')}
                      </>
                    ) : (
                      club.name
                    )}
                    {club.shortCode && !isPrivate && (
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1, fontWeight: 500 }}
                      >
                        ({club.shortCode})
                      </Typography>
                    )}
                  </Typography>
                  {club.city && club.country && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {club.city}, {getCountryName(club.country)}
                    </Typography>
                  )}
                  {club.description && !isPrivate && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {club.description}
                    </Typography>
                  )}
                  {isPrivate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {t('pages.clubs.contactAdmin', 'Contact club admin for access')}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      component={Link}
                      to={`/${lang}/clubs/${club.id}`}
                      fullWidth
                      sx={{ justifyContent: 'center' }}
                    >
                      {t('pages.clubs.viewDetails', 'View Details')}
                    </Button>
                    {isAdmin && (
                      <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => navigate(`/${lang}/admin/clubs/${club.id}/edit`)}
                          sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                        >
                          {t('common.edit', 'Edit')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(club.id!)}
                          sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                        >
                          {t('common.delete', 'Delete')}
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>

        {clubs.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              {t('pages.clubs.noClubs', 'No clubs found.')}
              {isAdmin && ` ${t('pages.clubs.createHint', 'Click "Create Club" to add one.')}`}
            </Typography>
          </Box>
        )}
      </div>
    </section>
  );
};

export default Clubs;
