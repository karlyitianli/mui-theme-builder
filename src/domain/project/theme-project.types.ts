import type { ButtonSettings } from '../components/button.types';
import type { SelectSettings } from '../components/select.types';
import type { TextFieldSettings } from '../components/text-field.types';
import type { PaletteSettings } from '../palette.types';
import type { TypographySettings } from '../typography.types';
import type { CssLengthValue } from '../value.types';
import type { CURRENT_SCHEMA_VERSION } from './project-version';

export interface ThemeProjectV1 {
  schemaVersion: typeof CURRENT_SCHEMA_VERSION;
  builderVersion: string;
  targetMuiVersion: string;
  metadata: {
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  colorSchemes: {
    light: { palette?: PaletteSettings };
    dark: { palette?: PaletteSettings };
  };
  foundations?: {
    shape?: { borderRadius?: CssLengthValue };
    spacing?: number;
    typography?: TypographySettings;
    interactions?: {
      disableRipple?: boolean;
    };
  };
  components?: {
    button?: ButtonSettings;
    textField?: TextFieldSettings;
    select?: SelectSettings;
  };
}

export type ThemeProject = ThemeProjectV1;
