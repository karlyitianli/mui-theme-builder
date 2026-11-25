import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Box, Divider, IconButton, Menu, MenuItem, Stack, Typography } from '@mui/material';

import type { PaletteSettings } from '../../domain/palette.types';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type {
  PreviewMode,
  SemanticColorVariant,
  SemanticPaletteRole,
  SurfacePaletteRole,
} from '../../state/editor-state.types';
import {
  resolveSemanticColors,
  type ResolvedSemanticColor,
} from '../../theme/create-runtime-theme';
import { PillTab, SearchBox } from './primitives';
import { shellBorderForMode } from './shell-border';
import { ColorPicker } from './ColorPicker';
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
  // Semantic rows only: which variant of the token this row edits.
  variant?: SemanticColorVariant;
  // Semantic light and dark rows only: true while the variant is not
  // stored in the project, so the row shows the value MUI derives from
  // main (with an Auto marker) instead of a pinned value (which gets a
  // reset-to-auto control instead).
  auto?: boolean;
}

interface ColorSectionData {
  title: string;
  rows: ColorRowData[];
}

function buildColorSections(
  palette: PaletteSettings | undefined,
  mode: PreviewMode,
  resolved: Record<SemanticPaletteRole, ResolvedSemanticColor>,
): ColorSectionData[] {
  const defaults = paletteDefaults[mode];
  const pick = (override: string | undefined, key: PaletteDefaultKey) =>
    override ?? defaults[key];

  // Each semantic token gets a Main row plus Light and Dark rows. A
  // variant the project stores shows the stored value as a pinned row;
  // an unstored variant shows the value the runtime theme derives from
  // main, marked auto. Editing an auto row pins the edited value, and a
  // pinned row's reset control unpins it back to the derived value.
  const semanticRows = (role: SemanticPaletteRole, name: string): ColorRowData[] => {
    const stored = palette?.[role];
    return [
      {
        label: name,
        value: pick(stored?.main, role),
        kind: 'semantic',
        role,
        variant: 'main',
      },
      {
        label: `${name} light`,
        value: stored?.light ?? resolved[role].light,
        kind: 'semantic',
        role,
        variant: 'light',
        auto: stored?.light === undefined,
      },
      {
        label: `${name} dark`,
        value: stored?.dark ?? resolved[role].dark,
        kind: 'semantic',
        role,
        variant: 'dark',
        auto: stored?.dark === undefined,
      },
    ];
  };

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
        ...semanticRows('primary', 'Primary'),
        ...semanticRows('secondary', 'Secondary'),
        ...semanticRows('error', 'Error'),
        ...semanticRows('warning', 'Warning'),
        ...semanticRows('info', 'Info'),
        ...semanticRows('success', 'Success'),
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
function PresetRow({ mode }: { mode: PreviewMode }) {
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
                border: shellBorderForMode(mode),
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
              'linear-gradient(to left, transparent, var(--shell-palette-background-paper))',
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
              'linear-gradient(to right, transparent, var(--shell-palette-background-paper))',
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

function ModeSegmented({
  activeMode,
  onModeChange,
}: {
  activeMode: PreviewMode;
  onModeChange?: () => void;
}) {
  const dispatch = useEditorDispatch();
  const segment = (mode: PreviewMode, label: string) => (
    <Box
      aria-pressed={activeMode === mode}
      onClick={() => {
        dispatch({ type: 'set-active-mode', mode });
        onModeChange?.();
      }}
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

// A color row: swatch and label on the left, the frame's 78x32 hex box
// on the right. Clicking the hex box opens the ColorPicker popover for
// this row (see ColorPicker.tsx); the picker owns the draft and commits
// through the same actions the old shell's PaletteInspector uses,
// semantic roles through set-semantic-color and everything else (text,
// backgrounds, divider) through set-surface-color, so a committed pick
// is one undoable edit like every other edit. Which row's picker is
// open lives in TokenPanel, so only one picker is ever open and
// clicking another row's hex box moves it there.
//
// Semantic light and dark rows are variant rows: while the variant is
// unpinned the row shows MUI's derived value with an Auto marker, and
// committing the picker pins the edited value; a pinned variant row
// trades the marker for a reset control that unpins it (one undoable
// clear-semantic-color-variant edit).
interface ColorRowProps extends ColorRowData {
  onClosePicker: () => void;
  onOpenPicker: (anchor: HTMLElement) => void;
  pickerAnchor: HTMLElement | null;
  pickerOpen: boolean;
}

function ColorRow({
  auto,
  kind,
  label,
  onClosePicker,
  onOpenPicker,
  pickerAnchor,
  pickerOpen,
  role,
  value,
  variant,
}: ColorRowProps) {
  const { activeMode } = useEditorState();
  const dispatch = useEditorDispatch();

  const commit = (color: string) => {
    if (kind === 'semantic') {
      dispatch({
        type: 'set-semantic-color',
        mode: activeMode,
        role: role as SemanticPaletteRole,
        variant: variant ?? 'main',
        color,
      });
    } else {
      dispatch({ type: 'set-surface-color', mode: activeMode, role: role as SurfacePaletteRole, color });
    }
  };

  const clearVariant = () => {
    if (variant !== 'light' && variant !== 'dark') return;
    dispatch({
      type: 'clear-semantic-color-variant',
      mode: activeMode,
      role: role as SemanticPaletteRole,
      variant,
    });
  };

  const pinnedVariant =
    kind === 'semantic' && (variant === 'light' || variant === 'dark') && !auto;

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 32 }}>
      <Box
        sx={{
          bgcolor: value,
          border: shellBorderForMode(activeMode),
          borderRadius: '6px',
          flexShrink: 0,
          height: 24,
          width: 24,
        }}
      />
      <Typography sx={{ fontSize: 14, lineHeight: '20px', ml: 1.5 }}>{label}</Typography>
      {auto && (
        <Typography sx={{ color: 'text.secondary', fontSize: 12, lineHeight: '20px', ml: 1 }}>
          Auto
        </Typography>
      )}
      <Box sx={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: 0.5, ml: 'auto' }}>
        {pinnedVariant && (
          <IconButton
            aria-label={`Reset ${label} to auto`}
            onClick={clearVariant}
            size="small"
            sx={{ color: 'text.secondary', p: 0.5 }}
            title={`Reset ${label} to auto`}
          >
            <ArrowCounterClockwiseIcon size={16} />
          </IconButton>
        )}
        <Box
          onClick={(event) => onOpenPicker(event.currentTarget)}
          sx={{
            alignItems: 'center',
            border: shellBorderForMode(activeMode),
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            flexShrink: 0,
            height: 32,
            justifyContent: 'center',
            width: 78,
          }}
        >
          <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{value}</Typography>
        </Box>
      </Box>
      {pickerOpen && pickerAnchor && (
        <ColorPicker
          anchorEl={pickerAnchor}
          label={label}
          mode={activeMode}
          onClose={onClosePicker}
          onCommit={commit}
          value={value}
        />
      )}
    </Box>
  );
}

