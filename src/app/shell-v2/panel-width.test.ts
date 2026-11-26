import { afterEach, describe, expect, it } from 'vitest';

import {
  clampPanelWidth,
  PANEL_WIDTH_DEFAULT,
  PANEL_WIDTH_MAX,
  PANEL_WIDTH_MIN,
  PANEL_WIDTH_STORAGE_KEY,
  readStoredPanelWidth,
  storePanelWidth,
} from './panel-width';

describe('clampPanelWidth', () => {
  it('keeps widths inside the range, rounding to whole pixels', () => {
    expect(clampPanelWidth(320)).toBe(320);
    expect(clampPanelWidth(333.6)).toBe(334);
    expect(clampPanelWidth(PANEL_WIDTH_MIN)).toBe(PANEL_WIDTH_MIN);
    expect(clampPanelWidth(PANEL_WIDTH_MAX)).toBe(PANEL_WIDTH_MAX);
  });

  it('clamps widths outside the range to the nearest bound', () => {
    expect(clampPanelWidth(100)).toBe(PANEL_WIDTH_MIN);
    expect(clampPanelWidth(0)).toBe(PANEL_WIDTH_MIN);
    expect(clampPanelWidth(1200)).toBe(PANEL_WIDTH_MAX);
  });

  it('falls back to the default for non-finite values', () => {
    expect(clampPanelWidth(Number.NaN)).toBe(PANEL_WIDTH_DEFAULT);
    expect(clampPanelWidth(Number.POSITIVE_INFINITY)).toBe(PANEL_WIDTH_DEFAULT);
  });
});

describe('panel width storage', () => {
  afterEach(() => {
    window.localStorage.removeItem(PANEL_WIDTH_STORAGE_KEY);
  });

  it('defaults to 320 when nothing is stored', () => {
    expect(readStoredPanelWidth()).toBe(PANEL_WIDTH_DEFAULT);
  });

  it('round-trips a stored width', () => {
    storePanelWidth(400);
    expect(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)).toBe('400');
    expect(readStoredPanelWidth()).toBe(400);
  });

  it('clamps a stored width into the range on the way in and out', () => {
    storePanelWidth(5000);
    expect(readStoredPanelWidth()).toBe(PANEL_WIDTH_MAX);
    window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, '12');
    expect(readStoredPanelWidth()).toBe(PANEL_WIDTH_MIN);
  });

  it('falls back to the default for a corrupt stored value', () => {
    window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, 'not-a-number');
    expect(readStoredPanelWidth()).toBe(PANEL_WIDTH_DEFAULT);
  });
});
