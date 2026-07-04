import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import glossaryData from '../../data/glossary';
import { normalizeAppLang } from '../../utils/i18n-lang';

const Glossary: React.FC = () => {
  const { t } = useTranslation('common');
  const { lang } = useParams();
  const appLang = normalizeAppLang(lang);
  const [expanded, setExpanded] = useState<string | false>(false);

  const pickDesc = (entry: (typeof glossaryData)[number]): string => {
    switch (appLang) {
      case 'pt': return entry.pt || entry.en;
      case 'it': return entry.it || entry.en;
      case 'ua': return entry.ua || entry.en;
      case 'es': return entry.es || entry.en;
      default: return entry.en;
    }
  };

  return (
    <section>
      <div className="container">
        <Typography variant="h4" gutterBottom>
          {t('fieldGuide.glossary', 'Glossary')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('fieldGuide.glossaryDesc', 'Common terms and abbreviations used in archery')}
        </Typography>
        {glossaryData.map((entry) => (
          <Accordion
            key={entry.term}
            expanded={expanded === entry.term}
            onChange={(_, isExpanded) => setExpanded(isExpanded ? entry.term : false)}
            sx={{ mb: 0.5 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                {entry.term}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {pickDesc(entry)}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </section>
  );
};

export default Glossary;
