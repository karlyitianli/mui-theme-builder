import type { ColorValue } from './value.types';

export interface PaletteColorSettings {
  main: ColorValue;
  light?: ColorValue;
  dark?: ColorValue;
  contrastText?: ColorValue;
}

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
}
