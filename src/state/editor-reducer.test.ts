import { describe, expect, it } from 'vitest';

import { createInitialEditorState, editorReducer } from './editor-reducer';

// Characterization tests for the editor reducer, including the existing
// undo/redo history (project-only, capped) that later phases build on.
describe('editorReducer (characterization)', () => {
  it('starts with the default project and empty history', () => {
    const state = createInitialEditorState();
    expect(state.project.metadata.name).toBe('Untitled theme');
    expect(state.past).toHaveLength(0);
    expect(state.future).toHaveLength(0);
    expect(state.activeMode).toBe('light');
  });

  it('switching section is UI state only: project and history untouched', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, { type: 'set-active-section', section: 'typography' });
    expect(next.activeSection).toBe('typography');
    expect(next.project).toBe(state.project);
    expect(next.past).toHaveLength(0);
  });

  it('renaming the project commits one history entry', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, { type: 'rename-project', name: 'My theme' });
    expect(next.project.metadata.name).toBe('My theme');
    expect(next.past).toHaveLength(1);
    expect(next.future).toHaveLength(0);
  });

  it('undo restores the previous project and redo reapplies it', () => {
    const state = createInitialEditorState();
    const renamed = editorReducer(state, { type: 'rename-project', name: 'My theme' });
    const undone = editorReducer(renamed, { type: 'undo' });
    expect(undone.project.metadata.name).toBe('Untitled theme');
    const redone = editorReducer(undone, { type: 'redo' });
    expect(redone.project.metadata.name).toBe('My theme');
  });

  it('setting border radius writes foundations.shape on the project', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, { type: 'set-border-radius', value: 12 });
    expect(next.project.foundations?.shape?.borderRadius).toBe(12);
    expect(next.past).toHaveLength(1);
  });
});
