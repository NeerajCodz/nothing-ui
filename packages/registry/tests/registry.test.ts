import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CATALOG,
  CHART_REGISTRY,
  CHART_SLUGS,
  CHART_VISUALIZATION_KINDS,
  COMPLETE_INVENTORY_GROUPS,
  COMPONENT_CATEGORIES,
  GLYPH_SLUGS,
  NATIVE_FIRST_WAVE_TARGETS,
  NOTHING_EXCLUSIVE_GROUPS,
  PLANNED_WIDGETS,
  REFERENCE_ROADMAP_GROUPS,
  SHOWCASE_ONLY_COMPOSITIONS,
  WIDGET_GROUPS,
  WIDGET_SLUGS,
  buildInstallCommand,
  compileShadcnRegistryItem,
  countCompleteInventory,
  countReferenceRoadmapEntries,
  filterCatalog,
  filterChartRegistry,
  getChartRegistryByKind,
  getChartRegistryEntry,
  getChartsCatalog,
  getComponentCatalog,
  getGlyphCatalog,
  getWidgetCatalog,
  validateCatalogConsistency,
  validateChartRegistry,
} from '../src/index';

test('complete inventory tracks exact 136 shipped entries (114 Standard + 22 Exclusive) across 16 families', () => {
  const check = validateCatalogConsistency();
  assert.equal(check.valid, true, `Catalog errors: ${check.errors.join('; ')}`);
  assert.equal(CATALOG.length, 111, `Expected 111 catalog modules, got ${CATALOG.length}`);

  const refCounts = countReferenceRoadmapEntries();
  assert.equal(refCounts.total, 114, `Expected 114 standard entries, got ${refCounts.total}`);
  assert.equal(refCounts.shipped, 114, `Expected 114 shipped standard entries, got ${refCounts.shipped}`);
  assert.equal(refCounts.planned, 0, `Expected 0 planned standard entries, got ${refCounts.planned}`);

  const full = countCompleteInventory();
  assert.equal(full.families, 16, `Expected 16 families, got ${full.families}`);
  assert.equal(full.standard, 114, `Expected 114 standard components, got ${full.standard}`);
  assert.equal(full.exclusive, 22, `Expected 22 Nothing UI exclusive components, got ${full.exclusive}`);
  assert.equal(full.total, 136, `Expected 136 total components, got ${full.total}`);
  assert.equal(full.shipped, 136, `Expected 136 shipped components, got ${full.shipped}`);
  assert.equal(full.planned, 0, `Expected 0 planned components, got ${full.planned}`);

  // Verify exact counts per family
  assert.deepEqual(
    REFERENCE_ROADMAP_GROUPS.map((g) => g.items.length),
    [9, 23, 12, 6, 13, 6, 9, 4, 13, 7, 6, 5, 1],
  );
  assert.deepEqual(
    NOTHING_EXCLUSIVE_GROUPS.map((g) => g.items.length),
    [10, 6, 6],
  );

  const allItems = COMPLETE_INVENTORY_GROUPS.flatMap((g) => g.items);
  const allSlugs = allItems.map((i) => i.slug);
  assert.equal(new Set(allSlugs).size, 136, 'All 136 inventory slugs must be unique');
  assert.equal(allItems.every((i) => Boolean(i.shippedSlug) && i.status !== 'planned'), true, 'All 136 items must be shipped');

  assert.equal(SHOWCASE_ONLY_COMPOSITIONS.length, 5, 'Expected 5 showcase-only compositions');
  assert.equal(NATIVE_FIRST_WAVE_TARGETS.length, 12, 'Expected 12 first-wave React Native targets');
});

