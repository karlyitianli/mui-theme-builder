import { describe, expect, it } from 'vitest';

import {
  filterPreviewComponents,
  groupPreviewComponents,
  PREVIEW_COMPONENTS,
} from './component-registry';

// Phase 3: the preview registry starts with the three components the
// theme adapters support, all in the Inputs category, and the search
// filter is a pure name match.
describe('PREVIEW_COMPONENTS (Phase 3 registry)', () => {
  it('contains Button, TextField, and Select, all in Inputs', () => {
    expect(PREVIEW_COMPONENTS.map((entry) => entry.name)).toEqual([
      'Button',
      'TextField',
      'Select',
    ]);
    expect(PREVIEW_COMPONENTS.map((entry) => entry.id)).toEqual([
      'button',
      'text-field',
      'select',
    ]);
    for (const entry of PREVIEW_COMPONENTS) {
      expect(entry.category).toBe('Inputs');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('groups into a single Inputs group with all three entries', () => {
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[0].entries.map((entry) => entry.name)).toEqual([
      'Button',
      'TextField',
      'Select',
    ]);
  });

  it('groups an empty list into no groups', () => {
    expect(groupPreviewComponents([])).toEqual([]);
  });
});

describe('filterPreviewComponents (Phase 3 search)', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '')).toHaveLength(3);
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '   ')).toHaveLength(3);
  });

  it('matches by name, case-insensitively', () => {
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'button').map((entry) => entry.name),
    ).toEqual(['Button']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'TEXT').map((entry) => entry.name),
    ).toEqual(['TextField']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'Select').map((entry) => entry.name),
    ).toEqual(['Select']);
  });

  it('returns an empty list for a nonsense query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, 'zzzz-not-a-component')).toEqual([]);
  });
});
