import * as React from 'react';
import {
  Check,
  Code,
  Copy,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Eye,
  EyeSlash,
  LockKey,
  MagnifyingGlass,
  Play,
  Pause,
  SortAscending,
  SortDescending,
  Terminal,
} from '@phosphor-icons/react';
import { formatCliAdd, type PackageManager } from '@nothing-ui/registry';
import { Button, GlyphMatrix, NothingSlider, NothingSwitch, cn } from '@nothing-ui/ui';
import {
  ComboboxDemo,
  DateTimePickerDemo,
  DotMatrixClockDemo,
  EarbudsBatteryDemo,
  MetricGridDemo,
  QuickSettingsDeckDemo,
  RadarChartDemo,
  SortableBoardDemo,
  SparklineStripDemo,
  TagInputDemo,
  WeatherMatrixDemo,
} from '../../demos/expanded/v02-components';

type BlockCategory = 'All' | 'Hardware OS' | 'Audio & Media' | 'Telemetry & Data' | 'Auth & Forms' | 'Workspace';
type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface BlockDefinition {
  id: string;
  cliTarget: string;
  title: string;
  category: Exclude<BlockCategory, 'All'>;
  description: string;
  includedSlugs: string[];
  code: string;
  render: () => React.ReactNode;
}

/* ── Block 1: Nothing OS Lockscreen & Hardware Deck ───────────────────────── */
export function LockscreenDeckBlock() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-4">
        <DotMatrixClockDemo />
        <WeatherMatrixDemo />
      </div>
      <div className="lg:col-span-7 space-y-4">
        <EarbudsBatteryDemo />
        <QuickSettingsDeckDemo />
      </div>
    </div>
  );
}

