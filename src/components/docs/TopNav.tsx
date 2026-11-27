import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppSection = 'overview' | 'components' | 'widgets' | 'foundations';

interface TopNavProps {
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
  onOpenSearch: () => void;
}

const NAV_ITEMS: { id: AppSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'components', label: 'Components' },
  { id: 'widgets', label: 'Widgets' },
  { id: 'foundations', label: 'Foundations' },
];

export function TopNav({ activeSection, onNavigate, onOpenSearch }: TopNavProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--nt-line)] bg-[var(--nt-bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('overview')}
          className="font-display text-lg font-bold tracking-[0.08em] text-[var(--nt-display)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D71921]"
        >
          NOTHING UI
        </button>

        {/* Zone 2: 4 clean single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative py-1 text-xs font-mono tracking-wide transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D71921]',
                  active
                    ? 'text-[var(--nt-display)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                {item.label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[17px] h-0.5 bg-[#D71921]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search components"
          className="inline-flex h-9 items-center gap-2.5 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3.5 font-mono text-xs text-[var(--nt-primary)] transition-colors hover:border-[var(--nt-display)] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]"
        >
          <Search className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="rounded border border-[var(--nt-line-2)] bg-[var(--nt-raised)] px-1.5 py-0.5 text-[10px] text-[var(--nt-muted)]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Compact single-row mobile section strip */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center gap-1 overflow-x-auto border-t border-[var(--nt-line)] px-4 py-1.5"
      >
        {NAV_ITEMS.map((item) => {
          const active = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'rounded-md px-3 py-1.5 font-mono text-xs whitespace-nowrap shrink-0 cursor-pointer',
                active
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)]'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
