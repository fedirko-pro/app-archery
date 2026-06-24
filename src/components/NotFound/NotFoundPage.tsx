'use client';

import { Button, Container, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useAppLang } from '@/contexts/lang-context';
import { normalizeAppLang } from '@/utils/i18n-lang';

export type NotFoundVariant = 'default' | 'tournament';

interface NotFoundPageProps {
  variant?: NotFoundVariant;
  lang?: string;
}

function isTournamentDetailPath(pathname: string): boolean {
  return /\/tournaments\/[^/]+$/.test(pathname);
}

function resolveVariant(variant: NotFoundVariant | undefined, pathname: string): NotFoundVariant {
  if (variant) {
    return variant;
  }
  return isTournamentDetailPath(pathname) ? 'tournament' : 'default';
}

export default function NotFoundPage({ variant, lang: langProp }: NotFoundPageProps) {
  const { t } = useTranslation('common');
  const { lang: langParam } = useParams();
  const appLang = useAppLang();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentLang = normalizeAppLang(langProp ?? langParam ?? appLang);
  const resolvedVariant = resolveVariant(variant, pathname);

  const isTournament = resolvedVariant === 'tournament';
  const title = isTournament ? t('notFound.tournament.title') : t('notFound.title');
  const subtitle = isTournament ? t('notFound.tournament.subtitle') : t('notFound.subtitle');
  const ctaLabel = isTournament ? t('notFound.tournament.goToList') : t('notFound.goHome');
  const ctaPath = isTournament ? `/${currentLang}/tournaments` : `/${currentLang}/home`;

  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        {subtitle}
      </Typography>
      <Button variant="contained" onClick={() => navigate(ctaPath)}>
        {ctaLabel}
      </Button>
    </Container>
  );
}
