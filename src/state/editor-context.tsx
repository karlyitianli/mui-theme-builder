import { useEffect, useReducer, type ReactNode } from 'react';

import { indexedDbProjectRepository } from '../persistence/indexed-db-repository';
import { EditorDispatchContext, EditorStateContext } from './editor-context-value';
import { createInitialEditorState, editorReducer } from './editor-reducer';

export function EditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);

  useEffect(() => {
    let active = true;
    indexedDbProjectRepository
      .load()
      .then((project) => active && dispatch({ type: 'restore-project', project }))
      .catch(() => active && dispatch({ type: 'restore-project' }));
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const timer = window.setTimeout(() => {
      dispatch({ type: 'set-save-status', status: 'saving' });
      indexedDbProjectRepository
        .save(state.project)
        .then(() => dispatch({ type: 'set-save-status', status: 'saved' }))
        .catch(() => dispatch({ type: 'set-save-status', status: 'error' }));
    }, 500);
    return () => window.clearTimeout(timer);
  }, [state.hydrated, state.project]);

  return (
    <EditorStateContext value={state}>
      <EditorDispatchContext value={dispatch}>{children}</EditorDispatchContext>
    </EditorStateContext>
  );
}
