import { createTheme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import {
  customizedProjectFixture,
  defaultProjectFixture,
} from '../fixtures/theme-project.fixtures';
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

// Task 3.5 (Nov 26, 2026): foundations.breakpoints,
// foundations.transitions, and foundations.zIndex (the model homes for
// the Other tab) map into the theme options the preview and the
// exporter consume. Both factories store MUI's defaults for the three
// groups, so a fresh project's options carry them verbatim; the values
// below are checked against a plain createTheme oracle on the
// installed MUI, the same check the Default preset's values went
// through.
describe('projectToThemeOptions Other foundations (task 3.5)', () => {
  it('maps the stored MUI defaults for all three groups', () => {
    const options = projectToThemeOptions(defaultProjectFixture);
    const oracle = createTheme();
    expect(options.breakpoints?.values).toEqual(oracle.breakpoints.values);
    expect(options.transitions?.duration).toEqual(oracle.transitions.duration);
    expect(options.transitions?.easing).toEqual(oracle.transitions.easing);
    expect(options.zIndex).toEqual(oracle.zIndex);
  });

  it('fills a sparse project\u2019s missing groups with the MUI defaults', () => {
    // The customized fixture predates the model homes: its foundations
    // carry none of the three groups.
    const options = projectToThemeOptions(customizedProjectFixture);
    const oracle = createTheme();
    expect(options.breakpoints?.values).toEqual(oracle.breakpoints.values);
    expect(options.transitions?.duration).toEqual(oracle.transitions.duration);
    expect(options.transitions?.easing).toEqual(oracle.transitions.easing);
    expect(options.zIndex).toEqual(oracle.zIndex);
  });

  it('fills only the missing keys of a partial group', () => {
    const project = {
      ...defaultProjectFixture,
      foundations: {
        ...defaultProjectFixture.foundations,
        breakpoints: { md: 1000 },
        zIndex: { modal: 2000 },
      },
    };
    const options = projectToThemeOptions(project);
    expect(options.breakpoints?.values).toEqual({ xs: 0, sm: 600, md: 1000, lg: 1200, xl: 1536 });
    expect(options.zIndex?.modal).toBe(2000);
    expect(options.zIndex?.tooltip).toBe(1500);
  });

  it('Other edits through the reducer appear in the mapped theme options', () => {
    let state = createInitialEditorState();
    state = editorReducer(state, { type: 'set-breakpoint', key: 'md', value: 1000 });
    state = editorReducer(state, { type: 'set-transition-duration', key: 'standard', value: 450 });
    state = editorReducer(state, {
      type: 'set-transition-easing',
      key: 'easeOut',
      value: 'cubic-bezier(0.1, 0, 0.3, 1)',
    });
    state = editorReducer(state, { type: 'set-z-index', key: 'tooltip', value: 1600 });
    const options = projectToThemeOptions(state.project);
    expect(options.breakpoints?.values?.md).toBe(1000);
    expect(options.transitions?.duration?.standard).toBe(450);
    expect(options.transitions?.easing?.easeOut).toBe('cubic-bezier(0.1, 0, 0.3, 1)');
    expect(options.zIndex?.tooltip).toBe(1600);
    // Untouched keys keep their stored defaults, and the edits are
    // undoable like every other token edit.
    expect(options.breakpoints?.values?.lg).toBe(1200);
    const undone = editorReducer(state, { type: 'undo' });
    expect(projectToThemeOptions(undone.project).zIndex?.tooltip).toBe(1500);
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
