import { useReducer } from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { useEditorState } from '../../state/editor-hooks';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import { TokenPanel } from './TokenPanel';

// Phase 5: the v2 token panels actually edit the project. These tests run
// the panels against the real editor reducer and read the resulting
// project (and active mode) back through a probe, so each assertion is
// about the same state the preview and the exporter consume.
function Probe() {
  const { activeMode, project } = useEditorState();
  return <div data-testid="probe">{JSON.stringify({ activeMode, project })}</div>;
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

function probeMode(): string {
  const parsed = JSON.parse(screen.getByTestId('probe').textContent ?? '{}') as {
    activeMode: string;
  };
  return parsed.activeMode;
}

// Clicking a row's hex box opens its color picker; the picker's HEX
// field carries the same `${label} hex value` label the Phase 5 inline
// input had, and blurring it commits, so the helper's shape is unchanged.
function editHex(hexText: string, label: string, nextValue: string) {
  fireEvent.click(screen.getByText(hexText));
  const input = screen.getByLabelText(`${label} hex value`);
  fireEvent.change(input, { target: { value: nextValue } });
  fireEvent.blur(input);
}

describe('TokenPanel wiring (Phase 5)', () => {
  afterEach(() => cleanup());

  it('typing a valid hex in the Color picker updates the project and the row', () => {
    renderPanel();
    editHex('#171717', 'Primary', '#123456');
    expect(probeProject().colorSchemes.light.palette?.primary?.main).toBe('#123456');
    expect(screen.getByText('#123456')).toBeInTheDocument();
  });

  it('an invalid hex reverts without touching the project, mirroring the old shell', () => {
    renderPanel();
    editHex('#dc2626', 'Error', '#12');
    expect(probeProject().colorSchemes.light.palette?.error).toBeUndefined();
    expect(screen.getByText('#dc2626')).toBeInTheDocument();
    // The picker's field falls back to the row's current color too.
    expect((screen.getByLabelText('Error hex value') as HTMLInputElement).value).toBe('#dc2626');
  });

  it('text colors edit through the surface action', () => {
    renderPanel();
    editHex('#0a0a0a', 'Primary text', '#111111');
    expect(probeProject().colorSchemes.light.palette?.text?.primary).toBe('#111111');
  });

  it('collapsing a Color section hides its rows and expanding brings them back', () => {
    renderPanel();
    expect(screen.getByText('Primary')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Semantic colors'));
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    // Other sections are untouched.
    expect(screen.getByText('Primary text')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Semantic colors'));
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });

  it('the segmented control switches the scheme the panel shows', () => {
    renderPanel();
    expect(probeMode()).toBe('light');
    fireEvent.click(screen.getByText('Dark'));
    expect(probeMode()).toBe('dark');
    // Dark defaults: Primary and Primary text are both #fafafa, and the
    // light Primary #171717 is gone.
    expect(screen.getAllByText('#fafafa').length).toBeGreaterThan(0);
    expect(screen.queryByText('#171717')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Light'));
    expect(probeMode()).toBe('light');
  });

  it('the panel search filters color rows by token name and by hex value', () => {
    renderPanel();
    const search = screen.getByLabelText('Search');
    fireEvent.change(search, { target: { value: 'error' } });
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.queryByText('Primary')).not.toBeInTheDocument();
    expect(screen.queryByText('Success')).not.toBeInTheDocument();
    fireEvent.change(search, { target: { value: '#2e7d32' } });
    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.queryByText('Error')).not.toBeInTheDocument();
  });

  it('a Typography base size edit updates the project', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    fireEvent.click(screen.getByLabelText('Increase Base font size'));
    expect(probeProject().foundations?.typography?.fontSize).toBe(15);
    expect(screen.getByText('15 px')).toBeInTheDocument();
  });

  it('a Typography variant edit updates the variant in the project', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    fireEvent.click(screen.getByText('Heading 1'));
    expect(screen.getByText('h1 settings')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Increase Font size'));
    expect(probeProject().foundations?.typography?.variants?.h1?.fontSize).toBe(32.5);
    fireEvent.click(screen.getByLabelText('Increase Letter spacing'));
    expect(probeProject().foundations?.typography?.variants?.h1?.letterSpacing).toBe(0.1);
    fireEvent.mouseDown(screen.getByLabelText('Font weight'));
    fireEvent.click(screen.getByRole('option', { name: '600' }));
    expect(probeProject().foundations?.typography?.variants?.h1?.fontWeight).toBe(600);
  });

  it('a Spacing base edit updates the project and the scale values', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Spacing'));
    // Unset spacing shows the shared 4px default, so x12 reads 48 px.
    expect(screen.getByText('48 px')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Increase Base spacing unit'));
    expect(probeProject().foundations?.spacing).toBe(5);
    expect(screen.getByText('60 px')).toBeInTheDocument();
  });

  it('a Spacing density preset applies its base unit', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Spacing'));
    fireEvent.click(screen.getByText('Compact'));
    expect(probeProject().foundations?.spacing).toBe(3);
    expect(screen.getByText('36 px')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Spacious'));
    expect(probeProject().foundations?.spacing).toBe(5);
  });

  it('Radius global and override edits update the project', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Radius'));
    fireEvent.click(screen.getByLabelText('Increase Global border radius'));
    expect(probeProject().foundations?.shape?.borderRadius).toBe(7);
    fireEvent.click(screen.getByLabelText('Increase Button'));
    expect(probeProject().components?.button?.style?.border?.radius).toBe(8);
    fireEvent.click(screen.getByLabelText('Increase Input'));
    expect(probeProject().components?.textField?.style?.border?.radius).toBe(8);
  });

  it('a Card radius edit updates the project shape', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Radius'));
    fireEvent.click(screen.getByLabelText('Increase Card'));
    expect(probeProject().foundations?.shape?.cardBorderRadius).toBe(13);
    expect(screen.getByText('13px')).toBeInTheDocument();
  });

  it('a Shadows preset applies its elevations in one edit', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Shadows'));
    fireEvent.click(screen.getByText('Strong'));
    expect(probeProject().foundations?.shadows).toEqual({
      global: 4,
      button: 4,
      card: 3,
      input: 2,
    });
    fireEvent.click(screen.getByLabelText('Increase Global elevation'));
    expect(probeProject().foundations?.shadows?.global).toBe(5);
  });
});

