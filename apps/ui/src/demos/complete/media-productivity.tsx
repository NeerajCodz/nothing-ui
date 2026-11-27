import * as React from 'react';
import {
  Camera,
  Code,
  FilmSlate,
  ListBullets,
  MagnifyingGlassMinus,
  MagnifyingGlassPlus,
  Microphone,
  Pause,
  Play,
  Plus,
  Stop,
  TextB,
  TextHOne,
  VideoCamera,
} from '@phosphor-icons/react';
import { Button, SearchBarWidget, cn } from '@nothing-ui/ui';

/* ───────────────────────────────────────────────────────────────────────────
 * 22. Audio Recorder (Hardware voice memo deck with live waveform & takes)
 * ─────────────────────────────────────────────────────────────────────────── */
export function AudioRecorderDemo() {
  const [recording, setRecording] = React.useState(false);
  const [seconds, setSeconds] = React.useState(12);
  const [takes, setTakes] = React.useState<string[]>(['MEMO_001 · 00:14 · 48kHz']);

  React.useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const formatted = `00:${String(seconds % 60).padStart(2, '0')}`;

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5 space-y-4">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="inline-flex items-center gap-2 text-[var(--nt-display)]">
          <span className={cn('h-2.5 w-2.5 rounded-full', recording ? 'bg-[var(--nt-accent)] animate-pulse' : 'bg-[var(--nt-line-2)]')} />
          {recording ? 'REC · VOICE MEMO' : 'STANDBY · 48kHz PCM'}
        </span>
        <span className="font-display text-xl tabular-nums text-[var(--nt-display)]">{formatted}</span>
      </div>

      <div className="flex h-16 items-end justify-between gap-1 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2.5">
        {Array.from({ length: 24 }, (_, i) => {
          const level = recording
            ? 24 + ((i * 19 + seconds * 29) % 72)
            : 18 + ((i * 13) % 34);
          return (
            <span
              key={i}
              style={{ height: `${level}%` }}
              className={cn(
                'w-1.5 rounded-full transition-all duration-200',
                recording && i % 5 === 0 ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]/80',
              )}
            />
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant={recording ? 'signal' : 'primary'}
          size="sm"
          onClick={() => {
            if (recording) {
              setRecording(false);
              setTakes((prev) => [`MEMO_00${prev.length + 1} · ${formatted} · 48kHz`, ...prev.slice(0, 2)]);
            } else {
              setRecording(true);
            }
          }}
        >
          {recording ? <Stop className="h-3.5 w-3.5" weight="fill" /> : <Microphone className="h-3.5 w-3.5" />}
          {recording ? 'Stop & Save Take' : 'Start Recording'}
        </Button>
        <span className="font-mono text-[10px] text-[var(--nt-muted)]">{takes.length} take(s)</span>
      </div>

      <div className="space-y-1 font-mono text-[11px] text-[var(--nt-secondary)]">
        {takes.map((t) => (
          <div key={t} className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-1.5">
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 23. Video Recorder (Cinema viewfinder with timecode & resolution controls)
 * ─────────────────────────────────────────────────────────────────────────── */
export function VideoRecorderDemo() {
  const [recording, setRecording] = React.useState(false);
  const [format, setFormat] = React.useState<'4K 60' | '1080p 30'>('4K 60');
  const [grid, setGrid] = React.useState(true);
  const [frames, setFrames] = React.useState(184);

  React.useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setFrames((f) => f + 3), 200);
    return () => window.clearInterval(id);
  }, [recording]);

  const secs = Math.floor(frames / 30);
  const tc = `00:00:${String(secs % 60).padStart(2, '0')}:${String(frames % 30).padStart(2, '0')}`;

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="relative h-44 overflow-hidden rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-4 flex flex-col justify-between">
        {grid && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="border border-[var(--nt-line)]/40" />
            ))}
          </div>
        )}
        <div className="relative z-10 flex items-center justify-between font-mono text-[11px]">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[var(--nt-surface)]/90 px-2 py-0.5 text-[var(--nt-display)]">
            <span className={cn('h-2 w-2 rounded-full', recording ? 'bg-[var(--nt-accent)] animate-pulse' : 'bg-[var(--nt-muted)]')} />
            {recording ? 'REC' : 'IDLE'} · {format}
          </span>
          <span className="tabular-nums text-[var(--nt-display)]">{tc}</span>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {(['4K 60', '1080p 30'] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                className={cn(
                  'rounded-md border px-2 py-0.5 font-mono text-[10px] cursor-pointer',
                  format === f
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-muted)]',
                )}
              >
                {f}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setGrid((g) => !g)}
              className="rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2 py-0.5 font-mono text-[10px] text-[var(--nt-secondary)] cursor-pointer"
            >
              Grid {grid ? 'ON' : 'OFF'}
            </button>
          </div>
          <Button variant={recording ? 'signal' : 'primary'} size="sm" onClick={() => setRecording((r) => !r)}>
            {recording ? <Stop className="h-3.5 w-3.5" weight="fill" /> : <VideoCamera className="h-3.5 w-3.5" />}
            {recording ? 'Stop' : 'Record'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 24. Camera Capture (Shutter capture with focal lenses & EV control)
 * ─────────────────────────────────────────────────────────────────────────── */
export function CameraCaptureDemo() {
  const [lens, setLens] = React.useState<'14mm' | '24mm' | '50mm'>('24mm');
  const [ev, setEv] = React.useState(0);
  const [shots, setShots] = React.useState<string[]>(['IMG_0104 · 24mm · EV 0.0']);
  const [flash, setFlash] = React.useState(false);

  const capture = () => {
    setFlash(true);
    setShots((prev) => [`IMG_010${prev.length + 4} · ${lens} · EV ${ev >= 0 ? '+' : ''}${ev.toFixed(1)}`, ...prev.slice(0, 2)]);
    window.setTimeout(() => setFlash(false), 180);
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className={cn(
        'relative flex h-40 flex-col justify-between rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] p-4 transition-colors',
        flash && 'bg-white/20',
      )}>
        <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>RAW 12-BIT · {lens}</span>
          <span className="tabular-nums text-[var(--nt-display)]">EV {ev >= 0 ? '+' : ''}{ev.toFixed(1)}</span>
        </div>

        <div className="flex items-center justify-center">
          <div className="h-12 w-12 rounded-full border border-dashed border-[var(--nt-accent)]/80 flex items-center justify-center">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--nt-accent)]" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-[10px]">
            {(['14mm', '24mm', '50mm'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLens(l)}
                className={cn(
                  'rounded px-2 py-0.5 cursor-pointer',
                  lens === l
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)]',
                )}
              >
                {l}
              </button>
            ))}
          </div>
          <Button variant="signal" size="sm" onClick={capture}>
            <Camera className="h-3.5 w-3.5" />
            Capture Frame
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 font-mono text-[11px]">
        <label className="flex items-center gap-2 text-[var(--nt-muted)]">
          <span>EV</span>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.5}
            value={ev}
            onChange={(e) => setEv(Number(e.target.value))}
            className="w-28 accent-[var(--nt-accent)]"
          />
        </label>
        <span className="truncate text-[var(--nt-display)]">{shots[0]}</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 25. Media Studio (Multi-track audio + Glyph cue timeline studio)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MediaStudioDemo() {
  const [playing, setPlaying] = React.useState(false);
  const [playhead, setPlayhead] = React.useState(32);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPlayhead((p) => (p >= 100 ? 0 : p + 4));
    }, 180);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <div className="mx-auto w-full max-w-lg rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 space-y-3">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="inline-flex items-center gap-1.5 text-[var(--nt-display)]">
          <FilmSlate className="h-4 w-4 text-[var(--nt-accent)]" />
          GLYPH COMPOSER TIMELINE
        </span>
        <Button variant="outline" size="sm" onClick={() => setPlaying((p) => !p)}>
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </Button>
      </div>

      <div className="relative space-y-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3">
        <div
          aria-hidden="true"
          style={{ left: `${playhead}%` }}
          className="pointer-events-none absolute top-0 bottom-0 z-10 w-0.5 bg-[var(--nt-accent)]"
        />
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="w-16 shrink-0 text-[var(--nt-muted)]">AUDIO</span>
          <div className="h-7 flex-1 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-bg)] px-2 flex items-center text-[var(--nt-secondary)]">
            ear3_master_stem.wav
          </div>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="w-16 shrink-0 text-[var(--nt-muted)]">GLYPH</span>
          <div className="flex flex-1 gap-1.5">
            <div className="h-7 w-1/3 rounded-md bg-[var(--nt-accent)]/25 border border-[var(--nt-accent)] px-2 flex items-center text-[var(--nt-display)]">
              Pulse A
            </div>
            <div className="h-7 flex-1 rounded-md bg-[var(--nt-raised)] border border-[var(--nt-line-2)] px-2 flex items-center text-[var(--nt-secondary)]">
              Ring Sweep 25×25
            </div>
          </div>
        </div>
      </div>

      <input
        type="range"
        aria-label="Timeline playhead position"
        min={0}
        max={100}
        value={playhead}
        onChange={(e) => setPlayhead(Number(e.target.value))}
        className="w-full accent-[var(--nt-accent)]"
      />
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 26. Media Viewer (Monochrome lightbox with zoom & EXIF metadata)
 * ─────────────────────────────────────────────────────────────────────────── */
