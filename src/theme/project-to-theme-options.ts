import type { ThemeOptions } from '@mui/material/styles';

import type { ThemeProject } from '../domain/project';
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
      buttonComponents,
      selectComponents,
      textFieldComponents,
    ),
  };
}
