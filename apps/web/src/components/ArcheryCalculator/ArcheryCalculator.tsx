import './ArcheryCalculator.scss';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import {
  calculateArrowWeightGrains,
  calculateFoc,
  calculateGpp,
  calculateKineticEnergy,
  calculateMomentum,
  estimateDrawLength,
  suggestSpine,
} from '../../utils/archery-calculator';
import CalculatorNumberField, { parseOptionalNumber } from './CalculatorNumberField';

function ResultBox({ value, unit, hint }: { value: string | null; unit?: string; hint?: string }) {
  const { t } = useTranslation('common');
  return (
    <Box
      sx={{
        mt: 1.5,
        px: 1.75,
        py: 1.5,
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        {value == null ? t('calculator.enterValues') : unit ? `${value} ${unit}` : value}
      </Typography>
      {hint ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {hint}
        </Typography>
      ) : null}
    </Box>
  );
}

function PanelDesc({ children }: { children: ReactNode }) {
  return (
    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
      {children}
    </Typography>
  );
}

function FocPanel() {
  const { t } = useTranslation('common');
  const [arrowLength, setArrowLength] = useState('');
  const [balancePoint, setBalancePoint] = useState('');
  const foc = calculateFoc(parseOptionalNumber(arrowLength), parseOptionalNumber(balancePoint));
  const hint =
    foc == null
      ? undefined
      : foc < 7
        ? t('calculator.foc.hintLow')
        : foc <= 12
          ? t('calculator.foc.hintTarget')
          : foc <= 18
            ? t('calculator.foc.hintHunting')
            : t('calculator.foc.hintHigh');

  return (
    <>
      <PanelDesc>{t('calculator.foc.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.foc.arrowLength')}
          value={arrowLength}
          onChange={setArrowLength}
        />
        <CalculatorNumberField
          label={t('calculator.foc.balancePoint')}
          value={balancePoint}
          onChange={setBalancePoint}
          helperText={t('calculator.foc.balanceHint')}
        />
      </div>
      <ResultBox value={foc == null ? null : foc.toFixed(2)} unit="%" hint={hint} />
    </>
  );
}

function ArrowWeightPanel() {
  const { t } = useTranslation('common');
  const [gpi, setGpi] = useState('');
  const [shaftLength, setShaftLength] = useState('');
  const [point, setPoint] = useState('100');
  const [insert, setInsert] = useState('14');
  const [nock, setNock] = useState('8');
  const [fletching, setFletching] = useState('18');
  const total = calculateArrowWeightGrains({
    gpi: parseOptionalNumber(gpi),
    shaftLengthIn: parseOptionalNumber(shaftLength),
    pointGrains: parseOptionalNumber(point),
    insertGrains: parseOptionalNumber(insert),
    nockGrains: parseOptionalNumber(nock),
    fletchingGrains: parseOptionalNumber(fletching),
  });

  return (
    <>
      <PanelDesc>{t('calculator.arrowWeight.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.arrowWeight.gpi')}
          value={gpi}
          onChange={setGpi}
        />
        <CalculatorNumberField
          label={t('calculator.arrowWeight.shaftLength')}
          value={shaftLength}
          onChange={setShaftLength}
        />
        <CalculatorNumberField
          label={t('calculator.arrowWeight.point')}
          value={point}
          onChange={setPoint}
        />
        <CalculatorNumberField
          label={t('calculator.arrowWeight.insert')}
          value={insert}
          onChange={setInsert}
        />
        <CalculatorNumberField
          label={t('calculator.arrowWeight.nock')}
          value={nock}
          onChange={setNock}
        />
        <CalculatorNumberField
          label={t('calculator.arrowWeight.fletching')}
          value={fletching}
          onChange={setFletching}
        />
      </div>
      <ResultBox value={total == null ? null : total.toFixed(1)} unit={t('units.grain')} />
    </>
  );
}

function KePanel() {
  const { t } = useTranslation('common');
  const [weight, setWeight] = useState('');
  const [speed, setSpeed] = useState('');
  const w = parseOptionalNumber(weight);
  const s = parseOptionalNumber(speed);
  const ke = calculateKineticEnergy(w, s);
  const momentum = calculateMomentum(w, s);

  return (
    <>
      <PanelDesc>{t('calculator.ke.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.ke.arrowWeight')}
          value={weight}
          onChange={setWeight}
        />
        <CalculatorNumberField label={t('calculator.ke.speed')} value={speed} onChange={setSpeed} />
      </div>
      <ResultBox
        value={
          ke == null || momentum == null
            ? null
            : `${ke.toFixed(2)} ft·lb · ${momentum.toFixed(3)} slug·ft/s`
        }
        hint={t('calculator.ke.resultHint')}
      />
    </>
  );
}

function DrawLengthPanel() {
  const { t } = useTranslation('common');
  const [wingspan, setWingspan] = useState('');
  const draw = estimateDrawLength(parseOptionalNumber(wingspan));

  return (
    <>
      <PanelDesc>{t('calculator.drawLength.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.drawLength.wingspan')}
          value={wingspan}
          onChange={setWingspan}
          helperText={t('calculator.drawLength.wingspanHint')}
        />
      </div>
      <ResultBox
        value={draw == null ? null : draw.toFixed(2)}
        unit={t('units.inch')}
        hint={t('calculator.drawLength.resultHint')}
      />
    </>
  );
}

function SpinePanel() {
  const { t } = useTranslation('common');
  const [drawWeight, setDrawWeight] = useState('');
  const [arrowLength, setArrowLength] = useState('28');
  const [point, setPoint] = useState('100');
  const suggestion = suggestSpine({
    drawWeightLbs: parseOptionalNumber(drawWeight),
    arrowLengthIn: parseOptionalNumber(arrowLength),
    pointWeightGrains: parseOptionalNumber(point),
  });

  return (
    <>
      <PanelDesc>{t('calculator.spine.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.spine.drawWeight')}
          value={drawWeight}
          onChange={setDrawWeight}
        />
        <CalculatorNumberField
          label={t('calculator.spine.arrowLength')}
          value={arrowLength}
          onChange={setArrowLength}
        />
        <CalculatorNumberField
          label={t('calculator.spine.pointWeight')}
          value={point}
          onChange={setPoint}
        />
      </div>
      <ResultBox
        value={
          suggestion == null
            ? null
            : t('calculator.spine.result', {
                low: suggestion.spineLow,
                high: suggestion.spineHigh,
              })
        }
        hint={
          suggestion == null
            ? undefined
            : t('calculator.spine.resultHint', { dw: suggestion.effectiveDrawWeight })
        }
      />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1.5, fontStyle: 'italic', display: 'flex', alignItems: 'flex-start', gap: 0.75 }}
      >
        <InfoOutlinedIcon fontSize="small" sx={{ mt: '1px', flexShrink: 0 }} />
        {t('calculator.spine.consultManual')}
      </Typography>
    </>
  );
}

