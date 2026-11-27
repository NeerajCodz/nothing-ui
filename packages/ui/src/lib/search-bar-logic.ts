export type SearchBarScope = 'all' | 'apps' | 'files' | 'actions' | 'web';

export interface SearchBarItem {
  id: string;
  title: string;
  subtitle: string;
  scope: Exclude<SearchBarScope, 'all'>;
  shortcut?: string;
  meta?: string;
  keywords?: readonly string[];
}

export interface HighlightSegment {
  text: string;
  match: boolean;
}

export const SEARCH_BAR_SCOPES: readonly { id: SearchBarScope; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'apps', label: 'Apps' },
  { id: 'files', label: 'Files' },
  { id: 'actions', label: 'Actions' },
  { id: 'web', label: 'Web' },
];

export const SEARCH_BAR_HISTORY_KEY = 'nthgui-search-bar-widget-history';
export const MAX_SEARCH_BAR_HISTORY = 5;

export const DEFAULT_SEARCH_BAR_ITEMS: readonly SearchBarItem[] = [
  {
    id: 'app-glyph-composer',
    title: 'Glyph Composer',
    subtitle: 'Create 25×25 LED sequences and ringtone light patterns',
    scope: 'apps',
    meta: 'OS App',
    keywords: ['led', 'matrix', 'ringtone', 'lights', 'studio'],
  },
  {
    id: 'app-recorder',
    title: 'Voice Recorder',
    subtitle: '48kHz hardware microphone deck with waveform markers',
    scope: 'apps',
    meta: 'Audio',
    keywords: ['memo', 'audio', 'mic', 'sound'],
  },
  {
    id: 'app-nothing-x',
    title: 'Nothing X Audio',
    subtitle: 'Ear (3) ANC control, custom EQ, and low-latency mode',
    scope: 'apps',
    meta: 'Earbuds',
    keywords: ['anc', 'earbuds', 'headphones', 'bluetooth', 'battery'],
  },
  {
    id: 'app-weather',
    title: 'Weather Matrix',
    subtitle: 'Dot-matrix hourly forecast and UV telemetry for London',
    scope: 'apps',
    meta: 'Widget',
    keywords: ['forecast', 'rain', 'temperature', 'climate'],
  },
  {
    id: 'file-design-tokens',
    title: 'nothing-tokens.css',
    subtitle: 'OLED dark, paper light, and WCAG AAA CSS custom properties',
    scope: 'files',
    meta: '14 KB',
    keywords: ['css', 'theme', 'variables', 'palette', 'colors'],
  },
  {
    id: 'file-glyph-spec',
    title: 'glyph-matrix-25x25.json',
    subtitle: '481 addressable LED coordinate map for Phone (3)',
    scope: 'files',
    meta: '42 KB',
    keywords: ['hardware', 'spec', 'coordinates', 'json', 'glyph'],
  },
  {
    id: 'file-release-notes',
    title: 'v0.4-changelog.md',
    subtitle: 'Web + React Native parity notes and CLI template index',
    scope: 'files',
    meta: '8 KB',
    keywords: ['docs', 'markdown', 'release', 'nthgui'],
  },
  {
    id: 'action-glyph-torch',
    title: 'Toggle Glyph Torch',
    subtitle: 'Illuminate rear LED matrix at 80% diffused brightness',
    scope: 'actions',
    shortcut: 'G T',
    meta: 'Quick Action',
    keywords: ['flashlight', 'light', 'rear', 'led'],
  },
  {
    id: 'action-flip-glyph',
    title: 'Flip to Glyph Focus',
    subtitle: 'Silence notifications and enable silent matrix alerts',
    scope: 'actions',
    shortcut: 'F G',
    meta: 'Focus',
    keywords: ['dnd', 'quiet', 'mute', 'focus'],
  },
  {
    id: 'action-battery-check',
    title: 'Run Battery Diagnostics',
    subtitle: 'Inspect cycle count, cell voltage, and Ear (3) charge levels',
    scope: 'actions',
    shortcut: 'B D',
    meta: 'System',
    keywords: ['power', 'health', 'charge', 'telemetry'],
  },
  {
    id: 'web-nthgui-docs',
    title: 'nthgui CLI Documentation',
    subtitle: 'npx nthgui init & npx nthgui add search-bar reference',
    scope: 'web',
    meta: 'Docs',
    keywords: ['install', 'cli', 'package', 'react', 'native'],
  },
  {
    id: 'web-wcag-contrast',
    title: 'WCAG AAA Contrast Matrix',
    subtitle: 'High-contrast surface ratios across Dark and Light tokens',
    scope: 'web',
    meta: 'Guide',
    keywords: ['a11y', 'accessibility', 'contrast', 'color'],
  },
];

