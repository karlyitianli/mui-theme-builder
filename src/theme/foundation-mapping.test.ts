import { describe, expect, it } from 'vitest';

import { defaultProjectFixture } from '../fixtures/theme-project.fixtures';
import { createInitialEditorState, editorReducer } from '../state/editor-reducer';
import { DropdownIcon } from './dropdown-icon';
import { dropdownIconElement } from './dropdown-icon-element';
import { projectToThemeOptions } from './project-to-theme-options';

// Phase 5: foundations.shadows and foundations.shape.cardBorderRadius
// (the model homes for the Shadows and Card radius controls) map into
// the MUI theme options the preview and the exporter consume.
describe('projectToThemeOptions foundation shadows and card radius (Phase 5)', () => {
  it('maps the builder defaults into Paper, Card, Button, Menu, and OutlinedInput', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    const paper = options.components?.MuiPaper as { defaultProps?: { elevation?: number } };
    const card = options.components?.MuiCard as {
      defaultProps?: { elevation?: number };
      styleOverrides?: { root?: { borderRadius?: number } };
    };
    const button = options.components?.MuiButton as {
      defaultProps?: { disableElevation?: boolean };
    };
    const menu = options.components?.MuiMenu as {
      defaultProps?: { slotProps?: { paper?: { elevation?: number } } };
      styleOverrides?: { paper?: { border?: string; boxShadow?: string } };
    };
    const input = options.components?.MuiOutlinedInput as {
      styleOverrides?: { root?: { boxShadow?: string } };
    };
    // Karl's Nov 26, 2026 shadow configuration: no global elevation
    // (Paper 0, previously 2 under the Medium lock), elevation on the
    // components.
    expect(paper.defaultProps?.elevation).toBe(0);
    expect(card.defaultProps?.elevation).toBe(1);
    expect(card.styleOverrides?.root?.borderRadius).toBe(12);
    expect(button.defaultProps?.disableElevation).toBe(false);
    // The foundations own the Menu paper's shadow now: its elevation
    // comes from the menu shadow, and the baseline paper override keeps
    // its border but no longer sets a boxShadow of its own.
    expect(menu.defaultProps?.slotProps?.paper?.elevation).toBe(8);
    expect(menu.styleOverrides?.paper?.border).toContain('solid');
    expect(menu.styleOverrides?.paper?.boxShadow).toBeUndefined();
    // The Autocomplete dropdown paper follows the same menu elevation
    // (the Nov 25, 2026 matched-dropdown treatment, re-based onto the
    // elevation mechanism), and its baseline override likewise sets
    // no shadow of its own.
    const autocomplete = options.components?.MuiAutocomplete as {
      defaultProps?: { slotProps?: { paper?: { elevation?: number } } };
      styleOverrides?: { paper?: { boxShadow?: string } };
    };
    expect(autocomplete.defaultProps?.slotProps?.paper?.elevation).toBe(8);
    expect(autocomplete.styleOverrides?.paper?.boxShadow).toBeUndefined();
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

// Karl's dropdown default (Nov 25, 2026): Select and Autocomplete use the
// Phosphor caret-down, set once in the foundation components block so the
// preview, the shell's own selects, and the exporter all inherit it.
describe('projectToThemeOptions dropdown icon default', () => {
  it('maps the Phosphor caret into MuiSelect and MuiAutocomplete defaultProps', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    const select = options.components?.MuiSelect as {
      defaultProps?: { IconComponent?: unknown };
    };
    const autocomplete = options.components?.MuiAutocomplete as {
      defaultProps?: { popupIcon?: unknown; fullWidth?: boolean };
    };
    expect(select.defaultProps?.IconComponent).toBe(DropdownIcon);
    expect(autocomplete.defaultProps?.popupIcon).toBe(dropdownIconElement);
    // The external-label defaults that share the Autocomplete block survive.
    expect(autocomplete.defaultProps?.fullWidth).toBe(true);
  });

  it('keeps the caret when the project has Select settings without defaultProps', () => {
    const project = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        select: { style: { iconColor: '#123456' } },
      },
    };
    const options = projectToThemeOptions(project);
    const select = options.components?.MuiSelect as {
      defaultProps?: { IconComponent?: unknown };
      styleOverrides?: { icon?: { color?: string } };
    };
    expect(select.defaultProps?.IconComponent).toBe(DropdownIcon);
    expect(select.styleOverrides?.icon?.color).toBe('#123456');
  });

  it('merges Select settings defaultProps alongside the caret', () => {
    const project = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        select: { defaultProps: { fullWidth: true } },
      },
    };
    const options = projectToThemeOptions(project);
    const select = options.components?.MuiSelect as {
      defaultProps?: { IconComponent?: unknown; fullWidth?: boolean };
    };
    expect(select.defaultProps?.IconComponent).toBe(DropdownIcon);
    expect(select.defaultProps?.fullWidth).toBe(true);
  });
});
