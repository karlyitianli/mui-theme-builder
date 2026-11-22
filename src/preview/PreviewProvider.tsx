import { useMemo, type ReactNode } from 'react';
import { ThemeProvider } from '@mui/material/styles';

import type { ThemeProject } from '../domain/project';
import { usePreviewFont } from '../fonts/use-preview-font';
import { createRuntimeTheme } from '../theme/create-runtime-theme';

interface PreviewProviderProps {
  children: ReactNode;
  mode: 'light' | 'dark';
  project: ThemeProject;
}

export function PreviewProvider({ children, mode, project }: PreviewProviderProps) {
  const theme = useMemo(() => createRuntimeTheme(project), [project]);
  const font = project.foundations?.typography?.font;
  usePreviewFont(font);

  return (
    <ThemeProvider
      key={mode}
      defaultMode={mode}
      disableNestedContext
      disableTransitionOnChange
      storageManager={null}
      theme={theme}
    >
      {children}
    </ThemeProvider>
  );
}
