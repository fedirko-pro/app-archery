import { Box, Chip, IconButton, Menu, MenuItem, Paper } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useEffect, useRef, useState } from 'react';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import type { Participant } from './types';

interface MemberCardProps {
  participant: Participant;
  patrolId: string;
  isLeader: boolean;
  isJudge: boolean;
  onRoleChange: (patrolId: string, memberId: string, role: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  participant,
  patrolId,
  isLeader,
  isJudge,
  onRoleChange,
}) => {
  const dragRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Setup draggable
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({
        type: 'member',
        memberId: participant.id,
        sourcePatrolId: patrolId,
      }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    });
  }, [participant.id, patrolId]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMakeLeader = () => {
    onRoleChange(patrolId, participant.id, 'leader');
    handleMenuClose();
  };

  const handleMakeJudge = () => {
    onRoleChange(patrolId, participant.id, 'judge');
    handleMenuClose();
  };

  const handleRemoveRole = () => {
    onRoleChange(patrolId, participant.id, 'remove');
    handleMenuClose();
  };

  return (
    <Paper
      ref={dragRef}
      sx={{
        p: 1.5,
        mb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
      variant="outlined"
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
          <Box
            component="span"
            sx={{ fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {participant.name}
          </Box>
          {isLeader && (
            <Chip label="Leader" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
          {isJudge && (
            <Chip label="Judge" size="small" color="secondary" sx={{ height: 20, fontSize: '0.7rem' }} />
          )}
        </Box>
        <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
          {participant.club}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Chip
          label={participant.division}
          size="small"
          variant="outlined"
          color="info"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />
        <Chip
          label={participant.gender}
          size="small"
          variant="outlined"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />

        <IconButton size="small" onClick={handleMenuClick}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {!isLeader && (
          <MenuItem onClick={handleMakeLeader}>Make Leader</MenuItem>
        )}
        {!isJudge && (
          <MenuItem onClick={handleMakeJudge}>Make Judge</MenuItem>
        )}
        {(isLeader || isJudge) && (
          <MenuItem onClick={handleRemoveRole}>Remove Role</MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default MemberCard;
