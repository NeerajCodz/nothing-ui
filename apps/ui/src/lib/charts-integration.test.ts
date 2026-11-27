import assert from 'node:assert/strict';
import test from 'node:test';
import { CATALOG } from '../../../../packages/registry/src/index';
import { getNativeSpecBySlug } from '../../../../packages/ui-native/src/index';
import {
  PLAYGROUND_SCHEMAS,
  buildPlaygroundSnippet,
  getInitialPlaygroundState,
} from './playground';

const ALL_CHART_SLUGS = [
  'charts',
  'sparkline-strip',
  'radar-chart',
  'pie-chart',
  'timeseries',
  'sankey',
  'map-chart',
  'flow',
  'custom-chart',
] as const;

test('all 9 chart slugs are synchronized across CATALOG, PLAYGROUND_SCHEMAS, and nthgui/native', () => {
  for (const slug of ALL_CHART_SLUGS) {
    const entry = CATALOG.find((c) => c.slug === slug);
    assert.ok(entry, `Catalog missing chart slug "${slug}"`);
    assert.equal(entry.kind, 'component', `${slug} must be a Component`);
    assert.equal(entry.category, 'Charts', `${slug} must live in the dedicated Charts subsection`);
    assert.equal(entry.web, 'stable', `${slug} web status must be stable`);
    assert.equal(entry.native, 'stable', `${slug} native status must be stable`);
    assert.equal(entry.webImport, 'nthgui', `${slug} webImport must be nthgui`);
    assert.ok(entry.props.length >= 4, `${slug} must document interactive configurable props`);
    assert.ok(entry.features.length >= 3, `${slug} must list core interactive features`);

    const schema = PLAYGROUND_SCHEMAS[slug];
    assert.ok(schema, `PropsPlayground missing schema for chart slug "${slug}"`);
    assert.equal(schema.importPath, 'nthgui');
    assert.ok(schema.controls.some((c) => c.name === 'palette'), `${slug} playground must expose palette control`);
    assert.ok(schema.controls.some((c) => c.name === 'defaultLive'), `${slug} playground must expose live toggle`);

    // Verify mutated playground state produces clean JSX with nthgui import
    const mutated = {
      ...getInitialPlaygroundState(schema),
      palette: 'spectral',
      defaultLive: true,
    };
    const jsx = buildPlaygroundSnippet(schema, mutated);
    assert.ok(jsx.includes(`import { ${schema.componentName} } from "nthgui";`));
    assert.ok(jsx.includes('palette="spectral"'));
    assert.ok(jsx.includes('defaultLive'));
    assert.ok(!jsx.includes('@nothing-ui/'));

    const nativeSpec = getNativeSpecBySlug(slug);
    assert.ok(nativeSpec, `Native catalog missing chart slug "${slug}"`);
    assert.equal(nativeSpec.category, 'Charts', `${slug} native spec must live in Charts category`);
    assert.equal(nativeSpec.importPath, 'nthgui/native');
  }
});

test('catalog, playground, and native specs never reference excluded orb component', () => {
  const forbidden = /thinking[\s-]?orb/i;
  for (const entry of CATALOG) {
    assert.ok(!forbidden.test(entry.slug), `Forbidden slug: ${entry.slug}`);
    assert.ok(!forbidden.test(entry.title), `Forbidden title: ${entry.title}`);
  }
  for (const slug of Object.keys(PLAYGROUND_SCHEMAS)) {
    assert.ok(!forbidden.test(slug), `Forbidden playground slug: ${slug}`);
  }
});
