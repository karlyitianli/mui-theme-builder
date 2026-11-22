import type { ThemeOptions } from '@mui/material/styles';

import type { TypographySettings } from '../domain/typography.types';

export function typographySettingsToMui(
  settings?: TypographySettings,
): ThemeOptions['typography'] {
  if (!settings) return undefined;

  const { font, fontSize, variants } = settings;

  const typography = {
    ...(font
      ? {
          fontFamily: [font.family, ...font.fallback]
            .map((family) => (family.includes(' ') ? `"${family}"` : family))
            .join(', '),
        }
      : {}),
    ...(fontSize === undefined ? {} : { fontSize }),
    ...variants,
  };

  // Builder typography values are deliberately narrower than MUI's CSS
  // property type. This adapter is the only place that widens them.
  return typography as ThemeOptions['typography'];
}
