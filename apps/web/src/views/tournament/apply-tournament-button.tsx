import { Info, Send } from '@mui/icons-material';
import { Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router';

import AnnouncementApplyDialog from '../../components/dialogs/announcement-apply-dialog';
import ApplicationDeadlineDialog from '../../components/dialogs/application-deadline-dialog';
import { isApplicationDeadlinePassed } from '../../utils/date-utils';

interface ApplyTournamentButtonProps {
  to: string;
  deadline?: string | null;
  announcement?: boolean;
  label: string;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

const disabledButtonSx: SxProps<Theme> = {
  bgcolor: 'action.disabledBackground',
  color: 'action.disabled',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'action.disabledBackground',
    boxShadow: 'none',
  },
};

const ApplyTournamentButton: React.FC<ApplyTournamentButtonProps> = ({
  to,
  deadline,
  announcement = false,
  label,
  size = 'large',
  sx,
}) => {
  const [open, setOpen] = useState(false);
  const deadlinePassed = isApplicationDeadlinePassed(deadline);

  if (announcement || deadlinePassed) {
    return (
      <>
        <Button
          variant="contained"
          size={size}
          startIcon={announcement ? <Info /> : <Send />}
          onClick={() => setOpen(true)}
          sx={{
            ...sx,
            ...disabledButtonSx,
          }}
        >
          {label}
        </Button>
        {announcement ? (
          <AnnouncementApplyDialog open={open} onClose={() => setOpen(false)} />
        ) : (
          <ApplicationDeadlineDialog open={open} onClose={() => setOpen(false)} />
        )}
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
