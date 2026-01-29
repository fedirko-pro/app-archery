import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import RouteLoadingSpinner from '../components/RouteLoadingSpinner';
import { useAuth } from '../contexts/auth-context';
import { getDefaultAppLang } from '../utils/i18n-lang';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Store the attempted URL to redirect after login
    const returnUrl = location.pathname + location.search;
    sessionStorage.setItem('returnUrl', returnUrl);

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lang = pathSegments[0] || getDefaultAppLang();

    return <Navigate to={`/${lang}/signin`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
