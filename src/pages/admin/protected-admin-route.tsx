import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import RouteLoadingSpinner from '../../components/RouteLoadingSpinner';
import { useAuth } from '../../contexts/auth-context';
import { getDefaultAppLang } from '../../utils/i18n-lang';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();
  const { lang } = useParams();
  const defaultLang = getDefaultAppLang();
  const currentLang = lang || defaultLang;

  if (loading) {
    return <RouteLoadingSpinner />;
  }

  if (!user) {
    return <Navigate to={`/${currentLang}/signin`} replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to={`/${currentLang}/tournaments`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
