import { Alert, Box, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';

const EnvError = () => {
  const [envErrors, setEnvErrors] = useState<{
    missingVars: string[];
    invalidVars: string[];
  } | null>(null);

  useEffect(() => {
    const checkEnv = () => {
      const requiredEnvVars = {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
      };

      const missingVars: string[] = [];
      const invalidVars: string[] = [];

      Object.entries(requiredEnvVars).forEach(([key, value]) => {
        if (!value) {
          missingVars.push(key);
        } else if (key === 'VITE_API_BASE_URL' && !isValidUrl(value)) {
          invalidVars.push(`${key}: "${value}" is not a valid URL`);
        }
      });

      if (missingVars.length > 0 || invalidVars.length > 0) {
        setEnvErrors({
          missingVars,
          invalidVars,
        });
      }
    };

    checkEnv();
  }, []);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  if (!envErrors) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 400,
      }}
    >
      <Alert
        severity="error"
        onClose={() => setEnvErrors(null)}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => setEnvErrors(null)}
          >
            Dismiss
          </Button>
        }
      >
        <Typography variant="h6" gutterBottom>
          Environment Configuration Error
        </Typography>

        {envErrors.missingVars.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="error">
              Missing required environment variables:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {envErrors.missingVars.map((varName) => (
                <li key={varName}>
                  <Typography variant="body2">{varName}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        {envErrors.invalidVars.length > 0 && (
          <Box>
            <Typography variant="subtitle2" color="error">
              Invalid environment variables:
            </Typography>
            <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
              {envErrors.invalidVars.map((error) => (
                <li key={error}>
                  <Typography variant="body2">{error}</Typography>
                </li>
              ))}
            </ul>
          </Box>
        )}

        <Typography variant="body2" sx={{ mt: 2 }}>
          Please check your .env file and restart the development server.
        </Typography>
      </Alert>
    </Box>
  );
};

export default EnvError;
