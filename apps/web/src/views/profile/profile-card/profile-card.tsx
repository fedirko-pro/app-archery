import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';

import { getCountryName } from '../../../config/countries';
import { ROLE_LABEL_KEYS } from '../../../config/roles';
import type { User } from '../../../contexts/types';
import apiService from '../../../services/api';
import type { ClubMembershipDto } from '../../../services/types';
import { fromI18nLang, getCurrentI18nLang, normalizeAppLang } from '../../../utils/i18n-lang';
import {
  resolveUserAvatarWithCacheBust,
  getAvatarInitials,
} from '../../../utils/placeholder-images';
import { getOrigin } from '../../../utils/user-display';
import type { ProfileData } from '../types';
import PrivacyAwareShareMenu from '@/components/share/PrivacyAwareShareMenu';

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
  const [clubMemberships, setClubMemberships] = useState<ClubMembershipDto[]>([]);

  useEffect(() => {
    const loadMemberships = async () => {
      try {
        const data = await apiService.getMyClubMemberships();
        setClubMemberships(data || []);
      } catch {
        // Silently fail - memberships are optional display
      }
    };
    if (user) {
      void loadMemberships();
    }
  }, [user]);

  const handleLeaveClub = useCallback(
    async (membershipId: string) => {
      if (
        !window.confirm(t('profile.confirmLeaveClub', 'Are you sure you want to leave this club?'))
      ) {
        return;
      }
      try {
        await apiService.removeClubMembership(membershipId);
        setClubMemberships((prev) => prev.filter((m) => m.id !== membershipId));
      } catch (error) {
        console.error('Failed to leave club:', error);
      }
    },
    [t],
  );

  const clubName = user.club?.name;
  const federationNumber = profileData.federationNumber || user.federationNumber;
  const gender = profileData.gender || user.gender;
  const authProviderLabel =
    user.authProvider === 'google'
      ? t('profile.signedInWithGoogle', 'Signed in with Google')
      : user.authProvider === 'facebook'
        ? t('profile.signedInWithFacebook', 'Signed in with Facebook')
        : t('profile.signedInWithEmail', 'Signed in with email');
  const roleLabel = t(ROLE_LABEL_KEYS[user.role] ?? 'accessControl.roleUser', user.role);
  const avatarSrc = resolveUserAvatarWithCacheBust(
    profileData.picture || user.picture,
    user.updatedAt,
  );

  return (
    <div className="profile-container">
      <Box className="profile-hero" />
      <Box className="profile-info">
        <Box className="profile-avatar-container" sx={{ flexShrink: 0 }}>
          <Avatar
            className="profile-avatar"
            alt={getFullName()}
            src={avatarSrc}
            imgProps={{ referrerPolicy: 'no-referrer' }}
            sx={{ width: 120, height: 120 }}
          >
            {!avatarSrc ? getAvatarInitials(user.firstName, user.lastName) : null}
          </Avatar>
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
                    <TableInfoRow label={t('accessControl.role', 'Role')} value={roleLabel} />
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
                  <TableInfoRow label={t('profile.gender', 'Gender')} value={gender} />
                  <TableInfoRow
                    label={t('profile.clubs', 'Clubs')}
                    value={
                      clubMemberships.length > 0 ? (
                        <Stack direction="column" spacing={0.5}>
                          {clubMemberships.map((m) => (
                            <Box
                              key={m.id}
                              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                            >
                              {m.status === 'approved' && !m.isCustom && (
                                <Tooltip
                                  title={t('profile.verifiedClubMember', 'Verified club member')}
                                >
                                  <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                                </Tooltip>
                              )}
                              {m.status === 'pending' && (
                                <Tooltip
                                  title={t('profile.pendingInvitation', 'Invitation pending')}
                                >
                                  <HourglassEmptyIcon
                                    sx={{ fontSize: 16, color: 'warning.main' }}
                                  />
                                </Tooltip>
                              )}
                              {m.isCustom && (
                                <Tooltip title={t('profile.unverifiedClub', 'Unverified')}>
                                  <HelpOutlineIcon sx={{ fontSize: 16, color: 'grey.500' }} />
                                </Tooltip>
                              )}
                              <Typography variant="body2">
                                {m.isCustom ? m.customName : m.club?.name}
                                {m.status === 'pending' && (
                                  <Typography
                                    component="span"
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ ml: 0.5 }}
                                  >
                                    ({t('profile.pending', 'pending')})
                                  </Typography>
                                )}
                              </Typography>
                              {(m.status === 'approved' || m.isCustom) && (
                                <Tooltip title={t('profile.leaveClub', 'Leave club')}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleLeaveClub(m.id)}
                                    sx={{ ml: 'auto' }}
                                  >
                                    <ExitToAppIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        clubName || null
                      )
                    }
                  />
                  <TableInfoRow
                    label={t('profile.location', 'Location')}
                    value={
                      (profileData.location || user.location) && (
                        <>📍 {profileData.location || user.location}</>
                      )
                    }
                  />
                  <TableInfoRow
                    label={t('forms.country', 'Country')}
                    value={getCountryName(profileData.country || user.country)}
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
                    label={t('profile.preferredDivision', 'Preferred division')}
                    value={user.division?.name || profileData.divisionId}
                  />
                  <TableInfoRow
                    label={t('profile.aboutMe', 'About Me')}
                    value={(profileData.bio || user.bio) as string}
                  />
                </TableBody>
              </Table>
            </TableContainer>

            {!isAdminView && (
              <Box sx={{ p: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/${currentLang}/profile/edit`)}
                >
                  {t('profile.editProfile')}
                </Button>
                <PrivacyAwareShareMenu
                  url={`${getOrigin()}/${currentLang}/archers/${user.id}`}
                  title={getFullName()}
                  text={profileData.bio || user.bio}
                  imageUrl={avatarSrc}
                  buttonLabel={t('pages.tournaments.share', 'Share')}
                  size="medium"
                />
              </Box>
            )}
          </Paper>
        ) : null}
      </Box>
    </div>
  );
};

export default ProfileCard;
