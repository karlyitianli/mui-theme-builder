import { Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

import type { FontWeight } from '../../domain/value.types';

export function FontWeightControl({
  available,
  selected,
  onChange,
}: {
  available: FontWeight[];
  selected: FontWeight[];
  onChange: (weights: FontWeight[]) => void;
}) {
  return (
    <FormGroup>
      <Typography variant="subtitle2">Loaded weights</Typography>
      {available.map((weight) => (
        <FormControlLabel
          key={weight}
          control={
            <Checkbox
              checked={selected.includes(weight)}
              disabled={weight === 400}
              onChange={(_, checked) => {
                const weights = checked
                  ? [...selected, weight]
                  : selected.filter((selectedWeight) => selectedWeight !== weight);
                onChange([...new Set(weights)].sort((left, right) => left - right));
              }}
            />
          }
          label={weight}
        />
      ))}
    </FormGroup>
  );
}
