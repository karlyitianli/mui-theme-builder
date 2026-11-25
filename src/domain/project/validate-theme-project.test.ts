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
