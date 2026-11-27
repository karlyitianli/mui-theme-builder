import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { DEFAULT_ACTION, DEFAULT_GREY, GREY_SHADES } from './palette-defaults';

// Task 3.6 (Nov 26, 2026): the Grey and Action defaults are MUI's own,
// pinned here against a plain createTheme oracle on the installed MUI
// so a future MUI bump that changes them fails loudly instead of
// silently restyling every project that stores the defaults. Before
// 3.6 the model carried neither group and every theme resolved them
// to exactly these values, which is why these are the stored defaults.
describe('Grey and Action defaults against a createTheme oracle (task 3.6)', () => {
  it('the grey ramp matches MUI grey 50 to 900, the same in both modes', () => {
    for (const mode of ['light', 'dark'] as const) {
      const oracle = createTheme({ palette: { mode } }).palette;
      for (const shade of GREY_SHADES) {
        expect(DEFAULT_GREY[shade]).toBe(oracle.grey[shade]);
      }
    }
    expect(GREY_SHADES).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900]);
  });

  it('the action defaults match MUI action per mode, all eleven keys', () => {
    for (const mode of ['light', 'dark'] as const) {
      const oracle = createTheme({ palette: { mode } }).palette;
      expect(DEFAULT_ACTION[mode]).toEqual({
        active: oracle.action.active,
        hover: oracle.action.hover,
        hoverOpacity: oracle.action.hoverOpacity,
        selected: oracle.action.selected,
        selectedOpacity: oracle.action.selectedOpacity,
        disabled: oracle.action.disabled,
        disabledBackground: oracle.action.disabledBackground,
        disabledOpacity: oracle.action.disabledOpacity,
        focus: oracle.action.focus,
        focusOpacity: oracle.action.focusOpacity,
        activatedOpacity: oracle.action.activatedOpacity,
      });
    }
  });
});
