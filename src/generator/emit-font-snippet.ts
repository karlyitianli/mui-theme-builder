import type { ThemeProject } from '../domain/project';
import { createGoogleFontUrl } from '../fonts/google-font-url';

export function emitFontSnippet(project: ThemeProject): string {
  const font = project.foundations?.typography?.font;
  if (!font) return 'No Google Font is selected. No font tags are required.';

  return `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="${createGoogleFontUrl(font)}" />`;
}
