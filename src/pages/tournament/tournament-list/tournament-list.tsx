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
  Chip,
} from '@mui/material';
import { isBefore, parseISO, startOfDay } from 'date-fns';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import {
  canCreateTournament,
  canEditTournament,
  canDeleteTournament,
  canManageReferenceData,
} from '../../../config/roles';
import { useAuth } from '../../../contexts/auth-context';
import defaultBanner from '../../../img/default_turnament_bg.png';
import apiService from '../../../services/api';
import type {
  CountryDto,
  FederationDto,
  TournamentDto,
  TournamentApplicationDto,
} from '../../../services/types';
import {
  getInitialTournamentCountryCode,
  getInitialTournamentFederationId,
  saveTournamentCountryCode,
  saveTournamentFederationId,
} from '../../../utils/country';
import { formatDate } from '../../../utils/date-utils';

const TournamentList: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const [tournaments, setTournaments] = useState<TournamentDto[]>([]);
  const [userApplications, setUserApplications] = useState<TournamentApplicationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(getInitialTournamentCountryCode());
  const [selectedFederationId, setSelectedFederationId] = useState<string | null>(
    getInitialTournamentFederationId(),
  );
  const [allFederations, setAllFederations] = useState<FederationDto[]>([]);

  const tournamentsRef = useRef<TournamentDto[]>([]);

  const getFederationsFromTournaments = (tournaments: TournamentDto[]) => {
    const byId = new Map<string, NonNullable<TournamentDto['federation']>>();
    for (const t of tournaments) {
      if (t.federation) byId.set(t.federation.id, t.federation);
    }

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  const fetchTournaments = useCallback(async () => {
    try {
      setLoading(true);
      const defaultFederationId = user?.club?.federation?.id ?? selectedFederationId ?? null;
      const data = await apiService.getTournaments({
        countryCode: selectedCountry || undefined,
        federationId: defaultFederationId ?? undefined,
      });
      setTournaments(data);
    } catch (error) {
      setError(t('pages.tournaments.fetchError'));
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  }, [t, selectedCountry, selectedFederationId, user?.club?.federation?.id]);

  const fetchCountries = useCallback(async () => {
    try {
      const data = await apiService.getCountries();
      const enabledOnly = data.filter((c) => c.enabled);
      setCountries(enabledOnly);
      if (selectedCountry && !enabledOnly.some((c) => c.code === selectedCountry)) {
        setSelectedCountry('PT');
      }
    } catch (e) {
      // If countries endpoint isn't available yet, silently fall back to PT.
      setCountries([{ code: 'PT', name: 'Portugal', enabled: true, flagEmoji: '🇵🇹' }]);
      setSelectedCountry('PT');
      if (import.meta.env.DEV) console.error(e);
    }
  }, [selectedCountry]);

  useEffect(() => {
    tournamentsRef.current = tournaments;
  }, [tournaments]);

  const fetchFederations = useCallback(async () => {
    // Federations are admin-only on the backend. If the user is not a reference-data admin,
    // fallback to the federations already seen in tournaments to avoid repeated 401 errors.
    if (!user || !canManageReferenceData(user.role)) {
      setAllFederations(getFederationsFromTournaments(tournamentsRef.current));
      return;
    }

    try {
      const data = await apiService.getFederations();
      setAllFederations(data);
    } catch (e) {
      // Fallback to federations from tournaments
      setAllFederations(getFederationsFromTournaments(tournamentsRef.current));
      if (import.meta.env.DEV) console.error(e);
    }
  }, [user]);

  const fetchUserApplications = useCallback(async () => {
    try {
      const data = await apiService.getMyApplications();
      setUserApplications(data);
    } catch (error) {
      console.error('Error fetching user applications:', error);
    }
  }, []);

  useEffect(() => {
    fetchCountries();
    fetchFederations();
    fetchTournaments();
    if (user) {
      fetchUserApplications();
    }
  }, [user, fetchTournaments, fetchUserApplications, fetchCountries, fetchFederations]);

  useEffect(() => {
    saveTournamentCountryCode(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    saveTournamentFederationId(selectedFederationId);
  }, [selectedFederationId]);

  const hasApplicationForTournament = (tournamentId: string) => {
    return userApplications.some(
      (app: TournamentApplicationDto) => app.tournament.id === tournamentId,
    );
  };

  const getApplicationCountForTournament = (tournamentId: string) => {
    return userApplications.filter((app) => app.tournament.id === tournamentId).length;
  };

  const handleDeleteTournament = async (id: string) => {
    if (globalThis.confirm(t('pages.tournaments.deleteConfirm'))) {
      try {
        await apiService.deleteTournament(id);
        fetchTournaments();
      } catch (error: unknown) {
        setError(t('pages.tournaments.deleteError'));
        const err = error instanceof Error ? error : new Error(String(error));
        if (import.meta.env.DEV) {
          console.error('Error deleting tournament:', err.message);
        }
      }
    }
  };

  const isPastTournament = (tournament: TournamentDto): boolean => {
    const today = startOfDay(new Date());
    const tournamentEndDate = tournament.endDate
      ? parseISO(tournament.endDate)
      : parseISO(tournament.startDate);
    return isBefore(startOfDay(tournamentEndDate), today);
  };

  const filteredTournaments = useMemo(() => {
    const sorted = [...tournaments].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    if (activeTab === 0) {
      // Future tournaments (default)
      return sorted.filter((tournament) => !isPastTournament(tournament));
    } else {
      // Past tournaments
      return sorted.filter((tournament) => isPastTournament(tournament));
    }
  }, [tournaments, activeTab]);

  if (loading) {
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

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel>{t('pages.tournaments.country', 'Country')}</InputLabel>
          <Select
            label={t('pages.tournaments.country', 'Country')}
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(String(e.target.value))}
          >
            <MenuItem value="">
              <em>{t('common.all', 'All')}</em>
            </MenuItem>
            {countries.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {(c.flagEmoji ? `${c.flagEmoji} ` : '') + c.name} ({c.code})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 240 }}>
          <InputLabel>{t('pages.tournaments.federation', 'Federation')}</InputLabel>
          <Select
            label={t('pages.tournaments.federation', 'Federation')}
            value={user?.club?.federation?.id ?? selectedFederationId ?? ''}
            onChange={(e) => setSelectedFederationId(String(e.target.value) || null)}
            disabled={!!user?.club?.federation?.id}
          >
            <MenuItem value="">
              <em>{t('common.all', 'All')}</em>
            </MenuItem>
            {allFederations.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.name} ({f.shortCode})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
                  image={tournament.banner || defaultBanner}
                  alt={tournament.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {tournament.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {tournament.countryCode && <Chip size="small" label={tournament.countryCode} />}
                    {tournament.federation && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={tournament.federation.shortCode}
                      />
                    )}
                  </Box>
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
                      <em style={{ color: '#999' }}>
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
                  <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Visibility />}
                      component={Link}
                      to={`/${lang}/tournaments/${tournament.id}`}
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
                        >
                          {t('pages.tournaments.apply')}
                        </Button>
                      )}
                    {user &&
                      (canEditTournament(user.role, tournament.createdBy?.id ?? '', user.id) ||
                        canDeleteTournament(user.role)) && (
                        <>
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
                              onClick={() => handleDeleteTournament(tournament.id)}
                            >
                              {t('pages.tournaments.delete')}
                            </Button>
                          )}
                        </>
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
