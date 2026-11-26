import { useReducer, type ReactNode } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState, editorReducer } from '../../state/editor-reducer';
import type { EditorState } from '../../state/editor-state.types';
import { PreviewArea } from './PreviewArea';

// Phase 3: the preview area renders the component registry as pure
// preview cards under collapsible category headers, the search box
// filters by name, and the Templates tab shows stubs.
function renderPreviewArea(state?: EditorState) {
  const initialState = state ?? createInitialEditorState();
  return render(
    <EditorStateContext value={initialState}>
      <EditorDispatchContext value={() => undefined}>
        <PreviewArea />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

function documentStyles(): string {
  return Array.from(document.querySelectorAll('style'))
    .map((element) => element.textContent ?? '')
    .join('\n');
}

describe('PreviewArea (Phase 3)', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());

  it('renders the registry cards under the Inputs category, with no Edit buttons', { timeout: 20000 }, () => {
    renderPreviewArea();
    expect(screen.getByText('Inputs')).toBeInTheDocument();
    // Every Inputs card header, in the registry's alphabetical order.
    for (const name of [
      'Autocomplete',
      'Button Group',
      'Checkbox',
      'Floating Action Button',
      'Radio Group',
      'Rating',
      'Select',
      'Slider',
      'Switch',
      'Text Field',
      'Toggle Button',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // The Button card header plus its three variant buttons.
    expect(screen.getAllByText('Button')).toHaveLength(4);
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
    // The Autocomplete and Text Field cards both carry the placeholder.
    expect(screen.getAllByPlaceholderText('Placeholder')).toHaveLength(2);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    // Cards are pure preview: no Edit buttons anywhere.
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });

  it('filters the cards by name through the search box', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'text' },
    });
    expect(screen.getByText('Text Field')).toBeInTheDocument();
    expect(screen.queryByText('Select')).not.toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: 'Button' })).toHaveLength(0);
  });

  it('shows the empty line when no component matches the search', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'zzzz-not-a-component' },
    });
    expect(screen.getByText('No components match')).toBeInTheDocument();
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
  });

  it('collapses and expands a category section from its header', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Inputs'));
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Inputs'));
    expect(screen.getByText('Text Field')).toBeInTheDocument();
  });

  it('shows the four template stubs on the Templates tab', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Templates'));
    for (const name of ['Sign up', 'Dashboard', 'Marketing', 'Checkout']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    expect(screen.getAllByText('Not built yet')).toHaveLength(4);
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
  });
});

