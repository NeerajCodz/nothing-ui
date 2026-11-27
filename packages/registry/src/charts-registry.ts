import { CHART_SLUGS } from './widgets';

export type ChartVisualizationKind =
  | 'cartesian'
  | 'circular'
  | 'radial'
  | 'relational'
  | 'spatial'
  | 'custom';

export type ChartEngine = 'recharts' | 'nthgui-svg';

export type ChartRegistryStatus = 'ready' | 'placeholder' | 'planned';

export interface ChartRegistryEntry {
  id: string;
  name: string;
  kind: ChartVisualizationKind;
  engine: ChartEngine;
  status: ChartRegistryStatus;
  responsive: boolean;
  catalogSlug: string;
  description: string;
  defaultHeight: number;
  supportedFeatures: string[];
}

export const CHART_VISUALIZATION_KINDS: readonly ChartVisualizationKind[] = [
  'cartesian',
  'circular',
  'radial',
  'relational',
  'spatial',
  'custom',
];

/**
 * Structured Data Visualization Component Registry powering the Charts section.
 * Maps both Recharts-powered responsive primitives and Nothing UI interactive SVG chart modules.
 */
export const CHART_REGISTRY: readonly ChartRegistryEntry[] = [
  {
    id: 'bar-chart-recharts',
    name: 'Responsive Bar Chart',
    kind: 'cartesian',
    engine: 'recharts',
    status: 'placeholder',
    responsive: true,
    catalogSlug: 'charts',
    description:
      'Responsive grouped and stacked bar chart placeholder built with Recharts and synchronized to Light, Dark, and High Contrast theme tokens.',
    defaultHeight: 320,
    supportedFeatures: ['ResponsiveContainer', 'Grouped / Stacked', 'Theme-Synced Tooltip', 'Signal Red Peak Accent'],
  },
  {
    id: 'bar-line-area-radial',
    name: 'Bar, Line, Area & Radial Suite',
    kind: 'cartesian',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'charts',
    description:
      'Multi-series Cartesian and radial suite with interactive legend toggles, floating crosshairs, custom hex palettes, and SVG/PNG/CSV export.',
    defaultHeight: 300,
    supportedFeatures: ['Magnetic Crosshairs', 'Series Legend Toggles', 'Custom Palettes', 'SVG/PNG/CSV Export'],
  },
  {
    id: 'timeseries',
    name: 'Timeseries Telemetry',
    kind: 'cartesian',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'timeseries',
    description:
      'Temporal multi-series chart with 1H/24H/7D/30D windows, drag-to-zoom brush scrubber, playhead, live streaming, and click-to-pin breakdowns.',
    defaultHeight: 300,
    supportedFeatures: ['Drag-to-Zoom Brush', 'Live Streaming', 'Playhead Scrubber', 'Click-to-Pin'],
  },
  {
    id: 'sparkline-strip',
    name: 'Sparkline Telemetry Strip',
    kind: 'cartesian',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'sparkline-strip',
    description:
      'Compact KPI inline trend sparklines with hover crosshair scrubbing, live telemetry tick mode, and delta readout.',
    defaultHeight: 160,
    supportedFeatures: ['Compact KPI Grid', 'Hover Inspection', 'Live Streaming', 'CSV Export'],
  },
  {
    id: 'pie-chart',
    name: 'Pie & Donut Chart',
    kind: 'circular',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'pie-chart',
    description:
      'Interactive proportional ring and pie chart with hover slice elevation, click-to-pin center readout, and configurable slice colors.',
    defaultHeight: 280,
    supportedFeatures: ['Donut & Pie Toggle', 'Interactive Slices', 'Custom Hex Colors', 'Export Suite'],
  },
  {
    id: 'radar-chart',
    name: 'Radar & Bar Matrix Chart',
    kind: 'radial',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'radar-chart',
    description:
      'Multi-axis spider radar and companion horizontal bar breakdown with vertex inspection and multi-series overlays.',
    defaultHeight: 300,
    supportedFeatures: ['Multi-Axis Polygon', 'Series Solo Mode', 'Vertex Tooltips', 'Custom Palettes'],
  },
  {
    id: 'sankey',
    name: 'Sankey Flow Diagram',
    kind: 'relational',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'sankey',
    description:
      'Proportional multi-stage ribbon diagram with path highlighting, node throughput readouts, and click-to-pin link inspection.',
    defaultHeight: 300,
    supportedFeatures: ['Proportional Ribbons', 'Node Highlighting', 'Pinned Flow Stats', 'SVG/PNG/CSV Export'],
  },
  {
    id: 'flow',
    name: 'Flow Node Graph',
    kind: 'relational',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'flow',
    description:
      'Directed node-and-edge topology graph with animated throughput edges, zoom/pan controls, and inspector drawer.',
    defaultHeight: 300,
    supportedFeatures: ['Directed Edges', 'Live Edge Pulses', 'Node Inspector', 'Custom Theme Colors'],
  },
  {
    id: 'map-chart',
    name: 'Map Chart (Dot Matrix Geo)',
    kind: 'spatial',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'map-chart',
    description:
      'Dot-matrix geographic telemetry map with regional markers, hover latency badges, and live node pulses.',
    defaultHeight: 300,
    supportedFeatures: ['Dot-Matrix Geography', 'Marker Tooltips', 'Live Node Telemetry', 'Export Suite'],
  },
  {
    id: 'custom-chart',
    name: 'Custom Composable Chart',
    kind: 'custom',
    engine: 'nthgui-svg',
    status: 'ready',
    responsive: true,
    catalogSlug: 'custom-chart',
    description:
      'Composable dual-encoding bars + trendline + threshold bands canvas for domain-specific telemetry dashboards.',
    defaultHeight: 300,
    supportedFeatures: ['Threshold Bands', 'Dual-Encoding Layers', 'Full Config Panel', 'SVG/PNG/CSV Export'],
  },
];

