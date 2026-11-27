import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  type PowerDeviceTelemetry,
  computePowerHubSummary,
} from '../../../lib/widgets/hardware-widget-logic';

const INITIAL_DEVICES: PowerDeviceTelemetry[] = [
  { id: 'phone', name: 'Phone (3)', kind: 'phone', level: 84, charging: true, healthPct: 98, watts: 45 },
  { id: 'earbuds', name: 'Ear (3) + Case', kind: 'earbuds', level: 62, charging: false, healthPct: 96, watts: 5 },
  { id: 'watch', name: 'Watch Pro 2', kind: 'watch', level: 18, charging: false, healthPct: 94, watts: 5 },
  { id: 'laptop', name: 'Studio Book', kind: 'laptop', level: 91, charging: true, healthPct: 92, watts: 65 },
];

export interface BatteryHealthHubWidgetProps {
  initialDevices?: readonly PowerDeviceTelemetry[];
  className?: string;
}

export function BatteryHealthHubWidget({
  initialDevices = INITIAL_DEVICES,
  className,
}: BatteryHealthHubWidgetProps) {
  const [devices, setDevices] = React.useState<PowerDeviceTelemetry[]>(() => [...initialDevices]);
  const summary = computePowerHubSummary(devices);

  const toggleCharging = (id: string) => {
    setDevices((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              charging: !d.charging,
              level: !d.charging ? Math.min(100, d.level + 4) : d.level,
            }
          : d,
      ),
    );
  };

  return (
    <section
      aria-label="Multi-Device Power Hub"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Multi-Device Power Hub</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            Avg {summary.averagePct}% · {summary.chargingCount} charging · {summary.totalWatts}W draw
          </p>
        </div>

        {summary.lowDevices.length > 0 && (
          <span className="text-xs font-mono text-[var(--nt-accent)]">
            Low: {summary.lowDevices.map((d) => d.name).join(', ')}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {devices.map((device) => {
          const segments = 12;
          const activeSegs = Math.round((device.level / 100) * segments);
          const isLow = device.level <= 20 && !device.charging;

          return (
            <div
              key={device.id}
              className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-3 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-[var(--nt-display)] truncate">
                    {device.name}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--nt-muted)]">
                    Health {device.healthPct}% ·{' '}
                    {device.charging ? `Charging ${device.watts ?? 15}W` : isLow ? 'Low battery' : 'On battery'}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <span
                    className={cn(
                      'font-mono tabular-nums text-sm font-bold',
                      isLow ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]',
                    )}
                  >
                    {device.level}%
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleCharging(device.id)}
                    aria-pressed={device.charging}
                    aria-label={`Toggle charging for ${device.name}`}
                    className={cn(
                      'px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
                      device.charging
                        ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'border-[var(--nt-line-2)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {device.charging ? 'Plugged' : 'Charge'}
                  </button>
                </div>
              </div>

              <div
                className="grid grid-cols-12 gap-1"
                role="meter"
                aria-label={`${device.name} battery level`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={device.level}
              >
                {Array.from({ length: segments }).map((_, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'h-2 rounded-xs transition-colors',
                      idx < activeSegs
                        ? isLow
                          ? 'bg-[var(--nt-accent)]'
                          : 'bg-[var(--nt-display)]'
                        : 'bg-[var(--nt-line)]',
                    )}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
