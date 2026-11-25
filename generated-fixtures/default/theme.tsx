/* eslint-disable react-refresh/only-export-components -- this fixture mirrors
   the generated theme.tsx, which mixes the icon wrapper component with the
   theme export by design; it is compile-checked, not app source. */
import { createTheme } from '@mui/material/styles';
import { CaretDown } from '@phosphor-icons/react';
import { createElement, type ComponentProps } from 'react';

// Select and Autocomplete dropdown icon: the Phosphor caret-down at 18px.
// The wrapper forwards every prop because MUI Select passes its own
// positioning classes to the icon component.
function DropdownIcon(props: Omit<ComponentProps<typeof CaretDown>, 'size'>) {
  return createElement(CaretDown, { ...props, size: 18 });
}

export const theme = createTheme({
  cssVariables: { colorSchemeSelector: 'data' },
  colorSchemes: {
    light: { palette: { mode: 'light' } },
    dark: { palette: { mode: 'dark' } },
  },
  components: {
    MuiInputLabel: {
      defaultProps: { shrink: true },
      styleOverrides: {
        root: {
          position: 'static',
          transform: 'none',
          marginBottom: 6,
          maxWidth: '100%',
          pointerEvents: 'auto',
          '&.MuiInputLabel-shrink': { transform: 'none', maxWidth: '100%' },
        },
      },
    },
    MuiOutlinedInput: { defaultProps: { notched: false } },
    MuiTextField: { defaultProps: { fullWidth: true, size: 'small', variant: 'outlined' } },
    MuiSelect: { defaultProps: { IconComponent: DropdownIcon } },
    MuiAutocomplete: {
      defaultProps: { fullWidth: true, size: 'small', popupIcon: createElement(DropdownIcon) },
    },
  },
});
