import { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Box, Grid
} from '@mui/material';
import './settings.scss'; // Import the SCSS file

const Settings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'Robin Hood',
    username: '@robinhood',
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    location: 'New York, USA',
    website: 'https://example.com',
    joinDate: 'Joined January 2020',
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="profile-container">
      {/* Background Banner */}
      <Box className="profile-hero" />

      {/* Profile Info */}
      <Grid container className="profile-info">
        <Grid item xs={12} sm={4} className="profile-avatar-container">
          <Avatar
            className="profile-avatar"
            alt="Profile Avatar"
            src="https://via.placeholder.com/150/2" // Replace with actual avatar URL
          />
        </Grid>

        <Grid item xs={12} sm={8}>
          {!isEditing ? (
            <div className="profile-details">
              <Typography variant="h4">{profileData.name}</Typography>
              <Typography variant="subtitle1">
                {profileData.username}
              </Typography>
              <Typography variant="body1" className="profile-bio">
                {profileData.bio}
              </Typography>
              <Typography variant="body2">{profileData.location}</Typography>
              <Typography variant="body2">
                <a href={profileData.website}>{profileData.website}</a>
              </Typography>
              <Typography variant="body2">{profileData.joinDate}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <div className="profile-edit">
              <TextField
                label="Name"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Username"
                name="username"
                value={profileData.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Bio"
                name="bio"
                value={profileData.bio}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                margin="normal"
              />
              <TextField
                label="Location"
                name="location"
                value={profileData.location}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <TextField
                label="Website"
                name="website"
                value={profileData.website}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditToggle}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleEditToggle}
              >
                Cancel
              </Button>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Settings;
