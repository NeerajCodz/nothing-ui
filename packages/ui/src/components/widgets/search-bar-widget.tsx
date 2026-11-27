import * as React from 'react';
import {
  ArrowRight,
  ClockCounterClockwise,
  Cube,
  FileText,
  Globe,
  Lightning,
  MagnifyingGlass,
  Microphone,
  X,
} from '@phosphor-icons/react';
import { cn } from '../../lib/cn';
import { Loader } from '../loader';
import type { LoaderVariant } from '../../lib/loading-logic';
import {
  DEFAULT_SEARCH_BAR_ITEMS,
  DEFAULT_VOICE_SAMPLES,
  MAX_SEARCH_BAR_HISTORY,
  SEARCH_BAR_HISTORY_KEY,
  SEARCH_BAR_SCOPES,
  filterSearchBarItems,
  moveActiveResultIndex,
  pushRecentQuery,
  readSearchBarHistory,
  removeRecentQuery,
  splitHighlightSegments,
  writeSearchBarHistory,
  type SearchBarItem,
  type SearchBarScope,
} from '../../lib/search-bar-logic';

export interface SearchBarWidgetProps {
  /** Searchable dataset; defaults to Nothing OS apps, files, quick actions, and docs. */
  items?: readonly SearchBarItem[];
  /** Controlled query value. */
  value?: string;
  /** Default initial query for uncontrolled usage. */
  defaultValue?: string;
  /** Controlled scope filter. */
  scope?: SearchBarScope;
  /** Placeholder text displayed inside the search input. */
  placeholder?: string;
  /** Visual surface size density. */
  size?: 'default' | 'compact';
  /** Show the segmented scope switcher (All / Apps / Files / Actions / Web). */
  showScopes?: boolean;
  /** Show the interactive voice dictation button. */
  showVoice?: boolean;
  /** Persist recent queries to localStorage (defaults to true). */
  persistHistory?: boolean;
  /** Custom localStorage key for persisted recent queries. */
  storageKey?: string;
  /** Show inline loading indicator inside the search bar. */
  loading?: boolean;
  /** Loader animation style. */
  loaderVariant?: LoaderVariant;
  /** Loading status message when loading is true. */
  loadingText?: string;
  /** Fired whenever the query string changes. */
  onValueChange?: (query: string) => void;
  /** Fired whenever the active scope changes. */
  onScopeChange?: (scope: SearchBarScope) => void;
  /** Fired when the user submits a free-text search or selects a web fallback. */
  onSearchSubmit?: (query: string, scope: SearchBarScope) => void;
  /** Fired when the user activates a matched item from the results list. */
  onSelectResult?: (item: SearchBarItem) => void;
  className?: string;
}

function getScopeIcon(scope: Exclude<SearchBarScope, 'all'>) {
  switch (scope) {
    case 'apps':
      return Cube;
    case 'files':
      return FileText;
    case 'actions':
      return Lightning;
    case 'web':
      return Globe;
  }
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const segments = React.useMemo(() => splitHighlightSegments(text, query), [text, query]);
  return (
    <>
      {segments.map((seg, idx) =>
        seg.match ? (
          <mark
            key={idx}
            className="rounded-xs bg-[var(--nt-accent-soft)] px-0.5 text-[var(--nt-display)]"
          >
            {seg.text}
          </mark>
        ) : (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        ),
      )}
    </>
  );
}

