import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { User } from '../../contexts/types';
import apiService from '../../services/api';
import type { BowCategory, DivisionDto } from '../../services/types';

export interface AdminApplyUserDialogProps {
  open: boolean;
  tournamentId: string;
  tournamentTitle: string;
  tournamentRuleCode?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminApplyUserDialog: React.FC<AdminApplyUserDialogProps> = ({
  open,
  tournamentId,
  tournamentTitle,
  tournamentRuleCode,
  onClose,
  onSuccess,
}) => {
  const { t } = useTranslation('common');

  // Users for autocomplete
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Categories and divisions
  const [categories, setCategories] = useState<BowCategory[]>([]);
  const [divisions, setDivisions] = useState<DivisionDto[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Form data
  const [division, setDivision] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      loadUsers();
      loadOptions();
    }
  }, [open, tournamentRuleCode]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const allUsers = await apiService.getAllUsers();
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const [categoriesData, divisionsData] = await Promise.all([
        tournamentRuleCode
          ? apiService.getBowCategoriesByRule(tournamentRuleCode)
          : apiService.getBowCategories(),
        tournamentRuleCode
          ? apiService.getDivisionsByRule(tournamentRuleCode)
          : apiService.getDivisions(),
      ]);
      setCategories(categoriesData);

      // Remove duplicates by id
      const uniqueDivisions = Array.from(
        new Map(divisionsData.map((d) => [d.id, d])).values(),
      );
      setDivisions(uniqueDivisions);
    } catch (err) {
      console.error('Failed to load options:', err);
      setCategories([]);
      setDivisions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      setError(t('admin.applyUser.selectUserRequired', 'Please select a user'));
      return;
    }

    if (!division) {
      setError(
        t('admin.applyUser.divisionRequired', 'Please select a division'),
      );
      return;
    }

    if (!category) {
      setError(
        t('admin.applyUser.categoryRequired', 'Please select a bow category'),
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await apiService.adminCreateTournamentApplication({
        tournamentId,
        userId: selectedUser.id,
        division,
        category,
        notes: notes.trim() || undefined,
      });

      onSuccess();
      handleClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t('admin.applyUser.submitError', 'Failed to submit application'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedUser(null);
    setDivision('');
    setCategory('');
    setNotes('');
    setError(null);
    onClose();
  };

  const getUserDisplayName = (user: User): string => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name ? `${name} (${user.email})` : user.email;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {t('admin.applyUser.title', 'Apply User to Tournament')}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          {error && (
            <Box sx={{ color: 'error.main', mb: 1 }}>{error}</Box>
          )}

          <Box sx={{ mb: 1 }}>
            <strong>{t('admin.applyUser.tournament', 'Tournament')}:</strong>{' '}
            {tournamentTitle}
          </Box>

          {/* User search autocomplete */}
          <Autocomplete
            options={users}
            loading={loadingUsers}
            value={selectedUser}
            onChange={(_, newValue) => setSelectedUser(newValue)}
            getOptionLabel={getUserDisplayName}
            filterOptions={(options, { inputValue }) => {
              const lowercaseInput = inputValue.toLowerCase();
              return options.filter(
                (user) =>
                  user.email.toLowerCase().includes(lowercaseInput) ||
                  (user.firstName || '')
                    .toLowerCase()
                    .includes(lowercaseInput) ||
                  (user.lastName || '').toLowerCase().includes(lowercaseInput),
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('admin.applyUser.selectUser', 'Select User')}
                placeholder={t(
                  'admin.applyUser.searchPlaceholder',
                  'Search by name or email...',
                )}
                required
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingUsers ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            renderOption={(props, user) => (
              <li {...props} key={user.id}>
                <Box>
                  <Box sx={{ fontWeight: 500 }}>
                    {user.firstName} {user.lastName}
                  </Box>
                  <Box sx={{ fontSize: '0.85em', color: 'text.secondary' }}>
                    {user.email}
                  </Box>
                </Box>
              </li>
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />

          {/* Division select */}
          <FormControl fullWidth required disabled={loadingOptions}>
            <InputLabel>
              {t('pages.applicationForm.division', 'Division')}
            </InputLabel>
            <Select
              value={division}
              label={t('pages.applicationForm.division', 'Division')}
              onChange={(e) => setDivision(e.target.value)}
            >
              {divisions.map((div) => (
                <MenuItem key={div.id} value={div.id}>
                  {div.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Category select */}
          <FormControl fullWidth required disabled={loadingOptions}>
            <InputLabel>
              {t('pages.applicationForm.category', 'Bow Category')}
            </InputLabel>
            <Select
              value={category}
              label={t('pages.applicationForm.category', 'Bow Category')}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.code} value={cat.code}>
                  {cat.code} - {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Notes */}
          <TextField
            fullWidth
            label={t('pages.applicationForm.notes', 'Notes')}
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t(
              'admin.applyUser.notesPlaceholder',
              'Additional notes (optional)...',
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !selectedUser}
          startIcon={submitting ? <CircularProgress size={16} /> : null}
        >
          {submitting
            ? t('admin.applyUser.submitting', 'Submitting...')
            : t('admin.applyUser.submit', 'Submit Application')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminApplyUserDialog;
