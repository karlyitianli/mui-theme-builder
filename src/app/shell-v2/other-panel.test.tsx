import { useReducer } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { useEditorState } from '../../state/editor-hooks';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import { TokenPanel } from './TokenPanel';

// Task 3.5: the Other tab edits breakpoints, transitions, and z-index
// through the real editor reducer, like the panel-wiring tests for the
// Phase 5 panels. A fresh project stores MUI's defaults for all three
// groups, so the fields open on those values.
function Probe() {
  const { project } = useEditorState();
  return <div data-testid="probe">{JSON.stringify(project)}</div>;
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
  const view = render(<Harness />);
  fireEvent.click(screen.getByText('Other'));
  return view;
}

function probeProject(): ThemeProject {
  return JSON.parse(screen.getByTestId('probe').textContent ?? '{}') as ThemeProject;
}

function editField(label: string, nextValue: string) {
  const input = screen.getByLabelText(label);
  fireEvent.change(input, { target: { value: nextValue } });
  fireEvent.blur(input);
  return input;
}

describe('OtherPanel (task 3.5)', () => {
  afterEach(() => cleanup());

  it('shows the three sections with the stored MUI defaults', () => {
    renderPanel();
    expect(screen.getByText('Breakpoints')).toBeInTheDocument();
    expect(screen.getByText('Transition duration')).toBeInTheDocument();
    expect(screen.getByText('Transition easing')).toBeInTheDocument();
    expect(screen.getByText('Z-Index')).toBeInTheDocument();
    expect(screen.getByLabelText('Breakpoint xs')).toHaveValue('0');
    expect(screen.getByLabelText('Breakpoint md')).toHaveValue('900');
    expect(screen.getByLabelText('Breakpoint xl')).toHaveValue('1536');
    expect(screen.getByLabelText('Duration shortest')).toHaveValue('150');
    expect(screen.getByLabelText('Duration standard')).toHaveValue('300');
    expect(screen.getByLabelText('Duration leavingScreen')).toHaveValue('195');
    expect(screen.getByLabelText('Easing easeInOut')).toHaveValue('cubic-bezier(0.4, 0, 0.2, 1)');
    expect(screen.getByLabelText('Easing sharp')).toHaveValue('cubic-bezier(0.4, 0, 0.6, 1)');
    expect(screen.getByLabelText('Z-index appBar')).toHaveValue('1100');
    expect(screen.getByLabelText('Z-index tooltip')).toHaveValue('1500');
  });

  it('commits a breakpoint edit to the project', () => {
    renderPanel();
    editField('Breakpoint md', '1000');
    expect(probeProject().foundations?.breakpoints?.md).toBe(1000);
    expect(screen.getByLabelText('Breakpoint md')).toHaveValue('1000');
  });

  it('commits duration, easing, and z-index edits to the project', () => {
    renderPanel();
    editField('Duration standard', '450');
    expect(probeProject().foundations?.transitions?.duration?.standard).toBe(450);
    editField('Easing easeOut', 'cubic-bezier(0.1, 0, 0.3, 1)');
    expect(probeProject().foundations?.transitions?.easing?.easeOut).toBe(
      'cubic-bezier(0.1, 0, 0.3, 1)',
    );
    editField('Z-index modal', '2000');
    expect(probeProject().foundations?.zIndex?.modal).toBe(2000);
  });

  it('ignores a non-numeric entry and shows the stored value again', () => {
    renderPanel();
    const input = editField('Breakpoint md', 'abc');
    expect(probeProject().foundations?.breakpoints?.md).toBe(900);
    expect(input).toHaveValue('900');
  });

  it('clamps an out-of-range entry instead of storing it', () => {
    renderPanel();
    editField('Breakpoint lg', '99999');
    expect(probeProject().foundations?.breakpoints?.lg).toBe(9999);
    editField('Duration short', '-5');
    expect(probeProject().foundations?.transitions?.duration?.short).toBe(0);
  });

  it('ignores an emptied easing field', () => {
    renderPanel();
    const input = editField('Easing easeIn', '  ');
    expect(probeProject().foundations?.transitions?.easing?.easeIn).toBe(
      'cubic-bezier(0.4, 0, 1, 1)',
    );
    expect(input).toHaveValue('cubic-bezier(0.4, 0, 1, 1)');
  });
});
