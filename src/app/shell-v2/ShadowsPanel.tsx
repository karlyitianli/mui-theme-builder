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
// per-component override steppers for Button, Card, Input, and Menu.
//
// Phase 5 gave shadows a project-model home (foundations.shadows:
// global, button, card, input elevations) and wired the panel: the
// steppers dispatch set-shadow-elevation clamped to MUI's 0-24
// elevation range, and a preset dispatches one set-shadows action with
// the preset's full elevation set, so a preset is a single undo step.
// Nov 26, 2026 added the menu elevation to the model and redefined the
// presets around Karl's configuration: "None" now means no global
// elevation with the elevation carried by the component overrides
// (Button 2, Card 1, Input 0, Menu 8), and it is both the builder
// default (DEFAULT_SHADOWS) and the Black preset's configuration, so a
// fresh project shows the None pill active. The other sets are Subtle
// (1, 1, 1, 0, Menu 4), Medium (2, 2, 1, 0, Menu 8, the pre-Nov 26
// builder default plus the menu), and Strong (4, 4, 3, 2, Menu 12);
// the Subtle and Strong menu values are builder-chosen, flagged for
// Karl's review. Elevations are unitless, so they render as plain
// numbers.

const shadowPresets = ['None', 'Subtle', 'Medium', 'Strong'];
const shadowPresetValues: Array<Required<ShadowSettings>> = [
  { global: 0, button: 2, card: 1, input: 0, menu: 8 },
  { global: 1, button: 1, card: 1, input: 0, menu: 4 },
  { global: 2, button: 2, card: 1, input: 0, menu: 8 },
  { global: 4, button: 4, card: 3, input: 2, menu: 12 },
];

const clampElevation = (value: number) => Math.min(24, Math.max(0, value));

export function ShadowsPanel() {
  const { activeMode, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const shadows = resolveShadows(project.foundations?.shadows);
  const activePreset = shadowPresetValues.findIndex(
    (preset) =>
      preset.global === shadows.global &&
      preset.button === shadows.button &&
      preset.card === shadows.card &&
      preset.input === shadows.input &&
      preset.menu === shadows.menu,
  );
  const setElevation = (target: keyof ShadowSettings, value: number) =>
    dispatch({ type: 'set-shadow-elevation', target, value: clampElevation(value) });

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Presets</SectionLabel>
      <PresetPills
        activeIndex={activePreset}
        gap={10}
        mode={activeMode}
        onSelect={(index) => dispatch({ type: 'set-shadows', shadows: shadowPresetValues[index] })}
        options={shadowPresets}
      />
      <StepperRow
        label="Global elevation"
        mode={activeMode}
        onDecrement={() => setElevation('global', shadows.global - 1)}
        onIncrement={() => setElevation('global', shadows.global + 1)}
        value={String(shadows.global)}
      />
      <Divider />
      <SectionLabel>Overrides</SectionLabel>
      <ComponentStepperRow
        label="Button"
        mode={activeMode}
        onDecrement={() => setElevation('button', shadows.button - 1)}
        onIncrement={() => setElevation('button', shadows.button + 1)}
        value={String(shadows.button)}
      />
      <ComponentStepperRow
        label="Card"
        mode={activeMode}
        onDecrement={() => setElevation('card', shadows.card - 1)}
        onIncrement={() => setElevation('card', shadows.card + 1)}
        value={String(shadows.card)}
      />
      <ComponentStepperRow
        label="Input"
        mode={activeMode}
        onDecrement={() => setElevation('input', shadows.input - 1)}
        onIncrement={() => setElevation('input', shadows.input + 1)}
        value={String(shadows.input)}
      />
      <ComponentStepperRow
        label="Menu"
        mode={activeMode}
        onDecrement={() => setElevation('menu', shadows.menu - 1)}
        onIncrement={() => setElevation('menu', shadows.menu + 1)}
        value={String(shadows.menu)}
      />
    </Stack>
  );
}
