import type { ReactNode } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { useEditorState } from '../state/editor-hooks';

export function StartupGate({ children }: { children: ReactNode }) {
  const { hydrated } = useEditorState();
  if (hydrated) return children;

  return (
    <Box component="main" sx={{ display: 'grid', minHeight: '100dvh', placeItems: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <CircularProgress size={28} />
        <Typography color="text.secondary" variant="body2">
          Restoring local theme…
        </Typography>
      </Stack>
    </Box>
  );
}
