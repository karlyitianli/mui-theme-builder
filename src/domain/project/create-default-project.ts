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
    // Shadows and the card radius carry Karl's locked defaults explicitly
    // so a new project exports exactly what the v2 panels show. Spacing
    // stays sparse: the shared DEFAULT_SPACING fallback (and migration
    // for saved projects) supplies the 4px base unit.
    foundations: {
      shape: { cardBorderRadius: DEFAULT_CARD_BORDER_RADIUS },
      shadows: { ...DEFAULT_SHADOWS },
    },
  };
}
