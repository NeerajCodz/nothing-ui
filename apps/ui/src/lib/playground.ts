export type PlaygroundControl =
  | {
      name: string;
      label: string;
      kind: 'select';
      options: readonly string[];
      defaultValue: string;
    }
  | {
      name: string;
      label: string;
      kind: 'boolean';
      defaultValue: boolean;
    }
  | {
      name: string;
      label: string;
      kind: 'number';
      min: number;
      max: number;
      step?: number;
      defaultValue: number;
    }
  | {
      name: string;
      label: string;
      kind: 'text';
      defaultValue: string;
    };

export interface PlaygroundSchema {
  slug: string;
  componentName: string;
  importPath: 'nthgui' | 'nthgui/icons' | 'nthgui/glyph';
  childrenProp?: string;
  controls: readonly PlaygroundControl[];
}

export type PlaygroundState = Record<string, string | boolean | number>;

export const PLAYGROUND_SCHEMAS: Record<string, PlaygroundSchema> = {
  button: {
    slug: 'button',
    componentName: 'Button',
    importPath: 'nthgui',
    childrenProp: 'label',
    controls: [
      { name: 'label', label: 'Label', kind: 'text', defaultValue: 'Deploy Firmware' },
      { name: 'variant', label: 'Variant', kind: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'signal', 'link'], defaultValue: 'primary' },
      { name: 'size', label: 'Size', kind: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md' },
      { name: 'shape', label: 'Shape', kind: 'select', options: ['rounded', 'pill', 'square'], defaultValue: 'rounded' },
      { name: 'loading', label: 'Loading', kind: 'boolean', defaultValue: false },
      { name: 'loaderVariant', label: 'Loader Style', kind: 'select', options: ['normal', 'dots', 'bars', 'pulse'], defaultValue: 'normal' },
      { name: 'loadingPosition', label: 'Loader Position', kind: 'select', options: ['start', 'end', 'replace'], defaultValue: 'start' },
      { name: 'loadingText', label: 'Loading Text', kind: 'text', defaultValue: 'Deploying...' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', defaultValue: false },
    ],
  },
  'glyph-matrix': {
    slug: 'glyph-matrix',
    componentName: 'GlyphMatrix',
    importPath: 'nthgui/glyph',
    controls: [
      { name: 'resolution', label: 'Resolution', kind: 'select', options: ['25', '13'], defaultValue: '25' },
      { name: 'preset', label: 'Preset', kind: 'select', options: ['power', 'play', 'heart', 'live', 'arrow', 'sound', 'smiley', 'plus'], defaultValue: 'power' },
      { name: 'paintState', label: 'Paint Tone', kind: 'select', options: ['on', 'signal', 'off'], defaultValue: 'signal' },
      { name: 'size', label: 'Size (px)', kind: 'number', min: 120, max: 260, step: 20, defaultValue: 180 },
      { name: 'interactive', label: 'Interactive', kind: 'boolean', defaultValue: true },
    ],
  },
  'dot-icon': {
    slug: 'dot-icon',
    componentName: 'DotIcon',
    importPath: 'nthgui/icons',
    controls: [
      { name: 'name', label: 'Icon Name', kind: 'select', options: ['wifi', 'bluetooth', 'bolt', 'earbuds', 'cpu', 'terminal', 'rocket', 'heart', 'bell', 'search', 'gear', 'mappin', 'shield-check'], defaultValue: 'wifi' },
      { name: 'size', label: 'Size (px)', kind: 'number', min: 16, max: 80, step: 4, defaultValue: 40 },
      { name: 'dotScale', label: 'Dot Scale', kind: 'number', min: 0.3, max: 1.15, step: 0.05, defaultValue: 0.78 },
      { name: 'dotGap', label: 'Dot Gap', kind: 'number', min: 0, max: 0.4, step: 0.05, defaultValue: 0 },
      { name: 'dotShape', label: 'Dot Shape', kind: 'select', options: ['circle', 'rounded', 'square', 'diamond'], defaultValue: 'circle' },
      { name: 'gridCols', label: 'Grid Cols', kind: 'number', min: 5, max: 25, step: 1, defaultValue: 9 },
      { name: 'gridRows', label: 'Grid Rows', kind: 'number', min: 5, max: 25, step: 1, defaultValue: 9 },
      { name: 'gridMode', label: 'Grid Mode', kind: 'select', options: ['scale', 'center'], defaultValue: 'scale' },
      { name: 'showGrid', label: 'Show Matrix Grid', kind: 'boolean', defaultValue: false },
      { name: 'signal', label: 'Signal Red', kind: 'boolean', defaultValue: false },
    ],
  },
  switch: {
    slug: 'switch',
    componentName: 'NothingSwitch',
    importPath: 'nthgui',
    controls: [
      { name: 'label', label: 'Label', kind: 'text', defaultValue: 'Glyph Matrix Sync' },
      { name: 'tone', label: 'Tone', kind: 'select', options: ['default', 'signal'], defaultValue: 'signal' },
      { name: 'checked', label: 'Checked', kind: 'boolean', defaultValue: true },
      { name: 'loading', label: 'Loading', kind: 'boolean', defaultValue: false },
      { name: 'loaderVariant', label: 'Loader Style', kind: 'select', options: ['normal', 'dots', 'bars', 'pulse'], defaultValue: 'normal' },
      { name: 'disabled', label: 'Disabled', kind: 'boolean', defaultValue: false },
    ],
  },
  slider: {
    slug: 'slider',
    componentName: 'NothingSlider',
    importPath: 'nthgui',
    controls: [
      { name: 'label', label: 'Label', kind: 'text', defaultValue: 'Matrix Brightness' },
      { name: 'value', label: 'Value', kind: 'number', min: 0, max: 100, step: 5, defaultValue: 70 },
      { name: 'unit', label: 'Unit', kind: 'text', defaultValue: '%' },
      { name: 'loading', label: 'Loading', kind: 'boolean', defaultValue: false },
    ],
  },
  'dot-text': {
    slug: 'dot-text',
    componentName: 'DotProgress',
    importPath: 'nthgui',
    controls: [
      { name: 'label', label: 'Label', kind: 'text', defaultValue: 'FIRMWARE FLASH' },
      { name: 'value', label: 'Progress (%)', kind: 'number', min: 0, max: 100, step: 5, defaultValue: 68 },
      { name: 'dots', label: 'Dot Count', kind: 'number', min: 8, max: 24, step: 2, defaultValue: 16 },
      { name: 'signal', label: 'Signal Red', kind: 'boolean', defaultValue: true },
      { name: 'loading', label: 'Indeterminate Loading', kind: 'boolean', defaultValue: false },
    ],
  },
  'hardware-kit': {
    slug: 'hardware-kit',
    componentName: 'SignalMeter',
    importPath: 'nthgui',
    controls: [
      { name: 'label', label: 'Label', kind: 'text', defaultValue: '5G ULTRA' },
      { name: 'strength', label: 'Bars', kind: 'number', min: 0, max: 5, step: 1, defaultValue: 4 },
      { name: 'cadence', label: 'LED Cadence', kind: 'select', options: ['steady', 'pulse'], defaultValue: 'pulse' },
      { name: 'loading', label: 'Scanning', kind: 'boolean', defaultValue: false },
      { name: 'loaderVariant', label: 'Loader Style', kind: 'select', options: ['normal', 'dots', 'bars', 'pulse'], defaultValue: 'normal' },
    ],
  },
  charts: {
    slug: 'charts',
    componentName: 'InteractiveCoreCharts',
    importPath: 'nthgui',
    controls: [
      { name: 'mode', label: 'Chart Mode', kind: 'select', options: ['bar', 'line', 'radial'], defaultValue: 'bar' },
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'curve', label: 'Curve', kind: 'select', options: ['smooth', 'linear', 'step'], defaultValue: 'smooth' },
      { name: 'stacked', label: 'Stacked Bars', kind: 'boolean', defaultValue: false },
      { name: 'strokeWidth', label: 'Stroke Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'fillOpacity', label: 'Fill Opacity', kind: 'number', min: 0, max: 0.6, step: 0.05, defaultValue: 0.16 },
      { name: 'showGrid', label: 'Gridlines', kind: 'boolean', defaultValue: true },
      { name: 'showLabels', label: 'Data Labels', kind: 'boolean', defaultValue: false },
      { name: 'showArea', label: 'Area Fill', kind: 'boolean', defaultValue: true },
      { name: 'showThreshold', label: 'Threshold Line', kind: 'boolean', defaultValue: false },
      { name: 'thresholdValue', label: 'Threshold Value', kind: 'number', min: 20, max: 140, step: 5, defaultValue: 90 },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
  'sparkline-strip': {
    slug: 'sparkline-strip',
    componentName: 'InteractiveSparklineStrip',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'curve', label: 'Curve', kind: 'select', options: ['smooth', 'linear', 'step'], defaultValue: 'smooth' },
      { name: 'strokeWidth', label: 'Stroke Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'fillOpacity', label: 'Fill Opacity', kind: 'number', min: 0, max: 0.6, step: 0.05, defaultValue: 0.16 },
      { name: 'dotSize', label: 'Marker Size', kind: 'number', min: 0, max: 6, step: 0.5, defaultValue: 3.5 },
      { name: 'showArea', label: 'Area Fill', kind: 'boolean', defaultValue: true },
      { name: 'showGrid', label: 'Gridlines', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
  'radar-chart': {
    slug: 'radar-chart',
    componentName: 'InteractiveRadarChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'rings', label: 'Calibration Rings', kind: 'number', min: 2, max: 6, step: 1, defaultValue: 4 },
      { name: 'strokeWidth', label: 'Stroke Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'fillOpacity', label: 'Polygon Fill', kind: 'number', min: 0.05, max: 0.55, step: 0.05, defaultValue: 0.22 },
      { name: 'dotSize', label: 'Vertex Dot', kind: 'number', min: 2, max: 6, step: 0.5, defaultValue: 3.5 },
      { name: 'showLabels', label: 'Axis Labels', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
  'pie-chart': {
    slug: 'pie-chart',
    componentName: 'InteractivePieChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'innerRadiusRatio', label: 'Donut Ratio', kind: 'number', min: 0, max: 0.8, step: 0.05, defaultValue: 0.58 },
      { name: 'padAngle', label: 'Slice Gap (deg)', kind: 'number', min: 0, max: 8, step: 1, defaultValue: 2 },
      { name: 'halfDonut', label: 'Half-Donut Gauge', kind: 'boolean', defaultValue: false },
      { name: 'showLabels', label: 'Slice Labels', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
  timeseries: {
    slug: 'timeseries',
    componentName: 'InteractiveTimeseriesChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'curve', label: 'Curve', kind: 'select', options: ['smooth', 'linear', 'step'], defaultValue: 'smooth' },
      { name: 'strokeWidth', label: 'Stroke Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'fillOpacity', label: 'Area Opacity', kind: 'number', min: 0, max: 0.6, step: 0.05, defaultValue: 0.16 },
      { name: 'dotSize', label: 'Marker Size', kind: 'number', min: 0, max: 6, step: 0.5, defaultValue: 3.5 },
      { name: 'showGrid', label: 'Gridlines', kind: 'boolean', defaultValue: true },
      { name: 'showArea', label: 'Area Fill', kind: 'boolean', defaultValue: true },
      { name: 'showThreshold', label: 'SLA Threshold', kind: 'boolean', defaultValue: true },
      { name: 'thresholdValue', label: 'Threshold Value', kind: 'number', min: 30, max: 110, step: 5, defaultValue: 75 },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
  sankey: {
    slug: 'sankey',
    componentName: 'InteractiveSankeyChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'fillOpacity', label: 'Ribbon Opacity', kind: 'number', min: 0.1, max: 0.9, step: 0.05, defaultValue: 0.35 },
      { name: 'showLabels', label: 'Stage Labels', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Load', kind: 'boolean', defaultValue: false },
    ],
  },
  'map-chart': {
    slug: 'map-chart',
    componentName: 'InteractiveMapChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'dotSize', label: 'Node Radius', kind: 'number', min: 2, max: 7, step: 0.5, defaultValue: 4 },
      { name: 'strokeWidth', label: 'Route Width', kind: 'number', min: 1, max: 3.5, step: 0.5, defaultValue: 1.5 },
      { name: 'showLabels', label: 'Region Codes', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Pings', kind: 'boolean', defaultValue: false },
    ],
  },
  flow: {
    slug: 'flow',
    componentName: 'InteractiveFlowChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'strokeWidth', label: 'Edge Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'showLabels', label: 'Throughput Labels', kind: 'boolean', defaultValue: true },
      { name: 'defaultLive', label: 'Live Packets', kind: 'boolean', defaultValue: true },
    ],
  },
  'custom-chart': {
    slug: 'custom-chart',
    componentName: 'InteractiveCustomChart',
    importPath: 'nthgui',
    controls: [
      { name: 'palette', label: 'Color Palette', kind: 'select', options: ['monochrome', 'signal', 'spectral', 'ocean', 'amber', 'high-contrast'], defaultValue: 'monochrome' },
      { name: 'curve', label: 'Curve', kind: 'select', options: ['smooth', 'linear', 'step'], defaultValue: 'smooth' },
      { name: 'strokeWidth', label: 'Stroke Width', kind: 'number', min: 1, max: 4, step: 0.5, defaultValue: 2 },
      { name: 'fillOpacity', label: 'Fill Opacity', kind: 'number', min: 0.05, max: 0.6, step: 0.05, defaultValue: 0.18 },
      { name: 'dotSize', label: 'Dot Radius', kind: 'number', min: 2, max: 7, step: 0.5, defaultValue: 4 },
      { name: 'showGrid', label: 'Gridlines', kind: 'boolean', defaultValue: true },
      { name: 'showLabels', label: 'Data Labels', kind: 'boolean', defaultValue: false },
      { name: 'showThreshold', label: 'Threshold Line', kind: 'boolean', defaultValue: true },
      { name: 'thresholdValue', label: 'Threshold Value', kind: 'number', min: 20, max: 100, step: 5, defaultValue: 78 },
      { name: 'defaultLive', label: 'Live Stream', kind: 'boolean', defaultValue: false },
    ],
  },
};

export function getInitialPlaygroundState(schema: PlaygroundSchema): PlaygroundState {
  const state: PlaygroundState = {};
  for (const ctrl of schema.controls) {
    state[ctrl.name] = ctrl.defaultValue;
  }
  return state;
}

export function serializeJsxProps(
  schema: PlaygroundSchema,
  state: PlaygroundState,
): string {
  const props: string[] = [];

  for (const ctrl of schema.controls) {
    if (schema.childrenProp && ctrl.name === schema.childrenProp) continue;
    const val = state[ctrl.name];
    if (val === undefined) continue;

    if (ctrl.name === 'signal' && schema.slug === 'dot-icon') {
      if (val === true) props.push('color="#D71921"');
      continue;
    }

    if (ctrl.name === 'resolution' && schema.slug === 'glyph-matrix') {
      props.push(`resolution={${val}}`);
      continue;
    }

    if (typeof val === 'boolean') {
      if (val) props.push(ctrl.name);
      else if (ctrl.defaultValue === true) props.push(`${ctrl.name}={false}`);
    } else if (typeof val === 'number') {
      props.push(`${ctrl.name}={${val}}`);
    } else if (typeof val === 'string' && val.length > 0) {
      props.push(`${ctrl.name}="${val.replace(/"/g, '&quot;')}"`);
    }
  }

  return props.join(' ');
}

export function buildPlaygroundSnippet(
  schema: PlaygroundSchema,
  state: PlaygroundState,
): string {
  const serializedProps = serializeJsxProps(schema, state);
  const propChunk = serializedProps ? ` ${serializedProps}` : '';
  const childText = schema.childrenProp ? String(state[schema.childrenProp] ?? '') : null;

  const element =
    childText !== null
      ? `<${schema.componentName}${propChunk}>\n      ${childText}\n    </${schema.componentName}>`
      : `<${schema.componentName}${propChunk} />`;

  return `import { ${schema.componentName} } from "${schema.importPath}";\n\nexport function Example() {\n  return (\n    ${element}\n  );\n}`;
}
