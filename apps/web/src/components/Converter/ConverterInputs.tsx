import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { isNonNegativeDecimalInput } from '../../utils/non-negative-number';

interface ConverterInputsProps {
  labelFirst: string;
  labelSecond: string;
  coef: number;
}

export default function ConverterInputs(props: ConverterInputsProps) {
  const [firstValue, setFirstValue] = useState(0);
  const [secondValue, setSecondValue] = useState(0);
  const round3 = (n: number) => Math.round(n * 1000) / 1000;

  return (
    <Box className="converter_inputs">
      <TextField
        label={props.labelFirst}
        value={firstValue.toString()}
        type="number"
        size="small"
        inputProps={{ min: 0, max: 9999, inputMode: 'decimal' }}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!isNonNegativeDecimalInput(raw, 6)) return;
          const val = raw.length ? Math.max(0, parseFloat(raw) || 0) : 0;
          setFirstValue(round3(val));
          setSecondValue(round3(val * props.coef));
        }}
        sx={{ m: 1, width: { xs: '100%', sm: '40%' }, minWidth: 140 }}
      />
      <Typography className="equal" color="text.secondary" aria-hidden>
        =
      </Typography>
      <TextField
        label={props.labelSecond}
        value={secondValue.toString()}
        type="number"
        size="small"
        inputProps={{ min: 0, max: 9999, inputMode: 'decimal' }}
        InputLabelProps={{ shrink: true }}
        onChange={(e) => {
          const raw = e.target.value;
          if (!isNonNegativeDecimalInput(raw, 6)) return;
          const val = raw.length ? Math.max(0, parseFloat(raw) || 0) : 0;
          setSecondValue(round3(val));
          setFirstValue(round3(val / props.coef));
        }}
        sx={{ m: 1, width: { xs: '100%', sm: '40%' }, minWidth: 140 }}
      />
    </Box>
  );
}
