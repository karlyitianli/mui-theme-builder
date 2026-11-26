import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { PREVIEW_COMPONENTS } from './component-registry';

// Render and interaction smoke tests for the cards added when the
// registry grew to the full MUI Inputs list (Karl, Nov 25, 2026).
// Each entry renders on its own under MUI's default theme; the preview
// area's theme wrapping is covered by preview-area.test.tsx and
// preview-card.test.tsx.
function renderEntry(id: string) {
  const entry = PREVIEW_COMPONENTS.find((candidate) => candidate.id === id);
  if (!entry) throw new Error(`registry is missing the ${id} entry`);
  return render(<>{entry.render()}</>);
}

describe('Inputs preview cards', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());

  it('Autocomplete renders a combobox with a dropdown toggle', () => {
    renderEntry('autocomplete');
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument();
  });

  it('Button Group renders three contained buttons in a group', () => {
    renderEntry('button-group');
    for (const name of ['One', 'Two', 'Three']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });

  it('Checkbox renders checked, unchecked, and indeterminate states', () => {
    renderEntry('checkbox');
    expect(screen.getByRole('checkbox', { name: 'Checked' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Unchecked' })).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Indeterminate' })).toBeInTheDocument();
  });

  it('Floating Action Button renders a round primary button with an Add label', () => {
    renderEntry('floating-action-button');
    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
  });

  it('Radio Group renders three radios with the first selected', () => {
    renderEntry('radio-group');
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'One' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Two' })).not.toBeChecked();
  });

  it('Rating renders with four stars set', () => {
    renderEntry('rating');
    expect(screen.getByRole('radio', { name: '4 Stars' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '5 Stars' })).not.toBeChecked();
  });

  it('Slider renders holding its starting value', () => {
    renderEntry('slider');
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuenow', '30');
  });

  it('Switch renders an on and an off switch', () => {
    renderEntry('switch');
    expect(screen.getByRole('switch', { name: 'On' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Off' })).not.toBeChecked();
  });

  it('Toggle Button renders an exclusive group with the first option active', () => {
    renderEntry('toggle-button');
    expect(screen.getByRole('button', { name: 'Left' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Center' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('Transfer List renders both lists with their starting items', () => {
    const { container } = renderEntry('transfer-list');
    const lists = container.querySelectorAll('ul');
    expect(lists).toHaveLength(2);
    expect(within(lists[0] as HTMLElement).getByText('Item 1')).toBeInTheDocument();
    expect(within(lists[0] as HTMLElement).getByText('Item 3')).toBeInTheDocument();
    expect(within(lists[1] as HTMLElement).getByText('Item 4')).toBeInTheDocument();
    expect(within(lists[1] as HTMLElement).getByText('Item 5')).toBeInTheDocument();
  });

  it('toggling the Off switch turns it on', () => {
    renderEntry('switch');
    const offSwitch = screen.getByRole('switch', { name: 'Off' });
    expect(offSwitch).not.toBeChecked();
    fireEvent.click(offSwitch);
    expect(offSwitch).toBeChecked();
  });

  it('Transfer List moves a checked item to the other list', () => {
    const { container } = renderEntry('transfer-list');
    fireEvent.click(screen.getByText('Item 1'));
    fireEvent.click(screen.getByRole('button', { name: 'Move selected right' }));
    const lists = container.querySelectorAll('ul');
    expect(
      within(lists[0] as HTMLElement).queryByText('Item 1'),
    ).not.toBeInTheDocument();
    expect(within(lists[1] as HTMLElement).getByText('Item 1')).toBeInTheDocument();
  });
});

// Render and interaction smoke tests for the Data Display cards added
// after Inputs (Karl, Nov 25, 2026), in the same style as above.
describe('Data Display preview cards', () => {
  afterEach(() => cleanup());

  it('Avatar renders a group with a surplus and the three shape variants', () => {
    const { container } = renderEntry('avatar');
    // Group: three letter avatars plus the surplus avatar. Variants
    // row: circular, rounded, and square letter avatars.
    expect(container.querySelectorAll('.MuiAvatar-root')).toHaveLength(7);
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getAllByText('K')).toHaveLength(2);
  });

  it('Badge renders a count, a dot, and a capped count', () => {
    const { container } = renderEntry('badge');
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('99+')).toBeInTheDocument();
    expect(container.querySelector('.MuiBadge-dot')).not.toBeNull();
  });

  it('Chip renders filled, outlined, clickable, and deletable chips', () => {
    renderEntry('chip');
    for (const label of ['Filled', 'Outlined', 'Clickable', 'Deletable', 'Removable']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('deleting a Chip removes only that chip', () => {
    renderEntry('chip');
    const chip = screen.getByText('Deletable').closest('.MuiChip-root') as HTMLElement;
    fireEvent.click(chip.querySelector('.MuiChip-deleteIcon') as Element);
    expect(screen.queryByText('Deletable')).not.toBeInTheDocument();
    expect(screen.getByText('Removable')).toBeInTheDocument();
  });

  it('clicking the Clickable chip marks it with the primary color', () => {
    renderEntry('chip');
    const chip = screen.getByText('Clickable').closest('.MuiChip-root') as HTMLElement;
    expect(chip.className).not.toContain('MuiChip-colorPrimary');
    fireEvent.click(chip);
    expect(chip.className).toContain('MuiChip-colorPrimary');
  });

  it('Divider renders horizontal, text, and vertical separators', () => {
    renderEntry('divider');
    expect(screen.getAllByRole('separator')).toHaveLength(3);
    expect(screen.getByText('Above the divider')).toBeInTheDocument();
    expect(screen.getByText('Center')).toBeInTheDocument();
  });

  it('Icon renders four icons, each holding an SVG', () => {
    const { container } = renderEntry('icon');
    const icons = container.querySelectorAll('.MuiIcon-root');
    expect(icons).toHaveLength(4);
    for (const icon of icons) {
      expect(icon.querySelector('svg')).not.toBeNull();
    }
  });

  it('List renders three items with the first selected', () => {
    renderEntry('list');
    for (const label of ['Inbox', 'Sent', 'Drafts']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText('Inbox').closest('.MuiListItemButton-root')?.className).toContain(
      'Mui-selected',
    );
    expect(
      screen.getByText('Sent').closest('.MuiListItemButton-root')?.className,
    ).not.toContain('Mui-selected');
  });

  it('clicking a List item moves the selection to it', () => {
    renderEntry('list');
    fireEvent.click(screen.getByText('Sent'));
    expect(screen.getByText('Sent').closest('.MuiListItemButton-root')?.className).toContain(
      'Mui-selected',
    );
    expect(
      screen.getByText('Inbox').closest('.MuiListItemButton-root')?.className,
    ).not.toContain('Mui-selected');
  });

  it('Table renders its header and rows', () => {
    renderEntry('table');
    expect(
      screen.getByRole('columnheader', { name: 'Dessert (100g serving)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Calories' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Frozen yoghurt' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '159' })).toBeInTheDocument();
    expect(screen.getByRole('rowheader', { name: 'Cupcake' })).toBeInTheDocument();
  });

  it('Tooltip shows its title when the wrapped control is hovered', async () => {
    renderEntry('tooltip');
    fireEvent.mouseOver(screen.getByRole('button', { name: 'Delete' }));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip).toHaveTextContent('Delete');
  });

  it('Typography renders the variant samples', () => {
    renderEntry('typography');
    expect(screen.getByRole('heading', { name: 'h5 heading' })).toBeInTheDocument();
    expect(screen.getByText('subtitle1 text')).toBeInTheDocument();
    expect(screen.getByText('body1 text')).toBeInTheDocument();
    expect(screen.getByText('body2 text')).toBeInTheDocument();
    expect(screen.getByText('caption text')).toBeInTheDocument();
    expect(screen.getByText('overline text')).toBeInTheDocument();
  });
});
