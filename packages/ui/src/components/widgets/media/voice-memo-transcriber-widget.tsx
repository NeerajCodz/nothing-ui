import * as React from 'react';
import { cn } from '../../../lib/cn';
import { formatCountdownSeconds } from '../../../lib/widgets/utility-widget-logic';

interface TranscriptSegment {
  id: string;
  timeSec: number;
  text: string;
  marked?: boolean;
}

const INITIAL_SEGMENTS: TranscriptSegment[] = [
  {
    id: 's1',
    timeSec: 4,
    text: 'Keep the analog clock sweep hand in Signal Red and lock the dial bezel to 1px hairline contrast.',
  },
  {
    id: 's2',
    timeSec: 18,
    text: 'Ship every planned widget with matching React Native specs and unit-tested logic.',
    marked: true,
  },
];

const WAVEFORM_BARS = [24, 52, 76, 40, 88, 64, 34, 92, 58, 44, 72, 30, 84, 50, 66, 28];

export interface VoiceMemoTranscriberWidgetProps {
  title?: string;
  className?: string;
}

export function VoiceMemoTranscriberWidget({
  title = 'Field Memo #19 — Design Review',
  className,
}: VoiceMemoTranscriberWidgetProps) {
  const [recording, setRecording] = React.useState(false);
  const [elapsedSec, setElapsedSec] = React.useState(24);
  const [segments, setSegments] = React.useState<TranscriptSegment[]>(INITIAL_SEGMENTS);
  const [draftNote, setDraftNote] = React.useState('');
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => {
      setElapsedSec((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const addMarker = () => {
    const text =
      draftNote.trim() ||
      `Chapter marker captured at ${formatCountdownSeconds(elapsedSec)}.`;
    setSegments((prev) => [
      ...prev,
      { id: `seg-${Date.now()}`, timeSec: elapsedSec, text, marked: true },
    ]);
    setDraftNote('');
  };

  const copyTranscript = () => {
    const output = segments
      .map((s) => `[${formatCountdownSeconds(s.timeSec)}] ${s.text}`)
      .join('\n');
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(output).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section
      aria-label="Voice Memo and Transcript Pad"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono tabular-nums">
            {recording ? 'Recording live' : 'Standby'} · {formatCountdownSeconds(elapsedSec)} ·{' '}
            {segments.length} segments
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setRecording((r) => !r)}
            className={cn(
              'px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0',
              recording
                ? 'bg-[var(--nt-accent)] text-white'
                : 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]',
            )}
          >
            {recording ? 'Stop' : 'Record'}
          </button>
          <button
            type="button"
            onClick={copyTranscript}
            className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] whitespace-nowrap shrink-0"
          >
            {copied ? 'Copied' : 'Copy Text'}
          </button>
        </div>
      </div>

      {/* Live waveform visualizer */}
      <div className="mt-4 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] px-4 py-4">
        <div className="flex items-center justify-between gap-1.5 h-12" aria-hidden="true">
          {WAVEFORM_BARS.map((height, idx) => {
            const dynamic = recording
              ? Math.max(16, ((height + elapsedSec * 19 + idx * 13) % 85) + 15)
              : height;
            return (
              <span
                key={idx}
                className={cn(
                  'flex-1 rounded-xs transition-all duration-200',
                  recording && idx % 5 === 0 ? 'bg-[var(--nt-accent)]' : 'bg-[var(--nt-display)]/75',
                )}
                style={{ height: `${dynamic}%` }}
              />
            );
          })}
        </div>
      </div>

      {/* Timestamped transcript list */}
      <div className="mt-4 space-y-2 max-h-44 overflow-y-auto">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="flex items-start gap-2.5 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3 py-2 text-xs"
          >
            <span
              className={cn(
                'font-mono tabular-nums shrink-0 mt-0.5',
                seg.marked ? 'text-[var(--nt-accent)] font-semibold' : 'text-[var(--nt-muted)]',
              )}
            >
              {formatCountdownSeconds(seg.timeSec)}
            </span>
            <p className="text-[var(--nt-display)] leading-relaxed">{seg.text}</p>
          </div>
        ))}
      </div>

      {/* Quick marker note form */}
      <form
        className="mt-3 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          addMarker();
        }}
      >
        <input
          type="text"
          value={draftNote}
          onChange={(e) => setDraftNote(e.target.value)}
          placeholder="Add timestamped transcript note..."
          aria-label="Transcript note"
          className="flex-1 min-w-0 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] px-3 py-1.5 text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)]"
        />
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-mono rounded-lg border border-[var(--nt-line-2)] text-[var(--nt-display)] hover:bg-[var(--nt-inverse-bg)] hover:text-[var(--nt-inverse-fg)] transition-colors whitespace-nowrap shrink-0"
        >
          + Marker
        </button>
      </form>
    </section>
  );
}
