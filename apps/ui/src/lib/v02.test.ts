import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAYGROUND_SCHEMAS,
  buildPlaygroundSnippet,
  getInitialPlaygroundState,
  serializeJsxProps,
} from './playground';
import {
  DEFAULT_CUSTOM_THEME,
  generateCustomThemeCss,
  generateCustomTokensJson,
  getAccentContrastReport,
  isValidHexColor,
} from './theme-customizer';
import {
  buildCliExecCommand,
  buildComponentsJson,
  buildPackageInstallCommand,
  createDryRunPlan,
} from '../../../../packages/cli/src/index';
import { CATALOG } from '../../../../packages/registry/src/index';
import {
  filterNativeSpecs,
  getAllNativeSpecs,
  getNativeSpecBySlug,
} from '../../../../packages/ui-native/src/index';

test('playground schemas generate valid JSX snippets importing only from nthgui subpaths', () => {
  for (const [slug, schema] of Object.entries(PLAYGROUND_SCHEMAS)) {
    const initial = getInitialPlaygroundState(schema);
    const snippet = buildPlaygroundSnippet(schema, initial);
    assert.ok(
      snippet.includes(`from "${schema.importPath}"`),
      `Snippet for ${slug} must import from ${schema.importPath}`,
    );
    assert.ok(
      !snippet.includes('@nothing-ui/') && !snippet.includes('nothing-ui'),
      `Snippet for ${slug} must never leak @nothing-ui/* or stale nothing-ui packages`,
    );
    assert.ok(snippet.includes(`<${schema.componentName}`));
  }

  const buttonSchema = PLAYGROUND_SCHEMAS.button;
  const serialized = serializeJsxProps(buttonSchema, {
    ...getInitialPlaygroundState(buttonSchema),
    variant: 'signal',
    loading: true,
  });
  assert.ok(serialized.includes('variant="signal"'));
  assert.ok(serialized.includes('loading'));
});

test('theme customizer validates hex, calculates WCAG contrast, and exports Tailwind v4 CSS', () => {
  assert.equal(isValidHexColor('#D71921'), true);
  assert.equal(isValidHexColor('#fff'), false);
  assert.equal(isValidHexColor('not-a-color'), false);

  const report = getAccentContrastReport(DEFAULT_CUSTOM_THEME);
  assert.ok(report.onDarkBg > 3.5);
  assert.ok(report.whiteOnAccent > 4.5);
  assert.equal(report.recommendedFg, '#FFFFFF');
  assert.equal(report.meetsAAOnSurface, true);

  const css = generateCustomThemeCss({
    ...DEFAULT_CUSTOM_THEME,
    mode: 'light',
    accentHex: '#2563EB',
    radiusPx: 8,
    density: 'compact',
    showDotField: false,
  });
  assert.ok(css.includes('@import "tailwindcss";'));
  assert.ok(css.includes('--color-nothing-accent: #2563EB;'));
  assert.ok(css.includes('--radius-nothing-card: 8px;'));
  assert.ok(css.includes('--nt-dot-field-opacity: 0;'));
  assert.ok(css.includes('package: nthgui'));

  const json = JSON.parse(generateCustomTokensJson(DEFAULT_CUSTOM_THEME)) as { package: string; accent: string };
  assert.equal(json.package, 'nthgui');
  assert.equal(json.accent, '#D71921');
});

