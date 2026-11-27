import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  cyclePlaybackSpeed,
  formatCountdownSeconds,
} from '../../../lib/widgets/utility-widget-logic';

interface PodcastChapter {
  id: string;
  title: string;
  startSec: number;
}

const CHAPTERS: readonly PodcastChapter[] = [
  { id: 'c1', title: '01. Industrial Hardware Craft', startSec: 0 },
  { id: 'c2', title: '02. Dot-Matrix Typography Systems', startSec: 420 },
  { id: 'c3', title: '03. Acoustic Tuning & ANC Curves', startSec: 980 },
  { id: 'c4', title: '04. Future of Tactile Interfaces', startSec: 1560 },
];

const TOTAL_SECONDS = 2140;

export interface PodcastMiniPlayerWidgetProps {
  episodeTitle?: string;
  showTitle?: string;
  className?: string;
}

export function PodcastMiniPlayerWidget({
  episodeTitle = 'Ep. 42 — Designing Honest Hardware',
  showTitle = 'Signal & Form Podcast',
  className,
}: PodcastMiniPlayerWidgetProps) {
  const [playing, setPlaying] = React.useState(false);
  const [positionSec, setPositionSec] = React.useState(448);
  const [speed, setSpeed] = React.useState(1);
  const [sleepTimer, setSleepTimer] = React.useState<'Off' | '15m' | '30m'>('Off');

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPositionSec((prev) => {
        const next = prev + speed;
        if (next >= TOTAL_SECONDS) {
          setPlaying(false);
          return TOTAL_SECONDS;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [playing, speed]);

  const activeChapter =
    [...CHAPTERS].reverse().find((c) => positionSec >= c.startSec) ?? CHAPTERS[0];

  const skip = (delta: number) => {
    setPositionSec((prev) => Math.max(0, Math.min(TOTAL_SECONDS, Math.round(prev + delta))));
  };

  const cycleSleep = () => {
    setSleepTimer((prev) => (prev === 'Off' ? '15m' : prev === '15m' ? '30m' : 'Off'));
  };

  return (
    <section
      aria-label="Podcast and Queue Mini Player"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--nt-line)]">
        <div className="min-w-0">
          <div className="text-[11px] font-mono text-[var(--nt-muted)] truncate">
            {showTitle}
          </div>
          <h3 className="text-sm font-semibold tracking-tight mt-0.5 truncate">
            {episodeTitle}
          </h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 truncate">
            {activeChapter.title}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setSpeed((s) => cyclePlaybackSpeed(s))}
            aria-label="Cycle playback speed"
            className="px-2.5 py-1 text-xs font-mono tabular-nums rounded-lg border border-[var(--nt-line)] text-[var(--nt-display)] whitespace-nowrap"
          >
            {speed}×
          </button>
          <button
            type="button"
            onClick={cycleSleep}
            aria-label="Cycle sleep timer"
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap',
              sleepTimer !== 'Off'
                ? 'border-[var(--nt-accent)] text-[var(--nt-accent)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)]',
            )}
          >
            Sleep: {sleepTimer}
          </button>
        </div>
      </div>

      {/* Scrubber & transport */}
      <div className="mt-4 space-y-3">
        <input
          type="range"
          aria-label="Podcast playback position"
          min={0}
          max={TOTAL_SECONDS}
          value={Math.round(positionSec)}
          onChange={(e) => setPositionSec(Number(e.target.value))}
          className="w-full accent-[var(--nt-accent)] cursor-pointer"
        />
        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-[var(--nt-muted)]">
          <span>{formatCountdownSeconds(positionSec)}</span>
          <span>-{formatCountdownSeconds(TOTAL_SECONDS - positionSec)}</span>
        </div>

        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => skip(-15)}
            className="px-3 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            −15s
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className={cn(
              'px-5 py-2 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0',
              playing
                ? 'bg-[var(--nt-accent)] text-white'
                : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
            )}
          >
            {playing ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={() => skip(15)}
            className="px-3 py-2 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            +15s
          </button>
        </div>
      </div>

      {/* Chapter queue */}
      <div className="mt-4 pt-3 border-t border-[var(--nt-line)] space-y-1">
        {CHAPTERS.map((chap) => {
          const active = chap.id === activeChapter.id;
          return (
            <button
              key={chap.id}
              type="button"
              onClick={() => setPositionSec(chap.startSec)}
              className={cn(
                'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors',
                active
                  ? 'bg-[var(--nt-bg)] text-[var(--nt-display)] font-medium border border-[var(--nt-line)]'
                  : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
              )}
            >
              <span className="truncate">{chap.title}</span>
              <span className="font-mono tabular-nums shrink-0">
                {formatCountdownSeconds(chap.startSec)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
