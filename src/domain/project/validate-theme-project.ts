import { CURRENT_SCHEMA_VERSION } from './project-version';
import type { ThemeProjectV1 } from './theme-project.types';

export type ProjectValidationResult =
  | { success: true; project: ThemeProjectV1 }
  | { success: false; errors: string[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasOnlyKeys = (value: Record<string, unknown>, allowed: readonly string[]) =>
  Object.keys(value).every((key) => allowed.includes(key));

const isOptionalString = (value: unknown) => value === undefined || typeof value === 'string';
const isOptionalNumber = (value: unknown) =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));
const isOptionalBoolean = (value: unknown) => value === undefined || typeof value === 'boolean';

function isSparseJsonValue(value: unknown): boolean {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(isSparseJsonValue);
  if (isRecord(value)) return Object.values(value).every(isSparseJsonValue);
  return false;
}

function validateMetadata(value: unknown, errors: string[]): boolean {
  if (!isRecord(value)) {
    errors.push('metadata must be an object.');
    return false;
  }

  if (!hasOnlyKeys(value, ['name', 'createdAt', 'updatedAt'])) {
    errors.push('metadata contains unsupported fields.');
  }

  for (const key of ['name', 'createdAt', 'updatedAt'] as const) {
    if (typeof value[key] !== 'string' || value[key].length === 0) {
      errors.push(`metadata.${key} must be a non-empty string.`);
    }
  }

  return errors.length === 0;
}

function validateColorSchemes(value: unknown, errors: string[]): boolean {
  if (!isRecord(value) || !hasOnlyKeys(value, ['light', 'dark'])) {
    errors.push('colorSchemes must contain only light and dark schemes.');
    return false;
  }

  for (const mode of ['light', 'dark'] as const) {
    const scheme = value[mode];
    if (!isRecord(scheme) || !hasOnlyKeys(scheme, ['palette'])) {
      errors.push(`colorSchemes.${mode} must be an object with an optional palette.`);
      continue;
    }
    if (scheme.palette !== undefined && !isRecord(scheme.palette)) {
      errors.push(`colorSchemes.${mode}.palette must be an object.`);
    } else if (scheme.palette !== undefined && !isSparseJsonValue(scheme.palette)) {
      errors.push(`colorSchemes.${mode}.palette contains an unsupported value.`);
    }
  }

  return errors.length === 0;
}

export function validateThemeProject(value: unknown): ProjectValidationResult {
  const errors: string[] = [];

  if (!isRecord(value)) return { success: false, errors: ['Project must be a JSON object.'] };
  if (!hasOnlyKeys(value, ['schemaVersion', 'builderVersion', 'targetMuiVersion', 'metadata', 'colorSchemes', 'foundations', 'components'])) {
    errors.push('Project contains unsupported top-level fields.');
  }
  if (value.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${CURRENT_SCHEMA_VERSION}.`);
  }
  if (typeof value.builderVersion !== 'string' || value.builderVersion.length === 0) {
    errors.push('builderVersion must be a non-empty string.');
  }
  if (typeof value.targetMuiVersion !== 'string' || value.targetMuiVersion.length === 0) {
    errors.push('targetMuiVersion must be a non-empty string.');
  }

  validateMetadata(value.metadata, errors);
  validateColorSchemes(value.colorSchemes, errors);

  if (value.foundations !== undefined) {
    if (!isRecord(value.foundations) || !hasOnlyKeys(value.foundations, ['shape', 'spacing', 'typography', 'interactions']) || !isSparseJsonValue(value.foundations)) {
      errors.push('foundations contains an unsupported field or value.');
    } else if (!isOptionalNumber(value.foundations.spacing)) {
      errors.push('foundations.spacing must be a finite number.');
    }
  }

  if (value.components !== undefined && (!isRecord(value.components) || !hasOnlyKeys(value.components, ['button', 'textField', 'select']) || !isSparseJsonValue(value.components))) {
    errors.push('components contains an unsupported field or value.');
  }

  // Keep these helpers close to the validator for the more specific field
  // checks added as inspectors are implemented.
  void isOptionalString;
  void isOptionalBoolean;

  return errors.length === 0
    ? { success: true, project: value as unknown as ThemeProjectV1 }
    : { success: false, errors };
}