/* ── Block 2: Ear (3) Audio & ANC Console ─────────────────────────────────── */
export function AudioConsoleBlock() {
  const [bass, setBass] = React.useState(68);
  const [mid, setMid] = React.useState(54);
  const [treble, setTreble] = React.useState(76);
  const [spatial, setSpatial] = React.useState(true);
  const [lowLatency, setLowLatency] = React.useState(false);
  const [playing, setPlaying] = React.useState(true);

  const bars = [
    Math.round(bass * 0.85),
    bass,
    Math.round((bass + mid) / 2),
    mid,
    Math.round(mid * 0.9),
    Math.round((mid + treble) / 2),
    treble,
    Math.round(treble * 0.88),
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-mono text-[11px] text-[var(--nt-muted)]">
              Acoustic Studio · 24-bit / 96kHz
            </div>
            <h3 className="font-display text-2xl text-[var(--nt-display)]">
              Ear (3) Parametric Console
            </h3>
          </div>
          <Button
            variant={playing ? 'signal' : 'primary'}
            size="sm"
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {playing ? 'Pause Reference' : 'Play Reference'}
          </Button>
        </div>

        <div
          aria-label="Acoustic frequency visualizer"
          className="flex h-28 items-end justify-between gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
        >
          {bars.map((val, idx) => (
            <div key={idx} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
              <div
                className={cn(
                  'w-full rounded-sm transition-all duration-150',
                  idx === 6 || idx === 7 ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]',
                  !playing && 'opacity-35',
                )}
                style={{ height: `${Math.max(12, playing ? val : Math.round(val * 0.35))}%` }}
              />
              <span className="font-mono text-[9px] tabular-nums text-[var(--nt-muted)]">
                {['60', '120', '250', '500', '1K', '2K', '4K', '8K'][idx]}
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <NothingSlider label="Sub Bass (60–120Hz)" value={bass} unit="%" onValueChange={setBass} />
          <NothingSlider label="Vocal Mid (500Hz–1kHz)" value={mid} unit="%" onValueChange={setMid} />
          <NothingSlider label="Air Treble (4kHz–8kHz)" value={treble} unit="%" onValueChange={setTreble} />
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="flex flex-col items-center gap-3">
          <GlyphMatrix
            resolution={13}
            preset={playing ? 'sound' : 'power'}
            size={140}
            label="Audio Console Glyph Indicator"
          />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            Glyph Audio Sync · {playing ? 'Active' : 'Standby'}
          </span>
        </div>

        <div className="space-y-3 border-t border-[var(--nt-line)] pt-4">
          <NothingSwitch label="Spatial Head Tracking" checked={spatial} onCheckedChange={setSpatial} />
          <NothingSwitch
            label="Ultra-Low Latency Mode (48ms)"
            tone="signal"
            checked={lowLatency}
            onCheckedChange={setLowLatency}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Block 3: Fleet Telemetry & Operations Dashboard ──────────────────────── */
interface FleetRow {
  id: string;
  device: string;
  firmware: string;
  battery: number;
  latency: number;
  status: 'Nominal' | 'Warning' | 'Offline';
}

const FLEET_DATA: FleetRow[] = [
  { id: 'NT-01', device: 'Phone (3) · London Lab', firmware: 'OS 3.1.4', battery: 92, latency: 9.4, status: 'Nominal' },
  { id: 'NT-02', device: 'Phone (3a) · Tokyo QA', firmware: 'OS 3.1.4', battery: 64, latency: 14.2, status: 'Nominal' },
  { id: 'NT-03', device: 'Ear (3) · Acoustic Rig', firmware: 'FW 2.4.1', battery: 21, latency: 28.6, status: 'Warning' },
  { id: 'NT-04', device: 'Phone (3) · Berlin Bench', firmware: 'OS 3.1.2', battery: 78, latency: 11.8, status: 'Nominal' },
  { id: 'NT-05', device: 'CMF Watch · Thermal Unit', firmware: 'FW 1.9.0', battery: 0, latency: 0, status: 'Offline' },
];

export function TelemetryOpsBlock() {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | FleetRow['status']>('All');
  const [sortKey, setSortKey] = React.useState<'battery' | 'latency'>('battery');
  const [sortAsc, setSortAsc] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<string[]>(['NT-01']);
  const [loading, setLoading] = React.useState(false);

  const filteredRows = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return FLEET_DATA.filter((row) => {
      if (statusFilter !== 'All' && row.status !== statusFilter) return false;
      if (!q) return true;
      return row.id.toLowerCase().includes(q) || row.device.toLowerCase().includes(q);
    }).sort((a, b) => (sortAsc ? a[sortKey] - b[sortKey] : b[sortKey] - a[sortKey]));
  }, [search, statusFilter, sortKey, sortAsc]);

  const toggleRow = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <div className="space-y-5">
      <MetricGridDemo />
      <SparklineStripDemo />

      <div className="space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--nt-muted)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter devices..."
              aria-label="Filter telemetry fleet"
              className="h-8 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-8 pr-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[11px]">
              {(['All', 'Nominal', 'Warning', 'Offline'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-md px-2 py-1 cursor-pointer',
                    statusFilter === s
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setLoading((l) => !l)}>
              {loading ? 'Show Data' : 'Loading State'}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)]">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-surface)] text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
                <th className="w-10 px-3 py-2.5">Sel</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Firmware</th>
                <th className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (sortKey === 'battery') setSortAsc((a) => !a);
                      else setSortKey('battery');
                    }}
                    className="inline-flex items-center gap-1 hover:text-[var(--nt-display)] cursor-pointer"
                  >
                    Battery
                    {sortKey === 'battery' && (sortAsc ? <SortAscending className="h-3 w-3" /> : <SortDescending className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    onClick={() => {
                      if (sortKey === 'latency') setSortAsc((a) => !a);
                      else setSortKey('latency');
                    }}
                    className="inline-flex items-center gap-1 hover:text-[var(--nt-display)] cursor-pointer"
                  >
                    Latency
                    {sortKey === 'latency' && (sortAsc ? <SortAscending className="h-3 w-3" /> : <SortDescending className="h-3 w-3" />)}
                  </button>
                </th>
                <th className="px-3 py-2.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nt-line)]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-3 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-[var(--nt-raised)]" />
                    </td>
                  </tr>
                ))
              ) : filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-[var(--nt-muted)]">
                    No hardware units match your filter.{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setSearch('');
                        setStatusFilter('All');
                      }}
                      className="text-[var(--nt-display)] underline cursor-pointer"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--nt-surface)]/60">
                    <td className="px-3 py-2.5">
                      <input
                        type="checkbox"
                        aria-label={`Select ${row.id}`}
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="accent-[var(--nt-accent)] cursor-pointer"
                      />
                    </td>
                    <td className="px-3 py-2.5 text-[var(--nt-display)]">
                      <span className="text-[var(--nt-muted)]">{row.id} · </span>
                      {row.device}
                    </td>
                    <td className="px-3 py-2.5 text-[var(--nt-secondary)]">{row.firmware}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--nt-display)]">
                      {row.battery}%
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums text-[var(--nt-secondary)]">
                      {row.latency > 0 ? `${row.latency.toFixed(1)} ms` : '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          row.status === 'Nominal'
                            ? 'text-[var(--nt-success)]'
                            : row.status === 'Warning'
                              ? 'text-[var(--nt-accent)]'
                              : 'text-[var(--nt-muted)]',
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="font-mono text-[11px] text-[var(--nt-muted)]">
          {selectedIds.length} unit(s) selected · {filteredRows.length} shown
        </div>
      </div>

      <RadarChartDemo />
    </div>
  );
}

