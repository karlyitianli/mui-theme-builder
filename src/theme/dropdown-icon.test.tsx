import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DROPDOWN_ICON_SIZE, DropdownIcon } from './dropdown-icon';
import { dropdownIconElement } from './dropdown-icon-element';

afterEach(cleanup);

// The runtime half of Karl's dropdown default: MUI Select hands its
// IconComponent the positioning classes, so the wrapper must forward
// className and style to the glyph while pinning the size at 18px.
describe('DropdownIcon', () => {
  it('forwards className and style to the glyph at the pinned size', () => {
    const { container } = render(
      <DropdownIcon className="mui-select-icon" style={{ color: 'rgb(1, 2, 3)' }} />,
    );
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('class')).toContain('mui-select-icon');
    expect(svg?.getAttribute('style')).toContain('color: rgb(1, 2, 3)');
    expect(svg?.getAttribute('width')).toBe(String(DROPDOWN_ICON_SIZE));
    expect(svg?.getAttribute('height')).toBe(String(DROPDOWN_ICON_SIZE));
    expect(DROPDOWN_ICON_SIZE).toBe(18);
  });

  it('exposes a stable element form for the Autocomplete popupIcon', () => {
    expect(dropdownIconElement.type).toBe(DropdownIcon);
    const { container } = render(dropdownIconElement);
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
