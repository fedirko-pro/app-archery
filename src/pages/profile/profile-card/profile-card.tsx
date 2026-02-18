import {
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROLE_LABEL_KEYS } from '../../../config/roles';
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

const TableInfoRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <TableRow>
    <TableCell
      component="th"
      scope="row"
      sx={{
        width: '40%',
        color: 'text.secondary',
        fontWeight: 500,
        borderBottom: '1px solid',
        borderColor: 'divider',
        py: 1.5,
      }}
    >
      {label}
    </TableCell>
    <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
      {value != null && value !== '' ? value : '—'}
    </TableCell>
  </TableRow>
);

const ProfileCard: React.FC<ProfileCardProps> = ({
  profileData,
  user,
  isEditing,
  isAdminView = false,
  getFullName,
  getJoinDate: _getJoinDate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const inferredLang = fromI18nLang(getCurrentI18nLang());
  const currentLang = normalizeAppLang(location.pathname.split('/')[1] || inferredLang);
  const { t } = useTranslation('common');

  const clubName = user.club?.name;
  const federationNumber = profileData.federationNumber || user.federationNumber;
  const nationality = profileData.nationality || user.nationality;
  const gender = profileData.gender || user.gender;
  const authProviderLabel =
    user.authProvider === 'google'
      ? t('profile.signedInWithGoogle', 'Signed in with Google')
      : user.authProvider === 'facebook'
        ? t('profile.signedInWithFacebook', 'Signed in with Facebook')
        : t('profile.signedInWithEmail', 'Signed in with email');
  const roleLabel = t(ROLE_LABEL_KEYS[user.role] ?? 'accessControl.roleUser', user.role);

  return (
    <div className="profile-container">
      <Box className="profile-hero" />
      <Box className="profile-info">
        <Box className="profile-avatar-container" sx={{ flexShrink: 0 }}>
          <Avatar
            className="profile-avatar"
            alt={getFullName()}
            src={(() => {
              const pic = profileData.picture || user.picture;
              if (!pic || pic === userIcon || pic.startsWith('data:')) return pic || userIcon;
              const sep = pic.includes('?') ? '&' : '?';
              return `${pic}${sep}t=${user.updatedAt || ''}`;
            })()}
            sx={{ width: 120, height: 120 }}
          />
          <div className="profile-name">
            <div className="title">{getFullName()}</div>
            <div className="subtitle">{profileData.email || user.email}</div>
            <Chip
              label={roleLabel}
              size="small"
              color={user.role === 'general_admin' ? 'primary' : 'default'}
              sx={{ mt: 0.5 }}
            />
          </div>
        </Box>
        {!isEditing ? (
          <Paper variant="outlined" sx={{ mt: 2, width: '100%', overflow: 'hidden' }}>
            <Typography
              variant="subtitle1"
              sx={{ px: 2, pt: 2, pb: 1 }}
              color="text.secondary"
              fontWeight={600}
            >
              {t('profile.accountInfo', 'Account')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  {isAdminView && (
                    <TableInfoRow
                      label={t('accessControl.role', 'Role')}
                      value={roleLabel}
                    />
                  )}
                  <TableInfoRow
                    label={t('profile.signInMethod', 'Sign-in method')}
                    value={authProviderLabel}
                  />
                  <TableInfoRow
                    label={t('profile.joined', 'Joined')}
                    value={
                      user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(getCurrentI18nLang(), {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })
                        : null
                    }
                  />
                </TableBody>
              </Table>
            </TableContainer>

            <Typography
              variant="subtitle1"
              sx={{ px: 2, pt: 2, pb: 1 }}
              color="text.secondary"
              fontWeight={600}
            >
              {t('profile.personalInfo', 'Personal information')}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableBody>
                  <TableInfoRow
                    label={t('profile.federationNumber', 'Federation number')}
                    value={federationNumber}
                  />
                  <TableInfoRow label={t('profile.nationality', 'Nationality')} value={nationality} />
                  <TableInfoRow label={t('profile.gender', 'Gender')} value={gender} />
                  <TableInfoRow label={t('profile.club', 'Club')} value={clubName} />
                  <TableInfoRow
                    label={t('profile.location', 'Location')}
                    value={
                      (profileData.location || user.location) && (
                        <>
                          📍 {profileData.location || user.location}
                        </>
                      )
                    }
                  />
                  <TableInfoRow
                    label={t('profile.bowCategories', 'Favorite categories')}
                    value={
                      Array.isArray(profileData.categories) && profileData.categories.length > 0 ? (
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {profileData.categories.map((cat) => (
                            <Chip key={cat} label={cat} size="small" />
                          ))}
                        </Stack>
                      ) : null
                    }
                  />
                  <TableInfoRow
                    label={t('profile.aboutMe', 'About Me')}
                    value={(profileData.bio || user.bio) as string}
                  />
                </TableBody>
              </Table>
            </TableContainer>

            {!isAdminView && (
              <Box sx={{ p: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/${currentLang}/profile/edit`)}
                >
                {t('profile.editProfile')}
              </Button>
              </Box>
            )}
          </Paper>
        ) : null}
      </Box>
    </div>
  );
};

export default ProfileCard;
