import * as React from 'react';
import {
  AudioBatteryWidget,
  DotMatrixClockWidget,
  GlyphTimerWidget,
  QuickSettingsWidget,
  WeatherMatrixWidget,
} from '@/components/nothing/NothingWidgets';
import {
  ActivityStream,
  MetricCard,
  NothingDataTable,
} from '@/components/nothing/DataDisplay';
import { NothingSwitch, NothingSlider } from '@/components/nothing/Controls';
import { DotIcon } from '@/components/nothing/DotIcon';
import { cn } from '@/lib/utils';

type WorkspaceTab = 'nodes' | 'telemetry' | 'controls';

export function WidgetsShowcase() {
  const [wsTab, setWsTab] = React.useState<WorkspaceTab>('nodes');

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--nt-line)] pb-6">
        <div className="font-mono text-xs text-[var(--nt-muted)]">
          Nothing OS Kit · Interactive Blocks
        </div>
        <h1 className="font-display text-3xl sm:text-4xl text-[var(--nt-display)]">
          Nothing OS Widgets &amp; Applied Workspace
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--nt-secondary)]">
          Hardware-inspired interactive widgets modeled after the Nothing OS Figma system and a
          complete applied workspace proving every component works cohesively together.
        </p>
      </div>

      {/* Interactive Nothing OS Widgets Grid */}
      <section aria-labelledby="widgets-grid-heading" className="space-y-4">
        <h2
          id="widgets-grid-heading"
          className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-secondary)]"
        >
          01. Nothing OS Home Screen Widgets
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DotMatrixClockWidget />
          <QuickSettingsWidget />
          <WeatherMatrixWidget />
          <AudioBatteryWidget />
          <GlyphTimerWidget />
        </div>
      </section>

      {/* Applied Workspace Reference Shell (from vibe-nothing-ui-design bottom showcase) */}
      <section aria-labelledby="applied-ws-heading" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="applied-ws-heading"
            className="font-mono text-xs uppercase tracking-[0.14em] text-[var(--nt-secondary)]"
          >
            02. Applied Workspace Reference
          </h2>
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            Rail + KPI Strip + Filterable Data Table + Hardware Controls
          </span>
        </div>

        <div className="nt-card-surface overflow-hidden rounded-2xl">
          {/* Workspace Title Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nt-line)] px-5 py-3.5">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="font-display text-sm text-[var(--nt-display)]">WORKSPACE</span>
              <span className="text-[var(--nt-line-2)]">/</span>
              <span className="text-[var(--nt-secondary)]">Phone (3) OS Fleet</span>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-0.5">
              {(
                [
                  { id: 'nodes', label: 'Registry Table' },
                  { id: 'telemetry', label: 'Live Stream' },
                  { id: 'controls', label: 'Hardware Controls' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setWsTab(tab.id)}
                  className={cn(
                    'rounded px-3 py-1 font-mono text-[11px] transition-colors cursor-pointer',
                    wsTab === tab.id
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[64px_minmax(0,1fr)]">
            {/* Compact Dot-Icon Rail */}
            <aside
              aria-label="Workspace rail"
              className="flex md:flex-col items-center justify-start gap-2 border-b md:border-b-0 md:border-r border-[var(--nt-line)] p-3"
            >
              {(
                [
                  { id: 'nodes' as const, icon: 'grid' as const, label: 'Modules' },
                  { id: 'telemetry' as const, icon: 'signal' as const, label: 'Telemetry' },
                  { id: 'controls' as const, icon: 'gear' as const, label: 'Controls' },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  onClick={() => setWsTab(item.id)}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-lg border transition-colors cursor-pointer',
                    wsTab === item.id
                      ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-transparent text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)]'
                  )}
                >
                  <DotIcon name={item.icon} size={18} />
                </button>
              ))}
            </aside>

            {/* Workspace Content Area */}
            <div className="p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <MetricCard label="Active Primitives" value="25" delta="All verified on @ui-sdk/react" />
                <MetricCard label="Bundle Footprint" value="23.1 kB" delta="Tree-shakeable per entry" />
                <MetricCard label="Contrast Ratio" value="18.4:1" delta="Pure #000 / #FFF OLED" />
              </div>

              {wsTab === 'nodes' && <NothingDataTable />}
              {wsTab === 'telemetry' && <ActivityStream />}
              {wsTab === 'controls' && (
                <div className="grid max-w-2xl gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <NothingSwitch defaultChecked label="Adaptive 120Hz Matrix" />
                    <NothingSwitch defaultChecked tone="signal" label="Essential Notification Override" />
                    <NothingSwitch label="Low-Power Monochrome Mode" />
                  </div>
                  <div className="space-y-5">
                    <NothingSlider label="Rear LED Luminance" defaultValue={78} unit="%" />
                    <NothingSlider label="Acoustic Dampening" defaultValue={45} unit="%" tone="signal" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
