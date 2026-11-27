import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent as ReactMouseEvent } from 'react';
import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowCounterClockwise';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Box, Divider, IconButton, InputBase, Menu, MenuItem, Stack, Typography } from '@mui/material';

import { GREY_SHADES, resolveAction, resolveGrey } from '../../domain/palette-defaults';
import type {
  ActionColorKey,
  ActionOpacityKey,
  GreyShade,
  PaletteSettings,
} from '../../domain/palette.types';
import {
  findThemePreset,
  THEME_PRESETS,
  type ThemePresetId,
} from '../../domain/project';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type {
  PreviewMode,
  SemanticColorVariant,
  SemanticPaletteRole,
  SurfacePaletteRole,
} from '../../state/editor-state.types';
import {
  resolveSemanticColors,
  resolveSurfaceColors,
  type ResolvedSemanticColor,
  type ResolvedSurfaceColors,
} from '../../theme/create-runtime-theme';
import { PANEL_WIDTH_DEFAULT } from './panel-width';
import { PillTab, SearchBox } from './primitives';
import { shellBorderForMode } from './shell-border';
import { ColorPicker } from './ColorPicker';
import { ResetProjectDialog } from './reset-project-dialog';
import { useProjectReset } from './use-project-reset';
import { OtherPanel } from './OtherPanel';
import { RadiusPanel } from './RadiusPanel';
import { ShadowsPanel } from './ShadowsPanel';
import { SpacingPanel } from './SpacingPanel';
import { TypographyPanel } from './TypographyPanel';

// Left panel of the v2 shell, from Figma frame 358:10: preset row on top,
// then the token tab list (Color, Typography, Spacing, Radius, Shadows,
// and Other, added for task 3.5) and the active tab's panel (frames
// 294:152, 294:298, 294:444, 294:590 for the Phase 2 tabs).
//
// The panels read the existing editor state so they show the current
// project's values, with the same fallback values the old shell's
// inspectors use. Tab selection is local UI state only. Phase 5 wired
// the panels: every control dispatches the same editor actions the old
// shell's inspectors use, so edits are undoable like all other edits.
// The preset row was wired earlier, in Phase 4 (see below).

interface ColorRowData {
  label: string;
  value: string;
  // Which reducer action edits this row, mirroring the old shell's
  // PaletteInspector: semantic roles go through set-semantic-color,
  // everything else (text, backgrounds, divider) through
  // set-surface-color. The Grey and Action groups (task 3.6) have their
  // own actions, set-grey-color and set-action-color, keyed by shade
  // and action key instead of a role.
  kind: 'semantic' | 'surface' | 'grey' | 'action';
  role?: SemanticPaletteRole | SurfacePaletteRole;
  // Grey rows only: which shade of the ramp this row edits.
  shade?: GreyShade;
  // Action rows only: which action color this row edits.
  actionKey?: ActionColorKey;
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
  resolved: Record<SemanticPaletteRole, ResolvedSemanticColor>,
  surfaces: ResolvedSurfaceColors,
): ColorSectionData[] {
  // Every value the rows show comes from the resolved runtime theme
  // (the semantic resolution for the token rows, the surface
  // resolution for text, backgrounds, and divider), never from a
  // panel-side copy of the defaults (audit finding C1): the baseline
  // plus MUI's defaults, via the theme mapping, are the one source,
  // so a baseline change moves the panel, the preview, and the export
  // together. The project's stored values reach the rows through that
  // same resolution, which already layers them over the defaults.

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
        value: resolved[role].main,
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
        { label: 'Primary text', value: surfaces.text.primary, kind: 'surface', role: 'text.primary' },
        { label: 'Secondary text', value: surfaces.text.secondary, kind: 'surface', role: 'text.secondary' },
        { label: 'Disabled text', value: surfaces.text.disabled, kind: 'surface', role: 'text.disabled' },
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
        { label: 'Page background', value: surfaces.background.default, kind: 'surface', role: 'background.default' },
        { label: 'Surface', value: surfaces.background.paper, kind: 'surface', role: 'background.paper' },
        { label: 'Divider', value: surfaces.divider, kind: 'surface', role: 'divider' },
      ],
    },
    {
      // The grey ramp (task 3.6): the resolved values, MUI's defaults
      // until a shade is edited and stored. The ramp is the same in
      // both schemes, so the rows read identically under Light and
      // Dark; the edits still land per scheme.
      title: 'Grey',
      rows: GREY_SHADES.map((shade) => ({
        label: `Grey ${shade}`,
        value: resolveGrey(palette?.grey)[shade],
        kind: 'grey' as const,
        shade,
      })),
    },
  ];
}

interface OpacityRowData {
  opacityKey: ActionOpacityKey;
  label: string;
  value: number;
}

interface ActionSectionData {
  colorRows: ColorRowData[];
  opacityRows: OpacityRowData[];
}

