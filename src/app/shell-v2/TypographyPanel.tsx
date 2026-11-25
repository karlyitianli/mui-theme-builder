import { useState } from 'react';
import { Box, Divider, MenuItem, Select, Stack, Typography } from '@mui/material';

import type { TypographyVariant } from '../../domain/typography.types';
import type { CssLengthValue, FontWeight } from '../../domain/value.types';
import { findGoogleFont, googleFontCatalog } from '../../fonts/catalog';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import { ComponentStepperRow, SectionLabel, StepperRow } from './primitives';

// Typography tab panel, from Figma frame 294:152: font family dropdown,
// base font size and letter spacing steppers, then a specimen row for each
// of the 13 variants (name, sample text at the variant's size, and a
// "size · weight · line height" meta line).
//
// Phase 5 wired the controls to the same actions the old shell's
// TypographyInspector uses: the family dropdown dispatches set-google-font
// (with the inspector's [400] weight list), the base size stepper
// dispatches set-base-font-size, and clicking a specimen row selects that
// variant and opens its editor (size, weight, line height, letter
// spacing, all through set-typography-variant, the only letter-spacing
// action the model has; spacing is per variant, there is no global
// letter-spacing field). Values fall back to the frame's specimen values
// when the project does not set a variant.

interface VariantSpec {
  variant: TypographyVariant;
  sample: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
}

