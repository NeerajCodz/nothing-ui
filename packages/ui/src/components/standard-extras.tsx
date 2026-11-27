import * as React from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeSlash,
  MapPin,
  Paperclip,
  Pause,
  Play,
  Plus,
  X,
} from '@phosphor-icons/react';
import { cn } from '../lib/cn';
import { NothingLoader } from './loader';
import { useAsyncAction, useResolvedLoading } from '../hooks/loading-provider';
import type { LoaderVariant } from '../lib/loading-logic';

/**
 * 13.1 Logo — Original Nothing UI monochrome + Signal Red 3x3 dot-matrix brand mark.
 */
export function NothingLogo({
  size = 'md',
  showWordmark = true,
  loading,
  loaderVariant,
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}) {
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });
  const box = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  const text = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  return (
    <span
      aria-busy={isLoading || undefined}
      className={cn('inline-flex items-center gap-2.5 select-none', className)}
    >
      {isLoading ? (
        <NothingLoader variant={resolvedVariant} size={size} label="Loading brand mark" />
      ) : (
        <span aria-hidden="true" className={cn('grid grid-cols-3 gap-[2px] p-[1px]', box)}>
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-accent)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-line-2)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
          <span className="rounded-full bg-[var(--nt-display)]" />
        </span>
      )}
      {showWordmark && (
        <span className={cn('font-display tracking-[0.08em] text-[var(--nt-display)] leading-none', text)}>
          NOTHING UI
        </span>
      )}
    </span>
  );
}

/**
 * 1.2 ButtonGroup — Joined segmented action bar sharing crisp 1px inner dividers.
 */
