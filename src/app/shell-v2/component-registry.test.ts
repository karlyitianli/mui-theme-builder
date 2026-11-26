import { describe, expect, it } from 'vitest';

import {
  filterPreviewComponents,
  groupPreviewComponents,
  PREVIEW_COMPONENTS,
} from './component-registry';

// The registry carries MUI's Inputs components in alphabetical order
// by MUI display name (Karl, Nov 25, 2026), with two gaps against the
// 14-name MUI list. Number Field: the installed @mui/material
// (9.3.1) does not export a NumberField component, so its card is
// omitted until the MUI version provides one (see the registry header
// comment). Transfer List: Karl removed its card (Nov 25, 2026). The
// sequence below is the 14-name list minus those two.
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
];

// The Data Display category carries MUI's Data Display components in
// alphabetical order by MUI display name, minus Icon and Typography,
// whose cards Karl removed (Nov 25, 2026). The seven that remain are
// all exported by the installed @mui/material (9.3.1, checked against
// the runtime exports).
const EXPECTED_DATA_DISPLAY_NAMES = [
  'Avatar',
  'Badge',
  'Chip',
  'Divider',
  'List',
  'Table',
  'Tooltip',
];

const EXPECTED_DATA_DISPLAY_IDS = [
  'avatar',
  'badge',
  'chip',
  'divider',
  'list',
  'table',
  'tooltip',
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

// The Surfaces category carries MUI's Surfaces components in
// alphabetical order by MUI display name, minus Paper, whose card
// Karl removed (Nov 25, 2026). The three that remain are all exported
// by the installed @mui/material (9.3.1, checked against the runtime
// exports).
const EXPECTED_SURFACES_NAMES = ['Accordion', 'App Bar', 'Card'];

const EXPECTED_SURFACES_IDS = ['accordion', 'app-bar', 'card'];

// The Navigation category carries MUI's nine Navigation components
// in alphabetical order by MUI display name. All nine are exported
// by the installed @mui/material (9.3.1, checked against the runtime
// exports), so this list has no omission either.
const EXPECTED_NAVIGATION_NAMES = [
  'Bottom Navigation',
  'Breadcrumbs',
  'Drawer',
  'Link',
  'Menu',
  'Pagination',
  'Speed Dial',
  'Stepper',
  'Tabs',
];

const EXPECTED_NAVIGATION_IDS = [
  'bottom-navigation',
  'breadcrumbs',
  'drawer',
  'link',
  'menu',
  'pagination',
  'speed-dial',
  'stepper',
  'tabs',
];

const inputsEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Inputs');
const dataDisplayEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Data Display');
const feedbackEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Feedback');
const surfacesEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Surfaces');
const navigationEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Navigation');

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
    expect(
      PREVIEW_COMPONENTS.slice(
        0,
        EXPECTED_INPUT_NAMES.length +
          EXPECTED_DATA_DISPLAY_NAMES.length +
          EXPECTED_FEEDBACK_NAMES.length,
      ).map((entry) => entry.name),
    ).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[1].category).toBe('Data Display');
    expect(groups[2].category).toBe('Feedback');
    expect(groups[2].entries.map((entry) => entry.name)).toEqual(EXPECTED_FEEDBACK_NAMES);
  });
});

describe('PREVIEW_COMPONENTS (Surfaces registry)', () => {
  it('contains the MUI Surfaces components in alphabetical order, all in Surfaces', () => {
    expect(surfacesEntries().map((entry) => entry.name)).toEqual(EXPECTED_SURFACES_NAMES);
    expect(surfacesEntries().map((entry) => entry.id)).toEqual(EXPECTED_SURFACES_IDS);
    for (const entry of surfacesEntries()) {
      expect(entry.category).toBe('Surfaces');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Surfaces after Feedback as the fourth group', () => {
    expect(
      PREVIEW_COMPONENTS.slice(
        0,
        EXPECTED_INPUT_NAMES.length +
          EXPECTED_DATA_DISPLAY_NAMES.length +
          EXPECTED_FEEDBACK_NAMES.length +
          EXPECTED_SURFACES_NAMES.length,
      ).map((entry) => entry.name),
    ).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
      ...EXPECTED_SURFACES_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[0].category).toBe('Inputs');
    expect(groups[1].category).toBe('Data Display');
    expect(groups[2].category).toBe('Feedback');
    expect(groups[3].category).toBe('Surfaces');
    expect(groups[3].entries.map((entry) => entry.name)).toEqual(EXPECTED_SURFACES_NAMES);
  });
});

describe('PREVIEW_COMPONENTS (Navigation registry)', () => {
  it('contains the MUI Navigation components in alphabetical order, all in Navigation', () => {
    expect(navigationEntries().map((entry) => entry.name)).toEqual(
      EXPECTED_NAVIGATION_NAMES,
    );
    expect(navigationEntries().map((entry) => entry.id)).toEqual(
      EXPECTED_NAVIGATION_IDS,
    );
    for (const entry of navigationEntries()) {
      expect(entry.category).toBe('Navigation');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Navigation after Surfaces as the fifth group', () => {
    expect(PREVIEW_COMPONENTS.map((entry) => entry.name)).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
      ...EXPECTED_SURFACES_NAMES,
      ...EXPECTED_NAVIGATION_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups.map((group) => group.category)).toEqual([
      'Inputs',
      'Data Display',
      'Feedback',
      'Surfaces',
      'Navigation',
    ]);
    expect(groups[4].entries.map((entry) => entry.name)).toEqual(
      EXPECTED_NAVIGATION_NAMES,
    );
  });
});

describe('filterPreviewComponents (preview search)', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length +
        EXPECTED_SURFACES_NAMES.length +
        EXPECTED_NAVIGATION_NAMES.length,
    );
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '   ')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length +
        EXPECTED_SURFACES_NAMES.length +
        EXPECTED_NAVIGATION_NAMES.length,
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
    // 'list' matched the Inputs Transfer List as well until Karl
    // removed that card; now only the Data Display List matches.
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'list').map((entry) => entry.name),
    ).toEqual(['List']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'alert').map((entry) => entry.name),
    ).toEqual(['Alert']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'PROGRESS').map((entry) => entry.name),
    ).toEqual(['Progress']);
    // 'paper' matched the Surfaces Paper card until Karl removed it;
    // no remaining name contains it.
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'paper').map((entry) => entry.name),
    ).toEqual([]);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'CARD').map((entry) => entry.name),
    ).toEqual(['Card']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'menu').map((entry) => entry.name),
    ).toEqual(['Menu']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'DRAWER').map((entry) => entry.name),
    ).toEqual(['Drawer']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'tabs').map((entry) => entry.name),
    ).toEqual(['Tabs']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'Pagination').map((entry) => entry.name),
    ).toEqual(['Pagination']);
  });

  it('returns an empty list for a nonsense query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, 'zzzz-not-a-component')).toEqual([]);
  });
});
