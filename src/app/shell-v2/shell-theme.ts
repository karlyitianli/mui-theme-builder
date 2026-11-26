import { createTheme, type Theme, type ThemeOptions } from '@mui/material/styles';

import type { PreviewMode } from '../../state/editor-state.types';
import { externalLabelComponents } from '../../theme/external-label-components';
import { mergeThemeComponents } from '../../theme/merge-theme-components';
import { paletteSettingsToMui } from '../../theme/palette-adapter';
import { shadcnComponents, shadcnTypography } from '../../theme/shadcn-baseline';

// The v2 shell's own theme, built per Karl's insulation rule
// (Nov 25, 2026): editing tokens in the panels must not restyle the
// builder's chrome. Only the preview components and their containing
// cards render under the edited theme; the chrome renders under this
// theme instead.
//
// Nothing in this theme reads the project at all. Karl first allowed
// the edited palette as the one exception, then reversed that the
// same day: even color must not apply to the shell. The palette is
// therefore the fixed shadcn baseline for the active mode (the
// palette adapter with no project settings), so the chrome still
// flips between its own fixed light and dark looks with the
// Light/Dark toggle, but editing any project color changes nothing
// anywhere in the shell. Everything else is fixed too: spacing is a
// fixed 8px base unit, typography is the shell's Inter stack over
// the shadcn type settings, the shape radius is the chrome's 6px,
// and shadows are MUI's defaults.
//
// The theme carries its CSS variables under the `shell` prefix
// (cssVarPrefix). That is what makes the insulation hold in the
// browser, not just in the theme object: the preview themes define
// `--mui-*` variables on global selectors (their providers set the
// scheme attribute on <html>), so a chrome theme on the default `mui`
// prefix would have its spacing, radius, and shadow variables
// overridden by whichever preview theme mounted last. Under the
// `shell` prefix the preview themes cannot touch the chrome's
// variables, and the chrome cannot leak into the cards. For the same
// reason, the shared component style strings (which reference
// `var(--mui-palette-*)` for the project theme's own variables) are
// rewritten to the shell prefix in this theme only, so panel
// controls follow the shell palette, never the edited one.
export const SHELL_FONT_FAMILY = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'sans-serif',
].join(', ');

// The shared component configs style themselves with the project
// theme's CSS variables (`var(--mui-palette-*)`), which is correct
// under the project theme but would leak the edited palette into the
// chrome here. Rewrite those references to the shell prefix in the
// shell theme's copy only; the shared objects, the project theme,
// and the exported theme.tsx keep the original strings.
function scopeComponentsToShellPrefix(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replaceAll('var(--mui-', 'var(--shell-');
  }
  if (Array.isArray(value)) {
    return value.map(scopeComponentsToShellPrefix);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [
        key,
        scopeComponentsToShellPrefix(child),
      ]),
    );
  }
  return value;
}

export function createShellTheme(mode: PreviewMode): Theme {
  const scopedComponents = scopeComponentsToShellPrefix(
    mergeThemeComponents(shadcnComponents, externalLabelComponents),
  ) as ThemeOptions['components'];
  return createTheme({
    cssVariables: { cssVarPrefix: 'shell' },
    palette: paletteSettingsToMui(mode),
    spacing: 8,
    typography: {
      ...shadcnTypography,
      fontFamily: SHELL_FONT_FAMILY,
    },
    shape: {
      borderRadius: 6,
    },
    // The chrome's Menu paper keeps the exact soft shadow it had
    // before Nov 26, 2026, declared here: the shared baseline no
    // longer hand-sets that shadow, because in project themes the
    // foundations menu elevation owns the Menu shadow now. Without
    // this line the chrome's dropdowns would fall back to MUI's
    // elevation-8 shadow and token work would have restyled the shell.
    components: mergeThemeComponents(scopedComponents, {
      MuiMenu: {
        styleOverrides: {
          paper: {
            boxShadow: '0 8px 24px rgb(0 0 0 / 0.12)',
          },
        },
      },
    }),
  });
}
