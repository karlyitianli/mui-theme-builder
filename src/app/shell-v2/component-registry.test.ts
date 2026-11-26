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
const EXPECTED_INPUT_NAMES = [
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

const EXPECTED_INPUT_IDS = [
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

// The Data Display category carries MUI's nine Data Display components
// in alphabetical order by MUI display name. All nine are exported by
// the installed @mui/material (9.3.1, checked against the runtime
// exports), so unlike Inputs this list has no omission.
const EXPECTED_DATA_DISPLAY_NAMES = [
  'Avatar',
  'Badge',
  'Chip',
  'Divider',
  'Icon',
  'List',
  'Table',
  'Tooltip',
  'Typography',
];

const EXPECTED_DATA_DISPLAY_IDS = [
  'avatar',
  'badge',
  'chip',
  'divider',
  'icon',
  'list',
  'table',
  'tooltip',
  'typography',
];

// The Feedback category carries MUI's six Feedback components in
// alphabetical order by MUI display name. All six are exported by
// the installed @mui/material (9.3.1, checked against the runtime
// exports), so this list has no omission either. (Progress is MUI's
// grouping name for CircularProgress and LinearProgress; there is
// no single Progress component to export.)
const EXPECTED_FEEDBACK_NAMES = [
  'Alert',
  'Backdrop',
  'Dialog',
  'Progress',
  'Skeleton',
  'Snackbar',
];

const EXPECTED_FEEDBACK_IDS = [
  'alert',
  'backdrop',
  'dialog',
  'progress',
  'skeleton',
  'snackbar',
];

const inputsEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Inputs');
const dataDisplayEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Data Display');
const feedbackEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Feedback');

describe('PREVIEW_COMPONENTS (Inputs registry)', () => {
  it('contains the MUI Inputs components in alphabetical order, all in Inputs', () => {
    expect(inputsEntries().map((entry) => entry.name)).toEqual(EXPECTED_INPUT_NAMES);
    expect(inputsEntries().map((entry) => entry.id)).toEqual(EXPECTED_INPUT_IDS);
    for (const entry of inputsEntries()) {
      expect(entry.category).toBe('Inputs');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('groups Inputs first with all its entries in order', () => {
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[0].entries.map((entry) => entry.name)).toEqual(EXPECTED_INPUT_NAMES);
  });

  it('groups an empty list into no groups', () => {
    expect(groupPreviewComponents([])).toEqual([]);
  });
});

describe('PREVIEW_COMPONENTS (Data Display registry)', () => {
  it('contains the MUI Data Display components in alphabetical order, all in Data Display', () => {
    expect(dataDisplayEntries().map((entry) => entry.name)).toEqual(
      EXPECTED_DATA_DISPLAY_NAMES,
    );
    expect(dataDisplayEntries().map((entry) => entry.id)).toEqual(
      EXPECTED_DATA_DISPLAY_IDS,
    );
    for (const entry of dataDisplayEntries()) {
      expect(entry.category).toBe('Data Display');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Data Display after Inputs as the second group', () => {
    expect(
      PREVIEW_COMPONENTS.slice(
        0,
        EXPECTED_INPUT_NAMES.length + EXPECTED_DATA_DISPLAY_NAMES.length,
      ).map((entry) => entry.name),
    ).toEqual([...EXPECTED_INPUT_NAMES, ...EXPECTED_DATA_DISPLAY_NAMES]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[1].category).toBe('Data Display');
    expect(groups[1].entries.map((entry) => entry.name)).toEqual(
      EXPECTED_DATA_DISPLAY_NAMES,
    );
  });
});

describe('PREVIEW_COMPONENTS (Feedback registry)', () => {
  it('contains the MUI Feedback components in alphabetical order, all in Feedback', () => {
    expect(feedbackEntries().map((entry) => entry.name)).toEqual(EXPECTED_FEEDBACK_NAMES);
    expect(feedbackEntries().map((entry) => entry.id)).toEqual(EXPECTED_FEEDBACK_IDS);
    for (const entry of feedbackEntries()) {
      expect(entry.category).toBe('Feedback');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Feedback after Data Display as the third group', () => {
    expect(PREVIEW_COMPONENTS.map((entry) => entry.name)).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups.map((group) => group.category)).toEqual([
      'Inputs',
      'Data Display',
      'Feedback',
    ]);
    expect(groups[2].entries.map((entry) => entry.name)).toEqual(EXPECTED_FEEDBACK_NAMES);
  });
});

describe('filterPreviewComponents (preview search)', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length,
    );
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '   ')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length,
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

  it('matches across categories', () => {
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'chip').map((entry) => entry.name),
    ).toEqual(['Chip']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'TABLE').map((entry) => entry.name),
    ).toEqual(['Table']);
    // 'list' spans the Inputs Transfer List and the Data Display List,
    // in registry order.
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'list').map((entry) => entry.name),
    ).toEqual(['Transfer List', 'List']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'alert').map((entry) => entry.name),
    ).toEqual(['Alert']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'PROGRESS').map((entry) => entry.name),
    ).toEqual(['Progress']);
  });

  it('returns an empty list for a nonsense query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, 'zzzz-not-a-component')).toEqual([]);
  });
});
