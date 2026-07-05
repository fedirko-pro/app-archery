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

import { useNotification } from '../../contexts/error-feedback-context';
import apiService from '../../services/api';
import type { ClubMembershipDto } from '../../services/types';

const MyClub: React.FC = () => {
  const { t } = useTranslation('common');
  const { showSuccess, showError } = useNotification();
  const [memberships, setMemberships] = useState<ClubMembershipDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMyClubMemberships();
      setMemberships(data || []);
    } catch (error) {
      console.error('Failed to load memberships:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMemberships();
  }, [fetchMemberships]);

  const handleApprove = async (membershipId: string) => {
    try {
      await apiService.approveClubMembership(membershipId);
      showSuccess(t('pages.myClub.memberApproved', 'Member approved'));
      void fetchMemberships();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.approveError', 'Failed to approve member'),
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
      void fetchMemberships();
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : t('pages.myClub.removeError', 'Failed to remove member'),
      );
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    const adminClub = memberships.find((m) => m.role === 'admin' && m.status === 'approved');
    if (!adminClub) return;

    try {
      setInviting(true);
      await apiService.inviteClubMember(adminClub.club.id!, inviteEmail.trim());
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

  const adminMembership = memberships.find((m) => m.role === 'admin' && m.status === 'approved');
  const club = adminMembership?.club;
  const pendingMembers = memberships.filter((m) => m.status === 'pending');
  const approvedMembers = memberships.filter((m) => m.status === 'approved');

  if (!club) {
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {t('pages.myClub.title', 'My Club')} — {club.name}
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('pages.myClub.pendingRequests', 'Pending Requests')} ({pendingMembers.length})
          </Typography>
          {pendingMembers.length === 0 ? (
            <Typography color="text.secondary">
              {t('pages.myClub.noPending', 'No pending requests')}
            </Typography>
          ) : (
            <List>
              {pendingMembers.map((m) => (
                <ListItem
                  key={m.id}
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" color="primary" onClick={() => handleApprove(m.id)}>
                        <CheckIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleRemove(m.id)}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      `${m.user.firstName || ''} ${m.user.lastName || ''}`.trim() || m.user.email
                    }
                    secondary={m.user.email}
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
                    <IconButton size="small" color="error" onClick={() => handleRemove(m.id)}>
                      <DeleteIcon />
                    </IconButton>
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
