import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

// Hydration reads the saved project from IndexedDB, which jsdom does not
// provide. Mock the repository so the editor hydrates with a fresh
// project and the shell renders deterministically.
vi.mock('../persistence/indexed-db-repository', () => ({
  indexedDbProjectRepository: {
    load: vi.fn(async () => undefined),
    save: vi.fn(async () => {}),
  },
}));

// The original shell was deprecated and removed (Nov 25, 2026): the v2
// shell is the only shell, on every path. These tests replace the old
// Phase 1 switch tests, which pinned the opposite (v2 opt-in via
// ?shell=v2). The v2 marker is the token panel's preset button; the old
// shell marker is its toolbar's import button, which must never appear.
async function expectV2Shell() {
  expect(
    await screen.findByRole('button', { name: 'Theme preset: Default' }, { timeout: 15000 }),
  ).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Import project JSON' })).not.toBeInTheDocument();
}

describe('App shell (v2 is the only shell)', () => {
  afterEach(() => {
    cleanup();
    window.history.replaceState(null, '', '/');
  });

  it('loads the v2 shell by default, with no query string', { timeout: 20000 }, async () => {
    window.history.replaceState(null, '', '/');
    render(<App />);
    await expectV2Shell();
  });

  it('loads the same v2 shell with ?shell=v2; the parameter is a no-op now', { timeout: 20000 }, async () => {
    window.history.replaceState(null, '', '/?shell=v2');
    render(<App />);
    await expectV2Shell();
  });

  it('loads the v2 shell with unrelated query parameters', { timeout: 20000 }, async () => {
    window.history.replaceState(null, '', '/?other=1');
    render(<App />);
    await expectV2Shell();
  });
});
