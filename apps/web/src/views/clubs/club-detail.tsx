import ArrowBack from '@mui/icons-material/ArrowBack';
import Email from '@mui/icons-material/Email';
import LinkIcon from '@mui/icons-material/Link';
import LocationOn from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import Person from '@mui/icons-material/Person';
import Phone from '@mui/icons-material/Phone';
import Send from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

import ShareMenu from '../../components/share/ShareMenu';
import { getCountryName } from '../../config/countries';
import apiService from '../../services/api';
import type { ClubDto } from '../../services/types';
import { LOCAL_CLUB_LOGO, resolveClubLogo } from '../../utils/placeholder-images';
import ClubJoinDialog from './club-join-dialog';

const ClubDetail: React.FC = () => {
  const { clubId, lang } = useParams<{ clubId: string; lang: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const [club, setClub] = useState<ClubDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;
      try {
        setLoading(true);
        const data = await apiService.getClubById(clubId);
        if (!data) {
          setNotFound(true);
          return;
        }
        setClub(data);
      } catch (error) {
        console.error('Failed to fetch club:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchClub();
  }, [clubId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (notFound || !club) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Alert severity="error">{t('pages.clubs.notFound', 'Club not found')}</Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/${lang}/clubs`)} sx={{ mt: 2 }}>
          {t('pages.clubs.backToList', 'Back to clubs')}
        </Button>
      </Box>
    );
  }

  const isPrivate = club.visibility === 'private';
  const shareUrl = `${window.location.origin}/${lang}/clubs/${club.id}`;
  const shareTitle = isPrivate ? t('pages.clubs.privateClub', 'Private Club') : club.name;
  const shareText = isPrivate
    ? t('pages.clubs.contactAdmin', 'Contact club admin for access')
    : club.description;
  const publicLinks = (club.links || []).filter((link) => link.label && link.url);

  return (
    <section>
      <div className="container">
        <Button startIcon={<ArrowBack />} onClick={() => navigate(`/${lang}/clubs`)} sx={{ mb: 2 }}>
          {t('pages.clubs.backToList', 'Back to clubs')}
        </Button>

        <Card sx={{ maxWidth: 900, mx: 'auto' }}>
          <Box
            sx={{
              height: 300,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              p: 2,
            }}
          >
            {isPrivate ? (
              <LockIcon sx={{ fontSize: 96, color: 'grey.400' }} />
            ) : (
              <CardMedia
                component="img"
                image={resolveClubLogo(club.clubLogo)}
                alt={club.name}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LOCAL_CLUB_LOGO;
                }}
              />
            )}
          </Box>
          <CardContent>
            <Typography variant="h4" gutterBottom>
              {isPrivate ? (
                <>
                  <LockIcon sx={{ fontSize: 28, verticalAlign: 'middle', mr: 1 }} />
                  {t('pages.clubs.privateClub', 'Private Club')}
                </>
              ) : (
                club.name
              )}
              {club.shortCode && !isPrivate && (
                <Typography
                  component="span"
                  variant="h6"
                  color="text.secondary"
                  sx={{ ml: 1, fontWeight: 500 }}
                >
                  ({club.shortCode})
                </Typography>
              )}
            </Typography>

            {(club.city || club.country) && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
                <LocationOn fontSize="small" color="action" />
                <Typography variant="body1" color="text.secondary">
                  {[club.city, club.country ? getCountryName(club.country) : null]
                    .filter(Boolean)
                    .join(', ')}
                </Typography>
              </Box>
            )}

            {club.description && !isPrivate && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {club.description}
              </Typography>
            )}

            {isPrivate && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {t('pages.clubs.contactAdmin', 'Contact club admin for access')}
              </Typography>
            )}

            {!isPrivate && (club.contactPerson || club.contactEmail || club.contactPhone) && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  {t('pages.clubs.contacts', 'Contacts')}
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {club.contactPerson && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Person fontSize="small" color="action" />
                      <Typography variant="body1">{club.contactPerson}</Typography>
                    </Box>
                  )}
                  {club.contactEmail && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Link href={`mailto:${club.contactEmail}`}>{club.contactEmail}</Link>
                    </Box>
                  )}
                  {club.contactPhone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Link href={`tel:${club.contactPhone}`}>{club.contactPhone}</Link>
                    </Box>
                  )}
                </Stack>
              </>
            )}

            {!isPrivate && club.address && (
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <LocationOn fontSize="small" color="action" sx={{ mt: 0.3 }} />
                <Typography variant="body1">{club.address}</Typography>
              </Box>
            )}

            {!isPrivate && publicLinks.length > 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t('pages.clubs.links', 'Links')}
                </Typography>
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {publicLinks.map((link) => (
                    <Box key={`${link.label}-${link.url}`} sx={{ display: 'flex', gap: 1 }}>
                      <LinkIcon fontSize="small" color="action" sx={{ mt: 0.3 }} />
                      <Link href={link.url} target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </Link>
                    </Box>
                  ))}
                </Stack>
              </>
            )}

            {!isPrivate && club.otherInfo && (
              <>
                <Typography variant="h6" gutterBottom>
                  {t('pages.clubs.otherInfo', 'Other information')}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ whiteSpace: 'pre-wrap' }}
                >
                  {club.otherInfo}
                </Typography>
              </>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ShareMenu
                  url={shareUrl}
                  title={shareTitle}
                  text={shareText}
                  imageUrl={!isPrivate ? resolveClubLogo(club.clubLogo) : undefined}
                  fullWidth
                  sx={{ justifyContent: 'center' }}
                />
              </Box>
              {!isPrivate && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  onClick={() => setJoinDialogOpen(true)}
                  sx={{ flex: 1, minWidth: 0, justifyContent: 'center' }}
                >
                  {t('pages.clubs.joinClub', 'Join club')}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {!isPrivate && club.id && (
          <ClubJoinDialog
            open={joinDialogOpen}
            clubId={club.id}
            clubName={club.name}
            onClose={() => setJoinDialogOpen(false)}
          />
        )}
      </div>
    </section>
  );
};

export default ClubDetail;