export function ButtonGroup({
  items,
  value,
  onValueChange,
  loading,
  loaderVariant,
}: {
  items: Array<{ id: string; label: string }>;
  value: string;
  onValueChange: (id: string) => void;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });

  return (
    <div
      role="group"
      aria-busy={isLoading || undefined}
      className="inline-flex overflow-hidden rounded-lg border border-[var(--nt-line-2)] divide-x divide-[var(--nt-line-2)]"
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            disabled={isLoading}
            aria-pressed={active}
            onClick={() => onValueChange(item.id)}
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-2 font-mono text-xs transition-colors cursor-pointer disabled:cursor-wait',
              active
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {isLoading && active && (
              <NothingLoader variant={resolvedVariant} size="sm" decorative />
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * 2.14 SensitiveInput — Masked secret/passkey input with accessible visibility toggle.
 */
export function SensitiveInput({
  label = 'API Signing Secret',
  defaultValue = 'nt_live_9842_glyph_77a1',
  loading,
  loaderVariant,
}: {
  label?: string;
  defaultValue?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [visible, setVisible] = React.useState(false);
  const [val, setVal] = React.useState(defaultValue);
  const { loading: rotating, trigger } = useAsyncAction(750);
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading: loading || rotating,
    loaderVariant,
  });
  const id = React.useId();

  return (
    <div className="space-y-1.5 max-w-sm" aria-busy={isLoading || undefined}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
          {label}
        </label>
        <button
          type="button"
          disabled={isLoading}
          onClick={() =>
            trigger(() => {
              setVal(`nt_live_${Math.floor(1000 + Math.random() * 9000)}_glyph_${Math.random().toString(16).slice(2, 6)}`);
            })
          }
          className="font-mono text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer disabled:opacity-50"
        >
          {isLoading ? 'Rotating...' : 'Rotate Key'}
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 focus-within:border-[var(--nt-display)]">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={val}
          disabled={isLoading}
          onChange={(e) => setVal(e.target.value)}
          className="h-10 flex-1 bg-transparent font-mono text-xs text-[var(--nt-display)] focus:outline-none disabled:opacity-60"
        />
        {isLoading ? (
          <NothingLoader variant={resolvedVariant} size="sm" label="Validating secret" />
        ) : (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide secret' : 'Show secret'}
            className="text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
          >
            {visible ? <EyeSlash className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 2.18 TagInput — Interactive chip/tag composer with Enter-to-add and removable tokens.
 */
export function TagInput({
  initialTags = ['glyph-25x25', 'monochrome', 'oled-black'],
  loading,
  loaderVariant,
}: {
  initialTags?: string[];
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [tags, setTags] = React.useState<string[]>(initialTags);
  const [draft, setDraft] = React.useState('');
  const { loading: validating, trigger } = useAsyncAction(450);
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading: loading || validating,
    loaderVariant,
  });

  const add = () => {
    const clean = draft.trim().toLowerCase();
    if (!clean || tags.includes(clean)) return;
    trigger(() => {
      setTags((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
      setDraft('');
    });
  };

  return (
    <div className="max-w-md space-y-2" aria-busy={isLoading || undefined}>
      <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-raised)] px-2 py-1 font-mono text-[11px] text-[var(--nt-display)]"
          >
            {tag}
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
              className="text-[var(--nt-muted)] hover:text-[var(--nt-accent)] cursor-pointer"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add token + Enter..."
          aria-label="Add tag"
          className="min-w-[120px] flex-1 bg-transparent px-1.5 py-1 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none"
        />
        {isLoading ? (
          <span className="inline-flex h-6 w-6 items-center justify-center">
            <NothingLoader variant={resolvedVariant} size="sm" label="Validating tag" />
          </span>
        ) : (
          <button
            type="button"
            onClick={add}
            aria-label="Insert tag"
            className="inline-flex h-6 w-6 items-center justify-center rounded bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * 8.1-8.4 Chat family — Bubble, Message, MessageScroller, Attachment.
 */
export function ChatBubble({
  role,
  author,
  timestamp,
  children,
  attachment,
  loading,
  loaderVariant,
}: {
  role: 'incoming' | 'outgoing';
  author: string;
  timestamp: string;
  children: React.ReactNode;
  attachment?: { name: string; size: string };
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });
  const outgoing = role === 'outgoing';
  return (
    <div
      aria-busy={isLoading || undefined}
      className={cn('flex flex-col gap-1', outgoing ? 'items-end' : 'items-start')}
    >
      <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--nt-muted)]">
        <span>{author}</span>
        <span>·</span>
        <span className="tabular-nums">{isLoading ? (outgoing ? 'Sending...' : 'Typing...') : timestamp}</span>
      </div>
      <div
        className={cn(
          'max-w-[82%] rounded-2xl border px-4 py-2.5 text-xs leading-relaxed',
          outgoing
            ? 'border-transparent bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
            : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-primary)]',
        )}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2 font-mono text-[11px]">
            <NothingLoader variant={resolvedVariant} size="sm" decorative />
            <span>{outgoing ? 'Transmitting payload...' : 'Generating response...'}</span>
          </span>
        ) : (
          <>
            <p>{children}</p>
            {attachment && (
              <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-current/20 px-2.5 py-1 font-mono text-[10px]">
                <Paperclip className="h-3 w-3" />
                <span>{attachment.name}</span>
                <span className="opacity-70">{attachment.size}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * 9.x Charts family — Monochrome + Signal Red precision SVG Sparkline, BarChart, LineChart, RadialChart.
 */
export function NothingSparkline({
  data = [22, 34, 28, 46, 52, 49, 68, 74, 62, 88, 81, 95],
  signal = true,
  height = 52,
  loading,
  loaderVariant,
}: {
  data?: number[];
  signal?: boolean;
  height?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });
  const width = 260;

  if (isLoading) {
    return (
      <div
        aria-busy="true"
        style={{ width, height }}
        className="flex items-center justify-center rounded-lg border border-[var(--nt-line)] bg-[var(--nt-raised)]/40"
      >
        <NothingLoader variant={resolvedVariant} size="sm" label="Loading sparkline" />
      </div>
    );
  }

  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = Math.max(max - min, 1);
  const points = data
    .map((v, i) => {
      const x = (i / Math.max(data.length - 1, 1)) * (width - 12) + 6;
      const y = height - 6 - ((v - min) / range) * (height - 12);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  const last = points.split(' ').at(-1)?.split(',') ?? ['0', '0'];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Sparkline series"
      className="overflow-visible"
    >
      <polyline
        fill="none"
        stroke="var(--nt-display)"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
      <circle
        cx={Number(last[0])}
        cy={Number(last[1])}
        r="3.5"
        fill={signal ? 'var(--nt-accent)' : 'var(--nt-display)'}
      />
    </svg>
  );
}

export function NothingBarChart({
  bars = [
    { label: 'MON', value: 42 },
    { label: 'TUE', value: 68 },
    { label: 'WED', value: 55 },
    { label: 'THU', value: 92, signal: true },
    { label: 'FRI', value: 74 },
    { label: 'SAT', value: 61 },
  ],
  loading,
}: {
  bars?: Array<{ label: string; value: number; signal?: boolean }>;
  loading?: boolean;
}) {
  const { loading: isLoading } = useResolvedLoading({ loading });
  const max = Math.max(...bars.map((b) => b.value), 1);

  return (
    <div
      aria-busy={isLoading || undefined}
      className="flex h-36 items-end gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
    >
      {bars.map((bar, idx) => (
        <div key={bar.label} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
          <span className="font-mono text-[10px] tabular-nums text-[var(--nt-muted)]">
            {isLoading ? '—' : bar.value}
          </span>
          <div className="flex w-full flex-1 items-end">
            {isLoading ? (
              <div
                style={{ height: `${32 + ((idx * 17) % 48)}%` }}
                className="w-full rounded-t-md bg-[var(--nt-raised)] animate-pulse"
              />
            ) : (
              <div
                style={{ height: `${Math.round((bar.value / max) * 100)}%` }}
                className={cn(
                  'w-full rounded-t-md transition-all',
                  bar.signal ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]',
                )}
              />
            )}
          </div>
          <span className="font-mono text-[10px] text-[var(--nt-secondary)]">{bar.label}</span>
        </div>
      ))}
    </div>
  );
}

export function NothingRadialChart({
  value = 78,
  label = 'COVERAGE',
  loading,
  loaderVariant,
}: {
  value?: number;
  label?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });
  const r = 42;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(100, value)) / 100);
  return (
    <div
      aria-busy={isLoading || undefined}
      className="inline-flex flex-col items-center gap-2 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
    >
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--nt-line)" strokeWidth="7" />
          {!isLoading && (
            <circle
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke="var(--nt-accent)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isLoading ? (
            <NothingLoader variant={resolvedVariant} size="md" label={`Loading ${label}`} />
          ) : (
            <>
              <span className="font-display text-2xl tabular-nums text-[var(--nt-display)]">{value}%</span>
              <span className="font-mono text-[9px] tracking-[0.12em] text-[var(--nt-muted)]">{label}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 10.1 & 10.5 Media family — AudioPlayer & LocationCard.
 */
export function NothingAudioPlayer({
  track = 'Glyph Chime 03 (25×25 Sync)',
  duration = '01:48',
  loading,
  loaderVariant,
}: {
  track?: string;
  duration?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [playing, setPlaying] = React.useState(false);
  const [step, setStep] = React.useState(11);
  const { loading: buffering, trigger } = useAsyncAction(550);
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading: loading || buffering,
    loaderVariant,
  });
  const bars = [25, 45, 70, 55, 90, 62, 40, 82, 95, 68, 52, 78, 86, 48, 36, 64, 74, 42, 58, 30];

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setStep((s) => (s + 1) % bars.length), 320);
    return () => window.clearInterval(id);
  }, [playing, bars.length]);

  const handleTogglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      trigger(() => setPlaying(true));
    }
  };

  return (
    <div
      aria-busy={isLoading || undefined}
      className="flex items-center gap-3.5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4 max-w-md"
    >
      <button
        type="button"
        disabled={isLoading}
        onClick={handleTogglePlay}
        aria-label={isLoading ? 'Buffering audio' : playing ? 'Pause audio' : 'Play audio'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--nt-accent)] text-white cursor-pointer disabled:cursor-wait"
      >
        {isLoading ? (
          <NothingLoader variant={resolvedVariant} size="sm" decorative />
        ) : playing ? (
          <Pause className="h-4 w-4" weight="fill" />
        ) : (
          <Play className="h-4 w-4" weight="fill" />
        )}
      </button>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between gap-2 font-mono text-xs">
          <span className="truncate text-[var(--nt-display)]">
            {isLoading ? 'Buffering audio stream...' : track}
          </span>
          <span className="shrink-0 tabular-nums text-[var(--nt-muted)]">{duration}</span>
        </div>
        <div className="flex h-6 items-end gap-1" aria-hidden="true">
          {bars.map((h, i) => (
            <span
              key={i}
              style={{ height: `${h}%` }}
              className={cn(
                'flex-1 rounded-full transition-colors',
                isLoading
                  ? 'bg-[var(--nt-line-2)] animate-pulse'
                  : i <= step
                    ? 'bg-[var(--nt-display)]'
                    : 'bg-[var(--nt-line-2)] opacity-45',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function NothingLocationCard({
  place = 'London Design Studio',
  coords = '51.5074° N, 0.1278° W',
  elevation = '11m',
  loading,
  loaderVariant,
}: {
  place?: string;
  coords?: string;
  elevation?: string;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [liveCoords, setLiveCoords] = React.useState(coords);
  const { loading: locating, trigger } = useAsyncAction(850);
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading: loading || locating,
    loaderVariant,
  });

  return (
    <div
      aria-busy={isLoading || undefined}
      className="inline-flex items-center gap-3.5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-raised)] text-[var(--nt-accent)]">
        {isLoading ? (
          <NothingLoader variant={resolvedVariant} size="sm" label="Locating GPS" />
        ) : (
          <MapPin className="h-5 w-5" weight="fill" />
        )}
      </div>
      <div className="font-mono">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-[var(--nt-display)]">
            {isLoading ? 'Acquiring GPS lock...' : place}
          </span>
          <button
            type="button"
            disabled={isLoading}
            onClick={() =>
              trigger(() => {
                setLiveCoords(`51.${5070 + Math.floor(Math.random() * 9)}° N, 0.${1274 + Math.floor(Math.random() * 9)}° W`);
              })
            }
            className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Locating...' : 'Refresh GPS'}
          </button>
        </div>
        <div className="mt-0.5 text-[11px] tabular-nums text-[var(--nt-secondary)]">
          {isLoading ? '··.····° N, ·.····° W' : liveCoords}
        </div>
        <div className="mt-0.5 text-[10px] text-[var(--nt-muted)]">ELEV {elevation} · WGS84</div>
      </div>
    </div>
  );
}

/**
 * 11.x Motion family — Reduced-motion safe MotionPresetStage.
 */
export function MotionPresetStage() {
  const [preset, setPreset] = React.useState<'fade' | 'slide' | 'scale' | 'stagger'>('fade');
  const [runKey, setRunKey] = React.useState(0);
  const { loading: isLoading, loaderVariant } = useResolvedLoading({});

  return (
    <div className="space-y-4" aria-busy={isLoading || undefined}>
      <div className="flex flex-wrap items-center gap-2">
        {(['fade', 'slide', 'scale', 'stagger'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => {
              setPreset(p);
              setRunKey((k) => k + 1);
            }}
            className={cn(
              'rounded-md border px-3 py-1 font-mono text-xs capitalize cursor-pointer',
              preset === p
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
            )}
          >
            {p}-in
          </button>
        ))}
        {isLoading && (
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--nt-muted)]">
            <NothingLoader variant={loaderVariant} size="sm" decorative />
            <span>Preloading keyframes...</span>
          </span>
        )}
      </div>
      <div key={runKey} className="grid grid-cols-3 gap-3 max-w-md">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              transitionDelay: preset === 'stagger' ? `${i * 75}ms` : '0ms',
            }}
            className={cn(
              'rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 text-center font-mono text-xs text-[var(--nt-display)] transition-transform duration-200 hover:-translate-y-0.5',
              isLoading && 'opacity-60 animate-pulse',
            )}
          >
            NODE 0{i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 12.4 Sortable — Keyboard & click reorderable list for Productivity family.
 */
export function NothingSortableList({
  initialItems = ['Tokens & Themes', 'Glyph Matrix Core', '9×9 Dot Icons', 'React Native Bridge'],
  loading,
  loaderVariant,
}: {
  initialItems?: string[];
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [items, setItems] = React.useState(initialItems);
  const { loading: syncing, trigger } = useAsyncAction(450);
  const { loading: isLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading: loading || syncing,
    loaderVariant,
  });

  const move = (idx: number, delta: -1 | 1) => {
    const nextIdx = idx + delta;
    if (nextIdx < 0 || nextIdx >= items.length) return;
    setItems((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(idx, 1);
      copy.splice(nextIdx, 0, picked);
      return copy;
    });
    trigger();
  };

  return (
    <div className="max-w-md space-y-2" aria-busy={isLoading || undefined}>
      {isLoading && (
        <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
          <NothingLoader variant={resolvedVariant} size="sm" decorative />
          <span>Syncing sort order...</span>
        </div>
      )}
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={item}
            className="flex items-center justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3.5 py-2.5 font-mono text-xs"
          >
            <span className="flex items-center gap-2.5 text-[var(--nt-display)]">
              <span className="tabular-nums text-[var(--nt-muted)]">0{idx + 1}</span>
              {item}
            </span>
            <span className="flex items-center gap-1">
              <button
                type="button"
                disabled={idx === 0 || isLoading}
                onClick={() => move(idx, -1)}
                aria-label={`Move ${item} up`}
                className="rounded border border-[var(--nt-line)] p-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] disabled:opacity-30 cursor-pointer"
              >
                <ArrowUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                disabled={idx === items.length - 1 || isLoading}
                onClick={() => move(idx, 1)}
                aria-label={`Move ${item} down`}
                className="rounded border border-[var(--nt-line)] p-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] disabled:opacity-30 cursor-pointer"
              >
                <ArrowDown className="h-3 w-3" />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 12.5 Onboarding — Multi-step hardware setup checklist card.
 */
export function NothingOnboardingChecklist({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const [done, setDone] = React.useState<Record<string, boolean>>({
    tokens: true,
    icons: true,
    glyph: false,
  });
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const { loading: previewLoading, loaderVariant: resolvedVariant } = useResolvedLoading({
    loading,
    loaderVariant,
  });
  const steps = [
    { id: 'tokens', label: 'Install nthgui CSS variables' },
    { id: 'icons', label: 'Import nthgui/icons 9×9 dot pack' },
    { id: 'glyph', label: 'Mount GlyphMatrix25 or GlyphMatrix13' },
  ];

  const handleToggle = (id: string) => {
    setBusyId(id);
    window.setTimeout(() => {
      setDone((prev) => ({ ...prev, [id]: !prev[id] }));
      setBusyId(null);
    }, 450);
  };

  return (
    <div
      aria-busy={previewLoading || Boolean(busyId) || undefined}
      className="max-w-md space-y-2 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4"
    >
      {steps.map((s) => {
        const checked = !!done[s.id];
        const stepLoading = previewLoading || busyId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            disabled={stepLoading}
            onClick={() => handleToggle(s.id)}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left font-mono text-xs hover:bg-[var(--nt-raised)] cursor-pointer disabled:cursor-wait"
          >
            {stepLoading ? (
              <NothingLoader variant={resolvedVariant} size="sm" decorative />
            ) : (
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  checked
                    ? 'border-transparent bg-[var(--nt-accent)] text-white'
                    : 'border-[var(--nt-line-2)]',
                )}
              >
                {checked && <Check className="h-3 w-3" weight="bold" />}
              </span>
            )}
            <span className={checked ? 'line-through text-[var(--nt-muted)]' : 'text-[var(--nt-display)]'}>
              {s.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
