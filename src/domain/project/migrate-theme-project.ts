import { CURRENT_SCHEMA_VERSION } from './project-version';
import type { ThemeProject } from './theme-project.types';
import { validateThemeProject, type ProjectValidationResult } from './validate-theme-project';

export type ProjectMigrationResult =
  | { success: true; project: ThemeProject; migrated: boolean }
  | { success: false; errors: string[] };

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
  return validation.success
    ? { success: true, project: validation.project, migrated: false }
    : validation;
}
