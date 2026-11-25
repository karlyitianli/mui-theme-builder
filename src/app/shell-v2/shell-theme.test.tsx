import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import { NewShell } from './NewShell';
import { SearchBox } from './primitives';
import { createShellTheme, SHELL_FONT_FAMILY } from './shell-theme';
import { TokenPanel } from './TokenPanel';

// Karl's insulation rule (Nov 25, 2026), with the color exception
// reversed the same day: the shell theme reads nothing from the
// project at all. Its palette is the fixed shadcn baseline for the
// active mode, its spacing is a fixed 8px base, its typography is
// the shell's Inter stack, its radius is 6px, and its shadows are
// MUI's defaults. These tests pin those fixed values directly,
// including against the customized fixture's palette (primary
// #6750a4 light / #d0bcff dark), which the shell must never show.

afterEach(() => cleanup());

describe('createShellTheme', () => {
  it('keeps the fixed 8px spacing base in both modes', () => {
    // In a CSS-variables theme, spacing resolves through the theme's
    // spacing variable; the assertion pins both the 8px base (the
    // fallback value) and the shell scope of the variable.
    for (const mode of ['light', 'dark'] as const) {
      const theme = createShellTheme(mode);
      expect(theme.spacing(1)).toBe('var(--shell-spacing, 8px)');
      expect(theme.spacing(2)).toContain('var(--shell-spacing');
    }
  });

  it('keeps the fixed shell typography and radius', () => {
    const theme = createShellTheme('light');
    expect(theme.typography.fontFamily).toBe(SHELL_FONT_FAMILY);
    expect(theme.typography.fontSize).toBe(14);
    expect(theme.shape.borderRadius).toBe(6);
  });

  it('keeps MUI default shadows in both modes', () => {
    expect(createShellTheme('light').shadows).toEqual(createTheme().shadows);
    expect(createShellTheme('dark').shadows).toEqual(createTheme().shadows);
  });

  it('takes its palette from the fixed baseline for the mode, never the project', () => {
    const light = createShellTheme('light');
    expect(light.palette.mode).toBe('light');
    expect(light.palette.primary.main).toBe('#171717');
    expect(light.palette.secondary.main).toBe('#f5f5f5');
    expect(light.palette.error.main).toBe('#dc2626');
    expect(light.palette.background.default).toBe('#ffffff');
    expect(light.palette.background.paper).toBe('#ffffff');
    expect(light.palette.text.primary).toBe('#0a0a0a');
    expect(light.palette.text.secondary).toBe('#737373');
    expect(light.palette.divider).toBe('#e5e5e5');
    // The customized fixture's project primary must not leak in.
    expect(light.palette.primary.main).not.toBe('#6750a4');

    const dark = createShellTheme('dark');
    expect(dark.palette.mode).toBe('dark');
    expect(dark.palette.primary.main).toBe('#fafafa');
    expect(dark.palette.secondary.main).toBe('#262626');
    expect(dark.palette.error.main).toBe('#ef4444');
    expect(dark.palette.background.default).toBe('#0a0a0a');
    expect(dark.palette.background.paper).toBe('#0a0a0a');
    expect(dark.palette.text.primary).toBe('#fafafa');
    expect(dark.palette.text.secondary).toBe('#a3a3a3');
    expect(dark.palette.divider).toBe('#262626');
    expect(dark.palette.primary.main).not.toBe('#d0bcff');
  });

  it('scopes the shared component style variables to the shell prefix', () => {
    // The shared component configs reference the project theme's
    // --mui-palette-* variables; in the shell theme's copy every one
    // of those references must point at the shell variables instead,
    // so panel controls can never pick up an edited color.
    for (const mode of ['light', 'dark'] as const) {
      const components = JSON.stringify(createShellTheme(mode).components);
      expect(components).not.toContain('var(--mui-');
      expect(components).toContain('var(--shell-palette-primary-main)');
    }
  });

  it('scopes its CSS variables under the shell prefix', () => {
    // The preview themes own the --mui-* variables on global selectors;
    // the shell prefix is what keeps the two variable sets apart in the
    // browser (see shell-theme.ts).
    const theme = createShellTheme('light');
    expect(theme.vars.palette.primary.main).toBe(
      'var(--shell-palette-primary-main, #171717)',
    );
    expect(theme.vars.palette.background.default).toBe(
      'var(--shell-palette-background-default, #ffffff)',
    );
    expect(theme.vars.spacing).toBe('var(--shell-spacing, 8px)');
    expect(theme.vars.shape.borderRadius).toContain('var(--shell-shape-borderRadius');
  });
});

describe('chrome palette references', () => {
  it('tints the search icon from the shell palette, not the preview palette', () => {
    const { container } = render(
      <ThemeProvider theme={createShellTheme('dark')}>
        <SearchBox mode="dark" />
      </ThemeProvider>,
    );
    const icon = container.querySelector('svg');
    expect(icon?.outerHTML).toContain('--shell-palette-text-secondary');
    expect(container.innerHTML).not.toContain('--mui-palette');
  });

  it('fades the tab row toward the shell paper color, not the preview paper color', () => {
    // jsdom has no layout, so the scroller metrics are stubbed and a
    // scroll event fired, the same pattern as token-tab-list.test.tsx.
    const state = createInitialEditorState();
    render(
      <EditorStateContext value={state}>
        <EditorDispatchContext value={() => undefined}>
          <TokenPanel />
        </EditorDispatchContext>
      </EditorStateContext>,
    );
    const scroller = screen.getByTestId('token-tab-scroller');
    Object.defineProperties(scroller, {
      clientWidth: { configurable: true, value: 320 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollWidth: { configurable: true, value: 560 },
    });
    fireEvent.scroll(scroller);
    expect(screen.getByTestId('token-tab-fade-right')).toBeInTheDocument();
    const css = Array.from(document.querySelectorAll('style'))
      .map((tag) => tag.textContent ?? '')
      .join('\n');
    expect(css).toContain(
      'linear-gradient(to right, transparent, var(--shell-palette-background-paper))',
    );
    expect(css).not.toContain('var(--mui-palette-background-paper)');
  });
});

describe('NewShell wiring', () => {
  it('renders the panel and preview under the shell theme from editor state', () => {
    const state = createInitialEditorState();
    render(
      <EditorStateContext value={state}>
        <EditorDispatchContext value={() => undefined}>
          <NewShell />
        </EditorDispatchContext>
      </EditorStateContext>,
    );
    // Token panel (Color tab is the default) and the preview area.
    expect(screen.getByText('Primary')).toBeInTheDocument();
    expect(screen.getByText('Inputs')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
  });
});
