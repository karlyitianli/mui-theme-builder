import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import { NewShell } from './NewShell';
import { PANEL_WIDTH_STORAGE_KEY } from './panel-width';

// The token panel's right-edge handle resizes the panel by pointer
// drag (and by arrow keys), clamps the width, and persists it to
// localStorage; a stored width is picked up on the next mount. Each
// test renders the whole shell, so they carry the longer timeout
// App.test.tsx uses for the same reason.
function renderShell() {
  return render(
    <EditorStateContext value={createInitialEditorState()}>
      <EditorDispatchContext value={() => undefined}>
        <NewShell />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

describe('NewShell panel resize handle', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.removeItem(PANEL_WIDTH_STORAGE_KEY);
  });

  it('starts at the 320 default when nothing is stored', { timeout: 20000 }, () => {
    renderShell();
    expect(screen.getByTestId('panel-resize-handle')).toHaveAttribute(
      'aria-valuenow',
      '320',
    );
  });

  it('starts at the stored width when one is saved', { timeout: 20000 }, () => {
    window.localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, '456');
    renderShell();
    expect(screen.getByTestId('panel-resize-handle')).toHaveAttribute(
      'aria-valuenow',
      '456',
    );
  });

  it('drags to a new width and persists it on release', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    fireEvent.pointerDown(handle, { clientX: 320 });
    fireEvent.pointerMove(window, { clientX: 420 });
    expect(handle).toHaveAttribute('aria-valuenow', '420');
    fireEvent.pointerUp(window);
    expect(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)).toBe('420');
  });

  it('clamps the drag at the maximum and minimum widths', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    fireEvent.pointerDown(handle, { clientX: 320 });
    fireEvent.pointerMove(window, { clientX: 4000 });
    expect(handle).toHaveAttribute('aria-valuenow', '640');
    fireEvent.pointerMove(window, { clientX: -4000 });
    expect(handle).toHaveAttribute('aria-valuenow', '240');
    fireEvent.pointerUp(window);
    expect(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)).toBe('240');
  });

  it('resizes with the arrow keys and persists each step', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    fireEvent.keyDown(handle, { key: 'ArrowRight' });
    expect(handle).toHaveAttribute('aria-valuenow', '330');
    expect(window.localStorage.getItem(PANEL_WIDTH_STORAGE_KEY)).toBe('330');
    fireEvent.keyDown(handle, { key: 'ArrowLeft' });
    expect(handle).toHaveAttribute('aria-valuenow', '320');
  });
});
