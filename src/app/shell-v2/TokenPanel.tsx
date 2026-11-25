import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Box, Divider, InputBase, Menu, MenuItem, Stack, Typography } from '@mui/material';

import type { PaletteSettings } from '../../domain/palette.types';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type {
  PreviewMode,
  SemanticPaletteRole,
  SurfacePaletteRole,
} from '../../state/editor-state.types';
import { PillTab, SearchBox, shellBorder } from './primitives';
import { ResetProjectDialog } from './reset-project-dialog';
import { useProjectReset } from './use-project-reset';
import { RadiusPanel } from './RadiusPanel';
import { ShadowsPanel } from './ShadowsPanel';
import { SpacingPanel } from './SpacingPanel';
import { TypographyPanel } from './TypographyPanel';

// Left panel of the v2 shell, from Figma frame 358:10: preset row on top,
// then the token tab list (Color, Typography, Spacing, Radius, Shadows)
// and the active tab's panel (frames 294:152, 294:298, 294:444, 294:590
// for the Phase 2 tabs).
//
// The panels read the existing editor state so they show the current
// project's values, with the same fallback values the old shell's
// inspectors use. Tab selection is local UI state only. Phase 5 wired
// the panels: every control dispatches the same editor actions the old
// shell's inspectors use, so edits are undoable like all other edits.
// The preset row was wired earlier, in Phase 4 (see below).

const paletteDefaults = {
  light: {
    primary: '#171717',
    secondary: '#f5f5f5',
    error: '#dc2626',
    warning: '#ed6c02',
    info: '#0288d1',
    success: '#2e7d32',
    'background.default': '#ffffff',
    'background.paper': '#ffffff',
    'text.primary': '#0a0a0a',
    'text.secondary': '#737373',
    'text.disabled': '#a3a3a3',
    divider: '#e5e5e5',
  },
  dark: {
    primary: '#fafafa',
    secondary: '#262626',
    error: '#ef4444',
    warning: '#ffa726',
    info: '#29b6f6',
    success: '#66bb6a',
    'background.default': '#0a0a0a',
    'background.paper': '#0a0a0a',
    'text.primary': '#fafafa',
    'text.secondary': '#a3a3a3',
    'text.disabled': '#737373',
    divider: '#262626',
  },
} as const;

type PaletteDefaultKey = keyof (typeof paletteDefaults)['light'];

interface ColorRowData {
  label: string;
  value: string;
  // Which reducer action edits this row, mirroring the old shell's
  // PaletteInspector: semantic roles go through set-semantic-color,
  // everything else (text, backgrounds, divider) through
  // set-surface-color.
  kind: 'semantic' | 'surface';
  role: SemanticPaletteRole | SurfacePaletteRole;
}

interface ColorSectionData {
  title: string;
  rows: ColorRowData[];
}

function buildColorSections(
  palette: PaletteSettings | undefined,
  mode: PreviewMode,
): ColorSectionData[] {
  const defaults = paletteDefaults[mode];
  const pick = (override: string | undefined, key: PaletteDefaultKey) =>
    override ?? defaults[key];

  return [
    {
      title: 'Text',
      rows: [
        { label: 'Primary text', value: pick(palette?.text?.primary, 'text.primary'), kind: 'surface', role: 'text.primary' },
        { label: 'Secondary text', value: pick(palette?.text?.secondary, 'text.secondary'), kind: 'surface', role: 'text.secondary' },
        { label: 'Disabled text', value: pick(palette?.text?.disabled, 'text.disabled'), kind: 'surface', role: 'text.disabled' },
      ],
    },
    {
      title: 'Semantic colors',
      rows: [
        { label: 'Primary', value: pick(palette?.primary?.main, 'primary'), kind: 'semantic', role: 'primary' },
        { label: 'Secondary', value: pick(palette?.secondary?.main, 'secondary'), kind: 'semantic', role: 'secondary' },
        { label: 'Error', value: pick(palette?.error?.main, 'error'), kind: 'semantic', role: 'error' },
        { label: 'Warning', value: pick(palette?.warning?.main, 'warning'), kind: 'semantic', role: 'warning' },
        { label: 'Info', value: pick(palette?.info?.main, 'info'), kind: 'semantic', role: 'info' },
        { label: 'Success', value: pick(palette?.success?.main, 'success'), kind: 'semantic', role: 'success' },
      ],
    },
    {
      title: 'Surfaces',
      rows: [
        { label: 'Page background', value: pick(palette?.background?.default, 'background.default'), kind: 'surface', role: 'background.default' },
        { label: 'Surface', value: pick(palette?.background?.paper, 'background.paper'), kind: 'surface', role: 'background.paper' },
        { label: 'Divider', value: pick(palette?.divider, 'divider'), kind: 'surface', role: 'divider' },
      ],
    },
  ];
}

