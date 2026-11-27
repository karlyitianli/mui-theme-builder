import { useReducer } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { useEditorState } from '../../state/editor-hooks';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import { projectToThemeOptions } from '../../theme/project-to-theme-options';
import { TokenPanel } from './TokenPanel';

// The Color tab's MUI palette browser (task 3.3): it opens from a color
// field's picker, searches the official @mui/material/colors tokens,
// and picking a swatch commits through the row's usual action (the
// probe reads the undo stack length back, so "one pick, one step" is
// asserted, not assumed), pinning a semantic variant like a typed hex.
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

function rowElement(label: string): HTMLElement {
  const row = screen.getByText(label).parentElement;
  if (!row) throw new Error(`row for ${label} not found`);
  return row;
}

function openBrowser(rowLabel: string) {
  fireEvent.click(within(rowElement(rowLabel)).getByText(/^#[0-9a-f]{6}$/));
  fireEvent.click(screen.getByLabelText(`Browse MUI palette for ${rowLabel}`));
}

function searchInput(rowLabel: string): HTMLInputElement {
  return screen.getByLabelText(`Search MUI palette for ${rowLabel}`) as HTMLInputElement;
}

describe('MUI palette browser', () => {
  afterEach(() => cleanup());

  it('opens from a color field with the official families, editing nothing', () => {
    renderPanel();
    openBrowser('Primary');
    expect(searchInput('Primary')).toBeInTheDocument();
    expect(screen.getByTestId('mui-palette-list')).toBeInTheDocument();
    // Family headings and named swatches with hexes.
    expect(screen.getByText('Blue')).toBeInTheDocument();
    expect(screen.getByText('Deep Orange')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'blue 500 #2196f3' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'black #000000' })).toBeInTheDocument();
    expect(probePast()).toBe(0);
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBeUndefined();
  });

  it('search filters by token name in typed forms and by hex', () => {
    renderPanel();
    openBrowser('Primary');

    fireEvent.change(searchInput('Primary'), { target: { value: 'blue500' } });
    expect(screen.getByRole('button', { name: 'blue 500 #2196f3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'red 500 #f44336' })).not.toBeInTheDocument();
    expect(screen.queryByText('Deep Orange')).not.toBeInTheDocument();

    fireEvent.change(searchInput('Primary'), { target: { value: '2196f3' } });
    expect(screen.getByRole('button', { name: 'blue 500 #2196f3' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'blue 600 #1e88e5' })).not.toBeInTheDocument();

    fireEvent.change(searchInput('Primary'), { target: { value: 'deep orange' } });
    expect(screen.getByRole('button', { name: 'deep orange 500 #ff5722' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'blue 500 #2196f3' })).not.toBeInTheDocument();

    fireEvent.change(searchInput('Primary'), { target: { value: 'not a color' } });
    expect(screen.getByText('No MUI colors match that search.')).toBeInTheDocument();
  });

  it('picking a swatch sets the field in one undo step and closes the picker', () => {
    renderPanel();
    openBrowser('Primary');
    fireEvent.click(screen.getByRole('button', { name: 'blue 500 #2196f3' }));

    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBe('#2196f3');
    expect(probePast()).toBe(1);
    // The picker closed on the pick and the row shows the new hex.
    expect(screen.queryByTestId('color-picker-square')).not.toBeInTheDocument();
    expect(within(rowElement('Primary')).getByText('#2196f3')).toBeInTheDocument();
    // The theme the preview and export share carries the same value.
    const options = projectToThemeOptions(probeProject());
    const schemes = options.colorSchemes as {
      light?: { palette?: { primary?: { main?: string } } };
    };
    expect(schemes.light?.palette?.primary?.main).toBe('#2196f3');
  });

  it('picking a swatch on an Auto variant row pins it in one undo step', () => {
    renderPanel();
    expect(screen.getAllByText('Auto')).toHaveLength(12);
    openBrowser('Primary light');
    fireEvent.change(searchInput('Primary light'), { target: { value: 'red 500' } });
    fireEvent.click(screen.getByRole('button', { name: 'red 500 #f44336' }));

    expect(probeProject().colorSchemes.light.palette?.primary).toEqual({
      main: '#171717',
      light: '#f44336',
    });
    expect(probePast()).toBe(1);
    expect(within(rowElement('Primary light')).getByText('#f44336')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset Primary light to auto')).toBeInTheDocument();
    expect(screen.getAllByText('Auto')).toHaveLength(11);
  });

  it('the browser is available from a surface field too', () => {
    renderPanel();
    openBrowser('Divider');
    fireEvent.change(searchInput('Divider'), { target: { value: 'grey 300' } });
    fireEvent.click(screen.getByRole('button', { name: 'grey 300 #e0e0e0' }));
    expect(probeProject().colorSchemes.light.palette?.divider).toBe('#e0e0e0');
    expect(probePast()).toBe(1);
  });
});