function GppPanel() {
  const { t } = useTranslation('common');
  const [weight, setWeight] = useState('');
  const [drawWeight, setDrawWeight] = useState('');
  const gpp = calculateGpp(parseOptionalNumber(weight), parseOptionalNumber(drawWeight));
  const hint =
    gpp == null
      ? undefined
      : gpp < 5
        ? t('calculator.gpp.hintLight')
        : gpp < 8
          ? t('calculator.gpp.hintTarget')
          : gpp <= 10
            ? t('calculator.gpp.hintHunting')
            : t('calculator.gpp.hintHeavy');

  return (
    <>
      <PanelDesc>{t('calculator.gpp.desc')}</PanelDesc>
      <div className="calculator-fields">
        <CalculatorNumberField
          label={t('calculator.gpp.arrowWeight')}
          value={weight}
          onChange={setWeight}
        />
        <CalculatorNumberField
          label={t('calculator.gpp.drawWeight')}
          value={drawWeight}
          onChange={setDrawWeight}
        />
      </div>
      <ResultBox value={gpp == null ? null : gpp.toFixed(2)} unit="GPP" hint={hint} />
    </>
  );
}

const PANELS = [
  {
    id: 'foc',
    titleKey: 'calculator.foc.title',
    shortKey: 'calculator.foc.short',
    Panel: FocPanel,
  },
  {
    id: 'arrowWeight',
    titleKey: 'calculator.arrowWeight.title',
    shortKey: 'calculator.arrowWeight.short',
    Panel: ArrowWeightPanel,
  },
  { id: 'ke', titleKey: 'calculator.ke.title', shortKey: 'calculator.ke.short', Panel: KePanel },
  {
    id: 'drawLength',
    titleKey: 'calculator.drawLength.title',
    shortKey: 'calculator.drawLength.short',
    Panel: DrawLengthPanel,
  },
  {
    id: 'spine',
    titleKey: 'calculator.spine.title',
    shortKey: 'calculator.spine.short',
    Panel: SpinePanel,
  },
  {
    id: 'gpp',
    titleKey: 'calculator.gpp.title',
    shortKey: 'calculator.gpp.short',
    Panel: GppPanel,
  },
] as const;

export default function ArcheryCalculator() {
  const { t } = useTranslation('common');
  const [expanded, setExpanded] = useState<string | false>('foc');

  return (
    <div className="archery-calculator">
      {PANELS.map(({ id, titleKey, shortKey, Panel }) => (
        <Accordion
          key={id}
          expanded={expanded === id}
          onChange={(_e, isExpanded) => setExpanded(isExpanded ? id : false)}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography
              variant="subtitle1"
              sx={{ width: { xs: '40%', sm: '33%' }, flexShrink: 0, fontWeight: 700 }}
            >
              {t(shortKey)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
              {t(titleKey)}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Panel />
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
}