// The frame's specimen defaults, in the frame's order.
const variantSpecs: VariantSpec[] = [
  { variant: 'h1', sample: 'Heading 1', fontSize: 32, fontWeight: 700, lineHeight: 1.2 },
  { variant: 'h2', sample: 'Heading 2', fontSize: 28, fontWeight: 700, lineHeight: 1.25 },
  { variant: 'h3', sample: 'Heading 3', fontSize: 24, fontWeight: 600, lineHeight: 1.3 },
  { variant: 'h4', sample: 'Heading 4', fontSize: 20, fontWeight: 600, lineHeight: 1.35 },
  { variant: 'h5', sample: 'Heading 5', fontSize: 18, fontWeight: 600, lineHeight: 1.4 },
  { variant: 'h6', sample: 'Heading 6', fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  { variant: 'subtitle1', sample: 'Subtitle 1', fontSize: 16, fontWeight: 400, lineHeight: 1.75 },
  { variant: 'subtitle2', sample: 'Subtitle 2', fontSize: 14, fontWeight: 500, lineHeight: 1.57 },
  { variant: 'body1', sample: 'Body 1', fontSize: 16, fontWeight: 400, lineHeight: 1.5 },
  { variant: 'body2', sample: 'Body 2', fontSize: 14, fontWeight: 400, lineHeight: 1.43 },
  { variant: 'button', sample: 'Button', fontSize: 14, fontWeight: 500, lineHeight: 1.75 },
  { variant: 'caption', sample: 'Caption', fontSize: 12, fontWeight: 400, lineHeight: 1.66 },
  { variant: 'overline', sample: 'OVERLINE', fontSize: 12, fontWeight: 500, lineHeight: 2.66 },
];

const weightOptions = ['300', '400', '500', '600', '700'];

function formatPx(value: CssLengthValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function formatLineHeight(value: number | string): string {
  return typeof value === 'number' ? value.toFixed(2) : value;
}

function asNumber(value: CssLengthValue | number | string | undefined, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round2 = (value: number) => Math.round(value * 100) / 100;

interface VariantRowData {
  variant: TypographyVariant;
  sample: string;
  fontSize: CssLengthValue;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing: CssLengthValue;
}

function VariantRow({
  fontSize,
  fontWeight,
  lineHeight,
  onSelect,
  sample,
  selected,
  variant,
}: VariantRowData & { onSelect: () => void; selected: boolean }) {
  const meta = `${formatPx(fontSize)} \u00B7 ${fontWeight} \u00B7 ${formatLineHeight(lineHeight)}`;
  return (
    <Box
      aria-pressed={selected}
      onClick={onSelect}
      role="button"
      sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex', gap: 1.5 }}
    >
      <Typography
        sx={{
          color: selected ? 'text.primary' : '#a3a3a3',
          flexShrink: 0,
          fontSize: 12,
          fontWeight: selected ? 600 : 400,
          lineHeight: '15px',
        }}
      >
        {variant}
      </Typography>
      <Typography
        noWrap
        sx={{
          fontSize,
          fontWeight,
          lineHeight,
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {sample}
      </Typography>
      <Typography
        sx={{
          color: 'text.secondary',
          flexShrink: 0,
          fontSize: 11,
          lineHeight: '13px',
          ml: 'auto',
          pl: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {meta}
      </Typography>
    </Box>
  );
}

// Editor for the selected variant, with the old inspector's ranges:
// font size 8-128 step 0.5, line height 0.8-3 step 0.05, letter
// spacing -2 to 10 step 0.1, weight one of 300-700.
function VariantEditor({ row }: { row: VariantRowData }) {
  const dispatch = useEditorDispatch();
  const patch = (partial: { fontSize?: number; fontWeight?: FontWeight; lineHeight?: number; letterSpacing?: number }) =>
    dispatch({ type: 'set-typography-variant', variant: row.variant, patch: partial });

  const fontSize = asNumber(row.fontSize, 16);
  const lineHeight = asNumber(row.lineHeight, 1.5);
  const letterSpacing = asNumber(row.letterSpacing, 0);

  return (
    <Stack spacing={1.5} sx={{ border: '1px solid #e5e5e5', borderRadius: '6px', p: 1.5 }}>
      <SectionLabel>{`${row.variant} settings`}</SectionLabel>
      <ComponentStepperRow
        label="Font size"
        onDecrement={() => patch({ fontSize: clamp(fontSize - 0.5, 8, 128) })}
        onIncrement={() => patch({ fontSize: clamp(fontSize + 0.5, 8, 128) })}
        value={formatPx(row.fontSize)}
      />
      <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
        <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>Font weight</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Select
            inputProps={{ 'aria-label': 'Font weight' }}
            onChange={(event) => patch({ fontWeight: Number(event.target.value) as FontWeight })}
            size="small"
            sx={{ fontSize: 14, fontWeight: 500, height: 30, width: 98 }}
            value={String(row.fontWeight)}
          >
            {(weightOptions.includes(String(row.fontWeight))
              ? weightOptions
              : [...weightOptions, String(row.fontWeight)].sort((a, b) => Number(a) - Number(b))
            ).map((weight) => (
              <MenuItem key={weight} value={weight}>
                {weight}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <ComponentStepperRow
        label="Line height"
        onDecrement={() => patch({ lineHeight: round2(clamp(lineHeight - 0.05, 0.8, 3)) })}
        onIncrement={() => patch({ lineHeight: round2(clamp(lineHeight + 0.05, 0.8, 3)) })}
        value={formatLineHeight(row.lineHeight)}
      />
      <ComponentStepperRow
        label="Letter spacing"
        onDecrement={() => patch({ letterSpacing: round2(clamp(letterSpacing - 0.1, -2, 10)) })}
        onIncrement={() => patch({ letterSpacing: round2(clamp(letterSpacing + 0.1, -2, 10)) })}
        value={formatPx(row.letterSpacing)}
      />
    </Stack>
  );
}

export function TypographyPanel() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const [selectedVariant, setSelectedVariant] = useState<TypographyVariant | null>(null);
  const typography = project.foundations?.typography;
  // The v2 design is Inter-first; the frame's dropdown shows Inter when no
  // project font is set (the old shell's inspector defaults to Roboto).
  const fontFamily = typography?.font?.family ?? 'Inter';
  const baseFontSize = typography?.fontSize ?? 14;

  const rows: VariantRowData[] = variantSpecs.map((spec) => {
    const style = typography?.variants?.[spec.variant];
    return {
      variant: spec.variant,
      sample: spec.sample,
      fontSize: style?.fontSize ?? spec.fontSize,
      fontWeight: style?.fontWeight ?? spec.fontWeight,
      lineHeight: style?.lineHeight ?? spec.lineHeight,
      letterSpacing: style?.letterSpacing ?? 0,
    };
  });
  const selectedRow = rows.find((row) => row.variant === selectedVariant);

  return (
    <Stack spacing={1.5}>
      <Stack spacing={1.5}>
        <SectionLabel>Font family</SectionLabel>
        <Select
          fullWidth
          inputProps={{ 'aria-label': 'Font family' }}
          onChange={(event) => {
            const font = findGoogleFont(event.target.value as string);
            if (font) {
              dispatch({
                type: 'set-google-font',
                font: { family: font.family, weights: [400], fallback: font.fallback },
              });
            }
          }}
          size="small"
          sx={{ fontSize: 14, fontWeight: 500, height: 30 }}
          value={findGoogleFont(fontFamily) ? fontFamily : 'Inter'}
        >
          {googleFontCatalog.map((font) => (
            <MenuItem key={font.family} value={font.family}>
              {font.family}
            </MenuItem>
          ))}
        </Select>
      </Stack>
      <StepperRow
        label="Base font size"
        onDecrement={() =>
          dispatch({ type: 'set-base-font-size', value: clamp(baseFontSize - 1, 10, 24) })
        }
        onIncrement={() =>
          dispatch({ type: 'set-base-font-size', value: clamp(baseFontSize + 1, 10, 24) })
        }
        value={`${baseFontSize} px`}
      />
      {/* Letter spacing is per variant in the project model (there is no
          global field), so the editor for it lives in the selected
          variant's settings below; this row keeps the frame's global
          display value. */}
      <StepperRow label="Letter spacing" value="0 px" />
      <Divider />
      <SectionLabel>Type specimens</SectionLabel>
      <Stack spacing={1.5}>
        {rows.map((row) => (
          <VariantRow
            key={row.variant}
            {...row}
            onSelect={() =>
              setSelectedVariant((previous) => (previous === row.variant ? null : row.variant))
            }
            selected={selectedVariant === row.variant}
          />
        ))}
      </Stack>
      {selectedRow && (
        <>
          <Divider />
          <VariantEditor row={selectedRow} />
        </>
      )}
    </Stack>
  );
}
