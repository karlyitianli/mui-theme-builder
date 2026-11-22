import type { ThemeOptions } from '@mui/material/styles';

/**
 * Makes MUI labels render above their controls instead of floating inside
 * them. Components must still render an InputLabel (TextField does this when
 * given a label); a theme cannot create missing React elements.
 */
export const externalLabelComponents = {
  MuiInputLabel: {
    defaultProps: {
      shrink: true,
    },
    styleOverrides: {
      root: {
        position: 'static',
        transform: 'none',
        marginBottom: 6,
        maxWidth: '100%',
        pointerEvents: 'auto',
        '&.MuiInputLabel-shrink': {
          transform: 'none',
          maxWidth: '100%',
        },
      },
    },
  },
  MuiOutlinedInput: {
    defaultProps: {
      notched: false,
    },
  },
  MuiTextField: {
    defaultProps: {
      fullWidth: true,
      size: 'small',
      variant: 'outlined',
    },
  },
  MuiAutocomplete: {
    defaultProps: {
      fullWidth: true,
      size: 'small',
    },
  },
} satisfies ThemeOptions['components'];
