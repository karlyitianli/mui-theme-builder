import {
  DEFAULT_BREAKPOINTS,
  DEFAULT_CARD_BORDER_RADIUS,
  DEFAULT_SHADOWS,
  DEFAULT_SPACING,
  DEFAULT_TRANSITION_DURATION,
  DEFAULT_TRANSITION_EASING,
  DEFAULT_Z_INDEX,
} from '../foundation-defaults';
import { DEFAULT_ACTION, DEFAULT_GREY } from '../palette-defaults';
import type { PaletteSettings } from '../palette.types';
import { CURRENT_SCHEMA_VERSION } from './project-version';
import type { ThemeProject } from './theme-project.types';
import { validateThemeProject, type ProjectValidationResult } from './validate-theme-project';

export type ProjectMigrationResult =
  | { success: true; project: ThemeProject; migrated: boolean }
  | { success: false; errors: string[] };

// Fills one scheme's palette with the Grey and Action defaults (task
// 3.6), per key, the way the foundation groups below fill: a project
// saved before the groups existed gains exactly the MUI values its
// theme already resolved to, and stored shades or action values are
// never overwritten.
function withPaletteDefaults(
  mode: 'light' | 'dark',
  palette: PaletteSettings | undefined,
): { palette: PaletteSettings; migrated: boolean } {
  const grey = palette?.grey ?? {};
  const action = palette?.action ?? {};
  const filledGrey = { ...DEFAULT_GREY, ...grey };
  const filledAction = { ...DEFAULT_ACTION[mode], ...action };
  // The fill only ever adds keys, so a longer filled group is exactly
  // "some key was missing".
  const migrated =
    Object.keys(filledGrey).length > Object.keys(grey).length ||
    Object.keys(filledAction).length > Object.keys(action).length;
  if (!migrated) return { palette: palette ?? {}, migrated: false };
  return { palette: { ...palette, grey: filledGrey, action: filledAction }, migrated: true };
}

// Projects saved before the Phase 5 foundation fields existed have no
// shadows, no card radius, and possibly no spacing base unit. Fill those
// with the shared locked defaults so a loaded project edits and exports
// exactly what the panels show. Values a project already carries are
// never overwritten, per key. The Other tab's groups (task 3.5,
// breakpoints, transitions, z-index) fill the same way with MUI's
// defaults, so a project saved before they existed gains exactly the
// values its theme already resolved to. The palette's Grey and Action
// groups (task 3.6) fill identically, per scheme and per key.
function withFoundationDefaults(project: ThemeProject): { project: ThemeProject; migrated: boolean } {
  const foundations = project.foundations ?? {};
  const shape = foundations.shape ?? {};
  const shadows = foundations.shadows ?? {};
  const breakpoints = foundations.breakpoints ?? {};
  const duration = foundations.transitions?.duration ?? {};
  const easing = foundations.transitions?.easing ?? {};
  const zIndex = foundations.zIndex ?? {};

  const needsSpacing = foundations.spacing === undefined;
  const needsCardRadius = shape.cardBorderRadius === undefined;
  const filledShadows = { ...DEFAULT_SHADOWS, ...shadows };
  const needsShadows = Object.keys(filledShadows).some(
    (key) => shadows[key as keyof typeof shadows] === undefined,
  );
  const filledBreakpoints = { ...DEFAULT_BREAKPOINTS, ...breakpoints };
  const needsBreakpoints = Object.keys(filledBreakpoints).some(
    (key) => breakpoints[key as keyof typeof breakpoints] === undefined,
  );
  const filledDuration = { ...DEFAULT_TRANSITION_DURATION, ...duration };
  const filledEasing = { ...DEFAULT_TRANSITION_EASING, ...easing };
  const needsTransitions =
    Object.keys(filledDuration).some(
      (key) => duration[key as keyof typeof duration] === undefined,
    ) ||
    Object.keys(filledEasing).some((key) => easing[key as keyof typeof easing] === undefined);
  const filledZIndex = { ...DEFAULT_Z_INDEX, ...zIndex };
  const needsZIndex = Object.keys(filledZIndex).some(
    (key) => zIndex[key as keyof typeof zIndex] === undefined,
  );

  const lightPalette = withPaletteDefaults('light', project.colorSchemes.light.palette);
  const darkPalette = withPaletteDefaults('dark', project.colorSchemes.dark.palette);
  const needsPalette = lightPalette.migrated || darkPalette.migrated;

  if (!needsSpacing && !needsCardRadius && !needsShadows && !needsBreakpoints && !needsTransitions && !needsZIndex && !needsPalette) {
    return { project, migrated: false };
  }

  return {
    migrated: true,
    project: {
      ...project,
      ...(needsPalette
        ? {
            colorSchemes: {
              light: { ...project.colorSchemes.light, palette: lightPalette.palette },
              dark: { ...project.colorSchemes.dark, palette: darkPalette.palette },
            },
          }
        : {}),
      foundations: {
        ...foundations,
        ...(needsSpacing ? { spacing: DEFAULT_SPACING } : {}),
        shape: {
          ...shape,
          ...(needsCardRadius ? { cardBorderRadius: DEFAULT_CARD_BORDER_RADIUS } : {}),
        },
        shadows: filledShadows,
        breakpoints: filledBreakpoints,
        transitions: { duration: filledDuration, easing: filledEasing },
        zIndex: filledZIndex,
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
