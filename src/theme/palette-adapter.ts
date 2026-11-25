import { createTheme, type Palette, type PaletteOptions } from '@mui/material/styles';

import type {
  PaletteColorSettings,
  PaletteSettings,
  SemanticColorRole,
} from '../domain/palette.types';
import { shadcnPalettes } from './shadcn-baseline';

function mergePaletteColor(
  baseline: PaletteOptions['primary'],
  override?: PaletteColorSettings,
): PaletteOptions['primary'] {
  if (override === undefined) return baseline;
  return { ...(baseline ?? {}), ...override };
}

export function paletteSettingsToMui(
  mode: 'light' | 'dark',
  settings?: PaletteSettings,
): PaletteOptions {
  const baseline = shadcnPalettes[mode];
  return {
    ...baseline,
    ...settings,
    mode,
    primary: mergePaletteColor(baseline.primary, settings?.primary),
    secondary: mergePaletteColor(baseline.secondary, settings?.secondary),
    error: mergePaletteColor(baseline.error, settings?.error),
    ...(baseline.warning === undefined && settings?.warning === undefined
      ? {}
      : { warning: mergePaletteColor(baseline.warning, settings?.warning) }),
    ...(baseline.info === undefined && settings?.info === undefined
      ? {}
      : { info: mergePaletteColor(baseline.info, settings?.info) }),
    ...(baseline.success === undefined && settings?.success === undefined
      ? {}
      : { success: mergePaletteColor(baseline.success, settings?.success) }),
    background: { ...baseline.background, ...settings?.background },
    text: { ...baseline.text, ...settings?.text },
  };
}

// MUI's own built-in palette per mode, created lazily on first use. The
// baseline above carries no warning, info, or success, so for those
// roles the effective main of an unedited project is MUI's default;
// sourcing it from createTheme keeps this from drifting from what the
// theme build will actually use.
let muiDefaultPalettes: Record<'light' | 'dark', Palette> | undefined;

function muiDefaultPalette(mode: 'light' | 'dark'): Palette {
  muiDefaultPalettes ??= {
    light: createTheme().palette,
    dark: createTheme({ palette: { mode: 'dark' } }).palette,
  };
  return muiDefaultPalettes[mode];
}

// The main a semantic role effectively has when the project stores none:
// the baseline main where the baseline defines one, otherwise MUI's
// built-in default for the mode. The editor reducer seeds a stored
// settings object with this when a light or dark variant is pinned on a
// role the project has never stored, since PaletteColorSettings
// requires a main.
export function semanticColorMainDefault(
  mode: 'light' | 'dark',
  role: SemanticColorRole,
): string {
  const baseline = shadcnPalettes[mode][role];
  const baselineMain =
    baseline !== undefined && typeof baseline === 'object' && 'main' in baseline
      ? baseline.main
      : undefined;
  return baselineMain ?? muiDefaultPalette(mode)[role].main;
}
