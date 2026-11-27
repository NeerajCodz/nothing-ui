import * as React from 'react';
import { ChevronLeft, ChevronRight, Moon, Search, SlidersHorizontal, Sun, X } from 'lucide-react';
import {
  COMPONENT_CATEGORIES,
  REGISTRY_COMPONENTS,
  filterRegistryComponents,
  getComponentById,
} from '@/lib/registry';
import { cn } from '@/lib/utils';
import { ComponentPreviewCard } from './ComponentPreviewCard';

interface DocsExplorerProps {
  activeComponentId: string;
  onSelectComponent: (id: string) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function DocsExplorer({
  activeComponentId,
  onSelectComponent,
  theme,
  onToggleTheme,
}: DocsExplorerProps) {
  const [sidebarQuery, setSidebarQuery] = React.useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const filtered = React.useMemo(
    () => filterRegistryComponents(sidebarQuery, 'All'),
    [sidebarQuery]
  );

  const activeComponent = getComponentById(activeComponentId) ?? REGISTRY_COMPONENTS[0];
  const currentIdx = REGISTRY_COMPONENTS.findIndex((c) => c.id === activeComponent.id);
  const prevComp = currentIdx > 0 ? REGISTRY_COMPONENTS[currentIdx - 1] : null;
  const nextComp =
    currentIdx < REGISTRY_COMPONENTS.length - 1 ? REGISTRY_COMPONENTS[currentIdx + 1] : null;

  const selectAndClose = (id: string) => {
    onSelectComponent(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const SidebarContent = (
    <div className="flex h-full flex-col gap-5">
      {/* Sidebar search + theme toggle */}
      <div className="space-y-3">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-[var(--nt-muted)]" />
          <input
            type="text"
            value={sidebarQuery}
            onChange={(e) => setSidebarQuery(e.target.value)}
            aria-label="Filter component sidebar"
            placeholder="Filter components..."
            className="h-9 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-8 pr-8 font-mono text-xs text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
          />
          {sidebarQuery && (
            <button
              type="button"
              aria-label="Clear filter"
              onClick={() => setSidebarQuery('')}
              className="absolute right-2.5 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Surface Theme
          </span>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--nt-line-2)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
        </div>
      </div>

      {/* Categorized navigation list */}
      <nav aria-label="Component registry list" className="flex-1 space-y-6 overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--nt-line-2)] p-4 text-center font-mono text-xs text-[var(--nt-muted)]">
            No components matching &ldquo;{sidebarQuery}&rdquo;.
          </div>
        ) : (
          COMPONENT_CATEGORIES.map((category) => {
            const items = filtered.filter((c) => c.category === category);
            if (items.length === 0) return null;
            return (
              <div key={category} className="space-y-1.5">
                <div className="px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
                  {category}
                </div>
                <ul className="space-y-0.5">
                  {items.map((comp) => {
                    const isActive = comp.id === activeComponent.id;
                    return (
                      <li key={comp.id}>
                        <button
                          type="button"
                          onClick={() => selectAndClose(comp.id)}
                          aria-current={isActive ? 'page' : undefined}
                          className={cn(
                            'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left font-mono text-xs transition-colors cursor-pointer',
                            isActive
                              ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                              : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]'
                          )}
                        >
                          <span className="truncate">{comp.name}</span>
                          <span
                            className={cn(
                              'ml-2 font-display text-[10px] shrink-0',
                              isActive ? 'opacity-75' : 'text-[var(--nt-muted)]'
                            )}
                          >
                            {comp.number}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })
        )}
      </nav>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Mobile component picker toggle */}
      <div className="mb-5 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3.5 font-mono text-xs text-[var(--nt-primary)] cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Components ({REGISTRY_COMPONENTS.length})</span>
        </button>
        <span className="font-mono text-xs text-[var(--nt-muted)]">{activeComponent.name}</span>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex h-full w-[290px] flex-col border-r border-[var(--nt-line)] bg-[var(--nt-bg)] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-base text-[var(--nt-display)]">Registry</span>
              <button
                type="button"
                aria-label="Close component menu"
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line-2)] text-[var(--nt-primary)] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {SidebarContent}
          </aside>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Desktop Sticky Left Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            {SidebarContent}
          </div>
        </aside>

        {/* Main Component Stage */}
        <main className="min-w-0 space-y-10 pb-12">
          <ComponentPreviewCard component={activeComponent} />

          {/* Prev / Next Component Footer Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--nt-line)] pt-6">
            {prevComp ? (
              <button
                type="button"
                onClick={() => selectAndClose(prevComp.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 py-2.5 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>{prevComp.name}</span>
              </button>
            ) : (
              <span />
            )}
            {nextComp && (
              <button
                type="button"
                onClick={() => selectAndClose(nextComp.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 py-2.5 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
              >
                <span>{nextComp.name}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
