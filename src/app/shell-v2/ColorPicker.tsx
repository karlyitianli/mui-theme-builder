import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { Box, ClickAwayListener, InputBase, Paper, Popper, Typography } from '@mui/material';

import type { PreviewMode } from '../../state/editor-state.types';
import { HEX_COLOR, hexToHsv, hsvToHex } from './color-utils';
import type { HsvColor } from './color-utils';
import { shellBorderForMode } from './shell-border';

// Color picker popover for the Color tab's rows, following Karl's
// screenshot (Nov 25, 2026): a saturation/value square, a hue slider
// with a live preview swatch, and a HEX field under them. HEX is the
// only format shown: the project model stores opaque six-digit hex, so
// there is no format switcher, no HSL/RGB fields, no opacity slider,
// and no eyedropper.
//
// The picker owns a local HSV draft. Drags on the square or slider and
// edits in the HEX field move the thumbs, the preview swatch, and the
// field's text live, but nothing reaches the project until a drag ends
// (pointer up) or the HEX field commits (blur or Enter) with a valid
// six-digit hex, so one gesture is one undo step. An invalid or partial
// hex reverts to the draft color without dispatching, and closing the
// popover (Esc or clicking away) discards any uncommitted hex text.
// The parent renders this only while its row is the open one, so the
// draft initializes from the row's current color on every open.

interface ColorPickerProps {
  anchorEl: HTMLElement;
  label: string;
  mode: PreviewMode;
  onClose: () => void;
  onCommit: (color: string) => void;
  value: string;
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

const thumbSx = {
  border: '2px solid #ffffff',
  borderRadius: '50%',
  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.35)',
  height: 14,
  pointerEvents: 'none',
  position: 'absolute',
  transform: 'translate(-50%, -50%)',
  width: 14,
} as const;

