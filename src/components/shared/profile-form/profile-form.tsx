import { Save, Cancel } from '@mui/icons-material';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  Card,
  CardHeader,
  CardContent,
  Avatar,
  Typography,
  Divider,
} from '@mui/material';
import React from 'react';

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  website: string;
  picture: string;
}

interface ProfileFormProps {
  formData: ProfileFormData;
  isSaving: boolean;
  isAdminView?: boolean;
  userRole?: string;
  userAuthProvider?: string;
  onSave: () => void;
  onCancel: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  title?: string;
  showEmailField?: boolean;
  emailDisabled?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  isSaving,
  isAdminView = false,
  userRole,
  userAuthProvider,
  onSave,
  onCancel,
  onChange,
  title,
  showEmailField = true,
  emailDisabled = false,
}) => {
  const displayName =
    formData.firstName && formData.lastName
      ? `${formData.firstName} ${formData.lastName}`
      : formData.email || 'User';

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <TextField
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
        </Box>

        <Box sx={{ flex: '1 1 300px' }}>
          <TextField
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            fullWidth
            margin="normal"
          />
        </Box>
      </Box>

      {showEmailField && (
        <TextField
          label="Email"
          name="email"
          value={formData.email}
          onChange={onChange}
          fullWidth
          margin="normal"
          type="email"
          disabled={emailDisabled}
          helperText={emailDisabled ? 'Email cannot be changed' : undefined}
        />
      )}

      <TextField
        label="Bio"
        name="bio"
        value={formData.bio}
        onChange={onChange}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        placeholder={
          isAdminView
            ? 'Tell us about this user...'
            : 'Tell us about yourself...'
        }
      />

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <TextField
            label="Location"
            name="location"
            value={formData.location}
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
            value={formData.website}
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
        value={formData.picture}
        onChange={onChange}
        fullWidth
        margin="normal"
        placeholder="https://example.com/avatar.jpg"
      />
    </Box>
  );

  const actionButtons = (
    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isSaving}
        startIcon={<Cancel />}
      >
        Cancel
      </Button>

      <Button
        variant="contained"
        onClick={onSave}
        disabled={isSaving}
        startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
      >
        {isSaving ? 'Saving...' : isAdminView ? 'Save Changes' : 'Save Profile'}
      </Button>
    </Box>
  );

  // Якщо це адмінський вигляд, показуємо в Card з заголовком
  if (isAdminView) {
    return (
      <Card>
        <CardHeader
          avatar={
            <Avatar
              src={formData.picture}
              alt="User Avatar"
              sx={{ width: 60, height: 60 }}
            />
          }
          title={displayName}
          subheader={
            userRole && userAuthProvider
              ? `Role: ${userRole} | Provider: ${userAuthProvider}`
              : undefined
          }
        />

        <CardContent>
          {formContent}

          <Divider sx={{ my: 3 }} />

          {actionButtons}
        </CardContent>
      </Card>
    );
  }

  // Для звичайного користувача показуємо просту форму
  return (
    <div className="profile-edit">
      {title && (
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
      )}

      {formContent}

      <Box sx={{ mt: 2 }}>{actionButtons}</Box>
    </div>
  );
};

export default ProfileForm;
