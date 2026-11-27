import * as React from 'react';
import { ArrowUp, ListBullets, MagnifyingGlass } from '@phosphor-icons/react';
import { cn } from '@nothing-ui/ui';
import { resolveActiveTocId, type TocItem } from '../../lib/toc';

interface OnPageTocProps {
  items: readonly TocItem[];
  pageTitle: string;
  onOpenSearch: () => void;
}

export function OnPageToc({ items, pageTitle, onOpenSearch }: OnPageTocProps) {
  const [activeId, setActiveId] = React.useState<string | null>(items[0]?.id ?? null);

  React.useEffect(() => {
    setActiveId(items[0]?.id ?? null);
  }, [items]);

  React.useEffect(() => {
    if (items.length === 0) return;

    const computeActive = () => {
      const positions = items
        .map((item) => {
          const el = document.getElementById(item.id);
          if (!el) return null;
          return { id: item.id, top: el.getBoundingClientRect().top };
        })
        .filter((entry): entry is { id: string; top: number } => entry !== null);

      if (positions.length === 0) return;

      const docEl = document.documentElement;
      const isNearBottom =
        window.innerHeight + window.scrollY >= docEl.scrollHeight - 48 && window.scrollY > 40;

      const nextId = resolveActiveTocId(positions, {
        activationOffset: 128,
        isNearBottom,
      });
      if (nextId) {
        setActiveId(nextId);
      }
    };

    computeActive();
    window.addEventListener('scroll', computeActive, { passive: true });
    window.addEventListener('resize', computeActive, { passive: true });
    return () => {
      window.removeEventListener('scroll', computeActive);
      window.removeEventListener('resize', computeActive);
    };
  }, [items]);

  const handleJump = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (items[0]) {
      setActiveId(items[0].id);
    }
  };

  if (items.length === 0) return null;

  return (
    <aside
      aria-label="On this page"
      data-testid="on-page-toc"
      className="hidden xl:flex sticky top-14 h-[calc(100vh-3.5rem)] w-[224px] shrink-0 flex-col justify-between border-l border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-6"
    >
      <div className="space-y-4 overflow-y-auto">
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-[var(--nt-display)]">
          <ListBullets className="h-3.5 w-3.5 text-[var(--nt-muted)]" aria-hidden="true" />
          <span>On This Page</span>
        </div>

        <nav aria-label={`Table of contents for ${pageTitle}`}>
          <ul className="relative space-y-1 border-l border-[var(--nt-line)]">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li key={item.id} className="relative">
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-[var(--nt-accent)]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => handleJump(item.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={cn(
                      'block w-full py-1 text-left font-mono text-xs leading-snug transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--nt-display)] rounded-r',
                      item.level === 3 ? 'pl-5' : 'pl-3',
                      isActive
                        ? 'text-[var(--nt-display)] font-medium'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Compact Utility Footer */}
      <div className="space-y-2 border-t border-[var(--nt-line)] pt-4 font-mono text-[11px]">
        <button
          type="button"
          onClick={handleScrollTop}
          className="flex w-full items-center gap-2 text-[var(--nt-muted)] transition-colors hover:text-[var(--nt-display)] cursor-pointer"
        >
          <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to top</span>
        </button>
        <button
          type="button"
          onClick={onOpenSearch}
          className="flex w-full items-center justify-between text-[var(--nt-muted)] transition-colors hover:text-[var(--nt-display)] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <MagnifyingGlass className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Quick search</span>
          </span>
          <kbd className="text-[10px]">⌘K</kbd>
        </button>
      </div>
    </aside>
  );
}
