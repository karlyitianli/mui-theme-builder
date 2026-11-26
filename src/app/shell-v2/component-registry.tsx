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
  AutocompleteDemo,
  AvatarDemo,
  BadgeDemo,
  ButtonGroupDemo,
  CheckboxDemo,
  ChipDemo,
  DividerDemo,
  FabDemo,
  IconDemo,
  ListDemo,
  RadioGroupDemo,
  RatingDemo,
  SliderDemo,
  SwitchDemo,
  TableDemo,
  ToggleButtonDemo,
  TooltipDemo,
  TransferListDemo,
  TypographyDemo,
} from './component-demos';

// Component registry for the v2 shell preview area.
//
// Each entry is one preview card: an id, the component name shown in the
// card header, its MUI category (used for the collapsible section
// headers), and a render function for the card body. Bodies render the
// real MUI components; PreviewArea wraps each card in the preview theme,
// so the examples always reflect the current project.
//
// The Inputs category carries the full MUI Inputs list (Karl, Nov 25,
// 2026, guided by https://mui.com/material-ui/all-components/), in
// alphabetical order by MUI's display names. One exception: Number
// Field is omitted because the installed @mui/material (9.3.1) does not
// export a NumberField component anywhere (checked the package's type
// definitions, its export subpaths, and the runtime export), and no
// other installed package provides one; it joins the list when the MUI
// version does. Cards are pure preview: per-component overrides are
// parked (Karl, Nov 25, 2026), so there is no edit affordance on a
// card, and all interaction state is local to each card's demo
// component (in component-demos.tsx).
//
// The Data Display category follows Inputs with MUI's Data Display
// list, again alphabetical: Avatar, Badge, Chip, Divider, Icon, List,
// Table, Tooltip, Typography. All nine are exported by the installed
// @mui/material (9.3.1, verified against the runtime exports), so the
// category has no omissions. One demo note: the Icon card passes an
// inline SVG as the Icon's child, a usage the component supports,
// because the app loads no ligature icon font for the component's
// text form (see IconDemo in component-demos.tsx).

export interface PreviewComponentEntry {
  category: string;
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
    render: () => <AutocompleteDemo />,
  },
  {
    category: 'Inputs',
    id: 'button',
    name: 'Button',
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
    render: () => <ButtonGroupDemo />,
  },
  {
    category: 'Inputs',
    id: 'checkbox',
    name: 'Checkbox',
    render: () => <CheckboxDemo />,
  },
  {
    category: 'Inputs',
    id: 'floating-action-button',
    name: 'Floating Action Button',
    render: () => <FabDemo />,
  },
  {
    category: 'Inputs',
    id: 'radio-group',
    name: 'Radio Group',
    render: () => <RadioGroupDemo />,
  },
  {
    category: 'Inputs',
    id: 'rating',
    name: 'Rating',
    render: () => <RatingDemo />,
  },
  {
    category: 'Inputs',
    id: 'select',
    name: 'Select',
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
    render: () => <SliderDemo />,
  },
  {
    category: 'Inputs',
    id: 'switch',
    name: 'Switch',
    render: () => <SwitchDemo />,
  },
  {
    category: 'Inputs',
    id: 'text-field',
    name: 'Text Field',
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
    render: () => <ToggleButtonDemo />,
  },
  {
    category: 'Inputs',
    id: 'transfer-list',
    name: 'Transfer List',
    render: () => <TransferListDemo />,
  },
  {
    category: 'Data Display',
    id: 'avatar',
    name: 'Avatar',
    render: () => <AvatarDemo />,
  },
  {
    category: 'Data Display',
    id: 'badge',
    name: 'Badge',
    render: () => <BadgeDemo />,
  },
  {
    category: 'Data Display',
    id: 'chip',
    name: 'Chip',
    render: () => <ChipDemo />,
  },
  {
    category: 'Data Display',
    id: 'divider',
    name: 'Divider',
    render: () => <DividerDemo />,
  },
  {
    category: 'Data Display',
    id: 'icon',
    name: 'Icon',
    render: () => <IconDemo />,
  },
  {
    category: 'Data Display',
    id: 'list',
    name: 'List',
    render: () => <ListDemo />,
  },
  {
    category: 'Data Display',
    id: 'table',
    name: 'Table',
    render: () => <TableDemo />,
  },
  {
    category: 'Data Display',
    id: 'tooltip',
    name: 'Tooltip',
    render: () => <TooltipDemo />,
  },
  {
    category: 'Data Display',
    id: 'typography',
    name: 'Typography',
    render: () => <TypographyDemo />,
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
