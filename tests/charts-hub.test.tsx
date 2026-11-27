import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CHART_REGISTRY } from '@nothing-ui/registry';
import { ThemeProvider, useTheme } from '@nothing-ui/ui';
import { ChartsHub } from '@apps/ui/components/charts/charts-hub';
import { BarChartTooltip } from '@apps/ui/components/charts/bar-chart-tooltip';

function ThemeControlStrip() {
  const { setTheme } = useTheme();
  return (
    <div>
      <button type="button" onClick={() => setTheme('light')}>
        Switch Light
      </button>
      <button type="button" onClick={() => setTheme('high-contrast')}>
        Switch HC
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        Switch Dark
      </button>
    </div>
  );
}

describe('ChartsHub & RechartsBarPlaceholder', () => {
  it('renders the responsive Recharts bar chart placeholder, switches datasets/layout, and syncs live ThemeProvider state', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeControlStrip />
        <ChartsHub onSelectChart={vi.fn()} />
      </ThemeProvider>,
    );

    const demo = screen.getByTestId('recharts-bar-placeholder');
    expect(demo).toHaveAttribute('data-chart-theme', 'dark');
    expect(within(demo).getByRole('heading', { level: 3, name: /Responsive Bar Chart — Throughput/i })).toBeInTheDocument();

    // Recharts ResponsiveContainer mounts an SVG chart surface cleanly
    expect(demo.querySelector('.recharts-responsive-container')).toBeTruthy();

    // Switch dataset to P95 Latency and layout to Stacked
    const datasetGroup = within(demo).getByRole('group', { name: 'Bar chart dataset' });
    await user.click(within(datasetGroup).getByRole('button', { name: 'P95 Latency' }));
    expect(within(datasetGroup).getByRole('button', { name: 'P95 Latency' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(demo).getByRole('heading', { level: 3, name: /Responsive Bar Chart — P95 Latency/i })).toBeInTheDocument();

    const layoutGroup = within(demo).getByRole('group', { name: 'Bar chart layout mode' });
    await user.click(within(layoutGroup).getByRole('button', { name: 'stacked' }));
    expect(within(layoutGroup).getByRole('button', { name: 'stacked' })).toHaveAttribute('aria-pressed', 'true');

    // Theme context updates propagate immediately to ChartsHub & RechartsBarPlaceholder
    await user.click(screen.getByRole('button', { name: 'Switch Light' }));
    expect(demo).toHaveAttribute('data-chart-theme', 'light');
    expect(screen.getByTestId('charts-hub')).toHaveTextContent('Active Theme: light');

    await user.click(screen.getByRole('button', { name: 'Switch HC' }));
    expect(demo).toHaveAttribute('data-chart-theme', 'high-contrast');
    expect(screen.getByTestId('charts-hub')).toHaveTextContent('Active Theme: high-contrast');
  });

  it('lists all registered charts, supports engine/kind/search filters, and opens the selected catalog slug', async () => {
    const user = userEvent.setup();
    const onSelectChart = vi.fn();

    render(
      <ThemeProvider defaultTheme="dark">
        <ChartsHub onSelectChart={onSelectChart} />
      </ThemeProvider>,
    );

    const grid = screen.getByTestId('chart-registry-grid');
    expect(within(grid).getAllByRole('button')).toHaveLength(CHART_REGISTRY.length);

    // Filter by engine: Recharts -> only bar-chart-recharts
    const engineGroup = screen.getByRole('group', { name: 'Filter chart registry by engine' });
    await user.click(within(engineGroup).getByRole('button', { name: 'Recharts' }));
    expect(within(screen.getByTestId('chart-registry-grid')).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('chart-registry-card-bar-chart-recharts')).toBeInTheDocument();

    // Reset to All Engines and filter by visualization kind: Spatial
    await user.click(within(engineGroup).getByRole('button', { name: 'All Engines' }));
    const kindGroup = screen.getByRole('group', { name: 'Filter chart registry by visualization kind' });
    await user.click(within(kindGroup).getByRole('button', { name: /Spatial \(1\)/i }));
    expect(within(screen.getByTestId('chart-registry-grid')).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('chart-registry-card-map-chart')).toBeInTheDocument();

    // Clicking a registry card calls onSelectChart with its catalogSlug
    await user.click(screen.getByTestId('chart-registry-card-map-chart'));
    expect(onSelectChart).toHaveBeenCalledWith('map-chart');

    // Reset kind filter to All and verify search + empty state
    await user.click(within(kindGroup).getByRole('button', { name: new RegExp(`All \\(${CHART_REGISTRY.length}\\)`) }));
    const searchInput = screen.getByLabelText('Search chart registry');
    await user.type(searchInput, 'sankey');
    expect(within(screen.getByTestId('chart-registry-grid')).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByTestId('chart-registry-card-sankey')).toBeInTheDocument();

    await user.clear(searchInput);
    await user.type(searchInput, 'no-such-chart-999');
    expect(screen.getByText(/No registered charts match the current search or filter/i)).toBeInTheDocument();
  });

  it('toggles individual bar chart series via BarSeriesLegend, updates peak KPI, handles empty state, and restores all', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="dark">
        <ChartsHub onSelectChart={vi.fn()} />
      </ThemeProvider>,
    );

    const legend = screen.getByTestId('bar-series-legend');
    const webToggle = within(legend).getByTestId('bar-legend-toggle-web');
    const nativeToggle = within(legend).getByTestId('bar-legend-toggle-native');

    expect(webToggle).toHaveAttribute('aria-pressed', 'true');
    expect(nativeToggle).toHaveAttribute('aria-pressed', 'true');
    expect(legend).toHaveTextContent('2/2 visible');
    expect(within(legend).queryByTestId('bar-legend-show-all')).not.toBeInTheDocument();
    expect(screen.getByTestId('recharts-peak-kpi')).toHaveTextContent('Fri · 780 req/s');

    // Hide primary (Web) series -> Peak KPI switches to Native peak (Fri · 620 req/s) and Show all appears
    await user.click(webToggle);
    expect(webToggle).toHaveAttribute('aria-pressed', 'false');
    expect(webToggle).toHaveAttribute('data-series-visible', 'false');
    expect(nativeToggle).toHaveAttribute('aria-pressed', 'true');
    expect(legend).toHaveTextContent('1/2 visible');
    expect(within(legend).getByTestId('bar-legend-show-all')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-peak-kpi')).toHaveTextContent('Fri · 620 req/s');

    // Hide secondary (Native) series as well -> Empty state renders with Restore button
    await user.click(nativeToggle);
    expect(nativeToggle).toHaveAttribute('aria-pressed', 'false');
    expect(legend).toHaveTextContent('0/2 visible');
    expect(screen.getByTestId('recharts-peak-kpi')).toHaveTextContent('None visible');
    const emptyState = screen.getByTestId('recharts-bar-empty');
    expect(emptyState).toHaveTextContent('All data series are hidden');

    // Restore via empty state button
    await user.click(within(emptyState).getByRole('button', { name: 'Restore all series' }));
    expect(webToggle).toHaveAttribute('aria-pressed', 'true');
    expect(nativeToggle).toHaveAttribute('aria-pressed', 'true');
    expect(legend).toHaveTextContent('2/2 visible');
    expect(screen.queryByTestId('recharts-bar-empty')).not.toBeInTheDocument();
    expect(screen.getByTestId('recharts-peak-kpi')).toHaveTextContent('Fri · 780 req/s');

    // Hide one series, then restore via legend Show all button
    await user.click(nativeToggle);
    expect(legend).toHaveTextContent('1/2 visible');
    await user.click(within(legend).getByTestId('bar-legend-show-all'));
    expect(nativeToggle).toHaveAttribute('aria-pressed', 'true');
    expect(legend).toHaveTextContent('2/2 visible');

    // Switching dataset updates legend labels cleanly
    const demo = screen.getByTestId('recharts-bar-placeholder');
    await user.click(within(demo).getByRole('button', { name: 'P95 Latency' }));
    expect(webToggle).toHaveTextContent('Edge Cache');
    expect(nativeToggle).toHaveTextContent('Origin API');
  });

  it('renders interactive BarChartTooltip with precise hovered bar value, peak badge, share, and combined total', () => {
    const sampleData = [
      { period: 'Mon', web: 420, native: 310 },
      { period: 'Fri', web: 780, native: 620 },
    ];
    const themeStyles = {
      bg: '#0D0D0D',
      border: '#2E2E2E',
      text: '#FFFFFF',
      muted: '#A3A3A3',
      divider: '#222222',
      highlightBg: 'rgba(255,255,255,0.08)',
      peakAccent: '#D71921',
    };

    const { rerender } = render(
      <BarChartTooltip
        active={true}
        label="Fri"
        data={sampleData}
        visibility={{ web: true, native: true }}
        layoutMode="grouped"
        hoveredSeriesKey="web"
        peak={{ index: 1, period: 'Fri', value: 780, highlightSeries: 'web' }}
        labels={{ web: 'Web (nthgui)', native: 'Native (RN)' }}
        colors={{ web: '#F5F5F5', native: '#5C5C5C' }}
        unit="req/s"
        themeStyles={themeStyles}
      />,
    );

    const tooltip = screen.getByTestId('bar-chart-tooltip');
    expect(tooltip).toHaveAttribute('data-period', 'Fri');
    expect(tooltip).toHaveAttribute('data-focused-series', 'web');
    expect(screen.getByTestId('bar-tooltip-peak-badge')).toHaveTextContent('PEAK');
    expect(screen.getByTestId('bar-tooltip-focused-value')).toHaveTextContent('780 req/s');
    expect(screen.getByTestId('bar-tooltip-focused-meta')).toHaveTextContent('+30.0% vs avg');
    expect(screen.getByTestId('bar-tooltip-focused-meta')).toHaveTextContent('55.7% share');
    expect(screen.getByTestId('bar-tooltip-row-web')).toHaveTextContent('780 req/s');
    expect(screen.getByTestId('bar-tooltip-row-native')).toHaveTextContent('620 req/s');
    expect(screen.getByTestId('bar-tooltip-combined-total')).toHaveTextContent('1,400 req/s');

    // Hovering the Native bar on Fri switches spotlight to 620 req/s and removes PEAK badge
    rerender(
      <BarChartTooltip
        active={true}
        label="Fri"
        data={sampleData}
        visibility={{ web: true, native: true }}
        layoutMode="grouped"
        hoveredSeriesKey="native"
        peak={{ index: 1, period: 'Fri', value: 780, highlightSeries: 'web' }}
        labels={{ web: 'Web (nthgui)', native: 'Native (RN)' }}
        colors={{ web: '#F5F5F5', native: '#5C5C5C' }}
        unit="req/s"
        themeStyles={themeStyles}
      />,
    );
    expect(screen.getByTestId('bar-chart-tooltip')).toHaveAttribute('data-focused-series', 'native');
    expect(screen.queryByTestId('bar-tooltip-peak-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('bar-tooltip-focused-value')).toHaveTextContent('620 req/s');

    // Inactive tooltip renders nothing
    rerender(
      <BarChartTooltip
        active={false}
        label="Fri"
        data={sampleData}
        visibility={{ web: true, native: true }}
        layoutMode="grouped"
        hoveredSeriesKey={null}
        peak={null}
        labels={{ web: 'Web (nthgui)', native: 'Native (RN)' }}
        colors={{ web: '#F5F5F5', native: '#5C5C5C' }}
        unit="req/s"
        themeStyles={themeStyles}
      />,
    );
    expect(screen.queryByTestId('bar-chart-tooltip')).not.toBeInTheDocument();
  });

  it('supports mouse-wheel zoom, zoom/pan controls, double-click reset, and resets zoom on dataset switch', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="dark">
        <ChartsHub onSelectChart={vi.fn()} />
      </ThemeProvider>,
    );

    const demo = screen.getByTestId('recharts-bar-placeholder');
    const canvas = screen.getByTestId('recharts-bar-canvas');
    const zoomControls = screen.getByTestId('bar-zoom-controls');

    // Initial full range: Mon – Sun (7/7 intervals, 1.0×)
    expect(demo).toHaveAttribute('data-zoomed', 'false');
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('Mon – Sun');
    expect(within(zoomControls).getByTestId('bar-zoom-window-count')).toHaveTextContent('7/7 intervals');
    expect(within(zoomControls).getByTestId('bar-zoom-multiplier')).toHaveTextContent('1.0×');
    expect(within(zoomControls).queryByTestId('bar-zoom-reset')).not.toBeInTheDocument();

    // Give the jsdom canvas realistic bounds so center wheel zoom focuses at 0.5 (Tue – Sat)
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 600,
      height: 300,
      right: 600,
      bottom: 300,
      toJSON: () => ({}),
    });

    // Mouse wheel up over canvas zooms in cleanly (7 -> 5 intervals: Tue – Sat)
    fireEvent.wheel(canvas, { deltaY: -120, clientX: 300 });
    expect(demo).toHaveAttribute('data-zoomed', 'true');
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('Tue – Sat');
    expect(within(zoomControls).getByTestId('bar-zoom-window-count')).toHaveTextContent('5/7 intervals');
    expect(within(zoomControls).getByTestId('bar-zoom-multiplier')).toHaveTextContent('1.4×');
    expect(within(zoomControls).getByTestId('bar-mode-pan')).toHaveAttribute('aria-pressed', 'true');
    expect(within(zoomControls).getByTestId('bar-zoom-reset')).toBeInTheDocument();

    // Pan left & right shift the visible range while keeping 5 intervals
    await user.click(within(zoomControls).getByTestId('bar-pan-left'));
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('Mon – Fri');
    await user.click(within(zoomControls).getByTestId('bar-pan-right'));
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('Tue – Sat');

    // Zoom in button shrinks window further (5 -> 4 intervals), double-click canvas resets to full 7/7 range
    await user.click(within(zoomControls).getByTestId('bar-zoom-in'));
    expect(within(zoomControls).getByTestId('bar-zoom-window-count')).toHaveTextContent('4/7 intervals');

    fireEvent.doubleClick(canvas);
    expect(demo).toHaveAttribute('data-zoomed', 'false');
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('Mon – Sun');
    expect(within(zoomControls).getByTestId('bar-zoom-window-count')).toHaveTextContent('7/7 intervals');

    // Zoom in again and switch dataset -> cleanly resets to full range of new dataset (W1 – W7)
    await user.click(within(zoomControls).getByTestId('bar-zoom-in'));
    expect(demo).toHaveAttribute('data-zoomed', 'true');
    await user.click(within(demo).getByRole('button', { name: 'CLI Installs' }));
    expect(demo).toHaveAttribute('data-zoomed', 'false');
    expect(within(zoomControls).getByTestId('bar-zoom-range-label')).toHaveTextContent('W1 – W7');
  });

  it('snaps magnetic crosshairs to the nearest data point on hover, clears on leave, and supports toggle', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="dark">
        <ChartsHub onSelectChart={vi.fn()} />
      </ThemeProvider>,
    );

    const canvas = screen.getByTestId('recharts-bar-canvas');
    const toggle = screen.getByTestId('bar-crosshair-toggle');

    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    expect(canvas).toHaveAttribute('data-crosshair-enabled', 'true');
    expect(screen.queryByTestId('bar-crosshair-readout')).not.toBeInTheDocument();

    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 792,
      height: 322,
      right: 792,
      bottom: 322,
      toJSON: () => ({}),
    });

    // Hover near Fri (index 4 of 7 -> plotLeft=60, plotWidth=700 -> x ≈ 60 + 4.5/7*700 = 510)
    // High pointer Y (near top -> y ≈ 35 => ~777 req/s) snaps magnetically to Web (780 req/s)
    fireEvent.pointerMove(canvas, { clientX: 510, clientY: 35 });
    expect(canvas).toHaveAttribute('data-crosshair-period', 'Fri');
    expect(canvas).toHaveAttribute('data-crosshair-value', '780');
    const readout = screen.getByTestId('bar-crosshair-readout');
    expect(readout).toHaveTextContent('Fri');
    expect(readout).toHaveTextContent('Web (nthgui)');
    expect(readout).toHaveTextContent('780 req/s');

    // Moving pointer lower on the same Fri column (y ≈ 115 => ~510 req/s) snaps magnetically to Native (620 req/s)
    fireEvent.pointerMove(canvas, { clientX: 510, clientY: 115 });
    expect(canvas).toHaveAttribute('data-crosshair-period', 'Fri');
    expect(canvas).toHaveAttribute('data-crosshair-value', '620');
    expect(screen.getByTestId('bar-crosshair-readout')).toHaveTextContent('Native (RN)');
    expect(screen.getByTestId('bar-crosshair-readout')).toHaveTextContent('620 req/s');

    // Leaving the chart canvas clears the snapped crosshair cleanly
    fireEvent.pointerLeave(canvas);
    expect(screen.queryByTestId('bar-crosshair-readout')).not.toBeInTheDocument();
    expect(canvas).toHaveAttribute('data-crosshair-period', '');

    // Disabling magnetic snap prevents hover crosshair activation until re-enabled
    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    fireEvent.pointerMove(canvas, { clientX: 510, clientY: 35 });
    expect(screen.queryByTestId('bar-crosshair-readout')).not.toBeInTheDocument();
  });
});
