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
    <CardContent>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      {loading ? (
        <Skeleton variant="text" width="60%" height={40} />
      ) : (
        <Typography variant="h5" fontWeight={700} lineHeight={1.2} color={valueColor}>
          {value}
        </Typography>
      )}
      {subtitle && !loading && (
        <Typography variant="caption" color={valueColor ?? 'text.secondary'}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatCard;