const actionColorRowDefs: Array<{ key: ActionColorKey; label: string }> = [
  { key: 'active', label: 'Active' },
  { key: 'hover', label: 'Hover' },
  { key: 'selected', label: 'Selected' },
  { key: 'disabled', label: 'Disabled' },
  { key: 'disabledBackground', label: 'Disabled background' },
  { key: 'focus', label: 'Focus' },
];

const actionOpacityRowDefs: Array<{ key: ActionOpacityKey; label: string }> = [
  { key: 'hoverOpacity', label: 'Hover opacity' },
  { key: 'selectedOpacity', label: 'Selected opacity' },
  { key: 'disabledOpacity', label: 'Disabled opacity' },
  { key: 'focusOpacity', label: 'Focus opacity' },
  { key: 'activatedOpacity', label: 'Activated opacity' },
];

// The Action group (task 3.6) mixes color rows with opacity numbers,
// so it is built separately from the color-only sections above: the
// resolved action values for the scheme, MUI's defaults until edited.
function buildActionSection(
  palette: PaletteSettings | undefined,
  mode: PreviewMode,
): ActionSectionData {
  const action = resolveAction(mode, palette?.action);
  return {
    colorRows: actionColorRowDefs.map(({ key, label }) => ({
      label,
      value: action[key],
      kind: 'action' as const,
      actionKey: key,
    })),
    opacityRows: actionOpacityRowDefs.map(({ key, label }) => ({
      opacityKey: key,
      label,
      value: action[key],
    })),
  };
}

const tokenTabs = ['Color', 'Typography', 'Spacing', 'Radius', 'Shadows', 'Other'] as const;
type TokenTab = (typeof tokenTabs)[number];

