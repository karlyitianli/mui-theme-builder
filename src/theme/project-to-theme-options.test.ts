import { describe, expect, it } from 'vitest';

import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../fixtures/theme-project.fixtures';
import { projectToThemeOptions } from './project-to-theme-options';

// Characterization tests for the project to MUI theme options mapping.
describe('projectToThemeOptions (characterization)', () => {
  it('maps the default project to the baseline options', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    expect(options.cssVariables).toMatchObject({ colorSchemeSelector: 'data' });
    expect(options.shape?.borderRadius).toBe(6);
    expect(options.spacing).toBeUndefined();
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