/* ── Block 4: Hardware Sign-In & Passkey OTP Flow ─────────────────────────── */
export function PasskeyAuthBlock() {
  const [email, setEmail] = React.useState('engineer@nothing.tech');
  const [token, setToken] = React.useState('nt_live_9840_hardware_key');
  const [showToken, setShowToken] = React.useState(false);
  const [otp, setOtp] = React.useState<string[]>(['4', '8', '1', '', '', '']);
  const [verified, setVerified] = React.useState(false);
  const inputRefs = React.useRef<Array<HTMLInputElement | null>>([]);

  const handleOtpChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setVerified(false);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const otpComplete = otp.every((d) => d.length === 1);

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-6 md:grid-cols-12">
      <div className="md:col-span-5 flex flex-col justify-between gap-4 border-b border-[var(--nt-line)] pb-5 md:border-b-0 md:border-r md:pb-0 md:pr-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
            <LockKey className="h-4 w-4 text-[var(--nt-accent)]" />
            <span>Hardware Auth</span>
          </div>
          <h3 className="font-display text-2xl text-[var(--nt-display)]">
            Passkey &amp; OTP Console
          </h3>
          <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
            Verify device enrollment using a hardware token and 6-digit one-time code.
          </p>
        </div>
        <div className="flex justify-center">
          <GlyphMatrix
            resolution={13}
            preset={verified ? 'smiley' : 'power'}
            paintState={verified ? 'on' : 'signal'}
            size={124}
            label="Auth verification matrix"
          />
        </div>
      </div>

      <form
        className="md:col-span-7 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (otpComplete) setVerified(true);
        }}
      >
        <label className="block space-y-1">
          <span className="font-mono text-[11px] text-[var(--nt-secondary)]">Work Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
          />
        </label>

        <label className="block space-y-1">
          <span className="font-mono text-[11px] text-[var(--nt-secondary)]">Provisioning Key</span>
          <div className="relative">
            <input
              type={showToken ? 'text' : 'password'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-3 pr-9 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
            />
            <button
              type="button"
              aria-label={showToken ? 'Hide key' : 'Show key'}
              onClick={() => setShowToken((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              {showToken ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[var(--nt-secondary)]">6-Digit OTP Verification</span>
            <button
              type="button"
              onClick={() => setOtp(['4', '8', '1', '0', '2', '5'])}
              className="text-[var(--nt-accent)] hover:underline cursor-pointer"
            >
              Auto-fill 481025
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                aria-label={`OTP digit ${idx + 1}`}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    inputRefs.current[idx - 1]?.focus();
                  }
                }}
                className="h-11 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-center font-mono text-base tabular-nums text-[var(--nt-display)] focus:border-[var(--nt-accent)] focus:outline-none"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            {verified
              ? 'Verified · Hardware session active'
              : otpComplete
                ? 'Ready to verify'
                : 'Enter all 6 digits'}
          </span>
          <Button type="submit" variant={verified ? 'primary' : 'signal'} size="sm" disabled={!otpComplete}>
            {verified ? 'Session Verified' : 'Verify Passkey'}
          </Button>
        </div>
      </form>
    </div>
  );
}

