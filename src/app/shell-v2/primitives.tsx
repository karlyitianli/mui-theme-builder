import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass';
import { Box, InputBase, Typography } from '@mui/material';

// Shared chrome pieces for the v2 shell, matching Figma frame 358:10:
// pill tabs (Inter 14/20, 12px horizontal and 4px vertical padding, 6px gap,
// active differs from inactive only in background and text color) and the
// 32px search box with a 1px rgba(0,0,0,0.1) border and 6px radius.

export const shellBorder = '1px solid rgba(0, 0, 0, 0.1)';

interface PillTabProps {
  active?: boolean;
  label: string;
  onClick?: () => void;
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
  onChange?: (value: string) => void;
  value?: string;
}

// Without an onChange the box is the static Phase 1 placeholder. With one
// it is a real controlled search input (Phase 3 preview filtering).
export function SearchBox({ onChange, value }: SearchBoxProps) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        border: shellBorder,
        borderRadius: '6px',
        display: 'flex',
        gap: 1,
        height: 32,
        px: 1.5,
      }}
    >
      <MagnifyingGlassIcon color="var(--mui-palette-text-secondary)" size={14} />
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
// 98x30 minus/value/plus stepper with a 1px #e5e5e5 border and 6px radius,
// and the 28px preset pills (white with a #e5e5e5 border when inactive,
// #171717 with white text when active).

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

export function Stepper({ value }: { value: string }) {
  return (
    <Box
      sx={{
        alignItems: 'center',
        bgcolor: 'background.paper',
        border: '1px solid #e5e5e5',
        borderRadius: '6px',
        display: 'flex',
        flexShrink: 0,
        height: 30,
        overflow: 'hidden',
        width: 98,
      }}
    >
      <Typography
        color="text.secondary"
        sx={{ fontSize: 14, lineHeight: '20px', textAlign: 'center', width: 28 }}
      >
        {'\u2212'}
      </Typography>
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
      <Typography
        color="text.secondary"
        sx={{ fontSize: 14, lineHeight: '20px', textAlign: 'center', width: 28 }}
      >
        +
      </Typography>
    </Box>
  );
}

interface StepperRowProps {
  label: string;
  value: string;
}

// Label on the left in the 12px semibold secondary section style, stepper
// pinned to the right edge, as in the frames' global value rows.
export function StepperRow({ label, value }: StepperRowProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
      <SectionLabel>{label}</SectionLabel>
      <Box sx={{ ml: 'auto' }}>
        <Stepper value={value} />
      </Box>
    </Box>
  );
}

// Same row with the label in the 14px regular style the frames use for the
// per-component override rows (Button, Card, Input).
export function ComponentStepperRow({ label, value }: StepperRowProps) {
  return (
    <Box sx={{ alignItems: 'center', display: 'flex', height: 30 }}>
      <Typography sx={{ fontSize: 14, lineHeight: '20px' }}>{label}</Typography>
      <Box sx={{ ml: 'auto' }}>
        <Stepper value={value} />
      </Box>
    </Box>
  );
}

interface PresetPillsProps {
  activeIndex: number;
  gap?: number;
  options: string[];
}

export function PresetPills({ activeIndex, gap = 12, options }: PresetPillsProps) {
  return (
    <Box sx={{ display: 'flex', gap: `${gap}px` }}>
      {options.map((option, index) => {
        const active = index === activeIndex;
        return (
          <Box
            key={option}
            sx={{
              alignItems: 'center',
              bgcolor: active ? 'primary.main' : 'background.paper',
              border: active ? '1px solid transparent' : '1px solid #e5e5e5',
              borderRadius: 999,
              color: active ? 'primary.contrastText' : 'text.primary',
              display: 'flex',
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
