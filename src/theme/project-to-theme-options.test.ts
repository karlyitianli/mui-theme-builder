import { createTheme, rgbToHex } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import type { ThemeProject } from '../domain/project';
import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../fixtures/theme-project.fixtures';
import { createRuntimeTheme, resolveSemanticColors } from './create-runtime-theme';
import { semanticColorMainDefault } from './palette-adapter';
import { projectToThemeOptions } from './project-to-theme-options';

// Characterization tests for the project to MUI theme options mapping.
describe('projectToThemeOptions (characterization)', () => {
  it('maps the default project to the baseline options', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    expect(options.cssVariables).toMatchObject({ colorSchemeSelector: 'data' });
    expect(options.shape?.borderRadius).toBe(6);
    // Karl's Nov 26, 2026 spacing fix: the default (Black) project now
    // stores its 8px base, so the options carry it and the panel, the
    // preview, and the exported theme agree. This assertion previously
    // pinned the disagreement (spacing undefined for a fresh project).
    expect(options.spacing).toBe(8);
    expect(options.colorSchemes?.light).toBeDefined();
    expect(options.colorSchemes?.dark).toBeDefined();
  });

  it('maps customized foundations and palette values', () => {
    const options = projectToThemeOptions(customizedProjectFixture);
    expect(options.shape?.borderRadius).toBe(8);
    expect(options.spacing).toBe(8);

    const light = options.colorSchemes?.light as { palette?: { primary?: { main?: string } } };
    const dark = options.colorSchemes?.dark as { palette?: { primary?: { main?: string } } };
    expect(light.palette?.primary?.main).toBe('#6750a4');
    expect(dark.palette?.primary?.main).toBe('#d0bcff');
  });

  it('maps customized button settings into MuiButton', () => {
    const options = projectToThemeOptions(customizedProjectFixture);
    const button = options.components?.MuiButton as
      | { defaultProps?: Record<string, unknown>; styleOverrides?: { root?: Record<string, unknown> } }
      | undefined;
    expect(button?.defaultProps).toMatchObject({ disableElevation: true, variant: 'contained' });
    expect(button?.styleOverrides?.root).toMatchObject({ textTransform: 'none', fontWeight: 600 });
  });
});

// Task 3.6 (Nov 26, 2026): palette.grey and palette.action emit in
// full for both schemes. The stored defaults are MUI's (see
// palette-defaults.ts), the values every project already resolved to
// before the groups had model homes, so the resolved runtime theme is
// unchanged; only the options (and therefore the export) gain the
// explicit blocks.
describe('grey and action groups (task 3.6)', () => {
  const greyDefaults = {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  };

  it('emits the MUI grey ramp and per-scheme action defaults for the default project', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    const light = options.colorSchemes?.light as {
      palette?: { grey?: unknown; action?: unknown };
    };
    const dark = options.colorSchemes?.dark as {
      palette?: { grey?: unknown; action?: unknown };
    };
    expect(light.palette?.grey).toEqual(greyDefaults);
    expect(dark.palette?.grey).toEqual(greyDefaults);
    expect(light.palette?.action).toEqual({
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
      hoverOpacity: 0.04,
      selected: 'rgba(0, 0, 0, 0.08)',
      selectedOpacity: 0.08,
      disabled: 'rgba(0, 0, 0, 0.26)',
      disabledBackground: 'rgba(0, 0, 0, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(0, 0, 0, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.12,
    });
    expect(dark.palette?.action).toEqual({
      active: '#fff',
      hover: 'rgba(255, 255, 255, 0.08)',
      hoverOpacity: 0.08,
      selected: 'rgba(255, 255, 255, 0.16)',
      selectedOpacity: 0.16,
      disabled: 'rgba(255, 255, 255, 0.3)',
      disabledBackground: 'rgba(255, 255, 255, 0.12)',
      disabledOpacity: 0.38,
      focus: 'rgba(255, 255, 255, 0.12)',
      focusOpacity: 0.12,
      activatedOpacity: 0.24,
    });
  });

  it('resolves the same defaults for a sparse project that stores neither group', () => {
    const options = projectToThemeOptions(customizedProjectFixture);
    const light = options.colorSchemes?.light as {
      palette?: { grey?: Record<string, string>; action?: { hoverOpacity?: number } };
    };
    expect(light.palette?.grey?.[500]).toBe('#9e9e9e');
    expect(light.palette?.action?.hoverOpacity).toBe(0.04);
  });

  it('carries stored grey and action edits into the options', () => {
    const project: ThemeProject = {
      ...customizedProjectFixture,
      colorSchemes: {
        light: {
          palette: {
            grey: { 500: '#123456' },
            action: { hover: '#ff0000', hoverOpacity: 0.5 },
          },
        },
        dark: { palette: {} },
      },
    };
    const options = projectToThemeOptions(project);
    const light = options.colorSchemes?.light as {
      palette?: { grey?: Record<string, string>; action?: { hover?: string; hoverOpacity?: number } };
    };
    expect(light.palette?.grey?.[500]).toBe('#123456');
    // Unstored shades still resolve to the defaults around the edit.
    expect(light.palette?.grey?.[900]).toBe('#212121');
    expect(light.palette?.action?.hover).toBe('#ff0000');
    expect(light.palette?.action?.hoverOpacity).toBe(0.5);
  });

  it('the runtime theme grey and action match a plain createTheme oracle per mode', () => {
    const theme = createRuntimeTheme(defaultProjectFixture);
    for (const mode of ['light', 'dark'] as const) {
      const oracle = createTheme({ palette: { mode } }).palette;
      const palette = theme.colorSchemes[mode]!.palette;
      expect(palette.grey).toEqual(oracle.grey);
      expect(palette.action.active).toBe(oracle.action.active);
      expect(palette.action.hover).toBe(oracle.action.hover);
      expect(palette.action.hoverOpacity).toBe(oracle.action.hoverOpacity);
      expect(palette.action.selected).toBe(oracle.action.selected);
      expect(palette.action.disabled).toBe(oracle.action.disabled);
      expect(palette.action.disabledBackground).toBe(oracle.action.disabledBackground);
      expect(palette.action.focus).toBe(oracle.action.focus);
      expect(palette.action.activatedOpacity).toBe(oracle.action.activatedOpacity);
    }
  });
});