const GALLERY_ASSETS = [
  { id: 'chassis', title: 'Transparent Chassis Blueprint', meta: '3840×2160 · ISO 100 · f/1.8' },
  { id: 'glyph', title: 'Phone (3) 481-LED Array', meta: '2500×2500 · Macro 50mm · RAW' },
  { id: 'ear', title: 'Ear (3) Acoustic Chamber', meta: '4096×2304 · Studio Key · 1/250s' },
];

export function MediaViewerDemo() {
  const [idx, setIdx] = React.useState(0);
  const [zoom, setZoom] = React.useState(1);
  const asset = GALLERY_ASSETS[idx];

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <div className="flex h-36 items-center justify-center overflow-hidden p-4">
          <div
            style={{ transform: `scale(${zoom})` }}
            className="rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-5 py-4 text-center transition-transform duration-200"
          >
            <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
              ASSET 0{idx + 1} / 0{GALLERY_ASSETS.length}
            </div>
            <div className="mt-1 font-display text-xl text-[var(--nt-display)]">{asset.title}</div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--nt-line)] px-4 py-2.5 font-mono text-[11px]">
          <span className="text-[var(--nt-muted)]">{asset.meta}</span>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="icon" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}>
              <MagnifyingGlassMinus className="h-3.5 w-3.5" />
            </Button>
            <span className="w-10 text-center tabular-nums text-[var(--nt-display)]">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="icon" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(2, Number((z + 0.25).toFixed(2))))}>
              <MagnifyingGlassPlus className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {GALLERY_ASSETS.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setIdx(i);
              setZoom(1);
            }}
            className={cn(
              'rounded-lg border px-2.5 py-2 text-left font-mono text-[11px] truncate cursor-pointer',
              idx === i
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-bg)] text-[var(--nt-secondary)]',
            )}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 27. Editor (Technical markdown editor with toolbar & split preview)
 * ─────────────────────────────────────────────────────────────────────────── */