export const DEFAULT_VOICE_SAMPLES: readonly string[] = [
  'Glyph Composer',
  'Battery Diagnostics',
  'nothing-tokens',
  'Weather Matrix',
];

function scoreSearchItem(item: SearchBarItem, normalizedQuery: string): number {
  if (!normalizedQuery) return 1;

  const title = item.title.toLowerCase();
  const subtitle = item.subtitle.toLowerCase();
  const keywords = (item.keywords ?? []).map((k) => k.toLowerCase());

  if (title === normalizedQuery) return 120;
  if (title.startsWith(normalizedQuery)) return 95;
  if (title.includes(normalizedQuery)) return 75;
  if (keywords.some((k) => k === normalizedQuery)) return 65;
  if (keywords.some((k) => k.startsWith(normalizedQuery))) return 55;
  if (keywords.some((k) => k.includes(normalizedQuery))) return 40;
  if (subtitle.includes(normalizedQuery)) return 25;

  // Multi-word token fallback: all tokens must appear somewhere
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length > 1) {
    const haystack = `${title} ${subtitle} ${keywords.join(' ')}`;
    if (tokens.every((token) => haystack.includes(token))) {
      return 30;
    }
  }

  return 0;
}

export function filterSearchBarItems(
  items: readonly SearchBarItem[],
  query: string,
  scope: SearchBarScope = 'all',
  limit?: number,
): SearchBarItem[] {
  const normalized = query.trim().toLowerCase();
  const scoped = scope === 'all' ? items : items.filter((item) => item.scope === scope);

  if (!normalized) {
    return typeof limit === 'number' ? scoped.slice(0, Math.max(0, limit)) : [...scoped];
  }

  const ranked = scoped
    .map((item, index) => ({ item, score: scoreSearchItem(item, normalized), index }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((entry) => entry.item);

  return typeof limit === 'number' ? ranked.slice(0, Math.max(0, limit)) : ranked;
}

export function splitHighlightSegments(text: string, query: string): HighlightSegment[] {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return [{ text, match: false }];
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = cleanQuery.toLowerCase();
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const matchIndex = lowerText.indexOf(lowerQuery, cursor);
    if (matchIndex === -1) {
      segments.push({ text: text.slice(cursor), match: false });
      break;
    }
    if (matchIndex > cursor) {
      segments.push({ text: text.slice(cursor, matchIndex), match: false });
    }
    segments.push({
      text: text.slice(matchIndex, matchIndex + cleanQuery.length),
      match: true,
    });
    cursor = matchIndex + cleanQuery.length;
  }

  return segments.length > 0 ? segments : [{ text, match: false }];
}

export function moveActiveResultIndex(
  currentIndex: number,
  delta: 1 | -1,
  total: number,
): number {
  if (total <= 0) return -1;
  if (currentIndex < 0 || currentIndex >= total) {
    return delta === 1 ? 0 : total - 1;
  }
  return (currentIndex + delta + total) % total;
}

export function pushRecentQuery(
  current: readonly string[],
  query: string,
  maxItems: number = MAX_SEARCH_BAR_HISTORY,
): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [...current];

  const key = trimmed.toLowerCase();
  const deduped = current.filter((entry) => entry.trim().toLowerCase() !== key);
  return [trimmed, ...deduped].slice(0, Math.max(1, maxItems));
}

export function removeRecentQuery(current: readonly string[], query: string): string[] {
  const key = query.trim().toLowerCase();
  return current.filter((entry) => entry.trim().toLowerCase() !== key);
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function readSearchBarHistory(
  storage: StorageLike | null | undefined,
  storageKey: string = SEARCH_BAR_HISTORY_KEY,
  maxItems: number = MAX_SEARCH_BAR_HISTORY,
): string[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    const normalized: string[] = [];
    for (const item of parsed) {
      if (typeof item !== 'string') continue;
      const trimmed = item.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      normalized.push(trimmed);
      if (normalized.length >= maxItems) break;
    }
    return normalized;
  } catch {
    return [];
  }
}

export function writeSearchBarHistory(
  storage: StorageLike | null | undefined,
  queries: readonly string[],
  storageKey: string = SEARCH_BAR_HISTORY_KEY,
  maxItems: number = MAX_SEARCH_BAR_HISTORY,
): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const item of queries) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push(trimmed);
    if (normalized.length >= maxItems) break;
  }

  if (storage) {
    try {
      if (normalized.length === 0) {
        storage.removeItem(storageKey);
      } else {
        storage.setItem(storageKey, JSON.stringify(normalized));
      }
    } catch {
      // Ignore quota / private-browsing storage restrictions
    }
  }
  return normalized;
}