/* ── Block 5: Workspace Settings & Sortable Task Shell ────────────────────── */
export function WorkspaceKanbanBlock() {
  const [view, setView] = React.useState<'board' | 'preferences'>('board');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--nt-line)] pb-3">
        <div>
          <div className="font-mono text-[11px] text-[var(--nt-muted)]">
            Nothing OS Release Shell
          </div>
          <h3 className="font-display text-xl text-[var(--nt-display)]">
            Sprint Board &amp; Deployment Preferences
          </h3>
        </div>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-xs">
          <button
            type="button"
            aria-pressed={view === 'board'}
            onClick={() => setView('board')}
            className={cn(
              'rounded-md px-3 py-1 cursor-pointer',
              view === 'board'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
            )}
          >
            Sortable Board
          </button>
          <button
            type="button"
            aria-pressed={view === 'preferences'}
            onClick={() => setView('preferences')}
            className={cn(
              'rounded-md px-3 py-1 cursor-pointer',
              view === 'preferences'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
            )}
          >
            Form Preferences
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <SortableBoardDemo />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4">
            <ComboboxDemo />
            <TagInputDemo />
          </div>
          <DateTimePickerDemo />
        </div>
      )}
    </div>
  );
}

export const BLOCK_DEFINITIONS: readonly BlockDefinition[] = [
  {
    id: 'block-os-lockscreen',
    cliTarget: 'block-os-lockscreen',
    title: 'Nothing OS Lockscreen & Hardware Deck',
    category: 'Hardware OS',
    description:
      'Complete Nothing OS hardware desktop pairing a live Dot Matrix Clock, Weather Matrix, Ear (3) Battery Rings, and 2×2 Quick Settings deck.',
    includedSlugs: ['dot-matrix-clock', 'weather-matrix', 'earbuds-battery', 'quick-settings'],
    code: `import { DotMatrixClock, WeatherMatrix, EarbudsBattery, QuickSettingsDeck } from "nthgui";

export function NothingOsLockscreenBlock() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-4">
        <DotMatrixClock format="24h" timezone="UTC" />
        <WeatherMatrix condition="clear" unit="C" />
      </div>
      <div className="lg:col-span-7 space-y-4">
        <EarbudsBattery left={88} right={84} caseLevel={62} ancMode="anc" />
        <QuickSettingsDeck />
      </div>
    </div>
  );
}`,
    render: () => <LockscreenDeckBlock />,
  },
  {
    id: 'block-audio-console',
    cliTarget: 'block-audio-console',
    title: 'Ear (3) Audio & ANC Console',
    category: 'Audio & Media',
    description:
      'Interactive acoustic equalizer with 3-band hardware sliders, live frequency bars, Spatial Audio switches, and synced 13×13 Glyph Matrix.',
    includedSlugs: ['slider', 'switch', 'glyph-matrix', 'button'],
    code: `import { Button, NothingSlider, NothingSwitch } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function AudioConsoleBlock() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-4">
        <NothingSlider label="Sub Bass (60–120Hz)" defaultValue={68} unit="%" />
        <NothingSlider label="Vocal Mid (500Hz–1kHz)" defaultValue={54} unit="%" />
        <NothingSlider label="Air Treble (4kHz–8kHz)" defaultValue={76} unit="%" />
      </div>
      <div className="lg:col-span-5 space-y-4">
        <GlyphMatrix resolution={13} preset="sound" size={140} />
        <NothingSwitch label="Spatial Head Tracking" defaultChecked />
        <Button variant="signal">Save Acoustic Profile</Button>
      </div>
    </section>
  );
}`,
    render: () => <AudioConsoleBlock />,
  },
  {
    id: 'block-telemetry-ops',
    cliTarget: 'block-telemetry-ops',
    title: 'Fleet Telemetry & Operations Dashboard',
    category: 'Telemetry & Data',
    description:
      'Single-elevation operations console combining a 4-column KPI strip, timeframe Sparklines, interactive Sortable Data Table (search/sort/loading/empty states), and 6-axis Radar chart.',
    includedSlugs: ['metric-grid', 'sparkline-strip', 'data-table', 'radar-chart'],
    code: `import { HardwareKpiGrid, SparklineStrip, DataTable, RadarChart } from "nthgui";

export function FleetTelemetryBlock() {
  return (
    <div className="space-y-5">
      <HardwareKpiGrid />
      <SparklineStrip timeframe="24h" />
      <DataTable sortable searchable selectable />
      <RadarChart dataset="phone3" />
    </div>
  );
}`,
    render: () => <TelemetryOpsBlock />,
  },
  {
    id: 'block-passkey-auth',
    cliTarget: 'block-passkey-auth',
    title: 'Hardware Sign-In & Passkey OTP Flow',
    category: 'Auth & Forms',
    description:
      'Monochrome split authentication shell with sensitive provisioning key toggle, 6-digit auto-advancing OTP input, and live Glyph status confirmation.',
    includedSlugs: ['input', 'otp-input', 'glyph-matrix', 'button'],
    code: `import { Button, Input, OtpInput } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function PasskeyAuthBlock() {
  return (
    <form className="grid grid-cols-1 gap-5 md:grid-cols-12">
      <div className="md:col-span-5 flex items-center justify-center">
        <GlyphMatrix resolution={13} preset="power" size={124} />
      </div>
      <div className="md:col-span-7 space-y-4">
        <Input label="Work Email" type="email" />
        <OtpInput length={6} />
        <Button variant="signal" type="submit">Verify Passkey</Button>
      </div>
    </form>
  );
}`,
    render: () => <PasskeyAuthBlock />,
  },
  {
    id: 'block-workspace-kanban',
    cliTarget: 'block-workspace-kanban',
    title: 'Workspace Settings & Sortable Task Shell',
    category: 'Workspace',
    description:
      'Multi-view engineering workspace combining a drag-and-drop / keyboard Sortable Board with Combobox, Tag Input, and Date & Time Picker deployment controls.',
    includedSlugs: ['sortable-board', 'combobox', 'tag-input', 'date-time-picker'],
    code: `import { SortableBoard, Combobox, TagInput, DateTimePicker } from "nthgui";

export function WorkspaceKanbanBlock() {
  return (
    <div className="space-y-5">
      <SortableBoard />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Combobox placeholder="Target hardware..." />
        <DateTimePicker />
      </div>
      <TagInput />
    </div>
  );
}`,
    render: () => <WorkspaceKanbanBlock />,
  },
];

