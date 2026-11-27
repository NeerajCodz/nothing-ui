import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(PKG_DIR, 'dist');
const CLI_BIN = path.join(DIST_DIR, 'cli.mjs');

test('packages/nthgui declared package.json exports and bin artifacts all exist on disk', () => {
  const pkgJson = JSON.parse(fs.readFileSync(path.join(PKG_DIR, 'package.json'), 'utf8')) as {
    name: string;
    bin: Record<string, string>;
    exports: Record<string, string | { types?: string; import?: string }>;
  };

  assert.equal(pkgJson.name, 'nthgui');
  assert.ok(fs.existsSync(path.resolve(PKG_DIR, pkgJson.bin.nthgui)), 'Missing CLI bin file');

  for (const [subpath, target] of Object.entries(pkgJson.exports)) {
    if (typeof target === 'string') {
      assert.ok(fs.existsSync(path.resolve(PKG_DIR, target)), `Missing export target ${target} for ${subpath}`);
    } else {
      if (target.import) {
        assert.ok(fs.existsSync(path.resolve(PKG_DIR, target.import)), `Missing ESM export ${target.import} for ${subpath}`);
      }
      if (target.types) {
        assert.ok(fs.existsSync(path.resolve(PKG_DIR, target.types)), `Missing types export ${target.types} for ${subpath}`);
      }
    }
  }
});

test('all 5 built nthgui ESM subpaths load cleanly and expose expected public APIs', async () => {
  const mainMod = await import(pathToFileURL(path.join(DIST_DIR, 'index.mjs')).href);
  for (const fnName of [
    'Button',
    'NothingButton',
    'Loader',
    'GlyphMatrix',
    'DotIcon',
    'InteractiveChartFrame',
    'InteractiveCoreCharts',
    'InteractiveSparklineStrip',
    'InteractiveRadarChart',
    'InteractivePieChart',
    'InteractiveTimeseriesChart',
    'InteractiveSankeyChart',
    'InteractiveMapChart',
    'InteractiveFlowChart',
    'InteractiveCustomChart',
    'CHART_PALETTES',
    'computeNiceDomain',
    'serializeChartCsv',
    'SearchBarWidget',
    'CalendarWidget',
    'AnalogClock',
    'AnalogClockWidget',
    'FlipClockWidget',
    'BinaryClockWidget',
    'WordClockWidget',
    'RadialClockWidget',
    'WorldClockDeckWidget',
    'StopwatchTimerWidget',
    'ClockStudioWidget',
    'PedometerRingWidget',
    'BatteryHealthHubWidget',
    'ScreenTimePulseWidget',
    'NetworkSpeedRadarWidget',
    'PodcastMiniPlayerWidget',
    'VoiceMemoTranscriberWidget',
    'PhotoFrameDitherWidget',
    'AgendaTickerWidget',
    'PomodoroFocusWidget',
    'QuickNotesPadWidget',
    'HabitMatrixTrackerWidget',
    'UnitFxConverterWidget',
  ]) {
    assert.ok(fnName in mainMod, `nthgui main export missing "${fnName}"`);
  }

  const nativeMod = await import(pathToFileURL(path.join(DIST_DIR, 'native.mjs')).href);
  assert.equal(typeof nativeMod.createNativeTheme, 'function');
  assert.equal(typeof nativeMod.buildNativeGlyphPoints, 'function');
  assert.equal(typeof nativeMod.getAllNativeSpecs, 'function');
  assert.equal(nativeMod.getAllNativeSpecs().length, 111);

  const glyphMod = await import(pathToFileURL(path.join(DIST_DIR, 'glyph.mjs')).href);
  assert.equal(typeof glyphMod.getPreset, 'function');
  assert.equal(glyphMod.countAddressable(25), 481);
  assert.equal(glyphMod.countAddressable(13), 121);

  const iconsMod = await import(pathToFileURL(path.join(DIST_DIR, 'icons.mjs')).href);
  assert.ok(iconsMod.DOT_ICON_NAMES.length >= 1600, `Expected >= 1600 icons, got ${iconsMod.DOT_ICON_NAMES.length}`);
  assert.equal(iconsMod.DOT_ICON_NAMES.length, 1691);
  assert.equal(iconsMod.resolveDotIconName('map-pin'), 'mappin');
  assert.equal(iconsMod.resolveDotIconName('activity-square'), 'square-activity');
  assert.equal(typeof iconsMod.getDotIconGrid, 'function');
  assert.equal(typeof iconsMod.resolveDotRadius, 'function');
  assert.equal(iconsMod.getDotIconGrid('wifi', { gridCols: 13, gridRows: 11 }).cols, 13);
  assert.equal(iconsMod.getDotIconGrid('alarm-clock').cols, 15);
  assert.equal(iconsMod.getDotIconGrid('alarm-clock').rowCount, 15);

  const tokensMod = await import(pathToFileURL(path.join(DIST_DIR, 'tokens.mjs')).href);
  assert.equal(typeof tokensMod.generateWebCss, 'function');
  assert.ok(tokensMod.generateWebCss().includes('--nt-accent'));

  const stylesCss = fs.readFileSync(path.join(DIST_DIR, 'styles.css'), 'utf8');
  assert.ok(stylesCss.includes('--nt-bg'));
  assert.ok(stylesCss.includes('nthgui/tokens'));
});

