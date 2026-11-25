import type { MouseEvent } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Box, InputBase, Typography } from '@mui/material';

import type { PreviewMode } from '../../state/editor-state.types';
import { shellBorderForMode } from './shell-border';

// Shared chrome pieces for the v2 shell, matching Figma frame 358:10:
// pill tabs (Inter 14/20, 12px horizontal and 4px vertical padding, 6px gap,
// active differs from inactive only in background and text color) and the
// 32px search box with a 1px shell border (shell-border.ts) and 6px radius.

interface PillTabProps {
  active?: boolean;
  label: string;
  // Handlers receive the click event so callers can inspect the clicked
  // element (the token tab row uses its rect to scroll it into view).
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export function PillTab({ active = false, label, onClick }: PillTabProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: active ? 'secondary.main' : 'transparent',
        borderRadius: 999,
        color: active ? 'text.primary' : 'text.secondary',
        cursor: onClick ? 'pointer' : undefined,
        flexShrink: 0,
        fontSize: 14,
        lineHeight: '20px',
        px: 1.5,
        py: 0.5,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}

interface SearchBoxProps {
  mode: PreviewMode;
  onChange?: (value: string) => void;
  value?: string;
}

// Without an onChange the box is the static Phase 1 placeholder. With one
// it is a real controlled search input (Phase 3 preview filtering).
export function SearchBox({ mode, onChange, value }: SearchBoxProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: shellBorderForMode(mode),
        borderRadius: '6px',
        display: 'flex',
        gap: 1,
        height: 32,
        px: 1.5,
      }}
    >
      <MagnifyingGlassIcon color="var(--shell-palette-text-secondary)" size={14} />
      {onChange ? (
        <InputBase
          inputProps={{ 'aria-label': 'Search' }}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search"
          sx={{ flex: 1, fontSize: 14, lineHeight: '20px' }}
          value={value ?? ''}
        />
      ) : (
        <Typography color="text.secondary" sx={{ fontSize: 14, lineHeight: '20px' }}>
          Search
        </Typography>
      )}
    </Box>
  );
}

// Shared pieces for the Phase 2 token panels, matching the v2 frames for
// the Typography, Spacing, Radius, and Shadows tabs (nodes 294:152,
// 294:298, 294:444, 294:590): 12px semibold secondary section labels, the
// 98x30 minus/value/plus stepper with a 1px shell border (shell-border.ts)
// and 6px radius, and the 28px preset pills (paper background with the
// shell border when inactive, #171717 with white text when active). Like
// SearchBox above, these take the mode as a prop so their borders follow
// the scheme-aware shared border instead of a fixed light-mode gray.

export function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      color="text.secondary"
      sx={{ fontSize: 12, fontWeight: 600, lineHeight: '15px' }}
    >
      {children}
    </Typography>
  );
}

interface StepperProps {
  mode: PreviewMode;
  value: string;
  // When both handlers are given, the minus and plus signs become real
  // buttons (Phase 5 wiring); without them the stepper is display only,
  // exactly as the Phase 2 panels rendered it.
  onDecrement?: () => void;
  onIncrement?: () => void;
  label?: string;
}

export function Stepper({ label, mode, onDecrement, onIncrement, value }: StepperProps) {
  const editable = onDecrement !== undefined && onIncrement !== undefined;
  const signSx = {
    alignItems: 'center',
    bgcolor: 'transparent',
    border: 0,
    color: 'text.secondary',
    display: 'flex',
    fontFamily: 'inherit',
    fontSize: 14,
    height: '100%',
    justifyContent: 'center',
    lineHeight: '20px',
    p: 0,
    width: 28,
  } as const;

  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.paper',
        border: shellBorderForMode(mode),
        borderRadius: '6px',
        display: 'flex',
        flexShrink: 0,
        height: 30,
        overflow: 'hidden',
        width: 98,
      }}
    >
      {editable ? (
        <Box
          aria-label={`Decrease ${label ?? 'value'}`}
          component="button"
          onClick={onDecrement}
          sx={{ ...signSx, cursor: 'pointer' }}
          type="button"
        >
          {'\u2212'}
        </Box>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ fontSize: 14, lineHeight: '20px', textAlign: 'center', width: 28 }}
        >
          {'\u2212'}
        </Typography>
      )}
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 500,
          lineHeight: '20px',
          textAlign: 'center',
          width: 40,
        }}
      >
        {value}
      </Typography>
      {editable ? (
        <Box
          aria-label={`Increase ${label ?? 'value'}`}
          component="button"
          onClick={onIncrement}
          sx={{ ...signSx, cursor: 'pointer' }}
          type="button"
        >
          +
        </Box>
      ) : (
        <Typography
          color="text.secondary"
          sx={{ fontSize: 14, lineHeight: '20px', textAlign: 'center', width: 28 }}
        >
          +
        </Typography>
      )}
    </Box>
  );
}

interface StepperRowProps {
  label: string;
  mode: PreviewMode;
  value: string;
  onDecrement?: () => void;
  onIncrement?: () => void;
}

// Label on the left in the 12px semibold secondary section style, stepper
// pinned to the right edge, as in the frames' global value rows.
export function StepperRow({ label, mode, onDecrement, onIncrement, value }: StepperRowProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
      <SectionLabel>{label}</SectionLabel>
      <Box sx={{ ml: 'auto' }}>
        <Stepper
          label={label}
          mode={mode}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          value={value}
        />
      </Box>
    </Box>
  );
}

// Same row with the label in the 14px regular style the frames use for the
// per-component override rows (Button, Card, Input).
export function ComponentStepperRow({
  label,
  mode,
  onDecrement,
  onIncrement,
  value,
}: StepperRowProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
      <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{label}</Typography>
      <Box sx={{ ml: 'auto' }}>
        <Stepper
          label={label}
          mode={mode}
          onDecrement={onDecrement}
          onIncrement={onIncrement}
          value={value}
        />
      </Box>
    </Box>
  );
}

interface PresetPillsProps {
  activeIndex: number;
  gap?: number;
  mode: PreviewMode;
  options: string[];
  // When given, the pills become buttons that report their index
  // (Phase 5 wiring); without it they render as the static Phase 2 pills.
  onSelect?: (index: number) => void;
}

export function PresetPills({ activeIndex, gap = 12, mode, onSelect, options }: PresetPillsProps) {
  return (
    <Box sx={{ display: 'flex', gap: `${gap}px` }}>
      {options.map((option, index) => {
        const active = index === activeIndex;
        return (
          <Box
            component={onSelect ? 'button' : 'div'}
            key={option}
            onClick={onSelect ? () => onSelect(index) : undefined}
            type={onSelect ? 'button' : undefined}
            sx={{
              alignItems: 'center',
              bgcolor: active ? 'primary.main' : 'background.paper',
              border: active ? '1px solid transparent' : shellBorderForMode(mode),
              borderRadius: 999,
              color: active ? 'primary.contrastText' : 'text.primary',
              cursor: onSelect ? 'pointer' : undefined,
              display: 'flex',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: 500,
              height: 28,
              justifyContent: 'center',
              lineHeight: '16px',
              px: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            {option}
          </Box>
        );
      })}
    </Box>
  );
}
