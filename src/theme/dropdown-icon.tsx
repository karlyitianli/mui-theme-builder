import type { ComponentProps, ReactElement } from 'react';
import { CaretDown } from '@phosphor-icons/react/dist/csr/CaretDown';

// Karl's prescribed dropdown default (Nov 25, 2026): every Select and
// Autocomplete in a built theme uses the Phosphor caret-down instead of
// MUI's arrow. 18px because the raw 24px glyph reads too large inside a
// select. The exporter emits this same size, so runtime and shipped
// themes agree.
export const DROPDOWN_ICON_SIZE = 18;

type DropdownIconProps = Omit<ComponentProps<typeof CaretDown>, 'size'>;

/**
 * The dropdown icon as a component. MUI Select renders its IconComponent
 * with its own positioning classes, so every prop (className and style
 * included) forwards to the glyph; only the size is pinned. The element
 * form for MuiAutocomplete lives in dropdown-icon-element.ts.
 */
export function DropdownIcon(props: DropdownIconProps): ReactElement {
  return <CaretDown {...props} size={DROPDOWN_ICON_SIZE} />;
}
