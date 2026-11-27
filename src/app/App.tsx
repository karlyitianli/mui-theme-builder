import { useMemo } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { EditorProvider } from '../state/editor-context';
import { useEditorState } from '../state/editor-hooks';
import { StartupGate } from './StartupGate';
import { NewShell } from './shell-v2/NewShell';
import { createShellTheme } from './shell-v2/shell-theme';

// The app root renders under the shell theme (shell-theme.ts), the
// same fixed theme the shell's chrome uses: the startup screen inside
// StartupGate therefore renders in the shell's mode and Inter stack
// instead of under the removed original shell's leftover light-only
// theme (audit finding C3). NewShell nests its own provider with the
// same theme; this root provider exists for the surfaces outside it,
// the startup screen and the global baseline. The theme depends only
// on the active mode, never on the project, per the insulation rule.
function RootChrome() {
  const { activeMode } = useEditorState();
  const shellTheme = useMemo(() => createShellTheme(activeMode), [activeMode]);
  return (
    <ThemeProvider theme={shellTheme}>
      <CssBaseline />
      <StartupGate>
        <NewShell />
      </StartupGate>
    </ThemeProvider>
  );
}

export function App() {
  // The v2 shell is the only shell now. The original shell was deprecated
  // and removed (Nov 25, 2026); the old ?shell=v2 opt-in is a no-op, the
  // v2 shell loads on every path.
  return (
    <EditorProvider>
      <RootChrome />
    </EditorProvider>
  );
}