test('built nthgui CLI binary runs init, list, add (web & native), dry-run, overwrite, doctor, and error paths end-to-end', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nthgui-bin-e2e-'));
  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'test-consumer', dependencies: { react: '^19.0.0', vite: '^6.0.0' } }),
    );

    const runBin = (args: string[]) =>
      execFileSync(process.execPath, [CLI_BIN, ...args], {
        cwd: tmpDir,
        encoding: 'utf8',
      });

    // --help & --version
    const helpOut = runBin(['--help']);
    assert.ok(helpOut.includes('nthgui'));
    const versionOut = runBin(['--version']);
    assert.match(versionOut, /\d+\.\d+\.\d+/);

    // init
    const initOut = runBin(['init', '--framework', 'vite']);
    assert.ok(initOut.length > 0);
    assert.ok(fs.existsSync(path.join(tmpDir, 'components.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'src/styles/nothing-tokens.css')));

    // list
    const listOut = runBin(['list']);
    assert.ok(listOut.includes('timeseries'));
    assert.ok(listOut.includes('pie-chart'));
    assert.ok(listOut.includes('sankey'));

    // dry-run writes nothing
    runBin(['add', 'sankey', '--dry-run']);
    assert.equal(fs.existsSync(path.join(tmpDir, 'src/components/nthgui/sankey.tsx')), false);

    // add web components
    runBin(['add', 'button', 'timeseries', 'pie-chart']);
    const tsFile = path.join(tmpDir, 'src/components/nthgui/timeseries.tsx');
    assert.ok(fs.existsSync(tsFile));
    const tsCode = fs.readFileSync(tsFile, 'utf8');
    assert.ok(tsCode.includes('nthgui'));
    assert.ok(!tsCode.includes('@nothing-ui/'));

    // add native chart
    runBin(['add', 'timeseries', '--native']);
    const nativeTsFile = path.join(tmpDir, 'components/nthgui-native/timeseries.tsx');
    assert.ok(fs.existsSync(nativeTsFile));
    const nativeCode = fs.readFileSync(nativeTsFile, 'utf8');
    assert.ok(nativeCode.includes('nthgui/native'));
    assert.ok(nativeCode.includes('react-native-svg'));
    assert.ok(!nativeCode.includes('<div'));

    // overwrite flag succeeds
    runBin(['add', 'button', '--overwrite']);

    // doctor
    const doctorOut = runBin(['doctor']);
    assert.ok(doctorOut.length > 0);

    // unknown slug fails with non-zero exit code
    let threw = false;
    try {
      runBin(['add', 'does-not-exist-component']);
    } catch (err) {
      threw = true;
      const status = (err as { status?: number }).status;
      assert.notEqual(status, 0);
    }
    assert.equal(threw, true, 'Unknown component slug should exit with non-zero status');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('npm pack --dry-run on packages/nthgui produces clean publishable tarball without src/ or tests/', () => {
  const packOut = execFileSync('npm', ['pack', '--dry-run', '--json'], {
    cwd: PKG_DIR,
    encoding: 'utf8',
  });
  const parsed = JSON.parse(packOut) as Array<{
    name: string;
    files: Array<{ path: string }>;
  }>;
  assert.equal(parsed[0].name, 'nthgui');
  const filePaths = parsed[0].files.map((f) => f.path);

  for (const required of [
    'package.json',
    'README.md',
    'dist/cli.mjs',
    'dist/index.mjs',
    'dist/index.d.ts',
    'dist/native.mjs',
    'dist/glyph.mjs',
    'dist/icons.mjs',
    'dist/tokens.mjs',
    'dist/styles.css',
  ]) {
    assert.ok(filePaths.includes(required), `npm pack missing required file "${required}"`);
  }

  assert.ok(!filePaths.some((p) => p.startsWith('src/')), 'Tarball must not include internal src/');
  assert.ok(!filePaths.some((p) => p.startsWith('tests/')), 'Tarball must not include tests/');
});
