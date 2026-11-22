import { createTheme } from '@mui/material/styles';

import type { ThemeProject } from '../domain/project';
import { projectToThemeOptions } from './project-to-theme-options';

export function createRuntimeTheme(project: ThemeProject) {
  return createTheme(projectToThemeOptions(project));
}
