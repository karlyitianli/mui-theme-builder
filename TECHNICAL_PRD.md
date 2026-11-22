# Technical PRD: MUI Theme Builder

**Status:** Draft for review  
**Owner:** Product / Engineering  
**Last updated:** 2026-08-26  
**Target:** MVP — local-first, MUI v9

## 1. Executive summary

MUI Theme Builder is a browser-based visual editor that enables a non-developer to configure the look and feel of the MUI component library without writing code. Users manipulate design tokens and supported component styles through forms and direct previews, then export a deterministic, type-safe `theme.tsx` file for integration by a frontend engineer.

The MVP focuses on one designer locally creating light and dark themes concurrently for Button, TextField, and Select, then producing technically valid MUI v9 theme configuration. It does not generate an application, edit application-specific components, or replace the engineer review step.

### Confirmed product decisions


| Area               | Decision                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| Target framework   | Latest stable MUI v9 release; pin the exact minor/patch in the application lockfile               |
| Primary user       | Product designer with limited coding experience, building the tool through a vibe-coding workflow |
| Storage            | Entirely local; no account, backend, or cloud collaboration                                       |
| Import             | Import builder-owned JSON only; do not parse arbitrary TypeScript                                 |
| Initial components | Button, TextField, and Select                                                                     |
| Modes              | Edit light and dark color schemes concurrently in one project                                     |
| Starting point     | Unmodified out-of-the-box MUI defaults                                                            |
| Fonts              | Curated Google Fonts selection and weight configuration                                           |
| Accessibility      | Not an MVP feature; the builder itself should still use accessible MUI defaults                   |
| Export             | One `theme.tsx` containing both schemes, plus font-loading and integration instructions           |




## 2. Problem statement

Customizing MUI currently requires users to understand TypeScript, MUI's theme schema, component override APIs, state selectors, and the relationship between global tokens and component-level styling. This creates several problems:

- Non-developers cannot independently explore or specify a theme.
- Designers communicate style decisions through artifacts that engineers must manually translate into code.
- Manual translation is slow and can introduce inconsistencies or invalid MUI configuration.
- Teams lack a shared, interactive source of truth for how theme decisions affect real MUI components and states.



## 3. Objective

Enable a non-developer to declaratively customize supported MUI design tokens and components in a visual interface, validate the result through a representative live preview, and export production-oriented `theme.tsx` code that a frontend engineer can add to an MUI application with minimal editing.

## 4. Goals and success metrics



### Product goals

- Make common MUI theming tasks understandable without requiring knowledge of TypeScript or MUI APIs.
- Show the effect of every supported change in a live, realistic preview.
- Generate deterministic, readable, type-safe theme code.
- Preserve a clean handoff boundary: a non-developer defines intent; an engineer reviews and integrates generated code.
- Allow users to save, reopen, and revise the editable theme configuration.



### Proposed success metrics


| Metric                                                       | MVP target                 |
| ------------------------------------------------------------ | -------------------------- |
| First-time users who export a valid theme without assistance | >= 80%                     |
| Median time from blank project to first export               | <= 15 minutes              |
| Exported themes that compile in the supported reference app  | 100% in automated fixtures |
| Supported controls whose effect is visible in preview        | 100%                       |
| Users who encounter an unrecoverable editing error           | < 1% of sessions           |


Final adoption and usability targets should be baselined during prototype testing.

## 5. Personas and jobs to be done



### Primary: product designer

When establishing or revising a product's visual language, I want to adjust MUI styles through familiar visual controls, work on light and dark modes together, and inspect real component states so that I can hand engineering an implementable theme rather than an ambiguous specification.

### Secondary: frontend engineer

When receiving a theme from a non-developer, I want readable, valid, reviewable MUI code and its source configuration so that I can integrate it without recreating the design manually.

### Secondary: design-system owner

When maintaining a shared visual system, I want global tokens and component exceptions to remain distinguishable so that the theme stays consistent and maintainable.

## 6. Product principles

