import { describe, expect, it } from 'vitest';

import type { ThemeProject } from '../../domain/project';
import { defaultProjectFixture } from '../../fixtures/theme-project.fixtures';
import { projectToThemeOptions } from '../project-to-theme-options';
import { buttonSettingsToMui } from './button-adapter';
import { textFieldSettingsToMui } from './text-field-adapter';

// Task 1.2 (PROJECT_STATUS.md): the button and text-field adapters used
// to emit defaultProps unconditionally. mergeThemeComponents deep-merges
// per key, so an explicit undefined erased the defaultProps that earlier
// blocks in the merge had set (the baseline and foundation MuiButton
// defaults, the external-label MuiTextField defaults). The select
// adapter was fixed first; these tests pin the same omission for the
// other two adapters, at the adapter level and in the merged theme
// options.
describe('buttonSettingsToMui defaultProps omission', () => {
  it('omits the defaultProps key when the settings carry none', () => {
    const components = buttonSettingsToMui({ style: { fontWeight: 600 } });
    expect(components?.MuiButton).toBeDefined();
    expect('defaultProps' in (components?.MuiButton ?? {})).toBe(false);
  });

  it('emits defaultProps when the settings carry them', () => {
    const components = buttonSettingsToMui({
      defaultProps: { size: 'small' },
    });
    expect(components?.MuiButton?.defaultProps).toEqual({ size: 'small' });
  });
});

describe('textFieldSettingsToMui defaultProps omission', () => {
  it('omits the defaultProps key when the settings carry none', () => {
    const components = textFieldSettingsToMui({
      style: { border: { radius: 4 } },
    });
    expect(components?.MuiTextField).toBeDefined();
    expect('defaultProps' in (components?.MuiTextField ?? {})).toBe(false);
  });

  it('emits defaultProps when the settings carry them', () => {
    const components = textFieldSettingsToMui({
      defaultProps: { size: 'medium' },
    });
    expect(components?.MuiTextField?.defaultProps).toEqual({ size: 'medium' });
  });
});

describe('merged theme options keep earlier defaultProps (task 1.2)', () => {
  it('keeps the baseline and foundation MuiButton defaultProps when Button settings carry none', () => {
    const project: ThemeProject = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        button: { style: { fontWeight: 600 } },
      },
    };
    const options = projectToThemeOptions(project);
    const button = options.components?.MuiButton as {
      defaultProps?: {
        disableElevation?: boolean;
        size?: string;
        variant?: string;
      };
      styleOverrides?: { root?: { fontWeight?: number } };
    };
    // size and variant come from the shadcn baseline block;
    // disableElevation is the foundation block's value for the default
    // shadow settings (Button elevation 2, so elevation stays enabled).
    expect(button.defaultProps).toEqual({
      disableElevation: false,
      size: 'medium',
      variant: 'contained',
    });
    expect(button.styleOverrides?.root?.fontWeight).toBe(600);
  });

  it('merges Button settings defaultProps alongside the earlier blocks', () => {
    const project: ThemeProject = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        button: { defaultProps: { size: 'small' } },
      },
    };
    const options = projectToThemeOptions(project);
    const button = options.components?.MuiButton as {
      defaultProps?: {
        disableElevation?: boolean;
        size?: string;
        variant?: string;
      };
    };
    expect(button.defaultProps).toEqual({
      disableElevation: false,
      size: 'small',
      variant: 'contained',
    });
  });

  it('keeps the external-label MuiTextField defaultProps when TextField settings carry none', () => {
    const project: ThemeProject = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        textField: { style: { border: { radius: 4 } } },
      },
    };
    const options = projectToThemeOptions(project);
    const textField = options.components?.MuiTextField as {
      defaultProps?: {
        fullWidth?: boolean;
        size?: string;
        variant?: string;
      };
    };
    expect(textField.defaultProps).toEqual({
      fullWidth: true,
      size: 'small',
      variant: 'outlined',
    });
  });

  it('merges TextField settings defaultProps alongside the external-label block', () => {
    const project: ThemeProject = {
      ...defaultProjectFixture,
      components: {
        ...defaultProjectFixture.components,
        textField: { defaultProps: { size: 'medium' } },
      },
    };
    const options = projectToThemeOptions(project);
    const textField = options.components?.MuiTextField as {
      defaultProps?: {
        fullWidth?: boolean;
        size?: string;
        variant?: string;
      };
    };
    expect(textField.defaultProps).toEqual({
      fullWidth: true,
      size: 'medium',
      variant: 'outlined',
    });
  });
});
