import { useState, type ReactNode } from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise';
import { ArrowUUpLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowUUpLeft';
import { ArrowUUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUUpRight';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { ExportIcon } from '@phosphor-icons/react/dist/csr/Export';
import { MoonIcon } from '@phosphor-icons/react/dist/csr/Moon';
import { SunIcon } from '@phosphor-icons/react/dist/csr/Sun';
import { Box, Button, IconButton, Stack, Typography } from '@mui/material';

import { GeneratedCodeDrawer } from '../../generator/GeneratedCodeDrawer';
import { PreviewBoundary } from '../../preview/PreviewBoundary';
import { PreviewProvider } from '../../preview/PreviewProvider';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import {
  filterPreviewComponents,
  groupPreviewComponents,
  PREVIEW_COMPONENTS,
  type PreviewComponentEntry,
} from './component-registry';
import { PillTab, SearchBox } from './primitives';
import { shellBorderForMode } from './shell-border';
import { ResetProjectDialog } from './reset-project-dialog';
import { useProjectReset } from './use-project-reset';

// Right side of the v2 shell, from Figma frame 358:10: top bar, preview
// tabs (Components, Templates), search, and the component cards.
//
// Phase 4 wired the top bar: the light/dark switch dispatches
// set-active-mode, Undo and Redo dispatch the reducer's history actions,
// Reset goes through the shared reset flow (use-project-reset.ts), and
// Export opens the existing GeneratedCodeDrawer over the current project.
// Phase 3 made the preview area real: the Components tab renders the
// component registry (component-registry.tsx) as pure preview cards
// grouped under collapsible category headers, the search box filters the
// registry by name, and the Templates tab shows four stub cards. Each
// card body renders the real MUI component inside the existing
// PreviewProvider, so it reflects the current project and active mode
// from the same editor state as the original shell.

function ShellTopBar() {
  const { activeMode, future, past, project } = useEditorState();
  const dispatch = useEditorDispatch();
  const { cancelReset, confirmOpen, confirmReset, requestReset } = useProjectReset();
  const [codeOpen, setCodeOpen] = useState(false);

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
        {/* Light/dark switch: dispatches set-active-mode with the other
            mode; the knob and icon follow the active mode. */}
        <Box
          aria-checked={activeMode === 'dark'}
          aria-label="Toggle preview mode"
          onClick={() =>
            dispatch({
              type: 'set-active-mode',
              mode: activeMode === 'light' ? 'dark' : 'light',
            })
          }
          role="switch"
          sx={{
            bgcolor: 'secondary.main',
            border: shellBorderForMode(activeMode),
            borderRadius: 999,
            cursor: 'pointer',
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
              left: activeMode === 'light' ? 2 : 22,
              position: 'absolute',
              top: 1,
              transition: 'left 150ms ease',
              width: 20,
            }}
          >
            {activeMode === 'light' ? <SunIcon size={12} /> : <MoonIcon size={12} />}
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'divider', height: 32, width: '1px' }} />

        <Stack direction="row">
          <IconButton
            aria-label="Undo"
            disabled={past.length === 0}
            onClick={() => dispatch({ type: 'undo' })}
            size="small"
            sx={{ height: 36, width: 36 }}
          >
            <ArrowUUpLeftIcon size={16} />
          </IconButton>
          <IconButton
            aria-label="Redo"
            disabled={future.length === 0}
            onClick={() => dispatch({ type: 'redo' })}
            size="small"
            sx={{ height: 36, width: 36 }}
          >
            <ArrowUUpRightIcon size={16} />
          </IconButton>
        </Stack>

        <Box sx={{ bgcolor: 'divider', height: 32, width: '1px' }} />

        <Button
          color="inherit"
          onClick={requestReset}
          startIcon={<ArrowClockwiseIcon size={14} />}
          sx={{ color: 'text.secondary', height: 32, minHeight: 32 }}
        >
          Reset
        </Button>
      </Stack>

      <Button
        onClick={() => setCodeOpen(true)}
        startIcon={<ExportIcon size={14} />}
        sx={{ height: 32, marginLeft: 'auto', minHeight: 32 }}
        variant="contained"
      >
        Export
      </Button>

      <ResetProjectDialog
        onCancel={cancelReset}
        onConfirm={confirmReset}
        open={confirmOpen}
      />
      <GeneratedCodeDrawer onClose={() => setCodeOpen(false)} open={codeOpen} project={project} />
    </Box>
  );
}

