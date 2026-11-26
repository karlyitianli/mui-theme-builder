import type { PaletteOptions, ThemeOptions } from '@mui/material/styles';

export const shadcnPalettes: Record<'light' | 'dark', PaletteOptions> = {
  light: {
    mode: 'light',
    primary: { main: '#171717', contrastText: '#fafafa' },
    secondary: { main: '#f5f5f5', contrastText: '#171717' },
    error: { main: '#dc2626', contrastText: '#ffffff' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#0a0a0a', secondary: '#737373', disabled: '#a3a3a3' },
    divider: '#e5e5e5',
  },
  dark: {
    mode: 'dark',
    primary: { main: '#fafafa', contrastText: '#171717' },
    secondary: { main: '#262626', contrastText: '#fafafa' },
    error: { main: '#ef4444', contrastText: '#ffffff' },
    background: { default: '#0a0a0a', paper: '#0a0a0a' },
    text: { primary: '#fafafa', secondary: '#a3a3a3', disabled: '#737373' },
    divider: '#262626',
  },
};

export const shadcnTypography: ThemeOptions['typography'] = {
  fontFamily: [
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'sans-serif',
  ].join(', '),
  fontSize: 14,
  button: { fontSize: 14, fontWeight: 500, letterSpacing: 0, lineHeight: 1.4 },
  body1: { fontSize: 14, lineHeight: 1.5 },
  body2: { fontSize: 13, lineHeight: 1.5 },
};

export const shadcnComponents = {
  MuiButtonBase: {
    defaultProps: { disableRipple: true },
    styleOverrides: {
      root: {
        '&.Mui-focusVisible': {
          outline: '2px solid currentColor',
          outlineOffset: 2,
        },
      },
    },
  },
  MuiButton: {
    defaultProps: { disableElevation: true, size: 'medium', variant: 'contained' },
    styleOverrides: {
      root: {
        minHeight: 36,
        borderRadius: 6,
        padding: '8px 16px',
        textTransform: 'none',
        fontWeight: 500,
        boxShadow: 'none',
        transition: 'color 150ms, background-color 150ms, border-color 150ms, box-shadow 150ms',
        '&:focus-visible': {
          outline: '2px solid var(--mui-palette-background-paper)',
          outlineOffset: 2,
          boxShadow: '0 0 0 4px color-mix(in srgb, var(--mui-palette-primary-main) 35%, transparent)',
        },
      },
      contained: {
        '&:hover': { boxShadow: 'none', opacity: 0.9 },
      },
      outlined: {
        borderColor: 'var(--mui-palette-divider)',
        backgroundColor: 'var(--mui-palette-background-paper)',
        color: 'var(--mui-palette-text-primary)',
        '&:hover': {
          borderColor: 'var(--mui-palette-divider)',
          backgroundColor: 'var(--mui-palette-action-hover)',
        },
      },
      text: {
        color: 'var(--mui-palette-text-primary)',
        '&:hover': { backgroundColor: 'var(--mui-palette-action-hover)' },
      },
      sizeSmall: { minHeight: 32, padding: '6px 12px', fontSize: 13 },
      sizeLarge: { minHeight: 40, padding: '10px 20px' },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        minHeight: 36,
        borderRadius: 6,
        backgroundColor: 'var(--mui-palette-background-paper)',
        fontSize: 14,
        transition: 'border-color 150ms, box-shadow 150ms',
        '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--mui-palette-divider)' },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--mui-palette-text-disabled)' },
        '&.Mui-focused': {
          boxShadow: '0 0 0 3px color-mix(in srgb, var(--mui-palette-primary-main) 20%, transparent)',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: 'var(--mui-palette-primary-main)',
          borderWidth: 1,
        },
      },
      input: { padding: '8px 12px' },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: { color: 'var(--mui-palette-text-primary)', fontSize: 13, fontWeight: 500 },
    },
  },
  MuiFormHelperText: {
    styleOverrides: { root: { marginLeft: 0, marginRight: 0, fontSize: 12 } },
  },
  MuiSelect: {
    styleOverrides: { select: { padding: '8px 36px 8px 12px' } },
  },
  MuiPaper: {
    defaultProps: { elevation: 0 },
    styleOverrides: { root: { backgroundImage: 'none' } },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        marginTop: 4,
        border: '1px solid var(--mui-palette-divider)',
        borderRadius: 6,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: { root: { minHeight: 32, borderRadius: 4, fontSize: 14, margin: '2px 4px' } },
  },
  // The Autocomplete dropdown is a Popper holding a plain Paper, not a
  // Menu, so the MuiMenu paper treatment above never reaches it: left
  // alone it renders with no border and only the Paper elevation shadow
  // (the foundation's global elevation), which reads as flat against
  // the page. Karl flagged the mismatch from the live preview (Nov 25,
  // 2026); the paper slot gets the same border and radius as the Menu
  // paper, plus a hand-set shadow matching the depth the Menu paper had
  // at the time (the Menu's own shadow is elevation-driven since Nov
  // 26, 2026, and the Autocomplete paper has no elevation slot in this
  // model, so its shadow stays written out here).
  MuiAutocomplete: {
    styleOverrides: {
      paper: {
        border: '1px solid var(--mui-palette-divider)',
        borderRadius: 6,
      },
    },
  },
  MuiTooltip: {
    styleOverrides: { tooltip: { borderRadius: 5, fontSize: 12 } },
  },
} satisfies ThemeOptions['components'];
