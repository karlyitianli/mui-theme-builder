import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { customizedProjectFixture } from '../../fixtures/theme-project.fixtures';
import { EditorDispatchContext, EditorStateContext } from '../../state/editor-context-value';
import { createInitialEditorState } from '../../state/editor-reducer';
import type { EditorState } from '../../state/editor-state.types';
import { TokenPanel } from './TokenPanel';

// Tab row fades and click-to-reveal: jsdom has no layout, so the scroll
// metrics and bounding rects the row reads are stubbed per element, and a
// scroll event is fired to make the row recompute its fades, the same
// signal a real scroll sends.
function renderPanel() {
  const state: EditorState = {
    ...createInitialEditorState(),
    project: customizedProjectFixture,
  };
  return render(
    <EditorStateContext value={state}>
      <EditorDispatchContext value={() => undefined}>
        <TokenPanel />
      </EditorDispatchContext>
    </EditorStateContext>,
  );
}

function stubScrollerMetrics(
  scroller: HTMLElement,
  metrics: { clientWidth: number; scrollLeft: number; scrollWidth: number },
) {
  Object.defineProperties(scroller, {
    clientWidth: { configurable: true, value: metrics.clientWidth },
    scrollLeft: { configurable: true, value: metrics.scrollLeft, writable: true },
    scrollWidth: { configurable: true, value: metrics.scrollWidth },
  });
}

function stubRect(el: HTMLElement, left: number, right: number) {
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    bottom: 0,
    height: 0,
    left,
    right,
    top: 0,
    width: right - left,
    x: left,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
}

function stubScrollBy(scroller: HTMLElement) {
  const scrollBy = vi.fn();
  Object.defineProperty(scroller, 'scrollBy', { configurable: true, value: scrollBy });
  return scrollBy;
}

describe('TokenPanel tab row (fades and click reveal)', () => {
  // The shared test setup does not register Testing Library's automatic
  // cleanup, so unmount explicitly to keep each render isolated.
  afterEach(() => cleanup());

  it('shows only the right fade at the start when the row overflows', () => {
    renderPanel();
    const scroller = screen.getByTestId('token-tab-scroller');
    stubScrollerMetrics(scroller, { clientWidth: 320, scrollLeft: 0, scrollWidth: 560 });
    fireEvent.scroll(scroller);
    expect(screen.queryByTestId('token-tab-fade-left')).not.toBeInTheDocument();
    expect(screen.getByTestId('token-tab-fade-right')).toBeInTheDocument();
  });

  it('shows the left fade after scrolling right and drops the right fade at the end', () => {
    renderPanel();
    const scroller = screen.getByTestId('token-tab-scroller');
    stubScrollerMetrics(scroller, { clientWidth: 320, scrollLeft: 120, scrollWidth: 560 });
    fireEvent.scroll(scroller);
    expect(screen.getByTestId('token-tab-fade-left')).toBeInTheDocument();
    expect(screen.getByTestId('token-tab-fade-right')).toBeInTheDocument();

    scroller.scrollLeft = 240;
    fireEvent.scroll(scroller);
    expect(screen.getByTestId('token-tab-fade-left')).toBeInTheDocument();
    expect(screen.queryByTestId('token-tab-fade-right')).not.toBeInTheDocument();
  });

  it('scrolls the row by a positive delta when a partially hidden right-edge tab is clicked', () => {
    renderPanel();
    const scroller = screen.getByTestId('token-tab-scroller');
    const scrollBy = stubScrollBy(scroller);
    stubRect(scroller, 0, 320);
    const shadowsTab = screen.getByText('Shadows');
    stubRect(shadowsTab, 280, 380);
    fireEvent.click(shadowsTab);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', left: 60 });
    // The click still activates the tab.
    expect(screen.getByText('Global elevation')).toBeInTheDocument();
  });

  it('scrolls the row by a negative delta when a partially hidden left-edge tab is clicked', () => {
    renderPanel();
    const scroller = screen.getByTestId('token-tab-scroller');
    const scrollBy = stubScrollBy(scroller);
    stubRect(scroller, 0, 320);
    const typographyTab = screen.getByText('Typography');
    stubRect(typographyTab, -60, 44);
    fireEvent.click(typographyTab);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(scrollBy).toHaveBeenCalledWith({ behavior: 'smooth', left: -60 });
    // The click still activates the tab.
    expect(screen.getByText('Type specimens')).toBeInTheDocument();
  });

  it('does not scroll when a fully visible tab is clicked', () => {
    renderPanel();
    const scroller = screen.getByTestId('token-tab-scroller');
    const scrollBy = stubScrollBy(scroller);
    stubRect(scroller, 0, 320);
    const spacingTab = screen.getByText('Spacing');
    stubRect(spacingTab, 150, 230);
    fireEvent.click(spacingTab);
    expect(scrollBy).not.toHaveBeenCalled();
    // The click still activates the tab.
    expect(screen.getByText('Spacing scale')).toBeInTheDocument();
  });
});