1. **Tokens before exceptions.** Encourage global palette, typography, shape, and spacing changes before component overrides.
2. **Preview actual states.** Hover, focus, disabled, selected, error, and responsive behavior matter as much as default appearance.
3. **Progressive disclosure.** Common controls are approachable; advanced MUI details appear only when needed.
4. **Valid by construction.** Prefer constrained inputs and schema validation over accepting arbitrary CSS.
5. **Transparent output.** Generated code should be readable and map predictably to UI choices.
6. **Safe iteration.** Changes are undoable, resettable, and preserved locally or in a saved project.



## 7. MVP scope



### 7.1 Project lifecycle

- Create a project from the default MUI theme.
- Name and rename a project.
- Autosave an editable, versioned project document to browser storage (IndexedDB preferred; localStorage is acceptable only if the document remains small).
- Import a previously exported builder configuration file.
- Export both `theme.tsx` and a builder-owned JSON configuration file.
- Reset the full theme or a selected section to MUI defaults.
- Undo and redo changes within the current editing session.

Cloud accounts, collaboration, and server persistence are excluded unless required by the answers in section 18.

### 7.2 Global theme controls

- Concurrent light and dark color schemes using the MUI v9 `colorSchemes` API. A mode selector changes the active preview without hiding or discarding the other scheme.
- Palette roles: primary, secondary, error, warning, info, success, background, text, divider, and action states.
- Color inputs through picker, hex/RGB entry, and validated values.
- Typography: curated Google Font family, selected font weights, base size, weights, line heights, letter spacing, and supported MUI variants.
- Google Fonts preview loading through a generated `fonts.googleapis.com/css2` stylesheet URL; retain a safe system-font fallback while the network font is unavailable.
- Shape: global border radius.
- Spacing: base spacing unit with a preview of its effect.
- Breakpoints: display and export in MVP; editing is proposed as post-MVP due to its cross-cutting impact.
- Shadows: select and edit supported elevation values using structured controls.



### 7.3 Component customization

MVP supports only the following components deeply:

- Button
- TextField, including its underlying input and label states surfaced through the TextField user experience
- Select, including its menu-open preview state and MenuItem appearance where affected by inherited tokens

For each supported component, expose applicable controls for:

- Default props where a safe, enumerated choice exists.
- Root and major slot styles.
- MUI variants and sizes.
- Interaction states: hover, focus-visible, active, selected, disabled, checked, and error where relevant.
- Typography, color, spacing, border, radius, elevation, and opacity using structured inputs.

The product must clearly distinguish inherited token values from explicit component overrides and allow an override to be removed.

### 7.4 Preview

- Render all supported components against the active in-memory theme.
- Provide component gallery and focused-component views.
- Let users switch common props, variants, sizes, and states without changing exported defaults.
- Preview light and dark canvases where both modes exist.
- Include representative compositions such as a form, settings panel, and card layout to reveal cross-component consistency.
- Provide desktop and mobile-width viewports.
- Isolate preview failures so an invalid edit cannot crash the editor shell.



### 7.5 Export

- Generate one formatted `theme.tsx` using the MUI v9 `colorSchemes` API with both light and dark schemes.
- Include imports, `createTheme`, global theme options, component `defaultProps`, `styleOverrides`, and `variants` as needed.
- Omit values that are unchanged from defaults to keep output concise.
- Produce stable key ordering and formatting so the same configuration yields the same output.
- Add a short generated-file header containing builder version and target MUI version, but no user-identifying data.
- Allow copy-to-clipboard and file download.
- Display code before export and identify validation errors that block export.
- When a Google Font is selected, show and copy the required HTML `<link rel="preconnect">` and stylesheet tags separately from `theme.tsx`; set the exported `typography.fontFamily` and selected weights accordingly.
- Provide concise integration instructions for `ThemeProvider`, mode switching, `CssBaseline`, and font-loading tags; do not modify the consumer's application.



## 8. Out of scope for MVP

- Visual page or application builder.
- Editing arbitrary application-specific React components.
- Arbitrary JavaScript, CSS selectors, callbacks, functions, or free-form `sx` expressions.
- Round-trip parsing of arbitrary existing `theme.tsx` code.
- Figma synchronization or design-token platform integrations.
- Real-time multi-user collaboration, comments, approvals, and role management.
- Hosting, deployment, package publishing, or automatic pull requests.
- Guaranteed compatibility with multiple MUI major versions from one project.
- Automated accessibility or WCAG theme analysis.
- Components beyond Button, TextField, and Select, including MUI X.
- Uploaded or self-hosted font files.



