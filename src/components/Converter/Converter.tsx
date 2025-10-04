import './converter.scss';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConverterInputs from './ConverterInputs';

export default function Converter() {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState<string | false>('false');

  const handleChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : 'false');
    };

  return (
      <>
        <Accordion
          expanded={expanded === 'panel1'}
          onChange={handleChange('panel1')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1bh-content"
            id="panel1bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {t('converter.inchCm.short')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('converter.inchCm.long')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>{t('converter.inchCm.desc')}</div>
            <ConverterInputs
              labelFirst={t('units.inch')}
              labelSecond={t('units.centimeter')}
              coef={2.56}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel2'}
          onChange={handleChange('panel2')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2bh-content"
            id="panel2bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {t('converter.poundKg.short')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('converter.poundKg.long')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>{t('converter.poundKg.desc')}</div>
            <ConverterInputs
              labelFirst={t('units.pound')}
              labelSecond={t('units.kilogram')}
              coef={0.453592}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel3'}
          onChange={handleChange('panel3')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel3bh-content"
            id="panel3bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {t('converter.grainG.short')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('converter.grainG.long')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>{t('converter.grainG.desc')}</div>
            <ConverterInputs
              labelFirst={t('units.grain')}
              labelSecond={t('units.gram')}
              coef={0.0647989}
            />
          </AccordionDetails>
        </Accordion>
        <Accordion
          expanded={expanded === 'panel4'}
          onChange={handleChange('panel4')}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel4bh-content"
            id="panel4bh-header"
          >
            <Typography sx={{ width: '33%', flexShrink: 0 }}>
              {t('converter.yardM.short')}
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              {t('converter.yardM.long')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>{t('converter.yardM.desc')}</div>
            <ConverterInputs
              labelFirst={t('units.yard')}
              labelSecond={t('units.meter')}
              coef={0.9144}
            />
          </AccordionDetails>
        </Accordion>
      </>
  );
}
