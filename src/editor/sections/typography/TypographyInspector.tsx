import { useState } from 'react';
import { MenuItem, Stack, TextField, Typography } from '@mui/material';

import type { TypographyVariant } from '../../../domain/typography.types';
import type { FontWeight } from '../../../domain/value.types';
import { findGoogleFont } from '../../../fonts/catalog';
import { useEditorDispatch, useEditorState } from '../../../state/editor-hooks';
import { FontFamilyControl } from '../../controls/FontFamilyControl';
import { FontWeightControl } from '../../controls/FontWeightControl';
import { NumberControl } from '../../controls/NumberControl';

const variants: TypographyVariant[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'button', 'caption', 'overline'];
const weights: FontWeight[] = [300, 400, 500, 600, 700];

export function TypographyInspector() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const [variant, setVariant] = useState<TypographyVariant>('body1');
  const typography = project.foundations?.typography;
  const style = typography?.variants?.[variant];
  const selectedFont = findGoogleFont(typography?.font?.family ?? 'Roboto');

  return (
    <Stack spacing={3}>
      <Typography color="text.secondary" variant="body2">
        Font previews require internet access. The fallback stack remains available offline.
      </Typography>
      <FontFamilyControl
        value={selectedFont}
        onChange={(font) =>
          dispatch({
            type: 'set-google-font',
            font: { family: font.family, weights: [400], fallback: font.fallback },
          })
        }
      />
      {selectedFont && (
        <FontWeightControl
          available={selectedFont.weights}
          selected={typography?.font?.weights ?? [400]}
          onChange={(weights) =>
            dispatch({
              type: 'set-google-font',
              font: { family: selectedFont.family, weights, fallback: selectedFont.fallback },
            })
          }
        />
      )}
      <NumberControl label="Base font size" min={10} max={24} value={typography?.fontSize ?? 14} onCommit={(value) => dispatch({ type: 'set-base-font-size', value })} helperText="Pixels; MUI converts typography to rem units" />
      <TextField select fullWidth label="Typography variant" size="small" value={variant} onChange={(event) => setVariant(event.target.value as TypographyVariant)}>
        {variants.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
      </TextField>
      <NumberControl label={`${variant} font size`} min={8} max={128} step={0.5} value={typeof style?.fontSize === 'number' ? style.fontSize : 16} onCommit={(fontSize) => dispatch({ type: 'set-typography-variant', variant, patch: { fontSize } })} />
      <TextField select fullWidth label={`${variant} font weight`} size="small" value={style?.fontWeight ?? 400} onChange={(event) => dispatch({ type: 'set-typography-variant', variant, patch: { fontWeight: Number(event.target.value) as FontWeight } })}>
        {weights.map((weight) => <MenuItem key={weight} value={weight}>{weight}</MenuItem>)}
      </TextField>
      <NumberControl label={`${variant} line height`} min={0.8} max={3} step={0.05} value={typeof style?.lineHeight === 'number' ? style.lineHeight : 1.5} onCommit={(lineHeight) => dispatch({ type: 'set-typography-variant', variant, patch: { lineHeight } })} />
      <NumberControl label={`${variant} letter spacing`} min={-2} max={10} step={0.1} value={typeof style?.letterSpacing === 'number' ? style.letterSpacing : 0} onCommit={(letterSpacing) => dispatch({ type: 'set-typography-variant', variant, patch: { letterSpacing } })} helperText="Pixels" />
    </Stack>
  );
}
