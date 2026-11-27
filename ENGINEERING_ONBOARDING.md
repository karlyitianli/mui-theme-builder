# Engineering Onboarding: MUI Theme Builder

Written Nov 27, 2026 by an engineer new to the project, from reading the code
and measuring what could be measured. Facts about the code are stated as found;
judgments are labeled as judgments.

The product in one paragraph: a local-first visual editor for MUI v9 themes.
The user edits design tokens (palette, typography, spacing, radius, shadows,
breakpoints, transitions, z-index) and a small set of component settings in a
left panel; the center shows 49 live preview cards rendered under the edited
theme; Export produces one `theme.tsx` with light and dark `colorSchemes`.
React 19, Vite 8, TypeScript, `@mui/material` ^9.3.1. Six runtime dependencies
total. Source is 110 TypeScript files, about 15,000 lines, with 321 tests in
30 test files, all passing at the time of writing.

## 1. Interesting technical parts and challenges

### Shell insulation: the edited theme must not restyle the builder

The central design rule of the app (settled Nov 25, 2026) is that editing
tokens changes the preview and the export, and nothing else. The builder's own
chrome (top bar, panels, menus) renders under a fixed shell theme
(`createShellTheme` in `src/app/shell-v2/shell-theme.ts`) that reads nothing
from the project: fixed 8px spacing base, fixed Inter stack, fixed 6px radius,
the baseline palette per mode under a CSS variable prefix of `shell`.

The non-obvious part is that a separate theme object is not enough. MUI themes
with CSS variables define `--mui-*` variables on global selectors, so a chrome
theme on the default `mui` prefix would have its variables overridden by
whichever preview theme mounted last. The insulation actually holds because
of three mechanisms together: the `cssVarPrefix: 'shell'` on the shell theme,
a string rewrite (`scopeComponentsToShellPrefix` in shell-theme.ts) that
rewrites `var(--mui-` references to `var(--shell-` in the shell theme's copy
of the shared component configs, and layout discipline in the preview area
(card padding is a fixed 16px and grid gaps sit on the shell's 8px scale,
outside the preview providers, in `src/app/shell-v2/PreviewArea.tsx`).

The challenge is that this insulation is partly convention, and changes leak
across it. Example in the code: when foundation settings took over the Menu
shadow in project themes, the shared baseline stopped hand-setting it, and
shell-theme.ts had to re-declare the chrome's own Menu `boxShadow` explicitly
or the shell's dropdowns would have changed as a side effect of a token
feature. Anyone touching `src/theme/shadcn-baseline.ts` needs to know the
shell consumes it too. The scheme-aware shell border
(`src/app/shell-v2/shell-border.ts`, black at 10% in light mode, white at 16%
in dark) exists for the same reason: the theme's own divider color was tried
and was nearly invisible in dark mode.

### One mapping path for preview and export

`projectToThemeOptions` in `src/theme/project-to-theme-options.ts` is the
single function that turns a project into MUI `ThemeOptions`. The live preview
theme (`createRuntimeTheme` in `src/theme/create-runtime-theme.ts`) is
`createTheme` over its output, and the exporter
(`src/generator/emit-theme-tsx.ts`) serializes the same output. Preview and
export therefore cannot drift for any wired token, by construction rather
than by test discipline.

The panels extend the same idea in the other direction. Since the audit fixes
of Nov 27, 2026 (task 4.1), the panels do not display model values or their
own copies of defaults; they read resolved values back out of the runtime
theme (`resolveSemanticColors`, `resolveSurfaceColors`,
`resolveTypographyVariants` in create-runtime-theme.ts). What the panel
shows is what the theme applies, including MUI's own derivations (for
example, semantic `light`/`dark` shades that the project never stored). This
is the right architecture, and it has a cost, noted in section 3: each
resolver builds a fresh theme.

### The createTheme oracle

The MUI Default preset promises to reproduce plain MUI exactly. That promise
is tested against the library itself: `src/domain/project/theme-presets.test.ts`
builds `createTheme()` with no arguments and compares the preset's resolved
palette and typography against it. When the typography model gained
`textTransform` (task 1.5), the oracle is what proved the gap had only ever
been at the stored-options level: MUI's merge had been filling `uppercase`
in for Button and Overline at resolution all along. Using the library as its
own specification is the strongest test pattern in the repo, and it is the
reason preset work starts with a probe against `createTheme`, not with
assumptions about MUI defaults.

