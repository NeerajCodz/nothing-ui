import { describe, expect, it } from 'vitest';
import { CATALOG } from '@nothing-ui/registry';
import { getTocItemsForView, resolveActiveTocId } from '@apps/ui/lib/toc';
import { hasPropsPlayground } from '@apps/ui/components/playground/props-playground';
import type { AppSection } from '@apps/ui/components/layout/site-header';
import type { DocsHubTab } from '@apps/ui/components/layout/search-dialog';

describe('Layout TOC & scroll-spy logic', () => {
  it('generates deterministic, unique-id TOC entries for every top-level AppSection', () => {
    const sections: AppSection[] = [
      'overview',
      'components',
      'charts',
      'widgets',
      'docs',
      'icons',
      'studio',
      'showcase',
    ];

    for (const section of sections) {
      const items = getTocItemsForView({
        section,
        docsTab: 'cli',
        hasRelatedComponents: true,
        hasPlayground: true,
      });

      expect(items.length).toBeGreaterThan(0);
      const ids = items.map((item) => item.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const item of items) {
        expect(item.label.trim().length).toBeGreaterThan(0);
      }
    }

    const chartsToc = getTocItemsForView({ section: 'charts', docsTab: 'cli' });
    expect(chartsToc.map((i) => i.id)).toEqual(['charts-header', 'charts-bar-demo', 'charts-registry']);
  });

  it('dynamically includes or omits Playground and Related sections on the Components route', () => {
    const full = getTocItemsForView({
      section: 'components',
      docsTab: 'cli',
      hasPlayground: true,
      hasRelatedComponents: true,
    });
    expect(full.some((item) => item.id === 'comp-playground')).toBe(true);
    expect(full.some((item) => item.id === 'comp-related')).toBe(true);

    const minimal = getTocItemsForView({
      section: 'components',
      docsTab: 'cli',
      hasPlayground: false,
      hasRelatedComponents: false,
    });
    expect(minimal.some((item) => item.id === 'comp-playground')).toBe(false);
    expect(minimal.some((item) => item.id === 'comp-related')).toBe(false);
    expect(minimal.map((item) => item.id)).toContain('comp-installation');
    expect(minimal.map((item) => item.id)).toContain('comp-a11y');
  });

  it('produces distinct TOC maps for all 5 DocsHub tabs', () => {
    const tabs: DocsHubTab[] = ['cli', 'native', 'tokens', 'roadmap', 'changelog'];
    const signatures = new Set<string>();

    for (const docsTab of tabs) {
      const items = getTocItemsForView({ section: 'docs', docsTab });
      expect(items[0]?.id).toBe('docs-header');
      expect(items.length).toBeGreaterThanOrEqual(4);
      signatures.add(items.map((item) => item.id).join(','));
    }

    expect(signatures.size).toBe(tabs.length);
  });

  it('resolves active scroll-spy heading accurately across scroll positions and bottom clamp', () => {
    expect(resolveActiveTocId([])).toBeNull();

    const positions = [
      { id: 'intro', top: -240 },
      { id: 'preview', top: 48 },
      { id: 'install', top: 128 },
      { id: 'api', top: 410 },
    ];

    // Exact boundary (top <= activationOffset 128) activates 'install'
    expect(resolveActiveTocId(positions, { activationOffset: 128 })).toBe('install');

    // Stricter threshold activates 'preview'
    expect(resolveActiveTocId(positions, { activationOffset: 80 })).toBe('preview');

    // When all headings are below viewport threshold, falls back to first heading
    const belowFold = [
      { id: 'first', top: 300 },
      { id: 'second', top: 640 },
    ];
    expect(resolveActiveTocId(belowFold, { activationOffset: 128 })).toBe('first');

    // Near bottom of document always locks to the final heading
    expect(resolveActiveTocId(positions, { activationOffset: 128, isNearBottom: true })).toBe('api');
  });

  it('registers interactive Props Playground schemas for core widgets and all 9 chart modules', () => {
    const requiredPlaygrounds = [
      'button',
      'glyph-matrix',
      'dot-icon',
      'switch',
      'slider',
      'charts',
      'sparkline-strip',
      'radar-chart',
      'pie-chart',
      'timeseries',
      'sankey',
      'map-chart',
      'flow',
      'custom-chart',
    ];

    for (const slug of requiredPlaygrounds) {
      expect(hasPropsPlayground(slug)).toBe(true);
      expect(CATALOG.some((entry) => entry.slug === slug)).toBe(true);
    }

    expect(hasPropsPlayground('nonexistent-widget-xyz')).toBe(false);
  });
});
