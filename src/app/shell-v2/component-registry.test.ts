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

// The Layout category carries MUI's four Layout components in
// alphabetical order by MUI display name. All four are exported by
// the installed @mui/material (9.3.1, checked against the runtime
// exports), so this list has no omission either.
const EXPECTED_LAYOUT_NAMES = ['Box', 'Container', 'Grid', 'Stack'];

const EXPECTED_LAYOUT_IDS = ['box', 'container', 'grid', 'stack'];

// The Utils category carries MUI's Utils entries in alphabetical
// order by display name, minus four omissions. CSS Baseline and
// Global Styles are global-effect utilities (mounting one in a
// card would restyle the document and break shell insulation),
// No SSR only changes server-side rendering, and Transitions is a
// docs topic with no single component. The eight that remain are
// all exported by the installed @mui/material (9.3.1, checked
// against the runtime exports).
const EXPECTED_UTILS_NAMES = [
  'Click-Away Listener',
  'Modal',
  'Popover',
  'Popper',
  'Portal',
  'Textarea Autosize',
  'useMediaQuery',
  'useScrollTrigger',
];

const EXPECTED_UTILS_IDS = [
  'click-away-listener',
  'modal',
  'popover',
  'popper',
  'portal',
  'textarea-autosize',
  'use-media-query',
  'use-scroll-trigger',
];

// The omitted Utils entries, pinned so the omissions stay
// deliberate: none of these names or ids may appear in the
// registry (see the registry header comment for the reasons).
const OMITTED_UTILS_NAMES = ['CSS Baseline', 'Global Styles', 'No SSR', 'Transitions'];

const OMITTED_UTILS_IDS = ['css-baseline', 'global-styles', 'no-ssr', 'transitions'];

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
const layoutEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Layout');
const utilsEntries = () =>
  PREVIEW_COMPONENTS.filter((entry) => entry.category === 'Utils');

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
    expect(
      PREVIEW_COMPONENTS.slice(
        0,
        EXPECTED_INPUT_NAMES.length +
          EXPECTED_DATA_DISPLAY_NAMES.length +
          EXPECTED_FEEDBACK_NAMES.length +
          EXPECTED_SURFACES_NAMES.length +
          EXPECTED_NAVIGATION_NAMES.length,
      ).map((entry) => entry.name),
    ).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
      ...EXPECTED_SURFACES_NAMES,
      ...EXPECTED_NAVIGATION_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[4].category).toBe('Navigation');
    expect(groups[4].entries.map((entry) => entry.name)).toEqual(
      EXPECTED_NAVIGATION_NAMES,
    );
  });
});

describe('PREVIEW_COMPONENTS (Layout registry)', () => {
  it('contains the MUI Layout components in alphabetical order, all in Layout', () => {
    expect(layoutEntries().map((entry) => entry.name)).toEqual(EXPECTED_LAYOUT_NAMES);
    expect(layoutEntries().map((entry) => entry.id)).toEqual(EXPECTED_LAYOUT_IDS);
    for (const entry of layoutEntries()) {
      expect(entry.category).toBe('Layout');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Layout after Navigation as the sixth group', () => {
    expect(
      PREVIEW_COMPONENTS.slice(
        0,
        EXPECTED_INPUT_NAMES.length +
          EXPECTED_DATA_DISPLAY_NAMES.length +
          EXPECTED_FEEDBACK_NAMES.length +
          EXPECTED_SURFACES_NAMES.length +
          EXPECTED_NAVIGATION_NAMES.length +
          EXPECTED_LAYOUT_NAMES.length,
      ).map((entry) => entry.name),
    ).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
      ...EXPECTED_SURFACES_NAMES,
      ...EXPECTED_NAVIGATION_NAMES,
      ...EXPECTED_LAYOUT_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups[5].category).toBe('Layout');
    expect(groups[5].entries.map((entry) => entry.name)).toEqual(EXPECTED_LAYOUT_NAMES);
  });
});

describe('PREVIEW_COMPONENTS (Utils registry)', () => {
  it('contains the demoable MUI Utils entries in alphabetical order, all in Utils', () => {
    expect(utilsEntries().map((entry) => entry.name)).toEqual(EXPECTED_UTILS_NAMES);
    expect(utilsEntries().map((entry) => entry.id)).toEqual(EXPECTED_UTILS_IDS);
    for (const entry of utilsEntries()) {
      expect(entry.category).toBe('Utils');
      expect(typeof entry.render).toBe('function');
    }
  });

  it('places Utils after Layout as the seventh group', () => {
    expect(PREVIEW_COMPONENTS.map((entry) => entry.name)).toEqual([
      ...EXPECTED_INPUT_NAMES,
      ...EXPECTED_DATA_DISPLAY_NAMES,
      ...EXPECTED_FEEDBACK_NAMES,
      ...EXPECTED_SURFACES_NAMES,
      ...EXPECTED_NAVIGATION_NAMES,
      ...EXPECTED_LAYOUT_NAMES,
      ...EXPECTED_UTILS_NAMES,
    ]);
    const groups = groupPreviewComponents(PREVIEW_COMPONENTS);
    expect(groups.map((group) => group.category)).toEqual([
      'Inputs',
      'Data Display',
      'Feedback',
      'Surfaces',
      'Navigation',
      'Layout',
      'Utils',
    ]);
    expect(groups[6].entries.map((entry) => entry.name)).toEqual(EXPECTED_UTILS_NAMES);
  });

  it('omits the Utils entries that cannot be demoed as a card', () => {
    const names = PREVIEW_COMPONENTS.map((entry) => entry.name);
    const ids = PREVIEW_COMPONENTS.map((entry) => entry.id);
    for (const name of OMITTED_UTILS_NAMES) {
      expect(names).not.toContain(name);
    }
    for (const id of OMITTED_UTILS_IDS) {
      expect(ids).not.toContain(id);
    }
  });
});

