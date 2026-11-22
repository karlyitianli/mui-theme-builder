import { createTheme } from '@mui/material/styles';

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
    MuiAutocomplete: { defaultProps: { fullWidth: true, size: 'small' } },
  },
});
