import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/auth-context';
import apiService from '../../services/api';
import type { User } from '../../contexts/types';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleAuth } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Запобігаємо повторним викликам
      if (isProcessing) {
        console.log('Google callback - already processing, skipping');
        return;
      }

      setIsProcessing(true);
      console.log('Google callback - starting processing');

      try {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        console.log('Google callback - token:', token ? 'present' : 'missing');
        console.log('Google callback - error:', error);

        if (error) {
          setError('Google authentication failed');
          setTimeout(() => window.location.href = '/signin', 3000);
          return;
        }

        if (token) {
          console.log('Google callback - token received, setting in localStorage');
          localStorage.setItem('authToken', token);
          
          try {
            console.log('Google callback - calling apiService.getProfile()');
            // Отримуємо дані користувача та оновлюємо стан
            const userData = await apiService.getProfile();
            console.log('Google callback - userData received:', userData);
            console.log('Google callback - calling handleGoogleAuth');
            handleGoogleAuth(userData);
            console.log('Google callback - handleGoogleAuth called successfully');
            // AuthContext сам зробить редирект на основі pending application
          } catch (error) {
            console.error('Google callback - error getting user profile:', error);
            
            // Якщо не можемо отримати профіль, все одно викликаємо handleGoogleAuth
            // AuthContext сам вирішить куди редиректити
            console.log('Google callback - calling handleGoogleAuth with empty user due to error');
            handleGoogleAuth({} as User);
          }
        } else {
          console.log('Google callback - no token, going to signin');
          window.location.href = '/signin';
        }
      } catch (err) {
        console.error('Google callback error:', err);
        setError('Authentication failed');
        setTimeout(() => window.location.href = '/signin', 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, navigate, handleGoogleAuth, isProcessing]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
      >
        <Typography color="error" variant="h6">
          {error}
        </Typography>
        <Typography variant="body2">
          Redirecting to sign in page...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography variant="h6">
        Completing Google authentication...
      </Typography>
    </Box>
  );
};

export default GoogleCallback; 