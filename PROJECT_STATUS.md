# MUI Theme Builder: Project Status

**Last updated:** Nov 26, 2026

**Snapshot:** Live at https://karls.design/mui-theme-builder/ · Repo: karlyitianli/mui-theme-builder · 224 tests passing

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
| M8 Templates (Sign up, Dashboard, Marketing, Checkout) | Open | All four are stubs today |
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
- Fresh-project spacing agreement fixed (Nov 26, 2026): the default project now stores its spacing base, so panel, preview, and export agree; the characterization test that pinned the omission now asserts the stored value
- Nov 26, 2026 decisions implemented: density presets redefined (Compact 4px, Comfortable 8px default, Spacious 12px); shadows re-based to global none with per-component elevations (Button 2, Card 1, Input 0, Menu 8, new); preset Default renamed Black and a true MUI Default preset added (values checked against a createTheme oracle); new projects start on Black
- Preset identity is session state only: saved and imported projects store values, not which preset they came from, and both presets share the builder's component baseline by design
- Adapter defaultProps fix (task 1.2, Nov 26, 2026): the button and text-field adapters now omit defaultProps when the settings carry none, matching the select adapter, so a style-only Button or TextField setting no longer erases the baseline, foundation, and external-label defaultProps in the deep merge; pinned by new adapter tests at the adapter level and in the merged theme options

## Open tasks

Effort estimates are rough. Small means a single small change, Medium means a focused batch, Large means a multi-batch phase.

### Component editing

- [ ] 1.1 Phase 6 component defaults editors for Button, TextField, and Select (Effort: Large). Not started.
- [ ] 1.3 Decide what shell should be, and what components are editable (Effort: Small). A decision that gates the inspector and overrides work.
- [ ] 1.4 Inspector from tweakcn, very interesting concept (Effort: Large). Component overrides and the inspector were parked on Nov 25, 2026, until almost everything else is built; component defaults are theme-level and prescribed in the meantime. tweakcn's inspector is the reference for this thread.
- [ ] 1.5 Typography model cannot express textTransform (Effort: Small). Found Nov 26, 2026: the MUI Default preset's Button and Overline variants are uppercase in real MUI, but the model has no textTransform field, so the preset cannot reproduce them. Decide whether to add the field.

### Preview coverage

- [ ] 2.1 Layout preview category (Box, Container, Grid, Stack) (Effort: Medium). Not started.
- [ ] 2.2 Utils preview category (Effort: Medium). Not started.
- [ ] 2.3 Templates: Sign up, Dashboard, Marketing, Checkout (Effort: Large). All four are stubs reading "Not built yet". Not started.
- [ ] 2.4 Number Field card (Effort: Small, blocked). Parked by Karl's decision on Nov 25, 2026, because the component is absent from @mui/material 9.3.1. Revisit only if the MUI version changes.

### Preview experience

- [ ] 3.1 Show a badge count of components per section (Effort: Small).
- [ ] 3.2 Links to MUI docs per component (Effort: Small). Each preview card links to that component's MUI documentation page.
- [ ] 3.3 Color palette browser with official MUI color tokens (Effort: Medium). Karl clarified on Nov 26, 2026 with a tweakcn screenshot: next to each color field, a button opens a searchable palette browser of officially supported MUI color tokens and their names (the @mui/material/colors palette: families such as red, blue, grey with their numbered shades), the way tweakcn's button opens the official Tailwind v4 tokens. Picking a named swatch sets the field's color value.
- [ ] 3.4 Make it mobile responsive a la tweakcn (Effort: Large).
- [ ] 3.5 Other tab for breakpoints, transitions, and z-index (Effort: Medium). Added Nov 26, 2026: these theme values get a new Other tab after Shadows in the token panel, rather than tabs of their own.
- [ ] 3.6 Complete the Color panel palette: grey ramp and action colors (Effort: Medium). Added Nov 26, 2026: add a Grey section (50 to 900) and an Action section (active, hover, selected, disabled and their opacities) per scheme, wired like the existing palette groups.

### Quality and correctness

- [ ] 4.1 Color and typography audit fixes (Effort: Medium). 14 findings from the Nov 25, 2026 audit, report only; fixes not yet requested. The two highs are T1 (Typography panel specimens show fallback values, not the applied theme) and T2 (an unset font shows Inter in the panel while preview and export use a system stack).
- [ ] 4.2 Audit shell color and typography (Effort: Small). A report-only audit of exactly this exists (Nov 25, 2026, 14 findings) and the fixes task above is its open half; this item is about running or refreshing that audit for the shell specifically.

### Product and platform

- [ ] 5.1 A way to send to Claude, Muse, Codex etc (Effort: Medium). Hand the theme or project off to AI coding tools; the form is to be decided.
- [ ] 5.2 Landing page (Effort: Medium).
- [ ] 5.3 Radius presets awaiting Karl's review (Effort: Small). Radius presets (Sharp 0, Rounded 6, Spacious 16) are the remaining builder-chosen values awaiting review. The density and shadow questions were decided on Nov 26, 2026: density presets are Compact 4px, Comfortable 8px, Spacious 12px with Comfortable as the default, and shadows are global none with per-component overrides for Button, Card, Input, and Menu (values recorded in the PRD decision log; implemented Nov 26, 2026). The Subtle and Strong shadow presets' new Menu elevations (4 and 12) are builder interpolations from the Nov 26, 2026 build and join the review queue alongside the radius presets.
