import { createTheme } from '@mui/material/styles';

import { externalLabelComponents } from '../theme/external-label-components';
import { mergeThemeComponents } from '../theme/merge-theme-components';
import { shadcnComponents, shadcnPalettes, shadcnTypography } from '../theme/shadcn-baseline';

// This fixed theme styles the builder itself. User-created themes will be
// rendered inside a separate preview provider in a later milestone.
export const appTheme = createTheme({
  cssVariables: true,
  palette: {
    ...shadcnPalettes.light,
    mode: 'light',
  },
  typography: shadcnTypography,
  shape: {
    borderRadius: 6,
  },
  components: mergeThemeComponents(
    shadcnComponents,
    externalLabelComponents,
  ),
});
