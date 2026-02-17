import { Alert, Snackbar } from '@mui/material';
import type { AlertColor } from '@mui/material/Alert';
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

export type NotificationSeverity = AlertColor;

interface NotificationContextValue {
  showSuccess: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
  showError: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined,
);

export function useNotification(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within an ErrorFeedbackProvider',
    );
  }
  return context;
}

/** @deprecated Use useNotification instead */
export function useErrorFeedback(): Pick<NotificationContextValue, 'showError'> {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useErrorFeedback must be used within an ErrorFeedbackProvider',
    );
  }
  return { showError: context.showError };
}

interface ErrorFeedbackProviderProps {
  children: ReactNode;
}

export function ErrorFeedbackProvider({
  children,
}: ErrorFeedbackProviderProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<NotificationSeverity>('error');

  const show = useCallback((msg: string, sev: NotificationSeverity) => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const showSuccess = useCallback(
    (msg: string) => show(msg, 'success'),
    [show],
  );
  const showInfo = useCallback((msg: string) => show(msg, 'info'), [show]);
  const showWarning = useCallback((msg: string) => show(msg, 'warning'), [show]);
  const showError = useCallback((msg: string) => show(msg, 'error'), [show]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showInfo, showWarning, showError }}
    >
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          position: 'fixed',
          zIndex: 9999,
          top: '24px !important',
        }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}
