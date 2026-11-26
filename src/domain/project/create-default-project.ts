import { DEFAULT_CARD_BORDER_RADIUS, DEFAULT_SHADOWS } from '../foundation-defaults';
import { BUILDER_VERSION, CURRENT_SCHEMA_VERSION, TARGET_MUI_VERSION } from './project-version';
import type { ThemeProjectV1 } from './theme-project.types';

export function createDefaultProject(now = new Date()): ThemeProjectV1 {
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
      light: {},
      dark: {},
    },
    // This factory is the Black preset's project (the shadcn-styled
    // baseline; see theme-presets.ts). Its foundations are stored
    // explicitly so a brand-new project exports exactly what the panels
    // show: spacing carries the 8px base (Comfortable, Karl's Nov 26,
    // 2026 density decision) instead of staying sparse and relying on
    // the DEFAULT_SPACING fallback, which now only gives older, unset
    // projects their historical 4px. Shadows carry the Nov 26, 2026
    // configuration (global none, per-component elevations) and the
    // card radius Karl's locked default.
    foundations: {
      spacing: 8,
      shape: { cardBorderRadius: DEFAULT_CARD_BORDER_RADIUS },
      shadows: { ...DEFAULT_SHADOWS },
    },
  };
}
