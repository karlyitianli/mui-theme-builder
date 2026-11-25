import { useReducer, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import type { EditorState } from '../../state/editor-state.types';
import { PreviewArea } from './PreviewArea';

// Phase 3: the preview area renders the component registry as pure
// preview cards under collapsible category headers, the search box
// filters by name, and the Templates tab shows stubs.
function renderPreviewArea(state?: EditorState) {
  const initialState = state ?? createInitialEditorState();
  return render(
    <EditorStateContext value={initialState}>
      <EditorDispatchContext value={() => undefined}>
        <PreviewArea />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

function documentStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .join('\n');
}

describe('PreviewArea (Phase 3)', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());

  it('renders the three registry cards under the Inputs category, with no Edit buttons', () => {
    renderPreviewArea();
    expect(screen.getByText('Inputs')).toBeInTheDocument();
    // The Button card header plus its three variant buttons.
    expect(screen.getAllByText('Button')).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
    expect(screen.getByText('TextField')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Placeholder')).toBeInTheDocument();
    expect(screen.getByText('Select')).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    // Cards are pure preview: no Edit buttons anywhere.
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('filters the cards by name through the search box', () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'text' },
    });
    expect(screen.getByText('TextField')).toBeInTheDocument();
    expect(screen.queryByText('Select')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: 'Button' })).toHaveLength(0);
  });

  it('shows the empty line when no component matches the search', () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'zzzz-not-a-component' },
    });
    expect(screen.getByText('No components match')).toBeInTheDocument();
    expect(screen.queryByText('TextField')).not.toBeInTheDocument();
  });

  it('collapses and expands a category section from its header', () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Inputs'));
    expect(screen.queryByText('TextField')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Inputs'));
    expect(screen.getByText('TextField')).toBeInTheDocument();
  });

  it('shows the four template stubs on the Templates tab', () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Templates'));
    for (const name of ['Sign up', 'Dashboard', 'Marketing', 'Checkout']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Not built yet')).toHaveLength(4);
    expect(screen.queryByText('TextField')).not.toBeInTheDocument();
  });
});

describe('PreviewArea theme reflection (Phase 3 integration)', () => {
  afterEach(() => cleanup());

  function ReducerHarness({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(
      editorReducer,
      undefined,
      createInitialEditorState,
    );
    return (
      <EditorStateContext value={state}>
        <EditorDispatchContext value={dispatch}>
          <button
            onClick={() =>
              dispatch({
                type: 'set-semantic-color',
                mode: 'light',
                role: 'primary',
                color: '#6750a4',
              })
            }
            type="button"
          >
            Make primary purple
          </button>
          {children}
        </EditorDispatchContext>
      </EditorStateContext>
    );
  }

  it('changing the primary color through the reducer changes the preview theme the Button card renders under', () => {
    render(
      <ReducerHarness>
        <PreviewArea />
      </ReducerHarness>,
    );

    // The Button card renders under the default primary (#171717); the
    // new color is nowhere in the generated preview styles yet.
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
    expect(documentStyles()).not.toContain('#6750a4');

    fireEvent.click(screen.getByRole('button', { name: 'Make primary purple' }));

    // The preview theme is rebuilt from the updated project, and its
    // generated styles now carry the new primary color.
    expect(documentStyles()).toContain('#6750a4');
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
  });
});
