import type { ThemeProject } from '../domain/project';
import { emitThemeTsx } from './emit-theme-tsx';

export function downloadTheme(project: ThemeProject) {
  const blob = new Blob([emitThemeTsx(project)], { type: 'text/typescript' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'theme.tsx';
  anchor.click();
  URL.revokeObjectURL(url);
}
