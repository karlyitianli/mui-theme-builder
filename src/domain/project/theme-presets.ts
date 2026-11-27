import { paletteSettingsToMui } from '../../theme/palette-adapter';
import { createDefaultProject } from './create-default-project';
import { createMuiDefaultProject } from './create-mui-default-project';
import type { ThemeProject } from './theme-project.types';

export type ThemePresetId = 'black' | 'mui-default';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  // The four swatch dots the preset row shows for this preset (primary,
  // secondary, surface, divider of its light scheme). They are the
  // preset's identity swatches, shown in both modes, and they are
  // derived from the preset's own factory project through the palette
  // adapter, not a literal copy of its values (audit finding C7): if a
  // preset's palette ever changes, its dots move with it.
  dots: string[];
  createProject: (now?: Date) => ThemeProject;
}

function presetDots(createProject: (now?: Date) => ThemeProject): string[] {
  const palette = paletteSettingsToMui('light', createProject().colorSchemes.light.palette);
  const mainOf = (color: typeof palette.primary): string =>
    color !== undefined && 'main' in color ? (color.main ?? '') : '';
  return [
    mainOf(palette.primary),
    mainOf(palette.secondary),
    palette.background?.paper ?? '',
    palette.divider ?? '',
  ];
}

// The builder's theme presets (Karl's Nov 26, 2026 preset decision).
// "Black" is the shadcn-styled baseline that used to be named "Default"
// (primary #171717, sparse project over the baseline in the theme
// mapping); it was renamed so the name "Default" can mean what it says.
// "Default" stores MUI's actual default theme values explicitly (see
// create-mui-default-project.ts).
//
// A preset is a project factory, nothing more: the project schema
// carries no preset field, and stored projects (IndexedDB, import and
// export) never name the preset they started from. That is also why the
// rename cannot restyle saved work: there is no name to resolve. The
// editor state tracks the active preset for the session only, as a
// display label for the preset row.
export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'black',
    name: 'Black',
    dots: presetDots(createDefaultProject),
    createProject: createDefaultProject,
  },
  {
    id: 'mui-default',
    name: 'Default',
    dots: presetDots(createMuiDefaultProject),
    createProject: createMuiDefaultProject,
  },
];

// New projects start on Black (Karl's explicit choice, Nov 26, 2026).
export const STARTUP_PRESET_ID: ThemePresetId = 'black';

export function findThemePreset(id: ThemePresetId): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS[0];
}
