import * as React from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@ui-sdk/react/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
} from '@ui-sdk/react/command';
import {
  ChartBar,
  ClockCounterClockwise,
  Compass,
  Cube,
  DeviceMobile,
  GridFour,
  Layout,
  MagnifyingGlass,
  Moon,
  Palette,
  Sparkle,
  SquaresFour,
  Sun,
  Terminal,
  Trash,
  X,
} from '@phosphor-icons/react';
import { DOT_ICON_LIST, searchDotIcons, type DotIconCanonicalName } from '@nothing-ui/dot-icons';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import {
  CATALOG,
  CHART_REGISTRY,
  PLANNED_WIDGETS,
  getCatalogEntry,
  getComponentCatalog,
  getGlyphCatalog,
  getWidgetCatalog,
} from '@nothing-ui/registry';
import { useTheme } from '@nothing-ui/ui';
import {
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_LIMIT_STORAGE_KEY,
  RECENT_SEARCHES_STORAGE_KEY,
  RECENT_SEARCH_LIMIT_PRESETS,
  clampRecentSearchLimit,
  normalizeRecentSearches,
  readRecentSearchLimit,
  readRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
  resolveRecentSearchEntries,
  writeRecentSearchLimit,
  writeRecentSearches,
} from '../../lib/recent-searches';
import type { AppSection } from './site-header';

export type DocsHubTab = 'cli' | 'native' | 'tokens' | 'roadmap' | 'changelog';

const COMPONENT_ITEMS = getComponentCatalog();
const WIDGET_ITEMS = getWidgetCatalog();
const GLYPH_ITEMS = getGlyphCatalog();

