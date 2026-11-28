import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG } from '@nothing-ui/registry';
import {
  DEFAULT_COMPONENT_SLUG,
  DEFAULT_DOCS_TAB,
  DEFAULT_ICON,
  formatAppPath,
  getCatalogPathPrefix,
  parseAppPath,
  type AppRouteState,
} from './routes';

const base: AppRouteState = {
  section: 'overview',
  activeSlug: DEFAULT_COMPONENT_SLUG,
  docsTab: DEFAULT_DOCS_TAB,
  selectedIcon: DEFAULT_ICON,
};

test('parseAppPath maps top-level sections', () => {
  assert.deepEqual(parseAppPath('/'), { section: 'overview' });
  assert.deepEqual(parseAppPath('/charts'), { section: 'charts' });
  assert.deepEqual(parseAppPath('/widgets'), { section: 'widgets' });
  assert.deepEqual(parseAppPath('/glyph'), { section: 'studio' });
  assert.deepEqual(parseAppPath('/showcase'), { section: 'showcase' });
  assert.deepEqual(parseAppPath('/icons'), { section: 'icons', icon: DEFAULT_ICON });
  assert.deepEqual(parseAppPath('/docs'), { section: 'docs', docsTab: 'cli' });
  assert.deepEqual(parseAppPath('/components'), { section: 'components', slug: DEFAULT_COMPONENT_SLUG });
});

test('parseAppPath resolves catalog slugs, docs tabs, and icons', () => {
  assert.deepEqual(parseAppPath('/components/button'), { section: 'components', slug: 'button' });
  assert.deepEqual(parseAppPath('/widgets/calendar/'), { section: 'components', slug: 'calendar' });
  assert.deepEqual(parseAppPath('/charts/radar-chart'), { section: 'components', slug: 'radar-chart' });
  assert.deepEqual(parseAppPath('/glyph/glyph-matrix'), { section: 'components', slug: 'glyph-matrix' });
  assert.deepEqual(parseAppPath('/docs/changelog'), { section: 'docs', docsTab: 'changelog' });
  assert.deepEqual(parseAppPath('/icons/wifi'), { section: 'icons', icon: 'wifi' });
});

test('parseAppPath falls back for unknown paths', () => {
  assert.deepEqual(parseAppPath('/widgets/not-a-widget'), { section: 'widgets' });
  assert.deepEqual(parseAppPath('/components/nope'), { section: 'components', slug: DEFAULT_COMPONENT_SLUG });
  assert.deepEqual(parseAppPath('/docs/nope'), { section: 'docs', docsTab: 'cli' });
  assert.deepEqual(parseAppPath('/icons/%E0%A4%A'), { section: 'icons', icon: DEFAULT_ICON });
  assert.deepEqual(parseAppPath('/totally/unknown'), { section: 'overview' });
});

test('formatAppPath produces canonical URLs per section', () => {
  assert.equal(formatAppPath(base), '/');
  assert.equal(formatAppPath({ ...base, section: 'charts' }), '/charts');
  assert.equal(formatAppPath({ ...base, section: 'widgets' }), '/widgets');
  assert.equal(formatAppPath({ ...base, section: 'studio' }), '/glyph');
  assert.equal(formatAppPath({ ...base, section: 'showcase' }), '/showcase');
  assert.equal(formatAppPath({ ...base, section: 'icons' }), '/icons');
  assert.equal(formatAppPath({ ...base, section: 'docs' }), '/docs');
  assert.equal(formatAppPath({ ...base, section: 'docs', docsTab: 'roadmap' }), '/docs/roadmap');
  assert.equal(formatAppPath({ ...base, section: 'components' }), '/components/button');
  assert.equal(formatAppPath({ ...base, section: 'components', activeSlug: 'calendar' }), '/widgets/calendar');
  assert.equal(formatAppPath({ ...base, section: 'components', activeSlug: 'radar-chart' }), '/charts/radar-chart');
  assert.equal(formatAppPath({ ...base, section: 'components', activeSlug: 'glyph-matrix' }), '/glyph/glyph-matrix');
});

test('every catalog entry round-trips through its canonical URL', () => {
  for (const entry of CATALOG) {
    const path = formatAppPath({ ...base, section: 'components', activeSlug: entry.slug });
    assert.ok(path.startsWith(getCatalogPathPrefix(entry.slug)));
    assert.deepEqual(parseAppPath(path), { section: 'components', slug: entry.slug }, path);
  }
});

test('every section round-trips through its canonical URL', () => {
  const states: AppRouteState[] = [
    base,
    { ...base, section: 'charts' },
    { ...base, section: 'widgets' },
    { ...base, section: 'studio' },
    { ...base, section: 'showcase' },
    { ...base, section: 'icons', selectedIcon: 'wifi' },
    { ...base, section: 'docs', docsTab: 'tokens' },
  ];
  for (const state of states) {
    const route = parseAppPath(formatAppPath(state));
    assert.equal(route.section, state.section);
  }
});
