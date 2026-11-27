import * as React from 'react';
import {
  ArrowDown,
  CaretLeft,
  CaretRight,
  Pause,
  Play,
  Plus,
} from '@phosphor-icons/react';
import { Button, cn } from '@nothing-ui/ui';

/* ───────────────────────────────────────────────────────────────────────────
 * 9. Carousel (Hardware slide deck with dot pagination & autoplay)
 * ─────────────────────────────────────────────────────────────────────────── */
const CAROUSEL_SLIDES = [
  { code: '01 / 04', title: 'Glyph Matrix 25×25', metric: '481 LEDs', note: 'Circular void mask with 0.08mm pitch tolerance.' },
  { code: '02 / 04', title: 'OLED Monochrome Base', metric: '#000000', note: 'True zero-luminance background with hairline #262626 dividers.' },
  { code: '03 / 04', title: 'Signal Red Interrupt', metric: '#D71921', note: 'Reserved strictly for recording, live telemetry, and critical states.' },
  { code: '04 / 04', title: 'Unified nthgui Package', metric: '136 Live', note: 'Web + React Native parity from a single npm install or CLI add.' },
];

export function CarouselDemo() {
  const [index, setIndex] = React.useState(0);
  const [autoPlay, setAutoPlay] = React.useState(false);

  React.useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [autoPlay]);

  const slide = CAROUSEL_SLIDES[index];

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label="Nothing UI hardware highlights"
      className="mx-auto w-full max-w-lg space-y-3"
    >
      <div className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-6 space-y-3">
        <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
          <span>{slide.code}</span>
          <span className="text-[var(--nt-accent)]">{slide.metric}</span>
        </div>
        <h3 className="font-display text-2xl sm:text-3xl text-[var(--nt-display)]">{slide.title}</h3>
        <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">{slide.note}</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {CAROUSEL_SLIDES.map((s, idx) => (
            <button
              key={s.code}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              aria-current={idx === index ? 'true' : undefined}
              onClick={() => setIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all cursor-pointer',
                idx === index ? 'w-6 bg-[var(--nt-accent)]' : 'w-2 bg-[var(--nt-line-2)] hover:bg-[var(--nt-muted)]',
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoPlay((v) => !v)}
            aria-pressed={autoPlay}
          >
            {autoPlay ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {autoPlay ? 'Pause' : 'Auto'}
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous slide"
            onClick={() => setIndex((i) => (i - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length)}
          >
            <CaretLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next slide"
            onClick={() => setIndex((i) => (i + 1) % CAROUSEL_SLIDES.length)}
          >
            <CaretRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 10. Resizable Panels (Interactive split-pane with drag & keyboard resize)
 * ─────────────────────────────────────────────────────────────────────────── */
export function ResizablePanelsDemo() {
  const [split, setSplit] = React.useState(44);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const draggingRef = React.useRef(false);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.round(Math.min(75, Math.max(25, pct))));
  };

  React.useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingRef.current) updateFromClientX(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl space-y-2.5">
      <div
        ref={containerRef}
        className="flex h-44 w-full overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] select-none"
      >
        <div style={{ width: `${split}%` }} className="flex flex-col justify-between p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            LEFT EXPLORER
          </span>
          <div className="font-display text-2xl tabular-nums text-[var(--nt-display)]">{split}%</div>
          <span className="font-mono text-[11px] text-[var(--nt-secondary)]">Sidebar Tree</span>
        </div>

        <div
          role="separator"
          tabIndex={0}
          aria-orientation="vertical"
          aria-label="Resize split panels"
          aria-valuemin={25}
          aria-valuemax={75}
          aria-valuenow={split}
          onPointerDown={() => {
            draggingRef.current = true;
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') setSplit((s) => Math.max(25, s - 5));
            if (e.key === 'ArrowRight') setSplit((s) => Math.min(75, s + 5));
          }}
          className="group relative flex w-3 shrink-0 cursor-col-resize items-center justify-center bg-[var(--nt-surface)] hover:bg-[var(--nt-raised)] focus:outline-none focus:ring-2 focus:ring-[var(--nt-accent)]"
        >
          <span className="h-8 w-1 rounded-full bg-[var(--nt-line-2)] group-hover:bg-[var(--nt-accent)]" />
        </div>

        <div style={{ width: `${100 - split}%` }} className="flex flex-col justify-between p-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            RIGHT VIEWPORT
          </span>
          <div className="font-display text-2xl tabular-nums text-[var(--nt-display)]">{100 - split}%</div>
          <span className="font-mono text-[11px] text-[var(--nt-secondary)]">Live Preview</span>
        </div>
      </div>
      <p className="font-mono text-[11px] text-[var(--nt-muted)]">
        Drag the center divider or focus it and press ArrowLeft / ArrowRight.
      </p>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 11. Scroll Area (Custom thin monochrome viewport with scroll progress)
 * ─────────────────────────────────────────────────────────────────────────── */
const LOG_ITEMS = Array.from({ length: 18 }, (_, i) => ({
  id: `EVT-${String(i + 1).padStart(3, '0')}`,
  msg: i % 3 === 0 ? 'Glyph LED frame buffer synced (60.0 fps)' : i % 3 === 1 ? 'OLED dark token table verified (21:1)' : 'CLI offline registry checksum OK',
}));

export function ScrollAreaDemo() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [progress, setProgress] = React.useState(0);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.round((el.scrollTop / max) * 100) : 0);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5">
      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>SYSTEM TELEMETRY STREAM ({LOG_ITEMS.length} ROWS)</span>
        <span className="tabular-nums text-[var(--nt-display)]">{progress}%</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[var(--nt-raised)]">
        <div className="h-full bg-[var(--nt-accent)] transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>
      <div
        ref={ref}
        onScroll={onScroll}
        tabIndex={0}
        aria-label="Scrollable telemetry logs"
        className="h-44 overflow-y-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3 space-y-1.5 font-mono text-xs"
      >
        {LOG_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nt-line)]/70 bg-[var(--nt-surface)] px-3 py-2">
            <span className="text-[var(--nt-accent)] shrink-0">{item.id}</span>
            <span className="truncate text-[var(--nt-secondary)]">{item.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 12. Aspect Ratio (Deterministic ratio box with hardware viewfinder frame)
 * ─────────────────────────────────────────────────────────────────────────── */
const RATIOS = [
  { label: '16:9', css: '16 / 9', desc: 'Widescreen Cinema' },
  { label: '4:3', css: '4 / 3', desc: 'Hardware Optical' },
  { label: '1:1', css: '1 / 1', desc: 'Glyph Square' },
  { label: '21:9', css: '21 / 9', desc: 'Ultra Telemetry' },
] as const;

export function AspectRatioDemo() {
  const [ratioIdx, setRatioIdx] = React.useState(0);
  const active = RATIOS[ratioIdx];

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-[var(--nt-muted)]">{active.desc}</span>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 font-mono text-[11px]">
          {RATIOS.map((r, i) => (
            <button
              key={r.label}
              type="button"
              aria-pressed={ratioIdx === i}
              onClick={() => setRatioIdx(i)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer',
                ratioIdx === i
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{ aspectRatio: active.css }}
        className="relative flex w-full max-h-56 items-center justify-center overflow-hidden rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-bg)] transition-all duration-200"
      >
        <div className="absolute inset-3 border border-dashed border-[var(--nt-line-2)]/70 rounded-xl" />
        <div className="text-center font-mono">
          <div className="font-display text-3xl text-[var(--nt-display)]">{active.label}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-accent)]">
            LOCKED VIEWFINDER FRAME
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 13. Grid (Responsive grid primitive with interactive columns & gap)
 * ─────────────────────────────────────────────────────────────────────────── */
export function GridDemo() {
  const [cols, setCols] = React.useState<2 | 3 | 4>(3);
  const [denseGap, setDenseGap] = React.useState<'tight' | 'normal'>('normal');

  return (
    <div className="mx-auto w-full max-w-lg space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5">
          {([2, 3, 4] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cols === c}
              onClick={() => setCols(c)}
              className={cn(
                'rounded-md px-2.5 py-1 cursor-pointer',
                cols === c
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {c} Cols
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setDenseGap((g) => (g === 'normal' ? 'tight' : 'normal'))}
          className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-2.5 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
        >
          Gap: {denseGap === 'normal' ? '12px' : '6px'}
        </button>
      </div>

      <div
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: denseGap === 'normal' ? '12px' : '6px',
        }}
        className="grid"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="flex h-16 flex-col justify-between rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-2.5 font-mono text-[10px]"
          >
            <span className="text-[var(--nt-muted)]">CELL {String(i + 1).padStart(2, '0')}</span>
            <span className="text-[var(--nt-display)]">1fr</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 14. Direction (LTR / RTL logical layout provider)
 * ─────────────────────────────────────────────────────────────────────────── */
export function DirectionDemo() {
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>('ltr');

  return (
    <div className="mx-auto w-full max-w-md space-y-3">
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-muted)]">Logical Direction Provider</span>
        <div className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-0.5 text-[11px]">
          {(['ltr', 'rtl'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={dir === mode}
              onClick={() => setDir(mode)}
              className={cn(
                'rounded-md px-2.5 py-1 uppercase cursor-pointer',
                dir === mode
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div
        dir={dir}
        className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 space-y-3"
      >
        <div className="flex items-center justify-between border-b border-[var(--nt-line)] pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--nt-accent)]" />
            <span className="font-mono text-xs font-medium text-[var(--nt-display)]">
              {dir === 'ltr' ? 'Nothing OS Telemetry' : 'نظام المراقبة nothing-os'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-[var(--nt-muted)] uppercase">{dir}</span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
          {dir === 'ltr'
            ? 'Logical start/end padding and inline alignment automatically mirror without custom overrides.'
            : 'تتعكس الهوامش المنطقية والمحاذاة تلقائياً لدعم اللغات من اليمين إلى اليسار.'}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm">
            {dir === 'ltr' ? 'Continue →' : 'متابعة ←'}
          </Button>
          <Button variant="outline" size="sm">
            {dir === 'ltr' ? 'Cancel' : 'إلغاء'}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * 15. Message Scroller (Auto-pinning chat stream with Jump-to-Latest)
 * ─────────────────────────────────────────────────────────────────────────── */
export function MessageScrollerDemo() {
  const [messages, setMessages] = React.useState([
    { id: 1, sender: 'SYS', text: 'Encrypted tunnel established on LON-01.' },
    { id: 2, sender: 'YOU', text: 'Run diagnostics on Glyph Matrix 25×25.' },
    { id: 3, sender: 'SYS', text: '481 / 481 LEDs responding at 0.4ms latency.' },
    { id: 4, sender: 'YOU', text: 'Sync presets to React Native companion.' },
    { id: 5, sender: 'SYS', text: 'All 136 components synced via nthgui/native.' },
  ]);
  const [atBottom, setAtBottom] = React.useState(true);
  const listRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    setAtBottom(true);
  };

  const pushMessage = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        sender: prev.length % 2 === 0 ? 'SYS' : 'YOU',
        text: `Telemetry packet #${prev.length + 1} verified (${12 + (prev.length % 9)}ms).`,
      },
    ]);
    window.setTimeout(() => {
      if (atBottom) scrollToBottom();
    }, 20);
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-2.5">
      <div className="relative">
        <div
          ref={listRef}
          onScroll={() => {
            const el = listRef.current;
            if (!el) return;
            setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 18);
          }}
          className="h-44 overflow-y-auto rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3 space-y-2"
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={cn(
                'max-w-[84%] rounded-xl px-3 py-2 font-mono text-xs',
                m.sender === 'YOU'
                  ? 'ml-auto bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-primary)]',
              )}
            >
              <div className="text-[9px] opacity-65 mb-0.5">{m.sender}</div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>

        {!atBottom && (
          <button
            type="button"
            onClick={scrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full border border-[var(--nt-accent)] bg-[var(--nt-bg)] px-3 py-1 font-mono text-[11px] text-[var(--nt-display)] shadow-lg cursor-pointer"
          >
            <ArrowDown className="h-3 w-3 text-[var(--nt-accent)]" />
            <span>Jump to latest</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
        <span>{messages.length} messages · {atBottom ? 'Pinned to bottom' : 'Scrolled up'}</span>
        <Button variant="outline" size="sm" onClick={pushMessage}>
          <Plus className="h-3.5 w-3.5" />
          Simulate Incoming
        </Button>
      </div>
    </div>
  );
}