### A sparse, token-first model with fill-forward migration

A `ThemeProject` (`src/domain/project/theme-project.types.ts`) stores only
what the user set. Everything else is layered at theme-build time: foundation
resolvers in `src/domain/foundation-defaults.ts` fill omitted groups, and
`src/theme/shadcn-baseline.ts` supplies the styled baseline under everything.
Projects are persisted in IndexedDB (`src/persistence/`) and can be imported
and exported as JSON.

Migration (`src/domain/project/migrate-theme-project.ts`) follows one rule:
fill per key, with exactly the values the project's theme already resolved
to, and never overwrite a stored value. A project saved before the Grey and
Action palette groups existed (task 3.6) gains those groups on load and
renders identically. Import is gated by `validate-theme-project.ts` before
migration runs. The discipline matters because there is no server and no
other copy of a user's project; a migration that restyles saved work is
unrecoverable.

### Merge semantics are not uniform, and it bites

Component overrides merge deeply: `mergeThemeComponents`
(`src/theme/merge-theme-components.ts`) is a recursive object merge, and
`projectToThemeOptions` layers baseline, external-label components,
foundation components, and the Button/Select/TextField adapters in that
order. Typography does not merge that way. The typography adapter
(`src/theme/typography-adapter.ts`) spreads stored variants over the baseline
at the variant level, so a stored variant replaces the baseline's variant
wholesale. This is not theoretical: during task 1.5, storing a
`{ textTransform }`-only Button variant for the Black preset would have
silently dropped the baseline's Button `lineHeight` and `letterSpacing`.
The fix was to store nothing and let MUI's fill-in stand. Anyone adding
per-variant storage needs to know which merge they are under.

### Where the model cannot express what MUI can

A recurring tension, each instance documented in the code or the status file:

- `textTransform` was inexpressible until Nov 26, 2026 (task 1.5); the model
  grows one field at a time, driven by preset fidelity.
- MUI's action colors are alpha-bearing `rgba()` strings. The color model
  and picker are hex-only, so the Color panel edits action colors as text
  and opacity fields rather than through the picker (task 3.6), a deliberate
  deviation to avoid converting values and restyling themes.
- MUI's grey A-shades (A100 and friends) are not modeled; MUI fills them.
- Number Field does not exist in `@mui/material` 9.3.1, so the preview
  registry omits it rather than faking it; the registry tests pin the
  deliberate omissions (CSS Baseline, Global Styles, No SSR, Transitions are
  likewise excluded by name, with reasons in
  `src/app/shell-v2/component-registry.tsx`).

### The exporter has to serialize live values

Theme options are not plain data: they contain a React component (the
Phosphor caret-down dropdown icon) and an element built from it. The emitter
(`emit-theme-tsx.ts` plus `emit-typescript-value.ts`) keeps a reference map
from those live values to source text, and emits a preamble that rebuilds
the wrapper in the consumer's file from `@phosphor-icons/react`. The
generated fixture (`generated-fixtures/default/theme.tsx`, 402 lines) is
compared byte-for-byte against the emitter's output in tests and compiled by
`npm run verify:generated`, so exporter drift fails loudly.

### The snapshot-push workflow

This working copy is not a git checkout. Work is pushed as whole-tree
snapshots through the GitHub connector (`push-files`), which cannot delete
files; deletions are separate commits (for example, the old shell theme file
was removed in its own commit, 31f0b82). The deploy workflow
(`.github/workflows/deploy.yml`) is excluded from every push because the
connector's GitHub App lacks Workflows permission; it was added through the
GitHub website and must be edited there. The only local record of what was
pushed is `~/workspace/mui-theme-builder.muse-github-snapshot-sync.json`
(45 entries at the time of writing), outside the repo tree. Practical
consequences: there is no local diff or blame, pushes occasionally report
errors but land (verify the head before re-pushing), and two chats working
on the project at once must coordinate through the head commit, not branches.

### Test strategy

321 tests, weighted toward agreements rather than implementation details:
stored project to theme options to runtime theme to exported text
(`project-to-theme-options.test.ts`, `emit-theme-tsx.test.ts`,
`theme-presets.test.ts`); panels wired to the real reducer and rendering the
real shell (`panel-wiring.test.tsx`); the registry's exact contents,
including its deliberate omissions (`component-registry.test.ts`,
`component-registry-cards.test.tsx`). The suite is the safety net that makes
the snapshot workflow survivable: without local git, "the tests pass and the
head moved by one commit" is most of the change review available.

