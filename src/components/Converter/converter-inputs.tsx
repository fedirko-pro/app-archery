import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export default function ConverterInputs(props: any) {
  return (
    <Box
      component="form"
      className="converter-inputs"
      sx={{
        '& .MuiTextField-root': { m: 1, width: '25ch' },
      }}
    >
      <TextField
        label={props.label}
        value={props.value}
        type="number"
        variant="filled"
        InputLabelProps={{
          shrink: true,
        }}
        onChange={props.onChange}
      />
    </Box>
  );
}
