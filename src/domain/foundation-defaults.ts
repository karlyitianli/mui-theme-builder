// Shared foundation defaults for the whole builder. Both shells and the
// theme mapping read these so an unset value means the same thing
// everywhere.
//
// DEFAULT_SPACING is 4px. It is the value an *unset* spacing resolves
// to: projects saved before spacing was stored carry none, and both the
// panel fallback and migration fill theirs with 4px, the base unit those
// projects were built and displayed with, so loading one never restyles
// it. It is no longer the default theme's base unit: the Black preset's
// project stores its 8px base explicitly (Karl's Nov 26, 2026 density
// decision: Comfortable, 8px, is the default selected preset).
export const DEFAULT_SPACING = 4;
export const DEFAULT_BORDER_RADIUS = 6;
export const DEFAULT_CARD_BORDER_RADIUS = 12;

export interface ShadowSettings {
  global?: number;
  button?: number;
  card?: number;
  input?: number;
  menu?: number;
}

// The builder's shadow defaults, Karl's Nov 26, 2026 configuration: no
// global elevation, with elevation carried by per-component overrides
// (Button, Card, Input, Menu). This is also the Shadows panel's "None"
// preset. It supersedes the Nov 23, 2026 Medium lock (global 2) as the
// value an unset shadow resolves to; projects that stored the Medium
// set keep it verbatim, migration only fills keys they never stored.
//
// The menu value is 8, MUI Menu's own default elevation. Until Nov 26,
// 2026 the Menu paper's shadow was a hand-set boxShadow in the shadcn
// baseline (0 8px 24px at 0.12); elevation 8's penumbra layer (0px 8px
// 10px at 0.14) is the closest single elevation on MUI's scale, so
// existing projects gain menu: 8 through migration and keep the same
// shadow depth.
export const DEFAULT_SHADOWS: Required<ShadowSettings> = {
  global: 0,
  button: 2,
  card: 1,
  input: 0,
  menu: 8,
};

export function resolveShadows(shadows?: ShadowSettings): Required<ShadowSettings> {
  return { ...DEFAULT_SHADOWS, ...shadows };
}
