import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { EditorProvider } from '../state/editor-context';
import { AppShell } from './AppShell';
import { StartupGate } from './StartupGate';
import { appTheme } from './app-theme';
import { NewShell } from './shell-v2/NewShell';
import { isNewShellEnabled } from './shell-v2/shell-switch';

export function App() {
  // The v2 shell is opt-in via ?shell=v2; the original shell stays default.
  const useNewShell = isNewShellEnabled(window.location.search);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <EditorProvider>
        <StartupGate>{useNewShell ? <NewShell /> : <AppShell />}</StartupGate>
      </EditorProvider>
    </ThemeProvider>
  );
}
