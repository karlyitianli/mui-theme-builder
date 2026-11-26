import type { ReactNode } from 'react';
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  AccordionDemo,
  AlertDemo,
  AppBarDemo,
  AutocompleteDemo,
  AvatarDemo,
  BackdropDemo,
  BadgeDemo,
  BottomNavigationDemo,
  BreadcrumbsDemo,
  ButtonGroupDemo,
  CardDemo,
  CheckboxDemo,
  ChipDemo,
  DialogDemo,
  DividerDemo,
  DrawerDemo,
  FabDemo,
  LinkDemo,
  ListDemo,
  MenuDemo,
  PaginationDemo,
  ProgressDemo,
  RadioGroupDemo,
  RatingDemo,
  SkeletonDemo,
  SliderDemo,
  SnackbarDemo,
  SpeedDialDemo,
  StepperDemo,
  SwitchDemo,
  TableDemo,
  TabsDemo,
  ToggleButtonDemo,
  TooltipDemo,
} from './component-demos';

// Component registry for the v2 shell preview area.
//
// Each entry is one preview card: an id, the component name shown in the
// card header, its MUI category (used for the collapsible section
// headers), and a render function for the card body. Bodies render the
// real MUI components; PreviewArea wraps each card in the preview theme,
// so the examples always reflect the current project.
//
// The Inputs category carries MUI's Inputs list (Karl, Nov 25,
// 2026, guided by https://mui.com/material-ui/all-components/), in
// alphabetical order by MUI's display names, with two gaps. Number
// Field is omitted because the installed @mui/material (9.3.1) does
// not export a NumberField component anywhere (checked the package's
// type definitions, its export subpaths, and the runtime export), and
// no other installed package provides one; it joins the list when the
// MUI version does. Transfer List was in the list and Karl removed it
// (Nov 25, 2026). Cards are pure preview: per-component overrides are
// parked (Karl, Nov 25, 2026), so there is no edit affordance on a
// card, and all interaction state is local to each card's demo
// component (in component-demos.tsx).
//
// The Data Display category follows Inputs with MUI's Data Display
// list, again alphabetical, minus two removals by Karl (Nov 25,
// 2026): Icon and Typography. What remains is Avatar, Badge, Chip,
// Divider, List, Table, Tooltip. All seven are exported by the
// installed @mui/material (9.3.1, verified against the runtime
// exports).
//
// The Feedback category follows Data Display with MUI's Feedback
// list, again alphabetical: Alert, Backdrop, Dialog, Progress,
// Skeleton, Snackbar. All six are exported by the installed
// @mui/material (9.3.1, verified against the runtime exports), so
// this category has no omissions either. Two demo notes. Progress is
// MUI's grouping name for CircularProgress and LinearProgress; there
// is no single Progress component, so the card shows both. And
// Backdrop, Dialog, and Snackbar are overlays: each demo opens the
// real component inside a fixed-height stage in its card (Backdrop
// positioned absolutely over the stage, Dialog through its
// container prop pointed at the stage, Snackbar positioned
// absolutely in the stage), so an open overlay covers its card's
// stage, never the whole app, while still rendering under the
// card's preview theme (see the Feedback demos in
// component-demos.tsx).
//
// The Surfaces category follows Feedback with MUI's Surfaces list,
// again alphabetical, minus one removal by Karl (Nov 25, 2026):
// Paper. What remains is Accordion, App Bar, Card. All three are
// exported by the installed @mui/material (9.3.1, verified against
// the runtime exports). One demo note. App Bar is a full-width top
// bar by nature; the demo renders it position="static" at the card's
// width, a contained sample bar rather than a bar fixed across the
// app. And the Card demo is a full composed MUI Card (header, media,
// content, actions) nested inside the registry's own preview card
// chrome; it uses the outlined variant so the two cards read as
// separate surfaces (see the Surfaces demos in
// component-demos.tsx).
//
// The Navigation category follows Surfaces with MUI's Navigation
// list, again alphabetical: Bottom Navigation, Breadcrumbs,
// Drawer, Link, Menu, Pagination, Speed Dial, Stepper, Tabs. All
// nine are exported by the installed @mui/material (9.3.1,
// verified against the runtime exports, including the
// sub-components the demos compose: BottomNavigationAction, Menu,
// MenuItem, SpeedDialAction, Step, StepLabel, Tab), so this
// category has no omissions either. (TabPanel and TabList are not
// @mui/material exports; the Tabs demo follows the MUI docs
// pattern of a plain element with role="tabpanel" instead.) Two
// demo notes. Drawer and Menu are overlays, contained in a stage
// in their card like the Feedback overlays: the Drawer's modal
// container points at the stage and its fixed-position root,
// backdrop, and paper are restyled as absolute, so the drawer
// covers only the stage; the Menu's container points at the stage
// and its popover paper is positioned from its anchor button's
// rect, so the menu opens under the button in the card. And the
// Speed Dial demo sits in a taller stage of its own, because the
// dial opens upward and needs room for its actions (see the
// Navigation demos in component-demos.tsx).

