import React, {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import apiService from '../services/api';
import { useAuth } from './auth-context';

const POLL_INTERVAL_MS = 60_000;

interface NotificationsContextValue {
  unreadImportantCount: number;
  refreshUnreadCount: () => Promise<void>;
  decrementUnread: () => void;
  clearUnread: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(undefined);

export const useNotifications = (): NotificationsContextValue => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const [unreadImportantCount, setUnreadImportantCount] = useState(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      if (mountedRef.current) setUnreadImportantCount(0);
      return;
    }

    try {
      const { count } = await apiService.getNotificationUnreadCount();
      if (mountedRef.current) setUnreadImportantCount(count);
    } catch {
      // Non-blocking — badge stays at last known value
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (initializing) return;

    if (!isAuthenticated) {
      setUnreadImportantCount(0);
      return;
    }

    void refreshUnreadCount();

    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void refreshUnreadCount();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
    };
  }, [initializing, isAuthenticated, refreshUnreadCount]);

  const decrementUnread = useCallback(() => {
    setUnreadImportantCount((prev) => Math.max(0, prev - 1));
  }, []);

  const clearUnread = useCallback(() => {
    setUnreadImportantCount(0);
  }, []);

  const value = useMemo(
    () => ({
      unreadImportantCount,
      refreshUnreadCount,
      decrementUnread,
      clearUnread,
    }),
    [unreadImportantCount, refreshUnreadCount, decrementUnread, clearUnread],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
};
