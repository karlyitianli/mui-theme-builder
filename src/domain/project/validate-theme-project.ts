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

// A hex color string the app can actually use: 3, 6, or 8 hex digits
// after the #. Palette strings that start with # but are not valid
// hex ('#12', '#gggggg') are values neither the app nor MUI can
// interpret; audit finding C4. Legitimate stored forms pass
// untouched: uppercase hex, the Default preset's three-digit hexes,
// rgba() strings, and named colors are all values the app itself
// stores or MUI accepts as-is.
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function hasOnlyValidHexColors(value: unknown): boolean {
  if (typeof value === 'string') {
    return !value.startsWith('#') || HEX_COLOR_PATTERN.test(value);
  }
  if (Array.isArray(value)) return value.every(hasOnlyValidHexColors);
  if (isRecord(value)) return Object.values(value).every(hasOnlyValidHexColors);
  return true;
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
    } else if (scheme.palette !== undefined && !hasOnlyValidHexColors(scheme.palette)) {
      errors.push(`colorSchemes.${mode}.palette contains a malformed hex color.`);
    }
  }

  return errors.length === 0;
}

// The Other tab's transitions group (task 3.5): a duration record of
// finite numbers and an easing record of cubic-bezier strings, each
// with only MUI's keys.
function validateTransitions(value: unknown, errors: string[]): boolean {
  if (value === undefined) return true;
  if (!isRecord(value) || !hasOnlyKeys(value, ['duration', 'easing'])) {
    errors.push('foundations.transitions must contain only duration and easing.');
    return false;
  }
  if (
    value.duration !== undefined &&
    (!isRecord(value.duration) ||
      !hasOnlyKeys(value.duration, ['shortest', 'shorter', 'short', 'standard', 'complex', 'enteringScreen', 'leavingScreen']) ||
      !Object.values(value.duration).every((entry) => isOptionalNumber(entry)))
  ) {
    errors.push('foundations.transitions.duration must contain only numeric durations.');
    return false;
  }
  if (
    value.easing !== undefined &&
    (!isRecord(value.easing) ||
      !hasOnlyKeys(value.easing, ['easeInOut', 'easeOut', 'easeIn', 'sharp']) ||
      !Object.values(value.easing).every((entry) => isOptionalString(entry)))
  ) {
    errors.push('foundations.transitions.easing must contain only easing strings.');
    return false;
  }
  return true;
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
    if (!isRecord(value.foundations) || !hasOnlyKeys(value.foundations, ['shape', 'spacing', 'typography', 'interactions', 'shadows', 'breakpoints', 'transitions', 'zIndex']) || !isSparseJsonValue(value.foundations)) {
      errors.push('foundations contains an unsupported field or value.');
    } else if (!isOptionalNumber(value.foundations.spacing)) {
      errors.push('foundations.spacing must be a finite number.');
    } else if (
      value.foundations.shadows !== undefined &&
      (!isRecord(value.foundations.shadows) ||
        !hasOnlyKeys(value.foundations.shadows, ['global', 'button', 'card', 'input', 'menu']) ||
        !Object.values(value.foundations.shadows).every((entry) => isOptionalNumber(entry)))
    ) {
      errors.push('foundations.shadows must contain only numeric elevations.');
    } else if (
      value.foundations.breakpoints !== undefined &&
      (!isRecord(value.foundations.breakpoints) ||
        !hasOnlyKeys(value.foundations.breakpoints, ['xs', 'sm', 'md', 'lg', 'xl']) ||
        !Object.values(value.foundations.breakpoints).every((entry) => isOptionalNumber(entry)))
    ) {
      errors.push('foundations.breakpoints must contain only numeric values.');
    } else if (!validateTransitions(value.foundations.transitions, errors)) {
      // validateTransitions pushed the specific error.
    } else if (
      value.foundations.zIndex !== undefined &&
      (!isRecord(value.foundations.zIndex) ||
        !hasOnlyKeys(value.foundations.zIndex, ['mobileStepper', 'fab', 'speedDial', 'appBar', 'drawer', 'modal', 'snackbar', 'tooltip']) ||
        !Object.values(value.foundations.zIndex).every((entry) => isOptionalNumber(entry)))
    ) {
      errors.push('foundations.zIndex must contain only numeric values.');
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
