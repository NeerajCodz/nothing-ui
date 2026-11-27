import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_SEARCH_BAR_ITEMS,
  MAX_SEARCH_BAR_HISTORY,
  SEARCH_BAR_HISTORY_KEY,
  filterSearchBarItems,
  moveActiveResultIndex,
  pushRecentQuery,
  readSearchBarHistory,
  removeRecentQuery,
  splitHighlightSegments,
  writeSearchBarHistory,
} from './search-bar-logic';

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
}

test('filterSearchBarItems ranks exact/prefix matches ahead of subtitle/keyword hits and respects scope', () => {
  const glyphResults = filterSearchBarItems(DEFAULT_SEARCH_BAR_ITEMS, 'glyph');
  assert.ok(glyphResults.length >= 3);
  assert.equal(glyphResults[0]?.id, 'app-glyph-composer');

  const appsOnly = filterSearchBarItems(DEFAULT_SEARCH_BAR_ITEMS, 'glyph', 'apps');
  assert.equal(appsOnly.length, 1);
  assert.equal(appsOnly[0]?.id, 'app-glyph-composer');

  const multiToken = filterSearchBarItems(DEFAULT_SEARCH_BAR_ITEMS, 'ear anc');
  assert.equal(multiToken.length, 1);
  assert.equal(multiToken[0]?.id, 'app-nothing-x');

  const empty = filterSearchBarItems(DEFAULT_SEARCH_BAR_ITEMS, 'zzz-no-match');
  assert.equal(empty.length, 0);
});

test('splitHighlightSegments splits case-insensitive matches cleanly without dropping characters', () => {
  assert.deepEqual(splitHighlightSegments('Glyph Composer', 'glyph'), [
    { text: 'Glyph', match: true },
    { text: ' Composer', match: false },
  ]);

  assert.deepEqual(splitHighlightSegments('Flip to Glyph Focus', 'glyph'), [
    { text: 'Flip to ', match: false },
    { text: 'Glyph', match: true },
    { text: ' Focus', match: false },
  ]);

  assert.deepEqual(splitHighlightSegments('Weather Matrix', ''), [
    { text: 'Weather Matrix', match: false },
  ]);
});

test('moveActiveResultIndex wraps smoothly across empty and populated result lists', () => {
  assert.equal(moveActiveResultIndex(-1, 1, 0), -1);
  assert.equal(moveActiveResultIndex(-1, 1, 4), 0);
  assert.equal(moveActiveResultIndex(-1, -1, 4), 3);
  assert.equal(moveActiveResultIndex(3, 1, 4), 0);
  assert.equal(moveActiveResultIndex(0, -1, 4), 3);
  assert.equal(moveActiveResultIndex(1, 1, 4), 2);
});

test('recent query helpers deduplicate case-insensitively, cap at 5, and survive corrupt storage', () => {
  let history: string[] = [];
  for (const term of ['Glyph', 'Battery', 'Weather', 'Tokens', 'Recorder', 'WCAG']) {
    history = pushRecentQuery(history, term);
  }
  assert.equal(history.length, MAX_SEARCH_BAR_HISTORY);
  assert.deepEqual(history, ['WCAG', 'Recorder', 'Tokens', 'Weather', 'Battery']);

  history = pushRecentQuery(history, 'tokens');
  assert.deepEqual(history, ['tokens', 'WCAG', 'Recorder', 'Weather', 'Battery']);

  history = removeRecentQuery(history, 'WEATHER');
  assert.deepEqual(history, ['tokens', 'WCAG', 'Recorder', 'Battery']);

  const storage = createMemoryStorage();
  writeSearchBarHistory(storage, history);
  assert.deepEqual(readSearchBarHistory(storage), ['tokens', 'WCAG', 'Recorder', 'Battery']);

  storage.setItem(SEARCH_BAR_HISTORY_KEY, '{not-valid-json');
  assert.deepEqual(readSearchBarHistory(storage), []);

  writeSearchBarHistory(storage, []);
  assert.equal(storage.getItem(SEARCH_BAR_HISTORY_KEY), null);
});