test('single-package CLI planner enforces zero extra npm installs across all package managers and frameworks', () => {
  assert.equal(buildCliExecCommand('npm', 'add button'), 'npx nthgui add button');
  assert.equal(buildCliExecCommand('bun', 'init'), 'bunx --bun nthgui init');
  assert.equal(buildCliExecCommand('pnpm', 'add slider'), 'pnpm dlx nthgui add slider');
  assert.equal(buildCliExecCommand('yarn', 'add combobox'), 'yarn dlx nthgui add combobox');

  assert.equal(buildPackageInstallCommand('npm'), 'npm install nthgui');
  assert.equal(buildPackageInstallCommand('bun'), 'bun add nthgui');
  assert.equal(buildPackageInstallCommand('pnpm'), 'pnpm add nthgui');
  assert.equal(buildPackageInstallCommand('yarn'), 'yarn add nthgui');

  const plan = createDryRunPlan(['dot-matrix-clock', 'combobox'], 'pnpm', 'next');
  assert.equal(plan.packageName, 'nthgui');
  assert.equal(plan.extraPackagesRequired, 0);
  assert.deepEqual(plan.npmDependencies, ['nthgui']);
  assert.equal(plan.addCommand, 'pnpm dlx nthgui add dot-matrix-clock combobox');
  assert.deepEqual(plan.targetFiles, [
    'src/components/nthgui/dot-matrix-clock.tsx',
    'src/components/nthgui/combobox.tsx',
  ]);

  const parsedConfig = JSON.parse(buildComponentsJson('next')) as { package: string; tailwind: { css: string } };
  assert.equal(parsedConfig.package, 'nthgui');
  assert.equal(parsedConfig.tailwind.css, 'app/globals.css');

  const expoPlan = createDryRunPlan(['glyph-matrix'], 'bun', 'expo');
  assert.ok(expoPlan.initCommand.includes('--native'));
  assert.ok(expoPlan.addCommand.includes('--native'));
  assert.equal(expoPlan.extraPackagesRequired, 0);
});

test('all 111 catalog modules (including all 35 widgets) have valid React Native specs under nthgui/native without DOM leaks', () => {
  const allSpecs = getAllNativeSpecs();
  assert.equal(CATALOG.length, 111, `Expected 111 catalog modules, got ${CATALOG.length}`);
  assert.equal(allSpecs.length, CATALOG.length, `Expected ${CATALOG.length} native specs, got ${allSpecs.length}`);

  for (const entry of CATALOG) {
    const spec = getNativeSpecBySlug(entry.slug);
    assert.ok(spec, `Missing React Native spec for catalog slug "${entry.slug}"`);
    assert.equal(spec.importPath, 'nthgui/native');
    assert.equal(spec.cliCommand, `npx nthgui add ${entry.slug} --native`);
    assert.ok(spec.primitivesUsed.length > 0, `${entry.slug} must declare RN primitives`);
    assert.ok(
      spec.code.includes('react-native'),
      `${entry.slug} native code must import react-native or react-native-svg`,
    );
    assert.ok(!spec.code.includes('@nothing-ui/'), `${entry.slug} native code leaked @nothing-ui/*`);
    assert.ok(!spec.code.includes('<div'), `${entry.slug} native code must not use web <div>`);
  }

  const hardware = filterNativeSpecs('', 'Data & Hardware');
  assert.ok(hardware.length >= 10, `Expected at least 10 Data & Hardware native specs, got ${hardware.length}`);
  assert.ok(hardware.every((s) => s.category === 'Data & Hardware'));

  const charts = filterNativeSpecs('', 'Charts');
  assert.equal(charts.length, 9);
  assert.ok(charts.every((s) => s.category === 'Charts'));

  const widgets = filterNativeSpecs('', 'Widgets');
  assert.equal(widgets.length, 35);
  assert.ok(widgets.every((s) => s.category === 'Widgets'));

  const glyph = filterNativeSpecs('', 'Glyph System');
  assert.equal(glyph.length, 1);
  assert.equal(glyph[0].slug, 'glyph-matrix');

  const radarMatches = filterNativeSpecs('radar');
  assert.equal(radarMatches.length, 2);
  assert.ok(radarMatches.some((s) => s.slug === 'radar-chart'));
  assert.ok(radarMatches.some((s) => s.slug === 'network-speed-radar'));

  for (const spec of allSpecs) {
    assert.equal(spec.loadingSupport.defaultVariant, 'normal');
    assert.equal(spec.loadingSupport.usesActivityIndicatorByDefault, true);
    assert.deepEqual(spec.loadingSupport.supportedVariants, ['normal', 'dots', 'bars', 'pulse']);
  }

  const nativeButton = getNativeSpecBySlug('button');
  assert.ok(nativeButton?.code.includes('ActivityIndicator'));
  assert.ok(nativeButton?.code.includes('loaderVariant = "normal"'));
  assert.ok(nativeButton?.code.includes('busy: loading'));
});

