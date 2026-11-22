import { useState } from 'react';
import { Box, Stack, TextField, Typography } from '@mui/material';

interface ColorControlProps {
  inherited: boolean;
  label: string;
  onCommit: (value: string) => void;
  value: string;
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export function ColorControl({ inherited, label, onCommit, value }: ColorControlProps) {
  const [draft, setDraft] = useState(value);
  const valid = HEX_COLOR.test(draft);

  const commit = () => {
    if (valid) onCommit(draft.toLowerCase());
    else setDraft(value);
  };

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2">{label}</Typography>
        {inherited && (
          <Typography color="text.secondary" variant="caption">
            MUI default
          </Typography>
        )}
      </Stack>
      <Stack direction="row" spacing={1}>
        <Box
          aria-label={`${label} color picker`}
          component="input"
          onChange={(event) => {
            const color = event.currentTarget.value;
            setDraft(color);
            onCommit(color.toLowerCase());
          }}
          sx={{ bgcolor: 'transparent', border: 0, cursor: 'pointer', height: 40, p: 0, width: 48 }}
          type="color"
          value={valid ? draft : value}
        />
        <TextField
          error={!valid}
          fullWidth
          onBlur={commit}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
          size="small"
          value={draft}
        />
      </Stack>
    </Stack>
  );
}
