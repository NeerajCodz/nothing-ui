import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Bluetooth,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  Clock,
  Copy,
  DotsSixVertical,
  Lightning,
  MagnifyingGlass,
  Moon,
  Plus,
  SidebarSimple,
  Sparkle,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextItalic,
  Trash,
  WifiHigh,
  X,
} from '@phosphor-icons/react';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import {
  Button,
  InteractiveRadarChart,
  InteractiveSparklineStrip,
  NothingLoader,
  cn,
  useAsyncAction,
  useResolvedLoading,
} from '@nothing-ui/ui';

export const V02_EXPANDED_SLUGS = new Set([
  'dot-matrix-clock',
  'earbuds-battery',
  'weather-matrix',
  'quick-settings',
  'combobox',
  'date-time-picker',
  'tag-input',
  'sparkline-strip',
  'radar-chart',
  'metric-grid',
  'hover-card',
  'context-menu',
  'sortable-board',
  'sidebar',
  'table-of-contents',
  'toolbar',
]);

/* ───────────────────────────────────────────────────────────────────────────
 * 01. Dot Matrix Clock
 * ─────────────────────────────────────────────────────────────────────────── */
const CLOCK_CITIES = [
  { id: 'UTC', label: 'UTC', offset: 0 },
  { id: 'LON', label: 'London', offset: 0 },
  { id: 'TYO', label: 'Tokyo', offset: 9 },
  { id: 'SFO', label: 'San Francisco', offset: -8 },
] as const;

