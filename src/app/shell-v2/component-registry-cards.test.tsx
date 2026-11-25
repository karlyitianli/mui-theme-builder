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