type PreviewTabId = 'components' | 'templates';

interface PreviewTabsProps {
  active: PreviewTabId;
  onChange: (tab: PreviewTabId) => void;
}

function PreviewTabs({ active, onChange }: PreviewTabsProps) {
  return (
    <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0, height: 52, px: 1 }}>
      <PillTab active={active === 'components'} label="Components" onClick={() => onChange('components')} />
      <PillTab active={active === 'templates'} label="Templates" onClick={() => onChange('templates')} />
    </Stack>
  );
}

interface CardShellProps {
  children: ReactNode;
  title: string;
}

// Card chrome from the Figma cards frame: white surface, 1px border, 12px
// radius, header row with the name only. Cards are pure preview, so there
// is deliberately no edit button (overrides are parked, Nov 25, 2026).
function CardShell({ children, title }: CardShellProps) {
  const { activeMode } = useEditorState();

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: shellBorderForMode(activeMode),
        borderRadius: '12px',
        p: 2,
      }}
    >
      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
        {title}
      </Typography>
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Box>
  );
}

function PreviewCard({ entry }: { entry: PreviewComponentEntry }) {
  const { activeMode, project } = useEditorState();

  return (
    <CardShell title={entry.name}>
      <PreviewBoundary>
        <PreviewProvider mode={activeMode} project={project}>
          <Box sx={{ bgcolor: 'background.default', color: 'text.primary' }}>
            {entry.render()}
          </Box>
        </PreviewProvider>
      </PreviewBoundary>
    </CardShell>
  );
}

interface CategorySectionProps {
  category: string;
  collapsed: boolean;
  entries: PreviewComponentEntry[];
  onToggle: () => void;
}

function CategorySection({ category, collapsed, entries, onToggle }: CategorySectionProps) {
  return (
    <Box>
      <Box
        onClick={onToggle}
        sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex' }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
          {category}
        </Typography>
        <CaretDownIcon
          size={16}
          style={{
            marginLeft: 'auto',
            transform: collapsed ? 'rotate(-90deg)' : undefined,
          }}
        />
      </Box>
      {!collapsed && (
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
            mt: 1.5,
          }}
        >
          {entries.map((entry) => (
            <PreviewCard entry={entry} key={entry.id} />
          ))}
        </Box>
      )}
    </Box>
  );
}

function ComponentsView() {
  const { activeMode } = useEditorState();
  const [query, setQuery] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<ReadonlySet<string>>(
    new Set(),
  );

  const filtered = filterPreviewComponents(PREVIEW_COMPONENTS, query);
  const groups = groupPreviewComponents(filtered);

  const toggleCategory = (category: string) => {
    setCollapsedCategories((previous) => {
      const next = new Set(previous);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  return (
    <>
      <SearchBox mode={activeMode} onChange={setQuery} value={query} />
      {filtered.length === 0 ? (
        <Typography
          color="text.secondary"
          sx={{ fontSize: 14, lineHeight: '20px', mt: 1.5 }}
        >
          No components match
        </Typography>
      ) : (
        groups.map((group, index) => (
          <Box key={group.category} sx={{ mt: index === 0 ? 1.5 : 3 }}>
            <CategorySection
              category={group.category}
              collapsed={collapsedCategories.has(group.category)}
              entries={group.entries}
              onToggle={() => toggleCategory(group.category)}
            />
          </Box>
        ))
      )}
    </>
  );
}

const TEMPLATE_STUBS = ['Sign up', 'Dashboard', 'Marketing', 'Checkout'];

function TemplatesView() {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
      }}
    >
      {TEMPLATE_STUBS.map((name) => (
        <CardShell key={name} title={name}>
          <Typography color="text.secondary" sx={{ fontSize: 14, lineHeight: '20px' }}>
            Not built yet
          </Typography>
        </CardShell>
      ))}
    </Box>
  );
}

export function PreviewArea() {
  const [tab, setTab] = useState<PreviewTabId>('components');

  return (
    <Box sx={{ display: 'flex', flex: 1, flexDirection: 'column', height: '100%', minWidth: 0 }}>
      <ShellTopBar />
      <PreviewTabs active={tab} onChange={setTab} />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        {tab === 'components' ? <ComponentsView /> : <TemplatesView />}
      </Box>
    </Box>
  );
}