export function EditorDemo() {
  const [content, setContent] = React.useState(
    '# Nothing UI Release Spec\n\nAll **136 components** ship across Web and React Native via `npx nthgui add`.\n\n- Zero extra npm installs\n- WCAG AAA contrast presets',
  );
  const [preview, setPreview] = React.useState(false);

  const appendSnippet = (snippet: string) => setContent((c) => `${c}${snippet}`);
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2">
        <div className="flex items-center gap-1">
          <button type="button" aria-label="Insert heading" onClick={() => appendSnippet('\n## Section')} className="rounded-md p-1.5 text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer">
            <TextHOne className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Insert bold text" onClick={() => appendSnippet(' **signal**')} className="rounded-md p-1.5 text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer">
            <TextB className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Insert inline code" onClick={() => appendSnippet(' `nthgui`')} className="rounded-md p-1.5 text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer">
            <Code className="h-4 w-4" />
          </button>
          <button type="button" aria-label="Insert bullet item" onClick={() => appendSnippet('\n- New hardware item')} className="rounded-md p-1.5 text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] hover:text-[var(--nt-display)] cursor-pointer">
            <ListBullets className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="rounded-md border border-[var(--nt-line)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
        >
          {preview ? 'Edit Markdown' : 'Preview'}
        </button>
      </div>

      {preview ? (
        <div className="min-h-36 space-y-2 p-4 text-xs leading-relaxed text-[var(--nt-primary)]">
          {content.split('\n').map((line, idx) => {
            if (line.startsWith('# ')) return <h3 key={idx} className="font-display text-xl text-[var(--nt-display)]">{line.slice(2)}</h3>;
            if (line.startsWith('## ')) return <h4 key={idx} className="font-mono text-sm font-medium text-[var(--nt-display)]">{line.slice(3)}</h4>;
            if (line.startsWith('- ')) return <div key={idx} className="pl-3 font-mono text-xs text-[var(--nt-secondary)]">• {line.slice(2)}</div>;
            return line.trim() ? <p key={idx} className="text-[var(--nt-secondary)]">{line}</p> : null;
          })}
        </div>
      ) : (
        <textarea
          aria-label="Markdown document editor"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed text-[var(--nt-display)] focus:outline-none"
        />
      )}

      <div className="flex items-center justify-between border-t border-[var(--nt-line)] px-4 py-2 font-mono text-[10px] text-[var(--nt-muted)]">
        <span>MARKDOWN · UTF-8</span>
        <span className="tabular-nums">{words} words · {content.length} chars</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 28. Calendar Canvas (Interactive time-blocking schedule canvas)
 * ─────────────────────────────────────────────────────────────────────────── */
const HOURS = ['09:00', '10:00', '11:00', '12:00'];
const DAYS = ['MON', 'TUE', 'WED'] as const;

export function CalendarCanvasDemo() {
  const [events, setEvents] = React.useState<Record<string, { title: string; signal?: boolean }>>({
    'MON-09:00': { title: 'Glyph LUT Review', signal: true },
    'TUE-10:00': { title: 'RN Parity QA' },
    'WED-11:00': { title: 'nthgui v0.4 Cut', signal: true },
  });

  const toggleSlot = (key: string) => {
    setEvents((prev) => {
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: { title: 'Hardware Sprint', signal: Object.keys(prev).length % 2 === 0 } };
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg space-y-2.5">
      <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <div className="grid grid-cols-4 border-b border-[var(--nt-line)] bg-[var(--nt-surface)] font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">
          <div className="px-3 py-2">TIME</div>
          {DAYS.map((d) => (
            <div key={d} className="border-l border-[var(--nt-line)] px-3 py-2 text-center text-[var(--nt-display)]">
              {d}
            </div>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-4 border-b border-[var(--nt-line)] last:border-b-0">
            <div className="px-3 py-2.5 font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">{hour}</div>
            {DAYS.map((day) => {
              const key = `${day}-${hour}`;
              const ev = events[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleSlot(key)}
                  className="border-l border-[var(--nt-line)] p-1.5 text-left transition-colors hover:bg-[var(--nt-surface)] cursor-pointer"
                >
                  {ev ? (
                    <div
                      className={cn(
                        'rounded-lg px-2 py-1 font-mono text-[10px] truncate',
                        ev.signal
                          ? 'bg-[var(--nt-accent)] text-white'
                          : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
                      )}
                    >
                      {ev.title}
                    </div>
                  ) : (
                    <div className="flex h-6 items-center justify-center text-[var(--nt-muted)] opacity-0 hover:opacity-100">
                      <Plus className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>Click any time cell to schedule or clear a block.</span>
        <span className="tabular-nums text-[var(--nt-display)]">{Object.keys(events).length} scheduled</span>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 29. Search Bar Widget (Nothing OS launcher search with scopes & voice)
 * ─────────────────────────────────────────────────────────────────────────── */
export function SearchBarDemo() {
  const [size, setSize] = React.useState<'default' | 'compact'>('default');
  const [showScopes, setShowScopes] = React.useState(true);
  const [showVoice, setShowVoice] = React.useState(true);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4">
      <div className="flex w-full flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <div
          role="group"
          aria-label="Search Bar density"
          className="inline-flex items-center gap-1 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5"
        >
          {(['default', 'compact'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={size === mode}
              onClick={() => setSize(mode)}
              className={cn(
                'rounded-md px-2.5 py-1 capitalize transition-colors cursor-pointer',
                size === mode
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-pressed={showScopes}
            onClick={() => setShowScopes((prev) => !prev)}
            className={cn(
              'rounded-md border px-2.5 py-1 transition-colors cursor-pointer',
              showScopes
                ? 'border-[var(--nt-display)] bg-[var(--nt-surface)] text-[var(--nt-display)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            Scopes {showScopes ? 'On' : 'Off'}
          </button>
          <button
            type="button"
            aria-pressed={showVoice}
            onClick={() => setShowVoice((prev) => !prev)}
            className={cn(
              'rounded-md border px-2.5 py-1 transition-colors cursor-pointer',
              showVoice
                ? 'border-[var(--nt-display)] bg-[var(--nt-surface)] text-[var(--nt-display)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            Voice {showVoice ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      <SearchBarWidget size={size} showScopes={showScopes} showVoice={showVoice} />
    </div>
  );
}