describe('filterPreviewComponents (preview search)', () => {
  it('returns everything for an empty or blank query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length +
        EXPECTED_SURFACES_NAMES.length +
        EXPECTED_NAVIGATION_NAMES.length +
        EXPECTED_LAYOUT_NAMES.length +
        EXPECTED_UTILS_NAMES.length,
    );
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, '   ')).toHaveLength(
      EXPECTED_INPUT_NAMES.length +
        EXPECTED_DATA_DISPLAY_NAMES.length +
        EXPECTED_FEEDBACK_NAMES.length +
        EXPECTED_SURFACES_NAMES.length +
        EXPECTED_NAVIGATION_NAMES.length +
        EXPECTED_LAYOUT_NAMES.length +
        EXPECTED_UTILS_NAMES.length,
    );
  });

  it('matches by name, case-insensitively', () => {
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'button').map((entry) => entry.name),
    ).toEqual(['Button', 'Button Group', 'Floating Action Button', 'Toggle Button']);
    // 'TEXT' matches Text Field and, since the Utils category
    // landed, Textarea Autosize.
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'TEXT').map((entry) => entry.name),
    ).toEqual(['Text Field', 'Textarea Autosize']);
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
    // removed that card; it now matches the Data Display List and
    // the Utils Click-Away Listener ("Listener" contains "list").
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'list').map((entry) => entry.name),
    ).toEqual(['List', 'Click-Away Listener']);
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
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'grid').map((entry) => entry.name),
    ).toEqual(['Grid']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'STACK').map((entry) => entry.name),
    ).toEqual(['Stack']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'Container').map((entry) => entry.name),
    ).toEqual(['Container']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'modal').map((entry) => entry.name),
    ).toEqual(['Modal']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'POPPER').map((entry) => entry.name),
    ).toEqual(['Popper']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'portal').map((entry) => entry.name),
    ).toEqual(['Portal']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'Click-Away').map((entry) => entry.name),
    ).toEqual(['Click-Away Listener']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'textarea').map((entry) => entry.name),
    ).toEqual(['Textarea Autosize']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'media').map((entry) => entry.name),
    ).toEqual(['useMediaQuery']);
    expect(
      filterPreviewComponents(PREVIEW_COMPONENTS, 'SCROLL').map((entry) => entry.name),
    ).toEqual(['useScrollTrigger']);
  });

  it('returns an empty list for a nonsense query', () => {
    expect(filterPreviewComponents(PREVIEW_COMPONENTS, 'zzzz-not-a-component')).toEqual([]);
  });
});

// Task 3.2: every card links to its component's MUI documentation
// page. The URL slug follows the entry id, with two exceptions:
// Radio Group's docs live on the Radio buttons page, and
// useScrollTrigger is documented on the App Bar page, so its URL
// repeats the App Bar entry's, the registry's one duplicate.
describe('PREVIEW_COMPONENTS docs URLs (task 3.2)', () => {
  it('gives every entry a well-formed MUI docs URL, with one documented duplicate', () => {
    const urls = PREVIEW_COMPONENTS.map((entry) => entry.docsUrl);
    for (const url of urls) {
      expect(url).toMatch(/^https:\/\/mui\.com\/material-ui\/react-[a-z-]+\/$/);
    }
    const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
    expect(duplicates).toEqual(['https://mui.com/material-ui/react-app-bar/']);
  });

  it('points representative entries at their docs pages', () => {
    const byId = new Map(PREVIEW_COMPONENTS.map((entry) => [entry.id, entry.docsUrl]));
    expect(byId.get('button')).toBe('https://mui.com/material-ui/react-button/');
    expect(byId.get('text-field')).toBe('https://mui.com/material-ui/react-text-field/');
    expect(byId.get('radio-group')).toBe(
      'https://mui.com/material-ui/react-radio-button/',
    );
    expect(byId.get('app-bar')).toBe('https://mui.com/material-ui/react-app-bar/');
    expect(byId.get('tabs')).toBe('https://mui.com/material-ui/react-tabs/');
    expect(byId.get('box')).toBe('https://mui.com/material-ui/react-box/');
    expect(byId.get('container')).toBe(
      'https://mui.com/material-ui/react-container/',
    );
    expect(byId.get('grid')).toBe('https://mui.com/material-ui/react-grid/');
    expect(byId.get('stack')).toBe('https://mui.com/material-ui/react-stack/');
    expect(byId.get('click-away-listener')).toBe(
      'https://mui.com/material-ui/react-click-away-listener/',
    );
    expect(byId.get('modal')).toBe('https://mui.com/material-ui/react-modal/');
    expect(byId.get('popover')).toBe('https://mui.com/material-ui/react-popover/');
    expect(byId.get('popper')).toBe('https://mui.com/material-ui/react-popper/');
    expect(byId.get('portal')).toBe('https://mui.com/material-ui/react-portal/');
    expect(byId.get('textarea-autosize')).toBe(
      'https://mui.com/material-ui/react-textarea-autosize/',
    );
    expect(byId.get('use-media-query')).toBe(
      'https://mui.com/material-ui/react-use-media-query/',
    );
    // useScrollTrigger has no docs page of its own; MUI documents
    // it on the App Bar page.
    expect(byId.get('use-scroll-trigger')).toBe(
      'https://mui.com/material-ui/react-app-bar/',
    );
  });
});
