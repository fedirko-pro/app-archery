import './Notifications.scss';

import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import { NotificationTypes } from '@sokil/shared-types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import { useAchievementCelebration } from '../../contexts/achievement-celebration-context';
import { useNotifications } from '../../contexts/notifications-context';
import apiService from '../../services/api';
import type { NotificationDto } from '../../services/types';
import { formatDateTime } from '../../utils/date-utils';
import { normalizeAppLang } from '../../utils/i18n-lang';

function resolveNotificationBody(
  t: (key: string, options?: Record<string, unknown>) => string,
  item: NotificationDto,
): string {
  const params = { ...(item.params ?? {}) } as Record<string, unknown>;

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
        .map((item) => item.params!.achievementId as string);
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

  const handleToggle = async (item: NotificationDto) => {
    const nextExpanded = expandedId === item.id ? null : item.id;
    setExpandedId(nextExpanded);

    if (nextExpanded && !item.readAt) {
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
    <Box className="notifications-page" sx={{ maxWidth: 720, mx: 'auto', px: 2, py: 3 }}>
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

      {!loading && items.length > 0 && (
        <ul className="notifications-list">
          {items.map((item) => {
            const isExpanded = expandedId === item.id;
            const isUnread = !item.readAt;
            const relatedLink = item.link
              ? `/${currentLang}${item.link.startsWith('/') ? item.link : `/${item.link}`}`
              : null;

            return (
              <li
                key={item.id}
                className={`notifications-item${isUnread ? ' is-unread' : ''}${
                  isExpanded ? ' is-expanded' : ''
                }${item.important ? ' is-important' : ''}`}
              >
                <button
                  type="button"
                  className="notifications-item__header"
                  onClick={() => void handleToggle(item)}
                  aria-expanded={isExpanded}
                >
                  <span className="notifications-item__title-row">
                    {isUnread && <span className="notifications-item__dot" aria-hidden />}
                    <span className="notifications-item__title">{t(item.titleKey)}</span>
                  </span>
                  <time className="notifications-item__time" dateTime={item.createdAt}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </button>
                <Collapse in={isExpanded}>
                  <div className="notifications-item__body">
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
                  </div>
                </Collapse>
              </li>
            );
          })}
        </ul>
      )}
    </Box>
  );
};

export default NotificationsPage;
