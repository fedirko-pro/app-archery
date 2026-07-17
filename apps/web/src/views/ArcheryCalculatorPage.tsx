import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import ArcheryCalculator from '../components/ArcheryCalculator/ArcheryCalculator';

const ArcheryCalculatorPage = () => {
  const { t } = useTranslation('common');
  return (
    <section>
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {t('pages.calculator.title')}
          </Typography>
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('pages.calculator.description')}
          </Typography>
        </Box>
        <ArcheryCalculator />
      </div>
    </section>
  );
};

export default ArcheryCalculatorPage;
