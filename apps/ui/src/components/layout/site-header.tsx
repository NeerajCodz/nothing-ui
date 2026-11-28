import * as React from 'react';
import { CircleHalf, List, MagnifyingGlass, Moon, Sun } from '@phosphor-icons/react';
import type { ThemeMode } from '@nothing-ui/tokens';
import {
  THEME_STORAGE_KEY,
  applyThemeToRoot,
  cn,
  readStoredTheme,
  useOptionalTheme,
  writeStoredTheme,
} from '@nothing-ui/ui';

export type AppSection =
  | 'overview'
  | 'components'
  | 'charts'
  | 'widgets'
  | 'docs'
  | 'icons'
  | 'studio'
  | 'showcase';

interface NavItem {
  id: AppSection;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components' },
  { id: 'charts', label: 'Charts' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'studio', label: 'Glyph' },
  { id: 'icons', label: 'Icons' },
  { id: 'docs', label: 'Docs' },
  { id: 'showcase', label: 'Showcase' },
];

const THEME_OPTIONS: ReadonlyArray<{
  id: ThemeMode;
  ariaLabel: string;
  icon: typeof Sun;
}> = [
  { id: 'light', ariaLabel: 'Light theme', icon: Sun },
  { id: 'dark', ariaLabel: 'Dark theme', icon: Moon },
  { id: 'high-contrast', ariaLabel: 'High contrast theme', icon: CircleHalf },
];

export function SiteHeader({
  section,
  onNavigate,
  onOpenSearch,
  onOpenSidebar,
}: {
  section: AppSection;
  onNavigate: (section: AppSection) => void;
  onOpenSearch: () => void;
  onOpenSidebar?: () => void;
}) {
  const themeCtx = useOptionalTheme();
  const [fallbackTheme, setFallbackTheme] = React.useState<ThemeMode>(
    () => readStoredTheme(THEME_STORAGE_KEY) ?? 'dark',
  );

  const activeTheme = themeCtx ? themeCtx.theme : fallbackTheme;

  React.useEffect(() => {
    if (themeCtx) return;
    if (typeof document !== 'undefined') {
      applyThemeToRoot(document.documentElement, fallbackTheme);
    }
    writeStoredTheme(fallbackTheme, THEME_STORAGE_KEY);
  }, [themeCtx, fallbackTheme]);

  const handleSelectTheme = (mode: ThemeMode) => {
    if (themeCtx) {
      themeCtx.setTheme(mode);
      return;
    }
    setFallbackTheme(mode);
    if (typeof document !== 'undefined') {
      applyThemeToRoot(document.documentElement, mode);
    }
    writeStoredTheme(mode, THEME_STORAGE_KEY);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nt-line)] bg-[color-mix(in_srgb,var(--nt-bg)_92%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-[1536px] items-center justify-between gap-2 sm:h-14 sm:gap-4 px-3 sm:px-6 lg:px-6">
        {/* Zone 1: Mobile Sidebar Trigger + Brand */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              aria-label="Open documentation sidebar"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] lg:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)]"
            >
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('overview')}
            className="flex shrink-0 items-center gap-2 sm:gap-2.5 whitespace-nowrap text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)] rounded-sm"
            aria-label="Nothing UI Home"
          >
            <span
              aria-hidden="true"
              className="grid h-4 w-4 grid-cols-3 gap-[2px] p-[1px]"
            >
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-accent)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-line-2)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
              <span className="rounded-full bg-[var(--nt-display)]" />
            </span>
            <span className="font-display text-base sm:text-lg tracking-[0.08em] text-[var(--nt-display)] leading-none">
              NOTHING UI
            </span>
          </button>
        </div>

        {/* Zone 2: Single-line primary navigation (desktop) */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative h-14 px-2.5 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)]',
                  active
                    ? 'text-[var(--nt-display)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2.5 bottom-0 h-[2px] bg-[var(--nt-accent)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Theme Switcher (Light / Dark / High Contrast) + Search (⌘K) */}
        <div className="flex shrink-0 items-center gap-2">
          <div
            role="group"
            aria-label="Theme mode switcher"
            data-testid="header-theme-toggle"
            className="inline-flex h-8 shrink-0 items-center gap-0.5 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-0.5"
          >
            {THEME_OPTIONS.map(({ id, ariaLabel, icon: Icon }) => {
              const isSelected = activeTheme === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectTheme(id)}
                  aria-label={ariaLabel}
                  aria-pressed={isSelected}
                  title={ariaLabel}
                  data-testid={`header-theme-${id}`}
                  className={cn(
                    'inline-flex h-full w-7 items-center justify-center rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)]',
                    isSelected
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                      : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" weight={isSelected ? 'fill' : 'regular'} aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onOpenSearch}
            data-testid="open-search-btn"
            className="inline-flex h-8 shrink-0 items-center gap-2 whitespace-nowrap rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2.5 sm:px-3 font-mono text-xs text-[var(--nt-secondary)] transition-colors hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)]"
            aria-label="Search components, icons, and actions"
          >
            <MagnifyingGlass className="h-3.5 w-3.5 shrink-0" weight="regular" aria-hidden="true" />
            <span className="hidden sm:inline">Search</span>
            <kbd className="font-mono text-[10px] text-[var(--nt-muted)]">⌘K</kbd>
          </button>
        </div>
      </div>

      {/* Compact single-row mobile navigation (total sticky height <= 88px on 844px viewport) */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden h-10 items-center gap-1 overflow-x-auto border-t border-[var(--nt-line)] px-3"
      >
        {NAV_ITEMS.map((item) => {
          const active = section === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex h-10 shrink-0 items-center px-2.5 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                active
                  ? 'text-[var(--nt-display)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              {item.label}
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-2 bottom-0 h-[2px] bg-[var(--nt-accent)]"
                />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
