export interface InfoDialogProps {
  open: boolean;
  handleClose: () => void;
  description: string;
}

export interface AlertDialogProps {
  open: boolean;
  handleClose: () => void;
  handleConfirm: () => void;
  question: string;
  hint: string;
}
