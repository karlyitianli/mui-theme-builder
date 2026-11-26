import { Box, Divider, Stack, Typography } from '@mui/material';

import { DEFAULT_SPACING } from '../../domain/foundation-defaults';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import { PresetPills, SectionLabel, StepperRow } from './primitives';

// Spacing tab panel, from Figma frame 294:298: density presets, the base
// spacing unit stepper, and the spacing scale derived from the base unit
// (multiplier, a bar as wide as the computed value, and the px label).
//
// The base unit comes from the existing editor state
// (foundations.spacing), falling back to the shared DEFAULT_SPACING of
// 4px. That fallback is the legacy meaning of an unset spacing: projects
// saved before spacing was stored display and export at 4px. Stored
// projects carry their base explicitly; the Black preset's project
// stores 8px. Phase 5 wired the stepper to set-spacing with the old
// inspector's 1-16 range.
//
// The project model has no density concept, so the density presets are
// implemented as base-unit presets: Compact, Comfortable, and Spacious
// are base units of 4px, 8px, and 12px (Karl's Nov 26, 2026 density
// decision, superseding the earlier 3px, 4px, 5px set), applied through
// the same set-spacing action. Comfortable (8px) is the default: the
// Black preset's project starts there. A base unit that is not one of
// those three shows no active preset.

const multipliers = [0, 1, 2, 3, 4, 6, 8, 10, 12];
const densityPresets = ['Compact', 'Comfortable', 'Spacious'];
const densityBaseUnits = [4, 8, 12];

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
  const { activeMode, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const baseUnit = project.foundations?.spacing ?? DEFAULT_SPACING;
  const setBaseUnit = (value: number) =>
    dispatch({ type: 'set-spacing', value: Math.min(16, Math.max(1, value)) });

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Density presets</SectionLabel>
      <PresetPills
        activeIndex={densityBaseUnits.indexOf(baseUnit)}
        mode={activeMode}
        onSelect={(index) => setBaseUnit(densityBaseUnits[index])}
        options={densityPresets}
      />
      <StepperRow
        label="Base spacing unit"
        mode={activeMode}
        onDecrement={() => setBaseUnit(baseUnit - 1)}
        onIncrement={() => setBaseUnit(baseUnit + 1)}
        value={`${baseUnit} px`}
      />
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
