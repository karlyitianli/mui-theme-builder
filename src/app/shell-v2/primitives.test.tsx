import { cleanup, render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { afterEach, describe, expect, it } from 'vitest';

import { Stepper } from './primitives';

// Karl's dark-mode report (Nov 25, 2026): the stepper borders (Base
// font size, Letter spacing) read as near-white lines on the dark
// background because the Stepper still carried the light design's
// hardcoded 1px #e5e5e5 border. It now takes the mode as a prop, like
// SearchBox, and uses the shared shell border (shell-border.ts). These
// assertions pin the rendered border in both modes so the hardcoded
// gray cannot come back.
function renderStepper(mode: 'light' | 'dark') {
  return render(
    <ThemeProvider theme={createTheme()}>
      <Stepper mode={mode} value="14 px" />
    </ThemeProvider>,
  );
}

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

describe('Stepper (shell border)', () => {
  afterEach(() => cleanup());

  it('renders the dark shell border in dark mode, not the old #e5e5e5', () => {
    renderStepper('dark');

    const root = screen.getByText('14 px').parentElement;
    expect(root).not.toBeNull();
    const rules = rulesFor(root as Element);
    expect(rules).toMatch(/border:1px solid rgba\(255,\s*255,\s*255,\s*0\.16\)/);
    expect(rules).not.toContain('#e5e5e5');
  });

  it('renders the light shell border in light mode', () => {
    renderStepper('light');

    const root = screen.getByText('14 px').parentElement;
    expect(root).not.toBeNull();
    expect(rulesFor(root as Element)).toMatch(/border:1px solid rgba\(0,\s*0,\s*0,\s*0\.1\)/);
  });
});
