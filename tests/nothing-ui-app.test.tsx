import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider } from '@nothing-ui/ui';
import { NothingUiApp } from '@apps/ui/App';

function renderApp() {
  return render(
    <ThemeProvider defaultTheme="dark">
      <NothingUiApp />
    </ThemeProvider>,
  );
}

describe('NothingUiApp shell & layout integration', () => {
  it('mounts the 3-column documentation shell on the Overview view with matching TOC and footer', () => {
    renderApp();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByTestId('docs-sidebar')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();

    const toc = screen.getByTestId('on-page-toc');
    const tocNav = within(toc).getByRole('navigation', { name: 'Table of contents for Overview' });
    expect(tocNav).toBeInTheDocument();
    expect(within(tocNav).getByRole('button', { name: 'Introduction' })).toBeInTheDocument();
    expect(within(tocNav).getByRole('button', { name: 'Glyph Matrix Core' })).toBeInTheDocument();
    expect(within(tocNav).getByRole('button', { name: 'Live Library Proof' })).toBeInTheDocument();
    expect(within(tocNav).getByRole('button', { name: 'Shipped Catalog' })).toBeInTheDocument();
    expect(tocNav.querySelectorAll('[aria-current="location"]').length).toBe(1);

    const footer = screen.getByRole('contentinfo');
    expect(within(footer).getByText(/Single Published Package: nthgui/i)).toBeInTheDocument();
  });

  it('switches views via SiteHeader navigation and synchronizes OnPageToc + scroll reset', async () => {
    const user = userEvent.setup();
    renderApp();

    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });

    // Navigate to Components
    await user.click(within(desktopNav).getByRole('button', { name: 'Components' }));
    expect(within(desktopNav).getByRole('button', { name: 'Components' })).toHaveAttribute('aria-current', 'page');
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('button', { name: 'Props Playground' }),
    ).toBeInTheDocument();
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });

    // Navigate to Charts Hub (Recharts Bar Chart Placeholder + Registry)
    await user.click(within(desktopNav).getByRole('button', { name: 'Charts' }));
    expect(within(desktopNav).getByRole('button', { name: 'Charts' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByTestId('charts-hub')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-bar-placeholder')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Charts',
      }),
    ).toBeInTheDocument();

    // Navigate to Widgets
    await user.click(within(desktopNav).getByRole('button', { name: 'Widgets' }));
    expect(screen.getByTestId('widgets-hub')).toBeInTheDocument();
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Widgets',
      }),
    ).toBeInTheDocument();

    // Clicking Audio Recorder inside Widgets Hub opens it with Widgets / Audio & Video breadcrumb and keeps Widgets active in header
    await user.click(screen.getByTestId('widget-card-audio-recorder'));
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Widgets');
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Audio & Video');
    expect(within(desktopNav).getByRole('button', { name: 'Widgets' })).toHaveAttribute('aria-current', 'page');

    // Navigate to Icons
    await user.click(within(desktopNav).getByRole('button', { name: 'Icons' }));
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', { name: 'Table of contents for Dot Icons' }),
    ).toBeInTheDocument();

    // Navigate to Glyph System
    await user.click(within(desktopNav).getByRole('button', { name: 'Glyph' }));
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Glyph System',
      }),
    ).toBeInTheDocument();

    // Navigate to Showcase
    await user.click(within(desktopNav).getByRole('button', { name: 'Showcase' }));
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Nothing UI Showcase',
      }),
    ).toBeInTheDocument();
  });

  it('navigates directly to an interactive chart component from DocsSidebar under Components -> Charts', async () => {
    const user = userEvent.setup();
    renderApp();

    const sidebar = screen.getByTestId('docs-sidebar');
    const filterInput = within(sidebar).getByLabelText('Filter sidebar components');
    await user.type(filterInput, 'timeseries');

    await user.click(within(sidebar).getByRole('button', { name: /Timeseries/i }));

    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(desktopNav).getByRole('button', { name: 'Charts' })).toHaveAttribute('aria-current', 'page');

    const toc = screen.getByTestId('on-page-toc');
    expect(
      within(toc).getByRole('navigation', { name: 'Table of contents for Timeseries' }),
    ).toBeInTheDocument();
    expect(within(toc).getByRole('button', { name: 'Props Playground' })).toBeInTheDocument();
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Components');
    expect(screen.getByTestId('explorer-breadcrumb')).toHaveTextContent('Charts');
    expect(within(screen.getByRole('main')).getByRole('heading', { level: 1, name: /Timeseries/i })).toBeInTheDocument();
  });

  it('toggles SearchDialog via Cmd/Ctrl+K keyboard shortcut and routes to Docs CLI Setup', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.queryByTestId('search-dialog')).not.toBeInTheDocument();

    // Open with Cmd+K
    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    const dialog = screen.getByTestId('search-dialog');
    expect(dialog).toBeInTheDocument();

    // Navigate to CLI Setup via SearchDialog
    await user.click(within(dialog).getByText(/CLI Init & Single-Package Setup/i));
    expect(screen.queryByTestId('search-dialog')).not.toBeInTheDocument();

    const toc = screen.getByTestId('on-page-toc');
    expect(
      within(toc).getByRole('navigation', { name: 'Table of contents for Docs (cli)' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cli-quick-copy-card')).toBeInTheDocument();
  });

  it('opens mobile sidebar drawer from SiteHeader and navigates + closes on selection', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(screen.getByRole('button', { name: 'Open documentation sidebar' }));
    const mobileDrawer = screen.getByRole('dialog', { name: 'Mobile documentation sidebar' });
    expect(mobileDrawer).toBeInTheDocument();

    await user.click(within(mobileDrawer).getByRole('button', { name: /136-Component Map/i }));
    expect(screen.queryByRole('dialog', { name: 'Mobile documentation sidebar' })).not.toBeInTheDocument();
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Docs (roadmap)',
      }),
    ).toBeInTheDocument();
  });

  it('routes footer quick links to the exact DocsHub tabs and copies CLI command with confirmation', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
      writable: true,
    });

    renderApp();
    const footer = screen.getByRole('contentinfo');

    // Jump to React Native tab from footer
    await user.click(within(footer).getByRole('button', { name: 'React Native (111)' }));
    expect(
      within(screen.getByTestId('on-page-toc')).getByRole('navigation', {
        name: 'Table of contents for Docs (native)',
      }),
    ).toBeInTheDocument();

    // Jump to CLI & Setup tab from footer and test Copy CLI Command
    await user.click(within(footer).getByRole('button', { name: 'CLI & Setup' }));
    const quickCopyCard = screen.getByTestId('cli-quick-copy-card');
    const select = within(quickCopyCard).getByLabelText('Select component for CLI command');
    await user.selectOptions(select, 'timeseries');

    const copyBtn = within(quickCopyCard).getByRole('button', { name: /Copy CLI Command/i });
    await user.click(copyBtn);

    expect(writeText).toHaveBeenCalledWith('npx nthgui add timeseries');
    expect(within(quickCopyCard).getByRole('button', { name: /Copied!/i })).toBeInTheDocument();
  });

  it('persists SiteHeader theme toggle selection in localStorage, and restores on remount', async () => {
    const user = userEvent.setup();
    const firstRender = renderApp();

    const headerToggle = screen.getByTestId('header-theme-toggle');
    await user.click(within(headerToggle).getByRole('button', { name: 'Light theme' }));

    expect(window.localStorage.getItem('nthgui-theme')).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    // Only the header owns the theme switcher
    expect(
      within(screen.getByTestId('docs-sidebar')).queryByRole('group', { name: 'Sidebar theme switch' }),
    ).not.toBeInTheDocument();

    // Switch to High Contrast and simulate full page reload via unmount + remount
    await user.click(within(headerToggle).getByRole('button', { name: 'High contrast theme' }));
    expect(window.localStorage.getItem('nthgui-theme')).toBe('high-contrast');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

    firstRender.unmount();
    renderApp();

    const reloadedToggle = screen.getByTestId('header-theme-toggle');
    expect(within(reloadedToggle).getByRole('button', { name: 'High contrast theme' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });

  it('opens deep links and canonicalizes the entry URL', () => {
    window.history.replaceState(null, '', '/widgets/calendar');
    const first = renderApp();
    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(within(desktopNav).getByRole('button', { name: 'Widgets' })).toHaveAttribute('aria-current', 'page');
    expect(window.location.pathname).toBe('/widgets/calendar');
    first.unmount();

    // A slug opened under the wrong prefix is rewritten to its canonical URL
    window.history.replaceState(null, '', '/components/calendar');
    const second = renderApp();
    expect(window.location.pathname).toBe('/widgets/calendar');
    second.unmount();

    window.history.replaceState(null, '', '/docs/changelog');
    renderApp();
    expect(window.location.pathname).toBe('/docs/changelog');
  });

  it('pushes a URL per navigation and restores views on back/forward', async () => {
    const user = userEvent.setup();
    renderApp();
    const desktopNav = screen.getByRole('navigation', { name: 'Primary navigation' });

    await user.click(within(desktopNav).getByRole('button', { name: 'Widgets' }));
    expect(window.location.pathname).toBe('/widgets');

    await user.click(within(desktopNav).getByRole('button', { name: 'Glyph' }));
    expect(window.location.pathname).toBe('/glyph');

    await user.click(within(desktopNav).getByRole('button', { name: 'Icons' }));
    expect(window.location.pathname).toBe('/icons');

    await user.click(within(desktopNav).getByRole('button', { name: 'Showcase' }));
    expect(window.location.pathname).toBe('/showcase');

    await user.click(within(desktopNav).getByRole('button', { name: 'Docs' }));
    expect(window.location.pathname).toBe('/docs');

    await user.click(within(desktopNav).getByRole('button', { name: 'Components' }));
    expect(window.location.pathname).toBe('/components/button');

    // Simulate the browser back button landing on /widgets
    act(() => {
      window.history.replaceState(null, '', '/widgets');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });
    expect(within(desktopNav).getByRole('button', { name: 'Widgets' })).toHaveAttribute('aria-current', 'page');
    expect(window.location.pathname).toBe('/widgets');
  });
});
