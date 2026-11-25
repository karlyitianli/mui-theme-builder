import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { EditorProvider } from '../state/editor-context';
import { StartupGate } from './StartupGate';
import { appTheme } from './app-theme';
import { NewShell } from './shell-v2/NewShell';

export function App() {
  // The v2 shell is the only shell now. The original shell was deprecated
  // and removed (Nov 25, 2026); the old ?shell=v2 opt-in is a no-op, the
  // v2 shell loads on every path.
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <EditorProvider>
        <StartupGate>
          <NewShell />
        </StartupGate>
      </EditorProvider>
    </ThemeProvider>
  );
}
