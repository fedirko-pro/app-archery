import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';
import type { ClubDto, ClubJoinRequestDto, ClubMembershipDto } from '../../services/types';

const MyClub: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const { showSuccess, showError } = useNotification();
  const [adminClub, setAdminClub] = useState<ClubDto | null>(null);
  const [members, setMembers] = useState<ClubMembershipDto[]>([]);
  const [joinRequests, setJoinRequests] = useState<ClubJoinRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchClubData = useCallback(async () => {
    try {
      setLoading(true);
      const club = await apiService.getMyAdminClub();
      setAdminClub(club);

      if (!club?.id) {
        setMembers([]);
        setJoinRequests([]);
        return;
      }

      const [memberData, requestData] = await Promise.all([
        apiService.getClubMembers(club.id),
        apiService.getClubJoinRequests(club.id),
      ]);
      setMembers(memberData || []);
      setJoinRequests((requestData || []).filter((r) => r.status === 'pending'));
    } catch (error) {
      console.error('Failed to load club admin data:', error);
      setAdminClub(null);
      setMembers([]);
      setJoinRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchClubData();
  }, [fetchClubData]);

  const handleApproveJoinRequest = async (requestId: string) => {
    try {
      await apiService.approveClubJoinRequest(requestId);
      showSuccess(t('pages.myClub.joinRequestApproved', 'Join request approved'));
      void fetchClubData();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.joinRequestApproveError', 'Failed to approve join request'),
      );
    }
  };

  const handleRejectJoinRequest = async (requestId: string) => {
    try {
      await apiService.rejectClubJoinRequest(requestId);
      showSuccess(t('pages.myClub.joinRequestRejected', 'Join request rejected'));
      void fetchClubData();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.joinRequestRejectError', 'Failed to reject join request'),
      );
    }
  };

  const handleRemove = async (membershipId: string) => {
    if (
      !window.confirm(
        t('pages.myClub.confirmRemove', 'Are you sure you want to remove this member?'),
      )
    ) {
      return;
    }
    try {
      await apiService.removeClubMembership(membershipId);
      showSuccess(t('pages.myClub.memberRemoved', 'Member removed'));
      void fetchClubData();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.removeError', 'Failed to remove member'),
      );
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !adminClub?.id) return;

    try {
      setInviting(true);
      await apiService.inviteClubMember(adminClub.id, inviteEmail.trim());
      showSuccess(t('pages.myClub.inviteSent', 'Invitation sent'));
      setInviteEmail('');
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.inviteError', 'Failed to send invitation'),
      );
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!adminClub) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {t('pages.myClub.title', 'My Club')}
        </Typography>
        <Alert severity="info">
          {t(
            'pages.myClub.noClub',
            'You are not a club admin. Contact a general admin to get the club_admin role.',
          )}
        </Alert>
      </Box>
    );
  }

  const approvedMembers = members.filter((m) => m.status === 'approved');

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('pages.myClub.title', 'My Club')} — {adminClub.name}
      </Typography>

      <Button component={Link} to={`/${lang}/my-club/edit`} variant="outlined" sx={{ mb: 3 }}>
        {t('pages.myClub.editClubProfile', 'Edit club profile')}
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pages.myClub.joinRequests', 'Join Requests')} ({joinRequests.length})
          </Typography>
          {joinRequests.length === 0 ? (
            <Typography color="text.secondary">
              {t('pages.myClub.noJoinRequests', 'No pending join requests')}
            </Typography>
          ) : (
            <List>
              {joinRequests.map((request) => (
                <ListItem
                  key={request.id}
                  alignItems="flex-start"
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleApproveJoinRequest(request.id)}
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRejectJoinRequest(request.id)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={request.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" display="block">
                          {request.email}
                        </Typography>
                        {request.message && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {request.message}
                          </Typography>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pages.myClub.members', 'Members')} ({approvedMembers.length})
          </Typography>
          {approvedMembers.length === 0 ? (
            <Typography color="text.secondary">
              {t('pages.myClub.noMembers', 'No members yet')}
            </Typography>
          ) : (
            <List>
              {approvedMembers.map((m) => (
                <ListItem
                  key={m.id}
                  secondaryAction={
                    m.role !== 'admin' ? (
                      <IconButton size="small" color="error" onClick={() => handleRemove(m.id)}>
                        <DeleteIcon />
                      </IconButton>
                    ) : undefined
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {`${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() ||
                          m.user.email}
                        {m.role === 'admin' && <Chip label="Admin" size="small" color="primary" />}
                      </Box>
                    }
                    secondary={m.user.email}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pages.myClub.inviteMember', 'Invite Member')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              size="small"
              type="email"
              placeholder={t('pages.myClub.emailPlaceholder', 'Email address')}
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail.trim()}
            >
              {inviting
                ? t('common.sending', 'Sending...')
                : t('pages.myClub.sendInvite', 'Send Invitation')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MyClub;
