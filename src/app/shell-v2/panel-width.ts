// Width of the v2 shell's left token panel. The panel is resizable by
// dragging its right edge (see NewShell.tsx); the width is a piece of
// view state, so it persists in localStorage rather than in the
// project or the editor reducer, and falls back to the frame's 320px
// whenever nothing valid is stored.

export const PANEL_WIDTH_DEFAULT = 320;
export const PANEL_WIDTH_MIN = 240;
export const PANEL_WIDTH_MAX = 640;
export const PANEL_WIDTH_STORAGE_KEY = 'mui-theme-builder:panel-width';

// Rounds to whole pixels and clamps into the resizable range; a
// non-finite input (a corrupt stored value, a NaN drag delta) falls
// back to the default.
export function clampPanelWidth(value: number): number {
  if (!Number.isFinite(value)) return PANEL_WIDTH_DEFAULT;
  return Math.min(PANEL_WIDTH_MAX, Math.max(PANEL_WIDTH_MIN, Math.round(value)));
}

export function readStoredPanelWidth(): number {
  try {
    const stored = window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
    if (stored === null) return PANEL_WIDTH_DEFAULT;
    return clampPanelWidth(Number(stored));
  } catch {
    return PANEL_WIDTH_DEFAULT;
  }
}

export function storePanelWidth(width: number): void {
  try {
    window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(clampPanelWidth(width)));
  } catch {
    // Storage can be unavailable (private browsing, quota); the width
    // then simply lasts for the session.
  }
}