// Sections collapse and expand locally (view state only, never in the
// project or the reducer); all three start expanded. Rows are keyed by
// kind, role, and variant, not by value, so a row (and the hex box a
// picker is anchored to) survives the commits the picker makes.
interface ColorSectionProps extends ColorSectionData {
  onClosePicker: () => void;
  onOpenPicker: (rowKey: string, anchor: HTMLElement) => void;
  pickerAnchor: HTMLElement | null;
  pickerRowKey: string | null;
}

function ColorSection({
  onClosePicker,
  onOpenPicker,
  pickerAnchor,
  pickerRowKey,
  rows,
  title,
}: ColorSectionProps) {
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
        rows.map((row) => {
          const rowKey = `${row.kind}-${row.role}-${row.variant ?? 'main'}`;
          return (
            <ColorRow
              key={rowKey}
              {...row}
              onClosePicker={onClosePicker}
              onOpenPicker={(anchor) => onOpenPicker(rowKey, anchor)}
              pickerAnchor={pickerRowKey === rowKey ? pickerAnchor : null}
              pickerOpen={pickerRowKey === rowKey}
            />
          );
        })}
    </Stack>
  );
}

export function TokenPanel() {
  const { activeMode, project } = useEditorState();
  const [activeTab, setActiveTab] = useState<TokenTab>('Color');
  const [query, setQuery] = useState('');
  const [pickerRowKey, setPickerRowKey] = useState<string | null>(null);
  const [pickerAnchor, setPickerAnchor] = useState<HTMLElement | null>(null);
  const palette = project.colorSchemes[activeMode].palette;

  const openPicker = (rowKey: string, anchor: HTMLElement) => {
    setPickerRowKey(rowKey);
    setPickerAnchor(anchor);
  };

  const closePicker = () => {
    setPickerRowKey(null);
    setPickerAnchor(null);
  };

  // The picker shows one row's color in one scheme, so the interactions
  // that change what the rows show (switching tab or scheme, filtering
  // with a search) close it instead of leaving it anchored to a row
  // that moved or now shows another color.
  const handleSelectTab = (tab: TokenTab) => {
    setActiveTab(tab);
    closePicker();
  };

  const handleQuery = (value: string) => {
    setQuery(value);
    closePicker();
  };

  // The derived light and dark values the auto rows show, resolved from
  // the same runtime theme the preview renders with, so they track main
  // edits exactly. Rebuilt when the project or the scheme changes.
  const resolvedSemantic = useMemo(
    () => resolveSemanticColors(project, activeMode),
    [project, activeMode],
  );

  // The panel search filters the Color tab's rows by token name and hex
  // value (the design spec); sections left with no matching row drop out
  // while a query is active. Other tabs ignore the query.
  const normalizedQuery = query.trim().toLowerCase();
  const sections = buildColorSections(palette, activeMode, resolvedSemantic)
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
      <PresetRow mode={activeMode} />
      <TokenTabList activeTab={activeTab} onSelect={handleSelectTab} />
      <Box sx={{ flex: 1, overflowY: 'auto', px: 1, pb: 2 }}>
        <SearchBox mode={activeMode} onChange={handleQuery} value={query} />
        {activeTab === 'Color' && (
          <>
            <Box sx={{ mt: 1.5 }}>
              <ModeSegmented activeMode={activeMode} onModeChange={closePicker} />
            </Box>
            <Stack divider={<Divider />} spacing={1.5} sx={{ mt: 1.5 }}>
              {sections.map((section) => (
                <ColorSection
                  key={section.title}
                  {...section}
                  onClosePicker={closePicker}
                  onOpenPicker={openPicker}
                  pickerAnchor={pickerAnchor}
                  pickerRowKey={pickerRowKey}
                />
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
