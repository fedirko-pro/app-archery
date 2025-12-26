import { Alert, Box, Card, CardContent, Chip, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

import MemberCard from './MemberCard';
import type { Participant, Patrol, Warning } from './types';

interface PatrolCardProps {
  patrol: Patrol;
  participants: Map<string, Participant>;
  warnings: Warning[];
  onMemberDrop: (
    memberId: string,
    sourcePatrolId: string,
    targetPatrolId: string,
  ) => void;
  onRoleChange: (patrolId: string, memberId: string, role: string) => void;
}

const PatrolCard: React.FC<PatrolCardProps> = ({
  patrol,
  participants,
  warnings,
  onMemberDrop,
  onRoleChange,
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isOver, setIsOver] = useState(false);

  // Setup drop zone
  useEffect(() => {
    const el = dropZoneRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      onDragEnter: () => setIsOver(true),
      onDragLeave: () => setIsOver(false),
      onDrop: ({ source }) => {
        setIsOver(false);
        const { memberId, sourcePatrolId } = source.data;
        onMemberDrop(
          memberId as string,
          sourcePatrolId as string,
          patrol.id,
        );
      },
      getData: () => ({ patrolId: patrol.id }),
      canDrop: ({ source }) => {
        // Don't allow drop from same patrol
        return source.data.sourcePatrolId !== patrol.id;
      },
    });
  }, [patrol.id, onMemberDrop]);

  const leader = patrol.leaderId ? participants.get(patrol.leaderId) : null;
  const judges = patrol.judgeIds
    .map((id) => participants.get(id))
    .filter(Boolean) as Participant[];

  const errorWarnings = warnings.filter((w) => w.severity === 'error');
  const otherWarnings = warnings.filter((w) => w.severity !== 'error');

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isOver ? '2px solid' : '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: isOver ? 'action.hover' : 'background.paper',
        transition: 'all 0.2s',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
            pb: 1,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6" component="div">
            PATROL {patrol.targetNumber}
          </Typography>
          <Chip
            label={`${patrol.members.length} members`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box sx={{ mb: 1.5, fontSize: '0.9rem' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 600, mr: 1 }}
            >
              Leader:
            </Typography>
            <Typography variant="body2" component="span">
              {leader?.name || 'Not assigned'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography
              variant="body2"
              component="span"
              sx={{ fontWeight: 600, mr: 1 }}
            >
              Judges:
            </Typography>
            <Typography variant="body2" component="span">
              {judges.length > 0
                ? judges.map((j) => `${j.name} (${j.club})`).join(', ')
                : 'Not assigned'}
            </Typography>
          </Box>
        </Box>

        {errorWarnings.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {errorWarnings.map((warning, idx) => (
              <Alert key={idx} severity="error" sx={{ mb: 0.5, py: 0.5 }}>
                {warning.message}
              </Alert>
            ))}
          </Box>
        )}

        {otherWarnings.length > 0 && (
          <Box sx={{ mb: 1 }}>
            {otherWarnings.map((warning, idx) => (
              <Alert key={idx} severity={warning.severity} sx={{ mb: 0.5, py: 0.5 }}>
                {warning.message}
              </Alert>
            ))}
          </Box>
        )}

        <Box
          ref={dropZoneRef}
          sx={{
            flex: 1,
            minHeight: 200,
            bgcolor: 'grey.50',
            borderRadius: 1,
            p: 1,
            border: '2px dashed',
            borderColor: isOver ? 'primary.main' : 'grey.300',
          }}
        >
          {[...patrol.members]
            .sort((a, b) => {
              // Leader first
              if (a === patrol.leaderId) return -1;
              if (b === patrol.leaderId) return 1;
              
              // Judges next
              const aIsJudge = patrol.judgeIds.includes(a);
              const bIsJudge = patrol.judgeIds.includes(b);
              if (aIsJudge && !bIsJudge) return -1;
              if (!aIsJudge && bIsJudge) return 1;
              
              // Keep original order for others
              return 0;
            })
            .map((memberId) => {
            const participant = participants.get(memberId);
            if (!participant) return null;

            return (
              <MemberCard
                key={memberId}
                participant={participant}
                patrolId={patrol.id}
                isLeader={patrol.leaderId === memberId}
                isJudge={patrol.judgeIds.includes(memberId)}
                onRoleChange={onRoleChange}
              />
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PatrolCard;