export function DotMatrixClockDemo() {
  const [format, setFormat] = React.useState<'24h' | '12h'>('24h');
  const [cityIdx, setCityIdx] = React.useState(0);
  const [now, setNow] = React.useState(() => new Date());
  const { loading: syncing, trigger: syncNtp } = useAsyncAction(800);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: syncing });

  React.useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const city = CLOCK_CITIES[cityIdx];
  const shifted = new Date(now.getTime() + city.offset * 3600_000);
  const rawHours = shifted.getUTCHours();
  const displayHours =
    format === '24h'
      ? String(rawHours).padStart(2, '0')
      : String(rawHours % 12 || 12).padStart(2, '0');
  const minutes = String(shifted.getUTCMinutes()).padStart(2, '0');
  const seconds = String(shifted.getUTCSeconds()).padStart(2, '0');
  const meridiem = rawHours >= 12 ? 'PM' : 'AM';
  const blinkOn = shifted.getUTCSeconds() % 2 === 0;

  return (
    <div
      aria-busy={isLoading || undefined}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="flex items-center justify-between gap-2 font-mono text-xs text-[var(--nt-muted)]">
        <span>
          {city.label} · UTC{city.offset >= 0 ? `+${city.offset}` : city.offset}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            loadingText="Syncing..."
            onClick={() => syncNtp(() => setNow(new Date()))}
          >
            Sync NTP
          </Button>
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
            {(['24h', '12h'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={format === mode}
                onClick={() => setFormat(mode)}
                className={cn(
                  'rounded-md px-2 py-0.5 font-mono text-[11px] cursor-pointer',
                  format === mode
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-baseline justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-5 py-6">
        {isLoading ? (
          <div className="flex w-full items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <NothingLoader variant={loaderVariant} size="md" label="Synchronizing NTP clock" />
              <span className="font-mono text-xs text-[var(--nt-secondary)]">
                Syncing atomic time offset...
              </span>
            </div>
            <span className="font-mono text-xs tabular-nums text-[var(--nt-muted)]">--:--</span>
          </div>
        ) : (
          <>
            <time
              dateTime={shifted.toISOString()}
              className="flex items-baseline gap-1 font-display text-5xl sm:text-6xl tracking-[0.06em] tabular-nums text-[var(--nt-display)]"
            >
              <span>{displayHours}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'transition-opacity duration-150',
                  blinkOn ? 'text-[var(--nt-accent)] opacity-100' : 'opacity-25',
                )}
              >
                :
              </span>
              <span>{minutes}</span>
            </time>
            <div className="text-right font-mono tabular-nums">
              <div className="text-lg text-[var(--nt-accent)]">{seconds}</div>
              {format === '12h' && (
                <div className="text-[11px] text-[var(--nt-muted)]">{meridiem}</div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {CLOCK_CITIES.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={cityIdx === idx}
            onClick={() => setCityIdx(idx)}
            className={cn(
              'rounded-lg border px-2 py-1.5 font-mono text-[11px] transition-colors cursor-pointer',
              cityIdx === idx
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {c.id}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 02. Earbuds & Battery Telemetry
 * ─────────────────────────────────────────────────────────────────────────── */
function BatteryRing({ label, value, charging }: { label: string; value: number; charging: boolean }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;
  const critical = value < 25;

  return (
    <div
      role="meter"
      aria-label={`${label} battery`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="flex flex-col items-center gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3"
    >
      <div className="relative flex h-16 w-16 items-center justify-center">
        <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r={radius} stroke="var(--nt-line-2)" strokeWidth="4" fill="none" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            stroke={critical || charging ? 'var(--nt-accent)' : 'var(--nt-display)'}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
          />
        </svg>
        <span className="absolute font-mono text-xs font-medium tabular-nums text-[var(--nt-display)]">
          {value}%
        </span>
      </div>
      <span className="font-mono text-[11px] text-[var(--nt-secondary)]">
        {label} {charging ? '· CHG' : ''}
      </span>
    </div>
  );
}

export function EarbudsBatteryDemo() {
  const [ancMode, setAncMode] = React.useState<'anc' | 'transparency' | 'off'>('anc');
  const [charging, setCharging] = React.useState(false);
  const [levels, setLevels] = React.useState({ left: 88, right: 84, caseLevel: 62 });
  const { loading: scanning, trigger: scanBle } = useAsyncAction(850);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: scanning });

  React.useEffect(() => {
    if (!charging) return;
    const id = window.setInterval(() => {
      setLevels((prev) => ({
        left: Math.min(100, prev.left + 1),
        right: Math.min(100, prev.right + 1),
        caseLevel: Math.min(100, prev.caseLevel + 2),
      }));
    }, 900);
    return () => window.clearInterval(id);
  }, [charging]);

  return (
    <div
      aria-busy={isLoading || undefined}
      className="mx-auto max-w-lg space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-display text-lg text-[var(--nt-display)]">EAR (3) · LDAC 990K</div>
          <div className="font-mono text-[11px] text-[var(--nt-muted)]">
            {isLoading
              ? 'Scanning BLE GATT battery service...'
              : `Firmware v2.4.1 · ${ancMode === 'anc' ? 'Adaptive ANC 45dB' : ancMode === 'transparency' ? 'Ambient Pass-through' : 'Passive Isolation'}`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            loadingText="Scanning..."
            onClick={() =>
              scanBle(() =>
                setLevels((prev) => ({
                  left: Math.max(20, Math.min(100, prev.left)),
                  right: Math.max(20, Math.min(100, prev.right)),
                  caseLevel: Math.max(15, Math.min(100, prev.caseLevel)),
                })),
              )
            }
          >
            Scan BLE
          </Button>
          <Button
            variant={charging ? 'signal' : 'outline'}
            size="sm"
            ignorePreviewLoading
            onClick={() => setCharging((c) => !c)}
          >
            <Lightning className="h-3.5 w-3.5" weight="fill" />
            {charging ? 'Charging' : 'Simulate Charge'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {isLoading ? (
          ['Left', 'Right', 'Case'].map((label) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 h-[112px]"
            >
              <NothingLoader variant={loaderVariant} size="md" label={`Scanning ${label} battery`} />
              <span className="font-mono text-[11px] text-[var(--nt-muted)]">{label}</span>
            </div>
          ))
        ) : (
          <>
            <BatteryRing label="Left" value={levels.left} charging={charging} />
            <BatteryRing label="Right" value={levels.right} charging={charging} />
            <BatteryRing label="Case" value={levels.caseLevel} charging={charging} />
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1">
        {(
          [
            { id: 'anc', label: 'ANC High' },
            { id: 'transparency', label: 'Transparency' },
            { id: 'off', label: 'Off' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={ancMode === m.id}
            onClick={() => setAncMode(m.id)}
            className={cn(
              'rounded-lg py-1.5 font-mono text-xs transition-colors cursor-pointer whitespace-nowrap',
              ancMode === m.id
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 03. Weather Matrix
 * ─────────────────────────────────────────────────────────────────────────── */
const WEATHER_PROFILES = {
  clear: { label: 'Clear Sky', icon: 'sun' as const, tempC: 21, humidity: '42%', wind: '11 km/h', hours: ['14:00 · 21°', '16:00 · 22°', '18:00 · 19°', '20:00 · 16°'] },
  rain: { label: 'Light Rain', icon: 'cloud' as const, tempC: 14, humidity: '78%', wind: '18 km/h', hours: ['14:00 · 14°', '16:00 · 13°', '18:00 · 12°', '20:00 · 11°'] },
  storm: { label: 'Electrical Storm', icon: 'bolt' as const, tempC: 12, humidity: '86%', wind: '34 km/h', hours: ['14:00 · 12°', '16:00 · 11°', '18:00 · 10°', '20:00 · 10°'] },
  fog: { label: 'Night Clear', icon: 'moon' as const, tempC: 9, humidity: '68%', wind: '6 km/h', hours: ['22:00 · 9°', '00:00 · 8°', '02:00 · 7°', '04:00 · 7°'] },
};

export function WeatherMatrixDemo() {
  const [condition, setCondition] = React.useState<keyof typeof WEATHER_PROFILES>('clear');
  const [unit, setUnit] = React.useState<'C' | 'F'>('C');
  const { loading: fetching, trigger: refreshWeather } = useAsyncAction(750);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: fetching });
  const profile = WEATHER_PROFILES[condition];
  const temp = unit === 'C' ? profile.tempC : Math.round((profile.tempC * 9) / 5 + 32);

  return (
    <div
      aria-busy={isLoading || undefined}
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
        <span>London · 51.50°N</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            loading={isLoading}
            loadingText="Updating..."
            onClick={() => refreshWeather()}
          >
            Refresh
          </Button>
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5">
            {(['C', 'F'] as const).map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={unit === u}
                onClick={() => setUnit(u)}
                className={cn(
                  'rounded px-2 py-0.5 text-[11px] cursor-pointer',
                  unit === u
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                )}
              >
                °{u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5">
        {isLoading ? (
          <div className="flex w-full items-center justify-between py-2">
            <div className="space-y-2">
              <div className="h-8 w-24 rounded bg-[var(--nt-raised)] animate-pulse" />
              <div className="h-3 w-44 rounded bg-[var(--nt-raised)] animate-pulse" />
            </div>
            <NothingLoader variant={loaderVariant} size="lg" label="Loading weather telemetry" />
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="font-display text-5xl tabular-nums text-[var(--nt-display)]">
                {temp}°{unit}
              </div>
              <div className="font-mono text-xs text-[var(--nt-secondary)]">
                {profile.label} · Hum {profile.humidity} · Wind {profile.wind}
              </div>
            </div>
            <DotIcon
              name={profile.icon}
              size={48}
              color={condition === 'storm' ? '#D71921' : 'currentColor'}
              decorative
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-4 gap-1.5 font-mono text-[11px] tabular-nums">
        {profile.hours.map((slot) => (
          <div
            key={slot}
            className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2 py-1.5 text-center text-[var(--nt-secondary)]"
          >
            {isLoading ? '··:··' : slot}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {(Object.keys(WEATHER_PROFILES) as Array<keyof typeof WEATHER_PROFILES>).map((key) => (
          <button
            key={key}
            type="button"
            aria-pressed={condition === key}
            onClick={() => {
              setCondition(key);
              refreshWeather();
            }}
            className={cn(
              'rounded-lg border px-2 py-1 font-mono text-[11px] capitalize cursor-pointer',
              condition === key
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
            )}
          >
            {key}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 04. Quick Settings Deck
 * ─────────────────────────────────────────────────────────────────────────── */
export function QuickSettingsDeckDemo() {
  const [tiles, setTiles] = React.useState([
    { id: 'wifi', label: 'Wi-Fi 7', activeText: 'Studio-5G', idleText: 'Off', active: true, signal: false, icon: WifiHigh },
    { id: 'bt', label: 'Bluetooth', activeText: 'Ear (3)', idleText: 'Disconnected', active: true, signal: false, icon: Bluetooth },
    { id: 'glyph', label: 'Glyph Matrix', activeText: 'Active · 80%', idleText: 'Muted', active: true, signal: true, icon: Sparkle },
    { id: 'dnd', label: 'Do Not Disturb', activeText: 'Priority Only', idleText: 'All Alerts', active: false, signal: false, icon: Moon },
  ]);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const { loading: previewLoading, loaderVariant } = useResolvedLoading({});

  const toggle = (id: string) => {
    setBusyId(id);
    window.setTimeout(() => {
      setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, active: !t.active } : t)));
      setBusyId(null);
    }, 550);
  };

  const activeCount = tiles.filter((t) => t.active).length;

  return (
    <div className="mx-auto max-w-md space-y-3 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
      <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
        <span>Quick Settings</span>
        <span className="tabular-nums text-[var(--nt-display)]">{activeCount} / {tiles.length} active</span>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const tileLoading = previewLoading || busyId === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              disabled={tileLoading}
              aria-pressed={tile.active}
              aria-busy={tileLoading || undefined}
              onClick={() => toggle(tile.id)}
              className={cn(
                'flex flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-colors cursor-pointer disabled:cursor-wait',
                tile.active
                  ? tile.signal
                    ? 'border-[var(--nt-accent)] bg-[var(--nt-accent)] text-white'
                    : 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)]',
              )}
            >
              {tileLoading ? (
                <NothingLoader variant={loaderVariant} size="sm" decorative />
              ) : (
                <Icon className="h-4 w-4" weight={tile.active ? 'fill' : 'regular'} />
              )}
              <div>
                <div className="font-mono text-xs font-medium">{tile.label}</div>
                <div className={cn('font-mono text-[10px]', tile.active ? 'opacity-80' : 'text-[var(--nt-muted)]')}>
                  {tileLoading ? 'Connecting...' : tile.active ? tile.activeText : tile.idleText}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 05. Searchable Combobox
 * ─────────────────────────────────────────────────────────────────────────── */
const HARDWARE_OPTIONS = [
  { value: 'phone-3', label: 'Phone (3)', meta: '25×25 Glyph · 481 LEDs' },
  { value: 'phone-3a', label: 'Phone (3a) Pro', meta: '13×13 Glyph · 121 LEDs' },
  { value: 'ear-3', label: 'Ear (3)', meta: '45dB ANC · LDAC' },
  { value: 'cmf-watch', label: 'CMF Watch Pro 2', meta: 'Rotary Bezel · AMOLED' },
  { value: 'power-65', label: 'Power (65W) GaN', meta: 'Triple Port · PPS' },
];

export function ComboboxDemo() {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('phone-3');
  const [highlightIdx, setHighlightIdx] = React.useState(0);
  const { loading: searching, trigger: simulateSearch } = useAsyncAction(380);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: searching });

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HARDWARE_OPTIONS;
    return HARDWARE_OPTIONS.filter(
      (o) => o.label.toLowerCase().includes(q) || o.meta.toLowerCase().includes(q),
    );
  }, [query]);

  const activeOpt = HARDWARE_OPTIONS.find((o) => o.value === selected);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setHighlightIdx((i) => Math.min(Math.max(filtered.length - 1, 0), i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter' && open && filtered[highlightIdx]) {
      e.preventDefault();
      setSelected(filtered[highlightIdx].value);
      setQuery(filtered[highlightIdx].label);
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-3" aria-busy={isLoading || undefined}>
      <label htmlFor="nt-combobox-input" className="block font-mono text-xs text-[var(--nt-secondary)]">
        Target Hardware Profile
      </label>
      <div className="relative">
        <div className="flex items-center rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-3 focus-within:border-[var(--nt-display)]">
          <MagnifyingGlass className="h-4 w-4 shrink-0 text-[var(--nt-muted)]" />
          <input
            id="nt-combobox-input"
            role="combobox"
            aria-expanded={open}
            aria-controls="nt-combobox-listbox"
            aria-autocomplete="list"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
              setHighlightIdx(0);
              simulateSearch();
            }}
            onKeyDown={handleKeyDown}
            placeholder={activeOpt ? activeOpt.label : 'Search Nothing hardware...'}
            className="h-10 w-full bg-transparent px-2.5 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none"
          />
          {isLoading ? (
            <NothingLoader variant={loaderVariant} size="sm" label="Searching hardware" className="mr-1" />
          ) : (
            query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery('');
                  setHighlightIdx(0);
                }}
                className="p-1 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )
          )}
          <button
            type="button"
            aria-label="Toggle hardware list"
            onClick={() => setOpen((o) => !o)}
            className="p-1 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            <CaretDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {(open || isLoading) && (
          <ul
            id="nt-combobox-listbox"
            role="listbox"
            className="mt-1.5 max-h-56 overflow-auto rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1 shadow-xl"
          >
            {isLoading ? (
              <li className="flex items-center justify-center gap-2 px-3 py-4 font-mono text-xs text-[var(--nt-muted)]">
                <NothingLoader variant={loaderVariant} size="sm" decorative />
                <span>Searching hardware catalog...</span>
              </li>
            ) : filtered.length === 0 ? (
              <li className="px-3 py-4 text-center font-mono text-xs text-[var(--nt-muted)]">
                No hardware matches &ldquo;{query}&rdquo;.
              </li>
            ) : (
              filtered.map((opt, idx) => {
                const isSelected = opt.value === selected;
                return (
                  <li key={opt.value} role="option" aria-selected={isSelected}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(opt.value);
                        setQuery(opt.label);
                        setOpen(false);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left font-mono text-xs transition-colors cursor-pointer',
                        idx === highlightIdx
                          ? 'bg-[var(--nt-raised)] text-[var(--nt-display)]'
                          : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)]/60',
                      )}
                    >
                      <span>
                        <span className="font-medium text-[var(--nt-display)]">{opt.label}</span>
                        <span className="ml-2 text-[11px] text-[var(--nt-muted)]">{opt.meta}</span>
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[var(--nt-accent)]" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>

      <div className="font-mono text-[11px] text-[var(--nt-muted)]">
        Selected: <span className="text-[var(--nt-display)]">{activeOpt?.label}</span> · {activeOpt?.meta}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 06. Date & Time Picker
 * ─────────────────────────────────────────────────────────────────────────── */
const TIME_SLOTS = ['09:00', '10:30', '13:00', '15:30', '18:00', '20:30'];

export function DateTimePickerDemo() {
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [selectedDay, setSelectedDay] = React.useState(19);
  const [timeSlot, setTimeSlot] = React.useState('13:00');
  const { loading: fetchingSlots, trigger: loadSlots } = useAsyncAction(450);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: fetchingSlots });

  const baseDate = new Date(2026, 10 + monthOffset, 1);
  const year = baseDate.getFullYear();
  const monthIdx = baseDate.getMonth();
  const monthLabel = baseDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const firstWeekday = baseDate.getDay();

  const clampedDay = Math.min(selectedDay, daysInMonth);
  const isoString = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(clampedDay).padStart(2, '0')}T${timeSlot}:00Z`;

  return (
    <div
      aria-busy={isLoading || undefined}
      className="mx-auto max-w-xl rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-12">
        <div className="sm:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-xs font-medium text-[var(--nt-display)]">
              <CalendarBlank className="h-4 w-4 text-[var(--nt-muted)]" />
              {monthLabel}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => {
                  setMonthOffset((m) => m - 1);
                  loadSlots();
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <CaretLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => {
                  setMonthOffset((m) => m + 1);
                  loadSlots();
                }}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <CaretRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[var(--nt-muted)]">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const active = day === clampedDay;
              return (
                <button
                  key={day}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelectedDay(day);
                    loadSlots();
                  }}
                  className={cn(
                    'h-8 rounded-md font-mono text-xs tabular-nums transition-colors cursor-pointer',
                    active
                      ? 'bg-[var(--nt-accent)] text-white font-medium'
                      : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-5 flex flex-col justify-between space-y-3 border-t border-[var(--nt-line)] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-display)]">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--nt-muted)]" />
                Release Window (UTC)
              </span>
              {isLoading && <NothingLoader variant={loaderVariant} size="sm" label="Loading slots" />}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {isLoading
                ? TIME_SLOTS.map((slot) => (
                    <div
                      key={slot}
                      className="h-9 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-raised)] animate-pulse"
                    />
                  ))
                : TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      aria-pressed={timeSlot === slot}
                      onClick={() => setTimeSlot(slot)}
                      className={cn(
                        'rounded-lg border py-2 font-mono text-xs tabular-nums transition-colors cursor-pointer',
                        timeSlot === slot
                          ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      {slot}
                    </button>
                  ))}
            </div>
          </div>

          <div className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-[11px]">
            <div className="text-[var(--nt-muted)]">Scheduled ISO</div>
            <div className="mt-0.5 tabular-nums text-[var(--nt-display)]">{isoString}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 07. Tag Input
 * ─────────────────────────────────────────────────────────────────────────── */
const SUGGESTED_TAGS = ['nothing-ui', 'glyph-25x25', 'monochrome', 'wcag-aaa', 'react-native', 'tailwind-v4'];

export function TagInputDemo() {
  const [tags, setTags] = React.useState<string[]>(['nothing-ui', 'glyph-25x25', 'wcag-aaa']);
  const [draft, setDraft] = React.useState('');
  const { loading: validating, trigger } = useAsyncAction(420);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: validating });

  const addTag = (raw: string) => {
    const clean = raw.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (!clean || tags.includes(clean) || tags.length >= 8) return;
    trigger(() => {
      setTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setDraft('');
    });
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  return (
    <div className="mx-auto max-w-lg space-y-3" aria-busy={isLoading || undefined}>
      <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
        <label htmlFor="nt-tag-input">Registry Keywords</label>
        <span className="tabular-nums">{tags.length} / 8</span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-2.5 focus-within:border-[var(--nt-display)]">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-2.5 py-1 font-mono text-xs text-[var(--nt-display)]"
          >
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => removeTag(tag)}
              className="text-[var(--nt-muted)] hover:text-[var(--nt-accent)] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id="nt-tag-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === 'Backspace' && !draft && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          placeholder="Type tag & press Enter..."
          className="min-w-[140px] flex-1 bg-transparent px-1 py-1 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none"
        />
        {isLoading && <NothingLoader variant={loaderVariant} size="sm" label="Validating keyword" />}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
        <span className="text-[var(--nt-muted)]">Quick add:</span>
        {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((s) => (
          <button
            key={s}
            type="button"
            disabled={isLoading}
            onClick={() => addTag(s)}
            className="rounded-md border border-[var(--nt-line)] px-2 py-0.5 text-[var(--nt-secondary)] hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] cursor-pointer disabled:opacity-50"
          >
            + {s}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 08. Sparkline Telemetry Strip (Interactive Multi-Series Synchronized Strip)
 * ─────────────────────────────────────────────────────────────────────────── */
export function SparklineStripDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveSparklineStrip />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 09. Radar & Bar Matrix Chart (Interactive Multi-Series Radar Overlay)
 * ─────────────────────────────────────────────────────────────────────────── */
export function RadarChartDemo() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <InteractiveRadarChart />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 10. Hardware KPI Grid
 * ─────────────────────────────────────────────────────────────────────────── */
export function MetricGridDemo() {
  const [tick, setTick] = React.useState(0);
  const { loading: refreshing, trigger: refreshSample } = useAsyncAction(750);
  const { loading: isLoading } = useResolvedLoading({ loading: refreshing });
  const metrics = [
    { label: 'Active Nodes', value: String(1284 + tick * 3), delta: '+4.2%', state: 'Nominal' },
    { label: 'Sync Latency', value: `${(11.4 + (tick % 3) * 0.3).toFixed(1)} ms`, delta: '-1.8 ms', state: 'Nominal' },
    { label: 'Packet Loss', value: `${(0.12 + (tick % 2) * 0.04).toFixed(2)}%`, delta: '+0.02%', state: 'Warning' },
    { label: 'Package Size', value: '14.2 kB', delta: '1 pkg', state: 'Nominal' },
  ];

  return (
    <div className="space-y-3" aria-busy={isLoading || undefined}>
      <div className="flex items-center justify-between font-mono text-xs text-[var(--nt-muted)]">
        <span>Fleet Overview · Single-elevation 1px grid</span>
        <Button
          variant="outline"
          size="sm"
          loading={isLoading}
          loadingText="Refreshing..."
          onClick={() => refreshSample(() => setTick((t) => t + 1))}
        >
          Refresh Sample
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-line)] lg:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="space-y-1.5 bg-[var(--nt-bg)] p-4">
            <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span>{m.label}</span>
              <span className={m.state === 'Warning' ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-success)]'}>
                {isLoading ? 'Sync' : m.state}
              </span>
            </div>
            {isLoading ? (
              <>
                <div className="h-8 w-20 rounded bg-[var(--nt-raised)] animate-pulse" />
                <div className="h-3.5 w-14 rounded bg-[var(--nt-raised)] animate-pulse" />
              </>
            ) : (
              <>
                <div className="font-display text-2xl tabular-nums text-[var(--nt-display)]">{m.value}</div>
                <div className="font-mono text-[11px] tabular-nums text-[var(--nt-secondary)]">{m.delta}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 11. Hover Card
 * ─────────────────────────────────────────────────────────────────────────── */
export function HoverCardDemo() {
  const [open, setOpen] = React.useState(false);
  const { loading: previewLoading, loaderVariant } = useResolvedLoading({});
  const showCard = open || previewLoading;

  return (
    <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
      <div
        className="relative inline-block"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          aria-expanded={showCard}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onClick={() => setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          className="font-mono text-sm text-[var(--nt-display)] underline decoration-[var(--nt-accent)] underline-offset-4 cursor-pointer"
        >
          nthgui@0.1.0
        </button>

        {showCard && (
          <div
            role="dialog"
            aria-label="nthgui package preview"
            aria-busy={previewLoading || undefined}
            className="absolute left-1/2 top-full z-20 mt-2.5 w-72 -translate-x-1/2 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 shadow-2xl space-y-2.5"
          >
            {previewLoading ? (
              <div className="flex items-center gap-2.5 py-3 font-mono text-xs text-[var(--nt-muted)]">
                <NothingLoader variant={loaderVariant} size="sm" decorative />
                <span>Fetching package metadata...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between font-mono text-xs">
                  <span className="font-medium text-[var(--nt-display)]">nthgui</span>
                  <span className="text-[var(--nt-accent)]">Single Package</span>
                </div>
                <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
                  Unified React & React Native design system. Zero scoped sub-package installs required.
                </p>
                <div className="flex items-center justify-between border-t border-[var(--nt-line)] pt-2 font-mono text-[10px] text-[var(--nt-muted)]">
                  <span>111 Live Modules</span>
                  <span>1,691 Dot Icons</span>
                  <span>WCAG AAA</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <span className="font-mono text-[11px] text-[var(--nt-muted)]">
        Hover, focus, or click the trigger above to inspect.
      </span>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 12. Context Menu
 * ─────────────────────────────────────────────────────────────────────────── */
export function ContextMenuDemo() {
  const [menuPos, setMenuPos] = React.useState<{ x: number; y: number } | null>(null);
  const [lastAction, setLastAction] = React.useState('Right-click surface or press Open Menu');
  const { loading: running, trigger } = useAsyncAction(650);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: running });

  const triggerAction = (label: string) => {
    setMenuPos(null);
    setLastAction(`Running: ${label}...`);
    trigger(() => setLastAction(`Executed: ${label}`));
  };

  return (
    <div className="space-y-3" aria-busy={isLoading || undefined}>
      <div
        onContextMenu={(e) => {
          e.preventDefault();
          const rect = e.currentTarget.getBoundingClientRect();
          setMenuPos({
            x: Math.min(e.clientX - rect.left, Math.max(rect.width - 210, 12)),
            y: Math.min(e.clientY - rect.top, Math.max(rect.height - 150, 12)),
          });
        }}
        onClick={() => setMenuPos(null)}
        className="relative flex min-h-[190px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-6 text-center"
      >
        <p className="font-mono text-xs text-[var(--nt-secondary)]">
          Right-click anywhere inside this hardware zone
        </p>
        <Button
          variant="outline"
          size="sm"
          loading={isLoading}
          loadingText="Running..."
          onClick={(e) => {
            e.stopPropagation();
            setMenuPos({ x: 24, y: 24 });
          }}
        >
          Open Menu (Keyboard / Touch)
        </Button>
        <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
          {isLoading && <NothingLoader variant={loaderVariant} size="sm" decorative />}
          <span>{lastAction}</span>
        </div>

        {menuPos && (
          <div
            role="menu"
            style={{ left: menuPos.x, top: menuPos.y }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setMenuPos(null);
            }}
            className="absolute z-20 w-52 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1.5 text-left shadow-2xl"
          >
            {[
              { label: 'Copy CLI Command', shortcut: '⌘C', icon: Copy, destructive: false },
              { label: 'Inspect Registry JSON', shortcut: '⌘J', icon: Sparkle, destructive: false },
              { label: 'Reset Matrix State', shortcut: '⌫', icon: Trash, destructive: true },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  onClick={() => triggerAction(item.label)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 font-mono text-xs transition-colors cursor-pointer',
                    item.destructive
                      ? 'text-[var(--nt-accent)] hover:bg-[var(--nt-accent)]/10'
                      : 'text-[var(--nt-display)] hover:bg-[var(--nt-raised)]',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </span>
                  <span className="text-[10px] text-[var(--nt-muted)]">{item.shortcut}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 13. Sortable Board
 * ─────────────────────────────────────────────────────────────────────────── */
interface BoardTask {
  id: string;
  title: string;
  column: 'backlog' | 'active' | 'shipped';
}

const INITIAL_TASKS: BoardTask[] = [
  { id: 't1', title: 'Consolidate npm publish to nthgui', column: 'shipped' },
  { id: 't2', title: 'Wire 25×25 Glyph circular mask', column: 'shipped' },
  { id: 't3', title: 'Build Ear (3) Audio Console block', column: 'active' },
  { id: 't4', title: 'Audit WCAG AAA contrast ratios', column: 'active' },
  { id: 't5', title: 'Add Expo Native OTA preview', column: 'backlog' },
];

const COLUMNS: Array<{ id: BoardTask['column']; label: string }> = [
  { id: 'backlog', label: 'Backlog' },
  { id: 'active', label: 'Active' },
  { id: 'shipped', label: 'Shipped' },
];

export function SortableBoardDemo() {
  const [tasks, setTasks] = React.useState<BoardTask[]>(INITIAL_TASKS);
  const [newTask, setNewTask] = React.useState('');
  const [dragId, setDragId] = React.useState<string | null>(null);
  const { loading: saving, trigger: persistBoard } = useAsyncAction(550);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: saving });

  const moveColumn = (id: string, nextCol: BoardTask['column']) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, column: nextCol } : t)));
    persistBoard();
  };

  const reorderWithinColumn = (id: string, dir: -1 | 1) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx < 0) return prev;
      const col = prev[idx].column;
      const sameColIndices = prev
        .map((t, i) => (t.column === col ? i : -1))
        .filter((i) => i >= 0);
      const pos = sameColIndices.indexOf(idx);
      const swapPos = pos + dir;
      if (swapPos < 0 || swapPos >= sameColIndices.length) return prev;
      const targetIdx = sameColIndices[swapPos];
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next;
    });
    persistBoard();
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTask.trim();
    if (!title) return;
    persistBoard(() => {
      setTasks((prev) => [...prev, { id: `t-${Date.now()}`, title, column: 'backlog' }]);
      setNewTask('');
    });
  };

  return (
    <div className="space-y-4" aria-busy={isLoading || undefined}>
      <form onSubmit={handleAdd} className="flex items-center gap-2">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add hardware sprint task..."
          aria-label="New board task"
          className="h-9 flex-1 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
        />
        <Button type="submit" variant="primary" size="sm" loading={isLoading} loadingText="Saving...">
          <Plus className="h-3.5 w-3.5" />
          Add Task
        </Button>
      </form>

      {isLoading && (
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
          <NothingLoader variant={loaderVariant} size="sm" decorative />
          <span>Syncing sprint board...</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {COLUMNS.map((col, colIdx) => {
          const items = tasks.filter((t) => t.column === col.id);
          return (
            <div
              key={col.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragId) {
                  moveColumn(dragId, col.id);
                  setDragId(null);
                }
              }}
              className="space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3"
            >
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">
                <span className={col.id === 'active' ? 'text-[var(--nt-accent)]' : 'text-[var(--nt-display)]'}>
                  {col.label}
                </span>
                <span className="tabular-nums">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => setDragId(task.id)}
                    className="space-y-2 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-2.5"
                  >
                    <div className="flex items-start gap-2">
                      <DotsSixVertical className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)]" />
                      <span className="font-mono text-xs leading-snug text-[var(--nt-display)]">
                        {task.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-1 border-t border-[var(--nt-line)] pt-2">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          aria-label={`Move ${task.title} up`}
                          onClick={() => reorderWithinColumn(task.id, -1)}
                          className="rounded border border-[var(--nt-line)] p-1 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Move ${task.title} down`}
                          onClick={() => reorderWithinColumn(task.id, 1)}
                          className="rounded border border-[var(--nt-line)] p-1 text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        {colIdx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveColumn(task.id, COLUMNS[colIdx - 1].id)}
                            className="rounded border border-[var(--nt-line)] px-1.5 py-0.5 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
                          >
                            ← {COLUMNS[colIdx - 1].label}
                          </button>
                        )}
                        {colIdx < COLUMNS.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveColumn(task.id, COLUMNS[colIdx + 1].id)}
                            className="rounded border border-[var(--nt-line)] px-1.5 py-0.5 text-[var(--nt-display)] hover:border-[var(--nt-display)] cursor-pointer"
                          >
                            {COLUMNS[colIdx + 1].label} →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 14. Documentation Sidebar Preview
 * ─────────────────────────────────────────────────────────────────────────── */
export function SidebarDemo() {
  const [compact, setCompact] = React.useState(false);
  const [active, setActive] = React.useState('glyph-matrix');
  const { loading: navigating, trigger: loadRoute } = useAsyncAction(420);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({ loading: navigating });
  const items = [
    { id: 'overview', label: 'Overview', code: '01' },
    { id: 'button', label: 'Button', code: '05' },
    { id: 'glyph-matrix', label: 'Glyph Matrix', code: '40' },
    { id: 'dot-icon', label: 'Dot Icons', code: '21' },
  ];

  return (
    <div
      aria-busy={isLoading || undefined}
      className="flex overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] min-h-[210px]"
    >
      <aside
        aria-label="Sidebar component preview"
        className={cn(
          'flex flex-col justify-between border-r border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 transition-all',
          compact ? 'w-16' : 'w-52',
        )}
      >
        <div className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={active === item.id ? 'page' : undefined}
              onClick={() => {
                setActive(item.id);
                loadRoute();
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-md px-2 py-1.5 font-mono text-xs cursor-pointer',
                active === item.id
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)]',
              )}
            >
              <span className="truncate">{compact ? item.code : item.label}</span>
              {!compact && <span className="text-[10px] opacity-60 tabular-nums">{item.code}</span>}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCompact((c) => !c)}
          className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[var(--nt-line)] px-2 py-1 font-mono text-[11px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          <SidebarSimple className="h-3.5 w-3.5" />
          {!compact && 'Collapse'}
        </button>
      </aside>
      <div className="flex flex-1 flex-col justify-center p-5 font-mono text-xs text-[var(--nt-secondary)]">
        {isLoading ? (
          <div className="flex items-center gap-2.5 text-[var(--nt-muted)]">
            <NothingLoader variant={loaderVariant} size="sm" decorative />
            <span>Loading route /{active}...</span>
          </div>
        ) : (
          <>
            <div className="text-[var(--nt-muted)]">Active route</div>
            <div className="mt-1 font-display text-xl text-[var(--nt-display)]">{active}</div>
            <div className="mt-2 text-[11px] text-[var(--nt-muted)]">
              Rail mode: {compact ? 'Compact (64px)' : 'Expanded (208px)'}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 15. On-Page Table of Contents Preview
 * ─────────────────────────────────────────────────────────────────────────── */
export function TableOfContentsDemo() {
  const sections = [
    { id: 'overview', label: 'Overview', level: 2 as const },
    { id: 'playground', label: 'Props Playground', level: 2 as const },
    { id: 'install', label: 'Installation (nthgui)', level: 2 as const },
    { id: 'props', label: 'Props Reference', level: 3 as const },
    { id: 'a11y', label: 'Keyboard & Accessibility', level: 2 as const },
  ];
  const [activeId, setActiveId] = React.useState('playground');
  const { loading: isLoading } = useResolvedLoading({});

  return (
    <div
      aria-busy={isLoading || undefined}
      className="mx-auto max-w-xs rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4"
    >
      <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
        On This Page
      </div>
      {isLoading ? (
        <div className="space-y-2.5 border-l border-[var(--nt-line)] pl-3">
          {sections.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-3.5 rounded bg-[var(--nt-raised)] animate-pulse',
                s.level === 3 ? 'ml-2 w-24' : 'w-36',
              )}
            />
          ))}
        </div>
      ) : (
        <ul className="relative space-y-0.5 border-l border-[var(--nt-line)]">
          {sections.map((s) => {
            const active = s.id === activeId;
            return (
              <li key={s.id} className="relative">
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute -left-[1px] top-1 bottom-1 w-[2px] bg-[var(--nt-accent)]"
                  />
                )}
                <button
                  type="button"
                  aria-current={active ? 'location' : undefined}
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    'block w-full py-1.5 pr-2 text-left font-mono text-xs transition-colors cursor-pointer',
                    s.level === 3 ? 'pl-5 text-[11px]' : 'pl-3',
                    active ? 'text-[var(--nt-display)] font-medium' : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {s.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 16. Action Toolbar
 * ─────────────────────────────────────────────────────────────────────────── */
export function ToolbarDemo() {
  const [bold, setBold] = React.useState(false);
  const [italic, setItalic] = React.useState(false);
  const [align, setAlign] = React.useState<'left' | 'center' | 'right'>('left');
  const [savedAt, setSavedAt] = React.useState<string | null>(null);
  const { loading: saving, trigger: saveDoc } = useAsyncAction(750);
  const { loading: isLoading } = useResolvedLoading({ loading: saving });

  return (
    <div className="mx-auto max-w-lg space-y-3" aria-busy={isLoading || undefined}>
      <div
        role="toolbar"
        aria-label="Formatting toolbar"
        className="inline-flex flex-wrap items-center gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-1.5"
      >
        <button
          type="button"
          aria-pressed={bold}
          aria-label="Toggle bold"
          onClick={() => setBold((b) => !b)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer',
            bold ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
          )}
        >
          <TextB className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-pressed={italic}
          aria-label="Toggle italic"
          onClick={() => setItalic((i) => !i)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer',
            italic ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]' : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
          )}
        >
          <TextItalic className="h-4 w-4" />
        </button>

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--nt-line)]" />

        {(
          [
            { id: 'left', icon: TextAlignLeft, label: 'Align left' },
            { id: 'center', icon: TextAlignCenter, label: 'Align center' },
            { id: 'right', icon: TextAlignRight, label: 'Align right' },
          ] as const
        ).map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            aria-pressed={align === id}
            aria-label={label}
            onClick={() => setAlign(id)}
            className={cn(
              'inline-flex h-8 w-8 items-center justify-center rounded-lg cursor-pointer',
              align === id
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}

        <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--nt-line)]" />

        <Button
          variant="primary"
          size="sm"
          loading={isLoading}
          loadingText="Saving..."
          onClick={() =>
            saveDoc(() => setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })))
          }
        >
          Save
        </Button>
      </div>

      <div
        className={cn(
          'rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 font-mono text-xs text-[var(--nt-display)]',
          bold && 'font-bold',
          italic && 'italic',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
        )}
      >
        Nothing UI ships through one npm package: nthgui.
        {savedAt && (
          <span className="ml-2 text-[10px] text-[var(--nt-muted)] tabular-nums">
            (Saved {savedAt})
          </span>
        )}
      </div>
    </div>
  );
}

export function V02ExpandedDemo({ slug }: { slug: string }) {
  switch (slug) {
    case 'dot-matrix-clock':
      return <DotMatrixClockDemo />;
    case 'earbuds-battery':
      return <EarbudsBatteryDemo />;
    case 'weather-matrix':
      return <WeatherMatrixDemo />;
    case 'quick-settings':
      return <QuickSettingsDeckDemo />;
    case 'combobox':
      return <ComboboxDemo />;
    case 'date-time-picker':
      return <DateTimePickerDemo />;
    case 'tag-input':
      return <TagInputDemo />;
    case 'sparkline-strip':
      return <SparklineStripDemo />;
    case 'radar-chart':
      return <RadarChartDemo />;
    case 'metric-grid':
      return <MetricGridDemo />;
    case 'hover-card':
      return <HoverCardDemo />;
    case 'context-menu':
      return <ContextMenuDemo />;
    case 'sortable-board':
      return <SortableBoardDemo />;
    case 'sidebar':
      return <SidebarDemo />;
    case 'table-of-contents':
      return <TableOfContentsDemo />;
    case 'toolbar':
      return <ToolbarDemo />;
    default:
      return null;
  }
}
