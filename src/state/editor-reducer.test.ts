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

describe('editorReducer semantic color variants', () => {
  it('setting a main color without a variant keeps the main-only behavior', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'primary',
      color: '#6750a4',
    });
    expect(next.project.colorSchemes.light.palette?.primary).toEqual({ main: '#6750a4' });
    expect(next.past).toHaveLength(1);
  });

  it('pinning a light variant on an unstored role seeds main with the effective default', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'primary',
      variant: 'light',
      color: '#aabbcc',
    });
    expect(next.project.colorSchemes.light.palette?.primary).toEqual({
      main: '#171717',
      light: '#aabbcc',
    });
    expect(next.past).toHaveLength(1);
  });

  it('pinning a variant on a role the baseline omits seeds the MUI default main', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'warning',
      variant: 'dark',
      color: '#112233',
    });
    expect(next.project.colorSchemes.light.palette?.warning).toEqual({
      main: '#ed6c02',
      dark: '#112233',
    });
  });

  it('pinning a variant preserves a stored main and leaves the other scheme untouched', () => {
    const state = createInitialEditorState();
    const withMain = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'dark',
      role: 'primary',
      color: '#d0bcff',
    });
    const pinned = editorReducer(withMain, {
      type: 'set-semantic-color',
      mode: 'dark',
      role: 'primary',
      variant: 'dark',
      color: '#111111',
    });
    expect(pinned.project.colorSchemes.dark.palette?.primary).toEqual({
      main: '#d0bcff',
      dark: '#111111',
    });
    expect(pinned.project.colorSchemes.light.palette?.primary).toBeUndefined();
  });

  it('clearing a pinned variant removes only that variant, as one undoable step', () => {
    const state = createInitialEditorState();
    const pinned = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'primary',
      variant: 'light',
      color: '#aabbcc',
    });
    const cleared = editorReducer(pinned, {
      type: 'clear-semantic-color-variant',
      mode: 'light',
      role: 'primary',
      variant: 'light',
    });
    expect(cleared.project.colorSchemes.light.palette?.primary).toEqual({ main: '#171717' });
    expect(cleared.past).toHaveLength(2);
    const undone = editorReducer(cleared, { type: 'undo' });
    expect(undone.project.colorSchemes.light.palette?.primary).toEqual({
      main: '#171717',
      light: '#aabbcc',
    });
  });

  it('clearing an unpinned variant is a no-op', () => {
    const state = createInitialEditorState();
    const next = editorReducer(state, {
      type: 'clear-semantic-color-variant',
      mode: 'light',
      role: 'primary',
      variant: 'light',
    });
    expect(next).toBe(state);
  });

  it('pinning a variant to its already stored value is a no-op, and undo unpins a fresh pin', () => {
    const state = createInitialEditorState();
    const pinned = editorReducer(state, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'primary',
      variant: 'dark',
      color: '#445566',
    });
    const repinned = editorReducer(pinned, {
      type: 'set-semantic-color',
      mode: 'light',
      role: 'primary',
      variant: 'dark',
      color: '#445566',
    });
    expect(repinned).toBe(pinned);
    const undone = editorReducer(pinned, { type: 'undo' });
    expect(undone.project.colorSchemes.light.palette?.primary).toBeUndefined();
  });

  it('a typography textTransform edit stores the value, and clearing removes the key (task 1.5)', () => {
    const state = createInitialEditorState();
    const set = editorReducer(state, {
      type: 'set-typography-variant',
      variant: 'button',
      patch: { textTransform: 'uppercase' },
    });
    expect(set.project.foundations?.typography?.variants?.button?.textTransform).toBe('uppercase');
    expect(set.past).toHaveLength(1);
    // The panel's Auto choice patches the field with no value; the
    // stored variant must lose the key entirely, not carry an
    // undefined, so the emitted options omit it and MUI's defaults
    // apply. Each edit is its own undo step.
    const cleared = editorReducer(set, {
      type: 'set-typography-variant',
      variant: 'button',
      patch: { textTransform: undefined },
    });
    const button = cleared.project.foundations?.typography?.variants?.button;
    expect(button?.textTransform).toBeUndefined();
    expect(button !== undefined && 'textTransform' in button).toBe(false);
    expect(cleared.past).toHaveLength(2);
    const undone = editorReducer(cleared, { type: 'undo' });
    expect(undone.project.foundations?.typography?.variants?.button?.textTransform).toBe(
      'uppercase',
    );
  });
});
