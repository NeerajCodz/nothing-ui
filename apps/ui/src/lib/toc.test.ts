import test from 'node:test';
import assert from 'node:assert/strict';
import { getTocItemsForView, resolveActiveTocId } from './toc';

test('resolveActiveTocId tracks scrolled headings accurately and handles bounds', () => {
  const sections = [
    { id: 'comp-overview', top: -180 },
    { id: 'comp-preview', top: 40 },
    { id: 'comp-installation', top: 420 },
    { id: 'comp-api', top: 890 },
  ];

  // Top <= 128 picks the latest passed section
  assert.equal(resolveActiveTocId(sections), 'comp-preview');

  // When all sections are below threshold, fallback to first section
  assert.equal(
    resolveActiveTocId([
      { id: 'a', top: 200 },
      { id: 'b', top: 500 },
    ]),
    'a',
  );

  // Near bottom snaps to final section
  assert.equal(resolveActiveTocId(sections, { isNearBottom: true }), 'comp-api');

  // Empty array returns null
  assert.equal(resolveActiveTocId([]), null);
});

test('getTocItemsForView produces unique non-empty anchor lists for all app views and docs tabs', () => {
  const views = [
    { section: 'overview' as const, docsTab: 'cli' as const },
    { section: 'components' as const, docsTab: 'cli' as const, hasPlayground: false },
    { section: 'components' as const, docsTab: 'cli' as const, hasPlayground: true },
    { section: 'charts' as const, docsTab: 'cli' as const },
    { section: 'widgets' as const, docsTab: 'cli' as const },
    { section: 'docs' as const, docsTab: 'cli' as const },
    { section: 'docs' as const, docsTab: 'native' as const },
    { section: 'docs' as const, docsTab: 'tokens' as const },
    { section: 'docs' as const, docsTab: 'roadmap' as const },
    { section: 'docs' as const, docsTab: 'changelog' as const },
    { section: 'icons' as const, docsTab: 'cli' as const },
    { section: 'studio' as const, docsTab: 'cli' as const },
    { section: 'showcase' as const, docsTab: 'cli' as const },
  ];

  for (const cfg of views) {
    const items = getTocItemsForView(cfg);
    assert.ok(items.length >= 2, `Expected at least 2 TOC items for ${cfg.section}/${cfg.docsTab}`);
    const ids = items.map((i) => i.id);
    assert.equal(new Set(ids).size, ids.length, `Duplicate TOC ids in ${cfg.section}/${cfg.docsTab}`);
  }

  const chartsToc = getTocItemsForView({ section: 'charts', docsTab: 'cli' });
  assert.deepEqual(
    chartsToc.map((i) => i.id),
    ['charts-header', 'charts-bar-demo', 'charts-registry'],
  );

  const widgetsToc = getTocItemsForView({ section: 'widgets', docsTab: 'cli' });
  assert.deepEqual(
    widgetsToc.map((i) => i.id),
    ['widgets-header', 'widgets-pillars', 'widgets-live', 'widgets-roadmap'],
  );

  const showcaseToc = getTocItemsForView({ section: 'showcase', docsTab: 'cli' });
  assert.ok(showcaseToc.length >= 12, 'Showcase TOC should list header, filter, and all 10 showcases');
  assert.ok(showcaseToc.some((i) => i.id === 'showcase-os-lockscreen'));
  assert.ok(showcaseToc.some((i) => i.id === 'showcase-widget-wall'));
  assert.ok(showcaseToc.some((i) => i.id === 'showcase-camera-deck'));
  assert.ok(showcaseToc.some((i) => i.id === 'showcase-developer-api'));
  assert.ok(showcaseToc.some((i) => i.id === 'showcase-hardware-store'));

  const withPlayground = getTocItemsForView({ section: 'components', docsTab: 'cli', hasPlayground: true });
  assert.ok(withPlayground.some((i) => i.id === 'comp-playground'));

  const withoutPlayground = getTocItemsForView({ section: 'components', docsTab: 'cli', hasPlayground: false });
  assert.ok(!withoutPlayground.some((i) => i.id === 'comp-playground'));
});