## 9. Core user flow

1. User opens the builder and starts from the supported MUI default theme.
2. User edits global tokens using labeled, constrained controls.
3. Preview updates immediately and highlights affected components.
4. User selects a component and optionally adds explicit overrides.
5. User inspects variants, states, compositions, modes, and viewport sizes.
6. Builder reports blocking validation errors and non-blocking accessibility or maintainability warnings.
7. User reviews generated code.
8. User downloads `theme.tsx` and the editable configuration JSON.
9. Frontend engineer reviews and integrates `theme.tsx` into the application.



## 10. Functional requirements



### Editing and state

- **FR-1:** Every UI mutation must update a canonical serializable project document.
- **FR-2:** Preview and code generation must derive from the same canonical document.
- **FR-3:** Controls must show whether a value is inherited, explicitly set, invalid, or resettable.
- **FR-4:** Undo and redo must operate at meaningful user-action boundaries.
- **FR-5:** Reloading the page must restore the latest local autosave.
- **FR-6:** Imported configuration must be schema-validated and migrated when its supported schema version is older.



### Preview

- **FR-7:** Valid edits should appear in preview within 100 ms at the 95th percentile on the reference development device.
- **FR-8:** Preview-only state controls must never modify exported theme defaults.
- **FR-9:** A rendering error must show a recoverable error state with a path to undo or reset the responsible edit.



### Validation and guidance

- **FR-10:** Invalid values must be rejected or clearly identified before export.
- **FR-11:** The builder should warn when a component override duplicates an inherited global value.
- **FR-12:** Technical MUI names may appear as secondary labels, while primary labels use design-oriented language.
- **FR-13:** Font controls must produce only valid Google Fonts family/weight combinations from the bundled catalog.



### Generation

- **FR-14:** A valid project must always generate syntactically valid TypeScript for the supported MUI version.
- **FR-15:** Generation must be pure and deterministic.
- **FR-16:** Generated values must be expressible through public, supported MUI theming APIs.
- **FR-17:** The exported configuration JSON must contain sufficient information to reproduce the project exactly.



## 11. Proposed technical design



### 11.1 Architecture

A client-side TypeScript React application is sufficient for the proposed MVP:

```text
Editor controls ──> canonical project document ──> MUI theme adapter ──> live ThemeProvider
                              │
                              ├──> boundary validation
                              ├──> undo/redo and local persistence
                              └──> deterministic TypeScript generator
```

Implementation decisions:

- Vite, React 19, and strict TypeScript.
- Latest MUI v9 packages with Emotion, pinned by the lockfile.
- MUI v9 `colorSchemes` for concurrent light/dark configuration and CSS theme variables.
- React `useReducer` for canonical project mutations and Context only where deeply nested editor sections need shared access.
- Small handwritten runtime validators for imported JSON and restored browser data; TypeScript remains the internal source of truth.
- IndexedDB via a small typed wrapper for autosave; no backend.
- Prettier with a fixed configuration for generated output.
- No UI testing framework in the initial MVP. Add Vitest later only if pure transformation regressions become difficult to catch through compilation and manual checks.
- No Web Worker until measured interaction latency requires one.



### 11.2 Canonical project model

The persisted model should express user intent rather than mirror MUI's complete internal theme object. It should contain:

- `schemaVersion`
- `builderVersion`
- `targetMuiVersion`
- project metadata
- light and dark color-scheme tokens, stored independently
- shared typography, shape, and spacing tokens
- Google Font family, requested weights, stylesheet URL, and fallback stack
- explicit component defaults, variants, slot overrides, and states
- UI-independent custom values required for exact reconstruction

Derived MUI defaults and computed palette values should not be persisted unless the user explicitly overrides them. This reduces stale data and enables migration.

### 11.3 Adapter boundary

Keep three representations separate:

1. Builder project schema: stable, serializable user intent.
2. Runtime MUI theme options: adapted for live preview.
3. TypeScript abstract syntax or structured generator input: used for deterministic export.

The generator should not serialize the runtime theme because it contains computed values, functions, and MUI internals.

### 11.4 Code generation

Prefer a structured emitter or TypeScript AST over string concatenation for object construction. Snapshot-test representative output and compile generated fixtures against the pinned MUI and TypeScript versions.

