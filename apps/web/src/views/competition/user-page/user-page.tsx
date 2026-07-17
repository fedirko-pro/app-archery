import './user-page.scss';

import { LockOpen } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import SafeDialog from '../../../components/SafeDialog/SafeDialog';

type Arrow = { id: number; value: number };
type ScoreRow = { id: number; targetNumber: number; arrows: Arrow[] };

const INITIAL_ROWS: ScoreRow[] = Array.from({ length: 18 }, (_, i) => {
  const presets: number[][] = [
    [10, 8, 5],
    [8, 8, 10],
    [5, 0, 10],
    [10, 10, 10],
    [0, 5, 8],
    [8, 8, 8],
    [5, 5, 5],
    [0, 0, 0],
    [10, 5, 8],
    [8, 0, 5],
    [10, 10, 0],
    [5, 8, 10],
    [8, 8, 0],
    [10, 5, 5],
    [0, 10, 8],
    [5, 10, 8],
    [0, 5, 5],
    [8, 10, 8],
  ];
  const values = presets[i] ?? [0, 0, 0];
  return {
    id: i + 1,
    targetNumber: i + 1,
    arrows: values.map((value, arrowIndex) => ({ id: arrowIndex + 1, value })),
  };
});

const SCORE_OPTIONS = [10, 8, 5, 0] as const;

const DEMO_USER = {
  firstName: 'Robert',
  lastName: 'Hood',
  division: 'Adult Male',
  gender: 'Male',
  category: 'HLB',
  patrolNumber: 13,
  tournament: 'Test tournament 2024 (demo)',
  date: '19.05.2024',
};

export default function UserPage() {
  const { t } = useTranslation('common');
  const [rows, setRows] = useState<ScoreRow[]>(INITIAL_ROWS);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setConfirmOpen(true);
  };

  const handleArrowChange = (rowId: number, arrowId: number, value: number) => {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              arrows: row.arrows.map((a) => (a.id === arrowId ? { ...a, value } : a)),
            }
          : row,
      ),
    );
  };

  const { rowTotals, runningTotals, grandTotal } = useMemo(() => {
    let running = 0;
    const totals: number[] = [];
    const runningList: number[] = [];
    for (const row of rows) {
      const rowTotal = row.arrows.reduce((acc, a) => acc + a.value, 0);
      running += rowTotal;
      totals.push(rowTotal);
      runningList.push(running);
    }
    return { rowTotals: totals, runningTotals: runningList, grandTotal: running };
  }, [rows]);

  return (
    <section className="scoring-demo">
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {t('pages.scoringDemo.title')}
          </Typography>
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('pages.scoringDemo.description')}
          </Typography>
        </Box>

        <Box
          sx={{
            mb: 2,
            p: 2,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
            <Avatar
              alt={`${DEMO_USER.firstName} ${DEMO_USER.lastName}`}
              sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}
            >
              RH
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
              >
                {DEMO_USER.firstName} {DEMO_USER.lastName}
                <LockOpen fontSize="small" color="success" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {DEMO_USER.tournament}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
            <Chip
              size="small"
              label={`${t('pages.scoringDemo.division')}: ${DEMO_USER.division}`}
              color="primary"
              variant="outlined"
            />
            <Chip
              size="small"
              label={`${t('pages.scoringDemo.gender')}: ${DEMO_USER.gender}`}
              variant="outlined"
            />
            <Chip
              size="small"
              label={`${t('pages.scoringDemo.category')}: ${DEMO_USER.category}`}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.scoringDemo.patrol')}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {DEMO_USER.patrolNumber}
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {t('pages.scoringDemo.date')}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                {DEMO_USER.date}
              </Typography>
            </Box>
          </Box>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
          <Table size="small" className="scoring-demo__table">
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  {t('pages.scoringDemo.set')}
                </TableCell>
                {rows[0].arrows.map((arrow, index) => (
                  <TableCell align="center" key={arrow.id} sx={{ fontWeight: 700 }}>
                    {index + 1}
                  </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 700, bgcolor: 'action.selected' }}>
                  {t('pages.scoringDemo.sum')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  {t('pages.scoringDemo.total')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={row.targetNumber}>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    {row.targetNumber}
                  </TableCell>
                  {row.arrows.map((arrow) => (
                    <TableCell key={arrow.id} align="center" sx={{ p: 0.5, minWidth: 64 }}>
                      <FormControl fullWidth size="small" disabled={submitted}>
                        <Select
                          value={arrow.value}
                          disabled={submitted}
                          onChange={(e: SelectChangeEvent<number>) =>
                            handleArrowChange(row.id, arrow.id, Number(e.target.value))
                          }
                        >
                          {SCORE_OPTIONS.map((score) => (
                            <MenuItem
                              key={score}
                              value={score}
                              sx={
                                score === 10
                                  ? { color: 'success.main', fontWeight: 700 }
                                  : undefined
                              }
                            >
                              {score}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ bgcolor: 'action.hover' }}>
                    {rowTotals[rowIndex]}
                  </TableCell>
                  <TableCell align="center">{runningTotals[rowIndex]}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} align="right" sx={{ fontWeight: 700 }}>
                  {t('pages.scoringDemo.totalScores')}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: 'success.light', color: 'success.contrastText' }}
                >
                  {grandTotal}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={submitted}
            sx={{ minWidth: 160 }}
          >
            {submitted ? t('pages.scoringDemo.submitted') : t('pages.scoringDemo.submit')}
          </Button>
        </Box>

        <SafeDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>{t('pages.scoringDemo.confirmTitle')}</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ whiteSpace: 'pre-wrap' }}>
              {t('pages.scoringDemo.confirmMessage')}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button variant="contained" color="primary" onClick={() => setConfirmOpen(false)}>
              {t('pages.scoringDemo.confirmClose')}
            </Button>
          </DialogActions>
        </SafeDialog>
      </div>
    </section>
  );
}
