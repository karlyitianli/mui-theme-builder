import { useReducer, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { downloadTheme } from '../../generator/download-theme';
import { emitThemeTsx } from '../../generator/emit-theme-tsx';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import { PreviewArea } from './PreviewArea';
import { TokenPanel } from './TokenPanel';

// The export drawer calls the real download utility; mock it so the test
// can capture the project it was asked to download instead of triggering
// a browser download.
vi.mock('../../generator/download-theme', () => ({
  downloadTheme: vi.fn(),
}));

const downloadThemeMock = vi.mocked(downloadTheme);

const CUSTOM_PRIMARY = '#6750a4';

// Phase 4: the v2 top bar and preset row are functional. The harness runs
// the real editor reducer and exposes a probe (active mode, light primary)
// plus one edit button, so every assertion is on editor state and module
// calls, never on pixels.
function Harness({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(editorReducer, undefined, createInitialEditorState);
  return (
    <EditorStateContext value={state}>
      <EditorDispatchContext value={dispatch}>
        <div data-testid="probe">
          <span>mode: {state.activeMode}</span>
          <span>
            primary: {state.project.colorSchemes.light.palette?.primary?.main ?? 'none'}
          </span>
        </div>
        <button
          onClick={() =>
            dispatch({
              type: 'set-semantic-color',
              mode: 'light',
              role: 'primary',
              color: CUSTOM_PRIMARY,
            })
          }
          type="button"
        >
          Edit primary
        </button>
        {children}
      </EditorDispatchContext>
    </EditorStateContext>
  );
}

function renderWithShell(ui: ReactNode) {
  return render(<Harness>{ui}</Harness>);
}

describe('v2 top bar (Phase 4)', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());
  beforeEach(() => downloadThemeMock.mockClear());

  // This test renders the whole shell (panel plus all preview cards)
  // and flips the mode twice; with the full Inputs registry (13 themed
  // cards) that legitimately exceeds the default 5s timeout under
  // parallel suite load, so it gets a larger budget.
  it('the light/dark toggle switches the active mode and the Color panel reflects it', { timeout: 20000 }, () => {
    renderWithShell(
      <>
        <TokenPanel />
        <PreviewArea />
      </>,
    );

    const toggle = screen.getByRole('switch', { name: 'Toggle preview mode' });
    expect(screen.getByText('mode: light')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    // Light scheme values in the Color panel; the dark divider is absent.
    expect(screen.queryByText('#262626')).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(screen.getByText('mode: dark')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    // The Color panel's segmented control follows the same state, so the
    // panel now reads the dark scheme values.
    expect(screen.getAllByText('#262626').length).toBeGreaterThan(0);

    fireEvent.click(toggle);
    expect(screen.getByText('mode: light')).toBeInTheDocument();
  });

  it('undo and redo are disabled on a fresh state, then undo restores and redo reapplies an edit', { timeout: 20000 }, () => {
    renderWithShell(<PreviewArea />);

    const undo = screen.getByRole('button', { name: 'Undo' });
    const redo = screen.getByRole('button', { name: 'Redo' });
    expect(undo).toBeDisabled();
    expect(redo).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Edit primary' }));
    expect(screen.getByText(`primary: ${CUSTOM_PRIMARY}`)).toBeInTheDocument();
    expect(undo).toBeEnabled();
    expect(redo).toBeDisabled();

    fireEvent.click(undo);
    expect(screen.getByText('primary: none')).toBeInTheDocument();
    expect(undo).toBeDisabled();
    expect(redo).toBeEnabled();

    fireEvent.click(redo);
    expect(screen.getByText(`primary: ${CUSTOM_PRIMARY}`)).toBeInTheDocument();
    expect(redo).toBeDisabled();
  });

  it('reset with no edits applies immediately, without a confirm dialog', () => {
    renderWithShell(<PreviewArea />);

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('primary: none')).toBeInTheDocument();
  });

  it('reset with edits asks first: Cancel keeps the edits, confirming returns to the default project', { timeout: 20000 }, async () => {
    renderWithShell(<PreviewArea />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit primary' }));

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Reset the entire theme?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText(`primary: ${CUSTOM_PRIMARY}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reset theme' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('primary: none')).toBeInTheDocument();
  });

  it('choosing the Default preset with no edits loads the default project without asking', () => {
    renderWithShell(<TokenPanel />);

    fireEvent.click(screen.getByRole('button', { name: 'Theme preset: Default' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Default' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('primary: none')).toBeInTheDocument();
  });

  it('choosing the Default preset with edits asks, and confirming loads the default project', async () => {
    renderWithShell(<TokenPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit primary' }));
    expect(screen.getByText(`primary: ${CUSTOM_PRIMARY}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Theme preset: Default' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Default' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset theme' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('primary: none')).toBeInTheDocument();
  });

  it('export opens the code drawer on the current project and downloads theme.tsx from it', () => {
    renderWithShell(<PreviewArea />);
    fireEvent.click(screen.getByRole('button', { name: 'Edit primary' }));

    fireEvent.click(screen.getByRole('button', { name: 'Export' }));

    // The drawer renders the generated theme.tsx for the current project,
    // including the custom primary set through the reducer above.
    const code = document.querySelector('pre');
    expect(code?.textContent).toContain(CUSTOM_PRIMARY);

    fireEvent.click(screen.getByRole('button', { name: 'Download theme.tsx' }));
    expect(downloadThemeMock).toHaveBeenCalledTimes(1);
    const exportedProject = downloadThemeMock.mock.calls[0][0];
    expect(exportedProject.colorSchemes.light.palette?.primary?.main).toBe(CUSTOM_PRIMARY);
    expect(emitThemeTsx(exportedProject)).toContain(CUSTOM_PRIMARY);
  });
});
