'use client';

import { Box, Button, Typography } from '@mui/material';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LangErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function LangError({ error, reset }: LangErrorProps) {
  const { t } = useTranslation('common');

  useEffect(() => {
    console.error('Lang segment error:', error);
  }, [error]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        p: 3,
        textAlign: 'center',
      }}
    >
      <Typography variant="h5" gutterBottom>
        {t('errorBoundary.title', 'Something went wrong')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 480 }}>
        {t('errorBoundary.routeSubtitle', 'An unexpected error occurred while loading this page.')}
      </Typography>
      <Button variant="contained" onClick={reset}>
        {t('errorBoundary.retry', 'Try again')}
      </Button>
    </Box>
  );
}
