import { Divider, Stack } from '@mui/material';

import {
  DEFAULT_BORDER_RADIUS,
  DEFAULT_CARD_BORDER_RADIUS,
} from '../../domain/foundation-defaults';
import type { CssLengthValue } from '../../domain/value.types';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
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
// Phase 5 wiring: the global stepper and the presets dispatch the
// existing set-border-radius action (0-32, the old FoundationInspector's
// range). set-border-radius is global only, so the Button and Input
// overrides go through the component settings actions the old inspectors
// use (set-button-settings / set-text-field-settings, writing
// style.border.radius, preserving the rest of each settings object).
// Card has its own model home since Phase 5
// (foundations.shape.cardBorderRadius, default 12px) and dispatches
// set-card-border-radius. Button and Input fall back to the global value
// unless their component settings carry their own border radius. The
// frame's pill row literally reads Sharp / Rounded / Spacious with
// Rounded active; the preset values are 0px, 6px, and 16px.

const radiusPresets = ['Sharp', 'Rounded', 'Spacious'];
const radiusPresetValues = [0, 6, 16];

function formatRadius(value: CssLengthValue): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function asNumber(value: CssLengthValue, fallback: number): number {
  return typeof value === 'number' ? value : fallback;
}

const clampRadius = (value: number) => Math.min(32, Math.max(0, value));

export function RadiusPanel() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const globalRadius = project.foundations?.shape?.borderRadius ?? DEFAULT_BORDER_RADIUS;
  const globalNumber = asNumber(globalRadius, DEFAULT_BORDER_RADIUS);
  const buttonSettings = project.components?.button ?? {};
  const buttonStyle = buttonSettings.style ?? {};
  const textFieldSettings = project.components?.textField ?? {};
  const textFieldStyle = textFieldSettings.style ?? {};
  const buttonRadius = buttonStyle.border?.radius ?? globalRadius;
  const inputRadius = textFieldStyle.border?.radius ?? globalRadius;
  const cardRadius = project.foundations?.shape?.cardBorderRadius ?? DEFAULT_CARD_BORDER_RADIUS;
  const cardNumber = asNumber(cardRadius, DEFAULT_CARD_BORDER_RADIUS);

  const setGlobal = (value: number) => dispatch({ type: 'set-border-radius', value });
  const setButton = (radius: number) =>
    dispatch({
      type: 'set-button-settings',
      settings: {
        ...buttonSettings,
        style: { ...buttonStyle, border: { ...buttonStyle.border, radius } },
      },
    });
  const setInput = (radius: number) =>
    dispatch({
      type: 'set-text-field-settings',
      settings: {
        ...textFieldSettings,
        style: { ...textFieldStyle, border: { ...textFieldStyle.border, radius } },
      },
    });
  const setCard = (value: number) => dispatch({ type: 'set-card-border-radius', value });

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Preset</SectionLabel>
      <PresetPills
        activeIndex={radiusPresetValues.indexOf(globalNumber)}
        onSelect={(index) => setGlobal(radiusPresetValues[index])}
        options={radiusPresets}
      />
      <StepperRow
        label="Global border radius"
        onDecrement={() => setGlobal(clampRadius(globalNumber - 1))}
        onIncrement={() => setGlobal(clampRadius(globalNumber + 1))}
        value={formatRadius(globalRadius)}
      />
      <Divider />
      <SectionLabel>Overrides</SectionLabel>
      <ComponentStepperRow
        label="Button"
        onDecrement={() => setButton(clampRadius(asNumber(buttonRadius, globalNumber) - 1))}
        onIncrement={() => setButton(clampRadius(asNumber(buttonRadius, globalNumber) + 1))}
        value={formatRadius(buttonRadius)}
      />
      <ComponentStepperRow
        label="Card"
        onDecrement={() => setCard(clampRadius(cardNumber - 1))}
        onIncrement={() => setCard(clampRadius(cardNumber + 1))}
        value={formatRadius(cardRadius)}
      />
      <ComponentStepperRow
        label="Input"
        onDecrement={() => setInput(clampRadius(asNumber(inputRadius, globalNumber) - 1))}
        onIncrement={() => setInput(clampRadius(asNumber(inputRadius, globalNumber) + 1))}
        value={formatRadius(inputRadius)}
      />
    </Stack>
  );
}
