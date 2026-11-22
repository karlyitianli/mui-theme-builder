import { PaletteIcon } from '@phosphor-icons/react/dist/csr/Palette';
import { TextTIcon } from '@phosphor-icons/react/dist/csr/TextT';
import { RadioButtonIcon } from '@phosphor-icons/react/dist/csr/RadioButton';
import { CursorClickIcon } from '@phosphor-icons/react/dist/csr/CursorClick';
import { SquaresFourIcon } from '@phosphor-icons/react/dist/csr/SquaresFour';
import { TextboxIcon } from '@phosphor-icons/react/dist/csr/Textbox';
import { List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

import { useEditorDispatch, useEditorState } from '../../state/editor-hooks';
import type { EditorSection } from '../../state/editor-state.types';

const sections: Array<{
  id: EditorSection;
  label: string;
  icon: typeof PaletteIcon;
}> = [
  { id: 'palette', label: 'Colors', icon: PaletteIcon },
  { id: 'typography', label: 'Typography', icon: TextTIcon },
  { id: 'foundation', label: 'Shape & spacing', icon: SquaresFourIcon },
  { id: 'button', label: 'Button', icon: CursorClickIcon },
  { id: 'textField', label: 'Text field', icon: TextboxIcon },
  { id: 'select', label: 'Select', icon: RadioButtonIcon },
];

export function SectionNavigation() {
  const { activeSection } = useEditorState();
  const dispatch = useEditorDispatch();

  return (
    <nav aria-label="Theme sections">
      <Typography color="text.secondary" sx={{ px: 2, pt: 2 }} variant="overline">
        Theme
      </Typography>
      <List dense>
        {sections.map(({ id, icon: Icon, label }) => (
          <ListItemButton
            key={id}
            onClick={() => dispatch({ type: 'set-active-section', section: id })}
            selected={activeSection === id}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Icon size={20} />
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </nav>
  );
}
