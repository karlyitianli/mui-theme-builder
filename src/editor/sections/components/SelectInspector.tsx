import { FormControlLabel, Stack, Switch } from '@mui/material';

import type { SelectSettings } from '../../../domain/components/select.types';
import { useEditorDispatch, useEditorState } from '../../../state/editor-hooks';
import { ColorControl } from '../../controls/ColorControl';
import { EnumControl } from '../../controls/EnumControl';
import { NumberControl } from '../../controls/NumberControl';

export function SelectInspector() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const settings = project.components?.select ?? {};
  const update = (next: SelectSettings) => dispatch({ type: 'set-select-settings', settings: next });
  const defaults = settings.defaultProps ?? {};
  const style = settings.style ?? {};

  return (
    <Stack spacing={3}>
      <EnumControl label="Default variant" options={['outlined', 'filled', 'standard'] as const} value={defaults.variant ?? 'outlined'} onChange={(variant) => update({ ...settings, defaultProps: { ...defaults, variant } })} />
      <EnumControl label="Default size" options={['small', 'medium'] as const} value={defaults.size ?? 'small'} onChange={(size) => update({ ...settings, defaultProps: { ...defaults, size } })} />
      <FormControlLabel control={<Switch checked={defaults.fullWidth ?? true} onChange={(_, fullWidth) => update({ ...settings, defaultProps: { ...defaults, fullWidth } })} />} label="Full width" />
      <NumberControl label="Border radius" min={0} max={32} value={typeof style.border?.radius === 'number' ? style.border.radius : 6} onCommit={(radius) => update({ ...settings, style: { ...style, border: { ...style.border, radius } } })} />
      <NumberControl label="Border width" min={0} max={8} value={typeof style.border?.width === 'number' ? style.border.width : 1} onCommit={(width) => update({ ...settings, style: { ...style, border: { ...style.border, width } } })} />
      <EnumControl label="Border style" options={['none', 'solid', 'dashed'] as const} value={style.border?.style ?? 'solid'} onChange={(borderStyle) => update({ ...settings, style: { ...style, border: { ...style.border, style: borderStyle } } })} />
      <ColorControl key={String(style.border?.color ?? 'default')} inherited={style.border?.color === undefined} label="Border color · both schemes" value={style.border?.color ?? '#e5e5e5'} onCommit={(color) => update({ ...settings, style: { ...style, border: { ...style.border, color } } })} />
      <NumberControl label="Horizontal input padding" min={0} max={48} value={typeof style.inputPaddingInline === 'number' ? style.inputPaddingInline : 12} onCommit={(inputPaddingInline) => update({ ...settings, style: { ...style, inputPaddingInline } })} />
      <NumberControl label="Vertical input padding" min={0} max={32} value={typeof style.inputPaddingBlock === 'number' ? style.inputPaddingBlock : 8} step={0.5} onCommit={(inputPaddingBlock) => update({ ...settings, style: { ...style, inputPaddingBlock } })} />
      <NumberControl label="Input font size" min={8} max={32} value={typeof style.inputTypography?.fontSize === 'number' ? style.inputTypography.fontSize : 14} onCommit={(fontSize) => update({ ...settings, style: { ...style, inputTypography: { ...style.inputTypography, fontSize } } })} />
      <ColorControl key={String(style.iconColor ?? 'default')} inherited={style.iconColor === undefined} label="Icon color" value={style.iconColor ?? '#737373'} onCommit={(iconColor) => update({ ...settings, style: { ...style, iconColor } })} />
    </Stack>
  );
}
