import type { ThemeOptions } from '@mui/material/styles';

import type { SelectSettings } from '../../domain/components/select.types';

export function selectSettingsToMui(settings?: SelectSettings): ThemeOptions['components'] {
  if (!settings) return {};
  const style = settings.style;

  return {
    MuiSelect: {
      defaultProps: settings.defaultProps,
      styleOverrides: {
        root: {
          ...(style?.border?.radius === undefined ? {} : { borderRadius: style.border.radius }),
          '& .MuiOutlinedInput-notchedOutline': {
            ...(style?.border?.color === undefined ? {} : { borderColor: style.border.color }),
            ...(style?.border?.width === undefined ? {} : { borderWidth: style.border.width }),
            ...(style?.border?.style === undefined ? {} : { borderStyle: style.border.style }),
          },
        },
        select: {
          ...(style?.inputPaddingBlock === undefined ? {} : { paddingBlock: style.inputPaddingBlock }),
          ...(style?.inputPaddingInline === undefined ? {} : { paddingInline: style.inputPaddingInline }),
          ...style?.inputTypography,
        },
        icon: style?.iconColor === undefined ? {} : { color: style.iconColor },
      },
    },
  };
}
