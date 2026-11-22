import type { BorderStyle, CssLengthValue, TypographyStyle } from '../value.types';

export interface TextFieldSettings {
  defaultProps?: {
    fullWidth?: boolean;
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined' | 'standard';
  };
  style?: {
    border?: BorderStyle;
    inputPaddingBlock?: CssLengthValue;
    inputPaddingInline?: CssLengthValue;
    inputTypography?: TypographyStyle;
    labelTypography?: TypographyStyle;
  };
}