describe('PreviewArea Data Display section', () => {
  afterEach(() => cleanup());

  it('renders the Data Display cards in a section after Inputs', { timeout: 20000 }, () => {
    renderPreviewArea();
    const inputsHeader = screen.getByText('Inputs');
    const dataDisplayHeader = screen.getByText('Data Display');
    expect(
      inputsHeader.compareDocumentPosition(dataDisplayHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const name of [
      'Avatar',
      'Badge',
      'Chip',
      'Divider',
      'List',
      'Table',
      'Tooltip',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('filters across both categories through the search box', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'chip' },
    });
    expect(screen.getByText('Chip')).toBeInTheDocument();
    expect(screen.getByText('Data Display')).toBeInTheDocument();
    // No Inputs entry matches, so the Inputs section drops out.
    expect(screen.queryByText('Inputs')).not.toBeInTheDocument();
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
  });

  it('collapses and expands the Data Display section from its header', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Data Display'));
    expect(screen.queryByText('Chip')).not.toBeInTheDocument();
    expect(screen.getByText('Text Field')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Data Display'));
    expect(screen.getByText('Chip')).toBeInTheDocument();
  });
});

describe('PreviewArea Feedback section', () => {
  afterEach(() => cleanup());

  it('renders the Feedback cards in a section after Data Display', { timeout: 20000 }, () => {
    renderPreviewArea();
    const dataDisplayHeader = screen.getByText('Data Display');
    const feedbackHeader = screen.getByText('Feedback');
    expect(
      dataDisplayHeader.compareDocumentPosition(feedbackHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const name of [
      'Alert',
      'Backdrop',
      'Dialog',
      'Progress',
      'Skeleton',
      'Snackbar',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('filters across all three categories through the search box', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'alert' },
    });
    expect(screen.getByText('Alert')).toBeInTheDocument();
    expect(screen.getByText('Feedback')).toBeInTheDocument();
    // No Inputs or Data Display entry matches, so both sections drop out.
    expect(screen.queryByText('Inputs')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Display')).not.toBeInTheDocument();
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
    expect(screen.queryByText('Chip')).not.toBeInTheDocument();
  });

  it('collapses and expands the Feedback section from its header', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Feedback'));
    expect(screen.queryByText('Alert')).not.toBeInTheDocument();
    expect(screen.getByText('Chip')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Feedback'));
    expect(screen.getByText('Alert')).toBeInTheDocument();
  });
});

describe('PreviewArea Surfaces section', () => {
  afterEach(() => cleanup());

  it('renders the Surfaces cards in a section after Feedback', { timeout: 20000 }, () => {
    renderPreviewArea();
    const feedbackHeader = screen.getByText('Feedback');
    const surfacesHeader = screen.getByText('Surfaces');
    expect(
      feedbackHeader.compareDocumentPosition(surfacesHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const name of ['Accordion', 'App Bar', 'Card']) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it('filters across all four categories through the search box', { timeout: 20000 }, () => {
    renderPreviewArea();
    // The probe used to be 'paper' for the Paper card; Karl removed
    // that card, so 'card' (the Surfaces Card) is the probe now.
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'card' },
    });
    expect(screen.getByText('Card')).toBeInTheDocument();
    expect(screen.getByText('Surfaces')).toBeInTheDocument();
    // No Inputs, Data Display, or Feedback entry matches, so those
    // sections drop out.
    expect(screen.queryByText('Inputs')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Display')).not.toBeInTheDocument();
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
    expect(screen.queryByText('Alert')).not.toBeInTheDocument();
  });

  it('collapses and expands the Surfaces section from its header', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Surfaces'));
    expect(screen.queryByText('Card')).not.toBeInTheDocument();
    expect(screen.getByText('Alert')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Surfaces'));
    expect(screen.getByText('Card')).toBeInTheDocument();
  });
});

describe('PreviewArea Navigation section', () => {
  afterEach(() => cleanup());

  it('renders the Navigation cards in a section after Surfaces', { timeout: 20000 }, () => {
    renderPreviewArea();
    const surfacesHeader = screen.getByText('Surfaces');
    const navigationHeader = screen.getByText('Navigation');
    expect(
      surfacesHeader.compareDocumentPosition(navigationHeader) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const name of [
      'Bottom Navigation',
      'Breadcrumbs',
      'Drawer',
      'Menu',
      'Pagination',
      'Speed Dial',
      'Stepper',
      'Tabs',
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
    // The Link card header plus the demo's four links all carry the
    // text "Link".
    expect(screen.getAllByText('Link')).toHaveLength(5);
  });

  it('filters across all five categories through the search box', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'pagination' },
    });
    expect(screen.getByText('Pagination')).toBeInTheDocument();
    expect(screen.getByText('Navigation')).toBeInTheDocument();
    // No Inputs, Data Display, Feedback, or Surfaces entry matches,
    // so those sections drop out.
    expect(screen.queryByText('Inputs')).not.toBeInTheDocument();
    expect(screen.queryByText('Data Display')).not.toBeInTheDocument();
    expect(screen.queryByText('Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText('Surfaces')).not.toBeInTheDocument();
    expect(screen.queryByText('Text Field')).not.toBeInTheDocument();
    expect(screen.queryByText('Card')).not.toBeInTheDocument();
  });

  it('collapses and expands the Navigation section from its header', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Navigation'));
    expect(screen.queryByText('Pagination')).not.toBeInTheDocument();
    expect(screen.getByText('Card')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Navigation'));
    expect(screen.getByText('Pagination')).toBeInTheDocument();
  });
});

describe('PreviewArea section counts and docs links (tasks 3.1 and 3.2)', () => {
  afterEach(() => cleanup());

  it('shows a badge count of the components in each section header', { timeout: 20000 }, () => {
    renderPreviewArea();
    const counts: Array<[string, string]> = [
      ['Inputs', '12'],
      ['Data Display', '7'],
      ['Feedback', '6'],
      ['Surfaces', '3'],
      ['Navigation', '9'],
    ];
    for (const [category, count] of counts) {
      const header = screen.getByText(category).parentElement;
      expect(header?.textContent).toContain(count);
    }
  });

  it('counts the filtered cards while searching', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'chip' },
    });
    const header = screen.getByText('Data Display').parentElement;
    expect(header?.textContent).toContain('1');
  });

  it('links each card header to the component\u2019s MUI documentation', { timeout: 20000 }, () => {
    renderPreviewArea();
    const buttonDocs = screen.getByRole('link', {
      name: 'MUI documentation for Button',
    });
    expect(buttonDocs).toHaveAttribute(
      'href',
      'https://mui.com/material-ui/react-button/',
    );
    expect(buttonDocs).toHaveAttribute('target', '_blank');
    // The one slug that does not follow the entry id.
    expect(
      screen.getByRole('link', { name: 'MUI documentation for Radio Group' }),
    ).toHaveAttribute('href', 'https://mui.com/material-ui/react-radio-button/');
  });

  it('shows no docs links on the Templates tab', { timeout: 20000 }, () => {
    renderPreviewArea();
    fireEvent.click(screen.getByText('Templates'));
    expect(
      screen.queryByRole('link', { name: /MUI documentation/ }),
    ).not.toBeInTheDocument();
  });
});

describe('PreviewArea theme reflection (Phase 3 integration)', () => {
  afterEach(() => cleanup());

  function ReducerHarness({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(
      editorReducer,
      undefined,
      createInitialEditorState,
    );
    return (
      <EditorStateContext value={state}>
        <EditorDispatchContext value={dispatch}>
          <button
            onClick={() =>
              dispatch({
                type: 'set-semantic-color',
                mode: 'light',
                role: 'primary',
                color: '#6750a4',
              })
            }
            type="button"
          >
            Make primary purple
          </button>
          {children}
        </EditorDispatchContext>
      </EditorStateContext>
    );
  }

  it('changing the primary color through the reducer changes the preview theme the Button card renders under', { timeout: 20000 }, () => {
    render(
      <ReducerHarness>
        <PreviewArea />
      </ReducerHarness>,
    );

    // The Button card renders under the default primary (#171717); the
    // new color is nowhere in the generated preview styles yet.
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
    expect(documentStyles()).not.toContain('#6750a4');

    fireEvent.click(screen.getByRole('button', { name: 'Make primary purple' }));

    // The preview theme is rebuilt from the updated project, and its
    // generated styles now carry the new primary color.
    expect(documentStyles()).toContain('#6750a4');
    expect(screen.getAllByRole('button', { name: 'Button' })).toHaveLength(3);
  });
});
