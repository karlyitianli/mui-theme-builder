import type { ThemeOptions } from '@mui/material/styles';

import type { ButtonSettings } from '../../domain/components/button.types';

export function buttonSettingsToMui(settings?: ButtonSettings): ThemeOptions['components'] {
  if (!settings) return {};
  const style = settings.style;

  return {
    MuiButton: {
      defaultProps: settings.defaultProps,
      styleOverrides: {
        root: {
          ...(style?.textTransform === undefined ? {} : { textTransform: style.textTransform }),
          ...(style?.fontWeight === undefined ? {} : { fontWeight: style.fontWeight }),
          ...(style?.paddingBlock === undefined ? {} : { paddingBlock: style.paddingBlock }),
          ...(style?.paddingInline === undefined ? {} : { paddingInline: style.paddingInline }),
          ...(style?.border?.radius === undefined ? {} : { borderRadius: style.border.radius }),
          ...(style?.border?.width === undefined ? {} : { borderWidth: style.border.width }),
          ...(style?.border?.style === undefined ? {} : { borderStyle: style.border.style }),
          ...(style?.border?.color === undefined ? {} : { borderColor: style.border.color }),
        },
      },
    },
  };
}