export interface PreviewComponentEntry {
  category: string;
  // The component's page in the MUI documentation. PreviewArea shows
  // it as a Docs link in the card header (task 3.2). The slug follows
  // the entry id except for Radio Group, whose docs page is the Radio
  // buttons page (react-radio-button).
  docsUrl: string;
  id: string;
  name: string;
  render: () => ReactNode;
}

export interface PreviewComponentGroup {
  category: string;
  entries: PreviewComponentEntry[];
}

export const PREVIEW_COMPONENTS: PreviewComponentEntry[] = [
  {
    category: 'Inputs',
    id: 'autocomplete',
    name: 'Autocomplete',
    docsUrl: 'https://mui.com/material-ui/react-autocomplete/',
    render: () => <AutocompleteDemo />,
  },
  {
    category: 'Inputs',
    id: 'button',
    name: 'Button',
    docsUrl: 'https://mui.com/material-ui/react-button/',
    render: () => (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Button variant="contained">Button</Button>
        <Button variant="outlined">Button</Button>
        <Button variant="text">Button</Button>
      </Stack>
    ),
  },
  {
    category: 'Inputs',
    id: 'button-group',
    name: 'Button Group',
    docsUrl: 'https://mui.com/material-ui/react-button-group/',
    render: () => <ButtonGroupDemo />,
  },
  {
    category: 'Inputs',
    id: 'checkbox',
    name: 'Checkbox',
    docsUrl: 'https://mui.com/material-ui/react-checkbox/',
    render: () => <CheckboxDemo />,
  },
  {
    category: 'Inputs',
    id: 'floating-action-button',
    name: 'Floating Action Button',
    docsUrl: 'https://mui.com/material-ui/react-floating-action-button/',
    render: () => <FabDemo />,
  },
  {
    category: 'Inputs',
    id: 'radio-group',
    name: 'Radio Group',
    docsUrl: 'https://mui.com/material-ui/react-radio-button/',
    render: () => <RadioGroupDemo />,
  },
  {
    category: 'Inputs',
    id: 'rating',
    name: 'Rating',
    docsUrl: 'https://mui.com/material-ui/react-rating/',
    render: () => <RatingDemo />,
  },
  {
    category: 'Inputs',
    id: 'select',
    name: 'Select',
    docsUrl: 'https://mui.com/material-ui/react-select/',
    render: () => (
      <>
        <Typography sx={{ mb: 1 }} variant="body1">
          Label
        </Typography>
        <FormControl fullWidth>
          <Select defaultValue="Option 1">
            <MenuItem value="Option 1">Option 1</MenuItem>
            <MenuItem value="Option 2">Option 2</MenuItem>
          </Select>
        </FormControl>
      </>
    ),
  },
  {
    category: 'Inputs',
    id: 'slider',
    name: 'Slider',
    docsUrl: 'https://mui.com/material-ui/react-slider/',
    render: () => <SliderDemo />,
  },
  {
    category: 'Inputs',
    id: 'switch',
    name: 'Switch',
    docsUrl: 'https://mui.com/material-ui/react-switch/',
    render: () => <SwitchDemo />,
  },
  {
    category: 'Inputs',
    id: 'text-field',
    name: 'Text Field',
    docsUrl: 'https://mui.com/material-ui/react-text-field/',
    render: () => (
      <>
        <Typography sx={{ mb: 1 }} variant="body1">
          Label
        </Typography>
        <TextField fullWidth helperText="Helper text" placeholder="Placeholder" />
      </>
    ),
  },
  {
    category: 'Inputs',
    id: 'toggle-button',
    name: 'Toggle Button',
    docsUrl: 'https://mui.com/material-ui/react-toggle-button/',
    render: () => <ToggleButtonDemo />,
  },
  {
    category: 'Data Display',
    id: 'avatar',
    name: 'Avatar',
    docsUrl: 'https://mui.com/material-ui/react-avatar/',
    render: () => <AvatarDemo />,
  },
  {
    category: 'Data Display',
    id: 'badge',
    name: 'Badge',
    docsUrl: 'https://mui.com/material-ui/react-badge/',
    render: () => <BadgeDemo />,
  },
  {
    category: 'Data Display',
    id: 'chip',
    name: 'Chip',
    docsUrl: 'https://mui.com/material-ui/react-chip/',
    render: () => <ChipDemo />,
  },
  {
    category: 'Data Display',
    id: 'divider',
    name: 'Divider',
    docsUrl: 'https://mui.com/material-ui/react-divider/',
    render: () => <DividerDemo />,
  },
  {
    category: 'Data Display',
    id: 'list',
    name: 'List',
    docsUrl: 'https://mui.com/material-ui/react-list/',
    render: () => <ListDemo />,
  },
  {
    category: 'Data Display',
    id: 'table',
    name: 'Table',
    docsUrl: 'https://mui.com/material-ui/react-table/',
    render: () => <TableDemo />,
  },
  {
    category: 'Data Display',
    id: 'tooltip',
    name: 'Tooltip',
    docsUrl: 'https://mui.com/material-ui/react-tooltip/',
    render: () => <TooltipDemo />,
  },
  {
    category: 'Feedback',
    id: 'alert',
    name: 'Alert',
    docsUrl: 'https://mui.com/material-ui/react-alert/',
    render: () => <AlertDemo />,
  },
  {
    category: 'Feedback',
    id: 'backdrop',
    name: 'Backdrop',
    docsUrl: 'https://mui.com/material-ui/react-backdrop/',
    render: () => <BackdropDemo />,
  },
  {
    category: 'Feedback',
    id: 'dialog',
    name: 'Dialog',
    docsUrl: 'https://mui.com/material-ui/react-dialog/',
    render: () => <DialogDemo />,
  },
  {
    category: 'Feedback',
    id: 'progress',
    name: 'Progress',
    docsUrl: 'https://mui.com/material-ui/react-progress/',
    render: () => <ProgressDemo />,
  },
  {
    category: 'Feedback',
    id: 'skeleton',
    name: 'Skeleton',
    docsUrl: 'https://mui.com/material-ui/react-skeleton/',
    render: () => <SkeletonDemo />,
  },
  {
    category: 'Feedback',
    id: 'snackbar',
    name: 'Snackbar',
    docsUrl: 'https://mui.com/material-ui/react-snackbar/',
    render: () => <SnackbarDemo />,
  },
  {
    category: 'Surfaces',
    id: 'accordion',
    name: 'Accordion',
    docsUrl: 'https://mui.com/material-ui/react-accordion/',
    render: () => <AccordionDemo />,
  },
  {
    category: 'Surfaces',
    id: 'app-bar',
    name: 'App Bar',
    docsUrl: 'https://mui.com/material-ui/react-app-bar/',
    render: () => <AppBarDemo />,
  },
  {
    category: 'Surfaces',
    id: 'card',
    name: 'Card',
    docsUrl: 'https://mui.com/material-ui/react-card/',
    render: () => <CardDemo />,
  },
  {
    category: 'Navigation',
    id: 'bottom-navigation',
    name: 'Bottom Navigation',
    docsUrl: 'https://mui.com/material-ui/react-bottom-navigation/',
    render: () => <BottomNavigationDemo />,
  },
  {
    category: 'Navigation',
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    docsUrl: 'https://mui.com/material-ui/react-breadcrumbs/',
    render: () => <BreadcrumbsDemo />,
  },
  {
    category: 'Navigation',
    id: 'drawer',
    name: 'Drawer',
    docsUrl: 'https://mui.com/material-ui/react-drawer/',
    render: () => <DrawerDemo />,
  },
  {
    category: 'Navigation',
    id: 'link',
    name: 'Link',
    docsUrl: 'https://mui.com/material-ui/react-link/',
    render: () => <LinkDemo />,
  },
  {
    category: 'Navigation',
    id: 'menu',
    name: 'Menu',
    docsUrl: 'https://mui.com/material-ui/react-menu/',
    render: () => <MenuDemo />,
  },
  {
    category: 'Navigation',
    id: 'pagination',
    name: 'Pagination',
    docsUrl: 'https://mui.com/material-ui/react-pagination/',
    render: () => <PaginationDemo />,
  },
  {
    category: 'Navigation',
    id: 'speed-dial',
    name: 'Speed Dial',
    docsUrl: 'https://mui.com/material-ui/react-speed-dial/',
    render: () => <SpeedDialDemo />,
  },
  {
    category: 'Navigation',
    id: 'stepper',
    name: 'Stepper',
    docsUrl: 'https://mui.com/material-ui/react-stepper/',
    render: () => <StepperDemo />,
  },
  {
    category: 'Navigation',
    id: 'tabs',
    name: 'Tabs',
    docsUrl: 'https://mui.com/material-ui/react-tabs/',
    render: () => <TabsDemo />,
  },
];

// Pure name filter for the preview search box: case-insensitive substring
// match on the component name. An empty or blank query returns everything.
export function filterPreviewComponents(
  entries: PreviewComponentEntry[],
  query: string,
): PreviewComponentEntry[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') return [...entries];
  return entries.filter((entry) => entry.name.toLowerCase().includes(needle));
}

// Groups entries by category, keeping the registry's order for both the
// groups and the entries inside each group.
export function groupPreviewComponents(
  entries: PreviewComponentEntry[],
): PreviewComponentGroup[] {
  const groups: PreviewComponentGroup[] = [];
  for (const entry of entries) {
    const group = groups.find((candidate) => candidate.category === entry.category);
    if (group) {
      group.entries.push(entry);
    } else {
      groups.push({ category: entry.category, entries: [entry] });
    }
  }
  return groups;
}