// The preset selector (Phase 4, two presets since Nov 26, 2026): it
// opens a menu listing the presets (Black, the shadcn-styled baseline,
// and Default, MUI's actual defaults; see theme-presets.ts). Choosing
// one loads that preset's project through the shared reset flow
// (use-project-reset.ts), including the dirty confirm when there are
// edits to lose. Choosing Black is the reset flow's plain reset. The
// row shows the session's active preset from the editor state, with
// that preset's swatch dots.
function PresetRow({ mode }: { mode: PreviewMode }) {
  const { activePreset } = useEditorState();
  const { cancelReset, confirmOpen, confirmReset, requestPreset, requestReset } =
    useProjectReset();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const preset = findThemePreset(activePreset);

  const choose = (id: ThemePresetId) => {
    setAnchorEl(null);
    if (id === 'black') {
      requestReset();
    } else {
      requestPreset(id);
    }
  };

  return (
    <>
      <Box
        aria-haspopup="menu"
        aria-label={`Theme preset: ${preset.name}`}
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
          {preset.dots.map((color, index) => (
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
        <Typography sx={{ fontSize: 14, lineHeight: '20px', ml: 1 }}>{preset.name}</Typography>
        <CaretDownIcon size={16} style={{ marginLeft: 'auto' }} />
      </Box>
      <Menu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={anchorEl !== null}>
        {THEME_PRESETS.map((entry) => (
          <MenuItem
            key={entry.id}
            onClick={() => choose(entry.id)}
            selected={entry.id === activePreset}
          >
            {entry.name}
          </MenuItem>
        ))}
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
      {/* The tab row overflows the panel at its narrower widths; it
          scrolls horizontally (scrollbar hidden) so every tab stays
          reachable, and a gradient fade sits above each edge that
          still has tabs hidden behind it. */}
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
  actionKey,
  auto,
  kind,
  label,
  onClosePicker,
  onOpenPicker,
  pickerAnchor,
  pickerOpen,
  role,
  shade,
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
    } else if (kind === 'grey' && shade !== undefined) {
      dispatch({ type: 'set-grey-color', mode: activeMode, shade, color });
    } else if (kind === 'action' && actionKey !== undefined) {
      dispatch({ type: 'set-action-color', mode: activeMode, key: actionKey, color });
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
          const rowKey = `${row.kind}-${row.role ?? ''}-${row.variant ?? ''}-${row.shade ?? ''}-${row.actionKey ?? ''}`;
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

// An Action opacity row: label on the left, a bordered box on the
// right in the hex box's 78x32 shape. It follows the Other tab's
// numeric-field pattern (commit on blur or Enter, invalid entries
// ignored and reverted), except opacities are decimals, so the value
// is clamped to 0 to 1 rather than rounded to an integer.
function OpacityRow({ label, opacityKey, value }: OpacityRowData) {
  const { activeMode } = useEditorState();
  const dispatch = useEditorDispatch();

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const parsed = Number(event.target.value);
    if (Number.isFinite(parsed) && event.target.value.trim() !== '') {
      dispatch({
        type: 'set-action-opacity',
        mode: activeMode,
        key: opacityKey,
        value: Math.min(1, Math.max(0, parsed)),
      });
    } else {
      // Not a number: ignore the entry and show the stored value again.
      event.target.value = String(value);
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 32 }}>
      <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{label}</Typography>
      <Box
        sx={{
          alignItems: 'center',
          border: shellBorderForMode(activeMode),
          borderRadius: '6px',
          display: 'flex',
          flexShrink: 0,
          height: 32,
          justifyContent: 'center',
          ml: 'auto',
          width: 78,
        }}
      >
        <InputBase
          key={value}
          defaultValue={String(value)}
          inputProps={{ 'aria-label': `${label} value` }}
          onBlur={commit}
          onKeyDown={onKeyDown}
          sx={{
            fontSize: 14,
            lineHeight: '20px',
            '& input': { p: 0, textAlign: 'center' },
          }}
        />
      </Box>
    </Box>
  );
}

// An Action color row: swatch and label on one line, the color string
// in a full-width bordered field under it, the Other tab's easing-row
// shape. The text field is deliberate, not a fallback: MUI's action
// defaults are alpha-bearing rgba strings (rgba(0, 0, 0, 0.04) and
// kin), and the shared color picker is hex-only by design (Karl's
// Nov 25, 2026 picker: HEX field, no opacity slider), so it cannot
// represent them; converting them to hex would change the resolved
// theme. A text field commits any CSS color string (hex included) on
// blur or Enter as one undoable edit, and an empty entry reverts.
function ActionColorRow({ actionKey, label, value }: ColorRowData) {
  const { activeMode } = useEditorState();
  const dispatch = useEditorDispatch();

  const commit = (event: FocusEvent<HTMLInputElement>) => {
    const next = event.target.value.trim();
    if (next !== '' && actionKey !== undefined) {
      dispatch({ type: 'set-action-color', mode: activeMode, key: actionKey, color: next });
    } else {
      event.target.value = value;
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') event.currentTarget.blur();
  };

  return (
    <Stack spacing={0.75}>
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
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
      </Box>
      <Box
        sx={{
          alignItems: 'center',
          bgcolor: 'background.paper',
          border: shellBorderForMode(activeMode),
          borderRadius: '6px',
          display: 'flex',
          height: 32,
          px: 1,
        }}
      >
        <InputBase
          key={value}
          defaultValue={value}
          fullWidth
          inputProps={{ 'aria-label': `${label} value` }}
          onBlur={commit}
          onKeyDown={onKeyDown}
          sx={{ fontSize: 13, fontWeight: 500, lineHeight: '20px', '& input': { p: 0 } }}
        />
      </Box>
    </Stack>
  );
}

// The Action section: color rows through ActionColorRow and opacity
// rows through OpacityRow. Collapse is local view state, like the
// other Color sections.
function ActionSection({ colorRows, opacityRows }: ActionSectionData) {
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
          Action
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
        colorRows.map((row) => <ActionColorRow key={row.actionKey} {...row} />)}
      {expanded &&
        opacityRows.map((row) => <OpacityRow key={row.opacityKey} {...row} />)}
    </Stack>
  );
}

export function TokenPanel({ width = PANEL_WIDTH_DEFAULT }: { width?: number }) {
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
  const resolvedSurfaces = useMemo(
    () => resolveSurfaceColors(project, activeMode),
    [project, activeMode],
  );

  // The panel search filters the Color tab's rows by token name and hex
  // value (the design spec); sections left with no matching row drop out
  // while a query is active. Other tabs ignore the query.
  const normalizedQuery = query.trim().toLowerCase();
  const sections = buildColorSections(palette, resolvedSemantic, resolvedSurfaces)
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

  // The Action section filters by the same rule (name or value, with
  // opacity values matched as their decimal text) and drops out when
  // neither a color row nor an opacity row matches.
  const actionData = buildActionSection(palette, activeMode);
  const filteredAction: ActionSectionData =
    normalizedQuery === ''
      ? actionData
      : {
          colorRows: actionData.colorRows.filter(
            (row) =>
              row.label.toLowerCase().includes(normalizedQuery) ||
              row.value.toLowerCase().includes(normalizedQuery),
          ),
          opacityRows: actionData.opacityRows.filter(
            (row) =>
              row.label.toLowerCase().includes(normalizedQuery) ||
              String(row.value).includes(normalizedQuery),
          ),
        };
  const actionVisible =
    filteredAction.colorRows.length > 0 || filteredAction.opacityRows.length > 0;

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
        width,
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
              {actionVisible && <ActionSection {...filteredAction} />}
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
        {activeTab === 'Other' && (
          <Box sx={{ mt: 1.5 }}>
            <OtherPanel />
          </Box>
        )}
      </Box>
    </Box>
  );
}
