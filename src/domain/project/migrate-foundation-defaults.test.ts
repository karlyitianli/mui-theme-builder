import { describe, expect, it } from 'vitest';

import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../../fixtures/theme-project.fixtures';
import { migrateThemeProject } from './migrate-theme-project';

// Phase 5: projects saved before foundations.shadows,
// foundations.shape.cardBorderRadius, and the shared 4px spacing default
// existed gain those defaults through migration, per key, without
// overwriting values the project already carries. The shadow defaults
// migration fills are the builder's current ones: since Karl's Nov 26,
// 2026 shadow decision that is the None configuration (global 0, Button
// 2, Card 1, Input 0, Menu 8); before that decision it filled the
// Medium set (global 2, no menu key).
describe('migrateThemeProject foundation defaults (Phase 5)', () => {
  it('gives an old project the new shadow and card radius defaults', () => {
    const result = migrateThemeProject(customizedProjectFixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.migrated).toBe(true);
    expect(result.project.foundations?.shadows).toEqual({
      global: 0,
      button: 2,
      card: 1,
      input: 0,
      menu: 8,
    });
    expect(result.project.foundations?.shape?.cardBorderRadius).toBe(12);
    // Values the project already had are preserved.
    expect(result.project.foundations?.shape?.borderRadius).toBe(8);
    expect(result.project.foundations?.spacing).toBe(8);
  });

  it('gives a project with no foundations the 4px spacing default', () => {
    const bare = { ...defaultProjectFixture, foundations: undefined };
    const result = migrateThemeProject(bare);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.migrated).toBe(true);
    expect(result.project.foundations?.spacing).toBe(4);
    expect(result.project.foundations?.shadows).toEqual({
      global: 0,
      button: 2,
      card: 1,
      input: 0,
      menu: 8,
    });
    expect(result.project.foundations?.shape?.cardBorderRadius).toBe(12);
  });

  // Task 3.5 (Nov 26, 2026): the Other tab's groups fill the same way,
  // with MUI's defaults, the values a pre-3.5 project's theme already
  // resolved to.
  it('gives an old project the MUI defaults for breakpoints, transitions, and z-index', () => {
    const result = migrateThemeProject(customizedProjectFixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.project.foundations?.breakpoints).toEqual({
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    });
    expect(result.project.foundations?.transitions?.duration).toEqual({
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    });
    expect(result.project.foundations?.transitions?.easing).toEqual({
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    });
    expect(result.project.foundations?.zIndex).toEqual({
      mobileStepper: 1000,
      fab: 1050,
      speedDial: 1050,
      appBar: 1100,
      drawer: 1200,
      modal: 1300,
      snackbar: 1400,
      tooltip: 1500,
    });
  });

  it('fills only the missing Other keys and keeps the stored ones', () => {
    const partial = {
      ...defaultProjectFixture,
      foundations: {
        ...defaultProjectFixture.foundations,
        breakpoints: { md: 1000 },
        transitions: { duration: { standard: 450 } },
        zIndex: { modal: 2000 },
      },
    };
    const result = migrateThemeProject(partial);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.project.foundations?.breakpoints?.md).toBe(1000);
    expect(result.project.foundations?.breakpoints?.lg).toBe(1200);
    expect(result.project.foundations?.transitions?.duration?.standard).toBe(450);
    expect(result.project.foundations?.transitions?.duration?.shortest).toBe(150);
    expect(result.project.foundations?.transitions?.easing?.sharp).toBe(
      'cubic-bezier(0.4, 0, 0.6, 1)',
    );
    expect(result.project.foundations?.zIndex?.modal).toBe(2000);
    expect(result.project.foundations?.zIndex?.tooltip).toBe(1500);
  });

  // Task 3.6 (Nov 26, 2026): the palette's Grey and Action groups fill
  // the same way, per scheme and per key, with MUI's defaults, the
  // values a pre-3.6 project's theme already resolved to (the baseline
  // carries neither group). The grey ramp is mode-independent; the
  // action group is stored per scheme because MUI's differs by mode.
  it('gives an old project the MUI grey ramp and per-scheme action defaults', () => {
    const result = migrateThemeProject(customizedProjectFixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const mode of ['light', 'dark'] as const) {
      expect(result.project.colorSchemes[mode].palette?.grey).toEqual({
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
      });
    }
    expect(result.project.colorSchemes.light.palette?.action).toEqual({
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
    expect(result.project.colorSchemes.dark.palette?.action?.active).toBe('#fff');
    expect(result.project.colorSchemes.dark.palette?.action?.activatedOpacity).toBe(0.24);
    // The palette values the project already had are preserved.
    expect(result.project.colorSchemes.light.palette?.primary?.main).toBe('#6750a4');
    expect(result.project.colorSchemes.dark.palette?.primary?.main).toBe('#d0bcff');
  });

  it('fills only the missing grey and action keys and keeps the stored ones', () => {
    const partial = {
      ...defaultProjectFixture,
      colorSchemes: {
        light: {
          palette: {
            grey: { 500: '#111111' },
            action: { hoverOpacity: 0.5 },
          },
        },
        dark: { palette: {} },
      },
    };
    const result = migrateThemeProject(partial);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.migrated).toBe(true);
    expect(result.project.colorSchemes.light.palette?.grey?.[500]).toBe('#111111');
    expect(result.project.colorSchemes.light.palette?.grey?.[900]).toBe('#212121');
    expect(result.project.colorSchemes.light.palette?.action?.hoverOpacity).toBe(0.5);
    expect(result.project.colorSchemes.light.palette?.action?.hover).toBe('rgba(0, 0, 0, 0.04)');
    expect(result.project.colorSchemes.dark.palette?.action?.active).toBe('#fff');
  });

  it('fills only the missing shadow keys and reports no migration when complete', () => {
    const partial = {
      ...defaultProjectFixture,
      foundations: {
        spacing: 6,
        shape: { cardBorderRadius: 9 },
        shadows: { global: 9 },
      },
    };
    const first = migrateThemeProject(partial);
    expect(first.success).toBe(true);
    if (!first.success) return;
    expect(first.migrated).toBe(true);
    expect(first.project.foundations?.shadows).toEqual({
      global: 9,
      button: 2,
      card: 1,
      input: 0,
      menu: 8,
    });
    expect(first.project.foundations?.shape?.cardBorderRadius).toBe(9);
    expect(first.project.foundations?.spacing).toBe(6);

    const second = migrateThemeProject(first.project);
    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.migrated).toBe(false);
    expect(second.project).toEqual(first.project);
  });
});
