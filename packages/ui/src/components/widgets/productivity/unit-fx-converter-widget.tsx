import * as React from 'react';
import { cn } from '../../../lib/cn';
import {
  CONVERSION_CATEGORIES,
  type ConversionCategoryId,
  convertUnitValue,
} from '../../../lib/widgets/utility-widget-logic';

export interface UnitFxConverterWidgetProps {
  defaultCategory?: ConversionCategoryId;
  className?: string;
}

export function UnitFxConverterWidget({
  defaultCategory = 'currency',
  className,
}: UnitFxConverterWidgetProps) {
  const [categoryId, setCategoryId] = React.useState<ConversionCategoryId>(defaultCategory);
  const category =
    CONVERSION_CATEGORIES.find((c) => c.id === categoryId) ?? CONVERSION_CATEGORIES[0];

  const [fromUnit, setFromUnit] = React.useState<string>(category.units[0].id);
  const [toUnit, setToUnit] = React.useState<string>(category.units[1].id);
  const [inputValue, setInputValue] = React.useState<string>('100');

  const handleCategoryChange = (nextId: ConversionCategoryId) => {
    const nextCat = CONVERSION_CATEGORIES.find((c) => c.id === nextId) ?? CONVERSION_CATEGORIES[0];
    setCategoryId(nextId);
    setFromUnit(nextCat.units[0].id);
    setToUnit(nextCat.units[1]?.id ?? nextCat.units[0].id);
    setInputValue(nextId === 'temperature' ? '22' : '100');
  };

  const invertUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const parsed = Number(inputValue);
  const converted = Number.isFinite(parsed)
    ? convertUnitValue(categoryId, fromUnit, toUnit, parsed)
    : 0;

  const fromMeta = category.units.find((u) => u.id === fromUnit) ?? category.units[0];
  const toMeta = category.units.find((u) => u.id === toUnit) ?? category.units[1] ?? category.units[0];

  return (
    <section
      aria-label="Precision Unit and FX Converter"
      className={cn(
        'rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 text-[var(--nt-display)]',
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--nt-line)]">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Precision Unit & FX Converter</h3>
          <p className="text-xs text-[var(--nt-muted)] mt-0.5 font-mono">
            {category.label} · Instant invert
          </p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Conversion category">
        {CONVERSION_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryChange(cat.id)}
            aria-pressed={categoryId === cat.id}
            className={cn(
              'px-2.5 py-1 text-xs font-mono rounded-lg border transition-colors whitespace-nowrap shrink-0',
              categoryId === cat.id
                ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'border-[var(--nt-line)] text-[var(--nt-muted)] hover:text-[var(--nt-display)]',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Conversion I/O deck */}
      <div className="mt-4 space-y-3">
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3.5 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label htmlFor="converter-amount" className="block text-[10px] font-mono text-[var(--nt-muted)]">
              FROM ({fromMeta.symbol})
            </label>
            <input
              id="converter-amount"
              type="number"
              step="any"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="mt-1 w-full bg-transparent font-mono tabular-nums text-2xl font-bold text-[var(--nt-display)] focus:outline-none"
            />
          </div>
          <select
            aria-label="Source unit"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--nt-display)]"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} — {u.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={invertUnits}
            aria-label="Invert conversion units"
            className="px-3.5 py-1 text-xs font-mono rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-display)] hover:bg-[var(--nt-inverse-bg)] hover:text-[var(--nt-inverse-fg)] transition-colors whitespace-nowrap shrink-0"
          >
            ⇅ Invert
          </button>
        </div>

        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-3.5 flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-[var(--nt-muted)]">
              TO ({toMeta.symbol})
            </div>
            <output
              aria-label="Converted result"
              className="block mt-1 font-mono tabular-nums text-2xl font-bold text-[var(--nt-accent)] truncate"
            >
              {converted.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </output>
          </div>
          <select
            aria-label="Target unit"
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--nt-display)]"
          >
            {category.units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.id} — {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
