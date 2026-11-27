import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { emitThemeTsx } from '../../generator/emit-theme-tsx';
import { createRuntimeTheme } from '../../theme/create-runtime-theme';
import { projectToThemeOptions } from '../../theme/project-to-theme-options';
import { createDefaultProject } from './create-default-project';
import { createMuiDefaultProject } from './create-mui-default-project';
import { migrateThemeProject } from './migrate-theme-project';
import { STARTUP_PRESET_ID, THEME_PRESETS } from './theme-presets';

// Karl's Nov 26, 2026 preset decisions: the shadcn-styled preset is
// renamed "Black" and stays the startup preset; a new "Default" preset
// carries MUI's actual default theme values.
describe('theme presets (Nov 26, 2026)', () => {
  it('registers Black first and Default second, starting on Black', () => {
    expect(THEME_PRESETS.map((preset) => preset.name)).toEqual(['Black', 'Default']);
    expect(STARTUP_PRESET_ID).toBe('black');
  });

  it('derives the preset dots from each preset\u2019s own light palette (task 4.1, finding C7)', () => {
    // Primary, secondary, surface (background paper), divider of the
    // preset's light scheme, resolved through the palette adapter:
    // the dots are identity swatches, not a literal copy that can go
    // stale. (The old Black literals duplicated the secondary in the
    // surface slot; the resolved paper is #ffffff.)
    expect(THEME_PRESETS[0].dots).toEqual(['#171717', '#f5f5f5', '#ffffff', '#e5e5e5']);
    expect(THEME_PRESETS[1].dots).toEqual([
      '#1976d2',
      '#9c27b0',
      '#fff',
      'rgba(0, 0, 0, 0.12)',
    ]);
  });

  it('the Black project stores the Nov 26 density and shadow configuration', () => {
    const project = createDefaultProject();
    // Comfortable (8px) is stored explicitly; shadows are the None
    // configuration (global 0, elevation on the components).
    expect(project.foundations?.spacing).toBe(8);
    expect(project.foundations?.shadows).toEqual({
      global: 0,
      button: 2,
      card: 1,
      input: 0,
      menu: 8,
    });
    // The palette stays sparse apart from the Grey and Action groups
    // (task 3.6), which both presets store explicitly at MUI's
    // defaults: the baseline in the theme mapping supplies the Black
    // values for everything else, but it carries neither group, so
    // storing them is what keeps the panel, the preview, and the
    // export in agreement, as with the stored foundations.
    for (const mode of ['light', 'dark'] as const) {
      const palette = project.colorSchemes[mode].palette;
      expect(palette?.primary).toBeUndefined();
      expect(palette?.background).toBeUndefined();
      expect(palette?.text).toBeUndefined();
      expect(palette?.divider).toBeUndefined();
      expect(palette?.grey?.[500]).toBe('#9e9e9e');
      expect(Object.keys(palette?.grey ?? {})).toHaveLength(10);
      expect(Object.keys(palette?.action ?? {})).toHaveLength(11);
    }
    expect(project.colorSchemes.light.palette?.action?.active).toBe('rgba(0, 0, 0, 0.54)');
    expect(project.colorSchemes.dark.palette?.action?.active).toBe('#fff');
  });

  it('a fresh Black project agrees on spacing across panel value, options, runtime theme, and export', () => {
    const project = createDefaultProject();
    // The panel reads foundations.spacing; the theme options, the
    // runtime theme the preview renders, and the exported theme.tsx
    // must all carry the same 8px base. Before Nov 26, 2026 the
    // options omitted spacing for a fresh project and MUI's default
    // silently governed the export instead.
    expect(project.foundations?.spacing).toBe(8);
    expect(projectToThemeOptions(project).spacing).toBe(8);
    // The runtime theme is a CSS-variables theme, so its spacing
    // function returns the variable reference whose fallback is the
    // base unit: 8px, the same value.
    expect(createRuntimeTheme(project).spacing(1)).toBe('var(--mui-spacing, 8px)');
    expect(emitThemeTsx(project)).toContain('spacing: 8');
  });

  it('a fresh Black project agrees on radius across stored value, options, runtime theme, and export (task 5.3)', () => {
    const project = createDefaultProject();
    // Karl's Nov 26, 2026 radius decision: Rounded (8px) is the
    // default radius preset, so the Black project stores 8 and the
    // theme options, the runtime theme the preview renders, and the
    // exported theme.tsx all carry borderRadius 8. Projects that
    // never stored a radius still resolve to the historical 6px
    // fallback. The MUI Default preset is untouched by the decision:
    // it keeps MUI's own 4, pinned against the oracle below.
    expect(project.foundations?.shape?.borderRadius).toBe(8);
    expect(projectToThemeOptions(project).shape?.borderRadius).toBe(8);
    expect(createRuntimeTheme(project).shape.borderRadius).toBe(8);
    expect(emitThemeTsx(project)).toContain('borderRadius: 8');
  });

  it('the Black project leaves textTransform unset and resolves exactly as before (task 1.5)', () => {
    const project = createDefaultProject();
    // Black stores no typography, and task 1.5 stores nothing for it:
    // unset already resolved to MUI's uppercase fill-in for the
    // Button and Overline variants, so the resolved theme is
    // unchanged. (Storing a partial Button variant would not be a
    // no-op: the theme mapping merges variants over the baseline
    // shallowly, so it would drop the baseline's Button line height
    // and letter spacing.)
    expect(project.foundations?.typography).toBeUndefined();
    const options = projectToThemeOptions(project);
    const typography = options.typography as
      | Record<string, { textTransform?: string } | undefined>
      | undefined;
    expect(typography?.button?.textTransform).toBeUndefined();
    expect(typography?.overline).toBeUndefined();
    const theme = createRuntimeTheme(project);
    expect(theme.typography.button.textTransform).toBe('uppercase');
    expect(theme.typography.overline.textTransform).toBe('uppercase');
    // The baseline's Button values still govern the rest of the
    // variant, proving the resolution did not drift.
    expect(theme.typography.button.lineHeight).toBe(1.4);
    expect(theme.typography.button.letterSpacing).toBe(0);
  });
});

