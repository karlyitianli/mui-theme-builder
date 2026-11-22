import type { FontWeight } from '../domain/value.types';

export interface GoogleFontCatalogEntry {
  family: string;
  weights: FontWeight[];
  fallback: string[];
}

export const googleFontCatalog: GoogleFontCatalogEntry[] = [
  { family: 'Roboto', weights: [300, 400, 500, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Inter', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Open Sans', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Lato', weights: [300, 400, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Montserrat', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Poppins', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Source Sans 3', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Nunito Sans', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Work Sans', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'DM Sans', weights: [300, 400, 500, 600, 700], fallback: ['Arial', 'sans-serif'] },
  { family: 'Merriweather', weights: [300, 400, 700], fallback: ['Georgia', 'serif'] },
];

export function findGoogleFont(family: string) {
  return googleFontCatalog.find((font) => font.family === family);
}
