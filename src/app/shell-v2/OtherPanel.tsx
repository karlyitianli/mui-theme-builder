import type { FocusEvent, KeyboardEvent } from 'react';
import { Box, Divider, InputBase, Stack, Typography } from '@mui/material';

import {
  resolveBreakpoints,
  resolveTransitionDuration,
  resolveTransitionEasing,
  resolveZIndex,
  type BreakpointSettings,
  type TransitionDurationSettings,
  type TransitionEasingSettings,
  type ZIndexSettings,
} from '../../domain/foundation-defaults';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type { PreviewMode } from '../../state/editor-state.types';
import { SectionLabel } from './primitives';
import { shellBorderForMode } from './shell-border';

// Other tab panel (task 3.5, Nov 26, 2026): breakpoints, transitions,
// and z-index, the three foundation groups Karl decided share one tab
// after Shadows rather than getting tabs of their own. The groups have
// project-model homes (foundations.breakpoints,
// foundations.transitions, foundations.zIndex) storing MUI's defaults
// until edited, and every field commits through the editor reducer, so
// each edit is one undoable action like every other token edit.
//
// The fields follow the shell's chrome patterns (a label on the left,
// a bordered box on the right, the SearchBox's border-and-InputBase
// shape) rather than the steppers the other panels use: these values
// (a 1536 breakpoint, a 1400 z-index) are typed, not stepped. Numeric
// fields commit on blur or Enter, round to integers, and clamp to a
// sane range; an entry that does not parse is ignored and the field
// reverts, so a bad value can never reach the project or break the
// preview. Easing fields hold the cubic-bezier string as text and
// commit any non-empty value the same way.

const breakpointKeys: Array<keyof BreakpointSettings> = ['xs', 'sm', 'md', 'lg', 'xl'];

const durationRows: Array<{ key: keyof TransitionDurationSettings; label: string }> = [
  { key: 'shortest', label: 'Shortest' },
  { key: 'shorter', label: 'Shorter' },
  { key: 'short', label: 'Short' },
  { key: 'standard', label: 'Standard' },
  { key: 'complex', label: 'Complex' },
  { key: 'enteringScreen', label: 'Entering screen' },
  { key: 'leavingScreen', label: 'Leaving screen' },
];

const easingKeys: Array<keyof TransitionEasingSettings> = [
  'easeInOut',
  'easeOut',
  'easeIn',
  'sharp',
];

const zIndexRows: Array<{ key: keyof ZIndexSettings; label: string }> = [
  { key: 'mobileStepper', label: 'Mobile stepper' },
  { key: 'fab', label: 'Fab' },
  { key: 'speedDial', label: 'Speed dial' },
  { key: 'appBar', label: 'App bar' },
  { key: 'drawer', label: 'Drawer' },
  { key: 'modal', label: 'Modal' },
  { key: 'snackbar', label: 'Snackbar' },
  { key: 'tooltip', label: 'Tooltip' },
];

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(value)));

interface NumberFieldRowProps {
  ariaLabel: string;
  label: string;
  max: number;
  min: number;
  mode: PreviewMode;
  onCommit: (value: number) => void;
  suffix?: string;
  value: number;
}

function NumberFieldRow({
  ariaLabel,
  label,
  max,
  min,
  mode,
  onCommit,
  suffix,
  value,
}: NumberFieldRowProps) {
  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (Number.isFinite(parsed) && event.target.value.trim() !== '') {
      onCommit(clampInt(parsed, min, max));
    } else {
      // Not a number: ignore the entry and show the stored value again.
      event.target.value = String(value);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
      <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{label}</Typography>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: shellBorderForMode(mode),
          borderRadius: '6px',
          display: 'flex',
          flexShrink: 0,
          gap: 0.5,
          height: 30,
          ml: 'auto',
          px: 1,
          width: 104,
        }}
      >
        <InputBase
          key={value}
          defaultValue={String(value)}
          inputProps={{ 'aria-label': ariaLabel }}
          onBlur={commit}
          onKeyDown={onKeyDown}
          sx={{
            flex: 1,
            fontSize: 13,
            fontWeight: 500,
            lineHeight: '20px',
            '& input': { p: 0, textAlign: 'right' },
          }}
        />
        {suffix && (
          <Typography color="text.secondary" sx={{ fontSize: 12, lineHeight: '15px' }}>
            {suffix}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

interface EasingFieldRowProps {
  ariaLabel: string;
  label: string;
  mode: PreviewMode;
  onCommit: (value: string) => void;
  value: string;
}

function EasingFieldRow({ ariaLabel, label, mode, onCommit, value }: EasingFieldRowProps) {
  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.target.value.trim();
    if (next !== '') {
      onCommit(next);
    } else {
      event.target.value = value;
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <Stack spacing={0.75}>
      <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{label}</Typography>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: shellBorderForMode(mode),
          borderRadius: '6px',
          display: 'flex',
          height: 30,
          px: 1,
        }}
      >
        <InputBase
          key={value}
          defaultValue={value}
          fullWidth
          inputProps={{ 'aria-label': ariaLabel }}
          onBlur={commit}
          onKeyDown={onKeyDown}
          sx={{ fontSize: 13, fontWeight: 500, lineHeight: '20px', '& input': { p: 0 } }}
        />
      </Box>
    </Stack>
  );
}

export function OtherPanel() {
  const { activeMode, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const foundations = project.foundations;
  const breakpoints = resolveBreakpoints(foundations?.breakpoints);
  const duration = resolveTransitionDuration(foundations?.transitions?.duration);
  const easing = resolveTransitionEasing(foundations?.transitions?.easing);
  const zIndex = resolveZIndex(foundations?.zIndex);

  return (
    <Stack spacing={1.5}>
      <SectionLabel>Breakpoints</SectionLabel>
      {breakpointKeys.map((key) => (
        <NumberFieldRow
          ariaLabel={`Breakpoint ${key}`}
          key={key}
          label={key}
          max={9999}
          min={0}
          mode={activeMode}
          onCommit={(value) => dispatch({ type: 'set-breakpoint', key, value })}
          suffix="px"
          value={breakpoints[key]}
        />
      ))}
      <Divider />
      <SectionLabel>Transition duration</SectionLabel>
      {durationRows.map(({ key, label }) => (
        <NumberFieldRow
          ariaLabel={`Duration ${key}`}
          key={key}
          label={label}
          max={5000}
          min={0}
          mode={activeMode}
          onCommit={(value) => dispatch({ type: 'set-transition-duration', key, value })}
          suffix="ms"
          value={duration[key]}
        />
      ))}
      <SectionLabel>Transition easing</SectionLabel>
      {easingKeys.map((key) => (
        <EasingFieldRow
          ariaLabel={`Easing ${key}`}
          key={key}
          label={key}
          mode={activeMode}
          onCommit={(value) => dispatch({ type: 'set-transition-easing', key, value })}
          value={easing[key]}
        />
      ))}
      <Divider />
      <SectionLabel>Z-Index</SectionLabel>
      {zIndexRows.map(({ key, label }) => (
        <NumberFieldRow
          ariaLabel={`Z-index ${key}`}
          key={key}
          label={label}
          max={9999}
          min={0}
          mode={activeMode}
          onCommit={(value) => dispatch({ type: 'set-z-index', key, value })}
          value={zIndex[key]}
        />
      ))}
    </Stack>
  );
}
