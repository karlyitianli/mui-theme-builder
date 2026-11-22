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
      font: {
        family: 'Inter',
        weights: [400, 500, 700],
        fallback: ['Roboto', 'Arial', 'sans-serif'],
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
