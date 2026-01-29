import { Alert, Snackbar } from '@mui/material';
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

interface ErrorFeedbackContextValue {
  showError: (message: string) => void;
}

const ErrorFeedbackContext = createContext<
  ErrorFeedbackContextValue | undefined
>(undefined);

export function useErrorFeedback(): ErrorFeedbackContextValue {
  const context = useContext(ErrorFeedbackContext);
  if (!context) {
    throw new Error(
      'useErrorFeedback must be used within an ErrorFeedbackProvider',
    );
  }
  return context;
}

interface ErrorFeedbackProviderProps {
  children: ReactNode;
}

export function ErrorFeedbackProvider({
  children,
}: ErrorFeedbackProviderProps): React.ReactElement {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const showError = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ErrorFeedbackContext.Provider value={{ showError }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="error" variant="filled">
          {message}
        </Alert>
      </Snackbar>
    </ErrorFeedbackContext.Provider>
  );
}
