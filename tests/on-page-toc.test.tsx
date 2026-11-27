import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OnPageToc } from '@apps/ui/components/layout/on-page-toc';
import type { TocItem } from '@apps/ui/lib/toc';

const SAMPLE_ITEMS: TocItem[] = [
  { id: 'sec-intro', label: 'Introduction', level: 2 },
  { id: 'sec-preview', label: 'Interactive Preview', level: 2 },
  { id: 'sec-props', label: 'Props Table', level: 3 },
  { id: 'sec-a11y', label: 'Accessibility', level: 2 },
];

function mountHeadingsWithPositions(tops: Record<string, number>) {
  const nodes: HTMLElement[] = [];
  for (const [id, top] of Object.entries(tops)) {
    const el = document.createElement('section');
    el.id = id;
    el.scrollIntoView = vi.fn();
    el.getBoundingClientRect = () =>
      ({
        top,
        bottom: top + 120,
        left: 0,
        right: 800,
        width: 800,
        height: 120,
        x: 0,
        y: top,
        toJSON: () => ({}),
      }) as DOMRect;
    document.body.appendChild(el);
    nodes.push(el);
  }
  return () => {
    for (const el of nodes) el.remove();
  };
}

describe('OnPageToc', () => {
  it('renders nothing when items array is empty', () => {
    const { container } = render(
      <OnPageToc items={[]} pageTitle="Empty Page" onOpenSearch={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders accessible TOC landmarks, level indentation, and defaults active location to first item', () => {
    render(
      <OnPageToc items={SAMPLE_ITEMS} pageTitle="Button" onOpenSearch={vi.fn()} />,
    );

    const aside = screen.getByTestId('on-page-toc');
    const nav = within(aside).getByRole('navigation', { name: 'Table of contents for Button' });

    const introBtn = within(nav).getByRole('button', { name: 'Introduction' });
    const propsBtn = within(nav).getByRole('button', { name: 'Props Table' });

    expect(introBtn).toHaveAttribute('aria-current', 'location');
    expect(introBtn.className).toContain('pl-3');
    expect(propsBtn).not.toHaveAttribute('aria-current');
    expect(propsBtn.className).toContain('pl-5');
  });

  it('scrolls to clicked heading, updates scroll-spy highlight on scroll, and supports utility actions', async () => {
    const user = userEvent.setup();
    const onOpenSearch = vi.fn();
    const cleanupHeadings = mountHeadingsWithPositions({
      'sec-intro': 40,
      'sec-preview': 320,
      'sec-props': 620,
      'sec-a11y': 920,
    });

    try {
      render(
        <OnPageToc items={SAMPLE_ITEMS} pageTitle="Timeseries" onOpenSearch={onOpenSearch} />,
      );

      const previewEl = document.getElementById('sec-preview')!;
      await user.click(screen.getByRole('button', { name: 'Interactive Preview' }));

      expect(previewEl.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'start',
      });
      expect(screen.getByRole('button', { name: 'Interactive Preview' })).toHaveAttribute(
        'aria-current',
        'location',
      );

      // Simulate scrolling down so sec-props crosses activationOffset (128px)
      const introEl = document.getElementById('sec-intro')!;
      const propsEl = document.getElementById('sec-props')!;
      introEl.getBoundingClientRect = () => ({ top: -480 } as DOMRect);
      previewEl.getBoundingClientRect = () => ({ top: -160 } as DOMRect);
      propsEl.getBoundingClientRect = () => ({ top: 96 } as DOMRect);

      fireEvent.scroll(window);
      expect(screen.getByRole('button', { name: 'Props Table' })).toHaveAttribute(
        'aria-current',
        'location',
      );

      // Back to top resets highlight to first item and invokes window.scrollTo
      await user.click(screen.getByRole('button', { name: 'Back to top' }));
      expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
      expect(screen.getByRole('button', { name: 'Introduction' })).toHaveAttribute(
        'aria-current',
        'location',
      );

      // Quick search fires callback
      await user.click(screen.getByRole('button', { name: /Quick search/i }));
      expect(onOpenSearch).toHaveBeenCalledTimes(1);
    } finally {
      cleanupHeadings();
    }
  });
});