describe('the Default preset against a plain createTheme oracle', () => {
  const project = createMuiDefaultProject();
  const theme = createRuntimeTheme(project);

  it('matches MUI palette values for both schemes', () => {
    const roles = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
    for (const mode of ['light', 'dark'] as const) {
      const oracle = createTheme({ palette: { mode } }).palette;
      const palette = theme.colorSchemes[mode]!.palette;
      for (const role of roles) {
        // Per-value comparison: the CSS-variables runtime palette also
        // carries channel bookkeeping keys the plain oracle lacks.
        expect(palette[role].main).toBe(oracle[role].main);
        expect(palette[role].light).toBe(oracle[role].light);
        expect(palette[role].dark).toBe(oracle[role].dark);
        expect(palette[role].contrastText).toBe(oracle[role].contrastText);
      }
      expect(palette.background.default).toBe(oracle.background.default);
      expect(palette.background.paper).toBe(oracle.background.paper);
      expect(palette.text.primary).toBe(oracle.text.primary);
      expect(palette.text.secondary).toBe(oracle.text.secondary);
      expect(palette.text.disabled).toBe(oracle.text.disabled);
      expect(palette.divider).toBe(oracle.divider);
      // Grey and action (task 3.6): the ramp's stored shades and the
      // full action group match the oracle per mode.
      for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const) {
        expect(palette.grey[shade]).toBe(oracle.grey[shade]);
      }
      for (const key of ['active', 'hover', 'hoverOpacity', 'selected', 'selectedOpacity', 'disabled', 'disabledBackground', 'disabledOpacity', 'focus', 'focusOpacity', 'activatedOpacity'] as const) {
        expect(palette.action[key]).toBe(oracle.action[key]);
      }
    }
  });

  it('both presets store the MUI grey and action defaults (task 3.6)', () => {
    for (const createProject of [createDefaultProject, createMuiDefaultProject]) {
      const stored = createProject();
      for (const mode of ['light', 'dark'] as const) {
        const oracle = createTheme({ palette: { mode } }).palette;
        const palette = stored.colorSchemes[mode].palette;
        for (const shade of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const) {
          expect(palette?.grey?.[shade]).toBe(oracle.grey[shade]);
        }
        expect(palette?.action).toEqual({
          active: oracle.action.active,
          hover: oracle.action.hover,
          hoverOpacity: oracle.action.hoverOpacity,
          selected: oracle.action.selected,
          selectedOpacity: oracle.action.selectedOpacity,
          disabled: oracle.action.disabled,
          disabledBackground: oracle.action.disabledBackground,
          disabledOpacity: oracle.action.disabledOpacity,
          focus: oracle.action.focus,
          focusOpacity: oracle.action.focusOpacity,
          activatedOpacity: oracle.action.activatedOpacity,
        });
      }
    }
  });

  it('matches MUI typography: Roboto stack, base size, and variant values', () => {
    const oracle = createTheme().typography;
    // The adapter joins the stack without per-family quotes; compare
    // with the oracle's quotes stripped.
    expect(theme.typography.fontFamily?.replaceAll('"', '')).toBe(
      oracle.fontFamily?.replaceAll('"', ''),
    );
    expect(theme.typography.fontSize).toBe(oracle.fontSize);
    // The builder's model stores variant font sizes in px; the oracle
    // expresses them in rem at the 16px root. Compare the same quantity
    // in px.
    const toPx = (value: string | number | undefined): number => {
      if (value === undefined) throw new Error('expected a font size');
      return typeof value === 'number' ? value : parseFloat(value) * (value.endsWith('rem') ? 16 : 1);
    };
    for (const variant of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption', 'overline'] as const) {
      expect(toPx(theme.typography[variant].fontSize)).toBe(toPx(oracle[variant].fontSize));
      expect(theme.typography[variant]).toMatchObject({
        fontWeight: oracle[variant].fontWeight,
        lineHeight: oracle[variant].lineHeight,
        letterSpacing: oracle[variant].letterSpacing,
      });
    }
    // The button variant is compared on the same properties as the
    // loop above, and its textTransform now matches the oracle too
    // (the field joined the model with task 1.5; before that the
    // resolved uppercase arrived by MUI's fill-in alone).
    expect(toPx(theme.typography.button.fontSize)).toBe(toPx(oracle.button.fontSize));
    expect(theme.typography.button).toMatchObject({
      fontWeight: oracle.button.fontWeight,
      lineHeight: oracle.button.lineHeight,
      letterSpacing: oracle.button.letterSpacing,
    });
    expect(theme.typography.button.textTransform).toBe(oracle.button.textTransform);
    expect(theme.typography.overline.textTransform).toBe(oracle.overline.textTransform);
    // No other variant carries a textTransform on either side.
    for (const variant of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption'] as const) {
      expect(theme.typography[variant].textTransform).toBeUndefined();
    }
  });

  it('stores uppercase for Button and Overline only, and the options carry exactly those (task 1.5)', () => {
    const variants = project.foundations?.typography?.variants;
    expect(variants?.button?.textTransform).toBe('uppercase');
    expect(variants?.overline?.textTransform).toBe('uppercase');
    for (const variant of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'subtitle1', 'subtitle2', 'body1', 'body2', 'caption'] as const) {
      expect(variants?.[variant]?.textTransform).toBeUndefined();
    }
    // The emitted options carry the field for exactly those two
    // variants; an unset variant emits no textTransform key at all,
    // so projects that never touch the field emit what they always
    // emitted.
    const options = projectToThemeOptions(project);
    const typography = options.typography as
      | Record<string, { textTransform?: string } | undefined>
      | undefined;
    expect(typography?.button?.textTransform).toBe('uppercase');
    expect(typography?.overline?.textTransform).toBe('uppercase');
    expect(typography?.h1 !== undefined && 'textTransform' in typography.h1).toBe(false);
    expect(typography?.caption !== undefined && 'textTransform' in typography.caption).toBe(
      false,
    );
  });

  it('a stored textTransform agrees across options, runtime theme, and export (task 1.5)', () => {
    const options = projectToThemeOptions(project);
    const typography = options.typography as
      | Record<string, { textTransform?: string } | undefined>
      | undefined;
    expect(typography?.button?.textTransform).toBe('uppercase');
    expect(theme.typography.button.textTransform).toBe('uppercase');
    expect(theme.typography.overline.textTransform).toBe('uppercase');
    expect(emitThemeTsx(project)).toContain("textTransform: 'uppercase'");
  });

  it('matches MUI breakpoints, transitions, and z-index (task 3.5)', () => {
    const oracle = createTheme();
    expect(theme.breakpoints.values).toEqual(oracle.breakpoints.values);
    expect(theme.transitions.duration).toEqual(oracle.transitions.duration);
    expect(theme.transitions.easing).toEqual(oracle.transitions.easing);
    expect(theme.zIndex).toEqual(oracle.zIndex);
    // Both presets store the MUI defaults for the three groups: for
    // Default they are the point, for Black they keep the Other panel,
    // the preview, and the export in agreement.
    for (const createProject of [createDefaultProject, createMuiDefaultProject]) {
      const foundations = createProject().foundations;
      expect(foundations?.breakpoints).toEqual(oracle.breakpoints.values);
      expect(foundations?.transitions?.duration).toEqual(oracle.transitions.duration);
      expect(foundations?.transitions?.easing).toEqual(oracle.transitions.easing);
      expect(foundations?.zIndex).toEqual(oracle.zIndex);
    }
  });

  it('matches MUI spacing, radius, and component default elevations', () => {
    const options = projectToThemeOptions(project);
    expect(options.spacing).toBe(8);
    expect(options.shape?.borderRadius).toBe(4);
    const paper = options.components?.MuiPaper as { defaultProps?: { elevation?: number } };
    const card = options.components?.MuiCard as {
      defaultProps?: { elevation?: number };
      styleOverrides?: { root?: { borderRadius?: number } };
    };
    const button = options.components?.MuiButton as {
      defaultProps?: { disableElevation?: boolean };
    };
    const menu = options.components?.MuiMenu as {
      defaultProps?: { slotProps?: { paper?: { elevation?: number } } };
    };
    expect(paper.defaultProps?.elevation).toBe(1);
    expect(card.defaultProps?.elevation).toBe(1);
    expect(card.styleOverrides?.root?.borderRadius).toBe(4);
    expect(button.defaultProps?.disableElevation).toBe(false);
    expect(menu.defaultProps?.slotProps?.paper?.elevation).toBe(8);
  });
});

