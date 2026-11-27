import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_TRANSITION_DURATION,
  DEFAULT_TRANSITION_EASING,
  DEFAULT_Z_INDEX,
} from '../foundation-defaults';
import { DEFAULT_ACTION, DEFAULT_GREY } from '../palette-defaults';
import { BUILDER_VERSION, CURRENT_SCHEMA_VERSION, TARGET_MUI_VERSION } from './project-version';
import type { ThemeProjectV1 } from './theme-project.types';

// The "Default" preset's project: MUI's actual default theme values,
// stored explicitly (Karl's Nov 26, 2026 preset decision). The builder's
// theme mapping always layers project settings over the shadcn baseline,
// so a preset that must read as stock MUI has to store every value the
// baseline would otherwise supply: the full palette for both schemes
// (contrastText included, since the baseline's would leak through the
// per-role merge), the full typography, and the foundations.
//
// Every value below was verified against a plain createTheme oracle on
// the installed MUI 9.3.1 (see theme-presets.test.ts, which re-checks
// the headline values against that oracle). Palette light and dark are
// stored explicitly: MUI's own default palette specifies the full
// Material swatch values (primary light #42a5f5 is blue 300, not a
// derivation), and augmenting a bare main in this MUI version derives
// different rgb() values, so storing main alone would not reproduce
// the default theme.
//
// The button and overline variants store textTransform: 'uppercase'
// like the oracle (the field joined TypographyStyle with task 1.5,
// Nov 26, 2026; before that the model could not express it and the two
// variants matched the oracle on size, weight, line height, and letter
// spacing only, with the uppercase arriving by MUI's own fill-in at
// createTheme time). The font stack is expressed exactly: family
// Roboto with the Helvetica, Arial, sans-serif fallback (the font
// catalog's Roboto entry falls back to Arial only, so the factory
// names the stack itself rather than reusing the catalog entry).
export function createMuiDefaultProject(now = new Date()): ThemeProjectV1 {
  const timestamp = now.toISOString();

  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    builderVersion: BUILDER_VERSION,
    targetMuiVersion: TARGET_MUI_VERSION,
    metadata: {
      name: 'Untitled theme',
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    colorSchemes: {
      light: {
        palette: {
          primary: { main: '#1976d2', light: '#42a5f5', dark: '#1565c0', contrastText: '#fff' },
          secondary: { main: '#9c27b0', light: '#ba68c8', dark: '#7b1fa2', contrastText: '#fff' },
          error: { main: '#d32f2f', light: '#ef5350', dark: '#c62828', contrastText: '#fff' },
          warning: { main: '#ed6c02', light: '#ff9800', dark: '#e65100', contrastText: '#fff' },
          info: { main: '#0288d1', light: '#03a9f4', dark: '#01579b', contrastText: '#fff' },
          success: { main: '#2e7d32', light: '#4caf50', dark: '#1b5e20', contrastText: '#fff' },
          background: { default: '#fff', paper: '#fff' },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
          // Grey and action (task 3.6) at MUI's defaults, from the
          // shared palette defaults (oracle-verified there): the ramp
          // is mode-independent, the action group is the light set.
          grey: { ...DEFAULT_GREY },
          action: { ...DEFAULT_ACTION.light },
        },
      },
      dark: {
        palette: {
          primary: { main: '#90caf9', light: '#e3f2fd', dark: '#42a5f5', contrastText: 'rgba(0, 0, 0, 0.87)' },
          secondary: { main: '#ce93d8', light: '#f3e5f5', dark: '#ab47bc', contrastText: 'rgba(0, 0, 0, 0.87)' },
          error: { main: '#f44336', light: '#e57373', dark: '#d32f2f', contrastText: '#fff' },
          warning: { main: '#ffa726', light: '#ffb74d', dark: '#f57c00', contrastText: 'rgba(0, 0, 0, 0.87)' },
          info: { main: '#29b6f6', light: '#4fc3f7', dark: '#0288d1', contrastText: 'rgba(0, 0, 0, 0.87)' },
          success: { main: '#66bb6a', light: '#81c784', dark: '#388e3c', contrastText: 'rgba(0, 0, 0, 0.87)' },
          background: { default: '#121212', paper: '#121212' },
          text: {
            primary: '#fff',
            secondary: 'rgba(255, 255, 255, 0.7)',
            disabled: 'rgba(255, 255, 255, 0.5)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
          grey: { ...DEFAULT_GREY },
          action: { ...DEFAULT_ACTION.dark },
        },
      },
    },
    foundations: {
      spacing: 8,
      // Stock MUI has no separate card radius: Card corners follow
      // shape.borderRadius (4). The builder's model always applies the
      // card radius explicitly, so the preset stores 4 to match.
      shape: { borderRadius: 4, cardBorderRadius: 4 },
      // MUI's component default elevations expressed in the foundations
      // model: Paper rests at 1 (global), a contained Button's rest
      // shadow is the theme's elevation 2 (the model only toggles
      // disableElevation, and 2 keeps it off, as stock), Card is a
      // Paper at 1, OutlinedInput has no shadow (0), and a Menu's
      // paper sits at 8.
      shadows: { global: 1, button: 2, card: 1, input: 0, menu: 8 },
      // The Other tab's groups (task 3.5) at MUI's defaults, which is
      // what this preset stores for every group: the breakpoint
      // values, the transition durations and easing curves, and the
      // z-index scale, each verified against the createTheme oracle.
      breakpoints: { ...DEFAULT_BREAKPOINTS },
      transitions: {
        duration: { ...DEFAULT_TRANSITION_DURATION },
        easing: { ...DEFAULT_TRANSITION_EASING },
      },
      zIndex: { ...DEFAULT_Z_INDEX },
      typography: {
        font: {
          family: 'Roboto',
          weights: [300, 400, 500, 700],
          fallback: ['Helvetica', 'Arial', 'sans-serif'],
        },
        fontSize: 14,
        // MUI's default variants, font sizes converted from rem at the
        // 16px root. Button and Overline carry the oracle's uppercase
        // textTransform (task 1.5); no other variant sets the field.
        variants: {
          h1: { fontSize: 96, fontWeight: 300, lineHeight: 1.167, letterSpacing: '-0.01562em' },
          h2: { fontSize: 60, fontWeight: 300, lineHeight: 1.2, letterSpacing: '-0.00833em' },
          h3: { fontSize: 48, fontWeight: 400, lineHeight: 1.167, letterSpacing: '0em' },
          h4: { fontSize: 34, fontWeight: 400, lineHeight: 1.235, letterSpacing: '0.00735em' },
          h5: { fontSize: 24, fontWeight: 400, lineHeight: 1.334, letterSpacing: '0em' },
          h6: { fontSize: 20, fontWeight: 500, lineHeight: 1.6, letterSpacing: '0.0075em' },
          subtitle1: { fontSize: 16, fontWeight: 400, lineHeight: 1.75, letterSpacing: '0.00938em' },
          subtitle2: { fontSize: 14, fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.00714em' },
          body1: { fontSize: 16, fontWeight: 400, lineHeight: 1.5, letterSpacing: '0.00938em' },
          body2: { fontSize: 14, fontWeight: 400, lineHeight: 1.43, letterSpacing: '0.01071em' },
          button: { fontSize: 14, fontWeight: 500, lineHeight: 1.75, letterSpacing: '0.02857em', textTransform: 'uppercase' },
          caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.66, letterSpacing: '0.03333em' },
          overline: { fontSize: 12, fontWeight: 400, lineHeight: 2.66, letterSpacing: '0.08333em', textTransform: 'uppercase' },
        },
      },
    },
  };
}
