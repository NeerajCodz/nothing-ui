import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COMPONENT_LOADING_PROFILES,
  DEFAULT_LOADER_VARIANT,
  DEFAULT_LOADING_CONFIG,
  LOADER_VARIANTS,
  getComponentLoadingProfile,
  resolveLoaderVariant,
  resolveLoadingFlag,
} from './loading-logic';
import { CATALOG } from '../../../registry/src/catalog';

test('default loader variant is normal (not dotted)', () => {
  assert.equal(DEFAULT_LOADER_VARIANT, 'normal');
  assert.equal(DEFAULT_LOADING_CONFIG.variant, 'normal');
  assert.equal(resolveLoaderVariant(undefined, undefined), 'normal');
});

test('loader variant resolution respects prop > context > default precedence', () => {
  assert.equal(resolveLoaderVariant('bars', 'dots'), 'bars');
  assert.equal(resolveLoaderVariant(undefined, 'dots'), 'dots');
  assert.equal(resolveLoaderVariant(undefined, 'pulse'), 'pulse');
  assert.equal(resolveLoaderVariant(undefined, undefined), 'normal');
  assert.deepEqual([...LOADER_VARIANTS], ['normal', 'dots', 'bars', 'pulse']);
});

test('resolveLoadingFlag supports local loading and previewLoading override', () => {
  assert.equal(resolveLoadingFlag(true, false), true);
  assert.equal(resolveLoadingFlag(false, true), true);
  assert.equal(resolveLoadingFlag(undefined, true), true);
  assert.equal(resolveLoadingFlag(false, false), false);
  assert.equal(resolveLoadingFlag(undefined, false), false);
});

test('all 111 live catalog components have explicit loading archetype profiles', () => {
  assert.equal(CATALOG.length, 111);
  for (const entry of CATALOG) {
    const profile = COMPONENT_LOADING_PROFILES[entry.slug];
    assert.ok(profile, `Missing loading profile for catalog slug "${entry.slug}"`);
    assert.equal(profile.slug, entry.slug);
    assert.ok(profile.pendingCopy.length > 0, `Empty pendingCopy for "${entry.slug}"`);
    assert.ok(profile.triggerHint.length > 0, `Empty triggerHint for "${entry.slug}"`);
  }
  assert.equal(Object.keys(COMPONENT_LOADING_PROFILES).length, 111);
});

test('getComponentLoadingProfile returns graceful fallback for unknown slug', () => {
  const fallback = getComponentLoadingProfile('custom-future-widget');
  assert.equal(fallback.slug, 'custom-future-widget');
  assert.equal(fallback.archetype, 'async-action');
});
