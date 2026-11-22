import { MenuItem, TextField } from '@mui/material';

export function EnumControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <TextField select label={label} size="small" value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
    </TextField>
  );
}
