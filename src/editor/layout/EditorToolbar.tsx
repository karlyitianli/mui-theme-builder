import { useRef, useState } from 'react';
import { SparkleIcon } from '@phosphor-icons/react/dist/csr/Sparkle';
import { MoonIcon } from '@phosphor-icons/react/dist/csr/Moon';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple';
import { CodeIcon } from '@phosphor-icons/react/dist/csr/Code';
import { SunIcon } from '@phosphor-icons/react/dist/csr/Sun';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';

import { downloadProject } from '../../persistence/export-project';
import { importProjectFile } from '../../persistence/import-project';
import { GeneratedCodeDrawer } from '../../generator/GeneratedCodeDrawer';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';

export function EditorToolbar() {
  const { activeMode, future, past, project, saveStatus } = useEditorState();
  const dispatch = useEditorDispatch();
  const [resetOpen, setResetOpen] = useState(false);
  const [importError, setImportError] = useState<string>();
  const [codeOpen, setCodeOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const saveLabel = {
    'in-memory': 'Unsaved changes',
    saving: 'Saving locally…',
    saved: 'Saved locally',
    error: 'Local save failed',
  }[saveStatus];

  return (
    <>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between', p: 2 }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <SparkleIcon color="var(--mui-palette-primary-main)" size={24} />
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap component="h1" variant="subtitle1">
              {project.metadata.name}
            </Typography>
            <Typography color="text.secondary" variant="caption">
              {saveLabel}
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Stack direction="row">
            <Tooltip title="Undo">
              <span>
                <IconButton
                  aria-label="Undo"
                  disabled={past.length === 0}
                  onClick={() => dispatch({ type: 'undo' })}
                  size="small"
                >
                  <ArrowCounterClockwiseIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Redo">
              <span>
                <IconButton
                  aria-label="Redo"
                  disabled={future.length === 0}
                  onClick={() => dispatch({ type: 'redo' })}
                  size="small"
                >
                  <ArrowClockwiseIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <ToggleButtonGroup
            exclusive
            onChange={(_, mode: 'light' | 'dark' | null) =>
              mode && dispatch({ type: 'set-active-mode', mode })
            }
            size="small"
            value={activeMode}
          >
            <ToggleButton aria-label="Light preview" value="light">
              <SunIcon size={18} />
            </ToggleButton>
            <ToggleButton aria-label="Dark preview" value="dark">
              <MoonIcon size={18} />
            </ToggleButton>
          </ToggleButtonGroup>

          <Tooltip title="Reset entire project">
            <IconButton aria-label="Reset entire project" onClick={() => setResetOpen(true)} size="small">
              <TrashIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Import project JSON">
            <IconButton aria-label="Import project JSON" onClick={() => fileInput.current?.click()} size="small">
              <UploadSimpleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download project JSON">
            <IconButton aria-label="Download project JSON" onClick={() => downloadProject(project)} size="small">
              <DownloadSimpleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Review and export theme code">
            <IconButton aria-label="Review and export theme code" onClick={() => setCodeOpen(true)} size="small">
              <CodeIcon />
            </IconButton>
          </Tooltip>
          <Box
            accept="application/json,.json"
            component="input"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = '';
              if (!file) return;
              try {
                const imported = await importProjectFile(file);
                dispatch({ type: 'replace-project', project: imported });
                setImportError(undefined);
              } catch (error) {
                setImportError(error instanceof Error ? error.message : 'Could not import project.');
              }
            }}
            ref={fileInput}
            sx={{ display: 'none' }}
            type="file"
          />
        </Stack>
      </Stack>

      {importError && (
        <Alert onClose={() => setImportError(undefined)} severity="error" sx={{ mx: 2, mb: 2 }}>
          {importError}
        </Alert>
      )}

      <Dialog onClose={() => setResetOpen(false)} open={resetOpen}>
        <DialogTitle>Reset the entire theme?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This returns both color schemes and every component to MUI defaults. You can undo the reset afterward.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>Cancel</Button>
          <Button
            color="error"
            onClick={() => {
              dispatch({ type: 'reset-project' });
              setResetOpen(false);
            }}
          >
            Reset theme
          </Button>
        </DialogActions>
      </Dialog>
      <GeneratedCodeDrawer onClose={() => setCodeOpen(false)} open={codeOpen} project={project} />
    </>
  );
}
