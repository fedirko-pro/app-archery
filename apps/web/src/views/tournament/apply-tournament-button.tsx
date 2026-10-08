import { Send } from '@mui/icons-material';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import ApplicationDeadlineDialog from '../../components/dialogs/application-deadline-dialog';
import { isApplicationDeadlinePassed } from '../../utils/date-utils';

interface ApplyTournamentButtonProps {
  to: string;
  deadline?: string | null;
  label: string;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const ApplyTournamentButton: React.FC<ApplyTournamentButtonProps> = ({
  to,
  deadline,
  label,
  size = 'large',
  sx,
}) => {
  const [open, setOpen] = useState(false);
  const deadlinePassed = isApplicationDeadlinePassed(deadline);

  if (deadlinePassed) {
    return (
      <>
        <Button
          variant="contained"
          size={size}
          startIcon={<Send />}
          onClick={() => setOpen(true)}
          sx={{
            ...sx,
            bgcolor: 'action.disabledBackground',
            color: 'action.disabled',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: 'action.disabledBackground',
              boxShadow: 'none',
            },
          }}
        >
          {label}
        </Button>
        <ApplicationDeadlineDialog open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <Button variant="contained" size={size} startIcon={<Send />} component={Link} to={to} sx={sx}>
      {label}
    </Button>
  );
};

export default ApplyTournamentButton;
