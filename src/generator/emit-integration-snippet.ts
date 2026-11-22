export function emitIntegrationSnippet(): string {
  return `import { CssBaseline } from '@mui/material';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { theme } from './theme';

function ModeToggle() {
  const { mode, setMode } = useColorScheme();

  return (
    <button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      Switch theme
    </button>
  );
}

export function App() {
  return (
    <ThemeProvider theme={theme} defaultMode="light">
      <CssBaseline />
      <ModeToggle />
      {/* Your application */}
    </ThemeProvider>
  );
}`;
}
