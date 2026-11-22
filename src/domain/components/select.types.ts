import type { BorderStyle, ColorValue, CssLengthValue, TypographyStyle } from '../value.types';

export interface SelectSettings {
  defaultProps?: {
    fullWidth?: boolean;
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined' | 'standard';
  };
  style?: {
    border?: BorderStyle;
    iconColor?: ColorValue;
    inputPaddingBlock?: CssLengthValue;
    inputPaddingInline?: CssLengthValue;
    inputTypography?: TypographyStyle;
  };
}
