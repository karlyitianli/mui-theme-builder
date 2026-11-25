// Shared foundation defaults for the whole builder. Both shells and the
// theme mapping read these so an unset value means the same thing
// everywhere.
//
// DEFAULT_SPACING is 4px: Karl locked the base unit at 4px on Nov 23,
// 2026, superseding the old shell inspector's 8px fallback (MUI's own
// default). Older saved projects gain spacing: 4 through migration (see
// migrate-theme-project.ts), so the exported theme matches what the
// panels show.
export const DEFAULT_SPACING = 4;
export const DEFAULT_BORDER_RADIUS = 6;
export const DEFAULT_CARD_BORDER_RADIUS = 12;

export interface ShadowSettings {
  global?: number;
  button?: number;
  card?: number;
  input?: number;
}

// Karl's locked shadow values (Nov 23, 2026): the Medium preset.
export const DEFAULT_SHADOWS: Required<ShadowSettings> = {
  global: 2,
  button: 2,
  card: 1,
  input: 0,
};

export function resolveShadows(shadows?: ShadowSettings): Required<ShadowSettings> {
  return { ...DEFAULT_SHADOWS, ...shadows };
}
