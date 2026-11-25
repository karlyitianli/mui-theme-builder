import { Divider, Stack } from '@mui/material';

import { resolveShadows, type ShadowSettings } from '../../domain/foundation-defaults';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
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
// Phase 5 gave shadows a project-model home
// (foundations.shadows: global, button, card, input elevations) and
// wired the panel: the steppers dispatch set-shadow-elevation clamped
// to MUI's 0-24 elevation range, and a preset dispatches one set-shadows
// action with the preset's full elevation set, so a preset is a single
// undo step. Unset values fall back to Karl's locked Medium values
// (global 2, Button 2, Card 1, Input 0). The other preset sets are
// None (all 0), Subtle (1, 1, 1, 0), and Strong (4, 4, 3, 2).
// Elevations are unitless, so they render as plain numbers.

const shadowPresets = ['None', 'Subtle', 'Medium', 'Strong'];
const shadowPresetValues: Array<Required<ShadowSettings>> = [
  { global: 0, button: 0, card: 0, input: 0 },
  { global: 1, button: 1, card: 1, input: 0 },
  { global: 2, button: 2, card: 1, input: 0 },
  { global: 4, button: 4, card: 3, input: 2 },
];

const clampElevation = (value: number) => Math.min(24, Math.max(0, value));

export function ShadowsPanel() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const shadows = resolveShadows(project.foundations?.shadows);
  const activePreset = shadowPresetValues.findIndex(
    (preset) =>
      preset.global === shadows.global &&
      preset.button === shadows.button &&
      preset.card === shadows.card &&
      preset.input === shadows.input,
  );
  const setElevation = (target: keyof ShadowSettings, value: number) =>
    dispatch({ type: 'set-shadow-elevation', target, value: clampElevation(value) });

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Presets</SectionLabel>
      <PresetPills
        activeIndex={activePreset}
        gap={10}
        onSelect={(index) => dispatch({ type: 'set-shadows', shadows: shadowPresetValues[index] })}
        options={shadowPresets}
      />
      <StepperRow
        label="Global elevation"
        onDecrement={() => setElevation('global', shadows.global - 1)}
        onIncrement={() => setElevation('global', shadows.global + 1)}
        value={String(shadows.global)}
      />
      <Divider />
      <SectionLabel>Overrides</SectionLabel>
      <ComponentStepperRow
        label="Button"
        onDecrement={() => setElevation('button', shadows.button - 1)}
        onIncrement={() => setElevation('button', shadows.button + 1)}
        value={String(shadows.button)}
      />
      <ComponentStepperRow
        label="Card"
        onDecrement={() => setElevation('card', shadows.card - 1)}
        onIncrement={() => setElevation('card', shadows.card + 1)}
        value={String(shadows.card)}
      />
      <ComponentStepperRow
        label="Input"
        onDecrement={() => setElevation('input', shadows.input - 1)}
        onIncrement={() => setElevation('input', shadows.input + 1)}
        value={String(shadows.input)}
      />
    </Stack>
  );
}
