import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
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

// Render and interaction smoke tests for the Feedback cards added
// after Data Display (Karl, Nov 25, 2026), in the same style as
// above. The three overlays (Backdrop, Dialog, Snackbar) open inside
// their card's stage; the tests open and close each one there.
describe('Feedback preview cards', () => {
  afterEach(() => cleanup());

  it('Alert renders the four severity variants', () => {
    renderEntry('alert');
    expect(screen.getAllByRole('alert')).toHaveLength(4);
    for (const text of [
      'This is an error Alert.',
      'This is a warning Alert.',
      'This is an info Alert.',
      'This is a success Alert.',
    ]) {
      expect(screen.getByText(text)).toBeInTheDocument();
    }
  });

  it('closing the success Alert removes only it', () => {
    renderEntry('alert');
    const success = screen
      .getByText('This is a success Alert.')
      .closest('.MuiAlert-root') as HTMLElement;
    fireEvent.click(within(success).getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('This is a success Alert.')).not.toBeInTheDocument();
    expect(screen.getByText('This is an error Alert.')).toBeInTheDocument();
    expect(screen.getAllByRole('alert')).toHaveLength(3);
  });

  it('Backdrop opens over the card stage and closes when clicked', async () => {
    const { container } = renderEntry('backdrop');
    const backdrop = container.querySelector('.MuiBackdrop-root') as HTMLElement;
    // The closed backdrop stays mounted, held invisible by its fade.
    expect(backdrop).not.toBeNull();
    expect(backdrop.style.visibility).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: 'Show backdrop' }));
    await waitFor(() => expect(backdrop.style.opacity).toBe('1'), { timeout: 3000 });
    expect(backdrop.style.visibility).not.toBe('hidden');
    // The spinner rides inside the backdrop.
    expect(backdrop.querySelector('.MuiCircularProgress-root')).not.toBeNull();
    fireEvent.click(backdrop);
    await waitFor(() => expect(backdrop.style.visibility).toBe('hidden'), {
      timeout: 3000,
    });
  });

  it('Dialog opens contained in the card and closes from its actions', async () => {
    renderEntry('dialog');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open dialog' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Dialog title')).toBeInTheDocument();
    expect(
      within(dialog).getByText('This dialog is contained in its preview card.'),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('Progress renders circular and linear indicators, determinate and indeterminate', () => {
    renderEntry('progress');
    expect(screen.getAllByRole('progressbar')).toHaveLength(5);
    const determinate = screen.getByRole('progressbar', {
      name: 'Circular progress, determinate',
    });
    const value = Number(determinate.getAttribute('aria-valuenow'));
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(100);
    const indeterminate = screen.getByRole('progressbar', {
      name: 'Linear progress, indeterminate',
    });
    expect(indeterminate).not.toHaveAttribute('aria-valuenow');
  });

  it('Skeleton renders the text, circular, rectangular, and rounded variants', () => {
    const { container } = renderEntry('skeleton');
    expect(container.querySelectorAll('.MuiSkeleton-root')).toHaveLength(5);
    expect(container.querySelectorAll('.MuiSkeleton-text')).toHaveLength(2);
    expect(container.querySelector('.MuiSkeleton-circular')).not.toBeNull();
    expect(container.querySelector('.MuiSkeleton-rectangular')).not.toBeNull();
    expect(container.querySelector('.MuiSkeleton-rounded')).not.toBeNull();
  });

  it('Snackbar opens from its button and closes from its close action', async () => {
    renderEntry('snackbar');
    expect(screen.queryByText('Note archived')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open snackbar' }));
    expect(await screen.findByText('Note archived')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(
      () => expect(screen.queryByText('Note archived')).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });
});

// Render and interaction smoke tests for the Surfaces cards added
// after Feedback (Karl, Nov 25, 2026), in the same style as above.
describe('Surfaces preview cards', () => {
  afterEach(() => cleanup());

  it('Accordion renders three sections with the first expanded', () => {
    renderEntry('accordion');
    expect(screen.getByRole('button', { name: 'Accordion 1' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Accordion 2' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Accordion 3' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByText('First panel body text.')).toBeVisible();
    expect(screen.getByText('Second panel body text.')).not.toBeVisible();
  });

  it('clicking another Accordion section expands it and collapses the first', () => {
    renderEntry('accordion');
    fireEvent.click(screen.getByRole('button', { name: 'Accordion 2' }));
    expect(screen.getByRole('button', { name: 'Accordion 2' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Accordion 1' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('clicking the expanded Accordion section collapses it', () => {
    renderEntry('accordion');
    fireEvent.click(screen.getByRole('button', { name: 'Accordion 1' }));
    expect(screen.getByRole('button', { name: 'Accordion 1' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('App Bar renders a contained bar with a menu button, a title, and a login button', () => {
    renderEntry('app-bar');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    expect(screen.getByText('News')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('Card renders a composed card with header, content, and actions', () => {
    renderEntry('card');
    expect(screen.getByText('Project update')).toBeInTheDocument();
    expect(screen.getByText('Design team')).toBeInTheDocument();
    expect(
      screen.getByText(/A composed card with a header, media, content, and actions/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'More actions' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Share' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn more' })).toBeInTheDocument();
  });

  it('toggling the Card favorite action marks it pressed', () => {
    renderEntry('card');
    const favorite = screen.getByRole('button', { name: 'Add to favorites' });
    expect(favorite).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(favorite);
    expect(favorite).toHaveAttribute('aria-pressed', 'true');
  });

  it('Paper renders the elevation variants and an outlined paper', () => {
    const { container } = renderEntry('paper');
    expect(container.querySelectorAll('.MuiPaper-root')).toHaveLength(5);
    expect(container.querySelector('.MuiPaper-outlined')).not.toBeNull();
    for (const label of ['0', '1', '3', '6', 'Outlined']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
