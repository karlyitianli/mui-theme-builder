import { useMemo } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { useEditorState } from '../../state/editor-hooks';
import { PreviewArea } from './PreviewArea';
import { createShellTheme } from './shell-theme';
import { TokenPanel } from './TokenPanel';

// The v2 shell from Figma frame 358:10 (1280px, cards version, inspector
// closed): a 320px token panel on the left and the preview area on the
// right, with no right-hand components panel.
//
// The shell renders inside its own theme (shell-theme.ts): a fully
// fixed theme whose only input is the active mode, so token edits,
// color edits included, never restyle the chrome (Karl's insulation
// rule, Nov 25, 2026). Only the preview cards in PreviewArea render
// under the full project theme. Before the insulation, this provider
// held a static copy of the chrome theme with the light baseline
// palette baked in; it now swaps between the shell's own fixed light
// and dark themes with the toggle, which is why this component reads
// the active mode from the editor state and memoizes the theme on it
// alone (project edits no longer rebuild it).
export function NewShell() {
  const { activeMode } = useEditorState();
  const shellTheme = useMemo(() => createShellTheme(activeMode), [activeMode]);

  return (
    <ThemeProvider theme={shellTheme}>
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
