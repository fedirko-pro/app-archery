import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Avatar,
  Grid,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import apiService from '../../../services/api';
import type { User } from '../../../contexts/types';
import '../../profile/profile.scss';

const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    picture: '',
    role: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allUsers = await apiService.getAllUsers();
      const foundUser = allUsers.find(u => u.id === userId);
      
      if (!foundUser) {
        setError('User not found');
        return;
      }
      
      setUser(foundUser);
      setFormData({
        firstName: foundUser.firstName || '',
        lastName: foundUser.lastName || '',
        email: foundUser.email || '',
        bio: foundUser.bio || '',
        location: foundUser.location || '',
        website: foundUser.website || '',
        picture: foundUser.picture || '',
        role: foundUser.role || 'user',
      });
    } catch (error) {
      setError('Failed to fetch user data');
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updatedUser = await apiService.adminUpdateUser(user.id, formData);
      setSuccess('User updated successfully!');
      setUser(updatedUser);
      
      setTimeout(() => {
        navigate(`/admin/users/${userId}/profile`);
      }, 2000);
    } catch (error) {
      setError('Failed to update user. Please try again.');
      console.error('Error updating user:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/users/${userId}/profile`);
  };

  const handleBack = () => {
    navigate('/admin');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Admin Panel
        </Button>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Admin Panel
        </Button>
        <Alert severity="error">User not found</Alert>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          maxWidth: '900px',
          margin: '32px auto 0 auto',
          width: '100%',
          px: 2
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ minWidth: 0 }}
        >
          Back to Admin Panel
        </Button>
      </Box>
      <div className="profile-container">
        <Box className="profile-hero" />
        <Grid container className="profile-info">
          <Grid item xs={12} sm={4} className="profile-avatar-container">
            <Avatar
              className="profile-avatar"
              alt="User Avatar"
              src={formData.picture || user.picture}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}
            <div className="profile-edit">
              <TextField
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                type="email"
              />
              <TextField
                label="Bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
                placeholder="Tell us about this user..."
              />
              <TextField
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="City, Country"
              />
              <TextField
                label="Website"
                name="website"
                value={formData.website}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com"
              />
              <TextField
                label="Profile Picture URL"
                name="picture"
                value={formData.picture}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="https://example.com/avatar.jpg"
              />
              <TextField
                select
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                fullWidth
                margin="normal"
                SelectProps={{ native: true }}
                helperText="Change the user's role"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </TextField>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : 'Save Changes'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </Box>
            </div>
          </Grid>
        </Grid>
      </div>
    </>
  );
};

export default UserEdit; 