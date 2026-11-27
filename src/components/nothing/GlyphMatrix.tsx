import {
  GLYPH_GRID_SIZE,
  buildPresetMatrix,
  type GlyphCellState,
  type GlyphPresetId,
} from '@/lib/glyph-matrix';
import { cn } from '@/lib/utils';

export interface GlyphMatrixProps {
  preset?: GlyphPresetId;
  cells?: GlyphCellState[];
  size?: number;
  interactive?: boolean;
  onCellToggle?: (index: number) => void;
  className?: string;
  label?: string;
}

export function GlyphMatrix({
  preset = 'power',
  cells,
  size = 180,
  interactive = false,
  onCellToggle,
  className,
  label,
}: GlyphMatrixProps) {
  const grid = cells ?? buildPresetMatrix(preset);

  return (
    <div
      style={{ width: size, height: size }}
      role={interactive ? 'group' : 'img'}
      aria-label={label ?? `Glyph Matrix ${preset}`}
      className={cn(
        'grid rounded-full border border-[#252525] bg-[#070707] p-[6.5%] box-border select-none shrink-0',
        className
      )}
      data-testid="glyph-matrix"
    >
      <div
        className="grid w-full h-full gap-[1.5px]"
        style={{ gridTemplateColumns: `repeat(${GLYPH_GRID_SIZE}, minmax(0, 1fr))` }}
      >
        {grid.map((state, idx) => {
          if (state === 'void') {
            return <span key={idx} className="aspect-square bg-transparent" aria-hidden="true" />;
          }

          const dotColor =
            state === 'signal'
              ? 'bg-[#D71921]'
              : state === 'on'
                ? 'bg-white'
                : 'bg-white/[0.08]';

          if (interactive && onCellToggle) {
            const row = Math.floor(idx / GLYPH_GRID_SIZE);
            const col = idx % GLYPH_GRID_SIZE;
            return (
              <button
                key={idx}
                type="button"
                aria-label={`LED row ${row + 1} col ${col + 1} ${state}`}
                onClick={() => onCellToggle(idx)}
                className={cn(
                  'aspect-square rounded-full transition-transform duration-100 hover:scale-125 focus-visible:outline-1 focus-visible:outline-[#D71921] cursor-pointer',
                  dotColor
                )}
              />
            );
          }

          return (
            <span
              key={idx}
              className={cn('aspect-square rounded-full transition-colors duration-150', dotColor)}
            />
          );
        })}
      </div>
    </div>
  );
}
