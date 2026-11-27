import {
  createDefaultProject,
  findThemePreset,
  STARTUP_PRESET_ID,
  type ThemeProject,
} from '../domain/project';
import type { PaletteColorSettings } from '../domain/palette.types';
import { semanticColorMainDefault } from '../theme/palette-adapter';
import type { EditorAction, EditorSection, EditorState } from './editor-state.types';

const HISTORY_LIMIT = 50;

export function createInitialEditorState(): EditorState {
  return {
    activeMode: 'light',
    activePreset: STARTUP_PRESET_ID,
    activeSection: 'palette',
    future: [],
    past: [],
    project: createDefaultProject(),
    saveStatus: 'in-memory',
    hydrated: false,
  };
}

function withUpdatedTimestamp(project: ThemeProject): ThemeProject {
  return {
    ...project,
    metadata: {
      ...project.metadata,
      updatedAt: new Date().toISOString(),
    },
  };
}

function commitProject(state: EditorState, project: ThemeProject): EditorState {
  return {
    ...state,
    future: [],
    past: [...state.past.slice(-(HISTORY_LIMIT - 1)), state.project],
    project: withUpdatedTimestamp(project),
    saveStatus: 'in-memory',
  };
}

function resetSection(project: ThemeProject, section: EditorSection, mode: 'light' | 'dark') {
  if (section === 'palette') {
    return {
      ...project,
      colorSchemes: {
        ...project.colorSchemes,
        [mode]: {},
      },
    };
  }

  if (section === 'typography' || section === 'foundation') {
    const foundations = { ...project.foundations };
    if (section === 'typography') delete foundations.typography;
    if (section === 'foundation') {
      delete foundations.shape;
      delete foundations.spacing;
      delete foundations.interactions;
      delete foundations.shadows;
      delete foundations.breakpoints;
      delete foundations.transitions;
      delete foundations.zIndex;
    }

    return {
      ...project,
      foundations: Object.keys(foundations).length > 0 ? foundations : undefined,
    };
  }

  const components = { ...project.components };
  delete components[section];
  return {
    ...project,
    components: Object.keys(components).length > 0 ? components : undefined,
  };
}

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'set-active-mode':
      return { ...state, activeMode: action.mode };
    case 'set-active-section':
      return { ...state, activeSection: action.section };
    case 'rename-project': {
      const name = action.name.trim();
      if (!name || name === state.project.metadata.name) return state;
      return commitProject(state, {
        ...state.project,
        metadata: { ...state.project.metadata, name },
      });
    }
    case 'set-semantic-color': {
      const scheme = state.project.colorSchemes[action.mode];
      const variant = action.variant ?? 'main';
      const current = scheme.palette?.[action.role];
      if (current?.[variant] === action.color) return state;
      // PaletteColorSettings requires a main, so pinning a variant on a
      // role the project has never stored seeds main with the role's
      // current effective main (the baseline or MUI default the theme
      // build would have used), leaving the visible main unchanged.
      const nextSettings: PaletteColorSettings = {
        ...(current ?? { main: semanticColorMainDefault(action.mode, action.role) }),
      };
      nextSettings[variant] = action.color;
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: {
            ...scheme,
            palette: {
              ...scheme.palette,
              [action.role]: nextSettings,
            },
          },
        },
      });
    }
    case 'clear-semantic-color-variant': {
      const scheme = state.project.colorSchemes[action.mode];
      const current = scheme.palette?.[action.role];
      if (current === undefined || current[action.variant] === undefined) return state;
      const nextSettings: PaletteColorSettings = { ...current };
      delete nextSettings[action.variant];
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: {
            ...scheme,
            palette: {
              ...scheme.palette,
              [action.role]: nextSettings,
            },
          },
        },
      });
    }
    case 'set-surface-color': {
      const scheme = state.project.colorSchemes[action.mode];
      const current =
        action.role === 'divider'
          ? scheme.palette?.divider
          : action.role === 'background.default'
            ? scheme.palette?.background?.default
            : action.role === 'background.paper'
              ? scheme.palette?.background?.paper
              : action.role === 'text.primary'
                ? scheme.palette?.text?.primary
                : action.role === 'text.secondary'
                  ? scheme.palette?.text?.secondary
                  : scheme.palette?.text?.disabled;
      if (current === action.color) return state;
      let palette = { ...scheme.palette };
      if (action.role === 'divider') {
        palette = { ...palette, divider: action.color };
      } else if (action.role.startsWith('background.')) {
        const token = action.role === 'background.default' ? 'default' : 'paper';
        palette = { ...palette, background: { ...palette.background, [token]: action.color } };
      } else {
        const token = action.role.slice(5) as 'primary' | 'secondary' | 'disabled';
        palette = { ...palette, text: { ...palette.text, [token]: action.color } };
      }
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: { ...scheme, palette },
        },
      });
    }
    case 'set-grey-color': {
      const scheme = state.project.colorSchemes[action.mode];
      if (scheme.palette?.grey?.[action.shade] === action.color) return state;
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: {
            ...scheme,
            palette: {
              ...scheme.palette,
              grey: { ...scheme.palette?.grey, [action.shade]: action.color },
            },
          },
        },
      });
    }
    case 'set-action-color': {
      const scheme = state.project.colorSchemes[action.mode];
      if (scheme.palette?.action?.[action.key] === action.color) return state;
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: {
            ...scheme,
            palette: {
              ...scheme.palette,
              action: { ...scheme.palette?.action, [action.key]: action.color },
            },
          },
        },
      });
    }
    case 'set-action-opacity': {
      const scheme = state.project.colorSchemes[action.mode];
      if (scheme.palette?.action?.[action.key] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        colorSchemes: {
          ...state.project.colorSchemes,
          [action.mode]: {
            ...scheme,
            palette: {
              ...scheme.palette,
              action: { ...scheme.palette?.action, [action.key]: action.value },
            },
          },
        },
      });
    }
    case 'set-base-font-size':
      if (state.project.foundations?.typography?.fontSize === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          typography: { ...state.project.foundations?.typography, fontSize: action.value },
        },
      });
    case 'set-google-font':
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          typography: {
            ...state.project.foundations?.typography,
            font: action.font,
          },
        },
      });
    case 'set-typography-variant': {
      const typography = state.project.foundations?.typography;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          typography: {
            ...typography,
            variants: {
              ...typography?.variants,
              [action.variant]: { ...typography?.variants?.[action.variant], ...action.patch },
            },
          },
        },
      });
    }
    case 'set-border-radius':
      if (state.project.foundations?.shape?.borderRadius === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          shape: { ...state.project.foundations?.shape, borderRadius: action.value },
        },
      });
    case 'set-card-border-radius':
      if (state.project.foundations?.shape?.cardBorderRadius === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          shape: { ...state.project.foundations?.shape, cardBorderRadius: action.value },
        },
      });
    case 'set-shadow-elevation': {
      if (state.project.foundations?.shadows?.[action.target] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          shadows: { ...state.project.foundations?.shadows, [action.target]: action.value },
        },
      });
    }
    case 'set-shadows':
      return commitProject(state, {
        ...state.project,
        foundations: { ...state.project.foundations, shadows: { ...action.shadows } },
      });
    case 'set-breakpoint': {
      if (state.project.foundations?.breakpoints?.[action.key] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          breakpoints: { ...state.project.foundations?.breakpoints, [action.key]: action.value },
        },
      });
    }
    case 'set-transition-duration': {
      const transitions = state.project.foundations?.transitions;
      if (transitions?.duration?.[action.key] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          transitions: {
            ...transitions,
            duration: { ...transitions?.duration, [action.key]: action.value },
          },
        },
      });
    }
    case 'set-transition-easing': {
      const transitions = state.project.foundations?.transitions;
      if (transitions?.easing?.[action.key] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          transitions: {
            ...transitions,
            easing: { ...transitions?.easing, [action.key]: action.value },
          },
        },
      });
    }
    case 'set-z-index': {
      if (state.project.foundations?.zIndex?.[action.key] === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: {
          ...state.project.foundations,
          zIndex: { ...state.project.foundations?.zIndex, [action.key]: action.value },
        },
      });
    }
    case 'set-spacing':
      if (state.project.foundations?.spacing === action.value) return state;
      return commitProject(state, {
        ...state.project,
        foundations: { ...state.project.foundations, spacing: action.value },
      });
    case 'set-button-settings':
      return commitProject(state, {
        ...state.project,
        components: { ...state.project.components, button: action.settings },
      });
    case 'set-text-field-settings':
      return commitProject(state, {
        ...state.project,
        components: { ...state.project.components, textField: action.settings },
      });
    case 'set-select-settings':
      return commitProject(state, {
        ...state.project,
        components: { ...state.project.components, select: action.settings },
      });
    case 'restore-project':
      return {
        ...state,
        project: action.project ?? state.project,
        past: [],
        future: [],
        hydrated: true,
        saveStatus: action.project ? 'saved' : 'in-memory',
      };
    case 'replace-project':
      return {
        ...state,
        project: action.project,
        past: [...state.past.slice(-(HISTORY_LIMIT - 1)), state.project],
        future: [],
        hydrated: true,
        saveStatus: 'in-memory',
      };
    case 'set-save-status':
      return { ...state, saveStatus: action.status };
    case 'reset-active-section':
      return commitProject(
        state,
        resetSection(state.project, state.activeSection, state.activeMode),
      );
    case 'reset-project':
      // Reset returns to the startup preset's project (Black), the same
      // project a fresh session opens with.
      return {
        ...commitProject(state, createDefaultProject()),
        activePreset: STARTUP_PRESET_ID,
      };
    case 'load-preset': {
      const preset = findThemePreset(action.preset);
      return {
        ...commitProject(state, preset.createProject()),
        activePreset: preset.id,
      };
    }
    case 'undo': {
      const previous = state.past.at(-1);
      if (!previous) return state;
      return {
        ...state,
        past: state.past.slice(0, -1),
        project: previous,
        future: [state.project, ...state.future].slice(0, HISTORY_LIMIT),
        saveStatus: 'in-memory',
      };
    }
    case 'redo': {
      const [next, ...remaining] = state.future;
      if (!next) return state;
      return {
        ...state,
        past: [...state.past.slice(-(HISTORY_LIMIT - 1)), state.project],
        project: next,
        future: remaining,
        saveStatus: 'in-memory',
      };
    }
  }
}
