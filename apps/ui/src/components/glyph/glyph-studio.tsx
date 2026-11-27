import * as React from 'react';
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Copy,
  DownloadSimple,
  Eraser,
  FlipHorizontal,
  PaintBucket,
  Pause,
  Play,
  Plus,
  Sparkle,
  Trash,
  UploadSimple,
} from '@phosphor-icons/react';
import {
  GLYPH_PRESETS,
  clear,
  countAddressable,
  countLitCells,
  countSignalCells,
  fill,
  getGlyphGeometry,
  getPreset,
  invert,
  mirrorPattern,
  parsePattern,
  patternToSvgString,
  resizePattern,
  rotatePattern,
  serializePattern,
  shiftPattern,
  type GlyphCellState,
  type GlyphFrame,
  type GlyphPaintState,
  type GlyphPresetId,
  type GlyphResampleMode,
  type GlyphResolution,
} from '@nothing-ui/core';
import { Button, GlyphMatrix, GlyphPatternPreview, cn } from '@nothing-ui/ui';

interface StudioSnapshot {
  resolution: GlyphResolution;
  frames: GlyphFrame[];
  activeFrameIndex: number;
}

export function GlyphStudio() {
  const [resolution, setResolution] = React.useState<GlyphResolution>(25);
  const [resampleMode, setResampleMode] = React.useState<GlyphResampleMode>('area');
  const [patternName, setPatternName] = React.useState('Power Glyph');
  const [paintState, setPaintState] = React.useState<GlyphPaintState>('on');
  const [canvasSize, setCanvasSize] = React.useState<number>(280);
  const [brightness, setBrightness] = React.useState<number>(1);

  const [frames, setFrames] = React.useState<GlyphFrame[]>(() => [
    { cells: getPreset('power', 25), durationMs: 360 },
  ]);
  const [activeFrameIndex, setActiveFrameIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);

  // Undo / Redo history stacks
  const [past, setPast] = React.useState<StudioSnapshot[]>([]);
  const [future, setFuture] = React.useState<StudioSnapshot[]>([]);

  // Import / Export drawer state
  const [ioTab, setIoTab] = React.useState<'export' | 'import'>('export');
  const [importDraft, setImportDraft] = React.useState('');
  const [importError, setImportError] = React.useState<string | null>(null);
  const [importSuccess, setImportSuccess] = React.useState<string | null>(null);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const activeFrame = frames[activeFrameIndex] ?? frames[0];
  const geometry = getGlyphGeometry(resolution);
  const litCount = countLitCells(activeFrame.cells);
  const signalCount = countSignalCells(activeFrame.cells);

  const pushHistory = React.useCallback(
    (nextRes: GlyphResolution, nextFrames: GlyphFrame[], nextIdx: number) => {
      setPast((prev) => [
        ...prev.slice(-29),
        {
          resolution,
          frames: frames.map((f) => ({ cells: [...f.cells], durationMs: f.durationMs })),
          activeFrameIndex,
        },
      ]);
      setFuture([]);
      setResolution(nextRes);
      setFrames(nextFrames);
      setActiveFrameIndex(Math.min(nextIdx, nextFrames.length - 1));
    },
    [resolution, frames, activeFrameIndex]
  );

  const updateCurrentCells = React.useCallback(
    (nextCells: GlyphCellState[]) => {
      const nextFrames = frames.map((f, idx) =>
        idx === activeFrameIndex ? { ...f, cells: nextCells } : f
      );
      pushHistory(resolution, nextFrames, activeFrameIndex);
    },
    [frames, activeFrameIndex, resolution, pushHistory]
  );

  const handleUndo = () => {
    if (past.length === 0) return;
    const prev = past[past.length - 1];
    setFuture((f) => [
      {
        resolution,
        frames: frames.map((fr) => ({ cells: [...fr.cells], durationMs: fr.durationMs })),
        activeFrameIndex,
      },
      ...f.slice(0, 29),
    ]);
    setPast((p) => p.slice(0, -1));
    setResolution(prev.resolution);
    setFrames(prev.frames);
    setActiveFrameIndex(prev.activeFrameIndex);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast((p) => [
      ...p.slice(-29),
      {
        resolution,
        frames: frames.map((fr) => ({ cells: [...fr.cells], durationMs: fr.durationMs })),
        activeFrameIndex,
      },
    ]);
    setFuture((f) => f.slice(1));
    setResolution(next.resolution);
    setFrames(next.frames);
    setActiveFrameIndex(next.activeFrameIndex);
  };

  const handleSwitchResolution = (target: GlyphResolution) => {
    if (target === resolution) return;
    setPlaying(false);
    const resampledFrames = frames.map((f) => ({
      ...f,
      cells: resizePattern(f.cells, resolution, target, resampleMode),
    }));
    pushHistory(target, resampledFrames, activeFrameIndex);
  };

  const handleApplyPreset = (presetId: GlyphPresetId) => {
    const presetMeta = GLYPH_PRESETS.find((p) => p.id === presetId);
    if (presetMeta) setPatternName(`${presetMeta.label} Glyph`);
    updateCurrentCells(getPreset(presetId, resolution));
  };

  const handleAddFrame = () => {
    if (frames.length >= 16) return;
    const clone: GlyphFrame = {
      cells: [...activeFrame.cells],
      durationMs: activeFrame.durationMs,
    };
    const nextFrames = [
      ...frames.slice(0, activeFrameIndex + 1),
      clone,
      ...frames.slice(activeFrameIndex + 1),
    ];
    pushHistory(resolution, nextFrames, activeFrameIndex + 1);
  };

  const handleDeleteFrame = (idx: number) => {
    if (frames.length <= 1) return;
    const nextFrames = frames.filter((_, i) => i !== idx);
    pushHistory(resolution, nextFrames, Math.max(0, idx - 1));
  };

  const handleDurationChange = (ms: number) => {
    const clamped = Math.min(5000, Math.max(60, ms));
    setFrames((prev) =>
      prev.map((f, idx) => (idx === activeFrameIndex ? { ...f, durationMs: clamped } : f))
    );
  };

  // Playback timer honoring prefers-reduced-motion
  React.useEffect(() => {
    if (!playing || frames.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveFrameIndex((prev) => (prev + 1) % frames.length);
    }, activeFrame.durationMs);
    return () => window.clearTimeout(timer);
  }, [playing, activeFrameIndex, frames.length, activeFrame.durationMs]);

  const jsonPayload = React.useMemo(() => {
    return serializePattern({
      version: 1,
      resolution,
      name: patternName.trim() || undefined,
      cells: activeFrame.cells,
      frames: frames.length > 1 ? frames : undefined,
    });
  }, [resolution, patternName, activeFrame.cells, frames]);

  const svgPayload = React.useMemo(
    () => patternToSvgString(activeFrame.cells, resolution, { size: 512 }),
    [activeFrame.cells, resolution]
  );

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJson = () => {
    setImportError(null);
    setImportSuccess(null);
    const parsed = parsePattern(importDraft);
    if (!parsed.pattern || parsed.errors.length > 0) {
      setImportError(parsed.errors.join(' '));
      return;
    }
    const pat = parsed.pattern;
    setPlaying(false);
    setPatternName(pat.name ?? 'Imported Pattern');
    const nextFrames: GlyphFrame[] =
      pat.frames && pat.frames.length > 0
        ? pat.frames
        : [{ cells: pat.cells, durationMs: 360 }];
    pushHistory(pat.resolution, nextFrames, 0);
    setImportSuccess(`Imported valid GlyphPatternV1 (${pat.resolution}×${pat.resolution}, ${nextFrames.length} frame${nextFrames.length > 1 ? 's' : ''}).`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div id="studio-header" className="scroll-mt-20 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--nt-line)] pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
            <span>nthgui/glyph</span>
            <span aria-hidden="true">·</span>
            <span>GlyphPatternV1</span>
            <span aria-hidden="true">·</span>
            <span>Offline Studio</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
            Glyph Matrix Studio
          </h1>
          <p className="text-sm text-[var(--nt-secondary)] leading-relaxed">
            Paint, resample, animate, and export circularly masked 25×25 (481 LEDs) and 13×13 (121 LEDs)
            matrix patterns. Every brush stroke and frame transition runs through deterministic core functions.
          </p>
        </div>

        {/* Resolution Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Matrix resolution"
            className="inline-flex items-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1"
          >
            {([25, 13] as const).map((res) => (
              <button
                key={res}
                type="button"
                aria-pressed={resolution === res}
                onClick={() => handleSwitchResolution(res)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
                  resolution === res
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                {res}×{res} · {countAddressable(res)} LEDs
              </button>
            ))}
          </div>

          <select
            aria-label="Resampling algorithm"
            value={resampleMode}
            onChange={(e) => setResampleMode(e.target.value as GlyphResampleMode)}
            className="h-10 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-secondary)] focus:outline-none focus:border-[var(--nt-display)] cursor-pointer"
          >
            <option value="area">Resample: Area</option>
            <option value="nearest">Resample: Nearest</option>
          </select>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Tools & Presets */}
        <section id="studio-tools" className="scroll-mt-20 lg:col-span-3 space-y-5 rounded-2xl nt-card-surface p-5">
          {/* Brush Palette */}
          <div className="space-y-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              Brush Mode
            </h2>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'on', label: 'White', dotClass: 'bg-white border border-black/30' },
                  { id: 'signal', label: 'Signal', dotClass: 'bg-[#D71921]' },
                  { id: 'off', label: 'Erase', dotClass: 'bg-transparent border border-[var(--nt-muted)]' },
                ] as const
              ).map((brush) => (
                <button
                  key={brush.id}
                  type="button"
                  aria-pressed={paintState === brush.id}
                  onClick={() => setPaintState(brush.id)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-2 font-mono text-xs transition-colors cursor-pointer',
                    paintState === brush.id
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                  )}
                >
                  <span className={cn('h-2.5 w-2.5 rounded-full shrink-0', brush.dotClass)} aria-hidden="true" />
                  <span>{brush.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* History & Quick Ops */}
          <div className="space-y-2.5">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              History & Transforms
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" onClick={handleUndo} disabled={past.length === 0}>
                <ArrowCounterClockwise className="h-3.5 w-3.5" /> Undo
              </Button>
              <Button variant="outline" size="sm" onClick={handleRedo} disabled={future.length === 0}>
                <ArrowClockwise className="h-3.5 w-3.5" /> Redo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateCurrentCells(fill(activeFrame.cells, paintState === 'signal' ? 'signal' : 'on'))}
              >
                <PaintBucket className="h-3.5 w-3.5" /> Fill
              </Button>
              <Button variant="secondary" size="sm" onClick={() => updateCurrentCells(clear(activeFrame.cells))}>
                <Eraser className="h-3.5 w-3.5" /> Clear
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateCurrentCells(invert(activeFrame.cells, paintState === 'signal' ? 'signal' : 'on'))}
              >
                <Sparkle className="h-3.5 w-3.5" /> Invert
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => updateCurrentCells(mirrorPattern(activeFrame.cells, resolution, 'horizontal'))}
              >
                <FlipHorizontal className="h-3.5 w-3.5" /> Mirror
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="col-span-2"
                onClick={() => updateCurrentCells(rotatePattern(activeFrame.cells, resolution, 'cw'))}
              >
                <ArrowClockwise className="h-3.5 w-3.5" /> Rotate 90° CW
              </Button>
            </div>

            {/* Shift Pad */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              <button
                type="button"
                aria-label="Shift left"
                onClick={() => updateCurrentCells(shiftPattern(activeFrame.cells, resolution, -1, 0))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Shift up"
                onClick={() => updateCurrentCells(shiftPattern(activeFrame.cells, resolution, 0, -1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Shift down"
                onClick={() => updateCurrentCells(shiftPattern(activeFrame.cells, resolution, 0, 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="Shift right"
                onClick={() => updateCurrentCells(shiftPattern(activeFrame.cells, resolution, 1, 0))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 8 Canonical Presets */}
          <div className="space-y-2.5 border-t border-[var(--nt-line)] pt-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              8 Built-in Presets ({resolution}×{resolution})
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {GLYPH_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset.id)}
                  className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5 text-left font-mono text-xs text-[var(--nt-secondary)] transition-colors hover:border-[var(--nt-display)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Center Editable Canvas + Timeline */}
        <section id="studio-canvas" className="scroll-mt-20 lg:col-span-5 space-y-5">
          <div className="flex flex-col items-center justify-center gap-5 rounded-2xl nt-card-surface p-6 sm:p-8">
            <div className="flex w-full items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
              <span data-testid="studio-resolution-label">
                {resolution}×{resolution} CIRCULAR MASK · R={geometry.radius}
              </span>
              <span className="tabular-nums" data-testid="studio-lit-count">
                {litCount} / {geometry.addressableCount} LIT
              </span>
            </div>

            <div className="flex items-center justify-center py-2">
              <GlyphMatrix
                resolution={resolution}
                cells={activeFrame.cells}
                onCellsChange={updateCurrentCells}
                interactive
                paintState={paintState}
                size={canvasSize}
                brightness={brightness}
                label={`Glyph Studio ${resolution}x${resolution} editable matrix`}
              />
            </div>

            {/* Canvas Zoom & Brightness */}
            <div className="grid w-full grid-cols-1 gap-3 border-t border-[var(--nt-line)] pt-4 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] text-[var(--nt-muted)]">Zoom</span>
                <div className="inline-flex items-center gap-1">
                  {[200, 280, 340].map((px) => (
                    <button
                      key={px}
                      type="button"
                      onClick={() => setCanvasSize(px)}
                      className={cn(
                        'rounded-md border px-2 py-1 font-mono text-[11px] tabular-nums cursor-pointer',
                        canvasSize === px
                          ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                      )}
                    >
                      {px}px
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 font-mono text-[11px] text-[var(--nt-muted)]">
                <span>LED Luminance</span>
                <input
                  type="range"
                  min={0.35}
                  max={1}
                  step={0.05}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  aria-label="LED luminance"
                  className="w-28 accent-[var(--nt-accent)] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Frame Animation Timeline */}
          <div id="studio-timeline" className="scroll-mt-20 rounded-2xl nt-card-surface p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-display)]">
                <span>Animation Timeline</span>
                <span className="text-[var(--nt-muted)] tabular-nums">
                  · Frame {activeFrameIndex + 1}/{frames.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={playing ? 'signal' : 'primary'}
                  size="sm"
                  disabled={frames.length <= 1}
                  onClick={() => setPlaying((p) => !p)}
                >
                  {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleAddFrame} disabled={frames.length >= 16}>
                  <Plus className="h-3.5 w-3.5" /> Add Frame
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
              {frames.map((frame, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex shrink-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors',
                    idx === activeFrameIndex
                      ? 'border-[var(--nt-display)] bg-[var(--nt-raised)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)]'
                  )}
                >
                  <button
                    type="button"
                    aria-label={`Select frame ${idx + 1}`}
                    onClick={() => {
                      setPlaying(false);
                      setActiveFrameIndex(idx);
                    }}
                    className="cursor-pointer"
                  >
                    <GlyphPatternPreview resolution={resolution} cells={frame.cells} size={52} />
                  </button>
                  <div className="flex items-center gap-1.5 font-mono text-[10px] tabular-nums text-[var(--nt-muted)]">
                    <span>F{idx + 1}</span>
                    <span>·</span>
                    <span>{frame.durationMs}ms</span>
                    {frames.length > 1 && (
                      <button
                        type="button"
                        aria-label={`Delete frame ${idx + 1}`}
                        onClick={() => handleDeleteFrame(idx)}
                        className="text-[var(--nt-muted)] hover:text-[var(--nt-accent)] cursor-pointer"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--nt-line)] pt-3 font-mono text-xs">
              <label htmlFor="frame-duration" className="text-[var(--nt-secondary)]">
                Active Frame Duration
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="frame-duration"
                  type="range"
                  min={80}
                  max={1500}
                  step={20}
                  value={activeFrame.durationMs}
                  onChange={(e) => handleDurationChange(Number(e.target.value))}
                  className="w-32 accent-[var(--nt-accent)] cursor-pointer"
                />
                <span className="w-14 text-right tabular-nums text-[var(--nt-display)]">
                  {activeFrame.durationMs}ms
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Inspector & JSON / SVG I/O */}
        <section id="studio-export" className="scroll-mt-20 lg:col-span-4 rounded-2xl nt-card-surface p-5 space-y-5">
          <div className="space-y-2">
            <label htmlFor="pattern-name" className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              Pattern Name
            </label>
            <input
              id="pattern-name"
              type="text"
              value={patternName}
              onChange={(e) => setPatternName(e.target.value)}
              maxLength={80}
              className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-display)] focus:border-[var(--nt-display)] focus:outline-none"
            />
          </div>

          {/* Telemetry Readout */}
          <dl className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 font-mono text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">Addressable</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-[var(--nt-display)]">{geometry.addressableCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">Void Masked</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-[var(--nt-secondary)]">{geometry.voidCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">Lit LEDs</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-[var(--nt-display)]">{litCount}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.1em] text-[var(--nt-muted)]">Signal Red</dt>
              <dd className="mt-0.5 text-sm tabular-nums text-[var(--nt-accent)]">{signalCount}</dd>
            </div>
          </dl>

          {/* Export / Import Tabs */}
          <div className="space-y-3">
            <div className="inline-flex w-full rounded-lg bg-[var(--nt-raised)] p-1">
              <button
                type="button"
                onClick={() => setIoTab('export')}
                className={cn(
                  'flex-1 rounded-md py-1.5 font-mono text-xs transition-colors cursor-pointer',
                  ioTab === 'export'
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                Export JSON / SVG
              </button>
              <button
                type="button"
                onClick={() => setIoTab('import')}
                className={cn(
                  'flex-1 rounded-md py-1.5 font-mono text-xs transition-colors cursor-pointer',
                  ioTab === 'import'
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                Import V1 JSON
              </button>
            </div>

            {ioTab === 'export' ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => copyText('json', jsonPayload)}
                  >
                    {copiedKey === 'json' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedKey === 'json' ? 'Copied JSON' : 'Copy JSON'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      downloadFile(
                        `glyph-${resolution}x${resolution}.svg`,
                        svgPayload,
                        'image/svg+xml'
                      )
                    }
                  >
                    <DownloadSimple className="h-3.5 w-3.5" /> Download SVG
                  </Button>
                </div>
                <pre
                  data-testid="studio-json-preview"
                  className="max-h-56 overflow-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3 font-mono text-[11px] leading-relaxed text-[var(--nt-secondary)]"
                >
                  <code>{jsonPayload}</code>
                </pre>
              </div>
            ) : (
              <div className="space-y-3">
                <textarea
                  rows={8}
                  value={importDraft}
                  onChange={(e) => setImportDraft(e.target.value)}
                  placeholder='Paste GlyphPatternV1 JSON ({ "version": 1, "resolution": 13, "cells": [...] })'
                  aria-label="Import GlyphPatternV1 JSON"
                  className="w-full rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-3 font-mono text-[11px] text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
                />
                {importError && (
                  <p role="alert" className="font-mono text-[11px] text-[var(--nt-accent)]">
                    {importError}
                  </p>
                )}
                {importSuccess && (
                  <p role="status" className="font-mono text-[11px] text-[var(--nt-success)]">
                    {importSuccess}
                  </p>
                )}
                <Button variant="primary" size="sm" onClick={handleImportJson}>
                  <UploadSimple className="h-3.5 w-3.5" /> Validate & Import Pattern
                </Button>
              </div>
            )}
          </div>

          <p className="border-t border-[var(--nt-line)] pt-3 font-mono text-[11px] leading-relaxed text-[var(--nt-muted)]">
            Keyboard: focus matrix, use Arrow keys to move, Space to toggle LED. Studio runs 100% offline with zero physical-device claims.
          </p>
        </section>
      </div>
    </div>
  );
}
