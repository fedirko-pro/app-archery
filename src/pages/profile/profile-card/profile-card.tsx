import { Avatar, Box, Button, Chip, Stack } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import type { User } from '../../../contexts/types';
import userIcon from '../../../img/icons/user.svg';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../../utils/i18n-lang';
import type { ProfileData } from '../types';

interface ProfileCardProps {
  profileData: ProfileData;
  user: User;
  isEditing: boolean;
  isAdminView?: boolean;
  onEditToggle?: () => void;
  getFullName: () => string;
  getJoinDate: () => string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profileData,
  user,
  isEditing,
  isAdminView = false,
  getFullName,
  getJoinDate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(location.pathname.split('/')[1] || inferredLang);
  const { t } = useTranslation('common');

  return (
    <div className="profile-container">
      <Box className="profile-hero" />
      <Box className="profile-info">
        <Box className="profile-avatar-container" sx={{ flexShrink: 0 }}>
          <Avatar
            className="profile-avatar"
            alt={getFullName()}
            src={profileData.picture || user.picture || userIcon}
            sx={{ width: 120, height: 120 }}
          />
          <div className="profile-name">
            <div className="title">{getFullName()}</div>
            <div className="subtitle">{profileData.email || user.email}</div>
          </div>
        </Box>
        {!isEditing ? (
          <div className="profile-details">
            {Array.isArray(profileData.categories) && profileData.categories.length > 0 && (
              <div>
                <div className="label">{t('profile.bowCategories', 'Bow Categories')}</div>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                  {profileData.categories.map((cat) => (
                    <Chip key={cat} className="bow-category" label={cat} sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Stack>
              </div>
            )}
            {profileData.bio && (
              <div className="profile-bio">
                <div className="label">{t('profile.aboutMe', 'About Me')}</div>
                {profileData.bio}
              </div>
            )}
            {profileData.location && (
              <div className="profile-location">
                <div className="label">{t('profile.location', 'Location')}</div>
                📍 {profileData.location}
              </div>
            )}
            <div color="text.secondary">
              {getJoinDate()}
            </div>
            {!isAdminView && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/${currentLang}/profile/edit`)}
                sx={{ mt: 2 }}
              >
                {t('profile.editProfile')}
              </Button>
            )}
          </div>
        ) : null}
      </Box>
    </div>
  );
};

export default ProfileCard;
