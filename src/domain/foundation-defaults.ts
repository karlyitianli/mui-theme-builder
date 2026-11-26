// Shared foundation defaults for the whole builder. Both shells and the
// theme mapping read these so an unset value means the same thing
// everywhere.
//
// DEFAULT_SPACING is 4px. It is the value an *unset* spacing resolves
// to: projects saved before spacing was stored carry none, and both the
// panel fallback and migration fill theirs with 4px, the base unit those
// projects were built and displayed with, so loading one never restyles
// it. It is no longer the default theme's base unit: the Black preset's
// project stores its 8px base explicitly (Karl's Nov 26, 2026 density
// decision: Comfortable, 8px, is the default selected preset).
export const DEFAULT_SPACING = 4;
export const DEFAULT_BORDER_RADIUS = 6;
export const DEFAULT_CARD_BORDER_RADIUS = 12;

export interface ShadowSettings {
  global?: number;
  button?: number;
  card?: number;
  input?: number;
  menu?: number;
}

// The builder's shadow defaults, Karl's Nov 26, 2026 configuration: no
// global elevation, with elevation carried by per-component overrides
// (Button, Card, Input, Menu). This is also the Shadows panel's "None"
// preset. It supersedes the Nov 23, 2026 Medium lock (global 2) as the
// value an unset shadow resolves to; projects that stored the Medium
// set keep it verbatim, migration only fills keys they never stored.
//
// The menu value is 8, MUI Menu's own default elevation. Until Nov 26,
// 2026 the Menu paper's shadow was a hand-set boxShadow in the shadcn
// baseline (0 8px 24px at 0.12); elevation 8's penumbra layer (0px 8px
// 10px at 0.14) is the closest single elevation on MUI's scale, so
// existing projects gain menu: 8 through migration and keep the same
// shadow depth.
export const DEFAULT_SHADOWS: Required<ShadowSettings> = {
  global: 0,
  button: 2,
  card: 1,
  input: 0,
  menu: 8,
};

export function resolveShadows(shadows?: ShadowSettings): Required<ShadowSettings> {
  return { ...DEFAULT_SHADOWS, ...shadows };
}

// The Other tab's three foundation groups (task 3.5, Nov 26, 2026):
// breakpoints, transitions, and z-index. Karl decided these values get
// one shared Other tab after Shadows rather than tabs of their own.
// Their defaults are MUI's own, verified against a plain createTheme
// oracle on the installed MUI 9.3.1 (the same oracle check the Default
// preset's values went through). Both presets store these defaults:
// for the Default preset they are the point, and for Black they keep
// the panel, the preview, and the export in agreement, the precedent
// the Nov 26, 2026 spacing fix set. Migration fills any key an older
// project never stored, per key, exactly like shadows above.
//
// Breakpoints carry values only: the unit and step stay at MUI's
// defaults and are not part of the model.

export interface BreakpointSettings {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export const DEFAULT_BREAKPOINTS: Required<BreakpointSettings> = {
  xs: 0,
  sm: 600,
  md: 900,
  lg: 1200,
  xl: 1536,
};

export function resolveBreakpoints(
  breakpoints?: BreakpointSettings,
): Required<BreakpointSettings> {
  return { ...DEFAULT_BREAKPOINTS, ...breakpoints };
}

export interface TransitionDurationSettings {
  shortest?: number;
  shorter?: number;
  short?: number;
  standard?: number;
  complex?: number;
  enteringScreen?: number;
  leavingScreen?: number;
}

export interface TransitionEasingSettings {
  easeInOut?: string;
  easeOut?: string;
  easeIn?: string;
  sharp?: string;
}

export interface TransitionSettings {
  duration?: TransitionDurationSettings;
  easing?: TransitionEasingSettings;
}

export const DEFAULT_TRANSITION_DURATION: Required<TransitionDurationSettings> = {
  shortest: 150,
  shorter: 200,
  short: 250,
  standard: 300,
  complex: 375,
  enteringScreen: 225,
  leavingScreen: 195,
};

export const DEFAULT_TRANSITION_EASING: Required<TransitionEasingSettings> = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
};

export function resolveTransitionDuration(
  duration?: TransitionDurationSettings,
): Required<TransitionDurationSettings> {
  return { ...DEFAULT_TRANSITION_DURATION, ...duration };
}

export function resolveTransitionEasing(
  easing?: TransitionEasingSettings,
): Required<TransitionEasingSettings> {
  return { ...DEFAULT_TRANSITION_EASING, ...easing };
}

export interface ZIndexSettings {
  mobileStepper?: number;
  fab?: number;
  speedDial?: number;
  appBar?: number;
  drawer?: number;
  modal?: number;
  snackbar?: number;
  tooltip?: number;
}

export const DEFAULT_Z_INDEX: Required<ZIndexSettings> = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

export function resolveZIndex(zIndex?: ZIndexSettings): Required<ZIndexSettings> {
  return { ...DEFAULT_Z_INDEX, ...zIndex };
}
