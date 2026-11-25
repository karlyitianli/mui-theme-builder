import type { ReactNode } from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise';
import { ArrowUUpLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowUUpLeft';
import { ArrowUUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUUpRight';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { ExportIcon } from '@phosphor-icons/react/dist/csr/Export';
import { SunIcon } from '@phosphor-icons/react/dist/csr/Sun';
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { PreviewBoundary } from '../../preview/PreviewBoundary';
import { PreviewProvider } from '../../preview/PreviewProvider';
import { useEditorState } from '../../state/editor-hooks';
import { PillTab, SearchBox, shellBorder } from './primitives';

// Right side of the v2 shell, from Figma frame 358:10: top bar, preview
// tabs (Components, Templates), search, and the component cards.
//
// Phase 1 is pure layout. The top bar buttons are inert, and the cards are
// static previews: each card body renders the real MUI component inside the
// existing PreviewProvider, so it reflects the current project and active
// mode from the same editor state as the original shell. Card organization,
// search, and filtering over a component registry arrive in Phase 3.

function ShellTopBar() {
  const { future, past } = useEditorState();

  return (
    <Box
      sx={{
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        display: 'flex',
        flexShrink: 0,
        height: 56,
        px: 1,
      }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {/* Light/dark switch, shown in its light position. */}
        <Box
          sx={{
            bgcolor: 'secondary.main',
            border: shellBorder,
            borderRadius: 999,
            flexShrink: 0,
            height: 24,
            position: 'relative',
            width: 44,
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              bgcolor: 'background.paper',
              borderRadius: '50%',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
              display: 'flex',
              height: 20,
              justifyContent: 'center',
              left: 2,
              position: 'absolute',
              top: 1,
              width: 20,
            }}
          >
            <SunIcon size={12} />
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'divider', height: 32, width: '1px' }} />

        <Stack direction="row">
          <IconButton aria-label="Undo" disabled={past.length === 0} size="small" sx={{ height: 36, width: 36 }}>
            <ArrowUUpLeftIcon size={16} />
          </IconButton>
          <IconButton aria-label="Redo" disabled={future.length === 0} size="small" sx={{ height: 36, width: 36 }}>
            <ArrowUUpRightIcon size={16} />
          </IconButton>
        </Stack>

        <Box sx={{ bgcolor: 'divider', height: 32, width: '1px' }} />

        <Button
          color="inherit"
          startIcon={<ArrowClockwiseIcon size={14} />}
          sx={{ color: 'text.secondary', height: 32, minHeight: 32 }}
        >
          Reset
        </Button>
      </Stack>

      <Button
        startIcon={<ExportIcon size={14} />}
        sx={{ height: 32, marginLeft: 'auto', minHeight: 32 }}
        variant="contained"
      >
        Export
      </Button>
    </Box>
  );
}

function PreviewTabs() {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0, height: 52, px: 1 }}>
      <PillTab active label="Components" />
      <PillTab label="Templates" />
    </Stack>
  );
}

interface PreviewCardProps {
  activeEdit?: boolean;
  children: ReactNode;
  title: string;
}

function PreviewCard({ activeEdit = false, children, title }: PreviewCardProps) {
  const { activeMode, project } = useEditorState();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: shellBorder,
        borderRadius: '12px',
        p: 2,
      }}
    >
      <Box sx={{ alignItems: 'flex-start', display: 'flex', height: 30 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', pt: 0.5 }}>
          {title}
        </Typography>
        <Button
          size="small"
          sx={{ borderRadius: '6px', height: 30, marginLeft: 'auto', minHeight: 30, px: 1.5 }}
          variant={activeEdit ? 'contained' : 'outlined'}
        >
          Edit
        </Button>
      </Box>
      <Box sx={{ mt: 2 }}>
        <PreviewBoundary>
          <PreviewProvider mode={activeMode} project={project}>
            <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
              {children}
            </Box>
          </PreviewProvider>
        </PreviewBoundary>
      </Box>
    </Box>
  );
}

function PreviewCards() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
        mt: 1.5,
      }}
    >
      <PreviewCard title="Autocomplete">
        <Typography sx={{ mb: 1 }} variant="body1">
          Label
        </Typography>
        <Autocomplete
          defaultValue="Option 1"
          options={['Option 1', 'Option 2', 'Option 3']}
          renderInput={(params) => <TextField {...params} />}
        />
      </PreviewCard>

      <PreviewCard activeEdit title="Button">
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button variant="contained">Button</Button>
          <Button variant="outlined">Button</Button>
          <Button variant="text">Button</Button>
        </Stack>
      </PreviewCard>

      <PreviewCard title="TextField">
        <Typography sx={{ mb: 1 }} variant="body1">
          Label
        </Typography>
        <TextField fullWidth helperText="Helper text" placeholder="Placeholder" />
      </PreviewCard>

      <PreviewCard title="Checkbox">
        <FormGroup>
          <FormControlLabel control={<Checkbox defaultChecked />} label="Checked" />
          <FormControlLabel control={<Checkbox />} label="Unchecked" />
        </FormGroup>
      </PreviewCard>
    </Box>
  );
}

export function PreviewArea() {
  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <ShellTopBar />
      <PreviewTabs />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        <SearchBox />
        <Box sx={{ alignItems: 'center', display: 'flex', mt: 1.5 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
            Inputs
          </Typography>
          <CaretDownIcon size={16} style={{ marginLeft: 'auto' }} />
        </Box>
        <PreviewCards />
      </Box>
    </Box>
  );
}
