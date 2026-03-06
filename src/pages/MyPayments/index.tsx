import CreditCardIcon from '@mui/icons-material/CreditCard';
import EditIcon from '@mui/icons-material/Edit';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PaymentsIcon from '@mui/icons-material/Payments';
import RepeatIcon from '@mui/icons-material/Repeat';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface PaymentRecord {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid';
}

const demoPayments: PaymentRecord[] = [
  {
    id: '1',
    date: 'Mar 15, 2025',
    description: 'Spring Open 2025 – Entry fee',
    amount: '€25',
    status: 'paid',
  },
  {
    id: '2',
    date: 'Apr 20, 2025',
    description: 'City Cup 2025 – Entry fee',
    amount: '€30',
    status: 'paid',
  },
  {
    id: '3',
    date: 'Jun 5, 2025',
    description: 'Regional Championship 2025 – Entry fee',
    amount: '€35',
    status: 'paid',
  },
  {
    id: '4',
    date: 'Jul 12, 2025',
    description: 'Summer Tournament 2025 – Entry fee',
    amount: '€25',
    status: 'paid',
  },
  {
    id: '5',
    date: 'Sep 3, 2025',
    description: 'Club Open 2025 – Entry fee',
    amount: '€20',
    status: 'paid',
  },
  {
    id: '6',
    date: 'Oct 18, 2025',
    description: 'Autumn Cup 2025 – Entry fee',
    amount: '€30',
    status: 'paid',
  },
  {
    id: '7',
    date: 'Dec 7, 2025',
    description: 'Winter Championship 2025 – Entry fee',
    amount: '€35',
    status: 'paid',
  },
];

const MyPaymentsPage: React.FC = () => {
  const { t } = useTranslation('common');

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
        {t('payments.title')}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        {t('payments.demoNotice')}
      </Alert>

      {/* Payment Methods */}
      <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <CreditCardIcon color="primary" fontSize="small" />
        {t('payments.paymentMethods')}
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CreditCardIcon sx={{ fontSize: 36, color: 'text.secondary' }} />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  Visa ····4242
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('payments.expires')} 12/27
                </Typography>
              </Box>
            </Box>
            <Chip label={t('payments.default')} color="primary" size="small" />
          </Box>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 1.5 }}>
          <Button size="small" startIcon={<EditIcon />} disabled>
            {t('common.update')}
          </Button>
        </CardActions>
      </Card>

      {/* Subscriptions */}
      <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <RepeatIcon color="primary" fontSize="small" />
        {t('payments.subscriptions')}
      </Typography>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1,
            }}
          >
            <Box>
              <Typography variant="body1" fontWeight="bold">
                {t('payments.monthlyClubFee')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Kyiv Archery Club
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body1" fontWeight="bold">
                €20 / {t('payments.month')}
              </Typography>
              <Chip label={t('payments.active')} color="success" size="small" />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {t('payments.startDate')}:{' '}
              <Box component="span" fontWeight="bold">
                Jan 1, 2025
              </Box>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('payments.nextBillingDate')}:{' '}
              <Box component="span" fontWeight="bold">
                Apr 1, 2026
              </Box>
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 1.5 }}>
          <Button size="small" startIcon={<EditIcon />} disabled>
            {t('common.update')}
          </Button>
        </CardActions>
      </Card>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              mb: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WorkspacePremiumIcon sx={{ fontSize: 24, color: '#FFD700' }} />
              <Box>
                <Typography variant="body1" fontWeight="bold">
                  {t('payments.premium')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('payments.activatedByFederation')}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title={t('payments.premiumHint')} arrow placement="top">
                <InfoOutlinedIcon
                  sx={{ fontSize: 18, color: 'text.secondary', cursor: 'help' }}
                  aria-label={t('payments.premiumHint')}
                />
              </Tooltip>
              <Chip label={t('payments.active')} color="success" size="small" />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Typography variant="h6" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PaymentsIcon color="primary" fontSize="small" />
        {t('payments.paymentHistory')}
      </Typography>
      <Card variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('payments.date')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('payments.description')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  {t('payments.amount')}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  {t('payments.status')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {demoPayments.map((payment, index) => (
                <React.Fragment key={payment.id}>
                  <TableRow hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {payment.date}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{payment.description}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {payment.amount}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={t('payments.paid')}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                  </TableRow>
                  {index < demoPayments.length - 1 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0 }}>
                        <Divider />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default MyPaymentsPage;
