import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router';

import glossaryData from '../../data/glossary';
import { type AppLanguage, normalizeAppLang } from '../../utils/i18n-lang';

const pickDesc = (entry: (typeof glossaryData)[number], appLang: AppLanguage): string => {
  switch (appLang) {
    case 'pt':
      return entry.pt;
    case 'it':
      return entry.it;
    case 'ua':
      return entry.ua;
    case 'es':
      return entry.es;
    case 'de':
      return entry.de;
    default:
      return entry.en;
  }
};

const Glossary: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const [expanded, setExpanded] = useState<string | false>(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return glossaryData;
    return glossaryData.filter((entry) => {
      const desc = pickDesc(entry, appLang).toLowerCase();
      return (
        entry.term.toLowerCase().includes(q) ||
        desc.includes(q) ||
        entry.en.toLowerCase().includes(q)
      );
    });
  }, [query, appLang]);

  return (
    <section>
      <div className="container">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ mb: 0.5 }}>
            {t('fieldGuide.glossary', 'Glossary')}
          </Typography>
          <Typography variant="body2" component="h2" color="text.secondary">
            {t('fieldGuide.glossaryDesc', 'Common terms and abbreviations used in archery')}
          </Typography>
        </Box>
        <TextField
          fullWidth
          size="small"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('fieldGuide.glossarySearch', 'Search terms')}
          sx={{ mb: 2 }}
        />
        {filtered.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('fieldGuide.glossaryNoResults', 'No matching terms')}
          </Typography>
        ) : (
          filtered.map((entry) => (
            <Accordion
              key={entry.term}
              expanded={expanded === entry.term}
              onChange={(_, isExpanded) => setExpanded(isExpanded ? entry.term : false)}
              sx={{ mb: 1 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box display="flex" alignItems="center" width="100%" gap={2} flexWrap="wrap">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {entry.term}
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                  {pickDesc(entry, appLang)}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </div>
    </section>
  );
};

export default Glossary;
