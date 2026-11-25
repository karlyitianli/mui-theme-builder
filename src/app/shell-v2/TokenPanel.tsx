import { useState } from 'react';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { Box, Divider, Stack, Typography } from '@mui/material';

import type { PaletteSettings } from '../../domain/palette.types';
import { useEditorState } from '../../state/editor-hooks';
import type { PreviewMode } from '../../state/editor-state.types';
import { PillTab, SearchBox, shellBorder } from './primitives';
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
// inspectors use. Tab selection is local UI state only: no control here
// dispatches changes yet; editing arrives in a later phase.

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
        { label: 'Primary text', value: pick(palette?.text?.primary, 'text.primary') },
        { label: 'Secondary text', value: pick(palette?.text?.secondary, 'text.secondary') },
        { label: 'Disabled text', value: pick(palette?.text?.disabled, 'text.disabled') },
      ],
    },
    {
      title: 'Semantic colors',
      rows: [
        { label: 'Primary', value: pick(palette?.primary?.main, 'primary') },
        { label: 'Secondary', value: pick(palette?.secondary?.main, 'secondary') },
        { label: 'Error', value: pick(palette?.error?.main, 'error') },
        { label: 'Warning', value: pick(palette?.warning?.main, 'warning') },
        { label: 'Info', value: pick(palette?.info?.main, 'info') },
        { label: 'Success', value: pick(palette?.success?.main, 'success') },
      ],
    },
    {
      title: 'Surfaces',
      rows: [
        { label: 'Page background', value: pick(palette?.background?.default, 'background.default') },
        { label: 'Surface', value: pick(palette?.background?.paper, 'background.paper') },
        { label: 'Divider', value: pick(palette?.divider, 'divider') },
      ],
    },
  ];
}

const presetDots = ['#171717', '#f5f5f5', '#f5f5f5', '#e5e5e5'];
const tokenTabs = ['Color', 'Typography', 'Spacing', 'Radius', 'Shadows'] as const;
type TokenTab = (typeof tokenTabs)[number];

function PresetRow() {
  return (
    <Box
      sx={{
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
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
  );
}

function TokenTabList({
  activeTab,
  onSelect,
}: {
  activeTab: TokenTab;
  onSelect: (tab: TokenTab) => void;
}) {
  return (
    <Box sx={{ flexShrink: 0, height: 52, overflow: 'hidden', position: 'relative' }}>
      {/* The tab row overflows the 320px panel; it scrolls horizontally
          (scrollbar hidden) so every tab stays reachable, and the frame's
          right-edge fade sits above it. */}
      <Box
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
              onClick={() => onSelect(tab)}
            />
          ))}
        </Stack>
      </Box>
      <Box
        sx={{
          background: 'linear-gradient(to right, transparent, var(--mui-palette-background-paper))',
          bottom: 12,
          pointerEvents: 'none',
          position: 'absolute',
          right: 0,
          top: 12,
          width: 84,
        }}
      />
    </Box>
  );
}

function ModeSegmented({ activeMode }: { activeMode: PreviewMode }) {
  const segment = (mode: PreviewMode, label: string) => (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: activeMode === mode ? 'background.paper' : 'transparent',
        borderRadius: '6px',
        boxShadow: activeMode === mode ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
        color: activeMode === mode ? 'text.primary' : 'text.secondary',
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

function ColorRow({ label, value }: ColorRowData) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 32 }}>
      <Box
        sx={{
          bgcolor: value,
          border: shellBorder,
          borderRadius: '6px',
          flexShrink: 0,
          height: 24,
          width: 24,
        }}
      />
      <Typography sx={{ fontSize: 14, lineHeight: '20px', ml: 1.5 }}>{label}</Typography>
      <Box
        sx={{
          alignItems: 'center',
          border: shellBorder,
          borderRadius: '6px',
          display: 'flex',
          flexShrink: 0,
          height: 32,
          justifyContent: 'center',
          ml: 'auto',
          width: 78,
        }}
      >
        <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{value}</Typography>
      </Box>
    </Box>
  );
}

function ColorSection({ rows, title }: ColorSectionData) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ alignItems: 'center', display: 'flex' }}>
        <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>
          {title}
        </Typography>
        <CaretDownIcon size={16} style={{ marginLeft: 'auto' }} />
      </Box>
      {rows.map((row) => (
        <ColorRow key={row.label} {...row} />
      ))}
    </Stack>
  );
}

export function TokenPanel() {
  const { activeMode, project } = useEditorState();
  const [activeTab, setActiveTab] = useState<TokenTab>('Color');
  const palette = project.colorSchemes[activeMode].palette;
  const sections = buildColorSections(palette, activeMode);

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
        <SearchBox />
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
