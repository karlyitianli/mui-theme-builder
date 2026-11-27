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

  it('the Color panel main and surface rows show the resolved theme values (task 4.1, finding C1)', () => {
    renderPanel();
    // Light scheme of a fresh project: the baseline's mains and
    // surfaces plus MUI's own warning, info, and success mains, the
    // values the runtime theme resolves and the export carries. The
    // panel reads them from that resolution, not from a hardcoded
    // copy, so these are the theme's numbers, stated independently.
    for (const value of [
      '#171717', // primary
      '#f5f5f5', // secondary
      '#dc2626', // error
      '#ed6c02', // warning (MUI)
      '#0288d1', // info (MUI)
      '#2e7d32', // success (MUI)
      '#0a0a0a', // text primary
      '#737373', // text secondary
      '#a3a3a3', // text disabled
      '#e5e5e5', // divider
    ]) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
    fireEvent.click(screen.getByText('Dark'));
    for (const value of ['#ef4444', '#ffa726', '#29b6f6', '#66bb6a', '#262626']) {
      expect(screen.getAllByText(value).length).toBeGreaterThan(0);
    }
    // The light-only error main is gone in the dark scheme.
    expect(screen.queryByText('#dc2626')).not.toBeInTheDocument();
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
    // The editor steps from the resolved value the theme applies
    // (task 4.1, finding T1): h1 resolves to 96px, so one step stores
    // 96.5. Before the audit fix the panel stepped from the Figma
    // frame's 32px fallback and stored 32.5.
    fireEvent.click(screen.getByLabelText('Increase Font size'));
    expect(probeProject().foundations?.typography?.variants?.h1?.fontSize).toBe(96.5);
    fireEvent.click(screen.getByLabelText('Increase Letter spacing'));
    expect(probeProject().foundations?.typography?.variants?.h1?.letterSpacing).toBe(0.1);
    fireEvent.mouseDown(screen.getByLabelText('Font weight'));
    fireEvent.click(screen.getByRole('option', { name: '600' }));
    expect(probeProject().foundations?.typography?.variants?.h1?.fontWeight).toBe(600);
  });

  it('the Typography specimens show the values the theme applies (task 4.1, finding T1)', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    // A fresh project's applied scale: MUI's built-in variants with
    // the baseline's body1, body2, and button overrides. These are
    // the meta lines the shared theme mapping produces for the same
    // project the probe reports; the frame's specimen scale (32px,
    // 700, 1.20 for h1) must not appear.
    const expectedMeta = [
      '96px \u00B7 300 \u00B7 1.17',
      '60px \u00B7 300 \u00B7 1.20',
      '48px \u00B7 400 \u00B7 1.17',
      '34px \u00B7 400 \u00B7 1.24',
      '24px \u00B7 400 \u00B7 1.33',
      '20px \u00B7 500 \u00B7 1.60',
      '16px \u00B7 400 \u00B7 1.75',
      '14px \u00B7 500 \u00B7 1.57',
      '14px \u00B7 400 \u00B7 1.50',
      '13px \u00B7 400 \u00B7 1.50',
      '14px \u00B7 500 \u00B7 1.40',
      '12px \u00B7 400 \u00B7 1.66',
      '12px \u00B7 400 \u00B7 2.66',
    ];
    for (const meta of expectedMeta) {
      expect(screen.getByText(meta)).toBeInTheDocument();
    }
    expect(screen.queryByText('32px \u00B7 700 \u00B7 1.20')).not.toBeInTheDocument();
  });

  it('the family dropdown names the unset state and picking a family stores its catalog weights (task 4.1, findings T2 and T3)', { timeout: 20000 }, () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    // No font is stored on a fresh project, and the applied stack is
    // the baseline's system stack: the dropdown says so instead of
    // naming a family the theme does not use.
    expect(screen.getByRole('combobox', { name: 'Font family' })).toHaveTextContent(
      'System default',
    );
    fireEvent.mouseDown(screen.getByLabelText('Font family'));
    fireEvent.click(screen.getByRole('option', { name: 'Inter' }));
    // The full catalog weight list is stored, not just 400, so the
    // preview loads and the export requests every weight the theme's
    // variants call for.
    expect(probeProject().foundations?.typography?.font).toEqual({
      family: 'Inter',
      weights: [300, 400, 500, 600, 700],
      fallback: ['Arial', 'sans-serif'],
    });
    // Choosing System default clears the stored font again.
    fireEvent.mouseDown(screen.getByLabelText('Font family'));
    fireEvent.click(screen.getByRole('option', { name: 'System default' }));
    expect(probeProject().foundations?.typography?.font).toBeUndefined();
    expect(screen.getByRole('combobox', { name: 'Font family' })).toHaveTextContent(
      'System default',
    );
  });

  it('a Typography text transform edit sets the field and Auto clears it (task 1.5)', { timeout: 20000 }, () => {
    renderPanel();
    fireEvent.click(screen.getByText('Typography'));
    fireEvent.click(screen.getByText('Button'));
    expect(screen.getByText('button settings')).toBeInTheDocument();
    // Unset reads Auto, the panels' word for a field MUI defaults.
    fireEvent.mouseDown(screen.getByLabelText('Text transform'));
    fireEvent.click(screen.getByRole('option', { name: 'Uppercase' }));
    expect(probeProject().foundations?.typography?.variants?.button?.textTransform).toBe(
      'uppercase',
    );
    fireEvent.mouseDown(screen.getByLabelText('Text transform'));
    fireEvent.click(screen.getByRole('option', { name: 'Auto' }));
    expect(
      probeProject().foundations?.typography?.variants?.button?.textTransform,
    ).toBeUndefined();
  });

  it('a Spacing base edit updates the project and the scale values', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Spacing'));
    // The Black project stores its 8px base (Comfortable), so x12 reads
    // 96 px. (Before Nov 26, 2026 the default project stored no spacing
    // and this showed the 4px fallback.)
    expect(screen.getByText('96 px')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Increase Base spacing unit'));
    expect(probeProject().foundations?.spacing).toBe(9);
    expect(screen.getByText('108 px')).toBeInTheDocument();
  });

  it('a Spacing density preset applies its base unit', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Spacing'));
    fireEvent.click(screen.getByText('Compact'));
    expect(probeProject().foundations?.spacing).toBe(4);
    expect(screen.getByText('48 px')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Spacious'));
    expect(probeProject().foundations?.spacing).toBe(12);
  });

  it('Radius global and override edits update the project', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Radius'));
    // The Black project stores Rounded's 8px global radius (Karl's
    // Nov 26, 2026 radius decision, task 5.3), so the steppers start
    // from 8, not the 6px an unset project used to fall back to.
    fireEvent.click(screen.getByLabelText('Increase Global border radius'));
    expect(probeProject().foundations?.shape?.borderRadius).toBe(9);
    fireEvent.click(screen.getByLabelText('Increase Button'));
    expect(probeProject().components?.button?.style?.border?.radius).toBe(10);
    fireEvent.click(screen.getByLabelText('Increase Input'));
    expect(probeProject().components?.textField?.style?.border?.radius).toBe(10);
  });

  it('Radius presets apply their values, with Rounded the fresh default (task 5.3)', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Radius'));
    // Karl's Nov 26, 2026 decision: Sharp 0, Rounded 8, and Spacious
    // renamed Full at 99. The fresh project stores Rounded's 8, so
    // Rounded carries the active pill styling (its background differs
    // from an inactive pill's) before anything is clicked.
    expect(screen.getByText('Sharp')).toBeInTheDocument();
    expect(screen.getByText('Full')).toBeInTheDocument();
    expect(screen.queryByText('Spacious')).not.toBeInTheDocument();
    const roundedBg = window.getComputedStyle(screen.getByText('Rounded')).backgroundColor;
    const sharpBg = window.getComputedStyle(screen.getByText('Sharp')).backgroundColor;
    expect(roundedBg).not.toBe(sharpBg);
    expect(probeProject().foundations?.shape?.borderRadius).toBe(8);
    fireEvent.click(screen.getByText('Full'));
    expect(probeProject().foundations?.shape?.borderRadius).toBe(99);
    expect(screen.getAllByText('99px').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('Sharp'));
    expect(probeProject().foundations?.shape?.borderRadius).toBe(0);
    fireEvent.click(screen.getByText('Rounded'));
    expect(probeProject().foundations?.shape?.borderRadius).toBe(8);
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
      menu: 12,
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

// Task 3.6: the Color panel gains a Grey section (the MUI ramp, edited
// through the shared color picker like every other color row) and an
// Action section (color strings in text fields, because MUI's action
// defaults are alpha-bearing rgba the hex-only picker cannot
// represent, plus opacity numbers that clamp to 0 to 1 and revert on
// invalid entries, the Other tab's numeric pattern).
describe('TokenPanel Grey and Action sections (task 3.6)', () => {
  afterEach(() => cleanup());

  function rowElement(label: string): HTMLElement {
    const row = screen.getByText(label).parentElement;
    if (!row) throw new Error(`row for ${label} not found`);
    return row;
  }

  function editRowHex(label: string, nextValue: string) {
    fireEvent.click(within(rowElement(label)).getByText(/^#[0-9a-f]{6}$/));
    const input = screen.getByLabelText(`${label} hex value`);
    fireEvent.change(input, { target: { value: nextValue } });
    fireEvent.blur(input);
  }

  it('shows the Grey ramp at MUI defaults and the Action rows for the scheme', () => {
    renderPanel();
    expect(screen.getByText('Grey')).toBeInTheDocument();
    expect(within(rowElement('Grey 500')).getByText('#9e9e9e')).toBeInTheDocument();
    expect(within(rowElement('Grey 900')).getByText('#212121')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect((screen.getByLabelText('Hover value') as HTMLInputElement).value).toBe(
      'rgba(0, 0, 0, 0.04)',
    );
    expect((screen.getByLabelText('Hover opacity value') as HTMLInputElement).value).toBe('0.04');
    expect((screen.getByLabelText('Activated opacity value') as HTMLInputElement).value).toBe(
      '0.12',
    );
  });

  it('editing a Grey row through the picker stores the shade for the scheme', () => {
    renderPanel();
    editRowHex('Grey 500', '#123456');
    expect(probeProject().colorSchemes.light.palette?.grey?.[500]).toBe('#123456');
    expect(within(rowElement('Grey 500')).getByText('#123456')).toBeInTheDocument();
    // The rest of the ramp stays at the stored defaults.
    expect(probeProject().colorSchemes.light.palette?.grey?.[900]).toBe('#212121');
  });

  it('editing an Action color field stores the string, and an empty entry reverts', () => {
    renderPanel();
    const hover = screen.getByLabelText('Hover value');
    fireEvent.change(hover, { target: { value: 'rgba(0, 0, 0, 0.10)' } });
    fireEvent.blur(hover);
    expect(probeProject().colorSchemes.light.palette?.action?.hover).toBe('rgba(0, 0, 0, 0.10)');

    const active = screen.getByLabelText('Active value');
    fireEvent.change(active, { target: { value: '' } });
    fireEvent.blur(active);
    expect(probeProject().colorSchemes.light.palette?.action?.active).toBe('rgba(0, 0, 0, 0.54)');
    expect((screen.getByLabelText('Active value') as HTMLInputElement).value).toBe(
      'rgba(0, 0, 0, 0.54)',
    );
  });

  it('opacity fields commit decimals, clamp to 0 to 1, and revert invalid entries', () => {
    renderPanel();
    const hoverOpacity = screen.getByLabelText('Hover opacity value');
    fireEvent.change(hoverOpacity, { target: { value: '0.5' } });
    fireEvent.blur(hoverOpacity);
    expect(probeProject().colorSchemes.light.palette?.action?.hoverOpacity).toBe(0.5);

    const selectedOpacity = screen.getByLabelText('Selected opacity value');
    fireEvent.change(selectedOpacity, { target: { value: '2' } });
    fireEvent.blur(selectedOpacity);
    expect(probeProject().colorSchemes.light.palette?.action?.selectedOpacity).toBe(1);

    const focusOpacity = screen.getByLabelText('Focus opacity value');
    fireEvent.change(focusOpacity, { target: { value: 'abc' } });
    fireEvent.blur(focusOpacity);
    expect(probeProject().colorSchemes.light.palette?.action?.focusOpacity).toBe(0.12);
    expect((screen.getByLabelText('Focus opacity value') as HTMLInputElement).value).toBe('0.12');
  });

  it('the Dark scheme shows its own action values while the grey ramp is unchanged', () => {
    renderPanel();
    fireEvent.click(screen.getByText('Dark'));
    expect((screen.getByLabelText('Active value') as HTMLInputElement).value).toBe('#fff');
    expect((screen.getByLabelText('Hover opacity value') as HTMLInputElement).value).toBe('0.08');
    expect(within(rowElement('Grey 500')).getByText('#9e9e9e')).toBeInTheDocument();
  });
});
