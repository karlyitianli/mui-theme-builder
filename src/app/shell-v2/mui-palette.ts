// The official MUI color palette for the Color tab's palette browser
// (task 3.3), built at module load from the installed
// @mui/material/colors package itself, so the browser can never drift
// from the tokens MUI actually ships: the 19 color families, each with
// shades 50 to 900 plus the A100/A200/A400/A700 accents, and the common
// black and white. Hexes are normalized to the six-digit form the
// project model stores (common ships #000 and #fff).

import * as muiColors from '@mui/material/colors';

export interface MuiPaletteSwatch {
  // Token name as a user would say it: "blue 500", "deep orange A100",
  // "black".
  name: string;
  // The shade label within its family: "500", "A100", or "" for the
  // common colors, whose name is the whole token.
  shade: string;
  hex: string;
  // Precomputed haystacks for the search (see matchesMuiPaletteQuery).
  searchText: string;
  // Family key and shade with no spaces: "blue500", "deeporangea100".
  compactName: string;
  // The hex digits without the leading #.
  hexDigits: string;
}

export interface MuiPaletteFamily {
  // Display heading: "Blue", "Deep Orange", "Common".
  name: string;
  swatches: MuiPaletteSwatch[];
}

// Shade order within a family: the numbered ramp first, then accents.
const SHADE_ORDER = [
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
];

function displayFamilyName(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, '$1 $2');
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function normalizeHex(hex: string): string {
  const lower = hex.toLowerCase();
  if (/^#[0-9a-f]{3}$/.test(lower)) {
    return `#${lower[1]}${lower[1]}${lower[2]}${lower[2]}${lower[3]}${lower[3]}`;
  }
  return lower;
}

function buildPalette(): MuiPaletteFamily[] {
  const families: MuiPaletteFamily[] = [];
  const record = muiColors as unknown as Record<string, Record<string, string>>;
  for (const [key, shades] of Object.entries(record)) {
    if (!shades || typeof shades !== 'object') continue;
    const familyName = displayFamilyName(key);
    if (key === 'common') {
      // Common's keys are whole color names, not shades.
      const swatches = Object.entries(shades).map(([name, hex]) => {
        const normalized = normalizeHex(hex);
        return {
          name,
          shade: '',
          hex: normalized,
          searchText: `common ${name} ${normalized}`.toLowerCase(),
          compactName: `common${name}`,
          hexDigits: normalized.replace('#', ''),
        };
      });
      families.push({ name: familyName, swatches });
      continue;
    }
    const orderedKeys = [
      ...SHADE_ORDER.filter((shade) => shade in shades),
      ...Object.keys(shades).filter((shade) => !SHADE_ORDER.includes(shade)),
    ];
    const familyLower = familyName.toLowerCase();
    const familyCompact = key.toLowerCase();
    const swatches = orderedKeys.map((shade) => {
      const hex = normalizeHex(shades[shade]);
      const name = `${familyLower} ${shade.toLowerCase()}`;
      return {
        name,
        shade,
        hex,
        searchText: `${name} ${familyCompact} ${shade.toLowerCase()} ${hex}`,
        compactName: `${familyCompact}${shade.toLowerCase()}`,
        hexDigits: hex.replace('#', ''),
      };
    });
    families.push({ name: familyName, swatches });
  }
  return families;
}

export const MUI_PALETTE: MuiPaletteFamily[] = buildPalette();

export const MUI_PALETTE_SWATCH_COUNT = MUI_PALETTE.reduce(
  (total, family) => total + family.swatches.length,
  0,
);

// The browser's search, following the panel search's idiom (trimmed,
// lowercased substring): a query matches when it appears in the
// token's name, family, shade, or hex text. Spaces and the leading #
// are optional, so "blue 500", "blue500", "500", "blue", "#2196f3",
// and "2196f3" all find blue 500. The compact form (spaces and #
// stripped) must start the token's compact name or its hex digits, so
// "blue500" finds blue 500 but not light blue 500, whose compact name
// starts with "light".
export function matchesMuiPaletteQuery(swatch: MuiPaletteSwatch, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (query === '') return true;
  if (swatch.searchText.includes(query)) return true;
  const compact = query.replace(/[\s#]+/g, '');
  return (
    compact !== '' &&
    (swatch.compactName.startsWith(compact) || swatch.hexDigits.startsWith(compact))
  );
}

export function filterMuiPalette(rawQuery: string): MuiPaletteFamily[] {
  return MUI_PALETTE.map((family) => ({
    ...family,
    swatches: family.swatches.filter((swatch) => matchesMuiPaletteQuery(swatch, rawQuery)),
  })).filter((family) => family.swatches.length > 0);
}
