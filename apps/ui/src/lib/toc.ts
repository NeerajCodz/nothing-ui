import type { AppSection } from '../components/layout/site-header';
import type { DocsHubTab } from '../components/layout/search-dialog';
import { SHOWCASE_CATALOG } from './showcase';

export interface TocItem {
  id: string;
  label: string;
  level?: 2 | 3;
}

export interface TocSectionPosition {
  id: string;
  top: number;
}

/**
 * Pure scroll-spy solver: returns the id of the active section given each
 * heading's viewport-relative top offset (`getBoundingClientRect().top`).
 */
export function resolveActiveTocId(
  positions: readonly TocSectionPosition[],
  options?: {
    activationOffset?: number;
    isNearBottom?: boolean;
  },
): string | null {
  if (positions.length === 0) return null;
  if (options?.isNearBottom) {
    return positions[positions.length - 1].id;
  }

  const threshold = options?.activationOffset ?? 128;
  let activeId = positions[0].id;

  for (const pos of positions) {
    if (pos.top <= threshold) {
      activeId = pos.id;
    } else {
      break;
    }
  }

  return activeId;
}

/**
 * Builds the deterministic On-Page Table of Contents items for the active route/tab.
 */
export function getTocItemsForView({
  section,
  docsTab,
  hasRelatedComponents = true,
  hasPlayground = false,
}: {
  section: AppSection;
  docsTab: DocsHubTab;
  hasRelatedComponents?: boolean;
  hasPlayground?: boolean;
}): TocItem[] {
  if (section === 'overview') {
    return [
      { id: 'ov-intro', label: 'Introduction', level: 2 },
      { id: 'ov-glyph', label: 'Glyph Matrix Core', level: 3 },
      { id: 'ov-proof', label: 'Live Library Proof', level: 2 },
      { id: 'ov-catalog', label: 'Shipped Catalog', level: 2 },
    ];
  }

  if (section === 'charts') {
    return [
      { id: 'charts-header', label: 'Nothing UI Charts', level: 2 },
      { id: 'charts-bar-demo', label: 'Recharts Bar Chart', level: 2 },
      { id: 'charts-registry', label: 'Visualization Registry', level: 2 },
    ];
  }

  if (section === 'widgets') {
    return [
      { id: 'widgets-header', label: 'Nothing UI Widgets', level: 2 },
      { id: 'widgets-pillars', label: '3-Track Architecture', level: 2 },
      { id: 'widgets-live', label: 'Shipped Live Widgets', level: 2 },
      { id: 'widgets-roadmap', label: 'Roadmap Complete (100%)', level: 2 },
    ];
  }

  if (section === 'showcase') {
    return [
      { id: 'showcase-header', label: 'Nothing UI Showcase', level: 2 },
      { id: 'showcase-filter', label: 'Filter & Categories', level: 3 },
      ...SHOWCASE_CATALOG.map((item) => ({
        id: item.id,
        label: item.shortLabel,
        level: 2 as const,
      })),
    ];
  }

  if (section === 'components') {
    const items: TocItem[] = [
      { id: 'comp-overview', label: 'Overview', level: 2 },
      { id: 'comp-preview', label: 'Interactive Preview', level: 2 },
    ];
    if (hasPlayground) {
      items.push({ id: 'comp-playground', label: 'Props Playground', level: 2 });
    }
    items.push(
      { id: 'comp-installation', label: 'Installation (nthgui)', level: 2 },
      { id: 'comp-api', label: 'API Reference', level: 2 },
      { id: 'comp-props', label: 'Props Table', level: 3 },
      { id: 'comp-a11y', label: 'Keyboard & Accessibility', level: 2 },
    );
    if (hasRelatedComponents) {
      items.push({ id: 'comp-related', label: 'Related Components', level: 2 });
    }
    return items;
  }

  if (section === 'studio') {
    return [
      { id: 'studio-header', label: 'Studio Controls', level: 2 },
      { id: 'studio-tools', label: 'Tools & Presets', level: 2 },
      { id: 'studio-canvas', label: 'Editable Matrix', level: 2 },
      { id: 'studio-timeline', label: 'Frame Timeline', level: 3 },
      { id: 'studio-export', label: 'JSON & SVG Export', level: 2 },
    ];
  }

  if (section === 'icons') {
    return [
      { id: 'icons-header', label: 'Dot Icon Package', level: 2 },
      { id: 'icons-controls', label: 'Grid & Dot Controls', level: 2 },
      { id: 'icons-grid', label: '1,691-Icon Directory', level: 2 },
      { id: 'icons-inspector', label: 'Matrix Editor & Export', level: 2 },
    ];
  }

  // section === 'docs'
  if (docsTab === 'cli') {
    return [
      { id: 'docs-header', label: 'Architecture Hub', level: 2 },
      { id: 'cli-single-package', label: 'Single Package (nthgui)', level: 2 },
      { id: 'cli-quick-copy', label: 'Copy CLI Command', level: 2 },
      { id: 'cli-simulator', label: 'CLI Dry-Run Planner', level: 2 },
      { id: 'cli-subpaths', label: 'Subpath Exports', level: 2 },
    ];
  }

  if (docsTab === 'native') {
    return [
      { id: 'docs-header', label: 'Architecture Hub', level: 2 },
      { id: 'native-compat', label: 'Platform Compatibility', level: 2 },
      { id: 'native-preview', label: 'All 111 Native Modules', level: 2 },
      { id: 'native-matrix', label: 'Full 111-Module Matrix', level: 2 },
    ];
  }

  if (docsTab === 'tokens') {
    return [
      { id: 'docs-header', label: 'Architecture Hub', level: 2 },
      { id: 'tokens-mode', label: 'Live Theme Customizer', level: 2 },
      { id: 'tokens-swatches', label: 'Live Preview & Swatches', level: 3 },
      { id: 'tokens-output', label: 'CSS & JSON Export', level: 2 },
    ];
  }

  if (docsTab === 'roadmap') {
    return [
      { id: 'docs-header', label: 'Architecture Hub', level: 2 },
      { id: 'roadmap-summary', label: 'Inventory Counters', level: 2 },
      { id: 'roadmap-filters', label: 'Track & Status Filter', level: 3 },
      { id: 'roadmap-families', label: '16 Component Families', level: 2 },
    ];
  }

  return [
    { id: 'docs-header', label: 'Architecture Hub', level: 2 },
    { id: 'changelog-v04', label: 'v0.4.0 Complete 136/136 Parity', level: 2 },
    { id: 'changelog-v03', label: 'v0.3.0 Full React Native Parity', level: 2 },
    { id: 'changelog-v02', label: 'v0.2.0 Single-Package & Blocks', level: 2 },
    { id: 'changelog-v01', label: 'v0.1.0-alpha.1', level: 2 },
  ];
}
