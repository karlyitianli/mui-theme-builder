import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Box, Divider, Stack, Typography } from '@mui/material';

import type { TypographyVariant } from '../../domain/typography.types';
import type { CssLengthValue } from '../../domain/value.types';
import { useEditorState } from '../../state/editor-hooks';
import { SectionLabel, StepperRow } from './primitives';

// Typography tab panel, from Figma frame 294:152: font family dropdown,
// base font size and letter spacing steppers, then a specimen row for each
// of the 13 variants (name, sample text at the variant's size, and a
// "size · weight · line height" meta line).
//
// Values come from the existing editor state (foundations.typography),
// falling back to the frame's specimen values when the project does not
// set a variant. Controls are layout only in this phase; nothing here
// dispatches changes.

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

function formatPx(value: CssLengthValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function formatLineHeight(value: number | string): string {
  return typeof value === 'number' ? value.toFixed(2) : value;
}

interface VariantRowData {
  variant: TypographyVariant;
  sample: string;
  fontSize: CssLengthValue;
  fontWeight: number;
  lineHeight: number | string;
}

function VariantRow({ fontSize, fontWeight, lineHeight, sample, variant }: VariantRowData) {
  const meta = `${formatPx(fontSize)} \u00B7 ${fontWeight} \u00B7 ${formatLineHeight(lineHeight)}`;
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5 }}>
      <Typography sx={{ color: '#a3a3a3', flexShrink: 0, fontSize: 12, lineHeight: '15px' }}>
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

export function TypographyPanel() {
  const { project } = useEditorState();
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
    };
  });

  return (
    <Stack spacing={1.5}>
      <Stack spacing={1.5}>
        <SectionLabel>Font family</SectionLabel>
        <Box
          sx={{
            alignItems: 'center',
            bgcolor: 'background.paper',
            border: '1px solid #e5e5e5',
            borderRadius: '6px',
            display: 'flex',
            height: 30,
            px: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>
            {fontFamily}
          </Typography>
          <CaretDownIcon size={16} style={{ marginLeft: 'auto' }} />
        </Box>
      </Stack>
      <StepperRow label="Base font size" value={`${baseFontSize} px`} />
      {/* The project model has no global letter-spacing field (spacing is
          per variant), so this row shows the frame's 0 px design value. */}
      <StepperRow label="Letter spacing" value="0 px" />
      <Divider />
      <SectionLabel>Type specimens</SectionLabel>
      <Stack spacing={1.5}>
        {rows.map((row) => (
          <VariantRow key={row.variant} {...row} />
        ))}
      </Stack>
    </Stack>
  );
}
