import { createElement, type ReactElement } from 'react';

import { DropdownIcon } from './dropdown-icon';

/**
 * The dropdown icon as a stable element for MuiAutocomplete's popupIcon,
 * which takes a node rather than a component. Module-level so its
 * identity is stable across projectToThemeOptions calls; the exporter
 * recognizes it by identity and emits a reference instead of data. Kept
 * out of dropdown-icon.tsx so that file exports only the component (the
 * react-refresh lint rule).
 */
export const dropdownIconElement: ReactElement = createElement(DropdownIcon);
