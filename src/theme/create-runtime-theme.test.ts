import { describe, expect, it } from 'vitest';

import { createMuiDefaultProject } from '../domain/project/create-mui-default-project';
import type { ThemeProjectV1 } from '../domain/project/theme-project.types';
import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../fixtures/theme-project.fixtures';
import {
  resolveSurfaceColors,
  resolveTypographyVariants,
} from './create-runtime-theme';

// The panel resolutions (audit task 4.1): the values the Color and
// Typography panels display, read from the same runtime theme the
// preview renders, pinned here against the known applied values so a
// panel-side copy of the defaults cannot creep back in (findings C1
// and T1).
describe('resolveSurfaceColors', () => {
  it('reports the baseline surfaces for the default project, both schemes', () => {
    expect(resolveSurfaceColors(defaultProjectFixture, 'light')).toEqual({
      text: { primary: '#0a0a0a', secondary: '#737373', disabled: '#a3a3a3' },
      background: { default: '#ffffff', paper: '#ffffff' },
      divider: '#e5e5e5',
    });
    expect(resolveSurfaceColors(defaultProjectFixture, 'dark')).toEqual({
      text: { primary: '#fafafa', secondary: '#a3a3a3', disabled: '#737373' },
      background: { default: '#0a0a0a', paper: '#0a0a0a' },
      divider: '#262626',
    });
  });

  it('follows a stored surface edit instead of any default', () => {
    const project = {
      ...defaultProjectFixture,
      colorSchemes: {
        ...defaultProjectFixture.colorSchemes,
        light: { palette: { text: { primary: '#123456' }, divider: '#654321' } },
      },
    };
    const resolved = resolveSurfaceColors(project, 'light');
    expect(resolved.text.primary).toBe('#123456');
    expect(resolved.divider).toBe('#654321');
    // Untouched surfaces still resolve to the baseline.
    expect(resolved.text.secondary).toBe('#737373');
  });

  it('shows the Default preset rgba surfaces exactly as the theme carries them', () => {
    const resolved = resolveSurfaceColors(createMuiDefaultProject(), 'light');
    expect(resolved.text.primary).toBe('rgba(0, 0, 0, 0.87)');
    expect(resolved.divider).toBe('rgba(0, 0, 0, 0.12)');
    expect(resolved.background.paper).toBe('#fff');
  });
});

describe('resolveTypographyVariants', () => {
  // The audit's T1 table, "theme applies" column, for an untouched
  // (Black) project: MUI's built-in scale with the baseline's body1,
  // body2, and button overrides layered in.
  it('reports the applied scale for the default project', () => {
    const resolved = resolveTypographyVariants(defaultProjectFixture);
    expect(resolved.h1).toEqual({ fontSize: 96, fontWeight: 300, lineHeight: 1.167, letterSpacing: 0 });
    expect(resolved.h2).toEqual({ fontSize: 60, fontWeight: 300, lineHeight: 1.2, letterSpacing: 0 });
    expect(resolved.h3).toEqual({ fontSize: 48, fontWeight: 400, lineHeight: 1.167, letterSpacing: 0 });
    expect(resolved.h4).toEqual({ fontSize: 34, fontWeight: 400, lineHeight: 1.235, letterSpacing: 0 });
    expect(resolved.h5).toEqual({ fontSize: 24, fontWeight: 400, lineHeight: 1.334, letterSpacing: 0 });
    expect(resolved.h6).toEqual({ fontSize: 20, fontWeight: 500, lineHeight: 1.6, letterSpacing: 0 });
    expect(resolved.subtitle1).toEqual({ fontSize: 16, fontWeight: 400, lineHeight: 1.75, letterSpacing: 0 });
    expect(resolved.subtitle2).toEqual({ fontSize: 14, fontWeight: 500, lineHeight: 1.57, letterSpacing: 0 });
    expect(resolved.body1).toEqual({ fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 });
    expect(resolved.body2).toEqual({ fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0 });
    expect(resolved.button).toEqual({ fontSize: 14, fontWeight: 500, lineHeight: 1.4, letterSpacing: 0 });
    expect(resolved.caption).toEqual({ fontSize: 12, fontWeight: 400, lineHeight: 1.66, letterSpacing: 0 });
    expect(resolved.overline).toEqual({ fontSize: 12, fontWeight: 400, lineHeight: 2.66, letterSpacing: 0 });
  });

  // The letter spacings above are 0 because MUI only builds its em
  // letter spacings into a theme whose font stack is exactly its
  // Roboto default; the builder's baseline stack is not, so unset
  // variants genuinely carry none. Where a project stores the em
  // values (the Default preset), they resolve and convert to px at
  // the variant's size.
  it('converts stored em letter spacings to px at the variant size', () => {
    const resolved = resolveTypographyVariants(createMuiDefaultProject());
    expect(resolved.h1.letterSpacing).toBe(-1.5);
    expect(resolved.button.letterSpacing).toBe(0.4);
    expect(resolved.overline.letterSpacing).toBe(1);
    expect(resolved.h1.fontSize).toBe(96);
    expect(resolved.body2.lineHeight).toBe(1.43);
  });

  it('a stored variant wins over the defaults', () => {
    const project: ThemeProjectV1 = {
      ...defaultProjectFixture,
      foundations: {
        ...defaultProjectFixture.foundations,
        typography: { variants: { h1: { fontSize: 40, fontWeight: 700 } } },
      },
    };
    const resolved = resolveTypographyVariants(project);
    expect(resolved.h1.fontSize).toBe(40);
    expect(resolved.h1.fontWeight).toBe(700);
    // Properties the stored variant omits still resolve from MUI.
    expect(resolved.h1.lineHeight).toBe(1.167);
  });

  it('the customized fixture, which stores no variants, resolves like the default', () => {
    const resolved = resolveTypographyVariants(customizedProjectFixture);
    expect(resolved.h1.fontSize).toBe(96);
    expect(resolved.body1.fontSize).toBe(14);
  });
});
