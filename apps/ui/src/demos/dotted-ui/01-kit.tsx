import * as React from 'react';
import { DotCounter, DotLoader, DotMatrixClock, DotProgress, DotText } from '@nothing-ui/ui';

export const meta = {
  title: 'Family 15 · Dotted UI Components',
  description: 'DotText, DotLoader, DotCounter, DotProgress, and DotMatrixClock built for optical monochrome precision.',
};

export default function DottedUiKitDemo() {
  const [progress, setProgress] = React.useState(72);

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
        <DotText as="h3" size="lg">NOTHING OS 3.0</DotText>
        <DotText size="sm" tone="signal" uppercase>SIGNAL CHANNEL</DotText>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DotCounter value={481} label="25×25 LEDs" unit="DOTS" />
        <DotCounter value={121} label="13×13 LEDs" unit="DOTS" />
        <DotCounter value="99.4" label="UPTIME" unit="%" signal />
      </div>

      <div className="space-y-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
        <DotProgress value={progress} label="FIRMWARE SYNC" signal />
        <div className="flex items-center gap-2 font-mono text-xs">
          {[25, 50, 72, 100].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setProgress(v)}
              className="rounded border border-[var(--nt-line-2)] px-2.5 py-1 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              {v}%
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <DotMatrixClock timezoneLabel="UTC+0" />
        <DotLoader label="SYNCING" />
      </div>
    </div>
  );
}
