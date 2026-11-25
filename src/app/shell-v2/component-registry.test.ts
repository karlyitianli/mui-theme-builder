import { describe, expect, it } from 'vitest';

import {
  filterPreviewComponents,
  groupPreviewComponents,
  PREVIEW_COMPONENTS,
} from './component-registry';

// The registry carries the full MUI Inputs list in alphabetical order
// by MUI display name (Karl, Nov 25, 2026). The one gap against the
// 14-name MUI list is Number Field: the installed @mui/material
// (9.3.1) does not export a NumberField component, so its card is
// omitted until the MUI version provides one (see the registry header
// comment). The sequence below is the 14-name list minus Number Field.
const EXPECTED_NAMES = [
  'Autocomplete',
  'Button',
  'Button Group',
  'Checkbox',
  'Floating Action Button',
  'Radio Group',
  'Rating',
  'Select',
  'Slider',
  'Switch',
  'Text Field',
  'Toggle Button',
  'Transfer List',
];

const EXPECTED_IDS = [
  'autocomplete',
  'button',
  'button-group',
  'checkbox',
  'floating-action-button',
  'radio-group',
  'rating',
  'select',
  'slider',
  'switch',
  'text-field',
  'toggle-button',
  'transfer-list',
];

describe('PREVIEW_COMPONENTS (Inputs registry)', () => {
  it('contains the MUI Inputs components in alphabetical order, all in Inputs', () => {
    expect(PREVIEW_COMPONENTS.map((entry) => entry.name)).toEqual(EXPECTED_NAMES);
    expect(PREVIEW_COMPONENTS.map((entry) => entry.id)).toEqual(EXPECTED_IDS);
    for (const entry of PREVIEW_COMPONENTS) {
      expect(entry.category).toBe('Inputs');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('groups into a single Inputs group with all entries in order', () => {
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[0].entries.map((entry) => entry.name)).toEqual(EXPECTED_NAMES);
  });

  it('groups an empty list into no groups', () => {
    expect(groupPreviewComponents([])).toEqual([]);
  });
});

describe('filterPreviewComponents (preview search)', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '')).toHaveLength(
      EXPECTED_NAMES.length,
    );
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '   ')).toHaveLength(
      EXPECTED_NAMES.length,
    );
  });

  it('matches by name, case-insensitively', () => {
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'button').map((entry) => entry.name),
    ).toEqual(['Button', 'Button Group', 'Floating Action Button', 'Toggle Button']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'TEXT').map((entry) => entry.name),
    ).toEqual(['Text Field']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'Select').map((entry) => entry.name),
    ).toEqual(['Select']);
  });

  it('returns an empty list for a nonsense query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, 'zzzz-not-a-component')).toEqual([]);
  });
});
