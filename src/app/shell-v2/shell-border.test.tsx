import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SearchBox } from './primitives';
import { shellBorderForMode } from './shell-border';

// The shell border is scheme-aware (Karl, Nov 25, 2026): the light
// border, black at 10 percent, is invisible on the dark background, so
// dark mode resolves to a white-based border instead.
describe('shellBorderForMode', () => {
  it('keeps the light border exactly as it was', () => {
    expect(shellBorderForMode('light')).toBe('1px solid rgba(0, 0, 0, 0.1)');
  });

  it('resolves to a light-colored border at the chosen opacity in dark mode', () => {
    expect(shellBorderForMode('dark')).toBe('1px solid rgba(255, 255, 255, 0.16)');
    expect(shellBorderForMode('dark')).not.toBe(shellBorderForMode('light'));
  });
});

describe('SearchBox shell border', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so each test cleans up explicitly (same as the other
  // shell-v2 suites).
  afterEach(() => {
    cleanup();
  });

  it('carries the dark border in dark mode', () => {
    const { container } = render(<SearchBox mode="dark" />);
    expect(container.firstElementChild).toHaveStyle({
      border: '1px solid rgba(255, 255, 255, 0.16)',
    });
  });

  it('carries the light border in light mode', () => {
    const { container } = render(<SearchBox mode="light" />);
    expect(container.firstElementChild).toHaveStyle({
      border: '1px solid rgba(0, 0, 0, 0.1)',
    });
  });
});
