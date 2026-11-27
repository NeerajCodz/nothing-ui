import * as React from 'react';
import {
  Camera,
  Code,
  Crosshair,
  FilmStrip,
  ListBullets,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Microphone,
  Pause,
  Play,
  Record,
  Repeat,
  Stop,
  TextB,
  TextHOne,
  TextItalic,
  VideoCamera,
} from '@phosphor-icons/react';
import { Button, appToaster, cn } from '@nothing-ui/ui';

/* ───────────────────────────────────────────────────────────────────────────
 * 16. Pie Chart (Donut & Solid Toggle)
 * ─────────────────────────────────────────────────────────────────────────── */
const PIE_SLICES = [
  { id: 'glyph', label: 'Glyph LEDs', value: 42, color: 'var(--nt-display)' },
  { id: 'radio', label: '5G Modem', value: 28, color: 'var(--nt-accent)' },
  { id: 'audio', label: 'Ear (3) Audio', value: 18, color: 'var(--nt-secondary)' },
  { id: 'idle', label: 'Standby', value: 12, color: 'var(--nt-line-2)' },
] as const;

export function PieChartDemo() {
  const [donut, setDonut] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string>('glyph');
  const active = PIE_SLICES.find((s) => s.id === activeId) ?? PIE_SLICES[0];

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 sm:flex-row sm:justify-between rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" role="img" aria-label="Power distribution pie chart">
          {PIE_SLICES.map((slice) => {
            const length = (slice.value / 100) * circumference;
            const offset = -cumulative;
            cumulative += length;
            return (
              <circle
                key={slice.id}
                cx={60}
                cy={60}
                r={radius}
                fill="none"
                stroke={slice.color}
                strokeWidth={donut ? 16 : 44}
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={offset}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => setActiveId(slice.id)}
              />
            );
          })}
        </svg>
        {donut && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-mono">
            <span className="text-lg font-medium tabular-nums text-[var(--nt-display)]">{active.value}%</span>
            <span className="text-[9px] uppercase text-[var(--nt-muted)]">{active.label}</span>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-2.5 w-full">
        <div className="flex items-center justify-between font-mono text-[11px]">
          <span className="text-[var(--nt-muted)]">POWER BUDGET</span>
          <button
            type="button"
            onClick={() => setDonut((d) => !d)}
            className="rounded-md border border-[var(--nt-line)] px-2 py-0.5 text-[var(--nt-display)] cursor-pointer"
          >
            {donut ? 'Donut' : 'Solid'}
          </button>
        </div>
        <div className="space-y-1">
          {PIE_SLICES.map((slice) => (
            <button
              key={slice.id}
              type="button"
              onClick={() => setActiveId(slice.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-mono text-xs cursor-pointer',
                activeId === slice.id ? 'bg-[var(--nt-surface)] text-[var(--nt-display)]' : 'text-[var(--nt-secondary)]',
              )}
            >
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} />
                {slice.label}
              </span>
              <span className="tabular-nums">{slice.value}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 17. Timeseries
 * ─────────────────────────────────────────────────────────────────────────── */
const SERIES_BY_WINDOW = {
  '1H': [28, 34, 31, 45, 52, 48, 61, 57, 68, 63, 72, 66],
  '24H': [42, 38, 35, 30, 44, 58, 71, 80, 74, 62, 55, 49],
  '7D': [50, 54, 49, 63, 70, 68, 76, 82, 79, 85, 81, 88],
} as const;

export function TimeseriesDemo() {
  const [windowKey, setWindowKey] = React.useState<'1H' | '24H' | '7D'>('24H');
  const values = SERIES_BY_WINDOW[windowKey];
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 300},${100 - v}`)
    .join(' ');
  const peak = Math.max(...values);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs">
        <div>
          <span className="text-[var(--nt-muted)]">TELEMETRY STREAM · </span>
          <span className="text-[var(--nt-display)]">PEAK {peak} req/s</span>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] p-0.5 text-[11px]">
          {(['1H', '24H', '7D'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setWindowKey(k)}
              className={cn(
                'rounded-md px-2 py-0.5 cursor-pointer',
                windowKey === k ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox="0 0 300 110" className="h-32 w-full" role="img" aria-label="Timeseries line graph">
        <line x1="0" y1="25" x2="300" y2="25" stroke="var(--nt-line)" strokeDasharray="3 3" />
        <line x1="0" y1="60" x2="300" y2="60" stroke="var(--nt-line)" strokeDasharray="3 3" />
        <line x1="0" y1="95" x2="300" y2="95" stroke="var(--nt-line)" />
        <polyline fill="none" stroke="var(--nt-display)" strokeWidth="2" points={points} />
        {values.map((v, i) => (
          <circle
            key={i}
            cx={(i / (values.length - 1)) * 300}
            cy={100 - v}
            r={v === peak ? 4 : 2.2}
            fill={v === peak ? 'var(--nt-accent)' : 'var(--nt-display)'}
          />
        ))}
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 18. Sankey Flow Diagram
 * ─────────────────────────────────────────────────────────────────────────── */
const SANKEY_FLOWS = [
  { id: 'usb', from: 'USB-C 65W', to: 'Battery Cell', watts: '45W', d: 'M 95 28 C 165 28, 165 36, 235 36', w: 12 },
  { id: 'qi', from: 'Qi2 Coil', to: 'Battery Cell', watts: '15W', d: 'M 95 82 C 165 82, 165 56, 235 56', w: 6 },
  { id: 'sys', from: 'USB-C 65W', to: 'OLED + Glyph', watts: '20W', d: 'M 95 44 C 165 44, 165 92, 235 92', w: 8 },
] as const;

export function SankeyDemo() {
  const [selected, setSelected] = React.useState<string>('usb');
  const active = SANKEY_FLOWS.find((f) => f.id === selected) ?? SANKEY_FLOWS[0];

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-muted)]">ENERGY SANKEY</span>
        <span className="text-[var(--nt-accent)]">
          {active.from} → {active.to} ({active.watts})
        </span>
      </div>

      <svg viewBox="0 0 330 120" className="h-32 w-full" role="img" aria-label="Power flow sankey diagram">
        {SANKEY_FLOWS.map((flow) => {
          const isSelected = flow.id === selected;
          return (
            <path
              key={flow.id}
              d={flow.d}
              fill="none"
              stroke={isSelected ? 'var(--nt-accent)' : 'var(--nt-line-2)'}
              strokeWidth={flow.w}
              strokeOpacity={isSelected ? 0.9 : 0.6}
              className="cursor-pointer transition-colors"
              onClick={() => setSelected(flow.id)}
            />
          );
        })}
        <rect x="6" y="16" width="88" height="36" rx="6" fill="var(--nt-surface)" stroke="var(--nt-line-2)" />
        <text x="50" y="38" textAnchor="middle" fill="var(--nt-display)" fontSize="9" fontFamily="monospace">USB-C 65W</text>
        <rect x="6" y="68" width="88" height="30" rx="6" fill="var(--nt-surface)" stroke="var(--nt-line-2)" />
        <text x="50" y="87" textAnchor="middle" fill="var(--nt-display)" fontSize="9" fontFamily="monospace">Qi2 Coil</text>
        <rect x="236" y="20" width="88" height="46" rx="6" fill="var(--nt-surface)" stroke="var(--nt-line-2)" />
        <text x="280" y="47" textAnchor="middle" fill="var(--nt-display)" fontSize="9" fontFamily="monospace">Battery</text>
        <rect x="236" y="76" width="88" height="30" rx="6" fill="var(--nt-surface)" stroke="var(--nt-line-2)" />
        <text x="280" y="95" textAnchor="middle" fill="var(--nt-display)" fontSize="9" fontFamily="monospace">OLED + LED</text>
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 19. Map Chart (Dot-Matrix Geo Telemetry)
 * ─────────────────────────────────────────────────────────────────────────── */
const GEO_NODES = [
  { id: 'SFO', city: 'San Francisco', x: 52, y: 46, devices: '14,280' },
  { id: 'LON', city: 'London', x: 146, y: 34, devices: '38,910' },
  { id: 'BER', city: 'Berlin', x: 168, y: 38, devices: '19,405' },
  { id: 'SIN', city: 'Singapore', x: 242, y: 76, devices: '22,190' },
  { id: 'TYO', city: 'Tokyo', x: 274, y: 46, devices: '31,640' },
] as const;

export function MapChartDemo() {
  const [hub, setHub] = React.useState<string>('LON');
  const active = GEO_NODES.find((n) => n.id === hub) ?? GEO_NODES[0];

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-display)]">{active.city} ({active.id})</span>
        <span className="text-[var(--nt-accent)]">{active.devices} Active Units</span>
      </div>

      <svg viewBox="0 0 320 110" className="h-32 w-full rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]" role="img" aria-label="Global telemetry dot map">
        {Array.from({ length: 18 }, (_, col) =>
          Array.from({ length: 6 }, (_, row) => (
            <circle
              key={`${col}-${row}`}
              cx={16 + col * 17}
              cy={16 + row * 16}
              r={1.1}
              fill="var(--nt-line-2)"
            />
          )),
        )}
        <path d="M 52 46 Q 100 18 146 34 T 274 46" fill="none" stroke="var(--nt-line-2)" strokeDasharray="3 3" />
        {GEO_NODES.map((n) => {
          const isCurrent = n.id === hub;
          return (
            <g key={n.id} onClick={() => setHub(n.id)} className="cursor-pointer">
              <circle
                cx={n.x}
                cy={n.y}
                r={isCurrent ? 7 : 4.5}
                fill={isCurrent ? 'var(--nt-accent)' : 'var(--nt-display)'}
              />
              <text x={n.x} y={n.y + 16} textAnchor="middle" fill="var(--nt-muted)" fontSize="8" fontFamily="monospace">
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 20. Flow (Node-Graph Pipeline)
 * ─────────────────────────────────────────────────────────────────────────── */
const FLOW_NODES = [
  { id: 'trigger', label: '01 · Audio In', status: '48 kHz PCM' },
  { id: 'fft', label: '02 · FFT Band', status: '13-Bin Split' },
  { id: 'glyph', label: '03 · Glyph Out', status: '481 LEDs' },
] as const;

export function FlowDemo() {
  const [activeIdx, setActiveIdx] = React.useState(0);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-muted)]">SIGNAL PIPELINE GRAPH</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setActiveIdx((i) => (i + 1) % FLOW_NODES.length)}
        >
          Step Node →
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {FLOW_NODES.map((node, idx) => {
          const current = idx === activeIdx;
          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={cn(
                'rounded-xl border p-3 text-left font-mono transition-colors cursor-pointer',
                current
                  ? 'border-[var(--nt-accent)] bg-[var(--nt-surface)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-bg)] hover:border-[var(--nt-line-2)]',
              )}
            >
              <div className="text-[11px] font-medium text-[var(--nt-display)]">{node.label}</div>
              <div className="mt-1 text-[10px] text-[var(--nt-muted)]">{node.status}</div>
              <div className={cn('mt-2 text-[9px] uppercase', current ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]')}>
                {current ? '● EXECUTING' : '○ READY'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 21. Custom Chart (Composable Layers)
 * ─────────────────────────────────────────────────────────────────────────── */
export function CustomChartDemo() {
  const [showBand, setShowBand] = React.useState(true);
  const [showScatter, setShowScatter] = React.useState(true);
  const pts = [
    [20, 72],
    [65, 58],
    [110, 64],
    [155, 40],
    [200, 48],
    [245, 28],
    [285, 34],
  ];

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <span className="text-[var(--nt-display)]">CUSTOM LAYER COMPOSER</span>
        <div className="flex gap-1.5">
          <button
            type="button"
            aria-pressed={showBand}
            onClick={() => setShowBand((v) => !v)}
            className={cn(
              'rounded-md border px-2 py-0.5 cursor-pointer',
              showBand ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            SLA Band
          </button>
          <button
            type="button"
            aria-pressed={showScatter}
            onClick={() => setShowScatter((v) => !v)}
            className={cn(
              'rounded-md border px-2 py-0.5 cursor-pointer',
              showScatter ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            Scatter
          </button>
        </div>
      </div>

      <svg viewBox="0 0 305 100" className="h-28 w-full" role="img" aria-label="Custom composable chart">
        {showBand && <rect x="0" y="30" width="305" height="32" fill="var(--nt-accent)" fillOpacity="0.12" />}
        <polyline
          fill="none"
          stroke="var(--nt-display)"
          strokeWidth="2"
          points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
        />
        {showScatter &&
          pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={3.5} fill={y < 38 ? 'var(--nt-accent)' : 'var(--nt-display)'} />
          ))}
      </svg>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 22. Audio Recorder
 * ─────────────────────────────────────────────────────────────────────────── */
export function AudioRecorderDemo() {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(12);

  React.useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const bars = [22, 48, 72, 38, 86, 60, 34, 78, 92, 54, 40, 68, 84, 30, 56, 44];
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="mx-auto w-full max-w-md space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="flex items-center gap-2 text-[var(--nt-display)]">
          <Microphone className="h-4 w-4 text-[var(--nt-accent)]" />
          <span>VOICE MEMO · 48kHz</span>
        </span>
        <span className={cn('tabular-nums', recording ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-muted)]')}>
          {recording ? '● REC ' : ''}
          {mm}:{ss}
        </span>
      </div>

      <div className="flex h-16 items-end justify-between gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2">
        {bars.map((h, i) => (
          <div
            key={i}
            style={{ height: `${recording ? ((h + seconds * 13 + i * 7) % 85) + 15 : Math.round(h * 0.55)}%` }}
            className={cn(
              'w-1.5 rounded-full transition-all duration-200',
              recording && i % 4 === 0 ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]',
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Button variant={recording ? 'signal' : 'primary'} size="sm" onClick={() => setRecording((r) => !r)}>
          {recording ? <Pause className="h-3.5 w-3.5" /> : <Record className="h-3.5 w-3.5" weight="fill" />}
          {recording ? 'Pause Capture' : 'Start Recording'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => { setRecording(false); setSeconds(0); }}>
          <Stop className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 23. Video Recorder
 * ─────────────────────────────────────────────────────────────────────────── */
export function VideoRecorderDemo() {
  const [recording, setRecording] = React.useState(false);
  const [profile, setProfile] = React.useState<'4K·60' | '1080p·120'>('4K·60');

  return (
    <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="relative flex h-40 flex-col justify-between overflow-hidden rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3 font-mono text-[10px]">
        <div className="flex items-center justify-between">
          <span className={cn(recording ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]')}>
            {recording ? '● REC 00:08:14' : '○ STANDBY'}
          </span>
          <span className="text-[var(--nt-muted)]">{profile} · LOG</span>
        </div>
        <div className="self-center text-[var(--nt-muted)] flex items-center gap-1.5">
          <Crosshair className="h-5 w-5" />
          <span>VIEWFINDER GRID</span>
        </div>
        <div className="flex items-center justify-between text-[var(--nt-muted)]">
          <span>ISO 400</span>
          <span>1/120s · f/1.8</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Button variant={recording ? 'signal' : 'primary'} size="sm" onClick={() => setRecording((r) => !r)}>
          <VideoCamera className="h-3.5 w-3.5" />
          {recording ? 'Stop Recording' : 'Record Clip'}
        </Button>
        <button
          type="button"
          onClick={() => setProfile((p) => (p === '4K·60' ? '1080p·120' : '4K·60'))}
          className="rounded-lg border border-[var(--nt-line)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-display)] cursor-pointer"
        >
          {profile}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 24. Camera Capture
 * ─────────────────────────────────────────────────────────────────────────── */
export function CameraCaptureDemo() {
  const [lens, setLens] = React.useState<'0.6x' | '1x' | '2x'>('1x');
  const [shots, setShots] = React.useState(3);

  return (
    <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="flex h-36 flex-col items-center justify-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] font-mono">
        <Camera className="h-7 w-7 text-[var(--nt-display)]" />
        <span className="mt-2 text-xs text-[var(--nt-display)]">50MP SENSOR · {lens}</span>
        <span className="text-[10px] text-[var(--nt-muted)]">{shots} frames captured in roll</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] p-0.5 font-mono text-[11px]">
          {(['0.6x', '1x', '2x'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLens(l)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer',
                lens === l ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-muted)]',
              )}
            >
              {l}
            </button>
          ))}
        </div>

        <Button
          variant="signal"
          size="sm"
          onClick={() => {
            setShots((c) => c + 1);
            appToaster('Frame Captured', { description: `RAW DNG saved at ${lens}` });
          }}
        >
          Shutter
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 25. Media Studio (Timeline Trimmer)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MediaStudioDemo() {
  const [playhead, setPlayhead] = React.useState(36);
  const [playing, setPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPlayhead((p) => (p >= 100 ? 0 : p + 4)), 250);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="flex items-center gap-1.5 text-[var(--nt-display)]">
          <FilmStrip className="h-4 w-4 text-[var(--nt-accent)]" />
          <span>TIMELINE STUDIO</span>
        </span>
        <span className="tabular-nums text-[var(--nt-muted)]">FRAME {String(playhead).padStart(3, '0')} / 100</span>
      </div>

      <div className="relative space-y-1.5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <span className="w-10 text-[var(--nt-muted)]">VID 1</span>
          <div className="h-6 flex-1 rounded bg-[var(--nt-raised)] border border-[var(--nt-line-2)] px-2 leading-6 text-[var(--nt-display)]">
            A-ROLL_GLYPH_DEMO.MOV
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10 text-[var(--nt-muted)]">AUD 1</span>
          <div className="h-6 w-4/5 rounded bg-[var(--nt-bg)] border border-[var(--nt-line)] px-2 leading-6 text-[var(--nt-secondary)]">
            SYNTH_PULSE_48K.WAV
          </div>
        </div>
        <div
          style={{ left: `calc(56px + ${(playhead / 100) * 78}%)` }}
          className="pointer-events-none absolute inset-y-1 w-0.5 bg-[var(--nt-accent)] transition-all"
        />
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </Button>
        <input
          type="range"
          min={0}
          max={100}
          value={playhead}
          aria-label="Scrub timeline playhead"
          onChange={(e) => setPlayhead(Number(e.target.value))}
          className="flex-1 accent-[var(--nt-accent)] cursor-pointer"
        />
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 26. Media Viewer (Zoomable Lightbox)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MediaViewerDemo() {
  const [zoom, setZoom] = React.useState(1);
  const [angle, setAngle] = React.useState(0);

  return (
    <div className="mx-auto w-full max-w-md space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="flex h-40 items-center justify-center overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
        <div
          style={{ transform: `scale(${zoom}) rotate(${angle}deg)` }}
          className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-[var(--nt-display)] font-mono text-xs text-[var(--nt-display)] transition-transform duration-200"
        >
          GLYPH.SVG
        </div>
      </div>

      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-muted)]">
          {Math.round(zoom * 100)}% · {angle}°
        </span>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.75, +(z - 0.25).toFixed(2)))}>
            <MagnifyingGlassMinus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2, +(z + 0.25).toFixed(2)))}>
            <MagnifyingGlassPlus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" aria-label="Rotate asset" onClick={() => setAngle((a) => (a + 90) % 360)}>
            <Repeat className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 27. Editor (Rich Block & Markdown Surface)
 * ─────────────────────────────────────────────────────────────────────────── */
export function EditorDemo() {
  const [content, setContent] = React.useState(
    '# Nothing OS Release Spec\nAll 136 components ship as stable across **nthgui** and **nthgui/native**.',
  );
  const [preview, setPreview] = React.useState(false);

  const insertToken = (snippet: string) => setContent((prev) => `${prev}${snippet}`);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto w-full max-w-lg space-y-2.5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] pb-2.5">
        <div className="flex items-center gap-1">
          {[
            { label: 'Heading', icon: TextHOne, token: '\n## Section' },
            { label: 'Bold', icon: TextB, token: ' **bold**' },
            { label: 'Italic', icon: TextItalic, token: ' _italic_' },
            { label: 'Code', icon: Code, token: ' `nthgui`' },
            { label: 'List', icon: ListBullets, token: '\n- Telemetry item' },
          ].map(({ label, icon: Icon, token }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => insertToken(token)}
              className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1.5 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="rounded-lg border border-[var(--nt-line)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-display)] cursor-pointer"
        >
          {preview ? 'Edit Source' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="min-h-[96px] rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 text-xs leading-relaxed text-[var(--nt-primary)] whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <textarea
          aria-label="Rich markdown document editor"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
        />
      )}

      <div className="flex items-center justify-between font-mono text-[10px] text-[var(--nt-muted)]">
        <span>{words} words · {content.length} chars</span>
        <span>UTF-8 · MARKDOWN</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 28. Calendar Canvas (Interactive Time-Block Schedule)
 * ─────────────────────────────────────────────────────────────────────────── */
const DAYS = ['MON', 'TUE', 'WED', 'THU'] as const;
const HOURS = ['09:00', '11:00', '14:00'] as const;

export function CalendarCanvasDemo() {
  const [booked, setBooked] = React.useState<Record<string, string>>({
    'MON-09:00': 'Glyph QA',
    'TUE-11:00': 'RN Build',
    'THU-14:00': 'v1.0 Ship',
  });

  const toggleSlot = (key: string) => {
    setBooked((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = 'Focus Block';
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>WEEKLY SCHEDULE CANVAS</span>
        <span className="text-[var(--nt-display)]">{Object.keys(booked).length} blocks scheduled</span>
      </div>

      <div className="grid grid-cols-5 gap-1.5 font-mono text-[10px]">
        <div />
        {DAYS.map((d) => (
          <div key={d} className="text-center text-[var(--nt-muted)] py-1">
            {d}
          </div>
        ))}

        {HOURS.map((h) => (
          <React.Fragment key={h}>
            <div className="flex items-center text-[var(--nt-muted)]">{h}</div>
            {DAYS.map((d) => {
              const key = `${d}-${h}`;
              const label = booked[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSlot(key)}
                  className={cn(
                    'h-10 rounded-lg border px-1.5 text-center transition-colors cursor-pointer truncate',
                    label
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-muted)] hover:border-[var(--nt-line-2)]',
                  )}
                >
                  {label ?? '+'}
                </button>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
