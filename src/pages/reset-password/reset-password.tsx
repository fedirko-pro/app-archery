import { Visibility, VisibilityOff, Lock } from '@mui/icons-material';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  InputAdornment,
  Container,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import apiService from '../../services/api';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { lang } = useParams();
  const { t } = useTranslation('common');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError(t('reset.invalidLink'));
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError(t('reset.invalidLink'));
      return;
    }

    if (!password || password.length < 8) {
      setError(t('reset.minLength'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('reset.mismatch'));
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError(t('reset.requirements'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await apiService.resetPassword(token, password, confirmPassword);
      setSuccess(t('reset.success'));
      setTimeout(() => {
        navigate(`/${lang}/signin`);
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('reset.failed');
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordStrength = (
    password: string,
  ): { strength: string; color: string } => {
    if (!password) return { strength: '', color: '' };

    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const length = password.length;

    const score =
      [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length +
      (length >= 8 ? 1 : 0) +
      (length >= 12 ? 1 : 0);

    if (score <= 2) return { strength: 'Weak', color: '#f44336' };
    if (score <= 4) return { strength: 'Fair', color: '#ff9800' };
    if (score <= 6) return { strength: 'Good', color: '#2196f3' };
    return { strength: 'Strong', color: '#4caf50' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Alert severity="error">
              {t('reset.invalidLink')}
            </Alert>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="contained" onClick={() => navigate(`/${lang}/signin`)}>
                {t('auth.backToSignIn')}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardHeader
          title={t('reset.title')}
          subheader={t('reset.subtitle')}
          avatar={<Lock color="primary" />}
        />
        <CardContent>
          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              margin="normal"
              label={t('reset.new')}
              type={showPasswords.password ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('password')}
                      edge="end"
                    >
                      {showPasswords.password ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {password && (
              <Typography
                variant="caption"
                sx={{ color: passwordStrength.color, display: 'block', mt: 1 }}
              >
                {t('reset.strength')}: {passwordStrength.strength}
              </Typography>
            )}

            <TextField
              fullWidth
              margin="normal"
              label={t('reset.confirm')}
              type={showPasswords.confirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        togglePasswordVisibility('confirmPassword')
                      }
                      edge="end"
                    >
                      {showPasswords.confirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ mt: 3 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
                fullWidth
              >
                {isSubmitting ? t('reset.submitLoading') : t('reset.submit')}
              </Button>
            </Box>

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="text"
                onClick={() => navigate(`/${lang}/signin`)}
                disabled={isSubmitting}
              >
                {t('auth.backToSignIn')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default ResetPassword;