// The rename safety net: stored projects never carried a preset name
// (the schema has no preset field), so nothing resolves "Default" to a
// factory on load. What migration must guarantee instead is that a
// project saved in the pre-rename shape keeps its stored values: its
// Medium shadows stay Medium, and it only gains the keys invented
// since (the menu elevation, and the legacy 4px spacing it was always
// displayed with).
describe('preset rename and saved projects', () => {
  it('a project saved before the rename keeps its stored values through migration', () => {
    const preRenameProject = {
      schemaVersion: 1,
      builderVersion: '0.0.0',
      targetMuiVersion: '9.3.1',
      metadata: {
        name: 'Untitled theme',
        createdAt: '2026-11-25T00:00:00.000Z',
        updatedAt: '2026-11-25T00:00:00.000Z',
      },
      colorSchemes: { light: {}, dark: {} },
      foundations: {
        shape: { cardBorderRadius: 12 },
        shadows: { global: 2, button: 2, card: 1, input: 0 },
      },
    };
    const result = migrateThemeProject(preRenameProject);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.migrated).toBe(true);
    expect(result.project.foundations?.shadows).toEqual({
      global: 2,
      button: 2,
      card: 1,
      input: 0,
      menu: 8,
    });
    expect(result.project.foundations?.spacing).toBe(4);
  });

  it('both preset projects round-trip through migration unchanged', () => {
    for (const createProject of [createDefaultProject, createMuiDefaultProject]) {
      const result = migrateThemeProject(createProject());
      expect(result.success).toBe(true);
      if (!result.success) continue;
      expect(result.migrated).toBe(false);
    }
  });
});