One leftover worth knowing: `src/editor/controls/` is dead code from the
removed first shell. Nothing outside that directory imports it (verified by
search); it survives because the Phase 7 cleanup deleted the old shell's
files but left this directory in place.

## 2. Important and noteworthy files

Ordered by how foundational each is to working on the project.

| File | Purpose and why it matters |
| --- | --- |
| `PROJECT_STATUS.md` | The plan of record: milestones, completed tasks, open tasks with effort tags. Read first. It is updated in the same commit as the work it describes; a change that does not update it is unfinished. |
| `TECHNICAL_PRD.md` | Architecture and requirements, plus the decision log (Section 21) where design decisions and their reasoning live, dated. Check it before relitigating a settled choice. |
| `src/domain/project/theme-project.types.ts` | The project model: schemes, foundations, component settings, all optional beyond metadata. Everything else is a view of this type. |
| `src/domain/foundation-defaults.ts` | The locked defaults and the resolvers that fill omitted foundation groups (spacing, shadows, breakpoints, transitions, z-index). The single source for "what an unset token means". |
| `src/domain/project/create-default-project.ts` and `create-mui-default-project.ts` | The two preset factories: Black (the styled shadcn baseline, and the startup project) and MUI Default (oracle-checked plain MUI). `theme-presets.ts` registers them and derives their panel dots from their own palettes. |
| `src/domain/project/migrate-theme-project.ts` | Fill-forward migration on load and import. Per-key fills that never overwrite and never restyle; the file to be most careful with in the repo. |
| `src/domain/project/validate-theme-project.ts` | Import validation that runs before migration, including hex-shape checks on palette strings. The trust boundary for project JSON. |
| `src/theme/project-to-theme-options.ts` | The one mapping from project to `ThemeOptions`, shared by preview and export. Densely commented with the reasoning behind each foundation-to-component wiring; read the comments before changing a line. |
| `src/theme/shadcn-baseline.ts` | The styled baseline (components and typography) layered under every project theme, and, via the shell theme, under the builder's chrome too. Changes here move everything. |
| `src/theme/merge-theme-components.ts` | The recursive deep merge for component overrides. Small file, load-bearing semantics; contrast with the typography adapter's shallow variant spread. |
| `src/theme/create-runtime-theme.ts` | Builds the preview theme and hosts the resolvers the panels read resolved values from (semantic colors, surface colors, typography variants, including the rem/em to px conversions). |
| `src/theme/palette-adapter.ts`, `typography-adapter.ts`, `src/theme/component-adapters/` | Per-area translation from model settings to MUI options. The typography adapter is the one deliberate type-widening cast in the codebase; it says so in its comment. |
| `src/generator/emit-theme-tsx.ts` and `emit-typescript-value.ts` | The exporter: serializes theme options to `theme.tsx`, with the reference map and preamble for the live dropdown-icon values. |
| `generated-fixtures/default/theme.tsx` | The exporter's output for the default project, byte-compared in tests and compiled by `verify:generated`. If your change moves it, the diff is your change's blast radius. |
| `src/app/shell-v2/shell-theme.ts` | The shell's fixed theme and the insulation mechanism (cssVarPrefix `shell`, the `var(--mui-` to `var(--shell-` rewrite). Read before touching anything the chrome renders. |
| `src/app/shell-v2/shell-border.ts` | The scheme-aware shell border and the resize-edge active color. Tiny file; exists because the theme's divider color failed in dark mode. |
| `src/state/editor-reducer.ts` and `editor-state.types.ts` | All editor state and every action, including undo/redo history (capped at 50 projects) and per-section reset. Panel work is mostly dispatching actions defined here. |
| `src/app/shell-v2/NewShell.tsx` | The v2 shell layout: token tab list, resizable left panel (width persisted to localStorage via `panel-width.ts`), preview area. |
| `src/app/shell-v2/TokenPanel.tsx` | The Color tab panel (972 lines, the largest panel): semantic, grey, action, text, background, and divider rows, all reading resolved theme values. Hosts the color picker and palette browser. |
| `src/app/shell-v2/TypographyPanel.tsx` | The Typography tab: variant list and editor reading `resolveTypographyVariants`, so specimens show applied values. |
| `src/app/shell-v2/ColorPicker.tsx`, `PaletteBrowser.tsx`, `mui-palette.ts` | The hex picker popover and the MUI palette browser inside it. `mui-palette.ts` builds its 268 swatches at module load from the installed `@mui/material/colors`, so it cannot drift from the shipped tokens. |
| `src/app/shell-v2/SpacingPanel.tsx`, `RadiusPanel.tsx`, `ShadowsPanel.tsx`, `OtherPanel.tsx` | The remaining token tabs: density presets, radius presets (Sharp 0, Rounded 8 default, Full 99), shadow groups, and the Other groups (breakpoints, transitions, z-index). |
| `src/app/shell-v2/component-registry.tsx` and `component-demos.tsx` | The preview registry (49 cards, seven categories, search and grouping) and the demo content each card renders. `component-demos.tsx` at 1,578 lines is the largest file in the repo. |
| `src/preview/PreviewProvider.tsx` and `PreviewBoundary.tsx` | The provider that builds the runtime theme (memoized on the project) for the preview area, and the error boundary that keeps a bad theme from taking down the shell. |
| `src/persistence/indexed-db-repository.ts`, `export-project.ts`, `import-project.ts` | Local storage and project file interchange. Load path is repository, then migrate, then validate on import. |
| `src/domain/project/theme-presets.test.ts` | The oracle tests against plain `createTheme()`. The first test file to check when a preset value is in question. |
| `src/theme/project-to-theme-options.test.ts` and `src/generator/emit-theme-tsx.test.ts` | The agreement tests: mapping characterization, and exporter output pinned to the generated fixture byte-for-byte. |
| `src/app/shell-v2/panel-wiring.test.tsx` | Renders the real shell against the real reducer; where panel behavior regressions surface. |
| `.github/workflows/deploy.yml` | GitHub Pages deploy on push to main (Node 22, `npm ci`, `npm run build`). Excluded from snapshot pushes; edit it on the GitHub website, never via the connector. |
| `~/workspace/mui-theme-builder.muse-github-snapshot-sync.json` | Outside the repo: the push ledger (commit SHA and file list per push). The only local history the snapshot workflow keeps. |

