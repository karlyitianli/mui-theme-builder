import type { ThemeProjectV1 } from '../domain/project/theme-project.types';
import { createDefaultProject } from '../domain/project/create-default-project';

const FIXED_DATE = new Date('2026-08-26T00:00:00.000Z');

export const defaultProjectFixture = createDefaultProject(FIXED_DATE);

export const customizedProjectFixture = {
  ...createDefaultProject(FIXED_DATE),
  metadata: {
    ...createDefaultProject(FIXED_DATE).metadata,
    name: 'Example theme',
  },
  colorSchemes: {
    light: { palette: { primary: { main: '#6750a4' } } },
    dark: { palette: { primary: { main: '#d0bcff' } } },
  },
  foundations: {
    shape: { borderRadius: 8 },
    spacing: 8,
    typography: {
      // Exactly the catalog's Inter entry, which is what the
      // Typography panel stores when a user picks Inter (audit
      // findings T3 and T4): the full weight list and the Arial
      // fallback, so the characterized export matches a panel-created
      // project instead of carrying a Roboto no panel path produces.
      font: {
        family: 'Inter',
        weights: [300, 400, 500, 600, 700],
        fallback: ['Arial', 'sans-serif'],
      },
    },
  },
  components: {
    button: {
      defaultProps: { disableElevation: true, variant: 'contained' },
      style: { textTransform: 'none', fontWeight: 600 },
    },
  },
} satisfies ThemeProjectV1;

export const invalidProjectFixture: unknown = {
  schemaVersion: 1,
  colorSchemes: { light: {} },
};

export const futureProjectFixture: unknown = {
  ...defaultProjectFixture,
  schemaVersion: 2,
};
