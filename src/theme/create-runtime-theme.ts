import { createTheme, rgbToHex } from '@mui/material/styles';

import type { SemanticColorRole } from '../domain/palette.types';
import type { ThemeProject } from '../domain/project';
import type { TypographyVariant } from '../domain/typography.types';
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

// The Color panel's display form for a resolved palette string: hex is
// lowercased and rgb() is converted like the semantic values above,
// but anything else MUI passes through untouched (the rgba() strings
// the Default preset stores for its text and divider, a stored
// three-digit hex) is shown exactly as the theme carries it.
function toDisplayColor(value: string): string {
  if (value.startsWith('#')) return value.toLowerCase();
  if (value.startsWith('rgb(')) return rgbToHex(value);
  return value;
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

export interface ResolvedSurfaceColors {
  text: { primary: string; secondary: string; disabled: string };
  background: { default: string; paper: string };
  divider: string;
}

// The surface colors exactly as the preview theme resolves them for
// one scheme (text, backgrounds, divider), from the same runtime theme
// resolveSemanticColors reads. The Color panel's surface rows show
// these, so the panel carries no hardcoded copy of the palette
// defaults (audit finding C1): the baseline plus MUI's defaults, via
// the theme mapping, are the one source.
export function resolveSurfaceColors(
  project: ThemeProject,
  mode: 'light' | 'dark',
): ResolvedSurfaceColors {
  const palette = createRuntimeTheme(project).colorSchemes[mode]!.palette;
  return {
    text: {
      primary: toDisplayColor(palette.text.primary),
      secondary: toDisplayColor(palette.text.secondary),
      disabled: toDisplayColor(palette.text.disabled),
    },
    background: {
      default: toDisplayColor(palette.background.default),
      paper: toDisplayColor(palette.background.paper),
    },
    divider: toDisplayColor(palette.divider),
  };
}

export const TYPOGRAPHY_VARIANTS: readonly TypographyVariant[] = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'subtitle1',
  'subtitle2',
  'body1',
  'body2',
  'button',
  'caption',
  'overline',
];

export interface ResolvedTypographyVariant {
  // The variant's size in px: MUI reports its own default sizes as rem
  // strings (converted back at the theme's base size and 16px root),
  // while stored sizes pass through as the px numbers the model uses.
  fontSize: number;
  fontWeight: number;
  lineHeight: number | string;
  // The variant's letter spacing in px at its own size, the unit the
  // Typography panel's editor steps in. MUI expresses letter spacing
  // in em when it carries one at all; a variant the resolved theme
  // leaves without one applies no extra spacing, reported as 0.
  letterSpacing: number;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

function fontSizeToPx(
  value: string | number | undefined,
  baseFontSize: number,
  htmlFontSize: number,
): number {
  if (value === undefined) return baseFontSize;
  if (typeof value === 'number') return value;
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return baseFontSize;
  // MUI converts its default px sizes with pxToRem at the theme's base
  // size over the html root size; invert that conversion so the panel
  // reports the px the theme effectively applies.
  if (value.endsWith('rem')) return round2((numeric * htmlFontSize * 14) / baseFontSize);
  if (value.endsWith('em')) return round2(numeric * baseFontSize);
  return numeric;
}

function letterSpacingToPx(value: string | number | undefined, fontSizePx: number): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) return 0;
  if (value.endsWith('em')) return round2(numeric * fontSizePx);
  return numeric;
}

// Every variant exactly as the preview theme resolves it, from the
// same runtime theme the preview renders with. The Typography panel's
// specimens and variant editor read these, so what the panel shows is
// what the theme applies and the exporter ships (audit finding T1):
// the baseline's overrides and MUI's built-in defaults are already
// layered in here, and a stored variant value wins over both.
export function resolveTypographyVariants(
  project: ThemeProject,
): Record<TypographyVariant, ResolvedTypographyVariant> {
  const typography = createRuntimeTheme(project).typography;
  const baseFontSize = typography.fontSize;
  const htmlFontSize = typography.htmlFontSize;
  const resolved = {} as Record<TypographyVariant, ResolvedTypographyVariant>;
  for (const variant of TYPOGRAPHY_VARIANTS) {
    const style = typography[variant];
    const fontSize = fontSizeToPx(style.fontSize, baseFontSize, htmlFontSize);
    resolved[variant] = {
      fontSize,
      fontWeight: typeof style.fontWeight === 'number' ? style.fontWeight : 400,
      // MUI's variant builder always sets a line height for the 13
      // variants; the fallback only satisfies the optional field in
      // its types.
      lineHeight: style.lineHeight ?? 1.5,
      letterSpacing: letterSpacingToPx(style.letterSpacing, fontSize),
    };
  }
  return resolved;
}