test('3-track taxonomy strictly separates Components (with dedicated Charts), Widgets (35 live, 0 planned remaining), and standalone Glyph', () => {
  const components = getComponentCatalog();
  const charts = getChartsCatalog();
  const widgets = getWidgetCatalog();
  const glyphs = getGlyphCatalog();

  assert.equal(components.length, 75, `Expected 75 atomic components, got ${components.length}`);
  assert.equal(charts.length, 9, `Expected 9 charts in Components -> Charts, got ${charts.length}`);
  assert.equal(widgets.length, 35, `Expected 35 live widgets, got ${widgets.length}`);
  assert.equal(glyphs.length, 1, `Expected 1 standalone Glyph entry, got ${glyphs.length}`);
  assert.equal(components.length + widgets.length + glyphs.length, CATALOG.length);

  // Charts live exclusively under Components -> Charts (never inside Data & Hardware)
  assert.ok(COMPONENT_CATEGORIES.includes('Charts'));
  for (const chart of charts) {
    assert.equal(chart.kind, 'component');
    assert.equal(chart.category, 'Charts');
    assert.ok(CHART_SLUGS.has(chart.slug));
  }
  const dataAndHardware = components.filter((c) => c.category === 'Data & Hardware');
  assert.equal(
    dataAndHardware.some((c) => CHART_SLUGS.has(c.slug)),
    false,
    'Data & Hardware must never contain any chart modules',
  );
  assert.equal(
    dataAndHardware.some((c) => WIDGET_SLUGS.has(c.slug) || GLYPH_SLUGS.has(c.slug)),
    false,
    'Data & Hardware must never contain widgets or glyph',
  );

  // Widgets are strictly separate from Components and Glyph
  for (const slug of ['calendar', 'calendar-canvas', 'dot-matrix-clock', 'audio-recorder', 'video-recorder', 'camera-capture', 'search-bar']) {
    const widget = widgets.find((w) => w.slug === slug);
    assert.ok(widget, `Expected "${slug}" to be classified as a Widget`);
    assert.equal(widget.kind, 'widget');
    assert.equal(widget.category, 'Widgets');
    assert.ok(widget.widgetGroup && WIDGET_GROUPS.includes(widget.widgetGroup));
  }

  // Glyph is standalone — neither Component nor Widget
  const glyphEntry = glyphs[0];
  assert.equal(glyphEntry.slug, 'glyph-matrix');
  assert.equal(glyphEntry.kind, 'glyph');
  assert.equal(glyphEntry.category, 'Glyph System');
  assert.equal(filterCatalog('', { kind: 'component' }).some((c) => c.slug === 'glyph-matrix'), false);
  assert.equal(filterCatalog('', { kind: 'widget' }).some((c) => c.slug === 'glyph-matrix'), false);

  // All 14 formerly planned widgets + 6 clock varieties are now shipped live
  assert.equal(PLANNED_WIDGETS.length, 0, `Expected 0 remaining planned widgets, got ${PLANNED_WIDGETS.length}`);
  const shippedSlugs = new Set(CATALOG.map((c) => c.slug));
  for (const promotedSlug of [
    'pedometer-ring',
    'battery-health-hub',
    'screen-time-pulse',
    'network-speed-radar',
    'stopwatch-timer',
    'world-clock-deck',
    'agenda-ticker',
    'podcast-mini-player',
    'voice-memo-transcriber',
    'photo-frame-dither',
    'pomodoro-focus-card',
    'quick-notes-pad',
    'habit-matrix-tracker',
    'unit-fx-converter',
    'analog-clock',
    'flip-clock',
    'binary-dot-clock',
    'word-clock',
    'radial-clock',
    'clock-collection',
    'calendar-widget',
    'nothing-analog-clock',
  ]) {
    assert.equal(shippedSlugs.has(promotedSlug), true, `Expected widget "${promotedSlug}" to be shipped in CATALOG`);
  }
});

