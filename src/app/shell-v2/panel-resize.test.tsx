import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import { NewShell } from './NewShell';
import { PANEL_WIDTH_STORAGE_KEY } from './panel-width';

// The token panel's right-edge handle resizes the panel by pointer
// drag (and by arrow keys), clamps the width, and persists it to
// localStorage; a stored width is picked up on the next mount. The
// last tests cover the edge's appearance: no grip notch anywhere,
// the resize cursor, and the whole edge turning blue on hover and
// for the length of a drag. Each test renders the whole shell, so
// they carry the longer timeout App.test.tsx uses for the same
// reason.
function renderShell() {
  return render(
    <EditorStateContext value={createInitialEditorState()}>
      <EditorDispatchContext value={() => undefined}>
        <NewShell />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

// The generated CSS rules for an element, following the extraction
// pattern preview-card.test.tsx uses: emotion writes the sx styles
// into <style> tags, keyed by the element's css-* classes.
function documentStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .join('\n');
}

function rulesFor(element: Element): string {
  const css = documentStyles();
  return (element.className?.split(' ') ?? [])
    .filter((cls) => cls.startsWith('css-'))
    .map((cls) => {
      const match = css.match(new RegExp(`\\.${cls}\\{[^}]*\\}`));
      return match?.[0] ?? '';
    })
    .join('\n');
}

// The generated ::before rule for one state of the element: the
// plain rule (state ''), or the :hover one. The state rules are
// generated as a selector list (`.cls:hover::before,.cls:focus-
// visible::before{...}`), so the match runs from the state's
// selector through to the rule's closing brace.
function pseudoRuleFor(element: Element, state: '' | ':hover'): string {
  const css = documentStyles();
  return (element.className?.split(' ') ?? [])
    .filter((cls) => cls.startsWith('css-'))
    .map((cls) => {
      const match = css.match(
        new RegExp(`\\.${cls}${state}::before[^{]*\\{[^}]*\\}`),
      );
      return match?.[0] ?? '';
    })
    .join('\n');
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

  it('renders no grip notch on the edge, at rest or while dragging', { timeout: 20000 }, () => {
    // The notch was a pill in the middle of the edge, marked with
    // the panel-resize-grip class; Karl asked for it gone in every
    // state (Nov 25, 2026).
    const { container } = renderShell();
    expect(container.querySelector('.panel-resize-grip')).toBeNull();
    const handle = screen.getByTestId('panel-resize-handle');
    fireEvent.pointerDown(handle, { clientX: 320 });
    expect(container.querySelector('.panel-resize-grip')).toBeNull();
    fireEvent.pointerUp(window);
    expect(container.querySelector('.panel-resize-grip')).toBeNull();
  });

  it('carries the resize cursor and turns the whole edge blue on hover', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    expect(rulesFor(handle)).toContain('cursor:col-resize');
    // The edge line is the handle's ::before; its hover rule paints
    // it the active blue (shell-border.ts).
    expect(pseudoRuleFor(handle, ':hover')).toContain(
      'background-color:#2196f3',
    );
    // At rest the line itself is transparent, so the panel's own
    // border is what shows.
    expect(pseudoRuleFor(handle, '')).toContain(
      'background-color:transparent',
    );
  });

  it('keeps the edge line exactly 1px wide', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    // Regression: the line's width was declared as a bare 1 in the
    // sx object, which MUI reads as the sizing fraction (100%), so
    // the line rendered the handle's full 10px instead of 1px.
    expect(pseudoRuleFor(handle, '')).toContain('width:1px');
    expect(pseudoRuleFor(handle, '')).not.toContain('width:100%');
  });

  it('keeps the edge blue through a drag and restores it on release', { timeout: 20000 }, () => {
    renderShell();
    const handle = screen.getByTestId('panel-resize-handle');
    fireEvent.pointerDown(handle, { clientX: 320 });
    expect(pseudoRuleFor(handle, '')).toContain(
      'background-color:#2196f3',
    );
    // The drag state, not the pointer position, holds the blue, so
    // it survives the pointer moving off the edge mid-drag.
    fireEvent.pointerMove(window, { clientX: 420 });
    expect(pseudoRuleFor(handle, '')).toContain(
      'background-color:#2196f3',
    );
    fireEvent.pointerUp(window);
    expect(pseudoRuleFor(handle, '')).toContain(
      'background-color:transparent',
    );
    expect(pseudoRuleFor(handle, '')).not.toContain('#2196f3');
  });
});
