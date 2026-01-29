import { Box, Button, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReload = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
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
            Something went wrong
          </Typography>
          {import.meta.env.DEV && this.state.error && (
            <Typography
              component="pre"
              variant="body2"
              sx={{
                maxWidth: '100%',
                overflow: 'auto',
                textAlign: 'left',
                mb: 2,
                p: 2,
                bgcolor: 'action.hover',
                borderRadius: 1,
              }}
            >
              {this.state.error.message}
            </Typography>
          )}
          <Button variant="contained" onClick={this.handleReload}>
            Reload page
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
