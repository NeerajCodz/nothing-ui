import * as React from 'react';
import { createPortal } from 'react-dom';
import {
  BookOpenText,
  CaretDown,
  CaretRight,
  ClockCounterClockwise,
  DeviceMobile,
  GitBranch,
  GridFour,
  House,
  Layout,
  MagnifyingGlass,
  Palette,
  Sparkle,
  SquaresFour,
  Terminal,
  X,
} from '@phosphor-icons/react';
import {
  CATALOG,
  COMPONENT_CATEGORIES,
  PLANNED_WIDGETS,
  WIDGET_GROUPS,
  filterCatalog,
} from '@nothing-ui/registry';
import { DOT_ICON_LIST } from '@nothing-ui/dot-icons';
import { cn, useTheme } from '@nothing-ui/ui';
import type { AppSection } from './site-header';
import type { DocsHubTab } from './search-dialog';

interface DocsSidebarProps {
  section: AppSection;
  activeSlug: string;
  docsTab: DocsHubTab;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onNavigate: (section: AppSection) => void;
  onSelectComponent: (slug: string) => void;
  onNavigateDocsTab: (tab: DocsHubTab) => void;
}

export function DocsSidebar({
  section,
  activeSlug,
  docsTab,
  mobileOpen,
  onCloseMobile,
  onNavigate,
  onSelectComponent,
  onNavigateDocsTab,
}: DocsSidebarProps) {
  const { theme, setTheme } = useTheme();
  const [filter, setFilter] = React.useState('');
  const [platformFilter, setPlatformFilter] = React.useState<'all' | 'native'>('all');
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const activeItemRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (section === 'components' && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [section, activeSlug]);

  const filtered = React.useMemo(
    () => filterCatalog(filter, { platform: platformFilter }),
    [filter, platformFilter],
  );

  const filteredComponents = React.useMemo(
    () => filtered.filter((item) => item.kind === 'component'),
    [filtered],
  );

  const filteredWidgets = React.useMemo(
    () => filtered.filter((item) => item.kind === 'widget'),
    [filtered],
  );

  const filteredGlyphs = React.useMemo(
    () => filtered.filter((item) => item.kind === 'glyph'),
    [filtered],
  );

  const groupedComponents = React.useMemo(() => {
    return COMPONENT_CATEGORIES.map((category) => ({
      category,
      items: filteredComponents.filter((item) => item.category === category),
    })).filter((g) => g.items.length > 0);
  }, [filteredComponents]);

  const groupedWidgets = React.useMemo(() => {
    return WIDGET_GROUPS.map((group) => ({
      group,
      items: filteredWidgets.filter((item) => item.widgetGroup === group),
    })).filter((g) => g.items.length > 0);
  }, [filteredWidgets]);

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSelectNav = (next: AppSection) => {
    onNavigate(next);
    onCloseMobile();
  };

  const handleSelectDoc = (tab: DocsHubTab) => {
    onNavigateDocsTab(tab);
    onCloseMobile();
  };

  const handleSelectComp = (slug: string) => {
    onSelectComponent(slug);
    onCloseMobile();
  };

  const isFiltering = Boolean(filter.trim());

  const sidebarBody = (
    <div className="flex h-full flex-col">
      {/* Top Filter Controls */}
      <div className="space-y-2.5 border-b border-[var(--nt-line)] p-4">
        <div className="relative">
          <MagnifyingGlass
            className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Filter ${CATALOG.length} modules...`}
            aria-label="Filter sidebar components"
            className="h-8 w-full rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-8 pr-7 font-mono text-[11px] text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
          />
          {filter && (
            <button
              type="button"
              aria-label="Clear sidebar filter"
              onClick={() => setFilter('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-1 rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
          <button
            type="button"
            onClick={() => setPlatformFilter('all')}
            aria-pressed={platformFilter === 'all'}
            className={cn(
              'rounded py-1 font-mono text-[10px] transition-colors cursor-pointer',
              platformFilter === 'all'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            All ({CATALOG.length})
          </button>
          <button
            type="button"
            onClick={() => setPlatformFilter('native')}
            aria-pressed={platformFilter === 'native'}
            className={cn(
              'rounded py-1 font-mono text-[10px] transition-colors cursor-pointer',
              platformFilter === 'native'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            Native Ready
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Tree */}
      <nav
        aria-label="Documentation sidebar navigation"
        className="flex-1 overflow-y-auto px-3 py-4 space-y-5"
      >
        {/* Getting Started (hidden while filtering module names) */}
        {!isFiltering && (
          <div className="space-y-1">
            <div className="px-2 pb-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)]">
              Getting Started
            </div>
            <ul className="space-y-0.5">
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectNav('overview')}
                  aria-current={section === 'overview' ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                    section === 'overview'
                      ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                      : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                  )}
                >
                  <House className="h-3.5 w-3.5 shrink-0" />
                  <span>Overview</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectNav('showcase')}
                  aria-current={section === 'showcase' ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                    section === 'showcase'
                      ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                      : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Layout className="h-3.5 w-3.5 shrink-0 text-[var(--nt-accent)]" />
                    <span>Showcase</span>
                  </span>
                  <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">10</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleSelectNav('icons')}
                  aria-current={section === 'icons' ? 'page' : undefined}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                    section === 'icons'
                      ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                      : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Sparkle className="h-3.5 w-3.5 shrink-0" />
                    <span>Icons</span>
                  </span>
                  <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">
                    {DOT_ICON_LIST.length}
                  </span>
                </button>
              </li>
            </ul>
          </div>
        )}

        {/* Track 1: Atomic Components (including dedicated Charts subsection) */}
        {(!isFiltering || filteredComponents.length > 0) && (
          <div
            data-testid="sidebar-components-section"
            className="space-y-3 border-t border-[var(--nt-line)] pt-4"
          >
            <div className="flex items-center justify-between px-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)]">
              <span className="flex items-center gap-1.5">
                <BookOpenText className="h-3 w-3" />
                Components
              </span>
              <span className="tabular-nums">{filteredComponents.length}</span>
            </div>

            {groupedComponents.map((group) => {
              const isCollapsed = Boolean(collapsed[group.category]) && !isFiltering;
              return (
                <div key={group.category} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.category)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1 font-mono text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)]/50 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {isCollapsed ? (
                        <CaretRight className="h-3 w-3 text-[var(--nt-muted)]" />
                      ) : (
                        <CaretDown className="h-3 w-3 text-[var(--nt-muted)]" />
                      )}
                      <span className="truncate">{group.category}</span>
                    </span>
                    <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">
                      {group.items.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="ml-2.5 space-y-0.5 border-l border-[var(--nt-line)] pl-2.5">
                      {group.category === 'Charts' && !isFiltering && (
                        <li>
                          <button
                            type="button"
                            onClick={() => handleSelectNav('charts')}
                            aria-current={section === 'charts' ? 'page' : undefined}
                            className={cn(
                              'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer',
                              section === 'charts'
                                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                                : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
                            )}
                          >
                            <span className="truncate">Charts Hub &amp; Registry</span>
                            <span
                              className={cn(
                                'shrink-0 text-[10px] uppercase tracking-[0.08em]',
                                section === 'charts' ? 'opacity-80' : 'text-[var(--nt-accent)]',
                              )}
                            >
                              Hub
                            </span>
                          </button>
                        </li>
                      )}
                      {group.items.map((item) => {
                        const active = section === 'components' && item.slug === activeSlug;
                        return (
                          <li key={item.slug}>
                            <button
                              ref={active ? activeItemRef : undefined}
                              type="button"
                              onClick={() => handleSelectComp(item.slug)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer',
                                active
                                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                                  : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
                              )}
                            >
                              <span className="truncate">{item.title}</span>
                              <span
                                className={cn(
                                  'shrink-0 text-[10px] tabular-nums',
                                  active ? 'opacity-70' : 'text-[var(--nt-muted)]',
                                )}
                              >
                                {item.moduleNumber}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Track 2: Standalone Glyph System (neither Component nor Widget) */}
        {(!isFiltering || filteredGlyphs.length > 0) && (
          <div
            data-testid="sidebar-glyph-section"
            className="space-y-1.5 border-t border-[var(--nt-line)] pt-4"
          >
            <div className="flex items-center justify-between px-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)]">
              <span className="flex items-center gap-1.5">
                <GridFour className="h-3 w-3 text-[var(--nt-accent)]" />
                Glyph System
              </span>
              <span className="tabular-nums">Standalone</span>
            </div>
            <ul className="space-y-0.5">
              {!isFiltering && (
                <li>
                  <button
                    type="button"
                    onClick={() => handleSelectNav('studio')}
                    aria-current={section === 'studio' ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                      section === 'studio'
                        ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                        : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <GridFour className="h-3.5 w-3.5 shrink-0" />
                      <span>Glyph Studio</span>
                    </span>
                    <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">25×25</span>
                  </button>
                </li>
              )}
              {filteredGlyphs.map((item) => {
                const active = section === 'components' && item.slug === activeSlug;
                return (
                  <li key={item.slug}>
                    <button
                      ref={active ? activeItemRef : undefined}
                      type="button"
                      onClick={() => handleSelectComp(item.slug)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer',
                        active
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                          : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      <span
                        className={cn(
                          'shrink-0 text-[10px] tabular-nums',
                          active ? 'opacity-70' : 'text-[var(--nt-muted)]',
                        )}
                      >
                        {item.moduleNumber}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Track 3: Widgets (Self-Contained Stateful Mini-Apps + Planned Roadmap) */}
        {(!isFiltering || filteredWidgets.length > 0) && (
          <div
            data-testid="sidebar-widgets-section"
            className="space-y-2 border-t border-[var(--nt-line)] pt-4"
          >
            <div className="flex items-center justify-between px-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)]">
              <span className="flex items-center gap-1.5">
                <SquaresFour className="h-3 w-3 text-[var(--nt-accent)]" />
                Widgets
              </span>
              <span className="tabular-nums">{filteredWidgets.length}</span>
            </div>

            {!isFiltering && (
              <button
                type="button"
                onClick={() => handleSelectNav('widgets')}
                aria-current={section === 'widgets' ? 'page' : undefined}
                className={cn(
                  'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                  section === 'widgets'
                    ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                    : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                )}
              >
                <span className="truncate">Widgets Hub &amp; Clocks</span>
                <span className="shrink-0 text-[10px] tabular-nums text-[var(--nt-muted)]">
                  {PLANNED_WIDGETS.length > 0 ? `+${PLANNED_WIDGETS.length}` : '100%'}
                </span>
              </button>
            )}

            {groupedWidgets.map((group) => {
              const collapseKey = `widget:${group.group}`;
              const isCollapsed = Boolean(collapsed[collapseKey]) && !isFiltering;
              return (
                <div key={group.group} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(collapseKey)}
                    aria-expanded={!isCollapsed}
                    className="flex w-full items-center justify-between rounded-md px-2 py-1 font-mono text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)]/50 cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      {isCollapsed ? (
                        <CaretRight className="h-3 w-3 text-[var(--nt-muted)]" />
                      ) : (
                        <CaretDown className="h-3 w-3 text-[var(--nt-muted)]" />
                      )}
                      <span className="truncate">{group.group}</span>
                    </span>
                    <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">
                      {group.items.length}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <ul className="ml-2.5 space-y-0.5 border-l border-[var(--nt-line)] pl-2.5">
                      {group.items.map((item) => {
                        const active = section === 'components' && item.slug === activeSlug;
                        return (
                          <li key={item.slug}>
                            <button
                              ref={active ? activeItemRef : undefined}
                              type="button"
                              onClick={() => handleSelectComp(item.slug)}
                              aria-current={active ? 'page' : undefined}
                              className={cn(
                                'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left font-mono text-xs transition-colors cursor-pointer',
                                active
                                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                                  : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
                              )}
                            >
                              <span className="truncate">{item.title}</span>
                              <span
                                className={cn(
                                  'shrink-0 text-[10px] tabular-nums',
                                  active ? 'opacity-70' : 'text-[var(--nt-muted)]',
                                )}
                              >
                                {item.moduleNumber}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {isFiltering && filtered.length === 0 && (
          <p className="px-2 py-4 font-mono text-xs text-[var(--nt-muted)]">
            No modules match &ldquo;{filter}&rdquo;.
          </p>
        )}

        {/* Architecture & Docs */}
        {!isFiltering && (
          <div className="space-y-1 border-t border-[var(--nt-line)] pt-4">
            <div className="px-2 pb-1 font-mono text-[10px] tracking-[0.12em] uppercase text-[var(--nt-muted)]">
              Architecture &amp; Docs
            </div>
            <ul className="space-y-0.5">
              {(
                [
                  { id: 'cli', label: 'CLI & Setup', count: '1 pkg', icon: Terminal },
                  { id: 'tokens', label: 'Theme Customizer', count: 'CSS', icon: Palette },
                  { id: 'native', label: 'React Native', count: String(CATALOG.length), icon: DeviceMobile },
                  { id: 'roadmap', label: '136-Component Map', count: '136', icon: GitBranch },
                  { id: 'changelog', label: 'Changelog', count: 'v0.4', icon: ClockCounterClockwise },
                ] as const
              ).map(({ id, label, count, icon: Icon }) => {
                const active = section === 'docs' && docsTab === id;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => handleSelectDoc(id)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                        active
                          ? 'bg-[var(--nt-raised)] text-[var(--nt-display)] font-medium'
                          : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60 hover:text-[var(--nt-display)]',
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{label}</span>
                      </span>
                      {count && (
                        <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">{count}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom Theme Switcher */}
      <div className="border-t border-[var(--nt-line)] p-3">
        <div className="flex items-center justify-between rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Theme
          </span>
          <div className="inline-flex items-center gap-1" role="group" aria-label="Sidebar theme switch">
            {(['dark', 'light', 'high-contrast'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={theme === mode}
                onClick={() => setTheme(mode)}
                className={cn(
                  'rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors cursor-pointer',
                  theme === mode
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {mode === 'high-contrast' ? 'HC' : mode === 'dark' ? 'Dark' : 'Light'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Left Sidebar */}
      <aside
        aria-label="Documentation sidebar"
        data-testid="docs-sidebar"
        className="hidden lg:block sticky top-14 h-[calc(100vh-3.5rem)] w-[264px] shrink-0 border-r border-[var(--nt-line)] bg-[var(--nt-bg)]"
      >
        {sidebarBody}
      </aside>

      {/* Mobile / Tablet Slide-Over Sidebar Drawer (portaled to body above sticky z-40 header) */}
      {mobileOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile documentation sidebar"
          >
            <button
              type="button"
              aria-label="Dismiss sidebar backdrop"
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            />
            <aside className="relative z-10 flex h-full w-[min(86vw,300px)] flex-col border-r border-[var(--nt-line-2)] bg-[var(--nt-bg)] shadow-2xl">
              <div className="flex h-12 shrink-0 items-center justify-between border-b border-[var(--nt-line)] px-4">
                <span className="font-display text-sm tracking-[0.08em] text-[var(--nt-display)]">
                  NOTHING UI
                </span>
                <button
                  type="button"
                  aria-label="Close sidebar"
                  onClick={onCloseMobile}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 min-h-0">{sidebarBody}</div>
            </aside>
          </div>,
          document.body,
        )}
    </>
  );
}
