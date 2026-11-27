import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { defaultProjectFixture } from '../../fixtures/theme-project.fixtures';
import { PreviewProvider } from '../../preview/PreviewProvider';
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

  it('toggling the Off switch turns it on', () => {
    renderEntry('switch');
    const offSwitch = screen.getByRole('switch', { name: 'Off' });
    expect(offSwitch).not.toBeChecked();
    fireEvent.click(offSwitch);
    expect(offSwitch).toBeChecked();
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

  it('Chip delete icons are the Phosphor X at the MUI glyph size', () => {
    const { container } = renderEntry('chip');
    const deleteIcons = container.querySelectorAll('.MuiChip-deleteIcon');
    expect(deleteIcons).toHaveLength(2);
    for (const icon of deleteIcons) {
      // Phosphor glyphs draw on a 256 viewBox (MUI's sit on 24) and
      // Karl's swap pins them at 22px, the size MUI's delete icon
      // rendered at.
      expect(icon.getAttribute('viewBox')).toBe('0 0 256 256');
      expect(icon.getAttribute('width')).toBe('22');
      expect(icon.classList.contains('MuiSvgIcon-root')).toBe(false);
    }
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

  it('Alert icons are Phosphor glyphs, severity and close alike', () => {
    const { container } = renderEntry('alert');
    // No MUI SvgIcon anywhere in the demo: the severity icons come
    // from the iconMapping and the close glyph from the closeIcon
    // slot Karl asked to swap.
    expect(container.querySelectorAll('.MuiSvgIcon-root')).toHaveLength(0);
    for (const alert of screen.getAllByRole('alert')) {
      const icon = alert.querySelector('.MuiAlert-icon svg');
      expect(icon).not.toBeNull();
      // Phosphor glyphs draw on a 256 viewBox (MUI's sit on 24), at
      // 22px, the size MUI's severity icons rendered at.
      expect(icon?.getAttribute('viewBox')).toBe('0 0 256 256');
      expect(icon?.getAttribute('width')).toBe('22');
    }
    const success = screen
      .getByText('This is a success Alert.')
      .closest('.MuiAlert-root') as HTMLElement;
    const closeIcon = within(success)
      .getByRole('button', { name: 'Close' })
      .querySelector('svg');
    expect(closeIcon?.getAttribute('viewBox')).toBe('0 0 256 256');
    expect(closeIcon?.getAttribute('width')).toBe('20');
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

});

// Render and interaction smoke tests for the Navigation cards added
// after Surfaces (Karl, Nov 25, 2026), in the same style as above.
// The two overlays (Drawer, Menu) open inside their card's stage;
// the tests open and close each one there.
describe('Navigation preview cards', () => {
  afterEach(() => cleanup());

  it('Bottom Navigation renders four actions with Recents selected', () => {
    renderEntry('bottom-navigation');
    for (const label of ['Recents', 'Favorites', 'Nearby', 'Folder']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(
      screen.getByText('Recents').closest('.MuiBottomNavigationAction-root')?.className,
    ).toContain('Mui-selected');
    expect(
      screen.getByText('Favorites').closest('.MuiBottomNavigationAction-root')?.className,
    ).not.toContain('Mui-selected');
  });

  it('clicking a Bottom Navigation action moves the selection to it', () => {
    renderEntry('bottom-navigation');
    fireEvent.click(screen.getByText('Favorites'));
    expect(
      screen.getByText('Favorites').closest('.MuiBottomNavigationAction-root')?.className,
    ).toContain('Mui-selected');
    expect(
      screen.getByText('Recents').closest('.MuiBottomNavigationAction-root')?.className,
    ).not.toContain('Mui-selected');
  });

  it('Breadcrumbs renders two links and the current page as text', () => {
    renderEntry('breadcrumbs');
    expect(screen.getByRole('link', { name: /Home/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Catalog' })).toBeInTheDocument();
    expect(screen.getByText('Accessories')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Accessories' })).not.toBeInTheDocument();
  });

  it('Drawer opens contained in the card and closes from its backdrop', async () => {
    const { container } = renderEntry('drawer');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Inbox')).toBeInTheDocument();
    expect(within(dialog).getByText('Sent')).toBeInTheDocument();
    expect(within(dialog).getByText('Drafts')).toBeInTheDocument();
    fireEvent.click(container.querySelector('.MuiBackdrop-root') as Element);
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('choosing a Drawer item closes the drawer', async () => {
    renderEntry('drawer');
    fireEvent.click(screen.getByRole('button', { name: 'Open drawer' }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByText('Sent'));
    await waitFor(
      () => expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      { timeout: 3000 },
    );
  });

  it('Link renders the hover, always, none, and inherit variants', () => {
    const { container } = renderEntry('link');
    const links = container.querySelectorAll('.MuiLink-root');
    expect(links).toHaveLength(4);
    expect(container.querySelector('.MuiLink-underlineHover')).not.toBeNull();
    expect(container.querySelector('.MuiLink-underlineAlways')).not.toBeNull();
    expect(container.querySelector('.MuiLink-underlineNone')).not.toBeNull();
    // The inherit-color link takes the surrounding text color, which
    // the Typography classes on the same element record.
    const inherit = Array.from(links).find((link) =>
      link.className.includes('MuiTypography-inherit'),
    );
    expect(inherit).toBeDefined();
  });

  it('Menu opens from its button and closes when an item is chosen', async () => {
    renderEntry('menu');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const menu = await screen.findByRole('menu');
    for (const label of ['Profile', 'My account', 'Logout']) {
      expect(within(menu).getByText(label)).toBeInTheDocument();
    }
    fireEvent.click(within(menu).getByText('Profile'));
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument(), {
      timeout: 3000,
    });
  });

  it('Pagination renders two synced rows and moves both when a page is chosen', () => {
    renderEntry('pagination');
    const pageThrees = screen.getAllByRole('button', { name: 'Go to page 3' });
    expect(pageThrees).toHaveLength(2);
    for (const button of pageThrees) {
      expect(button).not.toHaveAttribute('aria-current');
    }
    fireEvent.click(pageThrees[0]);
    // A selected page's accessible name drops the "Go to" prefix.
    for (const button of screen.getAllByRole('button', { name: 'page 3' })) {
      expect(button).toHaveAttribute('aria-current', 'page');
    }
    // Page 1 is no longer current in either row.
    for (const button of screen.getAllByRole('button', { name: 'Go to page 1' })) {
      expect(button).not.toHaveAttribute('aria-current');
    }
  });

  it('Speed Dial opens its actions when the main button is clicked', () => {
    renderEntry('speed-dial');
    const fab = screen.getByRole('button', { name: 'Speed dial' });
    expect(fab).toHaveAttribute('aria-expanded', 'false');
    // The actions render as menuitems; while the dial is closed
    // they are scaled and faded out.
    expect(screen.getByRole('menuitem', { name: 'Copy' })).not.toBeVisible();
    fireEvent.click(fab);
    expect(fab).toHaveAttribute('aria-expanded', 'true');
    for (const name of ['Copy', 'Save', 'Print']) {
      expect(screen.getByRole('menuitem', { name })).toBeVisible();
    }
    fireEvent.click(fab);
    expect(fab).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('menuitem', { name: 'Copy' })).not.toBeVisible();
  });

  it('Stepper starts on the first step with Back disabled', () => {
    renderEntry('stepper');
    expect(screen.getByText('Campaign settings')).toBeInTheDocument();
    expect(
      screen.getByText('Choose the audience, budget, and schedule for the campaign.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  it('Stepper walks forward and back through its steps', () => {
    renderEntry('stepper');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByText('Group the ads that share the same targeting and bids.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back' })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(
      screen.getByText('Choose the audience, budget, and schedule for the campaign.'),
    ).toBeInTheDocument();
  });

  it('Stepper finishes on the last step and resets', () => {
    renderEntry('stepper');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Finish' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
    expect(screen.getByText('All steps completed.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(
      screen.getByText('Choose the audience, budget, and schedule for the campaign.'),
    ).toBeInTheDocument();
  });

  it('Tabs renders three tabs with the first panel showing', () => {
    renderEntry('tabs');
    expect(screen.getByRole('tab', { name: 'Item One' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Item Two' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByText('Item One panel.')).toBeInTheDocument();
    expect(screen.queryByText('Item Two panel.')).not.toBeInTheDocument();
  });

  it('clicking a Tab switches the panel to it', () => {
    renderEntry('tabs');
    fireEvent.click(screen.getByRole('tab', { name: 'Item Three' }));
    expect(screen.getByRole('tab', { name: 'Item Three' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('Item Three panel.')).toBeInTheDocument();
    expect(screen.queryByText('Item One panel.')).not.toBeInTheDocument();
  });
});

// Render and interaction smoke tests for the Layout cards added
// after Navigation (Karl, Nov 26, 2026), in the same style as above.
// None of the four is an overlay, so every demo renders in place.
describe('Layout preview cards', () => {
  afterEach(() => cleanup());

  it('Box renders the filled and bordered sx boxes', () => {
    const { container } = renderEntry('box');
    expect(
      screen.getByText('Background, padding, and radius from sx'),
    ).toBeInTheDocument();
    expect(screen.getByText('Border and radius from sx')).toBeInTheDocument();
    // Both boxes are plain MUI Boxes (divs with the Box class hook).
    expect(container.querySelectorAll('.MuiBox-root')).toHaveLength(2);
  });

  it('Container starts at maxWidth xs inside its frame', () => {
    const { container } = renderEntry('container');
    const inner = container.querySelector('.MuiContainer-root');
    expect(inner?.className).toContain('MuiContainer-maxWidthXs');
    expect(screen.getByText('maxWidth xs')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'XS' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switching the Container toggle changes the maxWidth in force', () => {
    const { container } = renderEntry('container');
    fireEvent.click(screen.getByRole('button', { name: 'SM' }));
    expect(container.querySelector('.MuiContainer-root')?.className).toContain(
      'MuiContainer-maxWidthSm',
    );
    expect(screen.getByText('maxWidth sm')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'None' }));
    // maxWidth={false} drops the maxWidth class entirely in MUI v9;
    // there is no MuiContainer-maxWidthFalse class.
    expect(container.querySelector('.MuiContainer-root')?.className).not.toContain(
      'MuiContainer-maxWidth',
    );
    expect(screen.getByText('No max width')).toBeInTheDocument();
  });

  it('Grid renders five sized cells in one container', () => {
    const { container } = renderEntry('grid');
    // Container plus five items, all carrying the Grid class hook.
    expect(container.querySelectorAll('.MuiGrid-root')).toHaveLength(6);
    expect(screen.getAllByText('6')).toHaveLength(2);
    expect(screen.getAllByText('4')).toHaveLength(3);
  });

  it('Stack renders its three items with a divider between each pair', () => {
    const { container } = renderEntry('stack');
    for (const label of ['One', 'Two', 'Three']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(container.querySelectorAll('.MuiDivider-root')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Column' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switching the Stack direction moves the selection to Row', () => {
    renderEntry('stack');
    fireEvent.click(screen.getByRole('button', { name: 'Row' }));
    expect(screen.getByRole('button', { name: 'Row' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: 'Column' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

// Checks that need the real preview theme rather than MUI's default
// theme (which the card tests above render under): the overlay
// trigger buttons' dark-mode treatment and the Autocomplete dropdown
// paper's border and shadow, both of which live in the app's theme
// and demo styling (Karl, Nov 25, 2026). The CSS extraction follows
// preview-card.test.tsx.
function documentStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .join('\n');
}

function rulesFor(element: Element): string {
  const css = documentStyles();
  return (element.className?.split(' ') ?? [])
    .filter((cls) => cls.startsWith('css-'))
    .map((cls) => {
      const match = css.match(new RegExp(`\\.${cls}\\{[^}]*\\}`));
      return match?.[0] ?? '';
    })
    .join('\n');
}

describe('Preview theme treatments', () => {
  afterEach(() => cleanup());

  function renderThemed(id: string, mode: 'light' | 'dark') {
    const entry = PREVIEW_COMPONENTS.find((candidate) => candidate.id === id);
    if (!entry) throw new Error(`registry is missing the ${id} entry`);
    return render(
      <PreviewProvider mode={mode} project={defaultProjectFixture}>
        <>{entry.render()}</>
      </PreviewProvider>,
    );
  }

  // The dark treatment is an applyStyles('dark', ...) rule: in the
  // generated CSS it appears as a rule scoped to the [data-dark]
  // color-scheme selector for the button's sx class. jsdom does not
  // run the attribute cascade, so the assertion targets that rule
  // rather than a computed style.
  function darkRulesFor(element: Element): string {
    const classes = (element.className?.split(' ') ?? []).filter((cls) =>
      cls.startsWith('css-'),
    );
    const rules: string[] = [];
    for (const match of documentStyles().matchAll(/([^{}]+)\{([^}]*)\}/g)) {
      const [, selector = '', body = ''] = match;
      if (
        selector.includes('[data-dark]') &&
        classes.some((cls) => selector.includes(`.${cls}`))
      ) {
        rules.push(body);
      }
    }
    return rules.join('\n');
  }

  it('overlay trigger buttons carry a white dark-scheme style', () => {
    const triggers = [
      ['backdrop', 'Show backdrop'],
      ['dialog', 'Open dialog'],
      ['snackbar', 'Open snackbar'],
    ] as const;
    for (const [id, name] of triggers) {
      const { unmount } = renderThemed(id, 'dark');
      const button = screen.getByRole('button', { name });
      expect(darkRulesFor(button)).toContain('background-color:#fff');
      unmount();
    }
  });

  it('overlay trigger buttons get no white style under the plain light theme', () => {
    // The cards above render under MUI's default (light, non-vars)
    // theme, where applyStyles('dark', ...) resolves to nothing:
    // light rendering keeps the outlined default exactly.
    renderEntry('backdrop');
    const button = screen.getByRole('button', { name: 'Show backdrop' });
    expect(rulesFor(button)).not.toContain('background-color:#fff');
    expect(darkRulesFor(button)).toBe('');
  });

  it('Autocomplete dropdown paper carries the Select menu paper border and shadow', () => {
    renderThemed('autocomplete', 'light');
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    const autocompletePaper = screen.getByRole('listbox').closest('.MuiPaper-root');
    expect(autocompletePaper).not.toBeNull();
    const autocompleteRules = rulesFor(autocompletePaper as Element);
    cleanup();

    renderThemed('select', 'light');
    fireEvent.mouseDown(screen.getByRole('combobox'));
    const menuPaper = screen.getByRole('listbox').closest('.MuiPaper-root');
    expect(menuPaper).not.toBeNull();
    const menuRules = rulesFor(menuPaper as Element);

    // The treatment the two dropdown papers share. The border comes
    // from the baseline's paper overrides; the shadow is the
    // foundations menu elevation, which MuiPaper renders through its
    // --Paper-shadow variable since Nov 26, 2026 (before that, both
    // papers carried one hand-set shadow string from the baseline).
    // The elevation value itself is pinned in foundation-mapping
    // tests.
    for (const declaration of [
      'border:1px solid var(--mui-palette-divider)',
      'box-shadow:var(--Paper-shadow)',
    ]) {
      expect(menuRules).toContain(declaration);
      expect(autocompleteRules).toContain(declaration);
    }
  });
});
