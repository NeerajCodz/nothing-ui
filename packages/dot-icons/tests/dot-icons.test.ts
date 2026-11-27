import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DOT_ICON_ALIASES,
  DOT_ICON_BITMAPS,
  DOT_ICON_CATEGORIES,
  DOT_ICON_LIST,
  DOT_ICON_METADATA,
  DOT_ICON_NAMES,
  LUCIDE_DIRECTORY_ALIAS_SOURCE_COUNT,
  LUCIDE_DIRECTORY_SOURCE_COUNT,
  LUCIDE_DOT_GRID_SIZE,
  LUCIDE_DOT_ICON_NAMES,
  NOTHING_ORIGINAL_ICON_NAMES,
  buildDotIconNativeSnippet,
  buildDotIconReactSnippet,
  clearDotGrid,
  computeSvgDimensions,
  decodeDotBitmap,
  dotIconToSvgString,
  encodeDotBitmap,
  getDotIconCells,
  getDotIconGrid,
  getDotIconPoints,
  invertDotGrid,
  resampleDotBitmap,
  resolveDotIconName,
  resolveDotRadius,
  searchDotIcons,
  toggleDotGridCell,
  validateDotIconBitmaps,
  type DotIconName,
} from '../src/index';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../..');

test('all 1,691 canonical dot icon bitmaps pass strict validation across all 9 categories', () => {
  const result = validateDotIconBitmaps();
  assert.equal(result.valid, true, `Validation errors:\n${result.errors.join('\n')}`);
  assert.equal(NOTHING_ORIGINAL_ICON_NAMES.length, 247);
  assert.equal(LUCIDE_DOT_ICON_NAMES.length, 1444);
  assert.equal(DOT_ICON_NAMES.length, 1691);
  assert.equal(Object.keys(DOT_ICON_BITMAPS).length, DOT_ICON_NAMES.length);
  assert.equal(DOT_ICON_LIST.length, DOT_ICON_NAMES.length);
  assert.equal(DOT_ICON_CATEGORIES.length, 9);
  assert.ok(Object.keys(DOT_ICON_ALIASES).length >= 216);

  for (const cat of DOT_ICON_CATEGORIES) {
    const count = DOT_ICON_LIST.filter((i) => i.category === cat).length;
    assert.ok(count >= 10, `Category "${cat}" should have substantial coverage (>= 10 icons), got ${count}`);
  }
});

test('bit-packing bitmap codec round-trips 9x9, 15x15, and non-square grids losslessly', () => {
  const samples = [
    DOT_ICON_BITMAPS.wifi,
    DOT_ICON_BITMAPS['alarm-clock'],
    ['#.#.#', '.#.#.', '#...#'],
  ];
  for (const rows of samples) {
    const encoded = encodeDotBitmap(rows);
    const decoded = decodeDotBitmap(encoded, rows[0].length, rows.length);
    assert.deepEqual(decoded, rows);
  }
});