## 3. Performance and architecture improvements, stack ranked

Measurements below are from a fresh production build and a full test run on
Nov 27, 2026, on this project's constrained build VM (1.5 shared CPUs).
Absolute numbers will differ on a developer laptop; the relative findings
are the point. Items are ordered by expected value, judgment, most valuable
first.

### 1. Code-split the production bundle

- Evidence: `npm run build` produces a single JavaScript chunk of 862.9 kB
  (250.5 kB gzip) plus a 0.7 kB HTML shell. Vite warns about chunks over
  500 kB. There are no dynamic imports anywhere in `src` (verified by
  search), so everything loads up front: all of MUI, the preview demo
  content (component-demos.tsx alone is 1,578 lines), the palette data built
  from `@mui/material/colors`, and the generated-code drawer.
- Proposal: lazy-load the export drawer and the palette browser first (both
  are opened on demand and neither is needed for first paint), then consider
  splitting the preview demos by category.
- Expected impact: meaningfully smaller initial download and parse on the
  deployed site; the editor is a tool people reopen, so this is a first-load
  improvement, not an interaction one.
- Effort: small to medium. Risk: low; static hosting serves chunks fine, and
  the split points are already component boundaries. The main care needed is
  keeping the shell's first paint free of layout shift when a lazy panel
  arrives.

### 2. Build the runtime theme once per project change, not once per resolver

- Evidence: `resolveSemanticColors`, `resolveSurfaceColors`, and
  `resolveTypographyVariants` in create-runtime-theme.ts each call
  `createRuntimeTheme(project)`, which runs the full mapping plus
  `createTheme`. On a single project change, the Color panel builds two
  themes (its two memoized resolvers), the Typography panel builds another,
  and `PreviewProvider` builds its own: up to four full theme constructions
  per edit, and `createTheme` with CSS variables is one of the more
  expensive calls in MUI.
- Proposal: resolve all panel values from one shared theme instance per
  project (a memoized builder the resolvers accept, or a small cache keyed
  by project reference; the reducer's immutable updates make reference
  equality a sound key).
- Expected impact: removes duplicated work from every token edit, which is
  the app's hottest interaction path (sliders, steppers, color fields).