const presetDots = ['#171717', '#f5f5f5', '#f5f5f5', '#e5e5e5'];
const tokenTabs = ['Color', 'Typography', 'Spacing', 'Radius', 'Shadows'] as const;
type TokenTab = (typeof tokenTabs)[number];

// The preset selector is a real control (Phase 4): it opens a menu whose
// only entry today is the current preset, Default. Choosing it loads the
// default project through the shared reset flow (use-project-reset.ts),
// including the dirty confirm when there are edits to lose.
function PresetRow() {
  const { cancelReset, confirmOpen, confirmReset, requestReset } = useProjectReset();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const chooseDefault = () => {
    setAnchorEl(null);
    requestReset();
  };

  return (
    <>
      <Box
        aria-haspopup="menu"
        aria-label="Theme preset: Default"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        role="button"
        sx={{
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
          cursor: 'pointer',
          display: 'flex',
          flexShrink: 0,
          height: 56,
          px: 1.5,
        }}
      >
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
          {presetDots.map((color, index) => (
            <Box
              key={index}
              sx={{
                bgcolor: color,
                border: '1px solid #e5e5e5',
                borderRadius: '50%',
                height: 12,
                width: 12,
              }}
            />
          ))}
        </Stack>
        <Typography sx={{ fontSize: 14, lineHeight: '20px', ml: 1 }}>Default</Typography>
        <CaretDownIcon size={16} style={{ marginLeft: 'auto' }} />
      </Box>
      <Menu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={anchorEl !== null}>
        <MenuItem onClick={chooseDefault} selected>
          Default
        </MenuItem>
      </Menu>
      <ResetProjectDialog
        onCancel={cancelReset}
        onConfirm={confirmReset}
        open={confirmOpen}
      />
    </>
  );
}

