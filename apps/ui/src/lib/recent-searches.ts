import type { ResolvedCatalogEntry } from '@nothing-ui/registry';

export const RECENT_SEARCHES_STORAGE_KEY = 'nthgui-recent-searches';
export const RECENT_SEARCHES_LIMIT_STORAGE_KEY = 'nthgui-recent-searches-limit';
export const MAX_RECENT_SEARCHES = 5;
export const MIN_RECENT_SEARCHES = 1;
export const MAX_CONFIGURABLE_RECENT_SEARCHES = 20;
export const RECENT_SEARCH_LIMIT_PRESETS = [3, 5, 8, 10] as const;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Clamps a configured recent-search history limit to a safe integer in [1, 20].
 */
export function clampRecentSearchLimit(
  value: unknown,
  fallback: number = MAX_RECENT_SEARCHES,
): number {
  const safeFallback =
    typeof fallback === 'number' && Number.isFinite(fallback)
      ? Math.min(MAX_CONFIGURABLE_RECENT_SEARCHES, Math.max(MIN_RECENT_SEARCHES, Math.floor(fallback)))
      : MAX_RECENT_SEARCHES;

  const numeric = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof numeric !== 'number' || !Number.isFinite(numeric)) {
    return safeFallback;
  }
  return Math.min(
    MAX_CONFIGURABLE_RECENT_SEARCHES,
    Math.max(MIN_RECENT_SEARCHES, Math.floor(numeric)),
  );
}

/**
 * Safely reads the user's configured recent-search limit from storage.
 */
export function readRecentSearchLimit(
  storage: StorageLike | null | undefined,
  fallback: number = MAX_RECENT_SEARCHES,
): number {
  const safeFallback = clampRecentSearchLimit(fallback, MAX_RECENT_SEARCHES);
  if (!storage) return safeFallback;
  try {
    const raw = storage.getItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY);
    if (!raw) return safeFallback;
    return clampRecentSearchLimit(Number(raw), safeFallback);
  } catch {
    return safeFallback;
  }
}

/**
 * Safely persists the user's configured recent-search limit to storage.
 */
export function writeRecentSearchLimit(
  storage: StorageLike | null | undefined,
  limit: number,
): number {
  const clamped = clampRecentSearchLimit(limit, MAX_RECENT_SEARCHES);
  if (storage) {
    try {
      storage.setItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY, String(clamped));
    } catch {
      // Ignore storage quota or restricted iframe errors gracefully
    }
  }
  return clamped;
}

/**
 * Normalizes a list of component names: trims, removes blanks and case-insensitive
 * duplicates (preserving earliest occurrence), and caps to `maxItems`.
 */
export function normalizeRecentSearches(
  names: readonly unknown[],
  maxItems: number = MAX_RECENT_SEARCHES,
): string[] {
  const limit = Math.max(0, Math.floor(maxItems));
  if (limit === 0) return [];

  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of names) {
    if (typeof raw !== 'string') continue;
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
    if (result.length >= limit) break;
  }

  return result;
}

/**
 * Records a newly searched/selected component name at the front of the list (MRU),
 * deduplicating case-insensitively and capping to `maxItems` (default 5).
 */
export function recordRecentSearch(
  current: readonly string[],
  componentName: string,
  maxItems: number = MAX_RECENT_SEARCHES,
): string[] {
  const trimmed = componentName.trim();
  if (!trimmed) return normalizeRecentSearches(current, maxItems);
  return normalizeRecentSearches([trimmed, ...current], maxItems);
}

/**
 * Removes a single component name from the recent searches list (case-insensitive).
 */
export function removeRecentSearch(
  current: readonly string[],
  componentName: string,
): string[] {
  const target = componentName.trim().toLowerCase();
  if (!target) return [...current];
  return current.filter((item) => item.trim().toLowerCase() !== target);
}

/**
 * Safely reads the persisted recent component names from storage.
 */
export function readRecentSearches(
  storage: StorageLike | null | undefined,
  maxItems: number = MAX_RECENT_SEARCHES,
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(RECENT_SEARCHES_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return normalizeRecentSearches(parsed, maxItems);
  } catch {
    return [];
  }
}

/**
 * Safely writes the recent component names array to storage (removes key when empty).
 */
export function writeRecentSearches(
  storage: StorageLike | null | undefined,
  names: readonly string[],
  maxItems: number = MAX_RECENT_SEARCHES,
): string[] {
  const normalized = normalizeRecentSearches(names, maxItems);
  if (!storage) return normalized;
  try {
    if (normalized.length === 0) {
      storage.removeItem(RECENT_SEARCHES_STORAGE_KEY);
    } else {
      storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify(normalized));
    }
  } catch {
    // Ignore storage quota or restricted iframe errors gracefully
  }
  return normalized;
}

/**
 * Resolves persisted component names back to live catalog entries (matching title or slug).
 */
export function resolveRecentSearchEntries(
  names: readonly string[],
  catalog: readonly ResolvedCatalogEntry[],
  maxItems: number = MAX_RECENT_SEARCHES,
): ResolvedCatalogEntry[] {
  if (names.length === 0 || catalog.length === 0) return [];

  const byTitle = new Map<string, ResolvedCatalogEntry>();
  const bySlug = new Map<string, ResolvedCatalogEntry>();
  for (const entry of catalog) {
    byTitle.set(entry.title.toLowerCase(), entry);
    bySlug.set(entry.slug.toLowerCase(), entry);
  }

  const seenSlugs = new Set<string>();
  const resolved: ResolvedCatalogEntry[] = [];

  for (const name of names) {
    const key = name.trim().toLowerCase();
    if (!key) continue;
    const match = byTitle.get(key) ?? bySlug.get(key);
    if (!match || seenSlugs.has(match.slug)) continue;
    seenSlugs.add(match.slug);
    resolved.push(match);
    if (resolved.length >= maxItems) break;
  }

  return resolved;
}
