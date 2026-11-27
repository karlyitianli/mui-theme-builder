import type { ActionSettings, GreySettings } from './palette.types';

// Shared defaults for the Color panel's Grey and Action groups (task
// 3.6, Nov 26, 2026). The values are MUI's own, verified against a
// plain createTheme oracle on the installed MUI 9.3.1. That choice is
// forced, not stylistic: until 3.6 the project model carried no grey
// and no action, and the shadcn baseline carries neither either, so
// every project's preview and export already resolved these groups to
// exactly MUI's defaults. Storing anything else would silently restyle
// existing projects; storing MUI's defaults makes the implicit values
// explicit and editable with no visual change.
//
// The grey ramp is the same in both schemes (MUI does not vary it by
// mode); the action group differs per scheme, so its defaults are
// keyed by mode, like the palettes themselves.

export const GREY_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;

export const DEFAULT_GREY: Required<GreySettings> = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#eeeeee',
  300: '#e0e0e0',
  400: '#bdbdbd',
  500: '#9e9e9e',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
};

export function resolveGrey(grey?: GreySettings): Required<GreySettings> {
  return { ...DEFAULT_GREY, ...grey };
}

export const DEFAULT_ACTION: Record<'light' | 'dark', Required<ActionSettings>> = {
  light: {
    active: 'rgba(0, 0, 0, 0.54)',
    hover: 'rgba(0, 0, 0, 0.04)',
    hoverOpacity: 0.04,
    selected: 'rgba(0, 0, 0, 0.08)',
    selectedOpacity: 0.08,
    disabled: 'rgba(0, 0, 0, 0.26)',
    disabledBackground: 'rgba(0, 0, 0, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(0, 0, 0, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.12,
  },
  dark: {
    active: '#fff',
    hover: 'rgba(255, 255, 255, 0.08)',
    hoverOpacity: 0.08,
    selected: 'rgba(255, 255, 255, 0.16)',
    selectedOpacity: 0.16,
    disabled: 'rgba(255, 255, 255, 0.3)',
    disabledBackground: 'rgba(255, 255, 255, 0.12)',
    disabledOpacity: 0.38,
    focus: 'rgba(255, 255, 255, 0.12)',
    focusOpacity: 0.12,
    activatedOpacity: 0.24,
  },
};

export function resolveAction(
  mode: 'light' | 'dark',
  action?: ActionSettings,
): Required<ActionSettings> {
  return { ...DEFAULT_ACTION[mode], ...action };
}
