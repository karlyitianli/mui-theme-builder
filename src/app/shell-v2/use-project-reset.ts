import { useState } from 'react';

import type { ThemePresetId } from '../../domain/project';
import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';

// Shared reset flow for the v2 shell (Phase 4), used by both the top bar
// Reset button and the preset selector: resetting loads the startup
// preset's project (Black) through the reducer's 'reset-project'
// action, and choosing a preset loads that preset's project through
// 'load-preset'. Both go through the same flow, so a switch stays
// undoable.
//
// Dirty signal: the reducer's history. A non-empty past stack means the
// user has edits a reset would bury, so the caller shows the confirm
// dialog (reset-project-dialog.tsx) first. With an empty history there
// is nothing to lose and the request applies immediately.
export function useProjectReset(): {
  cancelReset: () => void;
  confirmOpen: boolean;
  confirmReset: () => void;
  requestPreset: (preset: ThemePresetId) => void;
  requestReset: () => void;
} {
  const { past } = useEditorState();
  const dispatch = useEditorDispatch();
  const [pending, setPending] = useState<
    { kind: 'reset' } | { kind: 'preset'; preset: ThemePresetId } | null
  >(null);

  const apply = (target: NonNullable<typeof pending>) => {
    if (target.kind === 'reset') {
      dispatch({ type: 'reset-project' });
    } else {
      dispatch({ type: 'load-preset', preset: target.preset });
    }
  };

  const request = (target: NonNullable<typeof pending>) => {
    if (past.length === 0) {
      apply(target);
    } else {
      setPending(target);
    }
  };

  const requestReset = () => request({ kind: 'reset' });
  const requestPreset = (preset: ThemePresetId) => request({ kind: 'preset', preset });

  const cancelReset = () => setPending(null);

  const confirmReset = () => {
    if (pending) apply(pending);
    setPending(null);
  };

  return {
    cancelReset,
    confirmOpen: pending !== null,
    confirmReset,
    requestPreset,
    requestReset,
  };
}
