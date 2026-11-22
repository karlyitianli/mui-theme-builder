import { FormControlLabel, Stack, Switch } from '@mui/material';

import type { ButtonSettings } from '../../../domain/components/button.types';
import type { FontWeight } from '../../../domain/value.types';
import { useEditorDispatch, useEditorState } from '../../../state/editor-hooks';
import { EnumControl } from '../../controls/EnumControl';
import { NumberControl } from '../../controls/NumberControl';
import { ColorControl } from '../../controls/ColorControl';

export function ButtonInspector() {
  const { project } = useEditorState();
  const dispatch = useEditorDispatch();
  const settings = project.components?.button ?? {};
  const update = (next: ButtonSettings) => dispatch({ type: 'set-button-settings', settings: next });
  const defaults = settings.defaultProps ?? {};
  const style = settings.style ?? {};

  return (
    <Stack spacing={3}>
      <EnumControl label="Default variant" options={['contained', 'outlined', 'text'] as const} value={defaults.variant ?? 'contained'} onChange={(variant) => update({ ...settings, defaultProps: { ...defaults, variant } })} />
      <EnumControl label="Default size" options={['small', 'medium', 'large'] as const} value={defaults.size ?? 'medium'} onChange={(size) => update({ ...settings, defaultProps: { ...defaults, size } })} />
      <FormControlLabel control={<Switch checked={defaults.disableElevation ?? false} onChange={(_, disableElevation) => update({ ...settings, defaultProps: { ...defaults, disableElevation } })} />} label="Disable elevation" />
      <EnumControl label="Text transform" options={['none', 'capitalize', 'uppercase', 'lowercase'] as const} value={style.textTransform ?? 'none'} onChange={(textTransform) => update({ ...settings, style: { ...style, textTransform } })} />
      <EnumControl label="Font weight" options={['300', '400', '500', '600', '700'] as const} value={String(style.fontWeight ?? 500) as `${FontWeight}`} onChange={(fontWeight) => update({ ...settings, style: { ...style, fontWeight: Number(fontWeight) as FontWeight } })} />
      <NumberControl label="Border radius" min={0} max={32} value={typeof style.border?.radius === 'number' ? style.border.radius : 6} onCommit={(radius) => update({ ...settings, style: { ...style, border: { ...style.border, radius } } })} />
      <NumberControl label="Border width" min={0} max={8} value={typeof style.border?.width === 'number' ? style.border.width : 1} onCommit={(width) => update({ ...settings, style: { ...style, border: { ...style.border, width } } })} />
      <EnumControl label="Border style" options={['none', 'solid', 'dashed'] as const} value={style.border?.style ?? 'solid'} onChange={(borderStyle) => update({ ...settings, style: { ...style, border: { ...style.border, style: borderStyle } } })} />
      <ColorControl key={String(style.border?.color ?? 'default')} inherited={style.border?.color === undefined} label="Border color · both schemes" value={style.border?.color ?? '#e5e5e5'} onCommit={(color) => update({ ...settings, style: { ...style, border: { ...style.border, color } } })} />
      <NumberControl label="Horizontal padding" min={0} max={64} value={typeof style.paddingInline === 'number' ? style.paddingInline : 16} onCommit={(paddingInline) => update({ ...settings, style: { ...style, paddingInline } })} />
      <NumberControl label="Vertical padding" min={0} max={32} value={typeof style.paddingBlock === 'number' ? style.paddingBlock : 8} onCommit={(paddingBlock) => update({ ...settings, style: { ...style, paddingBlock } })} />
    </Stack>
  );
}
