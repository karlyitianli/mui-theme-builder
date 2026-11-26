import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { Box } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { useEditorState } from '../../state/editor-hooks';
import {
  clampPanelWidth,
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  readStoredPanelWidth,
  storePanelWidth,
} from './panel-width';
import { PreviewArea } from './PreviewArea';
import { createShellTheme } from './shell-theme';
import { TokenPanel } from './TokenPanel';

// The v2 shell from Figma frame 358:10 (1280px, cards version, inspector
// closed): a token panel on the left and the preview area on the
// right, with no right-hand components panel.
//
// The shell renders inside its own theme (shell-theme.ts): a fully
// fixed theme whose only input is the active mode, so token edits,
// color edits included, never restyle the chrome (Karl's insulation
// rule, Nov 25, 2026). Only the preview cards in PreviewArea render
// under the full project theme. Before the insulation, this provider
// held a static copy of the chrome theme with the light baseline
// palette baked in; it now swaps between the shell's own fixed light
// and dark themes with the toggle, which is why this component reads
// the active mode from the editor state and memoizes the theme on it
// alone (project edits no longer rebuild it).
//
// The token panel's width is resizable: dragging the handle on its
// right edge (or arrow keys while the handle is focused) resizes it
// between the panel-width.ts limits, the preview area flexes to fill
// what remains, and the chosen width persists in localStorage. The
// frame's 320px is the default.
export function NewShell() {
  const { activeMode } = useEditorState();
  const shellTheme = useMemo(() => createShellTheme(activeMode), [activeMode]);
  const [panelWidth, setPanelWidth] = useState(readStoredPanelWidth);
  const [dragging, setDragging] = useState(false);
  // The latest width, for the drag and keyboard handlers: the state
  // only ever changes through applyWidth below, which keeps the ref
  // in step.
  const widthRef = useRef(panelWidth);

  // While a drag runs, the whole document shows the resize cursor and
  // ignores text selection, so a fast drag that outruns the handle
  // still reads as one resize gesture.
  useEffect(() => {
    if (!dragging) return;
    const { cursor, userSelect } = document.body.style;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.body.style.cursor = cursor;
      document.body.style.userSelect = userSelect;
    };
  }, [dragging]);

  const applyWidth = (width: number) => {
    const next = clampPanelWidth(width);
    widthRef.current = next;
    setPanelWidth(next);
    return next;
  };

  // The drag listens on the window from pointerdown, so the gesture
  // keeps tracking even when the pointer leaves the thin handle. The
  // final width is stored once, on pointerup.
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = widthRef.current;
    setDragging(true);
    const onMove = (moveEvent: PointerEvent) => {
      applyWidth(startWidth + moveEvent.clientX - startX);
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      setDragging(false);
      storePanelWidth(widthRef.current);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 40 : 10;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      storePanelWidth(applyWidth(widthRef.current - step));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      storePanelWidth(applyWidth(widthRef.current + step));
    }
  };

  return (
    <ThemeProvider theme={shellTheme}>
      <Box
        component="main"
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          display: 'flex',
          height: '100dvh',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0, position: 'relative', width: panelWidth }}>
          <TokenPanel width={panelWidth} />
          {/* Drag handle straddling the panel's right border. The grip
              pill stays invisible until the handle is hovered, focused,
              or being dragged, so the chrome is unchanged at rest. */}
          <Box
            aria-label="Resize token panel"
            aria-orientation="vertical"
            aria-valuemax={PANEL_WIDTH_MAX}
            aria-valuemin={PANEL_WIDTH_MIN}
            aria-valuenow={panelWidth}
            data-testid="panel-resize-handle"
            onKeyDown={handleKeyDown}
            onPointerDown={handlePointerDown}
            role="separator"
            sx={{
              alignItems: 'center',
              bottom: 0,
              cursor: 'col-resize',
              display: 'flex',
              justifyContent: 'center',
              position: 'absolute',
              right: -5,
              top: 0,
              touchAction: 'none',
              width: 10,
              zIndex: 3,
              '& .panel-resize-grip': {
                opacity: dragging ? 1 : 0,
              },
              '&:hover .panel-resize-grip, &:focus-visible .panel-resize-grip': {
                opacity: 1,
              },
            }}
            tabIndex={0}
          >
            <Box
              className="panel-resize-grip"
              sx={{
                bgcolor: dragging ? 'text.secondary' : 'divider',
                borderRadius: 999,
                height: 56,
                transition: 'opacity 120ms ease',
                width: 4,
              }}
            />
          </Box>
        </Box>
        <PreviewArea />
      </Box>
    </ThemeProvider>
  );
}
