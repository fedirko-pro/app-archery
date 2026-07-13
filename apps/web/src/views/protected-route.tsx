import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import RouteLoadingSpinner from '../components/RouteLoadingSpinner';
import { useAuth } from '../contexts/auth-context';
import { getDefaultAppLang } from '../utils/i18n-lang';
import { setReturnUrl } from '../utils/safe-session-json';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <RouteLoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Store the attempted URL to redirect after login
    const returnUrl = location.pathname + location.search;
    setReturnUrl(returnUrl);

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lang = pathSegments[0] || getDefaultAppLang();

    return <Navigate to={`/${lang}/signin`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
