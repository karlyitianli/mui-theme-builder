import { describe, expect, it } from 'vitest';

import { defaultProjectFixture } from '../fixtures/theme-project.fixtures';
import { createInitialEditorState, editorReducer } from '../state/editor-reducer';
import { projectToThemeOptions } from './project-to-theme-options';

// Phase 5: foundations.shadows and foundations.shape.cardBorderRadius
// (the model homes for the Shadows and Card radius controls) map into
// the MUI theme options the preview and the exporter consume.
describe('projectToThemeOptions foundation shadows and card radius (Phase 5)', () => {
  it('maps the locked defaults into Paper, Card, Button, and OutlinedInput', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    const paper = options.components?.MuiPaper as { defaultProps?: { elevation?: number } };
    const card = options.components?.MuiCard as {
      defaultProps?: { elevation?: number };
      styleOverrides?: { root?: { borderRadius?: number } };
    };
    const button = options.components?.MuiButton as {
      defaultProps?: { disableElevation?: boolean };
    };
    const input = options.components?.MuiOutlinedInput as {
      styleOverrides?: { root?: { boxShadow?: string } };
    };
    expect(paper.defaultProps?.elevation).toBe(2);
    expect(card.defaultProps?.elevation).toBe(1);
    expect(card.styleOverrides?.root?.borderRadius).toBe(12);
    expect(button.defaultProps?.disableElevation).toBe(false);
    expect(input.styleOverrides?.root?.boxShadow).toBe('none');
  });

  it('a Card radius edit appears in the mapped theme options', () => {
    const state = editorReducer(createInitialEditorState(), {
      type: 'set-card-border-radius',
      value: 20,
    });
    const options = projectToThemeOptions(state.project);
    const card = options.components?.MuiCard as {
      styleOverrides?: { root?: { borderRadius?: number } };
    };
    expect(card.styleOverrides?.root?.borderRadius).toBe(20);
  });

  it('shadow elevation edits appear in the mapped theme options', () => {
    const state = editorReducer(createInitialEditorState(), {
      type: 'set-shadow-elevation',
      target: 'card',
      value: 5,
    });
    const options = projectToThemeOptions(state.project);
    const card = options.components?.MuiCard as { defaultProps?: { elevation?: number } };
    expect(card.defaultProps?.elevation).toBe(5);
  });
});
