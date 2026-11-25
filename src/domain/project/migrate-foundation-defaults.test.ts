import { describe, expect, it } from 'vitest';

import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../../fixtures/theme-project.fixtures';
import { migrateThemeProject } from './migrate-theme-project';

// Phase 5: projects saved before foundations.shadows,
// foundations.shape.cardBorderRadius, and the shared 4px spacing default
// existed gain those defaults through migration, per key, without
// overwriting values the project already carries.
describe('migrateThemeProject foundation defaults (Phase 5)', () => {
  it('gives an old project the new shadow and card radius defaults', () => {
    const result = migrateThemeProject(customizedProjectFixture);
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.migrated).toBe(true);
    expect(result.project.foundations?.shadows).toEqual({
      global: 2,
      button: 2,
      card: 1,
      input: 0,
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
      global: 2,
      button: 2,
      card: 1,
      input: 0,
    });
    expect(result.project.foundations?.shape?.cardBorderRadius).toBe(12);
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
