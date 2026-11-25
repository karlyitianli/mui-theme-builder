import { createTheme, rgbToHex } from '@mui/material/styles';

import type { SemanticColorRole } from '../domain/palette.types';
import type { ThemeProject } from '../domain/project';
import { projectToThemeOptions } from './project-to-theme-options';

export function createRuntimeTheme(project: ThemeProject) {
  return createTheme(projectToThemeOptions(project));
}

const SEMANTIC_ROLES: readonly SemanticColorRole[] = [
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
];

export interface ResolvedSemanticColor {
  main: string;
  light: string;
  dark: string;
}

// MUI's resolved palette reports derived light and dark values as
// rgb() strings; the project model and the Color panel speak six-digit
// hex, so resolved values are reformatted with MUI's own rgbToHex. The
// derivation itself is MUI's augmentColor, untouched.
function toHexColor(value: string): string {
  return value.startsWith('#') ? value.toLowerCase() : rgbToHex(value);
}

// The semantic colors exactly as the preview theme resolves them for
// one scheme: stored values where the project pins them, MUI's
// derivation from main where it does not. Built from the same runtime
// theme the preview renders with, so the Color panel's auto values can
// never drift from what the preview and the exported theme apply.
export function resolveSemanticColors(
  project: ThemeProject,
  mode: 'light' | 'dark',
): Record<SemanticColorRole, ResolvedSemanticColor> {
  // projectToThemeOptions always defines both schemes, so the requested
  // scheme is present by construction.
  const palette = createRuntimeTheme(project).colorSchemes[mode]!.palette;
  const resolved = {} as Record<SemanticColorRole, ResolvedSemanticColor>;
  for (const role of SEMANTIC_ROLES) {
    const color = palette[role];
    resolved[role] = {
      main: toHexColor(color.main),
      light: toHexColor(color.light),
      dark: toHexColor(color.dark),
    };
  }
  return resolved;
}
