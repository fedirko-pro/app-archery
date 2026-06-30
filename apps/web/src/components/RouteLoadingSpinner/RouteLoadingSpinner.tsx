import { Box, CircularProgress } from '@mui/material';
import React from 'react';

const RouteLoadingSpinner: React.FC = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="50vh"
  >
    <CircularProgress />
  </Box>
);

export default RouteLoadingSpinner;