Potential generated shape:

```tsx
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#6750A4' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});
```

The final v9 export uses `createTheme({ cssVariables: true, colorSchemes: { light: ..., dark: ... } })`. Component overrides are shared between schemes in MVP; mode-specific differences should flow through scheme palette tokens rather than duplicate component definitions.

### 11.5 Google Fonts design

Google Fonts support is included with a constrained implementation:

1. Bundle a small catalog of popular family metadata in the app; do not depend on a Google Fonts API key at runtime.
2. Allow one primary family in MVP and expose only weights actually available for that family.
3. Construct a canonical CSS2 stylesheet URL, encode family names correctly, and sort/deduplicate weights.
4. Add the stylesheet to the running preview document and remove the previous link after the new font loads or times out.
5. Keep a fallback stack such as `"Inter", "Roboto", "Helvetica", "Arial", sans-serif` so offline preview remains usable.
6. Export `typography.fontFamily` in `theme.tsx` and present the Google Fonts `<link>` tags as a separate copyable integration snippet.
7. Show an “Internet required for font preview” status. Project editing and theme export must continue offline.

The font catalog should initially include Roboto plus roughly 10 designer-friendly families. Expanding the catalog is a metadata change, not an architectural change.

## 12. UX and information architecture

Proposed desktop layout:

- Left: navigation for global tokens and components.
- Center: interactive preview with gallery/composition toggle.
- Right: contextual property inspector.
- Bottom drawer or tab: generated code, warnings, and export.
- Persistent top bar: project name, mode, viewport, undo/redo, save status, and export.

Requirements for non-developer usability:

- Pair semantic labels such as “Button background” with optional technical mapping such as `MuiButton.styleOverrides.root`.
- Explain inheritance and state precedence inline.
- Use curated controls and presets for common decisions.
- Avoid presenting raw JSON or code as the primary editing experience.
- Preserve keyboard navigation, focus visibility, zoom support, and screen-reader labeling in the builder itself.



## 13. Accessibility and quality constraints

Automated accessibility analysis of the generated theme is out of scope for MVP and does not block export. The builder itself should retain accessible MUI defaults, keyboard navigation, visible focus states, semantic labels, and non-color status indicators. A future audit is required before positioning the builder as WCAG-compliant.

## 14. Non-functional requirements

- **Performance:** Initial interactive load <= 3 seconds at the 75th percentile on the agreed reference connection/device; valid preview updates <= 100 ms p95.
- **Reliability:** No valid editor state may generate uncompilable output in the supported fixture matrix.
- **Browser support:** Latest two stable versions of Chrome, Edge, Firefox, and Safari, subject to validation.
- **Privacy:** Client-only MVP sends no project contents, usage events, project names, or generated code off-device.
- **Security:** Do not evaluate user-provided JavaScript. Treat imported JSON as untrusted input with size limits and schema validation.
- **Maintainability:** Component editor metadata, preview examples, validation mapping, and generation mapping should share typed capability definitions where that removes demonstrated duplication.



## 15. Analytics

No analytics or telemetry is included in MVP. Usability findings come from manual task-based sessions and voluntary feedback.

## 16. Testing and acceptance criteria



### Lean verification strategy

The MVP does not require a general-purpose UI, end-to-end, or visual-regression testing framework. Verification should concentrate on the failure with the highest handoff cost: generating invalid MUI code.

- Run strict TypeScript checking, ESLint, and a production Vite build before each milestone is considered complete.
- Generate representative `theme.tsx` fixtures and compile them against the pinned TypeScript and MUI v9 dependencies.
- Manually exercise a short browser checklist covering editing, light/dark switching, reset, undo/redo, reload, JSON round trip, font failure, and download.
- Keep pure adapters, validators, and generators free of React and browser APIs so Vitest can be added later without refactoring.
- Add Vitest only when a real regression demonstrates that build checks and manual verification are insufficient.
- Add Playwright or visual snapshots only after repeated manual release checks become costly; neither is an MVP dependency.



### MVP acceptance criteria

MVP is ready when:

