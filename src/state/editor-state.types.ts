import type { ThemeProject } from '../domain/project';
import type { ButtonSettings } from '../domain/components/button.types';
import type { SelectSettings } from '../domain/components/select.types';
import type { TextFieldSettings } from '../domain/components/text-field.types';
import type { GoogleFontSettings, TypographyVariant } from '../domain/typography.types';
import type { TypographyStyle } from '../domain/value.types';

export type EditorSection =
  | 'palette'
  | 'typography'
  | 'foundation'
  | 'button'
  | 'textField'
  | 'select';

export type PreviewMode = 'light' | 'dark';
export type SaveStatus = 'in-memory' | 'saved' | 'saving' | 'error';
export type SemanticPaletteRole =
  | 'primary'
  | 'secondary'
  | 'error'
  | 'warning'
  | 'info'
  | 'success';
export type SurfacePaletteRole =
  | 'background.default'
  | 'background.paper'
  | 'text.primary'
  | 'text.secondary'
  | 'text.disabled'
  | 'divider';

export interface EditorState {
  activeMode: PreviewMode;
  activeSection: EditorSection;
  future: ThemeProject[];
  past: ThemeProject[];
  project: ThemeProject;
  saveStatus: SaveStatus;
  hydrated: boolean;
}

export type EditorAction =
  | { type: 'set-active-mode'; mode: PreviewMode }
  | { type: 'set-active-section'; section: EditorSection }
  | { type: 'rename-project'; name: string }
  | { type: 'set-semantic-color'; mode: PreviewMode; role: SemanticPaletteRole; color: string }
  | { type: 'set-surface-color'; mode: PreviewMode; role: SurfacePaletteRole; color: string }
  | { type: 'set-base-font-size'; value: number }
  | { type: 'set-google-font'; font: GoogleFontSettings }
  | { type: 'set-typography-variant'; variant: TypographyVariant; patch: TypographyStyle }
  | { type: 'set-border-radius'; value: number }
  | { type: 'set-spacing'; value: number }
  | { type: 'set-button-settings'; settings: ButtonSettings }
  | { type: 'set-text-field-settings'; settings: TextFieldSettings }
  | { type: 'set-select-settings'; settings: SelectSettings }
  | { type: 'restore-project'; project?: ThemeProject }
  | { type: 'replace-project'; project: ThemeProject }
  | { type: 'set-save-status'; status: SaveStatus }
  | { type: 'reset-active-section' }
  | { type: 'reset-project' }
  | { type: 'undo' }
  | { type: 'redo' };