describe('semantic color variants (main, light, dark)', () => {
  it('leaves light and dark out of the options for an unpinned token', () => {
    const options = projectToThemeOptions(customizedProjectFixture);
    const light = options.colorSchemes?.light as {
      palette?: { primary?: Record<string, unknown> };
    };
    // Only the stored main plus the baseline contrastText: no light or
    // dark keys, so the consumer's createTheme derives them from main.
    expect(light.palette?.primary).toEqual({ main: '#6750a4', contrastText: '#fafafa' });
  });

  it('derives an unpinned token\u2019s light and dark from its custom main at theme build', () => {
    const theme = createRuntimeTheme(customizedProjectFixture);
    const lightOracle = createTheme({ palette: { primary: { main: '#6750a4' } } });
    expect(theme.colorSchemes.light!.palette.primary.light).toBe(lightOracle.palette.primary.light);
    expect(theme.colorSchemes.light!.palette.primary.dark).toBe(lightOracle.palette.primary.dark);
    const darkOracle = createTheme({ palette: { primary: { main: '#d0bcff' } } });
    expect(theme.colorSchemes.dark!.palette.primary.light).toBe(darkOracle.palette.primary.light);
    expect(theme.colorSchemes.dark!.palette.primary.dark).toBe(darkOracle.palette.primary.dark);
  });

  it('carries pinned light and dark values into the options and the runtime theme unchanged', () => {
    const project: ThemeProject = {
      ...customizedProjectFixture,
      colorSchemes: {
        light: {
          palette: { primary: { main: '#6750a4', light: '#111111', dark: '#222222' } },
        },
        dark: { palette: {} },
      },
    };
    const options = projectToThemeOptions(project);
    const light = options.colorSchemes?.light as {
      palette?: { primary?: { light?: string; dark?: string } };
    };
    expect(light.palette?.primary?.light).toBe('#111111');
    expect(light.palette?.primary?.dark).toBe('#222222');
    const theme = createRuntimeTheme(project);
    expect(theme.colorSchemes.light!.palette.primary.light).toBe('#111111');
    expect(theme.colorSchemes.light!.palette.primary.dark).toBe('#222222');
  });

  it('resolveSemanticColors reports the derivation as hex, matching MUI\u2019s own values', () => {
    const resolved = resolveSemanticColors(defaultProjectFixture, 'light');
    const oracle = createTheme({ palette: { primary: { main: '#171717' } } });
    expect(resolved.primary.main).toBe('#171717');
    expect(resolved.primary.light).toBe(rgbToHex(oracle.palette.primary.light));
    expect(resolved.primary.dark).toBe(rgbToHex(oracle.palette.primary.dark));
    expect(resolved.primary.light).toBe('#454545');
    expect(resolved.primary.dark).toBe('#101010');
  });

  it('resolveSemanticColors follows a main edit to the new derivation', () => {
    const resolved = resolveSemanticColors(customizedProjectFixture, 'light');
    expect(resolved.primary.main).toBe('#6750a4');
    expect(resolved.primary.light).toBe('#8573b6');
    expect(resolved.primary.dark).toBe('#483872');
  });

  it('semanticColorMainDefault matches the mains a fresh project resolves to', () => {
    const roles = ['primary', 'secondary', 'error', 'warning', 'info', 'success'] as const;
    for (const mode of ['light', 'dark'] as const) {
      const resolved = resolveSemanticColors(defaultProjectFixture, mode);
      for (const role of roles) {
        expect(semanticColorMainDefault(mode, role)).toBe(resolved[role].main);
      }
    }
  });
});
