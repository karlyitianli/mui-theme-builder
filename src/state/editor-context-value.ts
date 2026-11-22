import { createContext, type Dispatch } from 'react';

import type { EditorAction, EditorState } from './editor-state.types';

export const EditorStateContext = createContext<EditorState | null>(null);
export const EditorDispatchContext = createContext<Dispatch<EditorAction> | null>(null);