- Effort: small. Risk: low; the resolvers are pure functions of the project,
  and the agreement tests pin their outputs.

### 3. Give the typography merge the same depth as the components merge

- Evidence: components merge recursively (merge-theme-components.ts);
  typography variants replace wholesale (typography-adapter.ts, spread in
  project-to-theme-options.ts). The task 1.5 work had to avoid storing a
  partial variant for exactly this reason, and the Phase 6 component editors
  (open task 1.1) will push more per-variant and per-component storage
  through this boundary.
- Proposal: merge stored typography variants field-by-field over the
  baseline variant, the way components already merge, so a stored variant
  means "these fields, over the baseline" everywhere in the model.
- Expected impact: removes a known silent-data-loss shape before more
  features build on it; makes preset factories free to store partial
  variants.
- Effort: medium. Risk: medium. Layering changes can move resolved values;
  the oracle tests and the panel specimen tests are the net, and every
  preset's resolved typography should be diffed before and after.

### 4. Reduce full-suite test wall time in constrained environments

- Evidence: the full suite (321 tests, 30 files) took 160 seconds of test
  time on this VM, and heavy render tests have repeatedly needed a
  `{ timeout: 20000 }` accommodation to pass under full-suite load here.
  The largest offenders by file size are the shell render tests
  (component-registry-cards.test.tsx at 901 lines renders every preview
  card; panel-wiring.test.tsx at 498 lines renders the full shell).
- Proposal: split the suite into a fast unit tier and a render tier so the
  fast tier gives a quick signal, and profile the render tier before
  optimizing it. Do not thin the agreement tests; they are the project's
  main safety net.
- Expected impact: faster feedback in CI and agent environments; on a normal
  laptop the suite is presumably already acceptable (judgment, not
  measured), which is why this ranks below the user-facing items.
- Effort: medium. Risk: medium if it tempts anyone to cut coverage; the
  split should change scheduling, not assertions.

### 5. Narrow the two deliberate type-system escape hatches

- Evidence: typography-adapter.ts widens the builder's narrower typography
  values with an `as ThemeOptions['typography']` cast (documented in its
  comment as the one place that widens), and merge-theme-components.ts
  merges through `unknown` and `Record<string, unknown>` and casts the
  result. Both are contained and commented, but a malformed value introduced
  through either path would pass the compiler silently.
- Proposal: leave the merge as is (its inputs are all internally built,
  typed options), and consider a mapped type for the typography widening so
  new model fields fail to compile until the adapter handles them. Imported
  projects are already runtime-validated, so the residual exposure is small.
- Expected impact: mostly future-proofing; turns a class of silent drift
  into compile errors when the typography model grows.
- Effort: small to medium. Risk: low. Ranked low because the current
  exposure is genuinely narrow; this is hygiene, not a fix.

### 6. Replace or shore up the snapshot-push workflow

- Evidence: pushes cannot delete files (deletions are separate commits),
  carry no local history or diff, and occasionally report errors while
  landing, so every push needs a head check before and after. The sync
  ledger outside the repo is the only record. The deploy workflow is
  permanently outside this flow.
- Proposal: this is a tooling constraint, not a code problem (judgment).
  If a real git checkout ever becomes available to the editing workflow,
  take it; until then, the current discipline (manifest exclusions, head
  verification, sync ledger, tests as review) is the mitigation, and it has
  held up across 45 recorded pushes.
- Expected impact: better change review and recovery if solved; nothing
  user-facing.
- Effort: unknown, depends on tooling outside the repo. Risk: changing the
  workflow mid-project has its own cost; ranked last among the real items
  for that reason.

### Areas checked that need nothing

- Undo history: the reducer caps history at 50 entries and stores whole
  project objects, but updates are immutable spreads, so entries share
  structure and the memory cost is modest. No change warranted at current
  project sizes.
- Preview rendering: all 49 cards render in one grid under one
  `PreviewProvider`, and every project change re-renders them under a new
  theme. On desktop hardware this has not presented as a problem worth
  measuring ahead of items 1 and 2 (judgment); if interaction profiling
  ever points here, card-level memoization is the first lever, not
  virtualization.
- Dependencies: six runtime packages, icons imported per icon from
  `@phosphor-icons/react/dist/csr/*`, fonts loaded from Google Fonts with a
  catalog-driven snippet. Nothing extraneous found.
