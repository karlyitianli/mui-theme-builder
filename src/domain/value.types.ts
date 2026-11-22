export type ColorValue = string;
export type CssLengthValue = number | string;

export type FontWeight = 300 | 400 | 500 | 600 | 700;

export interface TypographyStyle {
  fontSize?: CssLengthValue;
  fontWeight?: FontWeight;
  letterSpacing?: CssLengthValue;
  lineHeight?: number | string;
}

export interface BorderStyle {
  color?: ColorValue;
  radius?: CssLengthValue;
  style?: 'none' | 'solid' | 'dashed';
  width?: CssLengthValue;
}
