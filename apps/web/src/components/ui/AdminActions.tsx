import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { IconButton } from '@mui/material';

import { canManageReferenceData } from '../../config/roles';
import { useAuth } from '../../contexts/auth-context';
import type { BowCategory, DivisionDto } from '../../services/types';

interface AdminActionsProps {
  item: BowCategory | DivisionDto;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export const AdminActions = ({ item, onEdit, onDelete }: AdminActionsProps) => {
  const { user } = useAuth();
  const isAdmin = user != null && canManageReferenceData(user.role);

  if (!isAdmin) return null;

  return (
    <div style={{ whiteSpace: 'nowrap' }}>
      <IconButton size="small" onClick={() => item.id != null && onEdit(item.id)}>
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton size="small" onClick={() => item.id != null && onDelete(item.id)}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    </div>
  );
};
