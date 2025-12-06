import { TextField, Button, Box, CircularProgress } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import React, { useEffect, useState } from 'react';
import apiService from '../../../services/api';
import { useTranslation } from 'react-i18next';

import type { ProfileData } from '../types';
import type { ClubDto } from '../../../services/types';
import AvatarUploader from '../../../components/AvatarUploader';

interface ProfileEditFormProps {
  profileData: ProfileData;
  isSaving: boolean;
  isAdminView?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoriesChange: (categories: string[]) => void;
  onPictureChange?: (dataUrl: string | null) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileData,
  isSaving,
  isAdminView,
  onSave,
  onCancel,
  onChange,
  onCategoriesChange,
  onPictureChange,
}) => {
  const { t } = useTranslation('common');
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(false);
  const [clubs, setClubs] = useState<ClubDto[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState<boolean>(false);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await apiService.getBowCategories();
        const codes = (data || [])
          .map((c) => c.code)
          .filter((code): code is string => Boolean(code));
        const uniqueCodes = Array.from(new Set(codes.map((c) => c.toUpperCase()))).sort((a, b) => a.localeCompare(b));
        setCategoryOptions(uniqueCodes);
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    const loadClubs = async () => {
      setIsLoadingClubs(true);
      try {
        const data = await apiService.getClubs();
        setClubs(data);
      } catch (e) {
        console.error('Failed to load clubs:', e);
      } finally {
        setIsLoadingClubs(false);
      }
    };

    loadCategories();
    loadClubs();
  }, []);
  
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
      
        <TextField
          label={t('forms.location', 'Location')}
          name="location"
          value={profileData.location}
          onChange={onChange}
          fullWidth
          margin="normal"
          placeholder={t('profile.locationPlaceholder', 'City, Country')}
        />

        <TextField
          label={t('forms.profilePictureUrl', 'Profile Picture URL')}
          name="picture"
          value={profileData.picture}
          onChange={onChange}
          fullWidth
          margin="normal"
          placeholder={t('profile.avatarPlaceholder', 'https://example.com/avatar.jpg')}
        />

        <AvatarUploader
          value={profileData.picture}
          onChange={(dataUrl) => {
            if (onPictureChange) {
              onPictureChange(dataUrl);
            }
          }}
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
              label={t('forms.nationality', 'Nationality')}
              name="nationality"
              value={profileData.nationality || 'Portuguesa'}
              onChange={onChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Portuguesa">Portuguesa</MenuItem>
              <MenuItem value="Outro">Outro</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              select
              label={t('forms.gender', 'Gender')}
              name="gender"
              value={profileData.gender || 'M'}
              onChange={onChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="M">{t('forms.genderMale', 'Male')}</MenuItem>
              <MenuItem value="F">{t('forms.genderFemale', 'Female')}</MenuItem>
              <MenuItem value="Other">{t('forms.genderOther', 'Other')}</MenuItem>
            </TextField>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              select
              label={t('forms.applicationLanguage', 'Application language')}
              name="appLanguage"
              value={profileData.appLanguage || 'pt'}
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
        </Box>

        <TextField
          select
          label={t('forms.club', 'Club')}
          name="clubId"
          value={profileData.clubId || ''}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled={isLoadingClubs}
        >
          <MenuItem value="">
            <em>{t('forms.noClub', 'No Club')}</em>
          </MenuItem>
          {clubs
            .filter((club): club is ClubDto & { id: string } => Boolean(club.id))
            .map((club) => (
              <MenuItem key={club.id} value={club.id}>
                {club.name} {club.location && `(${club.location})`}
              </MenuItem>
            ))}
        </TextField>

        <Autocomplete
          multiple
          options={categoryOptions}
          value={Array.isArray(profileData.categories) ? profileData.categories : []}
          onChange={(_, newValue) => {
            if (Array.isArray(newValue)) {
              onCategoriesChange(newValue);
            }
          }}
          loading={isLoadingCategories}
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

      <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'right' }}>
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
