import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import type { EditorState } from '../../state/editor-state.types';
import { defaultProjectFixture } from '../../fixtures/theme-project.fixtures';
import { PreviewArea } from './PreviewArea';

// The card half of Karl's insulation rule (Nov 25, 2026): the
// containing cards are preview content, so a real MuiCard inside the
// preview provider takes its surface, elevation, and radius from the
// edited theme, while layout spacing (the grid gap between cards, the
// card's internal padding) stays on the shell's fixed scale. The
// project below is chosen to discriminate: its spacing base is 4px, so
// any spacing unit resolved inside the preview provider would come
// out at the 4px scale instead of the shell's 8px one.
const cardProject: ThemeProject = {
  ...defaultProjectFixture,
  colorSchemes: {
    light: {
      palette: {
        background: { default: '#654321', paper: '#123456' },
      },
    },
    dark: {},
  },
  foundations: {
    ...defaultProjectFixture.foundations,
    spacing: 4,
    shape: { cardBorderRadius: 20 },
    shadows: { global: 2, button: 2, card: 5, input: 0 },
  },
};

function renderPreviewArea(state: EditorState) {
  return render(
    <EditorStateContext value={state}>
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

describe('Preview cards (insulation split)', () => {
  afterEach(() => cleanup());

  it('renders the containing card as a MuiCard under the project theme', () => {
    const state: EditorState = { ...createInitialEditorState(), project: cardProject };
    renderPreviewArea(state);

    const title = screen.getByText('Text Field');
    const card = title.closest('.MuiCard-root');
    expect(card).not.toBeNull();

    // Elevation 5 and the 20px card radius come from the project's
    // foundation defaults for MuiCard (Phase 5 model homes).
    expect(card?.className).toContain('MuiPaper-elevation5');
    expect(card).toHaveStyle({ borderRadius: '20px' });

    // The surface is the project palette's paper color: the card's own
    // rule paints it with the palette variable, and the preview theme
    // in the card's subtree defines that variable as #123456.
    expect(rulesFor(card as Element)).toContain('--mui-palette-background-paper');
    expect(documentStyles()).toContain('--mui-palette-background-paper:#123456');

    // The component area inside the card takes the project's page
    // background the same way.
    expect(documentStyles()).toContain('--mui-palette-background-default:#654321');
  });

  it('keeps the layout spacing on the shell scale, not the project spacing', () => {
    const state: EditorState = { ...createInitialEditorState(), project: cardProject };
    renderPreviewArea(state);

    const card = screen.getByText('Text Field').closest('.MuiCard-root');
    expect(card).not.toBeNull();

    // Internal padding is a fixed 16px; at the project's 4px spacing
    // base, sx units inside the provider would have produced 8px.
    expect(card).toHaveStyle({ padding: '16px' });

    // The grid gap between cards is 1.5 units of the shell's 8px
    // scale (12px), not of the project's 4px scale (6px).
    const grid = (card as Element).parentElement;
    expect(grid).toHaveStyle({ gap: '12px' });
  });

  // Karl's dark-mode report (Nov 25, 2026): the card borders were not
  // visible. The CardShell applies the shared shell border so the edge
  // survives the dark defaults (paper and page both #0a0a0a); these
  // assertions pin the rendered result in both modes so the border
  // cannot silently stop reaching the card.
  it('renders the card with the dark shell border in dark mode', () => {
    const state: EditorState = {
      ...createInitialEditorState(),
      activeMode: 'dark',
      project: cardProject,
    };
    renderPreviewArea(state);

    const card = screen.getByText('Text Field').closest('.MuiCard-root');
    expect(card).not.toBeNull();
    expect(rulesFor(card as Element)).toMatch(
      /border:1px solid rgba\(255,\s*255,\s*255,\s*0\.16\)/,
    );
  });

  it('renders the card with the light shell border in light mode', () => {
    const state: EditorState = { ...createInitialEditorState(), project: cardProject };
    renderPreviewArea(state);

    const card = screen.getByText('Text Field').closest('.MuiCard-root');
    expect(card).not.toBeNull();
    expect(rulesFor(card as Element)).toMatch(/border:1px solid rgba\(0,\s*0,\s*0,\s*0\.1\)/);
  });
});
