import * as React from 'react';
import { ArrowCounterClockwise, Check, Copy, SlidersHorizontal } from '@phosphor-icons/react';
import type { DotIconCanonicalName } from '@nothing-ui/dot-icons';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import type { GlyphPresetId, GlyphResolution } from '@nothing-ui/core';
import {
  Button,
  DotProgress,
  GlyphMatrix,
  InteractiveCoreCharts,
  InteractiveCustomChart,
  InteractiveFlowChart,
  InteractiveMapChart,
  InteractivePieChart,
  InteractiveRadarChart,
  InteractiveSankeyChart,
  InteractiveSparklineStrip,
  InteractiveTimeseriesChart,
  LEDIndicator,
  NothingSlider,
  NothingSwitch,
  SignalMeter,
  cn,
  type ChartCurveMode,
  type ChartPaletteId,
} from '@nothing-ui/ui';
import {
  PLAYGROUND_SCHEMAS,
  buildPlaygroundSnippet,
  getInitialPlaygroundState,
  type PlaygroundSchema,
  type PlaygroundState,
} from '../../lib/playground';

export function hasPropsPlayground(slug: string): boolean {
  return slug in PLAYGROUND_SCHEMAS;
}

function renderLivePreview(schema: PlaygroundSchema, state: PlaygroundState, setState: React.Dispatch<React.SetStateAction<PlaygroundState>>) {
  switch (schema.slug) {
    case 'button':
      return (
        <Button
          variant={state.variant as 'primary' | 'secondary' | 'outline' | 'ghost' | 'signal' | 'link'}
          size={state.size as 'sm' | 'md' | 'lg'}
          shape={state.shape as 'rounded' | 'pill' | 'square'}
          loading={Boolean(state.loading)}
          loaderVariant={state.loaderVariant as 'normal' | 'dots' | 'bars' | 'pulse'}
          loadingPosition={state.loadingPosition as 'start' | 'end' | 'replace'}
          loadingText={String(state.loadingText ?? '') || undefined}
          disabled={Boolean(state.disabled)}
        >
          {String(state.label ?? 'Action')}
        </Button>
      );
    case 'glyph-matrix':
      return (
        <GlyphMatrix
          key={`${state.resolution}-${state.preset}`}
          resolution={Number(state.resolution) as GlyphResolution}
          preset={state.preset as GlyphPresetId}
          paintState={state.paintState as 'on' | 'signal' | 'off'}
          size={Number(state.size)}
          interactive={Boolean(state.interactive)}
          label="Props playground Glyph Matrix"
        />
      );
    case 'dot-icon':
      return (
        <div className="flex flex-col items-center gap-3">
          <DotIcon
            name={state.name as DotIconCanonicalName}
            size={Number(state.size)}
            dotScale={Number(state.dotScale)}
            dotGap={Number(state.dotGap)}
            dotShape={state.dotShape as 'circle' | 'rounded' | 'square' | 'diamond'}
            gridCols={Number(state.gridCols)}
            gridRows={Number(state.gridRows)}
            gridMode={state.gridMode as 'scale' | 'center'}
            showGrid={Boolean(state.showGrid)}
            color={Boolean(state.signal) ? '#D71921' : 'currentColor'}
          />
          <span className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
            {String(state.name)} · {Number(state.size)}px · {Number(state.gridCols)}×{Number(state.gridRows)} · scale {Number(state.dotScale).toFixed(2)}×
          </span>
        </div>
      );
    case 'switch':
      return (
        <NothingSwitch
          label={String(state.label)}
          tone={state.tone as 'default' | 'signal'}
          checked={Boolean(state.checked)}
          loading={Boolean(state.loading)}
          loaderVariant={state.loaderVariant as 'normal' | 'dots' | 'bars' | 'pulse'}
          disabled={Boolean(state.disabled)}
          onCheckedChange={(checked) => setState((prev) => ({ ...prev, checked }))}
        />
      );
    case 'slider':
      return (
        <div className="w-full max-w-xs">
          <NothingSlider
            label={String(state.label)}
            value={Number(state.value)}
            unit={String(state.unit)}
            loading={Boolean(state.loading)}
            onValueChange={(value) => setState((prev) => ({ ...prev, value }))}
          />
        </div>
      );
    case 'dot-text':
      return (
        <div className="w-full max-w-xs space-y-2">
          <DotProgress
            label={String(state.label ?? 'PROGRESS')}
            value={Number(state.value)}
            dots={Number(state.dots)}
            signal={Boolean(state.signal)}
            loading={Boolean(state.loading)}
          />
          <div className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
            {Boolean(state.loading)
              ? `Indeterminate sweep across ${Number(state.dots)} LED cells`
              : `${Number(state.value)}% across ${Number(state.dots)} LED cells`}
          </div>
        </div>
      );
    case 'hardware-kit':
      return (
        <div className="flex flex-wrap items-center justify-center gap-6">
          <SignalMeter
            label={String(state.label)}
            strength={Number(state.strength)}
            loading={Boolean(state.loading)}
            loaderVariant={state.loaderVariant as 'normal' | 'dots' | 'bars' | 'pulse'}
          />
          <LEDIndicator
            tone="signal"
            cadence={state.cadence === 'steady' ? 'steady' : 'pulse'}
            loading={Boolean(state.loading)}
            loaderVariant={state.loaderVariant as 'normal' | 'dots' | 'bars' | 'pulse'}
            label={String(state.cadence).toUpperCase()}
          />
        </div>
      );
    case 'charts':
      return (
        <div className="w-full">
          <InteractiveCoreCharts
            mode={state.mode as 'bar' | 'line' | 'radial'}
            stacked={Boolean(state.stacked)}
            palette={state.palette as ChartPaletteId}
            curve={state.curve as ChartCurveMode}
            strokeWidth={Number(state.strokeWidth)}
            fillOpacity={Number(state.fillOpacity)}
            showGrid={Boolean(state.showGrid)}
            showLabels={Boolean(state.showLabels)}
            showArea={Boolean(state.showArea)}
            showThreshold={Boolean(state.showThreshold)}
            thresholdValue={Number(state.thresholdValue)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'sparkline-strip':
      return (
        <div className="w-full">
          <InteractiveSparklineStrip
            palette={state.palette as ChartPaletteId}
            curve={state.curve as ChartCurveMode}
            strokeWidth={Number(state.strokeWidth)}
            fillOpacity={Number(state.fillOpacity)}
            dotSize={Number(state.dotSize)}
            showArea={Boolean(state.showArea)}
            showGrid={Boolean(state.showGrid)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'radar-chart':
      return (
        <div className="w-full">
          <InteractiveRadarChart
            palette={state.palette as ChartPaletteId}
            rings={Number(state.rings)}
            strokeWidth={Number(state.strokeWidth)}
            fillOpacity={Number(state.fillOpacity)}
            dotSize={Number(state.dotSize)}
            showLabels={Boolean(state.showLabels)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'pie-chart':
      return (
        <div className="w-full">
          <InteractivePieChart
            palette={state.palette as ChartPaletteId}
            innerRadiusRatio={Number(state.innerRadiusRatio)}
            padAngle={Number(state.padAngle)}
            halfDonut={Boolean(state.halfDonut)}
            showLabels={Boolean(state.showLabels)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'timeseries':
      return (
        <div className="w-full">
          <InteractiveTimeseriesChart
            palette={state.palette as ChartPaletteId}
            curve={state.curve as ChartCurveMode}
            strokeWidth={Number(state.strokeWidth)}
            fillOpacity={Number(state.fillOpacity)}
            dotSize={Number(state.dotSize)}
            showGrid={Boolean(state.showGrid)}
            showArea={Boolean(state.showArea)}
            showThreshold={Boolean(state.showThreshold)}
            thresholdValue={Number(state.thresholdValue)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'sankey':
      return (
        <div className="w-full">
          <InteractiveSankeyChart
            palette={state.palette as ChartPaletteId}
            fillOpacity={Number(state.fillOpacity)}
            showLabels={Boolean(state.showLabels)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'map-chart':
      return (
        <div className="w-full">
          <InteractiveMapChart
            palette={state.palette as ChartPaletteId}
            dotSize={Number(state.dotSize)}
            strokeWidth={Number(state.strokeWidth)}
            showLabels={Boolean(state.showLabels)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'flow':
      return (
        <div className="w-full">
          <InteractiveFlowChart
            palette={state.palette as ChartPaletteId}
            strokeWidth={Number(state.strokeWidth)}
            showLabels={Boolean(state.showLabels)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    case 'custom-chart':
      return (
        <div className="w-full">
          <InteractiveCustomChart
            palette={state.palette as ChartPaletteId}
            curve={state.curve as ChartCurveMode}
            strokeWidth={Number(state.strokeWidth)}
            fillOpacity={Number(state.fillOpacity)}
            dotSize={Number(state.dotSize)}
            showGrid={Boolean(state.showGrid)}
            showLabels={Boolean(state.showLabels)}
            showThreshold={Boolean(state.showThreshold)}
            thresholdValue={Number(state.thresholdValue)}
            defaultLive={Boolean(state.defaultLive)}
          />
        </div>
      );
    default:
      return null;
  }
}

export function PropsPlayground({ slug }: { slug: string }) {
  const schema = PLAYGROUND_SCHEMAS[slug];
  const initialDefaults = React.useMemo(
    () => (schema ? getInitialPlaygroundState(schema) : {}),
    [schema],
  );
  const [stateEntry, setStateEntry] = React.useState<{ slug: string; values: PlaygroundState }>(() => ({
    slug,
    values: schema ? getInitialPlaygroundState(schema) : {},
  }));
  const [copied, setCopied] = React.useState(false);

  const state: PlaygroundState = React.useMemo(
    () => (stateEntry.slug === slug ? { ...initialDefaults, ...stateEntry.values } : initialDefaults),
    [stateEntry, slug, initialDefaults],
  );

  const setState: React.Dispatch<React.SetStateAction<PlaygroundState>> = React.useCallback(
    (updater) => {
      setStateEntry((prev) => {
        const base = prev.slug === slug ? { ...initialDefaults, ...prev.values } : initialDefaults;
        const nextValues = typeof updater === 'function' ? updater(base) : updater;
        return { slug, values: nextValues };
      });
    },
    [slug, initialDefaults],
  );

  React.useEffect(() => {
    setCopied(false);
  }, [slug]);

  if (!schema) return null;

  const snippet = buildPlaygroundSnippet(schema, state);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section
      id="comp-playground"
      data-testid="props-playground"
      className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nt-line)] pb-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--nt-accent)]" />
          <h2 className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--nt-display)]">
            Interactive Props Playground
          </h2>
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            · Live JSX Sync
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState(getInitialPlaygroundState(schema))}
          >
            <ArrowCounterClockwise className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied JSX' : 'Copy JSX'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Live Preview + Live JSX Code */}
        <div className="xl:col-span-7 flex flex-col gap-3">
          <div
            data-testid="playground-stage"
            className="flex min-h-[190px] items-center justify-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-6"
          >
            {renderLivePreview(schema, state, setState)}
          </div>

          <pre
            data-testid="playground-jsx"
            className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-[11px] leading-relaxed text-[var(--nt-primary)]"
          >
            <code>{snippet}</code>
          </pre>
        </div>

        {/* Typed Controls */}
        <div className="xl:col-span-5 space-y-3.5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            Component Props
          </div>

          {schema.controls.map((ctrl) => {
            const val = state[ctrl.name];

            if (ctrl.kind === 'select') {
              return (
                <div key={ctrl.name} className="space-y-1.5">
                  <div className="font-mono text-[11px] text-[var(--nt-secondary)]">
                    {ctrl.label}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {ctrl.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        aria-pressed={val === opt}
                        onClick={() => setState((prev) => ({ ...prev, [ctrl.name]: opt }))}
                        className={cn(
                          'rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap',
                          val === opt
                            ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                            : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              );
            }

            if (ctrl.kind === 'boolean') {
              return (
                <label
                  key={ctrl.name}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 cursor-pointer"
                >
                  <span className="font-mono text-xs text-[var(--nt-display)]">{ctrl.label}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, [ctrl.name]: e.target.checked }))
                    }
                    className="h-4 w-4 accent-[var(--nt-accent)] cursor-pointer"
                  />
                </label>
              );
            }

            if (ctrl.kind === 'number') {
              return (
                <label key={ctrl.name} className="block space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-[var(--nt-secondary)]">{ctrl.label}</span>
                    <span className="tabular-nums text-[var(--nt-display)]">{Number(val)}</span>
                  </div>
                  <input
                    type="range"
                    min={ctrl.min}
                    max={ctrl.max}
                    step={ctrl.step ?? 1}
                    value={Number(val)}
                    onChange={(e) =>
                      setState((prev) => ({ ...prev, [ctrl.name]: Number(e.target.value) }))
                    }
                    className="w-full accent-[var(--nt-accent)] cursor-pointer"
                  />
                </label>
              );
            }

            return (
              <label key={ctrl.name} className="block space-y-1.5">
                <span className="font-mono text-[11px] text-[var(--nt-secondary)]">
                  {ctrl.label}
                </span>
                <input
                  type="text"
                  value={String(val ?? '')}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, [ctrl.name]: e.target.value }))
                  }
                  className="h-8 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2.5 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
                />
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
