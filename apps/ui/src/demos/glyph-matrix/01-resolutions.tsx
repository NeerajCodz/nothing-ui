import * as React from 'react';
import { getPreset, type GlyphPresetId } from '@nothing-ui/core';
import {
  GlyphAnimator,
  GlyphCell,
  GlyphEditor,
  GlyphMatrix13,
  GlyphMatrix25,
  GlyphPatternPicker,
  GlyphProgress,
  GlyphTimeline,
} from '@nothing-ui/ui';

export const meta = {
  title: 'Family 14 · Complete 10-Component Glyph Matrix Suite',
  description:
    'GlyphMatrix, GlyphMatrix25, GlyphMatrix13, GlyphCell, GlyphPatternPreview, GlyphPatternPicker, GlyphProgress, GlyphAnimator, GlyphEditor, and GlyphTimeline.',
};

export default function GlyphMatrixResolutionsDemo() {
  const [preset, setPreset] = React.useState<GlyphPresetId>('power');
  const [cellState, setCellState] = React.useState<'off' | 'on' | 'signal'>('signal');
  const [activeFrame, setActiveFrame] = React.useState(0);
  const [playing, setPlaying] = React.useState(true);

  const demoFrames = React.useMemo(
    () => [
      { id: 'f1', cells: getPreset('power', 13), durationMs: 420 },
      { id: 'f2', cells: getPreset('heart', 13), durationMs: 420 },
      { id: 'f3', cells: getPreset('live', 13), durationMs: 420 },
      { id: 'f4', cells: getPreset('plus', 13), durationMs: 420 },
    ],
    [],
  );

  return (
    <div className="space-y-8 w-full max-w-3xl">
      {/* Row 1: GlyphMatrix25, GlyphMatrix13, GlyphProgress, GlyphAnimator */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 place-items-center">
        <div className="flex flex-col items-center gap-2">
          <GlyphMatrix25 preset={preset} size={140} />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">GlyphMatrix25 · 481</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <GlyphMatrix13 preset={preset} size={140} />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">GlyphMatrix13 · 121</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <GlyphProgress value={72} resolution={13} size={140} signal />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">GlyphProgress · 72%</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <GlyphAnimator resolution={13} frames={demoFrames} playing={playing} size={140} />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">GlyphAnimator · 4F</span>
        </div>
      </div>

      {/* Row 2: GlyphPatternPicker + GlyphCell */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
            GlyphPatternPicker &amp; GlyphCell
          </span>
          <div className="flex items-center gap-2.5 font-mono text-[11px] text-[var(--nt-secondary)]">
            <GlyphCell
              state={cellState}
              interactive
              onToggle={() =>
                setCellState((s) => (s === 'off' ? 'on' : s === 'on' ? 'signal' : 'off'))
              }
            />
            <span>Click LED ({cellState})</span>
          </div>
        </div>
        <GlyphPatternPicker value={preset} onValueChange={setPreset} resolution={13} />
      </div>

      {/* Row 3: GlyphEditor + GlyphTimeline */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 items-start">
        <GlyphEditor resolution={13} initialPreset="heart" size={168} />
        <GlyphTimeline
          frames={demoFrames}
          resolution={13}
          activeIndex={activeFrame}
          onSelectFrame={setActiveFrame}
          playing={playing}
          onTogglePlay={() => setPlaying((p) => !p)}
        />
      </div>
    </div>
  );
}
