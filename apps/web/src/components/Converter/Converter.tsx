import './Converter.scss';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import ConverterInputs from './ConverterInputs';

const PANELS = [
  {
    id: 'inchCm',
    shortKey: 'converter.inchCm.short',
    longKey: 'converter.inchCm.long',
    descKey: 'converter.inchCm.desc',
    labelFirstKey: 'units.inch',
    labelSecondKey: 'units.centimeter',
    coef: 2.54,
  },
  {
    id: 'poundKg',
    shortKey: 'converter.poundKg.short',
    longKey: 'converter.poundKg.long',
    descKey: 'converter.poundKg.desc',
    labelFirstKey: 'units.pound',
    labelSecondKey: 'units.kilogram',
    coef: 0.453592,
  },
  {
    id: 'grainG',
    shortKey: 'converter.grainG.short',
    longKey: 'converter.grainG.long',
    descKey: 'converter.grainG.desc',
    labelFirstKey: 'units.grain',
    labelSecondKey: 'units.gram',
    coef: 0.0647989,
  },
  {
    id: 'yardM',
    shortKey: 'converter.yardM.short',
    longKey: 'converter.yardM.long',
    descKey: 'converter.yardM.desc',
    labelFirstKey: 'units.yard',
    labelSecondKey: 'units.meter',
    coef: 0.9144,
  },
] as const;

export default function Converter() {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState<string | false>('inchCm');

  return (
    <div className="converter">
      {PANELS.map((panel) => (
        <Accordion
          key={panel.id}
          expanded={expanded === panel.id}
          onChange={(_e, isExpanded) => setExpanded(isExpanded ? panel.id : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="subtitle1"
              sx={{ width: { xs: '40%', sm: '33%' }, flexShrink: 0, fontWeight: 700 }}
            >
              {t(panel.shortKey)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {t(panel.longKey)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {t(panel.descKey)}
            </Typography>
            <ConverterInputs
              labelFirst={t(panel.labelFirstKey)}
              labelSecond={t(panel.labelSecondKey)}
              coef={panel.coef}
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
