import { Box, Paper } from '@mui/material';

import type { ThemeProject } from '../domain/project';
import { ComponentGallery } from './ComponentGallery';
import { PreviewBoundary } from './PreviewBoundary';
import { PreviewProvider } from './PreviewProvider';

interface ThemePreviewProps {
  mode: 'light' | 'dark';
  project: ThemeProject;
}

export function ThemePreview({ mode, project }: ThemePreviewProps) {
  return (
    <PreviewBoundary>
      <PreviewProvider mode={mode} project={project}>
        <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: 620, p: 3 }}>
          <Paper elevation={2} sx={{ mx: 'auto', maxWidth: 720, p: { xs: 3, sm: 5 } }}>
            <ComponentGallery />
          </Paper>
        </Box>
      </PreviewProvider>
    </PreviewBoundary>
  );
}
