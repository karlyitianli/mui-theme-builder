import { Stack, Typography } from '@mui/material';

import { useEditorDispatch, useEditorState } from '../../../state/editor-hooks';
import { NumberControl } from '../../controls/NumberControl';

export function FoundationInspector() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();

  return (
    <Stack spacing={3}>
      <Typography color="text.secondary" variant="body2">
        Shared foundation values apply to both light and dark schemes.
      </Typography>
      <NumberControl label="Border radius" min={0} max={32} value={typeof project.foundations?.shape?.borderRadius === 'number' ? project.foundations.shape.borderRadius : 6} onCommit={(value) => dispatch({ type: 'set-border-radius', value })} helperText="Pixels" />
      <NumberControl label="Spacing unit" min={1} max={16} value={project.foundations?.spacing ?? 8} onCommit={(value) => dispatch({ type: 'set-spacing', value })} helperText="Pixels; MUI spacing multiples use this base" />
    </Stack>
  );
}
