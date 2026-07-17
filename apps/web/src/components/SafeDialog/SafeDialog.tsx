import Dialog, { type DialogProps } from '@mui/material/Dialog';
import React, { useLayoutEffect } from 'react';

/**
 * MUI Dialog that blurs the triggering control before aria-hidden is applied to
 * siblings (e.g. main). Avoids Chrome's "Blocked aria-hidden on an element
 * because its descendant retained focus" warning.
 */
const SafeDialog: React.FC<DialogProps> = ({ open, children, ...props }) => {
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== document.body) {
      active.blur();
    }
  }, [open]);

  return (
    <Dialog open={open} {...props}>
      {children}
    </Dialog>
  );
};

export default SafeDialog;
