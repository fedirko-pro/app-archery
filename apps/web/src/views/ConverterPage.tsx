import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import Converter from '../components/Converter/Converter';

const ConverterPage = () => {
  const { t } = useTranslation('common');
  return (
    <section>
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {t('pages.converter.title')}
          </Typography>
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('pages.converter.description')}
          </Typography>
        </Box>
        <Converter />
      </div>
    </section>
  );
};

export default ConverterPage;
