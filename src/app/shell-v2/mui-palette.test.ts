import * as muiColors from '@mui/material/colors';
import { describe, expect, it } from 'vitest';

import {
  MUI_PALETTE,
  MUI_PALETTE_SWATCH_COUNT,
  filterMuiPalette,
  matchesMuiPaletteQuery,
} from './mui-palette';

// The palette browser's data (task 3.3) is pinned against the installed
// @mui/material/colors package itself, not a hand-copied list: every
// family and shade the package exports must be in the browser with the
// same hex (normalized to six digits), and nothing else may appear.

function normalizeHex(hex: string): string {
  const lower = hex.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

describe('MUI palette data', () => {
  it('covers every family and shade the installed package exports', () => {
    const record = muiColors as unknown as Record<string, Record<string, string>>;
    const packageFamilies = Object.entries(record).filter(
      ([, shades]) => shades && typeof shades === 'object',
    );
    expect(MUI_PALETTE).toHaveLength(packageFamilies.length);

    let expectedCount = 0;
    for (const [key, shades] of packageFamilies) {
      const familyName =
        key === 'common'
          ? 'Common'
          : key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
      const family = MUI_PALETTE.find((entry) => entry.name === familyName);
      expect(family, `family ${familyName}`).toBeDefined();
      expectedCount += Object.keys(shades).length;
      for (const [shade, hex] of Object.entries(shades)) {
        // Look up by shade (or by name for common): a few shades share
        // a hex within a family, so the hex alone is not a key.
        const swatch =
          key === 'common'
            ? family?.swatches.find((entry) => entry.name === shade)
            : family?.swatches.find((entry) => entry.shade === shade);
        expect(swatch, `${familyName} ${shade}`).toBeDefined();
        expect(swatch?.hex).toBe(normalizeHex(hex));
        if (key !== 'common') {
          expect(swatch?.name).toBe(`${familyName.toLowerCase()} ${shade.toLowerCase()}`);
        }
      }
    }
    expect(MUI_PALETTE_SWATCH_COUNT).toBe(expectedCount);
  });

  it('orders shades as the numbered ramp followed by the accents', () => {
    const blue = MUI_PALETTE.find((family) => family.name === 'Blue');
    expect(blue?.swatches.map((swatch) => swatch.shade)).toEqual([
      '50',
      '100',
      '200',
      '300',
      '400',
      '500',
      '600',
      '700',
      '800',
      '900',
      'A100',
      'A200',
      'A400',
      'A700',
    ]);
    expect(blue?.swatches.find((swatch) => swatch.shade === '500')?.hex).toBe('#2196f3');
  });

  it('includes common black and white as six-digit hexes', () => {
    const common = MUI_PALETTE.find((family) => family.name === 'Common');
    expect(common?.swatches.map((swatch) => [swatch.name, swatch.hex])).toEqual([
      ['black', '#000000'],
      ['white', '#ffffff'],
    ]);
  });
});

describe('MUI palette search', () => {
  const blue500 = MUI_PALETTE.find((family) => family.name === 'Blue')?.swatches.find(
    (swatch) => swatch.shade === '500',
  );
  if (!blue500) throw new Error('blue 500 missing from palette data');

  it.each(['blue', '500', 'blue 500', 'blue500', 'BLUE 500', '#2196f3', '2196f3'])(
    'matches blue 500 for query %j',
    (query) => {
      expect(matchesMuiPaletteQuery(blue500, query)).toBe(true);
    },
  );

  it('does not match unrelated queries', () => {
    expect(matchesMuiPaletteQuery(blue500, 'red')).toBe(false);
    expect(matchesMuiPaletteQuery(blue500, '600')).toBe(false);
    expect(matchesMuiPaletteQuery(blue500, '#f44336')).toBe(false);
  });

  it('filters families down to the matching swatches', () => {
    const byName = filterMuiPalette('blue500');
    expect(byName).toHaveLength(1);
    expect(byName[0].name).toBe('Blue');
    expect(byName[0].swatches.map((swatch) => swatch.name)).toEqual(['blue 500']);

    // A shade query finds every family's 500; the only other matches
    // are hexes that literally contain "500" (pink A400 #f50057 and
    // friends), which the hex side of the search is supposed to catch.
    const byShade = filterMuiPalette('500').flatMap((family) => family.swatches);
    expect(byShade.filter((swatch) => swatch.shade === '500')).toHaveLength(19);
    expect(
      byShade.every((swatch) => swatch.shade === '500' || swatch.hex.includes('500')),
    ).toBe(true);

    const deepOrange = filterMuiPalette('deep orange');
    expect(deepOrange.map((family) => family.name)).toEqual(['Deep Orange']);

    expect(filterMuiPalette('not a color')).toEqual([]);
    expect(filterMuiPalette('')).toHaveLength(MUI_PALETTE.length);
  });
});