test('100% of official lucide-react directory icons and aliases resolve end-to-end to valid dot icons', () => {
  const lucideIconsDir = path.join(REPO_ROOT, 'node_modules/lucide-react/dist/esm/icons');
  const files = fs
    .readdirSync(lucideIconsDir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => f.slice(0, -3))
    .sort();

  assert.equal(
    files.length,
    LUCIDE_DIRECTORY_SOURCE_COUNT + LUCIDE_DIRECTORY_ALIAS_SOURCE_COUNT,
    'Lucide directory file count matches generator metadata',
  );

  for (const lucideName of files) {
    const iconName = lucideName as DotIconName;
    const canonical = resolveDotIconName(iconName);
    assert.ok(
      canonical in DOT_ICON_BITMAPS,
      `Lucide icon "${lucideName}" resolved to missing canonical "${canonical}"`,
    );
    const grid = getDotIconGrid(iconName);
    assert.ok(grid.cols === 9 || grid.cols === LUCIDE_DOT_GRID_SIZE);
    assert.ok(
      grid.rows.some((r) => r.includes('#')),
      `Lucide icon "${lucideName}" rendered zero lit dots`,
    );
  }

  // Verify representative Lucide icons render valid 15x15 SVG output and resample cleanly
  const alarmGrid = getDotIconGrid('alarm-clock');
  assert.equal(alarmGrid.cols, 15);
  assert.equal(alarmGrid.rowCount, 15);
  assert.equal(DOT_ICON_METADATA['alarm-clock'].source, 'lucide');
  assert.equal(DOT_ICON_METADATA['alarm-clock'].nativeGridSize, 15);

  const alarmDown9 = getDotIconGrid('alarm-clock', { gridSize: 9 });
  assert.equal(alarmDown9.cols, 9);
  assert.equal(alarmDown9.rowCount, 9);
  assert.ok(alarmDown9.rows.some((r) => r.includes('#')));

  const alarmUp21 = getDotIconGrid('alarm-clock', { gridSize: 21 });
  assert.equal(alarmUp21.cols, 21);
  assert.equal(alarmUp21.rowCount, 21);

  const alarmSvg = dotIconToSvgString('alarm-clock', { size: 32, color: '#D71921' });
  assert.ok(alarmSvg.includes('viewBox="0 0 15 15"'));
  assert.ok(alarmSvg.includes('fill="#D71921"'));
});

test('aliases (Nothing + Lucide) resolve cleanly and support source-filtered search', () => {
  assert.equal(resolveDotIconName('map-pin'), 'mappin');
  assert.equal(resolveDotIconName('mappin'), 'mappin');
  assert.equal(resolveDotIconName('settings'), 'gear');
  assert.equal(resolveDotIconName('x'), 'close');
  assert.equal(resolveDotIconName('delete'), 'trash');
  assert.equal(resolveDotIconName('arrow-right'), 'right');
  assert.equal(resolveDotIconName('activity-square'), 'square-activity');
  assert.equal(resolveDotIconName('edit-2'), 'pen');

  const matches = searchDotIcons('map-pin');
  assert.ok(matches.some((m) => m.id === 'mappin'));

  const lucideAliasMatches = searchDotIcons('activity-square');
  assert.equal(lucideAliasMatches[0]?.id, 'square-activity');

  const onlyNothing = searchDotIcons('', 'All', 'nothing');
  assert.equal(onlyNothing.length, 247);
  assert.ok(onlyNothing.every((m) => m.source === 'nothing'));

  const onlyLucide = searchDotIcons('', 'All', 'lucide');
  assert.equal(onlyLucide.length, 1444);
  assert.ok(onlyLucide.every((m) => m.source === 'lucide'));
});

test('resolveDotRadius supports dotScale, dotGap, and explicit dotRadius override', () => {
  assert.equal(resolveDotRadius(), 0.39);
  assert.equal(resolveDotRadius({ dotScale: 1.0 }), 0.5);
  assert.equal(resolveDotRadius({ dotScale: 0.5 }), 0.25);
  assert.equal(resolveDotRadius({ dotScale: 1.0, dotGap: 0.2 }), 0.4);
  assert.equal(resolveDotRadius({ dotRadius: 0.33, dotScale: 1.0 }), 0.33);
  assert.equal(resolveDotRadius({ dotScale: 99 }), 0.58);
  assert.equal(resolveDotRadius({ dotScale: 0.01 }), 0.1);
});

