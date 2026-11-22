import { Box, Divider, Paper } from '@mui/material';

import { EditorToolbar } from '../editor/layout/EditorToolbar';
import { PropertyInspector } from '../editor/layout/PropertyInspector';
import { SectionNavigation } from '../editor/layout/SectionNavigation';
import { ThemePreview } from '../preview/ThemePreview';
import { useEditorState } from '../state/editor-hooks';

export function AppShell() {
  const { activeMode, project } = useEditorState();

  return (
    <Box component="main" sx={{ minHeight: '100dvh' }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '200px minmax(0, 1fr) 300px' },
          gridTemplateRows: 'auto 1fr',
          minHeight: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ gridColumn: '1 / -1' }}>
          <EditorToolbar />
          <Divider />
        </Box>

        <Box
          sx={(theme) => ({
            borderRight: { lg: `1px solid ${theme.palette.divider}` },
            display: { xs: 'none', lg: 'block' },
          })}
        >
          <SectionNavigation />
        </Box>

        <Box sx={{ minWidth: 0, order: { xs: 2, lg: 'initial' } }}>
          <ThemePreview mode={activeMode} project={project} />
        </Box>

        <Box
          sx={(theme) => ({
            borderBottom: { xs: `1px solid ${theme.palette.divider}`, lg: 0 },
            borderLeft: { lg: `1px solid ${theme.palette.divider}` },
            order: { xs: 1, lg: 'initial' },
          })}
        >
          <Box sx={{ display: { xs: 'block', lg: 'none' }, borderBottom: 1, borderColor: 'divider' }}>
            <SectionNavigation />
          </Box>
          <PropertyInspector />
        </Box>
      </Paper>
    </Box>
  );
}