1. A first-time test participant can change palette, typography, shape, and at least three component styles, inspect relevant states, and export without facilitator intervention.
2. All controls listed in the final MVP capability matrix visibly affect preview and map to documented generated output.
3. Every valid test fixture generates deterministic TypeScript that compiles against the pinned MUI version.
4. Reload, import, undo/redo, section reset, and full reset preserve expected project semantics.
5. The preview shell recovers from induced component rendering failures.
6. Blocking validation errors and non-blocking maintainability warnings are distinguishable and actionable.
7. An engineer can integrate a generated theme into the reference app using the supplied instructions.



## 17. Detailed implementation plan

This plan is ordered for one product designer using an AI coding assistant. Each milestone ends in a working, testable slice. Do not begin with a generic property-panel framework; prove the end-to-end data path with real controls first, then extract patterns after Button and TextField expose the actual repetition.

### Milestone 0: repository and quality baseline

**Outcome:** A reproducible local application with guardrails suitable for iterative AI-assisted changes.

- Scaffold Vite + React 19 + strict TypeScript.
- Install only MUI v9, Emotion, and the Vite React/TypeScript toolchain. Use the ESLint configuration supplied by the Vite template and add Prettier only if automatic formatting is desired.
- Pin dependencies through the package lockfile and record the exact MUI version in app metadata.
- Configure ESLint, strict type checking, and formatting.
- Add scripts for `dev`, `build`, `typecheck`, `lint`, and `verify:generated` once code generation exists.
- Create an error boundary around the application and a separate boundary around theme preview.
- Add a short `AGENTS.md` describing architecture, required checks, and the rule that generated theme fixtures must compile.

**Exit criteria:** Clean install, dev server, production build, and all checks pass from documented commands.

### Milestone 1: canonical project schema and default project

**Outcome:** One validated project document can represent a default v9 theme with both color schemes.

- Define `ThemeProjectV1` in `src/domain/theme-project.ts`.
- Model `light` and `dark` palette overrides separately; model typography, spacing, shape, and component overrides as shared settings.
- Represent absent values as inheritance from MUI defaults. Do not copy the computed MUI theme into storage.
- Define semantic editing types such as `ColorValue`, `LengthValue`, `TypographySettings`, `ButtonSettings`, `TextFieldSettings`, and `SelectSettings`.
- Add small explicit type guards for project-boundary validation, plus a default-project factory, schema version, builder version, and target MUI version.
- Build migration plumbing even though only `v1 -> v1` exists initially.
- Add fixtures for empty/default, fully customized, invalid, and future-version projects.

**Exit criteria:** Fixtures validate predictably; a default project contains no redundant MUI default values.

### Milestone 2: theme adapter and dual-mode preview kernel

**Outcome:** The same project document renders a real MUI v9 theme and switches between light and dark previews.

- Implement a pure `projectToThemeOptions(project)` adapter.
- Generate `colorSchemes.light.palette` and `colorSchemes.dark.palette` from the corresponding overrides.
- Enable CSS theme variables in the runtime theme.
- Wrap preview content with MUI's provider and `CssBaseline`.
- Add a preview-only mode toggle; mode changes must not alter project content.
- Add tests proving default, light override, dark override, and shared-token behavior.
- Add a preview error recovery action that restores the last valid project state.

**Exit criteria:** Editing fixture values changes the correct scheme; switching mode preserves both schemes.

### Milestone 3: application shell and state management

**Outcome:** A designer can navigate the editor and make reversible project changes.

- Implement the four primary areas: section navigation, property inspector, preview, and code/export drawer.
- Create a typed `useReducer` state model containing the project, active section, active scheme, preview state, save status, and undo/redo history. Expose state and dispatch through a small Context provider only where prop passing becomes unwieldy.
- Expose narrow domain actions such as `setPaletteToken`, `setTypography`, `setButtonOverride`, and `resetPath`; avoid generic untyped path mutation.
- Add undo/redo with one history entry per committed control action, not per keystroke.
- Add section reset and full reset with confirmation only for full reset.
- Add responsive behavior: desktop editor first; on narrower screens, property inspector and preview become tabs.

**Exit criteria:** Navigation, editing, reset, undo, and redo work using temporary controls before full inspectors are built.

### Milestone 4: global token editors

**Outcome:** The designer can establish the shared visual foundation before overriding components.