test('configurable dot grid supports square presets, non-square cols/rows, scale/center modes, and padding', () => {
  const scaled15 = getDotIconGrid('wifi', { gridSize: 15, gridMode: 'scale' });
  assert.equal(scaled15.cols, 15);
  assert.equal(scaled15.rowCount, 15);
  assert.equal(scaled15.rows.length, 15);
  assert.ok(scaled15.rows.every((r) => r.length === 15));
  assert.ok(getDotIconPoints('wifi', { gridSize: 15 }).length > getDotIconPoints('wifi').length);

  const nonSquare = getDotIconGrid('right', { gridCols: 15, gridRows: 9, gridMode: 'scale' });
  assert.equal(nonSquare.cols, 15);
  assert.equal(nonSquare.rowCount, 9);
  assert.equal(nonSquare.rows.length, 9);
  assert.ok(nonSquare.rows.every((r) => r.length === 15));

  const centered = getDotIconGrid('heart', { gridSize: 13, gridMode: 'center' });
  assert.equal(centered.cols, 13);
  assert.equal(centered.rowCount, 13);
  // Outer border rows in center mode on 13x13 for a 9x9 icon must be empty
  assert.equal(centered.rows[0], '.'.repeat(13));
  assert.equal(centered.rows[12], '.'.repeat(13));

  const padded = getDotIconGrid('bolt', { gridSize: 13, gridMode: 'scale', gridPadding: 2 });
  assert.equal(padded.rows[0], '.'.repeat(13));
  assert.equal(padded.rows[1], '.'.repeat(13));
  assert.equal(padded.rows[11], '.'.repeat(13));
  assert.equal(padded.rows[12], '.'.repeat(13));

  // Downscaling to 7x7 still keeps lit dots intact
  const down7 = resampleDotBitmap(DOT_ICON_BITMAPS.wifi, 7, 7, 'scale', 0);
  assert.equal(down7.length, 7);
  assert.ok(down7.some((row) => row.includes('#')));
});

test('interactive grid helpers toggle, invert, clear, and pass custom grid through renderer', () => {
  const empty = clearDotGrid(7, 5);
  assert.equal(empty.length, 5);
  assert.equal(empty[0].length, 7);
  assert.ok(empty.every((r) => r === '.......'));

  const toggled = toggleDotGridCell(empty, 3, 2);
  assert.equal(toggled[2][3], '#');
  assert.equal(toggleDotGridCell(toggled, 3, 2)[2][3], '.');

  const inverted = invertDotGrid(toggled);
  assert.equal(inverted[2][3], '.');
  assert.equal(inverted[0][0], '#');

  const cells = getDotIconCells('wifi', { grid: toggled });
  assert.equal(cells.cols, 7);
  assert.equal(cells.rows, 5);
  assert.equal(cells.cells.filter((c) => c.lit).length, 1);
});

test('dotIconToSvgString and code snippets reflect custom grid, dotScale, dotShape, color, and showGrid', () => {
  const dims = computeSvgDimensions(48, 16, 8);
  assert.deepEqual(dims, { width: 48, height: 24 });

  const svg = dotIconToSvgString('bolt', {
    size: 40,
    color: '#D71921',
    dotScale: 0.9,
    dotShape: 'rounded',
    gridCols: 13,
    gridRows: 11,
    showGrid: true,
  });
  assert.ok(svg.includes('viewBox="0 0 13 11"'));
  assert.ok(svg.includes('<rect '));
  assert.ok(svg.includes('fill="#D71921"'));
  assert.ok(svg.includes('opacity="0.14"'));

  const diamondSvg = dotIconToSvgString('star', { dotShape: 'diamond', gridSize: 9 });
  assert.ok(diamondSvg.includes('<polygon '));

  const reactSnippet = buildDotIconReactSnippet('wifi', {
    size: 32,
    color: '#D71921',
    dotScale: 0.85,
    dotShape: 'square',
    gridSize: 13,
    showGrid: true,
  });
  assert.ok(reactSnippet.includes('gridSize={13}'));
  assert.ok(reactSnippet.includes('dotScale={0.85}'));
  assert.ok(reactSnippet.includes('dotShape="square"'));
  assert.ok(reactSnippet.includes('showGrid'));

  const nativeSnippet = buildDotIconNativeSnippet('wifi', 28);
  assert.ok(nativeSnippet.includes('nthgui/native'));
  assert.ok(nativeSnippet.includes('size={28}'));
});
