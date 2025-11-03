import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../contexts/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    // Store the attempted URL to redirect after login
    const returnUrl = location.pathname + location.search;
    sessionStorage.setItem('returnUrl', returnUrl);

    // Extract language from path to maintain it in signin redirect
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lang = pathSegments[0] || 'pt';

    return <Navigate to={`/${lang}/signin`} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
