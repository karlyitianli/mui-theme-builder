import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import { Button, Divider, Stack, TextField, Typography } from '@mui/material';

import { FoundationInspector } from '../sections/foundation/FoundationInspector';
import { PaletteInspector } from '../sections/palette/PaletteInspector';
import { TypographyInspector } from '../sections/typography/TypographyInspector';
import { ButtonInspector } from '../sections/components/ButtonInspector';
import { SelectInspector } from '../sections/components/SelectInspector';
import { TextFieldInspector } from '../sections/components/TextFieldInspector';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';

const sectionLabels = {
  palette: 'Colors',
  typography: 'Typography',
  foundation: 'Shape & spacing',
  button: 'Button',
  textField: 'Text field',
  select: 'Select',
} as const;

export function PropertyInspector() {
  const { activeMode, activeSection, project } = useEditorState();
  const dispatch = useEditorDispatch();

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Stack spacing={0.5}>
        <Typography component="h2" variant="h6">
          {sectionLabels[activeSection]}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {activeMode === 'light' ? 'Light' : 'Dark'} scheme
        </Typography>
      </Stack>

      <TextField
        key={project.metadata.name}
        defaultValue={project.metadata.name}
        fullWidth
        label="Project name"
        onBlur={(event) => dispatch({ type: 'rename-project', name: event.target.value })}
        size="small"
      />

      <Divider />

      {activeSection === 'palette' && <PaletteInspector />}
      {activeSection === 'typography' && <TypographyInspector />}
      {activeSection === 'foundation' && <FoundationInspector />}
      {activeSection === 'button' && <ButtonInspector />}
      {activeSection === 'textField' && <TextFieldInspector />}
      {activeSection === 'select' && <SelectInspector />}

      <Button
        color="inherit"
        onClick={() => dispatch({ type: 'reset-active-section' })}
        startIcon={<ArrowCounterClockwiseIcon />}
        variant="outlined"
      >
        Reset this section
      </Button>
    </Stack>
  );
}
