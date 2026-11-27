import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '../../../../packages/registry/src/catalog';
import {
  MAX_CONFIGURABLE_RECENT_SEARCHES,
  MAX_RECENT_SEARCHES,
  MIN_RECENT_SEARCHES,
  RECENT_SEARCHES_LIMIT_STORAGE_KEY,
  RECENT_SEARCHES_STORAGE_KEY,
  clampRecentSearchLimit,
  normalizeRecentSearches,
  readRecentSearchLimit,
  readRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
  resolveRecentSearchEntries,
  writeRecentSearchLimit,
  writeRecentSearches,
  type StorageLike,
} from './recent-searches';

function createMemoryStorage(): StorageLike {
  const map = new Map<string, string>();
  return {
    getItem: (key) => (map.has(key) ? map.get(key)! : null),
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
  };
}

test('recordRecentSearch keeps only the last 5 component names in MRU order and deduplicates', () => {
  let list: string[] = [];
  for (const name of ['Button', 'Slider', 'Switch', 'Tabs', 'Dialog', 'Tooltip']) {
    list = recordRecentSearch(list, name);
  }

  assert.equal(list.length, MAX_RECENT_SEARCHES);
  assert.deepEqual(list, ['Tooltip', 'Dialog', 'Tabs', 'Switch', 'Slider']);

  // Re-searching an existing component moves it to the top without duplicating
  list = recordRecentSearch(list, 'tabs');
  assert.deepEqual(list, ['tabs', 'Tooltip', 'Dialog', 'Switch', 'Slider']);

  // Single removal works case-insensitively
  list = removeRecentSearch(list, 'DIALOG');
  assert.deepEqual(list, ['tabs', 'Tooltip', 'Switch', 'Slider']);

  // Custom configurable limits (e.g. 3 or 8) are respected cleanly
  assert.deepEqual(normalizeRecentSearches(['A', 'B', 'C', 'D', 'E'], 3), ['A', 'B', 'C']);
  assert.deepEqual(
    recordRecentSearch(['A', 'B', 'C', 'D', 'E', 'F', 'G'], 'H', 8),
    ['H', 'A', 'B', 'C', 'D', 'E', 'F', 'G'],
  );
});

test('clampRecentSearchLimit, readRecentSearchLimit, and writeRecentSearchLimit persist configurable caps safely', () => {
  assert.equal(clampRecentSearchLimit(3), 3);
  assert.equal(clampRecentSearchLimit(10), 10);
  assert.equal(clampRecentSearchLimit(0), MIN_RECENT_SEARCHES);
  assert.equal(clampRecentSearchLimit(99), MAX_CONFIGURABLE_RECENT_SEARCHES);
  assert.equal(clampRecentSearchLimit('invalid', 5), 5);

  const storage = createMemoryStorage();
  assert.equal(readRecentSearchLimit(storage), MAX_RECENT_SEARCHES);

  const saved = writeRecentSearchLimit(storage, 8);
  assert.equal(saved, 8);
  assert.equal(storage.getItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY), '8');
  assert.equal(readRecentSearchLimit(storage), 8);

  storage.setItem(RECENT_SEARCHES_LIMIT_STORAGE_KEY, 'not-a-number');
  assert.equal(readRecentSearchLimit(storage, 5), 5);
});

test('readRecentSearches and writeRecentSearches persist safely and survive corrupt JSON', () => {
  const storage = createMemoryStorage();
  const saved = writeRecentSearches(storage, ['  Button ', 'button', 'Slider', '', 'Tabs', 'Dialog', 'Card', 'Alert']);

  assert.deepEqual(saved, ['Button', 'Slider', 'Tabs', 'Dialog', 'Card']);
  assert.deepEqual(readRecentSearches(storage), ['Button', 'Slider', 'Tabs', 'Dialog', 'Card']);

  // Corrupt JSON does not throw
  storage.setItem(RECENT_SEARCHES_STORAGE_KEY, '{bad-json');
  assert.deepEqual(readRecentSearches(storage), []);

  // Non-array JSON does not throw
  storage.setItem(RECENT_SEARCHES_STORAGE_KEY, JSON.stringify({ recent: ['Button'] }));
  assert.deepEqual(readRecentSearches(storage), []);

  // Writing empty clears the storage key
  writeRecentSearches(storage, []);
  assert.equal(storage.getItem(RECENT_SEARCHES_STORAGE_KEY), null);
  assert.deepEqual(normalizeRecentSearches([123, null, '  ', 'Button']), ['Button']);
});

test('resolveRecentSearchEntries matches persisted names by title or slug and skips unknown items', () => {
  const entries = resolveRecentSearchEntries(
    ['timeseries', 'button', 'audio-recorder', 'unknown-module-xyz', 'Timeseries'],
    CATALOG,
  );
  assert.deepEqual(
    entries.map((e) => e.slug),
    ['timeseries', 'button', 'audio-recorder'],
  );
});
