import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SHOWCASE_CATALOG,
  SHOWCASE_CATEGORIES,
  countShowcasesByKind,
  filterShowcaseItems,
} from './showcase';

test('SHOWCASE_CATALOG contains 10 unique items spanning blocks, widgets, and new templates', () => {
  assert.equal(SHOWCASE_CATALOG.length, 10);

  const ids = SHOWCASE_CATALOG.map((item) => item.id);
  assert.equal(new Set(ids).size, ids.length, 'Showcase IDs must be unique');

  const counts = countShowcasesByKind();
  assert.equal(counts.total, 10);
  assert.equal(counts.blocks, 5);
  assert.equal(counts.widgets, 1);
  assert.equal(counts.templates, 4);
});

test('every showcase snippet imports only from single published nthgui package subpaths', () => {
  for (const item of SHOWCASE_CATALOG) {
    assert.ok(
      item.code.includes('nthgui'),
      `Expected nthgui import in ${item.id}`,
    );
    assert.ok(
      !item.code.includes('@nothing-ui/') && !item.code.includes('"nothing-ui'),
      `Forbidden legacy nothing-ui import leaked in ${item.id}`,
    );
    assert.ok(item.includedSlugs.length >= 3, `Expected >=3 included slugs in ${item.id}`);
    assert.ok(
      SHOWCASE_CATEGORIES.includes(item.category),
      `Category ${item.category} missing from SHOWCASE_CATEGORIES`,
    );
  }
});

test('filterShowcaseItems filters accurately by category and search query', () => {
  const all = filterShowcaseItems('', 'All');
  assert.equal(all.length, 10);

  const hardware = filterShowcaseItems('', 'Hardware OS');
  assert.equal(hardware.length, 3);
  assert.ok(hardware.every((i) => i.category === 'Hardware OS'));

  const commerce = filterShowcaseItems('', 'Commerce & Pricing');
  assert.equal(commerce.length, 1);
  assert.equal(commerce[0].id, 'showcase-hardware-store');

  const byQuery = filterShowcaseItems('webhook', 'All');
  assert.equal(byQuery.length, 1);
  assert.equal(byQuery[0].id, 'showcase-developer-api');

  const bySlug = filterShowcaseItems('otp-input', 'All');
  assert.equal(bySlug.length, 1);
  assert.equal(bySlug[0].id, 'showcase-passkey-auth');
});
