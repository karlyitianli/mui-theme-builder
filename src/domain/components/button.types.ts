import type { BorderStyle, CssLengthValue, FontWeight } from '../value.types';

export interface ButtonSettings {
  defaultProps?: {
    disableElevation?: boolean;
    size?: 'small' | 'medium' | 'large';
    variant?: 'contained' | 'outlined' | 'text';
  };
  style?: {
    border?: BorderStyle;
    fontWeight?: FontWeight;
    paddingBlock?: CssLengthValue;
    paddingInline?: CssLengthValue;
    textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
  };
}