// Semantic tokens expose Main, Light, and Dark rows. An unpinned Light
// or Dark row shows the value MUI derives from main (the same runtime
// theme the preview renders with) with an Auto marker; editing it pins
// the value, and the pinned row's reset control unpins it again.
describe('TokenPanel semantic color variants', () => {
  afterEach(() => cleanup());

  function rowElement(label: string): HTMLElement {
    const row = screen.getByText(label).parentElement;
    if (!row) throw new Error(`row for ${label} not found`);
    return row;
  }

  // Like editHex, but scoped to one row: several rows can share a hex
  // text once derived values are on screen.
  function editRowHex(label: string, nextValue: string) {
    fireEvent.click(within(rowElement(label)).getByText(/^#[0-9a-f]{6}$/));
    const input = screen.getByLabelText(`${label} hex value`);
    fireEvent.change(input, { target: { value: nextValue } });
    fireEvent.blur(input);
  }

  it('shows Main, Light, and Dark rows per token, with derived values marked Auto', () => {
    renderPanel();
    expect(screen.getByText('Primary light')).toBeInTheDocument();
    expect(screen.getByText('Primary dark')).toBeInTheDocument();
    // MUI's derivation from the default primary main #171717.
    expect(within(rowElement('Primary light')).getByText('#454545')).toBeInTheDocument();
    expect(within(rowElement('Primary dark')).getByText('#101010')).toBeInTheDocument();
    // Six tokens times two variants, all unpinned on a fresh project.
    expect(screen.getAllByText('Auto')).toHaveLength(12);
    expect(screen.queryByLabelText('Reset Primary light to auto')).not.toBeInTheDocument();
  });

  it('editing a Light row pins the value and swaps the Auto marker for a reset control', () => {
    renderPanel();
    editRowHex('Primary light', '#123456');
    expect(probeProject().colorSchemes.light.palette?.primary).toEqual({
      main: '#171717',
      light: '#123456',
    });
    expect(within(rowElement('Primary light')).getByText('#123456')).toBeInTheDocument();
    expect(screen.getByLabelText('Reset Primary light to auto')).toBeInTheDocument();
    expect(screen.getAllByText('Auto')).toHaveLength(11);
  });

  it('resetting a pinned variant restores the derived value and the Auto marker', () => {
    renderPanel();
    editRowHex('Primary light', '#123456');
    fireEvent.click(screen.getByLabelText('Reset Primary light to auto'));
    const primary = probeProject().colorSchemes.light.palette?.primary;
    expect(primary?.light).toBeUndefined();
    expect(primary?.main).toBe('#171717');
    expect(within(rowElement('Primary light')).getByText('#454545')).toBeInTheDocument();
    expect(screen.getAllByText('Auto')).toHaveLength(12);
    expect(screen.queryByLabelText('Reset Primary light to auto')).not.toBeInTheDocument();
  });

  it('editing Main re-derives the unpinned Light and Dark rows', () => {
    renderPanel();
    editHex('#171717', 'Primary', '#6750a4');
    expect(probeProject().colorSchemes.light.palette?.primary).toEqual({ main: '#6750a4' });
    expect(within(rowElement('Primary light')).getByText('#8573b6')).toBeInTheDocument();
    expect(within(rowElement('Primary dark')).getByText('#483872')).toBeInTheDocument();
    expect(screen.getAllByText('Auto')).toHaveLength(12);
  });

  it('the Dark scheme shows its own derived rows', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getAllByText('Auto')).toHaveLength(12);
    // The light scheme's derived primary light is gone with the scheme.
    expect(within(rowElement('Primary light')).queryByText('#454545')).not.toBeInTheDocument();
  });
});
