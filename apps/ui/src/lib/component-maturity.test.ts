import test from 'node:test';
import assert from 'node:assert/strict';
import { getMaturityMeta, resolveComponentMaturity } from './component-maturity';

test('resolveComponentMaturity maps stable, beta, alpha, deprecated, and planned to Nothing UI color tokens', () => {
  const stable = resolveComponentMaturity({ slug: 'button', web: 'stable' });
  assert.equal(stable.level, 'stable');
  assert.equal(stable.label, 'Stable');
  assert.equal(stable.colorToken, '--nt-success');
  assert.equal(stable.advisory, null);

  const alpha = resolveComponentMaturity({ slug: 'custom-chart', web: 'stable' });
  assert.equal(alpha.level, 'alpha');
  assert.equal(alpha.label, 'Alpha');
  assert.equal(alpha.colorToken, '--nt-warning');
  assert.ok(alpha.advisory && alpha.advisory.includes('Alpha'));

  const beta = resolveComponentMaturity({ slug: 'calendar-canvas', web: 'stable' });
  assert.equal(beta.level, 'beta');
  assert.equal(beta.label, 'Beta');
  assert.equal(beta.colorToken, '--nt-display');

  const liveDeprecated = resolveComponentMaturity({ slug: 'native-select', web: 'stable' });
  assert.equal(liveDeprecated.level, 'deprecated');
  assert.equal(liveDeprecated.label, 'Deprecated');
  assert.equal(liveDeprecated.colorToken, '--nt-danger');
  assert.ok(liveDeprecated.advisory && liveDeprecated.advisory.includes('Deprecated'));

  const deprecatedOverride = resolveComponentMaturity(
    { slug: 'button', web: 'stable' },
    'deprecated',
  );
  assert.equal(deprecatedOverride.level, 'deprecated');
  assert.equal(deprecatedOverride.colorToken, '--nt-danger');

  const explicitEntry = resolveComponentMaturity({
    slug: 'button',
    web: 'stable',
    maturity: 'alpha',
  });
  assert.equal(explicitEntry.level, 'alpha');

  const planned = getMaturityMeta('planned');
  assert.equal(planned.colorToken, '--nt-muted');
});