export function SearchDialog({
  open,
  onOpenChange,
  onNavigate,
  onSelectComponent,
  onSelectIcon,
  onNavigateDocsTab,
  maxRecentSearches,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (section: AppSection) => void;
  onSelectComponent: (slug: string) => void;
  onSelectIcon: (iconId: DotIconCanonicalName) => void;
  onNavigateDocsTab: (tab: DocsHubTab) => void;
  /** Optional override for the maximum number of persisted recent component searches (defaults to 5 or user-configured limit). */
  maxRecentSearches?: number;
}) {
  const { setTheme } = useTheme();
  const [query, setQuery] = React.useState('');
  const [storedLimit, setStoredLimit] = React.useState<number>(() =>
    typeof window !== 'undefined'
      ? readRecentSearchLimit(window.localStorage, MAX_RECENT_SEARCHES)
      : MAX_RECENT_SEARCHES,
  );

  const effectiveLimit =
    maxRecentSearches !== undefined
      ? clampRecentSearchLimit(maxRecentSearches, MAX_RECENT_SEARCHES)
      : storedLimit;

  const [recentNames, setRecentNames] = React.useState<string[]>(() =>
    typeof window !== 'undefined' ? readRecentSearches(window.localStorage, effectiveLimit) : [],
  );

  // Keep recent searches & configured limit synced on reopen and across browser tabs
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (open) {
      const nextLimit =
        maxRecentSearches !== undefined
          ? clampRecentSearchLimit(maxRecentSearches, MAX_RECENT_SEARCHES)
          : readRecentSearchLimit(window.localStorage, MAX_RECENT_SEARCHES);
      if (maxRecentSearches === undefined) {
        setStoredLimit(nextLimit);
      }
      setRecentNames(readRecentSearches(window.localStorage, nextLimit));
    } else {
      setQuery('');
    }
  }, [open, maxRecentSearches]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === RECENT_SEARCHES_STORAGE_KEY ||
        event.key === RECENT_SEARCHES_LIMIT_STORAGE_KEY
      ) {
        const nextLimit =
          maxRecentSearches !== undefined
            ? clampRecentSearchLimit(maxRecentSearches, MAX_RECENT_SEARCHES)
            : readRecentSearchLimit(window.localStorage, MAX_RECENT_SEARCHES);
        if (maxRecentSearches === undefined) {
          setStoredLimit(nextLimit);
        }
        setRecentNames(readRecentSearches(window.localStorage, nextLimit));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [maxRecentSearches]);

  const recentEntries = React.useMemo(
    () => resolveRecentSearchEntries(recentNames, CATALOG, effectiveLimit),
    [recentNames, effectiveLimit],
  );

  const persistComponentSearch = React.useCallback(
    (slug: string) => {
      const entry = getCatalogEntry(slug);
      if (!entry) return;
      setRecentNames((prev) => {
        const next = recordRecentSearch(prev, entry.title, effectiveLimit);
        if (typeof window !== 'undefined') {
          writeRecentSearches(window.localStorage, next, effectiveLimit);
        }
        return next;
      });
    },
    [effectiveLimit],
  );

  const handleLimitChange = React.useCallback((nextRaw: number) => {
    const clamped = clampRecentSearchLimit(nextRaw, MAX_RECENT_SEARCHES);
    setStoredLimit(clamped);
    if (typeof window !== 'undefined') {
      writeRecentSearchLimit(window.localStorage, clamped);
    }
    setRecentNames((prev) => {
      const trimmed = normalizeRecentSearches(prev, clamped);
      if (typeof window !== 'undefined') {
        writeRecentSearches(window.localStorage, trimmed, clamped);
      }
      return trimmed;
    });
  }, []);

  const handleClearRecent = React.useCallback(() => {
    setRecentNames([]);
    if (typeof window !== 'undefined') {
      writeRecentSearches(window.localStorage, [], effectiveLimit);
    }
  }, [effectiveLimit]);

  const handleRemoveRecent = React.useCallback(
    (event: React.MouseEvent, title: string) => {
      event.preventDefault();
      event.stopPropagation();
      setRecentNames((prev) => {
        const next = removeRecentSearch(prev, title);
        if (typeof window !== 'undefined') {
          writeRecentSearches(window.localStorage, next, effectiveLimit);
        }
        return next;
      });
    },
    [effectiveLimit],
  );

  const handleAction = (value: string) => {
    if (value.startsWith('recent:')) {
      const slug = value.slice(7);
      persistComponentSearch(slug);
      setQuery('');
      onSelectComponent(slug);
      onOpenChange(false);
      return;
    }
    if (value.startsWith('comp:')) {
      const slug = value.slice(5);
      persistComponentSearch(slug);
      setQuery('');
      onSelectComponent(slug);
      onOpenChange(false);
      return;
    }
    if (value.startsWith('icon:')) {
      setQuery('');
      onSelectIcon(value.slice(5) as DotIconCanonicalName);
      onOpenChange(false);
      return;
    }
    if (value.startsWith('theme:')) {
      const next = value.slice(6) as 'dark' | 'light' | 'high-contrast';
      setQuery('');
      setTheme(next);
      onOpenChange(false);
      return;
    }
    if (value.startsWith('nav:')) {
      setQuery('');
      onNavigate(value.slice(4) as AppSection);
      onOpenChange(false);
      return;
    }
    if (value.startsWith('docs:')) {
      setQuery('');
      onNavigateDocsTab(value.slice(5) as DocsHubTab);
      onOpenChange(false);
    }
  };

  const showRecentGroup = !query.trim() && recentEntries.length > 0;
  const visibleDotIcons = React.useMemo(() => {
    if (!query.trim()) {
      return DOT_ICON_LIST.slice(0, 35);
    }
    return searchDotIcons(query).slice(0, 48);
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
      <DialogContent
        data-testid="search-dialog"
        className="fixed left-1/2 top-[12vh] z-50 w-[min(94vw,640px)] -translate-x-1/2 overflow-hidden rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] shadow-2xl"
      >
        <DialogTitle className="sr-only">Search Nothing UI Registry</DialogTitle>
        <DialogDescription className="sr-only">
          Jump to any component, widget, Glyph system tool, 9x9 dot icon, theme mode, or documentation workspace.
        </DialogDescription>

        <Command
          query={query}
          onQueryChange={setQuery}
          onAction={handleAction}
          className="flex flex-col"
        >
          <div className="flex items-center gap-2.5 border-b border-[var(--nt-line)] px-4">
            <MagnifyingGlass
              className="h-4 w-4 shrink-0 text-[var(--nt-muted)]"
              aria-hidden="true"
            />
            <CommandInput
              autoFocus
              aria-label="Search components, widgets, glyph tools, dot icons, and actions"
              placeholder={`Search ${COMPONENT_ITEMS.length} components, ${WIDGET_ITEMS.length} widgets, Glyph, ${DOT_ICON_LIST.length} icons...`}
              className="h-12 flex-1 bg-transparent font-mono text-sm text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Close search dialog"
              className="inline-flex h-7 w-7 items-center justify-center rounded border border-[var(--nt-line)] text-[var(--nt-muted)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <CommandList
            aria-label="Registry search results"
            className="max-h-[60vh] overflow-y-auto p-2"
          >
            <CommandEmpty className="empty:hidden py-10 text-center font-mono text-xs text-[var(--nt-muted)]">
              No matching components, widgets, dot icons, or actions found.
            </CommandEmpty>

            {showRecentGroup && (
              <CommandGroup data-testid="recent-searches-group" className="mb-2 border-b border-[var(--nt-line)] pb-2">
                <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5">
                  <CommandGroupLabel className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                    <ClockCounterClockwise className="h-3 w-3 text-[var(--nt-accent)]" aria-hidden="true" />
                    <span>
                      Recent Searches ({recentEntries.length}/{effectiveLimit})
                    </span>
                  </CommandGroupLabel>
                  <div className="flex items-center gap-2">
                    {maxRecentSearches === undefined && (
                      <label className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--nt-muted)]">
                        <span>Max</span>
                        <select
                          aria-label="Max recent searches"
                          data-testid="recent-searches-limit-select"
                          value={effectiveLimit}
                          onChange={(e) => handleLimitChange(Number(e.target.value))}
                          className="rounded border border-[var(--nt-line)] bg-[var(--nt-bg)] px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none cursor-pointer"
                        >
                          {RECENT_SEARCH_LIMIT_PRESETS.map((preset) => (
                            <option key={preset} value={preset}>
                              {preset}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    <button
                      type="button"
                      data-testid="clear-recent-searches"
                      onClick={handleClearRecent}
                      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] text-[var(--nt-muted)] transition-colors hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer"
                    >
                      <Trash className="h-3 w-3" aria-hidden="true" />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
                {recentEntries.map((entry) => (
                  <CommandItem
                    key={`recent-${entry.slug}`}
                    value={`recent:${entry.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <ClockCounterClockwise className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)]" />
                      <span className="shrink-0 font-medium text-[var(--nt-display)]">{entry.title}</span>
                      <span className="hidden sm:inline truncate text-[11px] text-[var(--nt-muted)]">
                        {entry.kind === 'widget'
                          ? entry.widgetGroup ?? 'Widgets'
                          : entry.kind === 'glyph'
                            ? 'Glyph System'
                            : entry.category}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[10px] tabular-nums text-[var(--nt-muted)]">
                        {entry.moduleNumber}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${entry.title} from recent searches`}
                        onClick={(event) => handleRemoveRecent(event, entry.title)}
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-[var(--nt-muted)] opacity-60 transition-opacity hover:bg-[var(--nt-surface)] hover:text-[var(--nt-display)] hover:opacity-100 cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            <CommandGroup className="mb-2">
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Workspaces &amp; Themes
              </CommandGroupLabel>
              <CommandItem
                value="nav:charts"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <ChartBar className="h-4 w-4 text-[var(--nt-accent)]" />
                  Charts Hub &amp; Data Visualization Registry ({CHART_REGISTRY.length} Visualizations · Recharts)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Charts</span>
              </CommandItem>
              <CommandItem
                value="nav:widgets"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <SquaresFour className="h-4 w-4 text-[var(--nt-accent)]" />
                  Widgets Hub &amp; Clock Varieties ({WIDGET_ITEMS.length} Live
                  {PLANNED_WIDGETS.length > 0 ? ` · ${PLANNED_WIDGETS.length} Planned` : ' · All Shipped'})
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Widgets</span>
              </CommandItem>
              <CommandItem
                value="nav:studio"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <GridFour className="h-4 w-4 text-[var(--nt-accent)]" />
                  Open Glyph Studio (25×25 &amp; 13×13 Standalone System)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Glyph</span>
              </CommandItem>
              <CommandItem
                value="nav:showcase"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Layout className="h-4 w-4 text-[var(--nt-accent)]" />
                  Nothing UI Showcase (10 Blocks &amp; Templates)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Showcase</span>
              </CommandItem>
              <CommandItem
                value="docs:cli"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Terminal className="h-4 w-4 text-[var(--nt-accent)]" />
                  CLI Init &amp; Single-Package Setup (nthgui)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">CLI</span>
              </CommandItem>
              <CommandItem
                value="nav:icons"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkle className="h-4 w-4 text-[var(--nt-muted)]" />
                  Open Dot Icon Explorer ({DOT_ICON_LIST.length} Icons)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Icons</span>
              </CommandItem>
              <CommandItem
                value="docs:native"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <DeviceMobile className="h-4 w-4 text-[var(--nt-muted)]" />
                  React Native Parity Matrix &amp; Setup ({CATALOG.length})
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Native</span>
              </CommandItem>
              <CommandItem
                value="docs:tokens"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Palette className="h-4 w-4 text-[var(--nt-muted)]" />
                  Live Theme Customizer &amp; CSS Export
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Theme</span>
              </CommandItem>
              <CommandItem
                value="docs:roadmap"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Compass className="h-4 w-4 text-[var(--nt-muted)]" />
                  136-Component · 16-Family Inventory
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Inventory</span>
              </CommandItem>
              <CommandItem
                value="theme:dark"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Moon className="h-4 w-4 text-[var(--nt-muted)]" />
                  Switch Theme: OLED Dark
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">#000000</span>
              </CommandItem>
              <CommandItem
                value="theme:light"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Sun className="h-4 w-4 text-[var(--nt-muted)]" />
                  Switch Theme: Light Paper
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">#F5F5F5</span>
              </CommandItem>
              <CommandItem
                value="theme:high-contrast"
                className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
              >
                <span className="flex items-center gap-2.5">
                  <Palette className="h-4 w-4 text-[var(--nt-accent)]" />
                  Switch Theme: High Contrast (WCAG AAA)
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">AAA</span>
              </CommandItem>
            </CommandGroup>

            <CommandGroup className="mb-2">
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Widgets ({WIDGET_ITEMS.length})
              </CommandGroupLabel>
              {WIDGET_ITEMS.map((entry) => (
                <CommandItem
                  key={entry.slug}
                  value={`comp:${entry.slug}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <SquaresFour className="h-3.5 w-3.5 shrink-0 text-[var(--nt-accent)]" />
                    <span className="shrink-0 font-medium text-[var(--nt-display)]">{entry.title}</span>
                    <span className="hidden sm:inline truncate text-[11px] text-[var(--nt-muted)]">
                      {entry.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--nt-muted)]">
                    {entry.widgetGroup ?? 'Widgets'}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup className="mb-2">
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Glyph System ({GLYPH_ITEMS.length})
              </CommandGroupLabel>
              {GLYPH_ITEMS.map((entry) => (
                <CommandItem
                  key={entry.slug}
                  value={`comp:${entry.slug}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <GridFour className="h-3.5 w-3.5 shrink-0 text-[var(--nt-accent)]" />
                    <span className="shrink-0 font-medium text-[var(--nt-display)]">{entry.title}</span>
                    <span className="hidden sm:inline truncate text-[11px] text-[var(--nt-muted)]">
                      {entry.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--nt-muted)]">
                    Glyph System
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup className="mb-2">
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                Components ({COMPONENT_ITEMS.length})
              </CommandGroupLabel>
              {COMPONENT_ITEMS.map((entry) => (
                <CommandItem
                  key={entry.slug}
                  value={`comp:${entry.slug}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Cube className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)]" />
                    <span className="shrink-0 font-medium text-[var(--nt-display)]">{entry.title}</span>
                    <span className="hidden sm:inline truncate text-[11px] text-[var(--nt-muted)]">
                      {entry.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--nt-muted)]">
                    {entry.category}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup>
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                9×9 Dot Icons ({DOT_ICON_LIST.length})
              </CommandGroupLabel>
              {visibleDotIcons.map((icon) => (
                <CommandItem
                  key={icon.id}
                  value={`icon:${icon.id}`}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-[highlighted]:bg-[var(--nt-raised)] data-[highlighted]:text-[var(--nt-display)]"
                >
                  <span className="flex items-center gap-2.5">
                    <DotIcon name={icon.id} size={16} />
                    <span>{icon.id}</span>
                    {icon.aliases && icon.aliases.length > 0 && (
                      <span className="text-[10px] text-[var(--nt-muted)]">
                        ({icon.aliases.join(', ')})
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-[var(--nt-muted)]">{icon.category}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex items-center justify-between border-t border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-2 font-mono text-[10px] text-[var(--nt-muted)]">
            <span>↑↓ Navigate · Enter Select · Esc Close</span>
            <span>nthgui</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
