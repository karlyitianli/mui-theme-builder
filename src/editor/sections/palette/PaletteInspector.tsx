import { Divider, Stack, Typography } from '@mui/material';

import type { PaletteSettings } from '../../../domain/palette.types';
import { ColorControl } from '../../controls/ColorControl';
import { useEditorDispatch, useEditorState } from '../../../state/editor-hooks';
import type { SemanticPaletteRole, SurfacePaletteRole } from '../../../state/editor-state.types';

const semanticRoles: Array<[SemanticPaletteRole, string]> = [
  ['primary', 'Primary'],
  ['secondary', 'Secondary'],
  ['error', 'Error'],
  ['warning', 'Warning'],
  ['info', 'Info'],
  ['success', 'Success'],
];

const surfaceRoles: Array<[SurfacePaletteRole, string]> = [
  ['background.default', 'Page background'],
  ['background.paper', 'Surface background'],
  ['text.primary', 'Primary text'],
  ['text.secondary', 'Secondary text'],
  ['text.disabled', 'Disabled text'],
  ['divider', 'Divider'],
];

const defaults = {
  light: {
    primary: '#171717', secondary: '#f5f5f5', error: '#dc2626', warning: '#ed6c02', info: '#0288d1', success: '#2e7d32',
    'background.default': '#ffffff', 'background.paper': '#ffffff', 'text.primary': '#0a0a0a', 'text.secondary': '#737373', 'text.disabled': '#a3a3a3', divider: '#e5e5e5',
  },
  dark: {
    primary: '#fafafa', secondary: '#262626', error: '#ef4444', warning: '#ffa726', info: '#29b6f6', success: '#66bb6a',
    'background.default': '#0a0a0a', 'background.paper': '#0a0a0a', 'text.primary': '#fafafa', 'text.secondary': '#a3a3a3', 'text.disabled': '#737373', divider: '#262626',
  },
} as const;

function getSurfaceValue(palette: PaletteSettings | undefined, role: SurfacePaletteRole) {
  if (role === 'divider') return palette?.divider;
  if (role === 'background.default') return palette?.background?.default;
  if (role === 'background.paper') return palette?.background?.paper;
  if (role === 'text.primary') return palette?.text?.primary;
  if (role === 'text.secondary') return palette?.text?.secondary;
  return palette?.text?.disabled;
}

export function PaletteInspector() {
  const { activeMode, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const palette = project.colorSchemes[activeMode].palette;

  return (
    <Stack spacing={3}>
      <Stack spacing={2}>
        <Typography variant="subtitle2">Semantic colors</Typography>
        {semanticRoles.map(([role, label]) => {
          const override = palette?.[role]?.main;
          return (
            <ColorControl
              key={`${activeMode}-${role}-${override ?? 'default'}`}
              inherited={override === undefined}
              label={label}
              onCommit={(color) => dispatch({ type: 'set-semantic-color', mode: activeMode, role, color })}
              value={override ?? defaults[activeMode][role]}
            />
          );
        })}
      </Stack>
      <Divider />
      <Stack spacing={2}>
        <Typography variant="subtitle2">Surfaces and text</Typography>
        {surfaceRoles.map(([role, label]) => {
          const override = getSurfaceValue(palette, role);
          return (
            <ColorControl
              key={`${activeMode}-${role}-${override ?? 'default'}`}
              inherited={override === undefined}
              label={label}
              onCommit={(color) => dispatch({ type: 'set-surface-color', mode: activeMode, role, color })}
              value={override ?? defaults[activeMode][role]}
            />
          );
        })}
      </Stack>
    </Stack>
  );
}