export function SearchBarWidget({
  items = DEFAULT_SEARCH_BAR_ITEMS,
  value,
  defaultValue = '',
  scope: controlledScope,
  placeholder = 'Search apps, files, quick actions, or web...',
  size = 'default',
  showScopes = true,
  showVoice = true,
  persistHistory = true,
  storageKey = SEARCH_BAR_HISTORY_KEY,
  loading = false,
  loaderVariant = 'normal',
  loadingText = 'Indexing results...',
  onValueChange,
  onScopeChange,
  onSearchSubmit,
  onSelectResult,
  className,
}: SearchBarWidgetProps) {
  const [internalQuery, setInternalQuery] = React.useState(defaultValue);
  const [internalScope, setInternalScope] = React.useState<SearchBarScope>('all');
  const [focused, setFocused] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [voiceListening, setVoiceListening] = React.useState(false);
  const [voiceSampleIdx, setVoiceSampleIdx] = React.useState(0);
  const [lastExecution, setLastExecution] = React.useState<string | null>(null);
  const [recentQueries, setRecentQueries] = React.useState<string[]>(() => {
    if (!persistHistory || typeof window === 'undefined') {
      return ['Glyph Composer', 'Battery Diagnostics'];
    }
    const stored = readSearchBarHistory(window.localStorage, storageKey, MAX_SEARCH_BAR_HISTORY);
    return stored.length > 0 ? stored : ['Glyph Composer', 'Battery Diagnostics'];
  });

  const inputRef = React.useRef<HTMLInputElement>(null);
  const voiceTimerRef = React.useRef<number | null>(null);
  const listboxId = React.useId();

  const query = value !== undefined ? value : internalQuery;
  const activeScope = controlledScope !== undefined ? controlledScope : internalScope;

  const setQuery = React.useCallback(
    (next: string) => {
      if (value === undefined) {
        setInternalQuery(next);
      }
      onValueChange?.(next);
      setActiveIndex(0);
    },
    [value, onValueChange],
  );

  const setScope = React.useCallback(
    (next: SearchBarScope) => {
      if (controlledScope === undefined) {
        setInternalScope(next);
      }
      onScopeChange?.(next);
      setActiveIndex(0);
    },
    [controlledScope, onScopeChange],
  );

  const recordHistory = React.useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      setRecentQueries((prev) => {
        const next = pushRecentQuery(prev, trimmed, MAX_SEARCH_BAR_HISTORY);
        if (persistHistory && typeof window !== 'undefined') {
          writeSearchBarHistory(window.localStorage, next, storageKey, MAX_SEARCH_BAR_HISTORY);
        }
        return next;
      });
    },
    [persistHistory, storageKey],
  );

  const handleRemoveHistory = React.useCallback(
    (term: string) => {
      setRecentQueries((prev) => {
        const next = removeRecentQuery(prev, term);
        if (persistHistory && typeof window !== 'undefined') {
          writeSearchBarHistory(window.localStorage, next, storageKey, MAX_SEARCH_BAR_HISTORY);
        }
        return next;
      });
    },
    [persistHistory, storageKey],
  );

  const handleClearHistory = React.useCallback(() => {
    setRecentQueries([]);
    if (persistHistory && typeof window !== 'undefined') {
      writeSearchBarHistory(window.localStorage, [], storageKey, MAX_SEARCH_BAR_HISTORY);
    }
  }, [persistHistory, storageKey]);

  React.useEffect(() => {
    return () => {
      if (voiceTimerRef.current !== null) {
        window.clearTimeout(voiceTimerRef.current);
      }
    };
  }, []);

  const results = React.useMemo(
    () => filterSearchBarItems(items, query, activeScope, query.trim() ? 6 : 4),
    [items, query, activeScope],
  );

  const clampedActiveIndex =
    results.length === 0 ? -1 : Math.min(Math.max(activeIndex, 0), results.length - 1);

  const executeItem = React.useCallback(
    (item: SearchBarItem) => {
      recordHistory(query.trim() || item.title);
      setLastExecution(`${item.title} · ${item.meta ?? item.scope}`);
      onSelectResult?.(item);
    },
    [query, recordHistory, onSelectResult],
  );

  const executeWebSearch = React.useCallback(
    (term: string) => {
      const trimmed = term.trim();
      if (!trimmed) return;
      recordHistory(trimmed);
      setLastExecution(`Web search · "${trimmed}"`);
      onSearchSubmit?.(trimmed, activeScope);
    },
    [activeScope, recordHistory, onSearchSubmit],
  );

  const handleToggleVoice = React.useCallback(() => {
    if (voiceListening) {
      if (voiceTimerRef.current !== null) {
        window.clearTimeout(voiceTimerRef.current);
        voiceTimerRef.current = null;
      }
      setVoiceListening(false);
      return;
    }

    setVoiceListening(true);
    setFocused(true);
    inputRef.current?.focus();

    const sample = DEFAULT_VOICE_SAMPLES[voiceSampleIdx % DEFAULT_VOICE_SAMPLES.length];
    setVoiceSampleIdx((idx) => idx + 1);

    voiceTimerRef.current = window.setTimeout(() => {
      setVoiceListening(false);
      setQuery(sample);
      setLastExecution(`Voice captured · "${sample}"`);
      voiceTimerRef.current = null;
    }, 650);
  }, [voiceListening, voiceSampleIdx, setQuery]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => moveActiveResultIndex(prev, 1, results.length));
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => moveActiveResultIndex(prev, -1, results.length));
      return;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      if (clampedActiveIndex >= 0 && results[clampedActiveIndex]) {
        executeItem(results[clampedActiveIndex]);
      } else if (query.trim()) {
        executeWebSearch(query);
      }
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      if (query) {
        setQuery('');
      } else {
        setFocused(false);
        inputRef.current?.blur();
      }
    }
  };

  const hasQuery = query.trim().length > 0;
  const activeOptionId =
    clampedActiveIndex >= 0 && results[clampedActiveIndex]
      ? `${listboxId}-opt-${results[clampedActiveIndex].id}`
      : undefined;

  return (
    <section
      data-testid="search-bar-widget"
      aria-label="Search Bar Widget"
      className={cn(
        'w-full max-w-xl rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-primary)] transition-colors',
        size === 'compact' ? 'p-3 space-y-2.5' : 'p-4 space-y-3',
        className,
      )}
    >
      {/* Top hardware bar: tactile search input + clear + voice trigger */}
      <div
        className={cn(
          'flex items-center gap-2 rounded-xl border bg-[var(--nt-bg)] transition-colors',
          size === 'compact' ? 'px-3 py-2' : 'px-3.5 py-2.5',
          focused || voiceListening
            ? 'border-[var(--nt-display)] ring-1 ring-[var(--nt-display)]/20'
            : 'border-[var(--nt-line)] hover:border-[var(--nt-line-2)]',
        )}
      >
        {loading ? (
          <Loader variant={loaderVariant} size="sm" label={loadingText} className="shrink-0" />
        ) : (
          <MagnifyingGlass
            className={cn(
              'h-4 w-4 shrink-0 transition-colors',
              focused ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]',
            )}
            aria-hidden="true"
          />
        )}

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          aria-expanded={true}
          aria-controls={listboxId}
          aria-activedescendant={activeOptionId}
          aria-autocomplete="list"
          aria-label="Search Bar Widget input"
          value={query}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={voiceListening ? 'Listening for voice query...' : placeholder}
          className={cn(
            'min-w-0 flex-1 bg-transparent font-mono text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none [&::-webkit-search-cancel-button]:hidden',
            size === 'compact' ? 'text-xs' : 'text-sm',
          )}
        />

        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search query"
            className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[var(--nt-muted)] transition-colors hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}

        {showVoice && (
          <button
            type="button"
            onClick={handleToggleVoice}
            aria-label={voiceListening ? 'Stop voice search' : 'Start voice search'}
            aria-pressed={voiceListening}
            className={cn(
              'inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[11px] transition-colors whitespace-nowrap cursor-pointer',
              voiceListening
                ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)] text-white'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)]',
            )}
          >
            <Microphone className="h-3.5 w-3.5" weight={voiceListening ? 'fill' : 'regular'} />
            <span>{voiceListening ? 'Listening' : 'Voice'}</span>
          </button>
        )}
      </div>

      {/* Scope switcher */}
      {showScopes && (
        <div
          role="group"
          aria-label="Search scope filter"
          className="flex items-center justify-between gap-2"
        >
          <div className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1 font-mono text-[11px]">
            {SEARCH_BAR_SCOPES.map((item) => {
              const active = activeScope === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setScope(item.id)}
                  className={cn(
                    'rounded-lg px-2.5 py-1 transition-colors whitespace-nowrap cursor-pointer',
                    active
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] font-medium'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <span className="hidden sm:inline font-mono text-[10px] tabular-nums text-[var(--nt-muted)] whitespace-nowrap">
            {loading ? loadingText : `${results.length} result${results.length === 1 ? '' : 's'}`}
          </span>
        </div>
      )}

      {/* Recent queries strip (visible when input is empty and history exists) */}
      {!hasQuery && recentQueries.length > 0 && (
        <div
          data-testid="search-bar-recent-strip"
          className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--nt-line)] pt-2.5 font-mono text-[11px]"
        >
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-[var(--nt-muted)]">
              <ClockCounterClockwise className="h-3 w-3 text-[var(--nt-accent)]" aria-hidden="true" />
              <span>Recent</span>
            </span>
            {recentQueries.map((term) => (
              <span
                key={term}
                className="inline-flex items-center gap-1 rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] pl-2 pr-1 py-0.5 text-[11px] text-[var(--nt-secondary)]"
              >
                <button
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    inputRef.current?.focus();
                  }}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  {term}
                </button>
                <button
                  type="button"
                  aria-label={`Remove recent query ${term}`}
                  onClick={() => handleRemoveHistory(term)}
                  className="inline-flex h-4 w-4 items-center justify-center rounded text-[var(--nt-muted)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="text-[10px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            Clear
          </button>
        </div>
      )}

      {/* Instant results list / empty fallback */}
      <div
        id={listboxId}
        role="listbox"
        aria-label="Search Bar suggestions"
        className="divide-y divide-[var(--nt-line)] overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)]"
      >
        {results.length === 0 ? (
          <div className="flex flex-col items-start justify-between gap-3 p-3.5 sm:flex-row sm:items-center">
            <div className="space-y-0.5 font-mono">
              <div className="text-xs text-[var(--nt-display)]">
                No local matches for &ldquo;{query.trim()}&rdquo;
              </div>
              <div className="text-[11px] text-[var(--nt-muted)]">
                Try switching scope to All or run a direct web lookup.
              </div>
            </div>
            <button
              type="button"
              onClick={() => executeWebSearch(query)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] px-3 py-1.5 font-mono text-[11px] text-[var(--nt-inverse-fg)] transition-opacity hover:opacity-90 whitespace-nowrap cursor-pointer"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Search Web</span>
            </button>
          </div>
        ) : (
          results.map((item, idx) => {
            const Icon = getScopeIcon(item.scope);
            const isHighlighted = idx === clampedActiveIndex;
            return (
              <button
                key={item.id}
                id={`${listboxId}-opt-${item.id}`}
                type="button"
                role="option"
                aria-selected={isHighlighted}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => executeItem(item)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left transition-colors cursor-pointer',
                  isHighlighted
                    ? 'bg-[var(--nt-raised)] text-[var(--nt-display)]'
                    : 'text-[var(--nt-primary)] hover:bg-[var(--nt-raised)]/60',
                )}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0',
                      isHighlighted ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-xs font-medium text-[var(--nt-display)]">
                      <HighlightedText text={item.title} query={query} />
                    </span>
                    <span className="block truncate text-[11px] text-[var(--nt-muted)]">
                      <HighlightedText text={item.subtitle} query={query} />
                    </span>
                  </span>
                </span>

                <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
                  <span>{item.meta ?? item.scope}</span>
                  {item.shortcut && (
                    <kbd className="rounded border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-1.5 py-0.5 text-[9px] text-[var(--nt-secondary)]">
                      {item.shortcut}
                    </kbd>
                  )}
                  <ArrowRight
                    className={cn(
                      'h-3 w-3 transition-transform',
                      isHighlighted ? 'translate-x-0.5 text-[var(--nt-display)]' : 'opacity-40',
                    )}
                    aria-hidden="true"
                  />
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Subtle footer with keyboard hint and real execution feedback */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
        <span data-testid="search-bar-status" className="truncate text-[var(--nt-secondary)]">
          {lastExecution ? `Executed · ${lastExecution}` : '↑↓ Navigate · Enter Open · Esc Clear'}
        </span>
        <span className="tabular-nums whitespace-nowrap">
          Scope: {SEARCH_BAR_SCOPES.find((s) => s.id === activeScope)?.label ?? 'All'}
        </span>
      </div>
    </section>
  );
}
