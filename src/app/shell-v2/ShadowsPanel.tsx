import { Divider, Stack } from '@mui/material';

import {
  ComponentStepperRow,
  PresetPills,
  SectionLabel,
  StepperRow,
} from './primitives';

// Shadows tab panel, from Figma frame 294:590: preset pills (None,
// Subtle, Medium, Strong), the global elevation stepper, and
// per-component override steppers for Button, Card, and Input.
//
// The project model has no shadow settings yet, so the panel shows
// Karl's locked v2 design values (Nov 23): the Medium preset, a global
// elevation of 2, and overrides Button 2, Card 1, Input 0. Elevations are
// unitless, so they render as plain numbers rather than the frame's
// stray "px" suffixes (its steppers were copied from the Radius tab and
// read 6px for every override). Controls are layout only in this phase.

const shadowPresets = ['None', 'Subtle', 'Medium', 'Strong'];

export function ShadowsPanel() {
  return (
    <Stack spacing={1.5}>
      <SectionLabel>Presets</SectionLabel>
      <PresetPills activeIndex={2} gap={10} options={shadowPresets} />
      <StepperRow label="Global elevation" value="2" />
      <Divider />
      <SectionLabel>Overrides</SectionLabel>
      <ComponentStepperRow label="Button" value="2" />
      <ComponentStepperRow label="Card" value="1" />
      <ComponentStepperRow label="Input" value="0" />
    </Stack>
  );
}
