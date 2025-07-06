import React from 'react';
import {
  TextField,
  Button,
  Box,
  Grid,
  CircularProgress,
} from '@mui/material';
import type { ProfileData } from '../types';

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
  onSave,
  onCancel,
  onChange,
}) => {
  return (
    <div className="profile-edit">
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="First Name"
            name="firstName"
            value={profileData.firstName}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Last Name"
            name="lastName"
            value={profileData.lastName}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
        </Grid>
        
        <Grid item xs={12}>
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
        </Grid>
        
        <Grid item xs={12}>
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
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Location"
            name="location"
            value={profileData.location}
            onChange={onChange}
            fullWidth
            margin="normal"
            placeholder="City, Country"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            label="Website"
            name="website"
            value={profileData.website}
            onChange={onChange}
            fullWidth
            margin="normal"
            placeholder="https://example.com"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            label="Profile Picture URL"
            name="picture"
            value={profileData.picture}
            onChange={onChange}
            fullWidth
            margin="normal"
            placeholder="https://example.com/avatar.jpg"
          />
        </Grid>
      </Grid>

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