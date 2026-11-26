# MUI Theme Builder: Project Status

**Last updated:** Nov 26, 2026

**Snapshot:** Live at https://karls.design/mui-theme-builder/ · Repo: karlyitianli/mui-theme-builder · Current head: 776999a · 207 tests passing

## Maintenance rule

This file is the plan of record for the project. Read it before starting work on the project. Update it in the same commit as any work that changes a milestone or task status. Decisions and their reasoning live in the decision log in TECHNICAL_PRD.md, not here; this file tracks status only.

## Milestones

| Milestone | Status | Notes |
| --- | --- | --- |
| M0 Safety net (characterization tests) | Done | Vitest suite written before the shell rebuild |
| M1-M2 New shell and token panels | Done | Token-first left panel with five tabs |
| M3 Component preview | Done | Outgrew the original 3-component scope; 41 cards at peak, 37 after removals |
| M4 Functional top bar | Done | Mode toggle, undo/redo, reset, export |
| M5 Token panel wiring | Done | Every panel edit goes through the reducer and is undoable |
| M6 Component defaults editors (Button, TextField, Select) | Open | Not started; see open tasks |
| M7 New shell becomes the only shell | Done | Original shell removed Nov 25, 2026 |
| Post-phase polish batches | Done | Color picker, shell insulation, preview category expansion, Phosphor icon swaps, resize edge |

## Completed tasks

### M0 Safety net

- Vitest and Testing Library characterization suite covering the exporter, validation, theme-options mapping, and the reducer including undo/redo

### M1-M2 New shell and token panels

- Shell v2 with a token-first left panel: five tabs (Color, Typography, Spacing, Radius, Shadows), horizontally scrollable
- All five panels reading real project values
- Drag-resizable left panel (240 to 640px, default 320px) with the width persisted in localStorage
- Tab row scroll fades on both edges; clicking a partially visible tab scrolls it fully into view

### M3 Component preview

- Component registry with live search across categories and four Templates stubs (Sign up, Dashboard, Marketing, Checkout)
- Inputs expansion to 13 cards with live card-local state; Number Field omitted because it is unavailable in @mui/material 9.3.1
- Data Display, Feedback, Surfaces, and Navigation categories added; preview peaked at 41 cards
- Card removals (Transfer List, Icon, Typography, Paper) brought the preview to 37 cards
- Preview cards are real themed cards: Card radius, elevation, and surface come from the edited theme

### M4 Functional top bar

- Light/dark mode toggle, undo, redo, Reset and the Default preset sharing one reset flow (confirm only when edit history is non-empty)
- Export opens the generated code drawer with the theme.tsx output

### M5 Token panel wiring

- All five token panels wired through the reducer; every edit is one undoable action
- Color panel: hex click-to-edit, collapsible sections, Light/Dark segmented control, search by name and hex
- Semantic colors with Main, Light, and Dark rows per scheme: unpinned variants derive automatically from the runtime theme, clicking pins a stored value, pinned rows can reset to auto
- Typography panel: font family selection, base size, per-variant editor, font weight dropdown
- Spacing panel: base unit editing; density presets implemented as base-unit presets (Compact 3px, Comfortable 4px, Spacious 5px)
- Radius panel: global radius plus Button and Input radius through component settings; Card radius and shadows given model homes in foundation defaults, with migration filling defaults into older projects

### M7 New shell becomes the only shell

- Original shell removed entirely; the v2 shell renders on every path

### Post-phase polish batches

- Color picker popover (saturation/value square, hue slider, hex field) committing one undo step per gesture
- Dark-mode shell borders from a single mode-aware border value
- Phosphor CaretDown dropdown icons in the preview and in exported themes, via a stable icon wrapper; the export view notes the @phosphor-icons/react requirement
- Shell insulation: the builder chrome uses a fully fixed theme (own baseline palette per mode, 8px spacing, Inter, radius 6); token edits, color included, apply only inside preview cards
- Phosphor icons for Alert severities and close, and for the Chip delete icon
- Backdrop, Dialog, and Snackbar stage buttons render white in dark mode
- Autocomplete dropdown paper matched to the Select menu (border, radius, shadow) in the baseline, so preview and export agree
- Resize edge restyled to a 1px line that highlights on hover, focus, and drag; the earlier notch was removed, and a sizing bug that rendered the line at 10px was fixed with a regression test

## Open tasks

- **Phase 6 component defaults editors** for Button, TextField, and Select. Not started. Includes fixing the button and text-field adapters, which emit defaultProps unconditionally and can erase foundation defaults in the deep merge; the select adapter is already fixed.
- **Layout preview category** (Box, Container, Grid, Stack) and **Utils category**. Not started.
- **Templates**: Sign up, Dashboard, Marketing, and Checkout are stubs reading "Not built yet". Not started.
- **Color and typography audit fixes**: 14 findings from the Nov 25, 2026 audit, report only; fixes not yet requested. The two highs are T1 (Typography panel specimens show fallback values, not the applied theme) and T2 (an unset font shows Inter in the panel while preview and export use a system stack).
- **Number Field card**: parked by Karl's decision on Nov 25, 2026, because the component is absent from @mui/material 9.3.1. Revisit only if the MUI version changes.
- **Component overrides and the inspector**: parked Nov 25, 2026, until almost everything else is built. Component defaults are theme-level and prescribed in the meantime.
- **Builder-chosen values awaiting Karl's review**: radius presets (Sharp 0, Rounded 6, Spacious 16), shadow presets Subtle and Strong (Medium is locked), and density implemented as base-unit presets (3px, 4px, 5px) rather than a stored density field.
- **Known quirk**: a brand-new, never-saved default project exports without explicit spacing. This is pinned by a characterization test.
