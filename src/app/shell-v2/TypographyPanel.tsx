import { useMemo, useState } from 'react';
import { Box, Divider, MenuItem, Select, Stack, Typography } from '@mui/material';

import type { TypographyVariant } from '../../domain/typography.types';
import type { CssLengthValue, FontWeight, TextTransform } from '../../domain/value.types';
import { findGoogleFont, googleFontCatalog } from '../../fonts/catalog';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type { PreviewMode } from '../../state/editor-state.types';
import { resolveTypographyVariants } from '../../theme/create-runtime-theme';
import { ComponentStepperRow, SectionLabel, StepperRow } from './primitives';
import { shellBorderForMode } from './shell-border';

// Typography tab panel, from Figma frame 294:152: font family dropdown,
// base font size stepper, then a specimen row for each of the 13
// variants (name, sample text at the variant's size, and a
// "size · weight · line height" meta line), with an editor for the
// selected variant (size, weight, text transform, line height, letter
// spacing, all through set-typography-variant; spacing is per variant,
// there is no global letter-spacing field).
//
// The specimen and editor values come from the resolved runtime theme
// (resolveTypographyVariants), the same theme the preview renders and
// the exporter ships, so the panel shows the values the theme actually
// applies: a stored variant value where the project sets one, the
// baseline's overrides and MUI's built-in defaults where it does not
// (audit finding T1; the panel used to fall back to the frame's
// specimen scale, which the theme never applied). The frame keeps only
// the sample texts and the row order.

interface VariantSpec {
  variant: TypographyVariant;
  sample: string;
}

// The frame's specimen rows, in the frame's order.
const variantSpecs: VariantSpec[] = [
  { variant: 'h1', sample: 'Heading 1' },
  { variant: 'h2', sample: 'Heading 2' },
  { variant: 'h3', sample: 'Heading 3' },
  { variant: 'h4', sample: 'Heading 4' },
  { variant: 'h5', sample: 'Heading 5' },
  { variant: 'h6', sample: 'Heading 6' },
  { variant: 'subtitle1', sample: 'Subtitle 1' },
  { variant: 'subtitle2', sample: 'Subtitle 2' },
  { variant: 'body1', sample: 'Body 1' },
  { variant: 'body2', sample: 'Body 2' },
  { variant: 'button', sample: 'Button' },
  { variant: 'caption', sample: 'Caption' },
  { variant: 'overline', sample: 'OVERLINE' },
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
  fontSize: number;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing: number;
  textTransform?: TextTransform;
}

// The text transform select's choices: the four stored values plus
// Auto, the panels' word for an unset field (the stored variant omits
// the key and MUI's own variant default applies).
const textTransformOptions: { label: string; value: TextTransform | 'auto' }[] = [
  { label: 'Auto', value: 'auto' },
  { label: 'None', value: 'none' },
  { label: 'Capitalize', value: 'capitalize' },
  { label: 'Uppercase', value: 'uppercase' },
  { label: 'Lowercase', value: 'lowercase' },
];

