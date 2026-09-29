import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { NotificationTypes } from '@sokil/shared-types';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';

import { useAchievementCelebration } from '../../contexts/achievement-celebration-context';
import { useNotifications } from '../../contexts/notifications-context';
import apiService from '../../services/api';
import type { NotificationDto } from '../../services/types';
import { formatDateTime } from '../../utils/date-utils';
import { normalizeAppLang } from '../../utils/i18n-lang';
import PushOptIn from './push-opt-in';

function resolveNotificationBody(
  t: (key: string, options?: Record<string, unknown>) => string,
  item: NotificationDto,
): string {
  const params = { ...(item.params ?? {}) } as Record<string, unknown>;

  if (item.type === NotificationTypes.Announcement) {
    return (params.message as string) || '';
  }

  if (typeof params.achievementTitleKey === 'string') {
    params.achievementName = t(params.achievementTitleKey);
  }

  if (typeof params.visibility === 'string') {
    params.visibilityLabel = t(`privacy.visibility.${params.visibility}.label`, {
      defaultValue: String(params.visibility),
    });
  }

  if (typeof params.previousVisibility === 'string') {
    params.previousVisibilityLabel = t(`privacy.visibility.${params.previousVisibility}.label`, {
      defaultValue: String(params.previousVisibility),
    });
  }

  return t(item.bodyKey, params);
}

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const currentLang = normalizeAppLang(lang);
  const { decrementUnread, clearUnread, refreshUnreadCount } = useNotifications();
  const { enqueueCelebration } = useAchievementCelebration();

  const [items, setItems] = useState<NotificationDto[]>([]);
  const [lastLoginAt, setLastLoginAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getNotifications({ limit: 100 });
      setItems(data.items);
      setLastLoginAt(data.lastLoginAt);

      const unlockedIds = data.items
        .filter(
          (item) =>
            item.type === NotificationTypes.AchievementUnlocked &&
            !item.readAt &&
            typeof item.params?.achievementId === 'string',
        )
        .map((item) => (item.params?.achievementId ?? '') as string);
      if (unlockedIds.length > 0) {
        enqueueCelebration(unlockedIds);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(t('notifications.fetchError'));
    } finally {
      setLoading(false);
    }
  }, [t, enqueueCelebration]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleToggle = async (item: NotificationDto, isExpanded: boolean) => {
    setExpandedId(isExpanded ? item.id : null);

    if (isExpanded && !item.readAt) {
      try {
        const updated = await apiService.markNotificationRead(item.id);
        setItems((prev) => prev.map((row) => (row.id === item.id ? updated : row)));
        if (item.important) {
          decrementUnread();
        }
      } catch (err) {
        console.error('Failed to mark notification read:', err);
      }
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await apiService.markAllNotificationsRead();
      setItems((prev) =>
        prev.map((row) => (row.readAt ? row : { ...row, readAt: new Date().toISOString() })),
      );
      clearUnread();
      await refreshUnreadCount();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
      setError(t('notifications.markAllError'));
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnread = items.some((item) => !item.readAt);

  return (
    <Box sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Typography variant="h4" component="h1">
          {t('notifications.title')}
        </Typography>
        {hasUnread && (
          <Button
            size="small"
            startIcon={<MarkEmailReadOutlinedIcon />}
            onClick={() => void handleMarkAllRead()}
            disabled={markingAll}
          >
            {t('notifications.markAllRead')}
          </Button>
        )}
      </Box>

      <PushOptIn />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {lastLoginAt
          ? t('notifications.lastLogin', { datetime: formatDateTime(lastLoginAt) })
          : t('notifications.firstSession')}
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && items.length === 0 && (
        <Alert severity="info">{t('notifications.empty')}</Alert>
      )}

      {!loading &&
        items.length > 0 &&
        items.map((item) => {
          const isUnread = !item.readAt;
          const relatedLink = item.link
            ? `/${currentLang}${item.link.startsWith('/') ? item.link : `/${item.link}`}`
            : null;
          const title =
            item.type === NotificationTypes.Announcement
              ? (item.params?.title as string) ||
                t('notifications.announcementMessage.title', {
                  senderName: item.params?.senderName as string | undefined,
                })
              : t(item.titleKey);

          return (
            <Accordion
              key={item.id}
              expanded={expandedId === item.id}
              onChange={(_, isExpanded) => void handleToggle(item, isExpanded)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  gap={2}
                  pr={1}
                >
                  <Box display="flex" alignItems="center" gap={1} minWidth={0}>
                    {isUnread && (
                      <Box
                        aria-hidden
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography variant="subtitle1" sx={{ fontWeight: isUnread ? 700 : 500 }}>
                      {title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="time"
                    dateTime={item.createdAt}
                    sx={{ flexShrink: 0 }}
                  >
                    {formatDateTime(item.createdAt)}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {resolveNotificationBody(t, item)}
                </Typography>
                {relatedLink && (
                  <Button
                    component={Link}
                    to={relatedLink}
                    size="small"
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    sx={{ mt: 1.5 }}
                  >
                    {t('notifications.openRelated')}
                  </Button>
                )}
              </AccordionDetails>
            </Accordion>
          );
        })}
    </Box>
  );
};

export default NotificationsPage;
