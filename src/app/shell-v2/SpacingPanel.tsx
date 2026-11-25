import { Box, Divider, Stack, Typography } from '@mui/material';

import { useEditorState } from '../../state/editor-hooks';
import { PresetPills, SectionLabel, StepperRow } from './primitives';

// Spacing tab panel, from Figma frame 294:298: density presets, the base
// spacing unit stepper, and the spacing scale derived from the base unit
// (multiplier, a bar as wide as the computed value, and the px label).
//
// The base unit comes from the existing editor state
// (foundations.spacing). The v2 design's base unit is 4px (Karl's Nov 23
// decision, superseding the old shell inspector's 8px fallback), so an
// unset project shows 4 here. Density is not stored in the project model;
// the frame shows Comfortable (1x) active and the scale is drawn from the
// base unit alone, so the pills are static in this phase.

const multipliers = [0, 1, 2, 3, 4, 6, 8, 10, 12];
const densityPresets = ['Compact', 'Comfortable', 'Spacious'];

function ScaleRow({ multiplier, px }: { multiplier: number; px: number }) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, height: 16 }}>
      <Typography
        sx={{ flexShrink: 0, fontSize: 13, fontWeight: 500, lineHeight: '16px', width: 24 }}
      >
        {`\u00D7${multiplier}`}
      </Typography>
      {px > 0 && (
        <Box
          sx={{
            bgcolor: 'primary.main',
            borderRadius: '4px',
            flexShrink: 0,
            height: 8,
            width: px,
          }}
        />
      )}
      <Typography color="text.secondary" sx={{ fontSize: 12, lineHeight: '15px' }}>
        {`${px} px`}
      </Typography>
    </Box>
  );
}

export function SpacingPanel() {
  const { project } = useEditorState();
  const baseUnit = project.foundations?.spacing ?? 4;

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Density presets</SectionLabel>
      <PresetPills activeIndex={1} options={densityPresets} />
      <StepperRow label="Base spacing unit" value={`${baseUnit} px`} />
      <Divider />
      <SectionLabel>Spacing scale</SectionLabel>
      <Stack spacing={1.5}>
        {multipliers.map((multiplier) => (
          <ScaleRow key={multiplier} multiplier={multiplier} px={multiplier * baseUnit} />
        ))}
      </Stack>
    </Stack>
  );
}
