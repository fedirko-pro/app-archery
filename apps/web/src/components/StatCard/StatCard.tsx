import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import React from 'react';

export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  valueColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  loading = false,
  valueColor,
}) => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ py: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width="60%" height={44} sx={{ mx: 'auto' }} />
      ) : (
        <Typography
          variant="h4"
          fontWeight={700}
          lineHeight={1.1}
          color={valueColor}
          sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
        >
          {value}
        </Typography>
      )}
      {subtitle && !loading && (
        <Typography
          variant="caption"
          color={valueColor ?? 'text.secondary'}
          sx={{ mt: 0.25, display: 'block' }}
        >
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