function VariantRow({
  fontSize,
  fontWeight,
  letterSpacing,
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
          color: selected ? 'text.primary' : 'text.secondary',
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
          letterSpacing,
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
// spacing -2 to 10 step 0.1, weight one of 300-700. The values it
// shows and steps from are the variant's resolved values, so the
// first step from an unset variant pins the value the theme already
// applies (the pattern the Color panel's auto rows use).
function VariantEditor({ mode, row }: { mode: PreviewMode; row: VariantRowData }) {
  const dispatch = useEditorDispatch();
  const patch = (partial: {
    fontSize?: number;
    fontWeight?: FontWeight;
    lineHeight?: number;
    letterSpacing?: number;
    textTransform?: TextTransform;
  }) => dispatch({ type: 'set-typography-variant', variant: row.variant, patch: partial });

  const fontSize = asNumber(row.fontSize, 16);
  const lineHeight = asNumber(row.lineHeight, 1.5);
  const letterSpacing = asNumber(row.letterSpacing, 0);

  return (
    <Stack spacing={1.5} sx={{ border: shellBorderForMode(mode), borderRadius: '6px', p: 1.5 }}>
      <SectionLabel>{`${row.variant} settings`}</SectionLabel>
      <ComponentStepperRow
        label="Font size"
        mode={mode}
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
      <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
        <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>Text transform</Typography>
        <Box sx={{ ml: 'auto' }}>
          <Select
            inputProps={{ 'aria-label': 'Text transform' }}
            onChange={(event) => {
              const value = event.target.value as TextTransform | 'auto';
              // Auto clears the stored field: the patch names it with
              // no value and the reducer deletes the key, so the
              // variant goes back to MUI's own default.
              patch(
                value === 'auto' ? { textTransform: undefined } : { textTransform: value },
              );
            }}
            size="small"
            sx={{ fontSize: 14, fontWeight: 500, height: 30, width: 118 }}
            value={row.textTransform ?? 'auto'}
          >
            {textTransformOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
      <ComponentStepperRow
        label="Line height"
        mode={mode}
        onDecrement={() => patch({ lineHeight: round2(clamp(lineHeight - 0.05, 0.8, 3)) })}
        onIncrement={() => patch({ lineHeight: round2(clamp(lineHeight + 0.05, 0.8, 3)) })}
        value={formatLineHeight(row.lineHeight)}
      />
      <ComponentStepperRow
        label="Letter spacing"
        mode={mode}
        onDecrement={() => patch({ letterSpacing: round2(clamp(letterSpacing - 0.1, -2, 10)) })}
        onIncrement={() => patch({ letterSpacing: round2(clamp(letterSpacing + 0.1, -2, 10)) })}
        value={formatPx(row.letterSpacing)}
      />
    </Stack>
  );
}

// The family dropdown's value for a project with no stored font: the
// empty string, rendered by the System default entry below. A project
// that stores no font applies the baseline's system stack (audit
// finding T2), so the dropdown names that state instead of showing a
// family the theme does not use; choosing the entry clears a stored
// font back to it.
const NO_FONT_VALUE = '';

export function TypographyPanel() {
  const { activeMode, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const [selectedVariant, setSelectedVariant] = useState<TypographyVariant | null>(null);
  const typography = project.foundations?.typography;
  const storedFamily = typography?.font?.family;
  const baseFontSize = typography?.fontSize ?? 14;

  // The resolved variant values, rebuilt when the project changes:
  // what the preview renders and the exporter ships, per variant.
  const resolvedVariants = useMemo(() => resolveTypographyVariants(project), [project]);

  const rows: VariantRowData[] = variantSpecs.map((spec) => {
    const resolved = resolvedVariants[spec.variant];
    return {
      variant: spec.variant,
      sample: spec.sample,
      fontSize: resolved.fontSize,
      fontWeight: resolved.fontWeight,
      lineHeight: resolved.lineHeight,
      letterSpacing: resolved.letterSpacing,
      // The transform select reads the stored field only (task 1.5):
      // unset reads Auto, whatever the resolved theme applies.
      textTransform: typography?.variants?.[spec.variant]?.textTransform,
    };
  });
  const selectedRow = rows.find((row) => row.variant === selectedVariant);

  return (
    <Stack spacing={1.5}>
      <Stack spacing={1.5}>
        <SectionLabel>Font family</SectionLabel>
        <Select
          displayEmpty
          fullWidth
          inputProps={{ 'aria-label': 'Font family' }}
          onChange={(event) => {
            const value = event.target.value as string;
            if (value === NO_FONT_VALUE) {
              dispatch({ type: 'set-google-font', font: undefined });
              return;
            }
            const font = findGoogleFont(value);
            if (font) {
              // Picking a family stores its full catalog weight list
              // (audit finding T3): the exported theme's variants call
              // for weights up to 700, so loading and exporting only
              // 400 left the rest to synthesis.
              dispatch({
                type: 'set-google-font',
                font: { family: font.family, weights: font.weights, fallback: font.fallback },
              });
            }
          }}
          size="small"
          sx={{ fontSize: 14, fontWeight: 500, height: 30 }}
          value={storedFamily ?? NO_FONT_VALUE}
        >
          <MenuItem value={NO_FONT_VALUE}>System default</MenuItem>
          {googleFontCatalog.map((font) => (
            <MenuItem key={font.family} value={font.family}>
              {font.family}
            </MenuItem>
          ))}
          {/* A stored family outside the catalog (an imported project
              need not use one) is shown as itself, never silently
              relabeled as another family. */}
          {storedFamily && !findGoogleFont(storedFamily) && (
            <MenuItem value={storedFamily}>{storedFamily}</MenuItem>
          )}
        </Select>
      </Stack>
      <StepperRow
        label="Base font size"
        mode={activeMode}
        onDecrement={() =>
          dispatch({ type: 'set-base-font-size', value: clamp(baseFontSize - 1, 10, 24) })
        }
        onIncrement={() =>
          dispatch({ type: 'set-base-font-size', value: clamp(baseFontSize + 1, 10, 24) })
        }
        value={`${baseFontSize} px`}
      />
      {/* No global Letter spacing row: the model has no global
          letter-spacing field, so the frame's static "0 px" row read
          as a live control that did nothing (audit finding T6). Letter
          spacing is per variant, edited in the selected variant's
          settings below. */}
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
          <VariantEditor mode={activeMode} row={selectedRow} />
        </>
      )}
    </Stack>
  );
}
