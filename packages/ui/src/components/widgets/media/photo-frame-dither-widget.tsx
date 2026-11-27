import * as React from 'react';
import { cn } from '../../../lib/cn';

type DitherStyle = 'fine' | 'coarse' | 'inverted';

interface DitherFrame {
  id: string;
  title: string;
  caption: string;
  exif: string;
  pattern: 'horizon' | 'monolith' | 'rings';
}

const FRAMES: readonly DitherFrame[] = [
  {
    id: 'f1',
    title: 'London Studio Facade',
    caption: 'Brutalist concrete ribs in overcast morning light.',
    exif: '50mm · f/1.8 · 1/640s · ISO 100',
    pattern: 'monolith',
  },
  {
    id: 'f2',
    title: 'Solar Ridge Study',
    caption: 'High-contrast halftone skyline at dusk.',
    exif: '35mm · f/2.0 · 1/1250s · ISO 200',
    pattern: 'horizon',
  },
  {
    id: 'f3',
    title: 'Acoustic Chamber Dial',
    caption: 'Concentric wave diffraction calibration study.',
    exif: '85mm · f/2.8 · 1/320s · ISO 400',
    pattern: 'rings',
  },
];

function computeDotRadius(
  pattern: DitherFrame['pattern'],
  row: number,
  col: number,
  rows: number,
  cols: number,
  maxR: number,
): number {
  const nx = col / Math.max(1, cols - 1);
  const ny = row / Math.max(1, rows - 1);

  if (pattern === 'horizon') {
    const ridge = 0.56 + Math.sin(nx * Math.PI * 2.4) * 0.14 + Math.cos(nx * Math.PI * 5) * 0.05;
    const sunDist = Math.hypot(nx - 0.72, ny - 0.28);
    if (sunDist < 0.14) return maxR * 0.95;
    if (ny > ridge) return maxR * (0.45 + (ny - ridge) * 1.1);
    return maxR * Math.max(0.12, 0.35 - ny * 0.3);
  }

  if (pattern === 'rings') {
    const dist = Math.hypot(nx - 0.5, ny - 0.5);
    const wave = (Math.cos(dist * Math.PI * 10) + 1) / 2;
    return maxR * (0.15 + wave * 0.8);
  }

  // monolith
  const inBlock = nx > 0.26 && nx < 0.74 && ny > 0.16 && ny < 0.88;
  const slit = nx > 0.44 && nx < 0.56 && ny > 0.28 && ny < 0.72;
  if (slit) return maxR * 0.14;
  if (inBlock) return maxR * (0.65 + (nx - 0.26) * 0.5);
  return maxR * (0.15 + ny * 0.25);
}

export interface PhotoFrameDitherWidgetProps {
  className?: string;
}

export function PhotoFrameDitherWidget({ className }: PhotoFrameDitherWidgetProps) {
  const [index, setIndex] = React.useState(0);
  const [dither, setDither] = React.useState<DitherStyle>('fine');
  const [showExif, setShowExif] = React.useState(true);

  const frame = FRAMES[index] ?? FRAMES[0];
  const cols = dither === 'coarse' ? 16 : 24;
  const rows = dither === 'coarse' ? 10 : 15;
  const stepX = 320 / cols;
  const stepY = 200 / rows;
  const maxR = Math.min(stepX, stepY) * 0.44;

  const prevFrame = () => setIndex((i) => (i - 1 + FRAMES.length) % FRAMES.length);
  const nextFrame = () => setIndex((i) => (i + 1) % FRAMES.length);

  return (
    <section
      aria-label="Monochrome Photo Frame"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Monochrome Photo Frame</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            Frame 0{index + 1} / 0{FRAMES.length} · {frame.title}
          </p>
        </div>

        <div className="flex items-center gap-1" role="group" aria-label="Dither resolution">
          {(['fine', 'coarse', 'inverted'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setDither(mode)}
              aria-pressed={dither === mode}
              className={cn(
                'px-2.5 py-1 text-xs font-mono rounded-lg border capitalize transition-colors whitespace-nowrap shrink-0',
                dither === mode
                  ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Halftone monochrome SVG frame */}
      <div
        className={cn(
          'mt-4 rounded-xl border border-[var(--nt-line-2)] overflow-hidden relative',
          dither === 'inverted' ? 'bg-[var(--nt-display)]' : 'bg-[var(--nt-bg)]',
        )}
      >
        <svg
          viewBox="0 0 320 200"
          className="w-full h-auto block"
          role="img"
          aria-label={`Dot-dithered monochrome photo: ${frame.title}`}
        >
          {Array.from({ length: rows }).map((_, r) =>
            Array.from({ length: cols }).map((__, c) => {
              const rad = computeDotRadius(frame.pattern, r, c, rows, cols, maxR);
              const isFocalAccent =
                frame.pattern === 'horizon' && r === Math.round(rows * 0.28) && c === Math.round(cols * 0.72);
              return (
                <circle
                  key={`${r}-${c}`}
                  cx={c * stepX + stepX / 2}
                  cy={r * stepY + stepY / 2}
                  r={Math.min(maxR, Math.max(0.8, rad))}
                  fill={
                    isFocalAccent
                      ? 'var(--nt-accent)'
                      : dither === 'inverted'
                        ? 'var(--nt-bg)'
                        : 'var(--nt-display)'
                  }
                />
              );
            }),
          )}
        </svg>

        {showExif && (
          <div className="px-3.5 py-2 border-t border-[var(--nt-line)] bg-[var(--nt-surface)]/95 flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums text-[var(--nt-muted)]">
            <span className="truncate">{frame.caption}</span>
            <span className="shrink-0 text-[var(--nt-display)]">{frame.exif}</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setShowExif((v) => !v)}
          aria-pressed={showExif}
          className="px-2.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
        >
          {showExif ? 'Hide EXIF' : 'Show EXIF'}
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevFrame}
            aria-label="Previous photo frame"
            className="px-3 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={nextFrame}
            aria-label="Next photo frame"
            className="px-3 py-1 text-xs font-mono rounded-lg bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] whitespace-nowrap shrink-0"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
