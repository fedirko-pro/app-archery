import { TextField, Button, Box, CircularProgress } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import React from 'react';
import { useTranslation } from 'react-i18next';

import type { ProfileData } from '../types';

interface ProfileEditFormProps {
  profileData: ProfileData;
  isSaving: boolean;
  isAdminView?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoriesChange: (categories: string[]) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileData,
  isSaving,
  isAdminView,
  onSave,
  onCancel,
  onChange,
  onCategoriesChange,
}) => {
  const { t } = useTranslation('common');
  const CATEGORY_OPTIONS = [
    'HLB',
    'TRB',
    'BB',
    'LB',
    'CU',
    'TR',
    'OL',
    'INSTINCTIVE',
    'TRAD',
    'HUNTER',
    'JUNIOR',
    'SENIOR',
  ];
  return (
    <div className="profile-edit">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label={t('forms.firstName')}
              name="firstName"
              value={profileData.firstName}
              onChange={onChange}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label={t('forms.lastName')}
              name="lastName"
              value={profileData.lastName}
              onChange={onChange}
              fullWidth
              margin="normal"
            />
          </Box>
        </Box>

        <TextField
          label={t('forms.email')}
          name="email"
          value={profileData.email}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled
          helperText={t('profile.emailImmutable', 'Email cannot be changed')}
        />

        <TextField
          label={t('forms.bio', 'Bio')}
          name="bio"
          value={profileData.bio}
          onChange={onChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          placeholder={t('profile.bioPlaceholder', 'Tell us about yourself...')}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label={t('forms.location', 'Location')}
              name="location"
              value={profileData.location}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder={t('profile.locationPlaceholder', 'City, Country')}
            />
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label={t('forms.website', 'Website')}
              name="website"
              value={profileData.website}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder={t('profile.websitePlaceholder', 'https://example.com')}
            />
          </Box>
        </Box>

        <TextField
          label={t('forms.profilePictureUrl', 'Profile Picture URL')}
          name="picture"
          value={profileData.picture}
          onChange={onChange}
          fullWidth
          margin="normal"
          placeholder={t('profile.avatarPlaceholder', 'https://example.com/avatar.jpg')}
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label={t('forms.federationNumber', 'Federation Number')}
              name="federationNumber"
              value={profileData.federationNumber || ''}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder={t('profile.fedNumberPlaceholder', 'Enter your federation number')}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              select
              label={t('forms.language', 'Language')}
              name="language"
              value={profileData.language || 'pt'}
              onChange={onChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="pt">Português (PT)</MenuItem>
              <MenuItem value="en">English (EN)</MenuItem>
              <MenuItem value="it">Italiano (IT)</MenuItem>
              <MenuItem value="es">Español (ES)</MenuItem>
              <MenuItem value="ua">Українська (UA)</MenuItem>
            </TextField>
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Autocomplete
              multiple
              options={CATEGORY_OPTIONS}
              value={Array.isArray(profileData.categories) ? profileData.categories : []}
              onChange={(_, newValue) => {
                if (Array.isArray(newValue)) {
                  onCategoriesChange(newValue);
                }
              }}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => {
                  const { key, ...otherProps } = getTagProps({ index });
                  return (
                    <Chip
                      key={key}
                      variant="outlined"
                      label={option}
                      {...otherProps}
                    />
                  );
                })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label={t('forms.categories', 'Categories')}
                  placeholder={t('forms.selectCategories', 'Select categories')}
                />
              )}
              filterSelectedOptions
            />
          </Box>
        </Box>

        {isAdminView && (
          <TextField
            select
            label={t('forms.role', 'Role')}
            name="role"
            value={profileData.role || 'user'}
            onChange={onChange}
            fullWidth
            margin="normal"
            helperText={t('profile.changeUserRole', "Change the user's role")}
          >
            <MenuItem value="user">{t('role.user', 'User')}</MenuItem>
            <MenuItem value="admin">{t('role.admin', 'Admin')}</MenuItem>
          </TextField>
        )}
      </Box>

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('common.cancel')}
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? t('profile.saving', 'Saving...') : t('profile.saveProfile', 'Save Profile')}
        </Button>
      </Box>
    </div>
  );
};

export default ProfileEditForm;
