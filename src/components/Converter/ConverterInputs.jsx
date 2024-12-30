import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export default function ConverterInputs(props) {
  const [firstValue, setFirstValue] = useState(0);
  const [secondValue, setSecondValue] = useState(0);

  return (
    <Box
      className="converter_inputs"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '45%' },
      }}
      autoComplete="off"
    >
      <TextField
        id="filled-number"
        label={props.labelFirst}
        value={firstValue.toString()}
        type="number"
        variant="filled"
        min={0}
        max={9999}
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => {
          let val = e.target.value.length ? parseFloat(e.target.value) : 0;
          setFirstValue(val);
          setSecondValue(val * props.coef);
        }}
      />
      <span className="equal">=</span>
      <TextField
        id="filled-number"
        label={props.labelSecond}
        value={secondValue.toString()}
        type="number"
        variant="filled"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={(e) => {
          let val = e.target.value.length ? parseFloat(e.target.value) : 0;
          setSecondValue(val);
          setFirstValue(val / props.coef);
        }}
      />
    </Box>
  );
}