function TokenTabList({
  activeTab,
  onSelect,
}: {
  activeTab: TokenTab;
  onSelect: (tab: TokenTab) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);

  // Each fade shows only while tabs are hidden on its side of the row:
  // the left fade appears once the row has scrolled away from the start,
  // the right fade disappears once the row reaches the end. Recomputed
  // on scroll and whenever the row's box changes size.
  const updateFades = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    setShowLeftFade(scroller.scrollLeft > 0);
    setShowRightFade(scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth);
  }, []);

  useEffect(() => {
    updateFades();
    const scroller = scrollRef.current;
    if (!scroller || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateFades);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [updateFades]);

  // Clicking a tab clipped at either edge scrolls the row just enough to
  // bring it fully into view, the same on both sides; a fully visible tab
  // does not move the row. The delta comes from the tab's and the
  // scroller's own bounding rects and is applied to the scroller only,
  // never through scrollIntoView, so the panel and the page stay put.
  // Activation happens exactly as before, scrolled or not.
  const handleSelect = (tab: TokenTab, event: ReactMouseEvent<HTMLElement>) => {
    const scroller = scrollRef.current;
    if (scroller) {
      const tabRect = event.currentTarget.getBoundingClientRect();
      const scrollerRect = scroller.getBoundingClientRect();
      let delta = 0;
      if (tabRect.left < scrollerRect.left) {
        delta = tabRect.left - scrollerRect.left;
      } else if (tabRect.right > scrollerRect.right) {
        delta = tabRect.right - scrollerRect.right;
      }
      if (delta !== 0) {
        scroller.scrollBy({ behavior: 'smooth', left: delta });
      }
    }
    onSelect(tab);
  };

  return (
    <Box sx={{ flexShrink: 0, height: 52, overflow: 'hidden', position: 'relative' }}>
      {/* The tab row overflows the 320px panel; it scrolls horizontally
          (scrollbar hidden) so every tab stays reachable, and a gradient
          fade sits above each edge that still has tabs hidden behind it. */}
      <Box
        data-testid="token-tab-scroller"
        onScroll={updateFades}
        ref={scrollRef}
        sx={{
          height: '100%',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack direction="row" spacing={0.75} sx={{ px: 1, py: 1.5, width: 'max-content' }}>
          {tokenTabs.map((tab) => (
            <PillTab
              active={tab === activeTab}
              key={tab}
              label={tab}
              onClick={(event) => handleSelect(tab, event)}
            />
          ))}
        </Stack>
      </Box>
      {showLeftFade && (
        <Box
          data-testid="token-tab-fade-left"
          sx={{
            background:
              'linear-gradient(to left, transparent, var(--mui-palette-background-paper))',
            bottom: 12,
            left: 0,
            pointerEvents: 'none',
            position: 'absolute',
            top: 12,
            width: 84,
          }}
        />
      )}
      {showRightFade && (
        <Box
          data-testid="token-tab-fade-right"
          sx={{
            background:
              'linear-gradient(to right, transparent, var(--mui-palette-background-paper))',
            bottom: 12,
            pointerEvents: 'none',
            position: 'absolute',
            right: 0,
            top: 12,
            width: 84,
          }}
        />
      )}
    </Box>
  );
}

function ModeSegmented({ activeMode }: { activeMode: PreviewMode }) {
  const dispatch = useEditorDispatch();
  const segment = (mode: PreviewMode, label: string) => (
    <Box
      aria-pressed={activeMode === mode}
      onClick={() => dispatch({ type: 'set-active-mode', mode })}
      role="button"
      sx={{
        alignItems: 'center',
        bgcolor: activeMode === mode ? 'background.paper' : 'transparent',
        borderRadius: '6px',
        boxShadow: activeMode === mode ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
        color: activeMode === mode ? 'text.primary' : 'text.secondary',
        cursor: 'pointer',
        display: 'flex',
        fontSize: 14,
        height: 25,
        justifyContent: 'center',
        lineHeight: '20px',
      }}
    >
      {label}
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: 'secondary.main',
        borderRadius: '8px',
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: '1fr 1fr',
        p: 0.5,
      }}
    >
      {segment('light', 'Light')}
      {segment('dark', 'Dark')}
    </Box>
  );
}

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

// Editable hex row (Phase 5), mirroring the old shell's ColorControl
// behavior: the hex shows as text in the frame's 78x32 box and clicking
// it turns the box into an input holding a local draft. A valid
// six-digit hex commits lowercased on blur (Enter blurs), and an invalid
// or partial draft reverts to the current value instead of dispatching.
// The parent keys each row by its committed value, so a commit or an
// undo remounts the row with a fresh draft, again like the old shell.
function ColorRow({ kind, label, role, value }: ColorRowData) {
  const { activeMode } = useEditorState();
  const dispatch = useEditorDispatch();
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);
  const valid = HEX_COLOR.test(draft);

  const commit = () => {
    setEditing(false);
    if (!valid) {
      setDraft(value);
      return;
    }
    const color = draft.toLowerCase();
    if (kind === 'semantic') {
      dispatch({ type: 'set-semantic-color', mode: activeMode, role: role as SemanticPaletteRole, color });
    } else {
      dispatch({ type: 'set-surface-color', mode: activeMode, role: role as SurfacePaletteRole, color });
    }
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 32 }}>
      <Box
        sx={{
          bgcolor: editing && valid ? draft : value,
          border: shellBorder,
          borderRadius: '6px',
          flexShrink: 0,
          height: 24,
          width: 24,
        }}
      />
      <Typography sx={{ fontSize: 14, lineHeight: '20px', ml: 1.5 }}>{label}</Typography>
      <Box
        onClick={() => {
          setDraft(value);
          setEditing(true);
        }}
        sx={{
          alignItems: 'center',
          border: shellBorder,
          borderRadius: '6px',
          cursor: 'text',
          display: 'flex',
          flexShrink: 0,
          height: 32,
          justifyContent: 'center',
          ml: 'auto',
          width: 78,
        }}
      >
        {editing ? (
          <InputBase
            autoFocus
            error={!valid}
            inputProps={{
              'aria-label': `${label} hex value`,
              style: { textAlign: 'center' },
            }}
            onBlur={commit}
            onChange={(event) => setDraft(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
            sx={{ fontSize: 14, lineHeight: '20px', width: '100%' }}
            value={draft}
          />
        ) : (
          <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{value}</Typography>
        )}
      </Box>
    </Box>
  );
}

