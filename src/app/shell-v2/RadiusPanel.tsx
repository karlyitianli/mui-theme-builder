import { Divider, Stack } from '@mui/material';

import type { CssLengthValue } from '../../domain/value.types';
import { useEditorState } from '../../state/editor-hooks';
import {
  ComponentStepperRow,
  PresetPills,
  SectionLabel,
  StepperRow,
} from './primitives';

// Radius tab panel, from Figma frame 294:444: preset pills, the global
// border radius stepper, and per-component override steppers for Button,
// Card, and Input.
//
// The global value comes from the existing editor state
// (foundations.shape.borderRadius, 6px default). Button and Input fall
// back to the global value unless their component settings carry their
// own border radius. The project model has no card radius field, so Card
// shows the frame's 12px design value. The frame's pill row literally
// reads Sharp / Rounded / Spacious with Rounded active (its open preset
// menu, a transient state, lists Sharp / Subtle / Rounded / Pill and is
// not reproduced). Controls are layout only in this phase.

const radiusPresets = ['Sharp', 'Rounded', 'Spacious'];

function formatRadius(value: CssLengthValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

export function RadiusPanel() {
  const { project } = useEditorState();
  const globalRadius = project.foundations?.shape?.borderRadius ?? 6;
  const buttonRadius = project.components?.button?.style?.border?.radius ?? globalRadius;
  const inputRadius = project.components?.textField?.style?.border?.radius ?? globalRadius;
  const cardRadius = 12;

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Preset</SectionLabel>
      <PresetPills activeIndex={1} options={radiusPresets} />
      <StepperRow label="Global border radius" value={formatRadius(globalRadius)} />
      <Divider />
      <SectionLabel>Overrides</SectionLabel>
      <ComponentStepperRow label="Button" value={formatRadius(buttonRadius)} />
      <ComponentStepperRow label="Card" value={formatRadius(cardRadius)} />
      <ComponentStepperRow label="Input" value={formatRadius(inputRadius)} />
    </Stack>
  );
}
