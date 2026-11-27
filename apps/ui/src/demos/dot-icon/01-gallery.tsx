import * as React from 'react';
import {
  DotIcon,
  DOT_ICON_NAMES,
  type DotIconName,
  type DotShape,
} from '@nothing-ui/dot-icons/react';

export const meta = {
  title: 'Configurable Dot Icon Pack (1,691 Icons · Full Lucide)',
  description:
    'Consumed directly from nthgui/icons with 247 Nothing originals + 100% of Lucide icons, configurable size, color, single-dot scale, dot shape, and custom matrix grid resolution.',
};

export default function DotIconGalleryDemo() {
  const [selected, setSelected] = React.useState<DotIconName>('wifi');
  const [gridSize, setGridSize] = React.useState<number>(15);
  const [dotScale, setDotScale] = React.useState<number>(0.78);
  const [dotShape, setDotShape] = React.useState<DotShape>('circle');
  const [showGrid, setShowGrid] = React.useState<boolean>(true);

  const featured: DotIconName[] = [
    'wifi',
    'alarm-clock',
    'brain-circuit',
    'crown',
    'ghost',
    'earbuds',
    'cpu',
    'terminal',
    'rocket',
    'shield-check',
  ];

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl">
      <div className="flex flex-wrap items-center justify-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)]">
          <DotIcon
            name={selected}
            size={48}
            gridSize={gridSize}
            dotScale={dotScale}
            dotShape={dotShape}
            showGrid={showGrid}
            color="#D71921"
          />
        </div>
        <div className="font-mono text-xs space-y-1">
          <div className="text-[var(--nt-display)]">{selected}</div>
          <div className="text-[var(--nt-muted)]">
            {DOT_ICON_NAMES.length} total bitmaps · {gridSize}×{gridSize} matrix · scale{' '}
            {dotScale.toFixed(2)}×
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {[7, 9, 13, 15].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGridSize(g)}
                className={`rounded border px-2 py-0.5 text-[10px] tabular-nums cursor-pointer ${
                  gridSize === g
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-secondary)]'
                }`}
              >
                {g}×{g}
              </button>
            ))}
            {(['circle', 'rounded', 'square', 'diamond'] as const).map((shape) => (
              <button
                key={shape}
                type="button"
                onClick={() => setDotShape(shape)}
                className={`rounded border px-2 py-0.5 text-[10px] capitalize cursor-pointer ${
                  dotShape === shape
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-secondary)]'
                }`}
              >
                {shape}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setShowGrid((v) => !v)}
              className="rounded border border-[var(--nt-line)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] cursor-pointer"
            >
              Grid: {showGrid ? 'On' : 'Off'}
            </button>
          </div>
        </div>
      </div>

      <label className="flex items-center gap-3 font-mono text-[11px] text-[var(--nt-muted)]">
        <span>Dot Scale {dotScale.toFixed(2)}×</span>
        <input
          type="range"
          min={0.35}
          max={1.1}
          step={0.05}
          value={dotScale}
          onChange={(e) => setDotScale(Number(e.target.value))}
          className="w-36 accent-[var(--nt-accent)] cursor-pointer"
        />
      </label>

      <div className="flex flex-wrap justify-center gap-2">
        {featured.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setSelected(name)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-mono text-xs transition-colors cursor-pointer ${
              selected === name
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
            }`}
          >
            <DotIcon
              name={name}
              size={16}
              gridSize={gridSize}
              dotScale={dotScale}
              dotShape={dotShape}
              decorative
            />
            <span>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