test('install commands strictly target single published nthgui package in CLI and Package modes', () => {
  assert.equal(CATALOG.length, 111, `Expected 111 catalog entries, got ${CATALOG.length}`);

  const btn = CATALOG.find((c) => c.slug === 'button')!;
  const cliBun = buildInstallCommand(btn, 'bun', 'web', 'cli');
  assert.equal(cliBun, 'bunx --bun nthgui add button');

  const cliNpm = buildInstallCommand(btn, 'npm', 'web');
  assert.equal(cliNpm, 'npx nthgui add button');

  const pkgNpm = buildInstallCommand(btn, 'npm', 'web', 'package');
  assert.equal(pkgNpm, 'npm install nthgui');

  const nativeCli = buildInstallCommand(btn, 'npm', 'native', 'cli');
  assert.equal(nativeCli, 'npx nthgui add button --native');

  // Ensure zero scoped @nothing-ui/* leaks and 100% React Native parity across entire 88-module catalog
  for (const entry of CATALOG) {
    const cmdCli = buildInstallCommand(entry, 'npm', 'web', 'cli');
    const cmdPkg = buildInstallCommand(entry, 'npm', 'web', 'package');
    const cmdNativeCli = buildInstallCommand(entry, 'npm', 'native', 'cli');
    const cmdNativePkg = buildInstallCommand(entry, 'npm', 'native', 'package');

    assert.ok(cmdCli && !cmdCli.includes('@nothing-ui/'), `${entry.slug} CLI command leaked scoped package`);
    assert.equal(cmdPkg, 'npm install nthgui');
    assert.equal(cmdNativeCli, `npx nthgui add ${entry.slug} --native`);
    assert.equal(cmdNativePkg, 'npm install nthgui');
    assert.equal(entry.nativeImport, 'nthgui/native');
    assert.equal(entry.web, 'stable', `${entry.slug} must be stable on web`);
    assert.equal(entry.native, 'stable', `${entry.slug} must be stable on native`);
  }

  // Every entry across the 136-component inventory is shipped as stable and maps to a React Native target
  const allItems = COMPLETE_INVENTORY_GROUPS.flatMap((g) => g.items);
  assert.equal(allItems.every((i) => Boolean(i.nativeTarget)), true);
  assert.equal(allItems.every((i) => i.status === 'stable' && Boolean(i.shippedSlug)), true);

  const item = compileShadcnRegistryItem(btn);
  assert.equal(item.$schema, 'https://ui.shadcn.com/schema/registry-item.json');
  assert.equal(item.name, 'button');
  assert.equal(item.meta.kind, 'component');
  assert.deepEqual(item.dependencies, ['nthgui']);
  assert.equal(item.files.length, 2);

  const calWidget = CATALOG.find((c) => c.slug === 'calendar')!;
  assert.equal(compileShadcnRegistryItem(calWidget).meta.kind, 'widget');

  const glyphItem = CATALOG.find((c) => c.slug === 'glyph-matrix')!;
  assert.equal(compileShadcnRegistryItem(glyphItem).meta.kind, 'glyph');
});

test('CHART_REGISTRY registers Recharts bar placeholder + all 9 interactive SVG charts with valid catalog links', () => {
  const check = validateChartRegistry();
  assert.equal(check.valid, true, `Chart registry errors: ${check.errors.join('; ')}`);
  assert.equal(CHART_REGISTRY.length, 10, `Expected 10 chart registry entries, got ${CHART_REGISTRY.length}`);

  const rechartsBar = getChartRegistryEntry('bar-chart-recharts');
  assert.ok(rechartsBar, 'Expected bar-chart-recharts entry');
  assert.equal(rechartsBar.engine, 'recharts');
  assert.equal(rechartsBar.status, 'placeholder');
  assert.equal(rechartsBar.responsive, true);
  assert.equal(rechartsBar.kind, 'cartesian');

  // Every chart visualization kind is covered
  for (const kind of CHART_VISUALIZATION_KINDS) {
    assert.ok(
      getChartRegistryByKind(kind).length >= 1,
      `Expected at least one registered chart of kind "${kind}"`,
    );
  }

  assert.equal(filterChartRegistry('', { engine: 'recharts' }).length, 1);
  assert.equal(filterChartRegistry('', { engine: 'nthgui-svg' }).length, 9);
  assert.equal(filterChartRegistry('sankey').length, 1);
  assert.equal(filterChartRegistry('sankey')[0]?.id, 'sankey');
  assert.equal(filterChartRegistry('', { kind: 'spatial' }).length, 1);
  assert.equal(filterChartRegistry('nonexistent-chart-xyz').length, 0);
});

