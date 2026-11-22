import type { PaletteOptions } from '@mui/material/styles';

import type { PaletteColorSettings, PaletteSettings } from '../domain/palette.types';
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
