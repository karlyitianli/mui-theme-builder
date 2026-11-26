# MUI Theme Builder

A local-first visual editor for creating light and dark MUI v9 themes. Edit design tokens in a panel, watch real MUI components update live, and export one `theme.tsx` file that carries both color schemes.

**Live demo:** https://karls.design/mui-theme-builder/

## Features

- Token-first editing across five panels: Color, Typography, Spacing, Radius, and Shadows
- Color editing for light and dark schemes, with main, light, and dark values per semantic color (unpinned variants derive automatically)
- Live preview of 37 component cards in five categories (Inputs, Data Display, Feedback, Surfaces, Navigation) with search
- Undo and redo for every edit, plus reset to the Default preset
- Token presets for radius, shadows, and spacing density
- Projects persist locally in the browser (IndexedDB) and can be exported and imported as JSON
- One-file `theme.tsx` export using MUI v9 `colorSchemes`, with integration snippets for fonts and ThemeProvider setup

## Tech stack

- React 19 and React DOM 19
- Vite 8
- TypeScript 6 (strict)
- MUI v9 (@mui/material 9.3.1) with Emotion 11
- Phosphor Icons 2 (@phosphor-icons/react)
- Vitest 5 with Testing Library and jsdom for tests

## Quick start

```bash
npm install
npm run dev
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build the production bundle |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run TypeScript checking across the project |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run verify:generated` | Type-check the generated theme fixtures against MUI |

## Project structure

```text
src/
  app/          App entry and the editor shell (shell-v2: token panels, preview area, component registry)
  domain/       Project schema, defaults, validation, and migration
  state/        Editor reducer, context, and hooks (undo/redo history)
  theme/        Project-to-theme adapter, runtime theme creation, baseline, and component adapters
  generator/    theme.tsx emitter, generated code drawer, and download
  persistence/  IndexedDB repository and project JSON import/export
  preview/      Preview provider and error boundary
  fonts/        Google Fonts catalog, URL builder, and preview font loading
  editor/       Shared editor controls
  fixtures/     Representative projects used by tests and generated-fixture checks
```

## Exporting a theme

The Export action in the top bar shows the generated code and downloads a single `theme.tsx` containing both the light and dark schemes via MUI v9 `colorSchemes`. Exported themes use a Phosphor caret for Select and Autocomplete dropdown icons, so the consuming project needs the icon package installed:

```bash
npm install @phosphor-icons/react
```

The export view also provides the font-loading tags and ThemeProvider integration snippets the theme needs.

## Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md): milestones, completed work, and open tasks. This is the plan of record.
- [TECHNICAL_PRD.md](./TECHNICAL_PRD.md): product requirements and technical design, including the decision log.
