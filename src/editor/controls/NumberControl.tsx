import { TextField } from '@mui/material';

interface NumberControlProps {
  helperText?: string;
  label: string;
  max: number;
  min: number;
  onCommit: (value: number) => void;
  step?: number;
  value: number;
}

export function NumberControl({ helperText, label, max, min, onCommit, step = 1, value }: NumberControlProps) {
  return (
    <TextField
      key={value}
      defaultValue={value}
      fullWidth
      helperText={helperText}
      label={label}
      onBlur={(event) => {
        const next = Number(event.target.value);
        if (Number.isFinite(next)) onCommit(Math.min(max, Math.max(min, next)));
      }}
      onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
      slotProps={{ htmlInput: { min, max, step } }}
      size="small"
      type="number"
    />
  );
}
