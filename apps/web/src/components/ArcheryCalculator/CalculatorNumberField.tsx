import TextField from '@mui/material/TextField';

interface CalculatorNumberFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number | string;
}

export default function CalculatorNumberField({
  label,
  value,
  onChange,
  helperText,
  min = 0,
  max = 9999,
  step = 'any',
}: CalculatorNumberFieldProps) {
  return (
    <TextField
      label={label}
      value={value}
      type="number"
      size="small"
      helperText={helperText}
      inputProps={{ min, max, step }}
      InputLabelProps={{ shrink: true }}
      onChange={(e) => onChange(e.target.value)}
      sx={{ m: 1, width: { xs: '100%', sm: '45%' }, minWidth: 140 }}
    />
  );
}

export function parseOptionalNumber(value: string): number {
  if (value.trim() === '') return 0;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}
