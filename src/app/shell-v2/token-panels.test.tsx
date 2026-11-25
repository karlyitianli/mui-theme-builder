import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { customizedProjectFixture } from '../../fixtures/theme-project.fixtures';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import type { EditorState } from '../../state/editor-state.types';
import { TokenPanel } from './TokenPanel';

// Phase 2: each token tab shows its own panel, and the panels read the
// current project's values from editor state. The customized fixture sets
// spacing 8, border radius 8, and the Inter font family.
function renderPanel() {
  const state: EditorState = {
    ...createInitialEditorState(),
    project: customizedProjectFixture,
  };
  return render(
    <EditorStateContext value={state}>
      <EditorDispatchContext value={() => undefined}>
        <TokenPanel />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

describe('TokenPanel tabs (Phase 2)', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());

  it('shows the Color panel by default', () => {
    renderPanel();
    expect(screen.getByText('Semantic colors')).toBeInTheDocument();
    expect(screen.queryByText('Type specimens')).not.toBeInTheDocument();
  });

  it('shows the Typography panel with project values on its tab', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    expect(screen.getByText('Type specimens')).toBeInTheDocument();
    expect(screen.getByText('Inter')).toBeInTheDocument();
    expect(screen.getByText('14 px')).toBeInTheDocument();
    expect(screen.getByText('32px \u00B7 700 \u00B7 1.20')).toBeInTheDocument();
  });

  it('shows the Spacing panel with the scale derived from the project base unit', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Spacing'));
    expect(screen.getByText('Spacing scale')).toBeInTheDocument();
    // Fixture base unit is 8, so the x12 step reads 96 px.
    expect(screen.getByText('96 px')).toBeInTheDocument();
  });

  it('shows the Radius panel with the project global radius and the Card design value', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Radius'));
    expect(screen.getByText('Global border radius')).toBeInTheDocument();
    expect(screen.getAllByText('8px').length).toBeGreaterThan(0);
    expect(screen.getByText('12px')).toBeInTheDocument();
  });

  it('shows the Shadows panel on its tab', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Shadows'));
    expect(screen.getByText('Global elevation')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });
});