- Palette editor for primary, secondary, error, warning, info, success, background, text, divider, and action roles.
- Clearly label whether each palette control edits light, dark, or both.
- Color field with picker plus hex input; normalize valid hex to a canonical format.
- Typography editor for family, base size, and the standard MUI variants.
- Shape editor for shared border radius and spacing editor for base unit.
- Show inherited/default state and a per-field reset action.
- Defer editable breakpoints, shadows, custom palette keys, and arbitrary CSS.

**Exit criteria:** All supported tokens round-trip through state, runtime theme, local persistence, JSON, and TypeScript generation tests.

### Milestone 5: Google Fonts

**Outcome:** The designer can select a supported Google Font and preview/export it reliably.

- Add `src/fonts/catalog.ts` with curated family names, available weights, styles, and fallback categories.
- Start with Roboto, Inter, Open Sans, Lato, Montserrat, Poppins, Source Sans 3, Nunito Sans, Work Sans, DM Sans, and Merriweather.
- Build a font-family combobox and multi-select weight control; automatically retain weight 400.
- Build a canonical Google Fonts CSS2 URL generator and verify representative family/weight combinations through the manual checklist; add it to Vitest later if regressions appear.
- Manage preview `<link>` elements through a dedicated hook with loading, loaded, offline, and failed states.
- Export preconnect and stylesheet tags in an “Install font” snippet.
- Never download, embed, proxy, or repackage Google font files.

**Exit criteria:** Each catalog font previews, survives reload/import, and produces correct font family, weight URL, fallback, and integration snippet.

### Milestone 6: component editors

**Outcome:** Button, TextField, and Select can be customized through focused, design-oriented controls.

Implement one component at a time in this order:

1. **Button:** default variant, size, disable elevation, text transform, font weight, radius, padding, border, and palette-driven colors for contained/outlined/text variants and supported states.
2. **TextField:** default variant, size, full width, radius, label/input typography, padding, border width/style, and palette-driven default/hover/focus/error/disabled states.
3. **Select:** default variant, size, full width, radius, input typography/padding, icon color, and closed/open/focus/error/disabled states. Menu appearance remains inherited except where global tokens already affect it.

For each component:

- Define a typed capability configuration rather than exposing arbitrary CSS.
- Implement inspector controls, project-model mapping, adapter mapping, focused preview, gallery preview, and reset behavior together.
- Show variants and states as preview controls that do not mutate exported defaults.
- Display inherited versus overridden values.
- Add each mapping to the manual component checklist and generated compilation fixtures.

**Exit criteria:** Every visible control has a preview effect and deterministic export mapping; unsupported combinations are not offered.

### Milestone 7: project persistence and JSON interchange

**Outcome:** Work survives reloads and can be moved between browsers without a server.

- Debounce autosave to IndexedDB after valid committed changes.
- Restore the most recent valid project at startup and show save state.
- Download a `.mui-theme-builder.json` document with stable formatting.
- Import via file picker, validate size and MIME/extension heuristically, parse as untrusted input, validate with handwritten type guards, and run migrations.
- Show actionable import errors without replacing the current project.
- Add “Start over” and “Download backup” flows.
- Keep one current project in MVP; named multi-project management is post-MVP.

**Exit criteria:** Reload and JSON export/import reproduce the project exactly, including both schemes and font metadata.

### Milestone 8: deterministic `theme.tsx` generation

**Outcome:** The designer can hand an engineer readable code that compiles against pinned MUI v9.

- Convert the project into a small generator-specific intermediate representation.
- Emit one `theme.tsx` with `createTheme`, `cssVariables`, light/dark `colorSchemes`, shared typography/shape/spacing, and supported component overrides.
- Omit unset/default values and use stable ordering.
- Format with a pinned Prettier configuration.
- Display read-only code with copy and download actions.
- Display separate integration snippets for font `<link>` tags, `ThemeProvider`, `CssBaseline`, and mode switching.
- Add golden snapshots and compile generated fixtures with `tsc` against installed MUI v9 types.
- Make a failed schema or compilation invariant block download and show a recoverable error.

**Exit criteria:** Default, light/dark, each component, each Google Font, and maximal fixtures generate stable code and compile.

### Milestone 9: designer workflow polish

**Outcome:** A designer can complete the core task without understanding MUI internals.

