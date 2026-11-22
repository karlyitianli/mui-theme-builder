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
  };
}
