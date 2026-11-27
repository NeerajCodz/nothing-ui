import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SiteHeader, type AppSection } from '@apps/ui/components/layout/site-header';

describe('SiteHeader', () => {
  it('renders brand identity, all 8 primary navigation sections, and Search trigger', () => {
    render(
      <SiteHeader
        section="overview"
        onNavigate={vi.fn()}
        onOpenSearch={vi.fn()}
        onOpenSidebar={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Nothing UI Home' })).toHaveTextContent('NOTHING UI');
    expect(screen.getByTestId('open-search-btn')).toHaveTextContent('⌘K');

    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });

    const expectedLabels = ['Overview', 'Components', 'Charts', 'Widgets', 'Glyph', 'Icons', 'Docs', 'Showcase'];
    for (const label of expectedLabels) {
      expect(within(desktopNav).getByRole('button', { name: label })).toBeInTheDocument();
      expect(within(mobileNav).getByRole('button', { name: label })).toBeInTheDocument();
    }
  });

  it('sets aria-current="page" strictly on the active section in both desktop and mobile navs', () => {
    render(
      <SiteHeader
        section="components"
        onNavigate={vi.fn()}
        onOpenSearch={vi.fn()}
      />,
    );

    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });

    expect(within(desktopNav).getByRole('button', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
    expect(within(desktopNav).getByRole('button', { name: 'Overview' })).not.toHaveAttribute('aria-current');

    expect(within(mobileNav).getByRole('button', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
    expect(within(mobileNav).getByRole('button', { name: 'Docs' })).not.toHaveAttribute('aria-current');
  });

  it('invokes navigation, search, home brand, and mobile sidebar callbacks accurately', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn<(section: AppSection) => void>();
    const onOpenSearch = vi.fn();
    const onOpenSidebar = vi.fn();

    render(
      <SiteHeader
        section="docs"
        onNavigate={onNavigate}
        onOpenSearch={onOpenSearch}
        onOpenSidebar={onOpenSidebar}
      />,
    );

    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
    await user.click(within(desktopNav).getByRole('button', { name: 'Charts' }));
    expect(onNavigate).toHaveBeenCalledWith('charts');

    await user.click(within(desktopNav).getByRole('button', { name: 'Widgets' }));
    expect(onNavigate).toHaveBeenCalledWith('widgets');

    await user.click(within(desktopNav).getByRole('button', { name: 'Glyph' }));
    expect(onNavigate).toHaveBeenCalledWith('studio');

    await user.click(screen.getByRole('button', { name: 'Nothing UI Home' }));
    expect(onNavigate).toHaveBeenCalledWith('overview');

    await user.click(screen.getByTestId('open-search-btn'));
    expect(onOpenSearch).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Open documentation sidebar' }));
    expect(onOpenSidebar).toHaveBeenCalledTimes(1);
  });

  it('omits the mobile sidebar trigger when onOpenSidebar is not provided', () => {
    render(
      <SiteHeader
        section="overview"
        onNavigate={vi.fn()}
        onOpenSearch={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Open documentation sidebar' })).not.toBeInTheDocument();
  });

  it('switches between Light, Dark, and High Contrast themes, persists to localStorage, and updates root class', async () => {
    const user = userEvent.setup();

    render(
      <SiteHeader
        section="overview"
        onNavigate={vi.fn()}
        onOpenSearch={vi.fn()}
      />,
    );

    const toggle = screen.getByTestId('header-theme-toggle');
    const lightBtn = within(toggle).getByRole('button', { name: 'Light theme' });
    const darkBtn = within(toggle).getByRole('button', { name: 'Dark theme' });
    const hcBtn = within(toggle).getByRole('button', { name: 'High contrast theme' });

    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    await user.click(lightBtn);
    expect(lightBtn).toHaveAttribute('aria-pressed', 'true');
    expect(darkBtn).toHaveAttribute('aria-pressed', 'false');
    expect(window.localStorage.getItem('nthgui-theme')).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(hcBtn);
    expect(hcBtn).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('nthgui-theme')).toBe('high-contrast');
    expect(document.documentElement.getAttribute('data-theme')).toBe('high-contrast');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);

    await user.click(darkBtn);
    expect(darkBtn).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('nthgui-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);
  });
});