export function ColorPicker({ anchorEl, label, mode, onClose, onCommit, value }: ColorPickerProps) {
  const [hsv, setHsv] = useState<HsvColor>(() => hexToHsv(value));
  const [hexText, setHexText] = useState(value);
  const hsvRef = useRef(hsv);
  const lastCommittedRef = useRef(value);
  const dragTargetRef = useRef<'hue' | 'square' | null>(null);
  const hexValid = HEX_COLOR.test(hexText);
  const draftHex = hsvToHex(hsv);

  // Popper has no built-in Esc handling, so listen for it directly.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const applyHsv = (next: HsvColor) => {
    hsvRef.current = next;
    setHsv(next);
    setHexText(hsvToHex(next));
  };

  // Dispatch at most once per distinct color, so a commit repeated by a
  // blur right after Enter (or a drag that ends where it started) does
  // not add an empty undo step.
  const commitHex = (hex: string) => {
    if (hex === lastCommittedRef.current) return;
    lastCommittedRef.current = hex;
    onCommit(hex);
  };

  const capturePointer = (event: ReactPointerEvent<HTMLElement>) => {
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers (tests) and some browsers reject capture; the
      // drag still works from the element's own pointer events.
    }
  };

  const squareHsv = (event: ReactPointerEvent<HTMLElement>): HsvColor => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      ...hsvRef.current,
      s: rect.width > 0 ? clamp01((event.clientX - rect.left) / rect.width) : hsvRef.current.s,
      v:
        rect.height > 0
          ? 1 - clamp01((event.clientY - rect.top) / rect.height)
          : hsvRef.current.v,
    };
  };

  const hueHsv = (event: ReactPointerEvent<HTMLElement>): HsvColor => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      ...hsvRef.current,
      h: rect.width > 0 ? clamp01((event.clientX - rect.left) / rect.width) * 360 : hsvRef.current.h,
    };
  };

  const handleSquarePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragTargetRef.current = 'square';
    capturePointer(event);
    applyHsv(squareHsv(event));
  };

  const handleSquarePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragTargetRef.current === 'square') applyHsv(squareHsv(event));
  };

  const handleSquarePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragTargetRef.current !== 'square') return;
    dragTargetRef.current = null;
    const next = squareHsv(event);
    applyHsv(next);
    commitHex(hsvToHex(next));
  };

  const handleHuePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    dragTargetRef.current = 'hue';
    capturePointer(event);
    applyHsv(hueHsv(event));
  };

  const handleHuePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragTargetRef.current === 'hue') applyHsv(hueHsv(event));
  };

  const handleHuePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    if (dragTargetRef.current !== 'hue') return;
    dragTargetRef.current = null;
    const next = hueHsv(event);
    applyHsv(next);
    commitHex(hsvToHex(next));
  };

  const handleHexChange = (text: string) => {
    setHexText(text);
    // A complete hex moves the thumbs to the typed color right away;
    // the commit itself still waits for blur or Enter.
    if (HEX_COLOR.test(text)) {
      const next = hexToHsv(text.toLowerCase());
      hsvRef.current = next;
      setHsv(next);
    }
  };

  const commitHexText = () => {
    if (!HEX_COLOR.test(hexText)) {
      setHexText(hsvToHex(hsvRef.current));
      return;
    }
    const normalized = hexText.toLowerCase();
    setHexText(normalized);
    const next = hexToHsv(normalized);
    hsvRef.current = next;
    setHsv(next);
    commitHex(normalized);
  };

  const handleHexBlur = () => {
    // Starting a drag blurs the field (the pointer press lands on the
    // square or slider first); that blur belongs to the drag, whose own
    // pointer-up commit is the one step for the gesture.
    if (dragTargetRef.current !== null) return;
    commitHexText();
  };

  const handleClickAway = (event: Event) => {
    // The anchor hex box toggles the picker through its own click, so
    // presses on it are not click-aways.
    if (event.target instanceof Node && anchorEl.contains(event.target)) return;
    onClose();
  };

  return (
    <Popper
      anchorEl={anchorEl}
      modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]}
      open
      placement="bottom-start"
      sx={{ zIndex: 1300 }}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <Paper elevation={8} sx={{ borderRadius: '8px', p: 1.5, width: 264 }}>
          <Box
            data-testid="color-picker-square"
            onPointerCancel={() => {
              dragTargetRef.current = null;
            }}
            onPointerDown={handleSquarePointerDown}
            onPointerMove={handleSquarePointerMove}
            onPointerUp={handleSquarePointerUp}
            sx={{
              backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
              backgroundImage:
                'linear-gradient(to top, #000000, rgba(0, 0, 0, 0)), linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0))',
              borderRadius: '4px',
              cursor: 'crosshair',
              height: 160,
              position: 'relative',
              touchAction: 'none',
            }}
          >
            <Box
              sx={{
                ...thumbSx,
                bgcolor: draftHex,
                left: `${hsv.s * 100}%`,
                top: `${(1 - hsv.v) * 100}%`,
              }}
            />
          </Box>
          <Box sx={{ alignItems: 'center', display: 'flex', gap: 1.5, mt: 1.5 }}>
            <Box
              sx={{
                bgcolor: draftHex,
                border: shellBorderForMode(mode),
                borderRadius: '50%',
                flexShrink: 0,
                height: 28,
                width: 28,
              }}
            />
            <Box
              data-testid="color-picker-hue"
              onPointerCancel={() => {
                dragTargetRef.current = null;
              }}
              onPointerDown={handleHuePointerDown}
              onPointerMove={handleHuePointerMove}
              onPointerUp={handleHuePointerUp}
              sx={{
                background:
                  'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)',
                borderRadius: 999,
                cursor: 'pointer',
                flex: 1,
                height: 12,
                position: 'relative',
                touchAction: 'none',
              }}
            >
              <Box
                sx={{
                  ...thumbSx,
                  bgcolor: draftHex,
                  left: `${(hsv.h / 360) * 100}%`,
                  top: '50%',
                }}
              />
            </Box>
          </Box>
          <Box
            sx={{
              alignItems: 'center',
              border: shellBorderForMode(mode),
              borderRadius: '6px',
              display: 'flex',
              height: 36,
              mt: 1.5,
              px: 1,
            }}
          >
            <InputBase
              autoFocus
              error={!hexValid}
              fullWidth
              inputProps={{
                'aria-label': `${label} hex value`,
                style: { textAlign: 'center' },
              }}
              onBlur={handleHexBlur}
              onChange={(event) => handleHexChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  commitHexText();
                  event.currentTarget.blur();
                }
              }}
              sx={{ fontSize: 14, lineHeight: '20px' }}
              value={hexText}
            />
          </Box>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: 11,
              letterSpacing: '0.08em',
              mt: 0.5,
              textAlign: 'center',
            }}
          >
            HEX
          </Typography>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
