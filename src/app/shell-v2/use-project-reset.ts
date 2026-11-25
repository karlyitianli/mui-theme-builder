import { useState } from 'react';

import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';

// Shared reset flow for the v2 shell (Phase 4), used by both the top bar
// Reset button and the preset selector: resetting loads the default
// project through the reducer's existing 'reset-project' action, the same
// path the original shell's toolbar uses, so a reset stays undoable.
//
// Dirty signal: the reducer's history. A non-empty past stack means the
// user has edits a reset would bury, so the caller shows the confirm
// dialog (reset-project-dialog.tsx) first. With an empty history there
// is nothing to lose and requestReset applies immediately.
export function useProjectReset(): {
  cancelReset: () => void;
  confirmOpen: boolean;
  confirmReset: () => void;
  requestReset: () => void;
} {
  const { past } = useEditorState();
  const dispatch = useEditorDispatch();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const requestReset = () => {
    if (past.length === 0) {
      dispatch({ type: 'reset-project' });
    } else {
      setConfirmOpen(true);
    }
  };

  const cancelReset = () => setConfirmOpen(false);

  const confirmReset = () => {
    dispatch({ type: 'reset-project' });
    setConfirmOpen(false);
  };

  return { cancelReset, confirmOpen, confirmReset, requestReset };
}
