import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { ADMIN_CAPABLE_ROLES } from '../../config/roles';

export { ROLES_CAN_ACCESS_CONTROL } from '../../config/roles';
import RouteLoadingSpinner from '../../components/RouteLoadingSpinner';
import type { Role } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import { getDefaultAppLang } from '../../utils/i18n-lang';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  /** Allowed roles; defaults to all admin-capable roles. Use ROLES_CAN_ACCESS_CONTROL for Access Control only. */
  allowedRoles?: readonly Role[];
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({
  children,
  allowedRoles = ADMIN_CAPABLE_ROLES,
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

  const allowed = allowedRoles as readonly string[];
  if (!allowed.includes(user.role)) {
    return <Navigate to={`/${currentLang}/tournaments`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
