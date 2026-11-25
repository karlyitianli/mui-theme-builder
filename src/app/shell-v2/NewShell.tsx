import { Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { externalLabelComponents } from '../../theme/external-label-components';
import { mergeThemeComponents } from '../../theme/merge-theme-components';
import {
  shadcnComponents,
  shadcnPalettes,
  shadcnTypography,
} from '../../theme/shadcn-baseline';
import { PreviewArea } from './PreviewArea';
import { TokenPanel } from './TokenPanel';

// The v2 shell from Figma frame 358:10 (1280px, cards version, inspector
// closed): a 320px token panel on the left and the preview area on the
// right, with no right-hand components panel.
//
// The v2 shell is pure layout behind the ?shell=v2 switch (see
// shell-switch.ts); Phase 2 added the Typography, Spacing, Radius, and
// Shadows tab panels alongside Color. It renders inside its own copy of
// the builder chrome theme because all text in the v2 design is Inter,
// while the original shell keeps the system font stack in app-theme.ts.
const INTER_FONT_FAMILY = [
  'Inter',
  'ui-sans-serif',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'sans-serif',
].join(', ');

const newShellTheme = createTheme({
  cssVariables: true,
  palette: {
    ...shadcnPalettes.light,
    mode: 'light',
  },
  typography: {
    ...shadcnTypography,
    fontFamily: INTER_FONT_FAMILY,
  },
  shape: {
    borderRadius: 6,
  },
  components: mergeThemeComponents(shadcnComponents, externalLabelComponents),
});

export function NewShell() {
  return (
    <ThemeProvider theme={newShellTheme}>
      <Box
        component="main"
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          display: 'flex',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <TokenPanel />
        <PreviewArea />
      </Box>
    </ThemeProvider>
  );
}
