import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { EditorProvider } from '../state/editor-context';
import { AppShell } from './AppShell';
import { StartupGate } from './StartupGate';
import { appTheme } from './app-theme';

export function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <EditorProvider>
        <StartupGate>
          <AppShell />
        </StartupGate>
      </EditorProvider>
    </ThemeProvider>
  );
}