- Add concise labels, inline explanations, empty states, and reset affordances.
- Add gallery and focused previews for all three components.
- Include a small form composition combining Button, TextField, and Select.
- Add desktop and mobile preview widths.
- Ensure controls never silently change the other color scheme.
- Add onboarding that teaches tokens first, component exceptions second, and export last.
- Conduct three task-based self-tests or peer sessions and fix repeated confusion before adding features.

**Exit criteria:** A first-time designer can create both schemes, customize all three components, reopen the project, and export without editing JSON or code.

### Milestone 10: hardening and MVP release

**Outcome:** A dependable local MVP with documented limitations.

- Exercise latest supported Chrome, Firefox, Safari, and Edge.
- Manually run the release checklist for create/edit, scheme switching, undo/reset, font selection, reload, JSON round trip, and code export.
- Test corrupt storage, invalid imports, offline fonts, and preview render failures.
- Measure preview update latency and initial load; optimize only measured regressions.
- Run `build`, `typecheck`, `lint`, and generated-fixture compilation as the release gate.
- Write a local setup guide, user guide, export integration guide, and known limitations.

**Exit criteria:** All MVP acceptance criteria pass and the tool can be run locally from a clean checkout using documented steps.

### Suggested source structure

```text
src/
  app/                 # shell, routing/navigation, error boundaries
  domain/              # project schema, defaults, migrations, domain actions
  theme/               # project-to-MUI adapter and component mappings
  generator/           # generator IR, emitter, formatting, compile fixtures
  fonts/               # curated catalog, CSS2 URL builder, preview loader
  persistence/         # IndexedDB repository and JSON import/export
  editor/              # global and component inspector controls
  preview/             # gallery, focused previews, preview-only state
  state/               # useReducer, Context, typed actions, and undo/redo history
  fixtures/            # representative projects used by generation compile checks
```



### Definition of done for every editor control

A control is complete only when it has:

- a typed schema field or intentionally derived value;
- an explicit domain action;
- validation and reset behavior;
- a visible light/dark preview effect where applicable;
- a deterministic generator mapping;
- persistence and JSON round-trip coverage;
- coverage in a generated compilation fixture and the manual browser checklist;
- a designer-readable label and help text.



## 18. Remaining implementation choices

These choices are intentionally non-blocking; use the defaults below unless user testing reveals a problem:

- **Exact v9 version:** install the latest stable v9 at project bootstrap and pin it in the lockfile.
- **Font catalog size:** begin with 11 curated families; do not build font search against the full remote catalog.
- **Component scheme behavior:** keep component overrides shared and drive mode differences through palette tokens.
- **Project count:** autosave one active project; users create backups through JSON download.
- **Deployment:** local dev/build only for MVP. Static hosting can be added later without changing the data model.



## 19. Key risks and mitigations


| Risk                                                  | Impact                                   | Mitigation                                                                           |
| ----------------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------ |
| Supporting every MUI option overwhelms non-developers | Poor usability and long delivery         | Curated capability matrix, progressive disclosure, high-value component subset       |
| Runtime preview and generated code diverge            | Loss of trust and integration defects    | One canonical model, explicit adapters, generated fixture compilation, manual comparison checklist |
| Arbitrary CSS creates invalid or unsafe states        | Broken preview and unmaintainable output | Structured controls and allowlisted properties in MVP                                |
| MUI version changes invalidate mappings               | High maintenance cost                    | Pin target version, encode it in projects/exports, version adapters and migrations   |
| Component overrides undermine token consistency       | Fragmented design system                 | Show inheritance, warn on redundant overrides, prioritize token workflows            |
| Theme files require functions or application context  | Export cannot represent every design     | Document supported subset and retain an engineer review step                         |




## 20. Post-MVP opportunities

- Existing theme-code import for a deliberately supported TypeScript subset.
- Shareable cloud projects, comments, approvals, and version history.
- Design-token import/export using a standard such as DTCG where compatibility is proven.
- Figma or design-system platform integrations.
- Additional MUI and MUI X components.
- Responsive token controls and richer breakpoint editing.
- Custom component registration and organization-owned presets.
- GitHub pull request or package publishing workflow.
- AI-assisted theme creation constrained to the same validated project schema.
