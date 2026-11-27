import * as React from 'react';
import { cn } from '../../../lib/cn';
import { evaluateLinkQuality } from '../../../lib/widgets/hardware-widget-logic';

type RadioProfileId = 'wifi7' | '5g-uw' | 'lte';

const RADIO_PROFILES: Record<
  RadioProfileId,
  { label: string; down: number; up: number; ping: number; jitter: number; band: string }
> = {
  wifi7: { label: 'Wi-Fi 7', down: 842, up: 318, ping: 8, jitter: 1.4, band: '6 GHz · 320 MHz' },
  '5g-uw': { label: '5G UW', down: 412, up: 64, ping: 19, jitter: 3.8, band: 'n77 · Sub-6' },
  lte: { label: '4G LTE', down: 42, up: 12, ping: 54, jitter: 11.2, band: 'Band 66' },
};

export interface NetworkSpeedRadarWidgetProps {
  defaultProfile?: RadioProfileId;
  className?: string;
}

export function NetworkSpeedRadarWidget({
  defaultProfile = 'wifi7',
  className,
}: NetworkSpeedRadarWidgetProps) {
  const [profile, setProfile] = React.useState<RadioProfileId>(defaultProfile);
  const [metrics, setMetrics] = React.useState(() => RADIO_PROFILES[defaultProfile]);
  const [sweeping, setSweeping] = React.useState(false);

  const selectProfile = (next: RadioProfileId) => {
    setProfile(next);
    setMetrics(RADIO_PROFILES[next]);
  };

  const runDiagnosticSweep = () => {
    setSweeping(true);
    const base = RADIO_PROFILES[profile];
    const variance = (seed: number) => 0.92 + ((Date.now() + seed) % 16) / 100;
    window.setTimeout(() => {
      setMetrics({
        ...base,
        down: Math.round(base.down * variance(1)),
        up: Math.round(base.up * variance(7)),
        ping: Math.max(4, Math.round(base.ping * variance(3))),
        jitter: Number((base.jitter * variance(11)).toFixed(1)),
      });
      setSweeping(false);
    }, 280);
  };

  const evaluation = evaluateLinkQuality(metrics.down, metrics.up, metrics.ping, metrics.jitter);

  return (
    <section
      aria-label="5G and Wi-Fi Speed Monitor"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">5G / Wi-Fi Speed Monitor</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono">
            {metrics.band} · {evaluation.grade}
          </p>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Network radio interface">
          {(Object.keys(RADIO_PROFILES) as RadioProfileId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => selectProfile(id)}
              aria-pressed={profile === id}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                profile === id
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {RADIO_PROFILES[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-4">
        <div className="font-mono tabular-nums">
          <div className="text-[10px] text-[var(--nt-muted)]">DOWNLINK THROUGHPUT</div>
          <div className="text-3xl font-bold tracking-tight mt-0.5">
            {metrics.down}{' '}
            <span className="text-sm font-normal text-[var(--nt-muted)]">Mbps</span>
          </div>
        </div>

        {/* 5-bar RF signal meter */}
        <div
          className="flex items-end gap-1.5 h-10"
          role="meter"
          aria-label="RF Signal Strength"
          aria-valuemin={0}
          aria-valuemax={5}
          aria-valuenow={evaluation.signalBars}
        >
          {[1, 2, 3, 4, 5].map((bar) => (
            <span
              key={bar}
              className={cn(
                'w-2 rounded-xs transition-colors',
                bar <= evaluation.signalBars
                  ? evaluation.grade === 'Degraded'
                    ? 'bg-[var(--nt-accent)]'
                    : 'bg-[var(--nt-display)]'
                  : 'bg-[var(--nt-line-2)] opacity-35',
              )}
              style={{ height: `${bar * 20}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2.5 font-mono tabular-nums text-center">
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">UPLINK</div>
          <div className="text-sm font-semibold mt-0.5">{metrics.up} Mbps</div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">PING</div>
          <div className="text-sm font-semibold mt-0.5">{metrics.ping} ms</div>
        </div>
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5">
          <div className="text-[10px] text-[var(--nt-muted)]">JITTER</div>
          <div className="text-sm font-semibold mt-0.5">{metrics.jitter} ms</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs font-mono text-[var(--nt-muted)]">
          Link score {evaluation.bandwidthScore}/100 ({evaluation.grade})
        </span>
        <button
          type="button"
          onClick={runDiagnosticSweep}
          disabled={sweeping}
          className="px-3.5 py-1.5 text-xs font-mono rounded-lg bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {sweeping ? 'Sweeping...' : 'Run Sweep'}
        </button>
      </div>
    </section>
  );
}
