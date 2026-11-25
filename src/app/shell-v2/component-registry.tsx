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

// Phase 3 component registry for the v2 shell preview area.
//
// Each entry is one preview card: an id, the component name shown in the
// card header, its MUI category (used for the collapsible section
// headers), and a render function for the card body. Bodies render the
// real MUI components; PreviewArea wraps each card in the preview theme,
// so the examples always reflect the current project.
//
// The registry starts with Button, TextField, and Select, the three
// components the theme adapters already support. Cards are pure preview:
// per-component overrides are parked (Karl, Nov 25, 2026), so there is no
// edit affordance on a card.

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
    id: 'text-field',
    name: 'TextField',
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
