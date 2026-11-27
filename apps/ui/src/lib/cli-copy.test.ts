import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildComponentAddCliCommand,
  formatCopiedToastPayload,
} from './cli-copy';

test('buildComponentAddCliCommand generates npx nthgui add <component> by default', () => {
  assert.equal(
    buildComponentAddCliCommand({ slug: 'button' }),
    'npx nthgui add button',
  );
  assert.equal(
    buildComponentAddCliCommand({ slug: '  glyph-matrix  ' }),
    'npx nthgui add glyph-matrix',
  );
  assert.equal(
    buildComponentAddCliCommand({ slug: '' }),
    'npx nthgui add button',
  );
});

test('buildComponentAddCliCommand supports --native flag and all package managers', () => {
  assert.equal(
    buildComponentAddCliCommand({ slug: 'glyph-matrix', native: true }),
    'npx nthgui add glyph-matrix --native',
  );
  assert.equal(
    buildComponentAddCliCommand({ slug: 'dot-icon', packageManager: 'bun' }),
    'bunx --bun nthgui add dot-icon',
  );
  assert.equal(
    buildComponentAddCliCommand({ slug: 'slider', packageManager: 'pnpm', native: true }),
    'pnpm dlx nthgui add slider --native',
  );
  assert.equal(
    buildComponentAddCliCommand({ slug: 'tabs', packageManager: 'yarn' }),
    'yarn dlx nthgui add tabs',
  );
});

test('formatCopiedToastPayload returns Copied! title with trimmed command description', () => {
  assert.deepEqual(
    formatCopiedToastPayload('  npx nthgui add button  '),
    {
      title: 'Copied!',
      description: 'npx nthgui add button',
    },
  );
});
