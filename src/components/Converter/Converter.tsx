import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConverterInputs from './ConverterInputs.tsx';
import './Converter.scss';
import { useState } from 'react';

export default function Converter() {
  const [expanded, setExpanded] = useState<string | false>('false');

  const handleChange = (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : 'false');
  };

  return (
    <section>
      <div className="container">
        <h2>Converter of most common archery measures</h2>
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
              Inch - cm
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Inch - Centimeter
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>Used to measure bow and arrow length, etc.</div>
            <ConverterInputs
              labelFirst="Inch"
              labelSecond="Centimeter"
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
              Pound - kg
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Pound - Kilogram
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>Used to measure bow poundage</div>
            <ConverterInputs
              labelFirst="Pound"
              labelSecond="Kilogram"
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
              Grain - g
            </Typography>
            <Typography sx={{ color: 'text.secondary' }}>
              Grain - Gram
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div>Used to measure arrow/broadhead weight, etc.</div>
            <ConverterInputs
              labelFirst="Grain"
              labelSecond="Gram"
              coef={0.0647989}
            />
          </AccordionDetails>
        </Accordion>
      </div>
    </section>
  );
}
