import type { ThemeOptions } from '@mui/material/styles';

import type { ThemeProject } from '../domain/project';
import {
  DEFAULT_BORDER_RADIUS,
  DEFAULT_CARD_BORDER_RADIUS,
  resolveBreakpoints,
  resolveShadows,
  resolveTransitionDuration,
  resolveTransitionEasing,
  resolveZIndex,
} from '../domain/foundation-defaults';
import { externalLabelComponents } from './external-label-components';
import { DropdownIcon } from './dropdown-icon';
import { dropdownIconElement } from './dropdown-icon-element';
import { buttonSettingsToMui } from './component-adapters/button-adapter';
import { selectSettingsToMui } from './component-adapters/select-adapter';
import { textFieldSettingsToMui } from './component-adapters/text-field-adapter';
import { paletteSettingsToMui } from './palette-adapter';
import { typographySettingsToMui } from './typography-adapter';
import { mergeThemeComponents } from './merge-theme-components';
import { shadcnComponents, shadcnTypography } from './shadcn-baseline';

export function projectToThemeOptions(project: ThemeProject): ThemeOptions {
  const { foundations } = project;
  const buttonComponents = buttonSettingsToMui(project.components?.button);
  const textFieldComponents = textFieldSettingsToMui(project.components?.textField);
  const selectComponents = selectSettingsToMui(project.components?.select);

  // Foundation shadows and the card radius (Phase 5 model homes). Paper
  // carries the global elevation, Card its own elevation and the card
  // radius, Button elevation maps to MUI's disableElevation switch (its
  // contained shadow then comes from the theme's shadow scale), the
  // Menu paper's elevation comes from the menu shadow (Karl's Nov 26,
  // 2026 decision: the foundations own the Menu shadow now, so the
  // baseline MuiMenu override keeps only its border, radius, and offset),
  // the Autocomplete dropdown paper follows the same menu elevation so
  // the two dropdowns keep the matched treatment Karl locked on
  // Nov 25, 2026 (the baseline no longer hand-sets either shadow), and
  // an input elevation of 0 pins the outlined input's box shadow to
  // none.
  // Explicit component settings merge after this block, so a Button or
  // TextField setting the user made still wins over the foundation value.
  // The block also carries Karl's dropdown default: Select and
  // Autocomplete use the Phosphor caret-down (dropdown-icon.tsx). The
  // Select adapter's defaultProps merge per key after this block, so the
  // caret survives unless a project's Select settings ever name their own
  // IconComponent (the typed settings model has no such field today).
  const shadows = resolveShadows(foundations?.shadows);
  const cardBorderRadius = foundations?.shape?.cardBorderRadius ?? DEFAULT_CARD_BORDER_RADIUS;
  const foundationComponents: ThemeOptions['components'] = {
    MuiPaper: { defaultProps: { elevation: shadows.global } },
    MuiCard: {
      defaultProps: { elevation: shadows.card },
      styleOverrides: { root: { borderRadius: cardBorderRadius } },
    },
    MuiButton: { defaultProps: { disableElevation: shadows.button === 0 } },
    MuiMenu: {
      defaultProps: { slotProps: { paper: { elevation: shadows.menu } } },
    },
    MuiSelect: { defaultProps: { IconComponent: DropdownIcon } },
    MuiAutocomplete: {
      defaultProps: {
        popupIcon: dropdownIconElement,
        slotProps: { paper: { elevation: shadows.menu } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          boxShadow:
            shadows.input === 0
              ? 'none'
              : `0 ${shadows.input}px ${shadows.input * 2}px rgba(0, 0, 0, 0.15)`,
        },
      },
    },
  };

  return {
    // An explicit selector lets the preview toggle override the operating
    // system preference. MUI's default media selector would otherwise keep a
    // dark-system user in dark mode even when the editor selects light.
    cssVariables: { colorSchemeSelector: 'data' },
    colorSchemes: {
      light: {
        palette: paletteSettingsToMui('light', project.colorSchemes.light.palette),
      },
      dark: {
        palette: paletteSettingsToMui('dark', project.colorSchemes.dark.palette),
      },
    },
    shape: { borderRadius: foundations?.shape?.borderRadius ?? DEFAULT_BORDER_RADIUS },
    ...(foundations?.spacing === undefined ? {} : { spacing: foundations.spacing }),
    // The Other tab's groups (task 3.5). Both factories and migration
    // store the full groups (MUI's defaults until edited), and the
    // resolvers fill any key a sparse project omits, so the options
    // always carry all three blocks and the panel, the preview, and
    // the export agree. Breakpoints emit values only: the unit and
    // step stay at MUI's defaults, as in the project model.
    breakpoints: { values: resolveBreakpoints(foundations?.breakpoints) },
    transitions: {
      duration: resolveTransitionDuration(foundations?.transitions?.duration),
      easing: resolveTransitionEasing(foundations?.transitions?.easing),
    },
    zIndex: resolveZIndex(foundations?.zIndex),
    typography:
      foundations?.typography === undefined
        ? shadcnTypography
        : { ...shadcnTypography, ...typographySettingsToMui(foundations.typography) },
    components: mergeThemeComponents(
      shadcnComponents,
      externalLabelComponents,
      foundationComponents,
      buttonComponents,
      selectComponents,
      textFieldComponents,
    ),
  };
}
