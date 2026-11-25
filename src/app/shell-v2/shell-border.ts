import type { PreviewMode } from '../../state/editor-state.types';

// The one shared source for the v2 shell's border, scheme-aware
// (Karl, Nov 25, 2026): black at 10 percent reads as a soft edge on
// the light background but vanishes on the dark #0a0a0a one, so dark
// mode uses white at 16 percent instead, a comparable visual weight
// that stays visible next to the preview controls. The theme's
// divider color is not an option (the dark divider, #262626, is
// nearly as invisible as the black border). This lives in its own
// module, like shell-switch.ts and color-utils.ts, because
// primitives.tsx exports components and the react-refresh lint rule
// only allows constant exports alongside them.
export function shellBorderForMode(mode: PreviewMode): string {
  return mode === 'dark'
    ? '1px solid rgba(255, 255, 255, 0.16)'
    : '1px solid rgba(0, 0, 0, 0.1)';
}
