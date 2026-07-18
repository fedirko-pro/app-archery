import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Paper,
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Participant } from './types';

interface PatrolOption {
  id: string;
  targetNumber: number;
}

interface MemberCardProps {
  participant: Participant;
  patrolId: string;
  isLeader: boolean;
  isJudge: boolean;
  otherPatrols: PatrolOption[];
  onRoleChange: (patrolId: string, memberId: string, role: string) => void;
  onMoveToPatrol: (memberId: string, sourcePatrolId: string, targetPatrolId: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({
  participant,
  patrolId,
  isLeader,
  isJudge,
  otherPatrols,
  onRoleChange,
  onMoveToPatrol,
}) => {
  const { t } = useTranslation('common');
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

  const handleMoveToPatrol = (targetPatrolId: string) => {
    onMoveToPatrol(participant.id, patrolId, targetPatrolId);
    handleMenuClose();
  };

  const sortedOtherPatrols = [...otherPatrols].sort((a, b) => a.targetNumber - b.targetNumber);

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
            sx={{
              fontWeight: 600,
              fontSize: '0.95rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {participant.name}
          </Box>
          {isLeader && (
            <Chip
              label={t('pages.patrols.leader')}
              size="small"
              color="primary"
              sx={{ height: 24, fontSize: '0.75rem' }}
            />
          )}
          {isJudge && (
            <Chip
              label={t('pages.patrols.judge')}
              size="small"
              color="secondary"
              sx={{ height: 24, fontSize: '0.75rem' }}
            />
          )}
        </Box>
        <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{participant.club}</Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
        <Chip
          label={participant.bowCategory}
          size="small"
          variant="filled"
          color="primary"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />
        <Chip
          label={participant.division}
          size="small"
          variant="outlined"
          color="info"
          sx={{ fontSize: '0.7rem', height: 22 }}
        />

        <IconButton
          size="small"
          onClick={handleMenuClick}
          aria-label={t('pages.patrols.memberActions')}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {[
          !isLeader ? (
            <MenuItem key="make-leader" onClick={handleMakeLeader}>
              {t('pages.patrols.makeLeader')}
            </MenuItem>
          ) : null,
          !isJudge ? (
            <MenuItem key="make-judge" onClick={handleMakeJudge}>
              {t('pages.patrols.makeJudge')}
            </MenuItem>
          ) : null,
          isLeader || isJudge ? (
            <MenuItem key="remove-role" onClick={handleRemoveRole}>
              {t('pages.patrols.removeRole')}
            </MenuItem>
          ) : null,
          ...(sortedOtherPatrols.length > 0
            ? [
                <Divider key="move-divider" />,
                <ListSubheader key="move-header" component="div" disableSticky>
                  {t('pages.patrols.moveToPatrol')}
                </ListSubheader>,
                ...sortedOtherPatrols.map((patrol) => (
                  <MenuItem key={patrol.id} onClick={() => handleMoveToPatrol(patrol.id)}>
                    {t('pages.patrols.patrolN', { number: patrol.targetNumber })}
                  </MenuItem>
                )),
              ]
            : []),
        ]}
      </Menu>
    </Paper>
  );
};

export default MemberCard;