export function getChartRegistryEntry(id: string): ChartRegistryEntry | undefined {
  return CHART_REGISTRY.find((entry) => entry.id === id);
}

export function getChartRegistryByKind(kind: ChartVisualizationKind): ChartRegistryEntry[] {
  return CHART_REGISTRY.filter((entry) => entry.kind === kind);
}

export function filterChartRegistry(
  query: string,
  options?: {
    kind?: ChartVisualizationKind | 'all';
    engine?: ChartEngine | 'all';
  },
): ChartRegistryEntry[] {
  const q = query.trim().toLowerCase();
  return CHART_REGISTRY.filter((entry) => {
    if (options?.kind && options.kind !== 'all' && entry.kind !== options.kind) {
      return false;
    }
    if (options?.engine && options.engine !== 'all' && entry.engine !== options.engine) {
      return false;
    }
    if (!q) return true;
    return (
      entry.id.toLowerCase().includes(q) ||
      entry.name.toLowerCase().includes(q) ||
      entry.kind.toLowerCase().includes(q) ||
      entry.engine.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.supportedFeatures.some((f) => f.toLowerCase().includes(q))
    );
  });
}

export function validateChartRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seenIds = new Set<string>();

  for (const entry of CHART_REGISTRY) {
    if (seenIds.has(entry.id)) {
      errors.push(`Duplicate chart registry id: ${entry.id}`);
    }
    seenIds.add(entry.id);

    if (!CHART_SLUGS.has(entry.catalogSlug)) {
      errors.push(`Chart registry "${entry.id}" points to non-chart catalogSlug "${entry.catalogSlug}"`);
    }
    if (entry.supportedFeatures.length === 0) {
      errors.push(`Chart registry "${entry.id}" must declare at least one supported feature`);
    }
  }

  return { valid: errors.length === 0, errors };
}
