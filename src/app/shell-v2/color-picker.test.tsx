import { useReducer } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { useEditorState } from '../../state/editor-hooks';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import { TokenPanel } from './TokenPanel';

// The Color tab's picker popover: clicking a row's hex box opens it,
// drags and hex typing move a local draft, and only a finished gesture
// reaches the project (the probe reads the undo stack length back, so
// "one gesture, one step" is asserted, not assumed). jsdom has no
// layout, so the square and slider rects are stubbed per element, the
// same pattern token-tab-list.test.tsx uses.
function Probe() {
  const state = useEditorState();
  return (
    <div data-testid="probe">
      {JSON.stringify({
        activeMode: state.activeMode,
        past: state.past.length,
        project: state.project,
      })}
    </div>
  );
}

function renderPanel() {
  function Harness() {
    const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);
    return (
      <EditorStateContext value={state}>
        <EditorDispatchContext value={dispatch}>
          <TokenPanel />
          <Probe />
        </EditorDispatchContext>
      </EditorStateContext>
    );
  }
  return render(<Harness />);
}

function probeProject(): ThemeProject {
  const parsed = JSON.parse(screen.getByTestId('probe').textContent ?? '{}') as {
    project: ThemeProject;
  };
  return parsed.project;
}

function probePast(): number {
  const parsed = JSON.parse(screen.getByTestId('probe').textContent ?? '{}') as {
    past: number;
  };
  return parsed.past;
}

function hexInput(label: string): HTMLInputElement {
  return screen.getByLabelText(`${label} hex value`) as HTMLInputElement;
}

function stubRect(
  el: HTMLElement,
  rect: { height: number; left: number; top: number; width: number },
) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    bottom: rect.top + rect.height,
    height: rect.height,
    left: rect.left,
    right: rect.left + rect.width,
    top: rect.top,
    width: rect.width,
    x: rect.left,
    y: rect.top,
    toJSON: () => ({}),
  } as DOMRect);
}

describe('Color picker popover', () => {
  afterEach(() => cleanup());

  it('opens on hex box click with HEX as the one and only format', () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    expect(screen.getByTestId('color-picker-square')).toBeInTheDocument();
    expect(screen.getByTestId('color-picker-hue')).toBeInTheDocument();
    expect(hexInput('Primary').value).toBe('#171717');
    expect(screen.getByText('HEX')).toBeInTheDocument();
    expect(screen.queryByText('RGB')).not.toBeInTheDocument();
    expect(screen.queryByText('HSL')).not.toBeInTheDocument();
    // Opening alone edits nothing.
    expect(probePast()).toBe(0);
  });

  it('committing a typed hex updates the project in one step', () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    fireEvent.change(hexInput('Primary'), { target: { value: '#123456' } });
    // Typing is draft only until the field commits.
    expect(probePast()).toBe(0);
    fireEvent.blur(hexInput('Primary'));
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBe('#123456');
    expect(probePast()).toBe(1);
    expect(screen.getByText('#123456')).toBeInTheDocument();
  });

  it('a square drag moves the draft live and commits once on pointer up, then a hue drag does the same', () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    const square = screen.getByTestId('color-picker-square');
    stubRect(square, { height: 100, left: 0, top: 0, width: 200 });

    fireEvent.pointerDown(square, { clientX: 100, clientY: 50 });
    expect(hexInput('Primary').value).toBe('#804040');
    fireEvent.pointerMove(square, { clientX: 200, clientY: 0 });
    expect(hexInput('Primary').value).toBe('#ff0000');
    // Mid-drag the project and the undo stack are untouched.
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBeUndefined();
    expect(probePast()).toBe(0);

    fireEvent.pointerUp(square, { clientX: 200, clientY: 0 });
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBe('#ff0000');
    expect(probePast()).toBe(1);

    const hue = screen.getByTestId('color-picker-hue');
    stubRect(hue, { height: 12, left: 0, top: 0, width: 360 });
    fireEvent.pointerDown(hue, { clientX: 240, clientY: 6 });
    expect(hexInput('Primary').value).toBe('#0000ff');
    expect(probePast()).toBe(1);
    fireEvent.pointerUp(hue, { clientX: 240, clientY: 6 });
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBe('#0000ff');
    expect(probePast()).toBe(2);
  });

  it('an invalid hex reverts in the field without dispatching', () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    fireEvent.change(hexInput('Primary'), { target: { value: '#12' } });
    fireEvent.blur(hexInput('Primary'));
    expect(hexInput('Primary').value).toBe('#171717');
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBeUndefined();
    expect(probePast()).toBe(0);
  });

  it('Escape closes the picker and discards the uncommitted hex draft', () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    fireEvent.change(hexInput('Primary'), { target: { value: '#123456' } });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('color-picker-square')).not.toBeInTheDocument();
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBeUndefined();
    expect(probePast()).toBe(0);
    // Reopening starts fresh from the row's committed color.
    fireEvent.click(screen.getByText('#171717'));
    expect(hexInput('Primary').value).toBe('#171717');
  });

  it("clicking another row's hex box moves the picker to that row", () => {
    renderPanel();
    fireEvent.click(screen.getByText('#171717'));
    expect(hexInput('Primary').value).toBe('#171717');
    fireEvent.click(screen.getByText('#dc2626'));
    expect(screen.queryByLabelText('Primary hex value')).not.toBeInTheDocument();
    expect(hexInput('Error').value).toBe('#dc2626');
    expect(screen.getAllByTestId('color-picker-square')).toHaveLength(1);
  });

  it("the picker opens with the active scheme's colors", () => {
    renderPanel();
    fireEvent.click(screen.getByText('Dark'));
    // Dark Primary and Primary text both default to #fafafa; either row
    // proves the picker follows the scheme the panel is showing.
    fireEvent.click(screen.getAllByText('#fafafa')[0]);
    expect((screen.getByLabelText(/hex value/) as HTMLInputElement).value).toBe('#fafafa');
  });
});
