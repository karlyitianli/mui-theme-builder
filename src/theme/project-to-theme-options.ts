import type { ThemeOptions } from '@mui/material/styles';

import type { ThemeProject } from '../domain/project';
import {
  DEFAULT_CARD_BORDER_RADIUS,
  resolveShadows,
} from '../domain/foundation-defaults';
import { externalLabelComponents } from './external-label-components';
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
  // contained shadow then comes from the theme's shadow scale), and an
  // input elevation of 0 pins the outlined input's box shadow to none.
  // Explicit component settings merge after this block, so a Button or
  // TextField setting the user made still wins over the foundation value.
  const shadows = resolveShadows(foundations?.shadows);
  const cardBorderRadius = foundations?.shape?.cardBorderRadius ?? DEFAULT_CARD_BORDER_RADIUS;
  const foundationComponents: ThemeOptions['components'] = {
    MuiPaper: { defaultProps: { elevation: shadows.global } },
    MuiCard: {
      defaultProps: { elevation: shadows.card },
      styleOverrides: { root: { borderRadius: cardBorderRadius } },
    },
    MuiButton: { defaultProps: { disableElevation: shadows.button === 0 } },
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
    shape: { borderRadius: foundations?.shape?.borderRadius ?? 6 },
    ...(foundations?.spacing === undefined ? {} : { spacing: foundations.spacing }),
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
