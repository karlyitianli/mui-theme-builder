import type { ThemeOptions } from '@mui/material/styles';

import type { TextFieldSettings } from '../../domain/components/text-field.types';

export function textFieldSettingsToMui(settings?: TextFieldSettings): ThemeOptions['components'] {
  if (!settings) return {};
  const style = settings.style;

  return {
    MuiTextField: {
      defaultProps: settings.defaultProps,
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            ...(style?.border?.radius === undefined ? {} : { borderRadius: style.border.radius }),
            '& .MuiOutlinedInput-notchedOutline': {
              ...(style?.border?.color === undefined ? {} : { borderColor: style.border.color }),
              ...(style?.border?.width === undefined ? {} : { borderWidth: style.border.width }),
              ...(style?.border?.style === undefined ? {} : { borderStyle: style.border.style }),
            },
          },
          '& .MuiInputBase-input': {
            ...(style?.inputPaddingBlock === undefined ? {} : { paddingBlock: style.inputPaddingBlock }),
            ...(style?.inputPaddingInline === undefined ? {} : { paddingInline: style.inputPaddingInline }),
            ...style?.inputTypography,
          },
          '& .MuiInputLabel-root': style?.labelTypography,
        },
      },
    },
  };
}
