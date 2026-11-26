import { describe, expect, it } from 'vitest';

import {
  customizedProjectFixture,
  defaultProjectFixture,
  futureProjectFixture,
  invalidProjectFixture,
} from '../../fixtures/theme-project.fixtures';
import { validateThemeProject } from './validate-theme-project';

// Characterization tests for the project validator, using the shared fixtures.
describe('validateThemeProject (characterization)', () => {
  it('accepts the default project', () => {
    const result = validateThemeProject(defaultProjectFixture);
    expect(result.success).toBe(true);
  });

  it('accepts a customized project', () => {
    const result = validateThemeProject(customizedProjectFixture);
    expect(result.success).toBe(true);
  });

  // Task 3.5: the Other tab's foundation groups validate by key and
  // value type, like shadows.
  it('accepts a project carrying the Other foundation groups', () => {
    const project = {
      ...defaultProjectFixture,
      foundations: {
        ...defaultProjectFixture.foundations,
        breakpoints: { md: 1000 },
        transitions: {
          duration: { standard: 450 },
          easing: { easeOut: 'cubic-bezier(0.1, 0, 0.3, 1)' },
        },
        zIndex: { modal: 2000 },
      },
    };
    expect(validateThemeProject(project).success).toBe(true);
  });

  it('rejects Other groups with unsupported keys or wrong value types', () => {
    const base = defaultProjectFixture.foundations;
    const badBreakpoints = {
      ...defaultProjectFixture,
      foundations: { ...base, breakpoints: { md: '1000' } },
    };
    expect(validateThemeProject(badBreakpoints).success).toBe(false);
    const badEasing = {
      ...defaultProjectFixture,
      foundations: {
        ...base,
        transitions: { easing: { easeOut: 42 } },
      },
    };
    expect(validateThemeProject(badEasing).success).toBe(false);
    const badZIndex = {
      ...defaultProjectFixture,
      foundations: { ...base, zIndex: { sidebar: 1200 } },
    };
    expect(validateThemeProject(badZIndex).success).toBe(false);
  });

  it('rejects the invalid fixture with errors', () => {
    const result = validateThemeProject(invalidProjectFixture);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.errors.length).toBeGreaterThan(0);
    }
  });

  it('rejects a project from a future schema version', () => {
    const result = validateThemeProject(futureProjectFixture);
    expect(result.success).toBe(false);
  });
});