const BLOCK_CATEGORIES: BlockCategory[] = [
  'All',
  'Hardware OS',
  'Audio & Media',
  'Telemetry & Data',
  'Auth & Forms',
  'Workspace',
];
const PACKAGE_MANAGERS: PackageManager[] = ['bun', 'pnpm', 'npm', 'yarn'];

export function BlocksGallery({
  onSelectComponent,
}: {
  onSelectComponent: (slug: string) => void;
}) {
  const [category, setCategory] = React.useState<BlockCategory>('All');
  const [pm, setPm] = React.useState<PackageManager>('npm');
  const [tabByBlock, setTabByBlock] = React.useState<Record<string, 'preview' | 'code'>>({});
  const [viewportByBlock, setViewportByBlock] = React.useState<Record<string, ViewportMode>>({});
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const visibleBlocks = React.useMemo(
    () =>
      category === 'All'
        ? BLOCK_DEFINITIONS
        : BLOCK_DEFINITIONS.filter((b) => b.category === category),
    [category],
  );

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header id="blocks-header" className="scroll-mt-20 space-y-3 border-b border-[var(--nt-line)] pb-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="text-[var(--nt-display)]">Nothing OS Blocks</span>
          <span aria-hidden="true">·</span>
          <span>5 Copy-Paste Page Templates</span>
          <span aria-hidden="true">·</span>
          <span>Single Package: nthgui</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)] text-balance">
              Pre-Built Nothing OS Blocks
            </h1>
            <p className="text-sm leading-relaxed text-[var(--nt-secondary)]">
              Full interactive layouts assembled exclusively from <code className="font-mono text-xs text-[var(--nt-display)]">nthgui</code>{' '}
              components. Switch viewports, test real state, inspect source code, or scaffold straight into your project via CLI.
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[11px]">
            {PACKAGE_MANAGERS.map((manager) => (
              <button
                key={manager}
                type="button"
                aria-pressed={pm === manager}
                onClick={() => setPm(manager)}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                  pm === manager
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div id="blocks-filter" className="scroll-mt-20 flex flex-wrap items-center gap-1.5">
        {BLOCK_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            aria-pressed={category === cat}
            onClick={() => setCategory(cat)}
            className={cn(
              'rounded-lg border px-3 py-1.5 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
              category === cat
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Block Cards */}
      <div className="space-y-10">
        {visibleBlocks.map((block) => {
          const activeTab = tabByBlock[block.id] ?? 'preview';
          const viewport = viewportByBlock[block.id] ?? 'desktop';
          const cliCmd = formatCliAdd(pm, block.cliTarget);

          return (
            <section
              key={block.id}
              id={block.id}
              data-testid={`block-card-${block.id}`}
              className="scroll-mt-20 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="font-mono text-[11px] text-[var(--nt-muted)]">
                    {block.category} · {block.includedSlugs.length} components
                  </div>
                  <h2 className="font-display text-2xl text-[var(--nt-display)]">
                    {block.title}
                  </h2>
                  <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                    {block.description}
                  </p>
                </div>

                {/* Controls: Preview/Code + Viewport Width */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-xs">
                    <button
                      type="button"
                      aria-pressed={activeTab === 'preview'}
                      onClick={() => setTabByBlock((p) => ({ ...p, [block.id]: 'preview' }))}
                      className={cn(
                        'rounded-md px-2.5 py-1 cursor-pointer',
                        activeTab === 'preview'
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      aria-pressed={activeTab === 'code'}
                      onClick={() => setTabByBlock((p) => ({ ...p, [block.id]: 'code' }))}
                      className={cn(
                        'inline-flex items-center gap-1 rounded-md px-2.5 py-1 cursor-pointer',
                        activeTab === 'code'
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      <Code className="h-3.5 w-3.5" />
                      Code
                    </button>
                  </div>

                  {activeTab === 'preview' && (
                    <div className="hidden sm:inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5">
                      {(
                        [
                          { id: 'desktop', icon: Desktop, label: 'Desktop width' },
                          { id: 'tablet', icon: DeviceTablet, label: 'Tablet width' },
                          { id: 'mobile', icon: DeviceMobile, label: 'Mobile width' },
                        ] as const
                      ).map(({ id, icon: Icon, label }) => (
                        <button
                          key={id}
                          type="button"
                          aria-label={label}
                          aria-pressed={viewport === id}
                          onClick={() => setViewportByBlock((p) => ({ ...p, [block.id]: id }))}
                          className={cn(
                            'inline-flex h-7 w-7 items-center justify-center rounded-md cursor-pointer',
                            viewport === id
                              ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                              : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Single-Package CLI Copy Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3.5 py-2.5">
                <div className="flex items-center gap-2 min-w-0 font-mono text-xs">
                  <Terminal className="h-3.5 w-3.5 shrink-0 text-[var(--nt-accent)]" />
                  <code className="truncate text-[var(--nt-display)]">{cliCmd}</code>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(`cli-${block.id}`, cliCmd)}
                >
                  {copiedKey === `cli-${block.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedKey === `cli-${block.id}` ? 'Copied' : 'Copy CLI'}
                </Button>
              </div>

              {/* Stage or Code */}
              {activeTab === 'preview' ? (
                <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-raised)]/30 p-4">
                  <div
                    className={cn(
                      'mx-auto transition-all duration-200',
                      viewport === 'desktop'
                        ? 'w-full'
                        : viewport === 'tablet'
                          ? 'max-w-[768px]'
                          : 'max-w-[390px]',
                    )}
                  >
                    {block.render()}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleCopy(`code-${block.id}`, block.code)}
                    >
                      {copiedKey === `code-${block.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      {copiedKey === `code-${block.id}` ? 'Copied TSX' : 'Copy TSX'}
                    </Button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-xs leading-relaxed text-[var(--nt-primary)]">
                    <code>{block.code}</code>
                  </pre>
                </div>
              )}

              {/* Component Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
                <span className="text-[var(--nt-muted)]">Primitives used:</span>
                {block.includedSlugs.map((slug) => (
                  <button
                    key={slug}
                    type="button"
                    onClick={() => onSelectComponent(slug)}
                    className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2 py-0.5 text-[var(--nt-secondary)] hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] cursor-pointer"
                  >
                    {slug} →
                  </button>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
