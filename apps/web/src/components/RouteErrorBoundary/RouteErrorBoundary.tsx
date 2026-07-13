import { Box, Button, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { isDev } from '../../config/env';

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RouteErrorBoundaryInner extends Component<
  RouteErrorBoundaryProps & { title: string; retryLabel: string },
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps & { title: string; retryLabel: string }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RouteErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (isDev) {
      console.error('RouteErrorBoundary caught:', error, errorInfo);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '40vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h6" gutterBottom>
            {this.props.title}
          </Typography>
          {isDev && this.state.error && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 480 }}>
              {this.state.error.message}
            </Typography>
          )}
          <Button variant="outlined" onClick={this.handleRetry}>
            {this.props.retryLabel}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export function RouteErrorBoundary({ children }: RouteErrorBoundaryProps) {
  const { t } = useTranslation('common');
  return (
    <RouteErrorBoundaryInner
      title={t('errorBoundary.routeTitle', 'This page failed to load')}
      retryLabel={t('errorBoundary.retry', 'Try again')}
    >
      {children}
    </RouteErrorBoundaryInner>
  );
}

export default RouteErrorBoundary;
