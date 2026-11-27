import * as React from 'react';
import { cn } from '@/lib/utils';
import { DotIcon } from './DotIcon';
import { SegmentedBar } from './Feedback';
import { GlyphMatrix } from './GlyphMatrix';
import { appToaster } from './Overlays';

export function DotMatrixClockWidget() {
  const [now, setNow] = React.useState(() => new Date());
  const [use24h, setUse24h] = React.useState(true);

  React.useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hours = use24h ? now.getHours() : now.getHours() % 12 || 12;
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const hrsStr = String(hours).padStart(2, '0');
  const dateLabel = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--nt-muted)]">
          Nothing Clock · London
        </span>
        <button
          type="button"
          onClick={() => setUse24h((v) => !v)}
          className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          {use24h ? '24H' : '12H'}
        </button>
      </div>
      <div className="my-6 flex items-baseline gap-2 font-display tabular-nums">
        <span className="text-5xl tracking-wider text-[var(--nt-display)]">
          {hrsStr}:{mins}
        </span>
        <span className="text-xl text-[#D71921]">{secs}</span>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-secondary)]">
        <span>{dateLabel}</span>
        <span>GMT+0</span>
      </div>
    </div>
  );
}

export function QuickSettingsWidget() {
  const [tiles, setTiles] = React.useState({
    wifi: true,
    glyph: true,
    hotspot: false,
    dnd: false,
  });

  const toggleTile = (key: keyof typeof tiles, label: string) => {
    setTiles((prev) => {
      const nextVal = !prev[key];
      appToaster(`${label} ${nextVal ? 'enabled' : 'disabled'}`, {
        description: 'Hardware state synced to Quick Settings panel.',
      });
      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <div className="nt-card-surface rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--nt-muted)]">
          Quick Settings
        </span>
        <span className="font-mono text-[10px] text-[var(--nt-muted)] tabular-nums">
          {Object.values(tiles).filter(Boolean).length}/4 active
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { key: 'wifi' as const, label: 'Wi-Fi 7', sub: 'Nothing-5G', icon: 'wifi' as const, signal: false },
          { key: 'glyph' as const, label: 'Glyph', sub: 'Matrix LEDs', icon: 'bolt' as const, signal: true },
          { key: 'hotspot' as const, label: 'Hotspot', sub: 'Tethering', icon: 'signal' as const, signal: false },
          { key: 'dnd' as const, label: 'Focus', sub: 'Silence all', icon: 'moon' as const, signal: false },
        ].map((tile) => {
          const active = tiles[tile.key];
          return (
            <button
              key={tile.key}
              type="button"
              aria-pressed={active}
              onClick={() => toggleTile(tile.key, tile.label)}
              className={cn(
                'flex flex-col items-start justify-between rounded-2xl border p-4 text-left transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]',
                active
                  ? tile.signal
                    ? 'border-[#D71921] bg-[#D71921] text-white'
                    : 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line-2)] bg-[var(--nt-raised)]/50 text-[var(--nt-primary)] hover:border-[var(--nt-secondary)]'
              )}
            >
              <DotIcon name={tile.icon} size={22} />
              <div className="mt-4">
                <div className="font-mono text-xs font-medium">{tile.label}</div>
                <div className="font-mono text-[10px] opacity-70">{tile.sub}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WeatherMatrixWidget() {
  const [unit, setUnit] = React.useState<'C' | 'F'>('C');
  const temp = unit === 'C' ? 14 : 57;
  const high = unit === 'C' ? 17 : 63;
  const low = unit === 'C' ? 9 : 48;

  return (
    <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--nt-muted)]">
          Weather · Shoreditch
        </span>
        <button
          type="button"
          onClick={() => setUnit((u) => (u === 'C' ? 'F' : 'C'))}
          className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 font-mono text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          °{unit}
        </button>
      </div>
      <div className="my-5 flex items-center justify-between">
        <div className="font-display text-5xl tabular-nums text-[var(--nt-display)]">
          {temp}°
        </div>
        <DotIcon name="cloud" size={44} className="text-[var(--nt-display)]" />
      </div>
      <div className="flex items-center justify-between border-t border-[var(--nt-line)] pt-3 font-mono text-xs text-[var(--nt-secondary)] tabular-nums">
        <span>Overcast</span>
        <span>
          H {high}° · L {low}°
        </span>
      </div>
    </div>
  );
}

export function AudioBatteryWidget() {
  const [ancMode, setAncMode] = React.useState<'ANC' | 'Transparency' | 'Off'>('ANC');

  return (
    <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--nt-muted)]">
          Ear (a) · Connected
        </span>
        <DotIcon name="music" size={18} className="text-[var(--nt-display)]" />
      </div>
      <div className="my-5 space-y-3.5">
        <SegmentedBar label="Left / Right Buds" total={16} filled={14} />
        <SegmentedBar label="Charging Case" total={16} filled={11} tone="signal" />
      </div>
      <div className="flex items-center gap-1.5 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1">
        {(['ANC', 'Transparency', 'Off'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setAncMode(mode)}
            className={cn(
              'flex-1 rounded-md py-1.5 font-mono text-[11px] transition-colors cursor-pointer',
              ancMode === mode
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-primary)]'
            )}
          >
            {mode}
          </button>
        ))}
      </div>
    </div>
  );
}

export function GlyphTimerWidget() {
  const [secondsLeft, setSecondsLeft] = React.useState(180);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, secondsLeft]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="nt-card-surface flex flex-col justify-between rounded-2xl p-6 sm:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--nt-muted)]">
            Glyph Countdown Timer
          </div>
          <div className="font-display text-5xl tabular-nums text-[var(--nt-display)]">
            {mins}:{secs}
          </div>
          <p className="max-w-xs text-xs text-[var(--nt-secondary)]">
            Visualizes remaining session time directly on the 25×25 rear LED array.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRunning((r) => !r)}
              className="h-9 rounded-md bg-[#D71921] px-4 font-mono text-xs text-white hover:bg-[#b8141b] cursor-pointer"
            >
              {running ? 'Pause' : 'Start Timer'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(180);
              }}
              className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
        <GlyphMatrix preset={running ? 'live' : 'power'} size={146} label="Glyph timer matrix" />
      </div>
    </div>
  );
}
