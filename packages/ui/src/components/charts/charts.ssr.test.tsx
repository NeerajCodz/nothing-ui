import assert from 'node:assert/strict';
import test from 'node:test';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  InteractiveCoreCharts,
  InteractiveCustomChart,
  InteractiveFlowChart,
  InteractiveMapChart,
  InteractivePieChart,
  InteractiveRadarChart,
  InteractiveSankeyChart,
  InteractiveSparklineStrip,
  InteractiveTimeseriesChart,
} from '../../index';

const CHART_CASES: Array<{ name: string; element: React.ReactElement }> = [
  { name: 'InteractiveCoreCharts (bar)', element: React.createElement(InteractiveCoreCharts, { mode: 'bar', palette: 'monochrome', defaultConfigOpen: true }) },
  { name: 'InteractiveCoreCharts (line + threshold)', element: React.createElement(InteractiveCoreCharts, { mode: 'line', curve: 'step', showThreshold: true, thresholdValue: 85, palette: 'spectral' }) },
  { name: 'InteractiveCoreCharts (radial)', element: React.createElement(InteractiveCoreCharts, { mode: 'radial', palette: 'signal' }) },
  { name: 'InteractiveSparklineStrip', element: React.createElement(InteractiveSparklineStrip, { palette: 'ocean', curve: 'smooth', defaultConfigOpen: true }) },
  { name: 'InteractiveRadarChart', element: React.createElement(InteractiveRadarChart, { rings: 5, palette: 'amber', defaultConfigOpen: true }) },
  { name: 'InteractivePieChart (donut)', element: React.createElement(InteractivePieChart, { innerRadiusRatio: 0.58, padAngle: 2, defaultConfigOpen: true }) },
  { name: 'InteractivePieChart (halfDonut solid)', element: React.createElement(InteractivePieChart, { innerRadiusRatio: 0, halfDonut: true, palette: 'high-contrast' }) },
  { name: 'InteractiveTimeseriesChart', element: React.createElement(InteractiveTimeseriesChart, { showThreshold: true, thresholdValue: 75, curve: 'linear', defaultConfigOpen: true }) },
  { name: 'InteractiveSankeyChart', element: React.createElement(InteractiveSankeyChart, { palette: 'spectral', defaultConfigOpen: true }) },
  { name: 'InteractiveMapChart', element: React.createElement(InteractiveMapChart, { dotSize: 4.5, strokeWidth: 2, defaultConfigOpen: true }) },
  { name: 'InteractiveFlowChart', element: React.createElement(InteractiveFlowChart, { defaultLive: true, showLabels: true, defaultConfigOpen: true }) },
  { name: 'InteractiveCustomChart', element: React.createElement(InteractiveCustomChart, { showThreshold: true, thresholdValue: 78, palette: 'signal', defaultConfigOpen: true }) },
];

test('all 9 interactive charts SSR render cleanly with zero NaN attributes and full controls', () => {
  for (const tc of CHART_CASES) {
    const html = renderToStaticMarkup(tc.element);
    assert.ok(html.length > 500, `${tc.name} rendered unexpectedly short markup`);
    assert.ok(html.includes('<svg'), `${tc.name} must render vector SVG`);
    assert.ok(!html.includes('NaN'), `${tc.name} must never emit NaN into rendered HTML or SVG attributes`);
    assert.ok(!html.includes('Infinity'), `${tc.name} must never emit Infinity into SVG attributes`);
    assert.ok(html.includes('Customize'), `${tc.name} must include Customize config panel trigger`);
    assert.ok(html.includes('Export'), `${tc.name} must include Export toolbar button`);
    assert.ok(html.includes('tabular-nums'), `${tc.name} must use tabular numerals for readouts`);
  }
});

test('open Config Panel renders native hex color pickers and all palette presets', () => {
  const html = renderToStaticMarkup(
    React.createElement(InteractiveTimeseriesChart, { defaultConfigOpen: true, palette: 'spectral' }),
  );
  assert.ok(html.includes('type="color"'), 'Config panel must render native hex color pickers');
  for (const presetLabel of ['OLED Mono', 'Signal Red', 'Spectral', 'Cyan / Mint', 'Warm Amber', 'AAA Contrast']) {
    assert.ok(html.includes(presetLabel), `Config panel missing palette preset "${presetLabel}"`);
  }
  assert.ok(html.includes('Solo'), 'Interactive legend must render Solo isolation buttons');
});
