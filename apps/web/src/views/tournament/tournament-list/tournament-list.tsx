import { Add, Edit, Delete, Send, Visibility } from '@mui/icons-material';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import { ALL_COUNTRIES_FILTER, COUNTRIES, getCountryName } from '../../../config/countries';
import { isDev } from '../../../config/env';
import { canCreateTournament, canEditTournament, canDeleteTournament } from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import apiService from '../../../services/api';
import type { TournamentDto, TournamentApplicationDto } from '../../../services/types';
import {
  getSavedCountryFilter,
  resolveDefaultCountryCode,
  saveCountryFilter,
} from '../../../utils/country-default';
import { formatDate } from '../../../utils/date-utils';
import { resolveTournamentBanner } from '../../../utils/placeholder-images';
import { isPastTournament } from '../../../utils/tournament-filters';

const TournamentList: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation('common');
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [userApplications, setUserApplications] = useState<TournamentApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [countryFilter, setCountryFilter] = useState<string | null>(null);
  const [filterReady, setFilterReady] = useState(false);
  const [countriesWithTournaments, setCountriesWithTournaments] = useState<Set<string> | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    const initFilter = async () => {
      const fromUrl = searchParams.get('country');
      if (fromUrl) {
        if (!cancelled) {
          setCountryFilter(fromUrl === ALL_COUNTRIES_FILTER ? ALL_COUNTRIES_FILTER : fromUrl);
          setFilterReady(true);
        }
        return;
      }
      const saved = getSavedCountryFilter();
      if (saved) {
        if (!cancelled) {
          setCountryFilter(saved);
          setFilterReady(true);
        }
        return;
      }
      const resolved = await resolveDefaultCountryCode(user);
      if (!cancelled) {
        setCountryFilter(resolved);
        setFilterReady(true);
      }
    };
    void initFilter();
    return () => {
      cancelled = true;
    };
  }, [user, searchParams]);

  useEffect(() => {
    if (!filterReady) return;
    let cancelled = false;
    const loadCountriesWithTournaments = async () => {
      try {
        const all = await apiService.getAllTournaments();
        if (!cancelled) {
          setCountriesWithTournaments(
            new Set(
              all
                .map((tournament) => tournament.country)
                .filter((code): code is string => Boolean(code)),
            ),
          );
        }
      } catch (fetchError) {
        console.error('Error fetching tournament countries:', fetchError);
        if (!cancelled) {
          setCountriesWithTournaments(new Set());
        }
      }
    };
    void loadCountriesWithTournaments();
    return () => {
      cancelled = true;
    };
  }, [filterReady]);

  const fetchTournaments = useCallback(async () => {
    if (!filterReady || countryFilter === null) return;
    try {
      setLoading(true);
      const params: { country?: string; upcoming?: boolean } = {
        upcoming: activeTab === 0,
      };
      if (countryFilter !== ALL_COUNTRIES_FILTER) {
        params.country = countryFilter;
      }
      const data = await apiService.getAllTournaments(params);
      setTournaments(data);
    } catch (fetchError) {
      setError(t('pages.tournaments.fetchError'));
      console.error('Error fetching tournaments:', fetchError);
    } finally {
      setLoading(false);
    }
  }, [t, activeTab, countryFilter, filterReady]);

  const fetchUserApplications = useCallback(async () => {
    try {
      const data = await apiService.getMyApplications();
      setUserApplications(data);
    } catch (fetchError) {
      console.error('Error fetching user applications:', fetchError);
    }
  }, []);

  useEffect(() => {
    if (!filterReady || countryFilter === null) return;
    let cancelled = false;

    const loadTournaments = async () => {
      try {
        setLoading(true);
        const params: { country?: string; upcoming?: boolean } = {
          upcoming: activeTab === 0,
        };
        if (countryFilter !== ALL_COUNTRIES_FILTER) {
          params.country = countryFilter;
        }
        const data = await apiService.getAllTournaments(params);
        if (!cancelled) {
          setTournaments(data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(t('pages.tournaments.fetchError'));
          console.error('Error fetching tournaments:', fetchError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTournaments();
    return () => {
      cancelled = true;
    };
  }, [t, activeTab, countryFilter, filterReady]);

  useEffect(() => {
    if (user) {
      void fetchUserApplications();
    }
  }, [user, fetchUserApplications]);

  const handleCountryFilterChange = (value: string) => {
    setCountryFilter(value);
    saveCountryFilter(value);
    const next = new URLSearchParams(searchParams);
    if (value === ALL_COUNTRIES_FILTER) {
      next.delete('country');
    } else {
      next.set('country', value);
    }
    setSearchParams(next, { replace: true });
  };

  const hasApplicationForTournament = (tournamentId: string) => {
    return userApplications.some(
      (app: TournamentApplicationDto) => app.tournament.id === tournamentId,
    );
  };

  const getApplicationCountForTournament = (tournamentId: string) => {
    return userApplications.filter((app) => app.tournament.id === tournamentId).length;
  };

  const handleDeleteTournament = async (id: string) => {
    if (window.confirm(t('pages.tournaments.deleteConfirm'))) {
      try {
        await apiService.deleteTournament(id);
        void fetchTournaments();
      } catch (deleteError: unknown) {
        setError(t('pages.tournaments.deleteError'));
        const err = deleteError instanceof Error ? deleteError : new Error(String(deleteError));
        if (isDev) {
          console.error('Error deleting tournament:', err.message);
        }
      }
    }
  };

  const showCountryOnCards = countryFilter === ALL_COUNTRIES_FILTER;

  const filteredTournaments = useMemo(() => tournaments, [tournaments]);

  const emptyListMessage = useMemo(() => {
    if (filteredTournaments.length > 0) return null;
    const isUpcoming = activeTab === 0;
    if (countryFilter && countryFilter !== ALL_COUNTRIES_FILTER) {
      const countryName = getCountryName(countryFilter) ?? countryFilter;
      return isUpcoming
        ? t('pages.tournaments.noUpcomingInCountry', { country: countryName })
        : t('pages.tournaments.noPastInCountry', { country: countryName });
    }
    return isUpcoming ? t('pages.tournaments.noUpcomingAll') : t('pages.tournaments.noPastAll');
  }, [activeTab, countryFilter, filteredTournaments.length, t]);

  if (!filterReady || (loading && tournaments.length === 0)) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
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
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography variant="h4">{t('pages.tournaments.title')}</Typography>
        {user && canCreateTournament(user.role) && (
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to={`/${lang}/tournaments/create`}
            sx={{
              '& .MuiButton-startIcon': {
                margin: { xs: 0, sm: '0 8px 0 -4px' },
              },
              minWidth: { xs: 'auto', sm: '64px' },
              padding: { xs: '8px 12px', sm: '8px 16px' },
            }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {t('pages.tournaments.create')}
            </Box>
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, maxWidth: 320 }}>
        <FormControl fullWidth size="small">
          <InputLabel>{t('pages.tournaments.countryFilter', 'Country')}</InputLabel>
          <Select
            value={countryFilter ?? ALL_COUNTRIES_FILTER}
            label={t('pages.tournaments.countryFilter', 'Country')}
            onChange={(e) => handleCountryFilterChange(e.target.value)}
          >
            <MenuItem value={ALL_COUNTRIES_FILTER}>
              {t('pages.tournaments.allCountries', 'All countries')}
            </MenuItem>
            {COUNTRIES.map((c) => {
              const hasTournaments =
                countriesWithTournaments === null || countriesWithTournaments.has(c.code);
              return (
                <MenuItem key={c.code} value={c.code} disabled={!hasTournaments}>
                  {c.name}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('pages.tournaments.futureTournaments', 'Future')} />
          <Tab label={t('pages.tournaments.pastTournaments', 'Past')} />
        </Tabs>
      </Box>

      {!loading && emptyListMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {emptyListMessage}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 3,
        }}
      >
        {filteredTournaments.map((tournament) => {
          const isPast = isPastTournament(tournament);
          return (
            <Box key={tournament.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="140"
                  image={resolveTournamentBanner(tournament.banner)}
                  alt={tournament.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    component={Link}
                    to={`/${lang}/tournaments/${tournament.id}`}
                    sx={{
                      color: 'inherit',
                      textDecoration: 'none',
                      display: 'block',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {tournament.title}
                  </Typography>
                  {tournament.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tournament.description}
                    </Typography>
                  )}
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>{t('pages.tournaments.rules', 'Rules')}:</strong>{' '}
                    {tournament.ruleCode ? (
                      tournament.rule?.ruleName || tournament.ruleCode
                    ) : (
                      <em style={{ color: 'var(--text-disabled)' }}>
                        {t('pages.tournaments.noRulesAssigned', 'Not specified')}
                      </em>
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>{t('pages.tournaments.start')}:</strong>{' '}
                    {formatDate(tournament.startDate)}
                  </Typography>
                  {tournament.applicationDeadline && (
                    <Typography variant="body2" color="warning.main">
                      <strong>
                        {t('pages.tournaments.applicationDeadline', 'Application Deadline')}:
                      </strong>{' '}
                      {formatDate(tournament.applicationDeadline)}
                    </Typography>
                  )}
                  {tournament.address && (
                    <Typography variant="body2">
                      <strong>{t('pages.tournaments.location')}:</strong> {tournament.address}
                    </Typography>
                  )}
                  {showCountryOnCards && tournament.country && (
                    <Typography variant="body2">
                      <strong>{t('pages.tournaments.country', 'Country')}:</strong>{' '}
                      {getCountryName(tournament.country)}
                    </Typography>
                  )}
                  <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, width: '100%' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Visibility />}
                        component={Link}
                        to={`/${lang}/tournaments/${tournament.id}`}
                        sx={{ flex: '1 1 calc(50% - 4px)', minWidth: 0, justifyContent: 'center' }}
                      >
                        {t('pages.tournaments.viewDetails', 'View Details')}
                      </Button>
                      {hasApplicationForTournament(tournament.id) && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          component={Link}
                          to={`/${lang}/applications`}
                          sx={{
                            flex: '1 1 calc(50% - 4px)',
                            minWidth: 0,
                            justifyContent: 'center',
                          }}
                        >
                          {t('pages.tournaments.viewApplications')} (
                          {getApplicationCountForTournament(tournament.id)})
                        </Button>
                      )}
                      {!isPast &&
                        (tournament.allowMultipleApplications ||
                          !hasApplicationForTournament(tournament.id)) && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<Send />}
                            component={Link}
                            to={`/${lang}/apply/${tournament.id}`}
                            sx={{
                              flex: hasApplicationForTournament(tournament.id)
                                ? '1 1 100%'
                                : '1 1 calc(50% - 4px)',
                              minWidth: 0,
                              justifyContent: 'center',
                            }}
                          >
                            {t('pages.tournaments.apply')}
                          </Button>
                        )}
                    </Box>
                    {user &&
                      (canEditTournament(user.role, tournament.createdBy?.id ?? '', user.id) ||
                        canDeleteTournament(user.role)) && (
                        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                          {canEditTournament(
                            user.role,
                            tournament.createdBy?.id ?? '',
                            user.id,
                          ) && (
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Edit />}
                              component={Link}
                              to={`/${lang}/tournaments/${tournament.id}/edit`}
                              sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                            >
                              {t('pages.tournaments.edit')}
                            </Button>
                          )}
                          {canDeleteTournament(user.role) && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              startIcon={<Delete />}
                              onClick={() => void handleDeleteTournament(tournament.id)}
                              sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                            >
                              {t('pages.tournaments.delete')}
                            </Button>
                          )}
                        </Box>
                      )}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default TournamentList;
