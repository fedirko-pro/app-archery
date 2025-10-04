import { Button, Container, Typography } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { normalizeAppLang } from '../utils/i18n-lang';

const NotFound = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const navigate = useNavigate();
  const currentLang = normalizeAppLang(lang);

  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>404</Typography>
      <Typography variant="h5" gutterBottom>{t('notFound.title')}</Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>{t('notFound.subtitle')}</Typography>
      <Button variant="contained" onClick={() => navigate(`/${currentLang}`)}>
        {t('notFound.goHome')}
      </Button>
    </Container>
  );
};

export default NotFound;


