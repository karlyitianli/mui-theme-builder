import type { ColorValue } from './value.types';

export type SemanticColorRole =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';

export interface PaletteColorSettings {
  main: ColorValue;
  light?: ColorValue;
  dark?: ColorValue;
  contrastText?: ColorValue;
}

// The grey ramp (task 3.6): MUI's palette.grey numbered shades, 50 to
// 900. The A100 to A700 accent shades MUI also carries are not part of
// the model; the theme build fills them from MUI's defaults, which are
// the same values the ramp below resolves to for the shades it stores.
export interface GreySettings {
  50?: ColorValue;
  100?: ColorValue;
  200?: ColorValue;
  300?: ColorValue;
  400?: ColorValue;
  500?: ColorValue;
  600?: ColorValue;
  700?: ColorValue;
  800?: ColorValue;
  900?: ColorValue;
}

export type GreyShade = keyof GreySettings;

// MUI's palette.action group (task 3.6), in full: six colors and five
// opacities. The colors are rgba strings in MUI's defaults, not hex,
// and the model stores them as the color strings they are.
export interface ActionSettings {
  active?: ColorValue;
  hover?: ColorValue;
  hoverOpacity?: number;
  selected?: ColorValue;
  selectedOpacity?: number;
  disabled?: ColorValue;
  disabledBackground?: ColorValue;
  disabledOpacity?: number;
  focus?: ColorValue;
  focusOpacity?: number;
  activatedOpacity?: number;
}

export type ActionColorKey =
  | 'active'
  | 'hover'
  | 'selected'
  | 'disabled'
  | 'disabledBackground'
  | 'focus';

export type ActionOpacityKey =
  | 'hoverOpacity'
  | 'selectedOpacity'
  | 'disabledOpacity'
  | 'focusOpacity'
  | 'activatedOpacity';

export interface PaletteSettings {
  primary?: PaletteColorSettings;
  secondary?: PaletteColorSettings;
  error?: PaletteColorSettings;
  warning?: PaletteColorSettings;
  info?: PaletteColorSettings;
  success?: PaletteColorSettings;
  background?: {
    default?: ColorValue;
    paper?: ColorValue;
  };
  text?: {
    primary?: ColorValue;
    secondary?: ColorValue;
    disabled?: ColorValue;
  };
  divider?: ColorValue;
  grey?: GreySettings;
  action?: ActionSettings;
}
