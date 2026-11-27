export type ColorValue = string;
export type CssLengthValue = number | string;

export type FontWeight = 300 | 400 | 500 | 600 | 700;

export type TextTransform = 'none' | 'capitalize' | 'uppercase' | 'lowercase';

export interface TypographyStyle {
  fontSize?: CssLengthValue;
  fontWeight?: FontWeight;
  letterSpacing?: CssLengthValue;
  lineHeight?: number | string;
  // Optional like every other field here: unset means the key is
  // omitted from the generated theme options and MUI's own variant
  // defaults apply (task 1.5, Nov 26, 2026).
  textTransform?: TextTransform;
}

export interface BorderStyle {
  color?: ColorValue;
  radius?: CssLengthValue;
  style?: 'none' | 'solid' | 'dashed';
  width?: CssLengthValue;
}