// Sections collapse and expand locally (view state only, never in the
// project or the reducer); all three start expanded.
function ColorSection({ rows, title }: ColorSectionData) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Stack spacing={1.5}>
      <Box
        aria-expanded={expanded}
        onClick={() => setExpanded((previous) => !previous)}
        role="button"
        sx={{ alignItems: 'center', cursor: 'pointer', display: 'flex' }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
          {title}
        </Typography>
        <CaretDownIcon
          size={16}
          style={{
            marginLeft: 'auto',
            transform: expanded ? undefined : 'rotate(-90deg)',
          }}
        />
      </Box>
      {expanded &&
        rows.map((row) => (
          <ColorRow key={`${row.kind}-${row.role}-${row.value}`} {...row} />
        ))}
    </Stack>
  );
}

export function TokenPanel() {
  const { activeMode, project } = useEditorState();
  const [activeTab, setActiveTab] = useState<TokenTab>('Color');
  const [query, setQuery] = useState('');
  const palette = project.colorSchemes[activeMode].palette;

  // The panel search filters the Color tab's rows by token name and hex
  // value (the design spec); sections left with no matching row drop out
  // while a query is active. Other tabs ignore the query.
  const normalizedQuery = query.trim().toLowerCase();
  const sections = buildColorSections(palette, activeMode)
    .map((section) => ({
      ...section,
      rows:
        normalizedQuery === ''
          ? section.rows
          : section.rows.filter(
              (row) =>
                row.label.toLowerCase().includes(normalizedQuery) ||
                row.value.toLowerCase().includes(normalizedQuery),
            ),
    }))
    .filter((section) => section.rows.length > 0);

  return (
    <Box
      sx={{
        borderRight: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        height: '100%',
        overflow: 'hidden',
        width: 320,
      }}
    >
      <PresetRow />
      <TokenTabList activeTab={activeTab} onSelect={setActiveTab} />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        <SearchBox onChange={setQuery} value={query} />
        {activeTab === 'Color' && (
          <>
            <Box sx={{ mt: 1.5 }}>
              <ModeSegmented activeMode={activeMode} />
            </Box>
            <Stack divider={<Divider />} spacing={1.5} sx={{ mt: 1.5 }}>
              {sections.map((section) => (
                <ColorSection key={section.title} {...section} />
              ))}
            </Stack>
          </>
        )}
        {activeTab === 'Typography' && (
          <Box sx={{ mt: 1.5 }}>
            <TypographyPanel />
          </Box>
        )}
        {activeTab === 'Spacing' && (
          <Box sx={{ mt: 1.5 }}>
            <SpacingPanel />
          </Box>
        )}
        {activeTab === 'Radius' && (
          <Box sx={{ mt: 1.5 }}>
            <RadiusPanel />
          </Box>
        )}
        {activeTab === 'Shadows' && (
          <Box sx={{ mt: 1.5 }}>
            <ShadowsPanel />
          </Box>
        )}
      </Box>
    </Box>
  );
}
