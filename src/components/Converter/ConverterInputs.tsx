import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useState } from 'react';

export default function ConverterInputs(props: any) {
    const [firstValue, setFirstValue] = useState(0);
    const [secondValue, setSecondValue] = useState(0);
    const round2 = (n: number) => Math.round(n * 100) / 100;
  
    return (
      <Box
        className="converter_inputs"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '45%' },
        }}
      >
        <TextField
          label={props.labelFirst}
          value={firstValue.toString()}
          type="number"
          variant="filled"
          inputProps={{
            min: 0,
            max: 9999,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => {
            let val = e.target.value.length ? parseFloat(e.target.value) : 0;
            const roundedFirst = round2(val);
            const roundedSecond = round2(val * props.coef);
            setFirstValue(roundedFirst);
            setSecondValue(roundedSecond);
          }}
        />
        <span className="equal">=</span>
        <TextField
          label={props.labelSecond}
          value={secondValue.toString()}
          type="number"
          variant="filled"
          inputProps={{
            min: 0,
            max: 9999,
          }}
          InputLabelProps={{
            shrink: true,
          }}
          onChange={(e) => {
            let val = e.target.value.length ? parseFloat(e.target.value) : 0;
            const roundedSecond = round2(val);
            const roundedFirst = round2(val / props.coef);
            setSecondValue(roundedSecond);
            setFirstValue(roundedFirst);
          }}
        />
      </Box>
    );
  }  