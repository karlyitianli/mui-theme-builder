import {
  DEFAULT_CARD_BORDER_RADIUS,
  DEFAULT_SHADOWS,
  DEFAULT_SPACING,
} from '../foundation-defaults';
import { CURRENT_SCHEMA_VERSION } from './project-version';
import type { ThemeProject } from './theme-project.types';
import { validateThemeProject, type ProjectValidationResult } from './validate-theme-project';

export type ProjectMigrationResult =
  | { success: true; project: ThemeProject; migrated: boolean }
  | { success: false; errors: string[] };

// Projects saved before the Phase 5 foundation fields existed have no
// shadows, no card radius, and possibly no spacing base unit. Fill those
// with the shared locked defaults so a loaded project edits and exports
// exactly what the panels show. Values a project already carries are
// never overwritten, per key.
function withFoundationDefaults(project: ThemeProject): { project: ThemeProject; migrated: boolean } {
  const foundations = project.foundations ?? {};
  const shape = foundations.shape ?? {};
  const shadows = foundations.shadows ?? {};

  const needsSpacing = foundations.spacing === undefined;
  const needsCardRadius = shape.cardBorderRadius === undefined;
  const filledShadows = { ...DEFAULT_SHADOWS, ...shadows };
  const needsShadows = Object.keys(filledShadows).some(
    (key) => shadows[key as keyof typeof shadows] === undefined,
  );

  if (!needsSpacing && !needsCardRadius && !needsShadows) {
    return { project, migrated: false };
  }

  return {
    migrated: true,
    project: {
      ...project,
      foundations: {
        ...foundations,
        ...(needsSpacing ? { spacing: DEFAULT_SPACING } : {}),
        shape: {
          ...shape,
          ...(needsCardRadius ? { cardBorderRadius: DEFAULT_CARD_BORDER_RADIUS } : {}),
        },
        shadows: filledShadows,
      },
    },
  };
}

export function migrateThemeProject(value: unknown): ProjectMigrationResult {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return { success: false, errors: ['Project must be a JSON object.'] };
  }

  const version = Reflect.get(value, 'schemaVersion');
  if (typeof version !== 'number') {
    return { success: false, errors: ['Project is missing a numeric schemaVersion.'] };
  }
  if (version > CURRENT_SCHEMA_VERSION) {
    return {
      success: false,
      errors: [`This project uses schema version ${version}, but this builder supports version ${CURRENT_SCHEMA_VERSION}.`],
    };
  }

  // Version 1 is the first persisted schema. Future migrations should upgrade
  // one version at a time before running the current validator.
  const validation: ProjectValidationResult = validateThemeProject(value);
  if (!validation.success) return validation;

  const { project, migrated } = withFoundationDefaults(validation.project);
  return { success: true, project, migrated };
}
