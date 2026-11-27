import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_CARD_BORDER_RADIUS,
  DEFAULT_SHADOWS,
  DEFAULT_TRANSITION_DURATION,
  DEFAULT_TRANSITION_EASING,
  DEFAULT_Z_INDEX,
} from '../foundation-defaults';
import { DEFAULT_ACTION, DEFAULT_GREY } from '../palette-defaults';
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
      // The palette otherwise stays sparse over the shadcn baseline;
      // the one exception is the Grey and Action groups (task 3.6),
      // stored explicitly at MUI's defaults, the values every project
      // already resolved them to (the baseline carries neither group).
      // Storing them keeps the panel, the preview, and the export in
      // agreement, the same reasoning as the stored foundations below.
      light: {
        palette: {
          grey: { ...DEFAULT_GREY },
          action: { ...DEFAULT_ACTION.light },
        },
      },
      dark: {
        palette: {
          grey: { ...DEFAULT_GREY },
          action: { ...DEFAULT_ACTION.dark },
        },
      },
    },
    // This factory is the Black preset's project (the shadcn-styled
    // baseline; see theme-presets.ts). Its foundations are stored
    // explicitly so a brand-new project exports exactly what the panels
    // show: spacing carries the 8px base (Comfortable, Karl's Nov 26,
    // 2026 density decision) instead of staying sparse and relying on
    // the DEFAULT_SPACING fallback, which now only gives older, unset
    // projects their historical 4px. The shape carries the global
    // radius the same way: 8px, the Rounded preset Karl made the
    // default on Nov 26, 2026 (task 5.3), instead of the
    // DEFAULT_BORDER_RADIUS fallback, which now only gives older,
    // unset projects their historical 6px. Shadows carry the Nov 26, 2026
    // configuration (global none, per-component elevations) and the
    // card radius Karl's locked default. The Other tab's groups
    // (breakpoints, transitions, z-index; task 3.5) store MUI's
    // defaults for the same reason: what the panel shows is what the
    // preview renders and the export carries.
    foundations: {
      spacing: 8,
      shape: { borderRadius: 8, cardBorderRadius: DEFAULT_CARD_BORDER_RADIUS },
      shadows: { ...DEFAULT_SHADOWS },
      breakpoints: { ...DEFAULT_BREAKPOINTS },
      transitions: {
        duration: { ...DEFAULT_TRANSITION_DURATION },
        easing: { ...DEFAULT_TRANSITION_EASING },
      },
      zIndex: { ...DEFAULT_Z_INDEX },
    },
  };
}
