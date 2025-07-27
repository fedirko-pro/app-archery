import React from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import type { ProfileData } from '../types';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';

interface ProfileEditFormProps {
  profileData: ProfileData;
  isSaving: boolean;
  isAdminView?: boolean;
  onSave: () => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profileData,
  isSaving,
  isAdminView,
  onSave,
  onCancel,
  onChange,
}) => {
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
              label="First Name"
              name="firstName"
              value={profileData.firstName}
              onChange={onChange}
              fullWidth
              margin="normal"
            />
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label="Last Name"
              name="lastName"
              value={profileData.lastName}
              onChange={onChange}
              fullWidth
              margin="normal"
            />
          </Box>
        </Box>

        <TextField
          label="Email"
          name="email"
          value={profileData.email}
          onChange={onChange}
          fullWidth
          margin="normal"
          disabled
          helperText="Email cannot be changed"
        />

        <TextField
          label="Bio"
          name="bio"
          value={profileData.bio}
          onChange={onChange}
          fullWidth
          multiline
          rows={3}
          margin="normal"
          placeholder="Tell us about yourself..."
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label="Location"
              name="location"
              value={profileData.location}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder="City, Country"
            />
          </Box>

          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label="Website"
              name="website"
              value={profileData.website}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder="https://example.com"
            />
          </Box>
        </Box>

        <TextField
          label="Profile Picture URL"
          name="picture"
          value={profileData.picture}
          onChange={onChange}
          fullWidth
          margin="normal"
          placeholder="https://example.com/avatar.jpg"
        />

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px' }}>
            <TextField
              label="Federation Number"
              name="federationNumber"
              value={profileData.federationNumber || ''}
              onChange={onChange}
              fullWidth
              margin="normal"
              placeholder="Enter your federation number"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px' }}>
            <Autocomplete
              multiple
              options={CATEGORY_OPTIONS}
              value={profileData.categories || []}
              onChange={(newValue) => {
                onChange({
                  target: {
                    name: 'categories',
                    value: newValue,
                  },
                } as any);
              }}
              renderTags={(value: string[], getTagProps) =>
                value.map((option: string, index: number) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Categories"
                  placeholder="Select categories"
                />
              )}
              filterSelectedOptions
            />
          </Box>
        </Box>

        {isAdminView && (
          <TextField
            select
            label="Role"
            name="role"
            value={profileData.role || 'user'}
            onChange={onChange}
            fullWidth
            margin="normal"
            SelectProps={{ native: true }}
            helperText="Change the user's role"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
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
          Cancel
        </Button>

        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : null}
        >
          {isSaving ? 'Saving...' : 'Save Profile'}
        </Button>
      </Box>
    </div>
  );
};

export default ProfileEditForm;
