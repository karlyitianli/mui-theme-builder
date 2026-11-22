import type { GoogleFontSettings } from '../domain/typography.types';

export function createGoogleFontUrl(font: GoogleFontSettings): string {
  const family = encodeURIComponent(font.family).replace(/%20/g, '+');
  const weights = [...new Set(font.weights)].sort((left, right) => left - right).join(';');
  return `https://fonts.googleapis.com/css2?family=${family}:wght@${weights}&display=swap`;
}
