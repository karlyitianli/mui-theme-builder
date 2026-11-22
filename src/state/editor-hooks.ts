import { useContext } from 'react';

import { EditorDispatchContext, EditorStateContext } from './editor-context-value';

export function useEditorState() {
  const state = useContext(EditorStateContext);
  if (!state) throw new Error('useEditorState must be used inside EditorProvider.');
  return state;
}

export function useEditorDispatch() {
  const dispatch = useContext(EditorDispatchContext);
  if (!dispatch) throw new Error('useEditorDispatch must be used inside EditorProvider.');
  return dispatch;
}
