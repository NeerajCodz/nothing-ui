import * as React from 'react';
import {
  ArrowCounterClockwise,
  Check,
  Copy,
  DownloadSimple,
  Eraser,
  GridFour,
  Intersect,
  List,
  MagnifyingGlass,
  SquaresFour,
} from '@phosphor-icons/react';
import {
  DOT_GRID_DEFAULT,
  DOT_GRID_MAX,
  DOT_GRID_MIN,
  DOT_ICON_CATEGORIES,
  DOT_ICON_LIST,
  DOT_SCALE_DEFAULT,
  LUCIDE_DIRECTORY_SOURCE_COUNT,
  LUCIDE_DOT_ICON_NAMES,
  NOTHING_ORIGINAL_ICON_NAMES,
  buildDotIconNativeSnippet,
  buildDotIconReactSnippet,
  clearDotGrid,
  dotIconToSvgString,
  getDotIconGrid,
  invertDotGrid,
  resolveDotRadius,
  searchDotIcons,
  toggleDotGridCell,
  type DotGridMode,
  type DotIconCanonicalName,
  type DotIconSource,
  type DotShape,
} from '@nothing-ui/dot-icons';
import { DotIcon } from '@nothing-ui/dot-icons/react';
import { Button, cn } from '@nothing-ui/ui';

const ICON_CATEGORIES = ['All', ...DOT_ICON_CATEGORIES] as const;

const GRID_QUICK_PRESETS = [7, 9, 11, 13, 15, 21] as const;

const DOT_SHAPE_OPTIONS: ReadonlyArray<{ id: DotShape; label: string }> = [
  { id: 'circle', label: 'Circle' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'square', label: 'Square' },
  { id: 'diamond', label: 'Diamond' },
];

const COLOR_SWATCHES: ReadonlyArray<{ id: string; label: string; value: string; dotBg: string }> = [
  { id: 'mono', label: 'Mono', value: 'currentColor', dotBg: 'var(--nt-display)' },
  { id: 'signal', label: 'Signal Red', value: '#D71921', dotBg: '#D71921' },
  { id: 'white', label: 'Pure White', value: '#FFFFFF', dotBg: '#FFFFFF' },
  { id: 'amber', label: 'Amber', value: '#F59E0B', dotBg: '#F59E0B' },
  { id: 'emerald', label: 'Green', value: '#22C55E', dotBg: '#22C55E' },
  { id: 'cyan', label: 'Cyan', value: '#06B6D4', dotBg: '#06B6D4' },
];

const INITIAL_PAGE_SIZE = 80;
const PAGE_INCREMENT = 120;

export function DotIconExplorer({
  initialIcon = 'wifi',
  onSelectIcon,
}: {
  initialIcon?: DotIconCanonicalName;
  /** Called when the user picks an icon (used to keep the URL in sync). */
  onSelectIcon?: (id: DotIconCanonicalName) => void;
} = {}) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<string>('All');
  const [sourceFilter, setSourceFilter] = React.useState<'all' | DotIconSource>('all');
  const [visibleLimit, setVisibleLimit] = React.useState<number>(INITIAL_PAGE_SIZE);
  const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');
  const [selectedId, setSelectedId] = React.useState<DotIconCanonicalName>(initialIcon);

  // Full visual & dot-grid configuration state
  const [previewSize, setPreviewSize] = React.useState(28);
  const [dotScale, setDotScale] = React.useState<number>(DOT_SCALE_DEFAULT);
  const [dotGap, setDotGap] = React.useState<number>(0);
  const [dotShape, setDotShape] = React.useState<DotShape>('circle');
  const [colorValue, setColorValue] = React.useState<string>('currentColor');
  const [customHex, setCustomHex] = React.useState<string>('#D71921');

  // Configurable Dot Grid state (null = Auto per-icon native resolution: 9x9 Nothing, 15x15 Lucide)
  const [gridCols, setGridCols] = React.useState<number | null>(null);
  const [gridRows, setGridRows] = React.useState<number | null>(null);
  const [gridMode, setGridMode] = React.useState<DotGridMode>('scale');
  const [gridPadding, setGridPadding] = React.useState<number>(0);
  const [showGrid, setShowGrid] = React.useState<boolean>(false);

  // Interactive cell-paint override for the active icon
  const [customGrid, setCustomGrid] = React.useState<string[] | null>(null);

  const [snippetTab, setSnippetTab] = React.useState<'web' | 'native' | 'svg'>('web');
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSelectedId(initialIcon);
    setCustomGrid(null);
  }, [initialIcon]);

  React.useEffect(() => {
    setVisibleLimit(INITIAL_PAGE_SIZE);
  }, [query, category, sourceFilter]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { All: 0 };
    for (const cat of DOT_ICON_CATEGORIES) {
      counts[cat] = 0;
    }
    for (const icon of DOT_ICON_LIST) {
      if (sourceFilter !== 'all' && icon.source !== sourceFilter) continue;
      counts.All++;
      counts[icon.category] = (counts[icon.category] ?? 0) + 1;
    }
    return counts;
  }, [sourceFilter]);

  const filtered = React.useMemo(
    () => searchDotIcons(query, category, sourceFilter),
    [query, category, sourceFilter],
  );

  const hasMoreIcons = filtered.length > visibleLimit;
  const visibleIcons = hasMoreIcons ? filtered.slice(0, visibleLimit) : filtered;

  const selectedMeta =
    DOT_ICON_LIST.find((i) => i.id === selectedId) ?? DOT_ICON_LIST[0];

  const effectiveGridCols = gridCols ?? selectedMeta.nativeGridSize ?? DOT_GRID_DEFAULT;
  const effectiveGridRows = gridRows ?? selectedMeta.nativeGridSize ?? DOT_GRID_DEFAULT;

  const resolvedGrid = React.useMemo(
    () =>
      getDotIconGrid(selectedMeta.id, {
        gridCols: gridCols ?? undefined,
        gridRows: gridRows ?? undefined,
        gridMode,
        gridPadding,
        grid: customGrid ?? undefined,
      }),
    [selectedMeta.id, gridCols, gridRows, gridMode, gridPadding, customGrid],
  );

  const litDotCount = React.useMemo(
    () =>
      resolvedGrid.rows.reduce(
        (sum, row) => sum + row.split('').filter((ch) => ch === '#').length,
        0,
      ),
    [resolvedGrid.rows],
  );

  const effectiveRadius = resolveDotRadius({ dotScale, dotGap });
  const exportColor = colorValue === 'currentColor' ? '#FFFFFF' : colorValue;

  const renderOptions = React.useMemo(
    () => ({
      size: previewSize,
      color: colorValue,
      dotScale,
      dotGap,
      dotShape,
      gridCols: gridCols ?? undefined,
      gridRows: gridRows ?? undefined,
      gridMode,
      gridPadding,
      showGrid,
      grid: customGrid ?? undefined,
    }),
    [
      previewSize,
      colorValue,
      dotScale,
      dotGap,
      dotShape,
      gridCols,
      gridRows,
      gridMode,
      gridPadding,
      showGrid,
      customGrid,
    ],
  );

  const svgString = React.useMemo(
    () =>
      dotIconToSvgString(selectedMeta.id, {
        ...renderOptions,
        color: exportColor,
      }),
    [selectedMeta.id, renderOptions, exportColor],
  );

  const activeSnippet = React.useMemo(() => {
    if (snippetTab === 'web') {
      return buildDotIconReactSnippet(selectedMeta.id, renderOptions);
    }
    if (snippetTab === 'native') {
      return buildDotIconNativeSnippet(selectedMeta.id, {
        ...renderOptions,
        color: exportColor,
      });
    }
    return svgString;
  }, [snippetTab, selectedMeta.id, renderOptions, exportColor, svgString]);

  const isCustomConfig =
    previewSize !== 28 ||
    Math.abs(dotScale - DOT_SCALE_DEFAULT) > 0.001 ||
    dotGap > 0 ||
    dotShape !== 'circle' ||
    colorValue !== 'currentColor' ||
    gridCols !== null ||
    gridRows !== null ||
    gridMode !== 'scale' ||
    gridPadding !== 0 ||
    showGrid ||
    customGrid !== null;

  const handleSelectIcon = (id: DotIconCanonicalName) => {
    setSelectedId(id);
    setCustomGrid(null);
    onSelectIcon?.(id);
  };

  const handleApplyAutoGrid = () => {
    setGridCols(null);
    setGridRows(null);
    setCustomGrid(null);
  };

  const handleApplyGridPreset = (preset: number) => {
    setGridCols(preset);
    setGridRows(preset);
    setCustomGrid(null);
  };

  const handleColsChange = (nextCols: number) => {
    setGridCols(nextCols);
    setGridRows((prev) => prev ?? selectedMeta.nativeGridSize ?? DOT_GRID_DEFAULT);
    setCustomGrid(null);
  };

  const handleRowsChange = (nextRows: number) => {
    setGridCols((prev) => prev ?? selectedMeta.nativeGridSize ?? DOT_GRID_DEFAULT);
    setGridRows(nextRows);
    setCustomGrid(null);
  };

  const handleToggleCell = (x: number, y: number) => {
    setCustomGrid((prev) => toggleDotGridCell(prev ?? resolvedGrid.rows, x, y));
  };

  const handleInvertGrid = () => {
    setCustomGrid((prev) => invertDotGrid(prev ?? resolvedGrid.rows));
  };

  const handleClearGrid = () => {
    setCustomGrid(clearDotGrid(resolvedGrid.cols, resolvedGrid.rowCount));
  };

  const handleResetAll = () => {
    setPreviewSize(28);
    setDotScale(DOT_SCALE_DEFAULT);
    setDotGap(0);
    setDotShape('circle');
    setColorValue('currentColor');
    setGridCols(null);
    setGridRows(null);
    setGridMode('scale');
    setGridPadding(0);
    setShowGrid(false);
    setCustomGrid(null);
  };

  const handleCopy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dot-icon-${selectedMeta.id}-${resolvedGrid.cols}x${resolvedGrid.rowCount}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Adaptive editor dot cell sizing so 5x5 through 25x25 fit cleanly inside the inspector
  const maxDim = Math.max(resolvedGrid.cols, resolvedGrid.rowCount);
  const editorCellPx = maxDim <= 9 ? 18 : maxDim <= 13 ? 14 : maxDim <= 17 ? 11 : 9;
  const editorGapPx = maxDim <= 11 ? 5 : maxDim <= 17 ? 3 : 2;
  const tilePreviewSize = Math.min(previewSize, 40);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        id="icons-header"
        className="scroll-mt-20 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--nt-line)] pb-6"
      >
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
            <span>nthgui/icons</span>
            <span aria-hidden="true">·</span>
            <span data-testid="dot-icon-total-count" className="tabular-nums text-[var(--nt-display)]">
              {DOT_ICON_LIST.length} Dot Icons
            </span>
            <span aria-hidden="true">·</span>
            <span>100% Lucide Directory ({LUCIDE_DIRECTORY_SOURCE_COUNT})</span>
            <span aria-hidden="true">·</span>
            <span>5×5 to 25×25 Configurable Grid</span>
            <span aria-hidden="true">·</span>
            <span>Web + Native</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl tracking-[0.02em] text-[var(--nt-display)]">
            Dot Icon Explorer
          </h1>
          <p className="text-sm text-[var(--nt-secondary)] leading-relaxed">
            {DOT_ICON_LIST.length.toLocaleString()} monochrome dot-matrix icons —{' '}
            {NOTHING_ORIGINAL_ICON_NAMES.length} hand-crafted Nothing originals plus all{' '}
            {LUCIDE_DOT_ICON_NAMES.length.toLocaleString()} additional Lucide Directory icons (100%
            end-to-end Lucide coverage with aliases) bundled inside{' '}
            <code className="font-mono text-[var(--nt-display)]">nthgui</code> with full control over
            size, color, single-dot scale, dot shape, and custom matrix grids.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <code className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 text-[var(--nt-display)]">
            npx nthgui add dot-icon
          </code>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleCopy('pkg', 'npx nthgui add dot-icon')}
          >
            {copiedKey === 'pkg' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedKey === 'pkg' ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </div>

      {/* Search, Category Filter & Full Dot-Grid Configurator */}
      <div
        id="icons-controls"
        className="scroll-mt-20 space-y-4 rounded-2xl nt-card-surface p-4 sm:p-5"
      >
        {/* Row 1: Search + View Switch + Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--nt-muted)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${DOT_ICON_LIST.length} icons, tags, or aliases (map-pin, settings)...`}
              aria-label="Search dot icons"
              className="h-9 w-full rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] pl-9 pr-3 font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <span className="tabular-nums text-[11px] text-[var(--nt-muted)]">
              {filtered.length} / {DOT_ICON_LIST.length} icons
            </span>
            {isCustomConfig && (
              <button
                type="button"
                data-testid="dot-icon-reset-config"
                onClick={handleResetAll}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--nt-line)] px-2.5 py-1.5 text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] cursor-pointer"
              >
                <ArrowCounterClockwise className="h-3.5 w-3.5" />
                Reset
              </button>
            )}
            <div className="inline-flex rounded-lg border border-[var(--nt-line)] p-0.5">
              <button
                type="button"
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md cursor-pointer',
                  viewMode === 'grid'
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)]',
                )}
              >
                <SquaresFour className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md cursor-pointer',
                  viewMode === 'list'
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-muted)]',
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Source Switch + Category Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div
            role="group"
            aria-label="Filter icons by collection source"
            className="inline-flex flex-wrap items-center gap-1 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-1"
          >
            {(
              [
                { id: 'all', label: 'All Packs', count: DOT_ICON_LIST.length },
                { id: 'nothing', label: 'Nothing Originals', count: NOTHING_ORIGINAL_ICON_NAMES.length },
                { id: 'lucide', label: 'Lucide Directory', count: LUCIDE_DOT_ICON_NAMES.length },
              ] as const
            ).map((src) => (
              <button
                key={src.id}
                type="button"
                aria-pressed={sourceFilter === src.id}
                data-testid={`source-filter-${src.id}`}
                onClick={() => setSourceFilter(src.id)}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                  sourceFilter === src.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                <span>{src.label}</span>
                <span
                  className={cn(
                    'tabular-nums text-[10px]',
                    sourceFilter === src.id ? 'opacity-75' : 'text-[var(--nt-muted)]',
                  )}
                >
                  {src.count}
                </span>
              </button>
            ))}
          </div>
          <span className="font-mono text-[10px] text-[var(--nt-muted)]">
            Native grid: 9×9 Nothing · 15×15 Lucide · Resizable 5×5–25×25
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-[var(--nt-raised)] p-1">
          {ICON_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                category === cat
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
              )}
            >
              <span>{cat}</span>
              <span
                className={cn(
                  'tabular-nums text-[10px]',
                  category === cat ? 'opacity-75' : 'text-[var(--nt-muted)]',
                )}
              >
                {categoryCounts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Row 3: Size, Single-Dot Scale, Dot Gap, Color & Dot Shape */}
        <div className="grid grid-cols-1 gap-4 border-t border-[var(--nt-line)] pt-4 md:grid-cols-2 xl:grid-cols-4 font-mono text-xs">
          {/* Icon Size */}
          <label className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">Icon Size</span>
              <span className="tabular-nums text-[var(--nt-display)]">{previewSize}px</span>
            </div>
            <input
              type="range"
              min={16}
              max={96}
              step={4}
              value={previewSize}
              onChange={(e) => setPreviewSize(Number(e.target.value))}
              aria-label="Preview icon size"
              className="w-full accent-[var(--nt-accent)] cursor-pointer"
            />
          </label>

          {/* Single-Dot Scale */}
          <label className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">Dot Scale</span>
              <span className="tabular-nums text-[var(--nt-display)]">
                {dotScale.toFixed(2)}× (r={effectiveRadius.toFixed(2)})
              </span>
            </div>
            <input
              type="range"
              min={0.3}
              max={1.15}
              step={0.05}
              value={dotScale}
              onChange={(e) => setDotScale(Number(e.target.value))}
              aria-label="Single dot scale"
              className="w-full accent-[var(--nt-accent)] cursor-pointer"
            />
          </label>

          {/* Dot Gap */}
          <label className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">Dot Gap</span>
              <span className="tabular-nums text-[var(--nt-display)]">{dotGap.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={0.4}
              step={0.05}
              value={dotGap}
              onChange={(e) => setDotGap(Number(e.target.value))}
              aria-label="Dot gap"
              className="w-full accent-[var(--nt-accent)] cursor-pointer"
            />
          </label>

          {/* Dot Shape */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">Dot Shape</span>
              <span className="text-[var(--nt-display)] capitalize">{dotShape}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-[var(--nt-raised)] p-0.5">
              {DOT_SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  aria-pressed={dotShape === opt.id}
                  onClick={() => setDotShape(opt.id)}
                  className={cn(
                    'rounded-md py-1 text-[10px] transition-colors cursor-pointer',
                    dotShape === opt.id
                      ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 4: Full Dot Grid Configuration & Color Swatches */}
        <div className="grid grid-cols-1 gap-4 border-t border-[var(--nt-line)] pt-4 lg:grid-cols-12 font-mono text-xs">
          {/* Grid Presets & Cols/Rows */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-[var(--nt-muted)]">
                <GridFour className="h-3.5 w-3.5 text-[var(--nt-accent)]" />
                Dot Grid Matrix ({gridCols === null && gridRows === null ? `Auto · ${effectiveGridCols}×${effectiveGridRows}` : `${effectiveGridCols}×${effectiveGridRows}`})
              </span>
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  aria-pressed={gridCols === null && gridRows === null}
                  onClick={handleApplyAutoGrid}
                  className={cn(
                    'rounded-md border px-2 py-0.5 text-[10px] transition-colors cursor-pointer',
                    gridCols === null && gridRows === null
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  Auto
                </button>
                {GRID_QUICK_PRESETS.map((preset) => {
                  const active = gridCols === preset && gridRows === preset;
                  return (
                    <button
                      key={preset}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleApplyGridPreset(preset)}
                      className={cn(
                        'rounded-md border px-2 py-0.5 text-[10px] tabular-nums transition-colors cursor-pointer',
                        active
                          ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      {preset}×{preset}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--nt-muted)]">
                  <span>Cols</span>
                  <span className="tabular-nums text-[var(--nt-display)]">{effectiveGridCols}</span>
                </div>
                <input
                  type="range"
                  min={DOT_GRID_MIN}
                  max={DOT_GRID_MAX}
                  step={1}
                  value={effectiveGridCols}
                  onChange={(e) => handleColsChange(Number(e.target.value))}
                  aria-label="Grid columns"
                  className="w-full accent-[var(--nt-accent)] cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--nt-muted)]">
                  <span>Rows</span>
                  <span className="tabular-nums text-[var(--nt-display)]">{effectiveGridRows}</span>
                </div>
                <input
                  type="range"
                  min={DOT_GRID_MIN}
                  max={DOT_GRID_MAX}
                  step={1}
                  value={effectiveGridRows}
                  onChange={(e) => handleRowsChange(Number(e.target.value))}
                  aria-label="Grid rows"
                  className="w-full accent-[var(--nt-accent)] cursor-pointer"
                />
              </label>

              <label className="space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--nt-muted)]">
                  <span>Padding</span>
                  <span className="tabular-nums text-[var(--nt-display)]">{gridPadding}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={3}
                  step={1}
                  value={gridPadding}
                  onChange={(e) => {
                    setGridPadding(Number(e.target.value));
                    setCustomGrid(null);
                  }}
                  aria-label="Grid padding"
                  className="w-full accent-[var(--nt-accent)] cursor-pointer"
                />
              </label>

              <div className="space-y-1">
                <span className="block text-[10px] text-[var(--nt-muted)]">Fit Mode</span>
                <div className="grid grid-cols-2 gap-1 rounded-md bg-[var(--nt-raised)] p-0.5">
                  {(['scale', 'center'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      aria-pressed={gridMode === mode}
                      onClick={() => {
                        setGridMode(mode);
                        setCustomGrid(null);
                      }}
                      className={cn(
                        'rounded py-0.5 text-[10px] capitalize cursor-pointer',
                        gridMode === mode
                          ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                          : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Color Picker & Show Matrix Grid */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-3 border-t border-[var(--nt-line)] pt-3 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="uppercase tracking-[0.08em] text-[var(--nt-muted)]">Color</span>
                <span className="tabular-nums text-[var(--nt-display)]">{colorValue}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {COLOR_SWATCHES.map((swatch) => {
                  const active = colorValue === swatch.value;
                  return (
                    <button
                      key={swatch.id}
                      type="button"
                      aria-label={`Color: ${swatch.label}`}
                      aria-pressed={active}
                      onClick={() => setColorValue(swatch.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] transition-colors cursor-pointer',
                        active
                          ? 'border-[var(--nt-display)] bg-[var(--nt-raised)] text-[var(--nt-display)]'
                          : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                      )}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: swatch.dotBg }}
                      />
                      <span>{swatch.label}</span>
                    </button>
                  );
                })}
                <label className="inline-flex items-center gap-1.5 rounded-md border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2 py-1 text-[10px] text-[var(--nt-secondary)] cursor-pointer hover:border-[var(--nt-line-2)]">
                  <input
                    type="color"
                    aria-label="Custom icon color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setColorValue(e.target.value);
                    }}
                    className="h-3.5 w-4 cursor-pointer border-0 bg-transparent p-0"
                  />
                  <span>Custom</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--nt-muted)]">Unlit Matrix Dots</span>
              <button
                type="button"
                role="switch"
                aria-checked={showGrid}
                data-testid="toggle-show-grid"
                onClick={() => setShowGrid((v) => !v)}
                className={cn(
                  'rounded-md border px-2.5 py-1 text-[11px] transition-colors cursor-pointer',
                  showGrid
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                Show Matrix Grid: {showGrid ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Directory Grid + Interactive Dot Grid Editor & Inspector */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <section id="icons-grid" className="scroll-mt-20 lg:col-span-7 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-12 text-center font-mono text-xs text-[var(--nt-muted)]">
              No dot icons match &ldquo;{query}&rdquo;.
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
              {visibleIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  aria-pressed={selectedMeta.id === icon.id}
                  onClick={() => handleSelectIcon(icon.id)}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 rounded-xl border p-3.5 transition-colors cursor-pointer',
                    selectedMeta.id === icon.id
                      ? 'border-[var(--nt-display)] bg-[var(--nt-raised)] text-[var(--nt-display)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-primary)] hover:border-[var(--nt-line-2)]',
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center">
                    <DotIcon
                      name={icon.id}
                      size={tilePreviewSize}
                      dotScale={dotScale}
                      dotGap={dotGap}
                      dotShape={dotShape}
                      gridCols={gridCols ?? undefined}
                      gridRows={gridRows ?? undefined}
                      gridMode={gridMode}
                      gridPadding={gridPadding}
                      showGrid={showGrid}
                      color={colorValue}
                      decorative
                    />
                  </div>
                  <span className="font-mono text-[10px] truncate max-w-full">{icon.id}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-[var(--nt-line)] rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
              {visibleIcons.map((icon) => (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => handleSelectIcon(icon.id)}
                  className={cn(
                    'flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors cursor-pointer',
                    selectedMeta.id === icon.id
                      ? 'bg-[var(--nt-raised)]'
                      : 'hover:bg-[var(--nt-raised)]/50',
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <DotIcon
                      name={icon.id}
                      size={24}
                      dotScale={dotScale}
                      dotGap={dotGap}
                      dotShape={dotShape}
                      gridCols={gridCols ?? undefined}
                      gridRows={gridRows ?? undefined}
                      gridMode={gridMode}
                      gridPadding={gridPadding}
                      showGrid={showGrid}
                      color={colorValue}
                      decorative
                    />
                    <div>
                      <div className="font-mono text-xs text-[var(--nt-display)]">{icon.title}</div>
                      <div className="font-mono text-[11px] text-[var(--nt-muted)]">
                        {icon.id}
                        {icon.aliases?.length ? ` · alias: ${icon.aliases.join(', ')}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-[var(--nt-muted)]">
                    {icon.source === 'lucide' ? `Lucide · ${icon.category}` : icon.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {hasMoreIcons && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3 font-mono text-xs">
              <span className="text-[var(--nt-muted)] tabular-nums">
                Showing {visibleIcons.length.toLocaleString()} of {filtered.length.toLocaleString()} icons
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  data-testid="show-all-dot-icons"
                  onClick={() => setVisibleLimit((prev) => prev + PAGE_INCREMENT)}
                >
                  Load {Math.min(PAGE_INCREMENT, filtered.length - visibleIcons.length)} more
                </Button>
                {filtered.length <= 360 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setVisibleLimit(filtered.length)}
                  >
                    Show all {filtered.length}
                  </Button>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Right Interactive Dot-Grid Editor & Export Inspector */}
        <aside
          id="icons-inspector"
          data-testid="dot-icon-inspector"
          className="scroll-mt-20 lg:col-span-5 rounded-2xl nt-card-surface p-6 space-y-5 lg:sticky lg:top-20"
        >
          <div className="flex items-start justify-between gap-4 border-b border-[var(--nt-line)] pb-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px] text-[var(--nt-muted)]">
                <span>{selectedMeta.category}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[var(--nt-secondary)]">
                  {selectedMeta.source === 'lucide' ? 'Lucide Directory' : 'Nothing Original'}
                </span>
                <span aria-hidden="true">·</span>
                <span data-testid="inspector-grid-dims" className="tabular-nums text-[var(--nt-display)]">
                  {resolvedGrid.cols}×{resolvedGrid.rowCount} Grid
                </span>
                {customGrid && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[var(--nt-accent)]">Custom Painted</span>
                  </>
                )}
                {selectedMeta.aliases?.length ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>alias: {selectedMeta.aliases.join(', ')}</span>
                  </>
                ) : null}
              </div>
              <h2 className="mt-1 font-display text-2xl text-[var(--nt-display)]">
                {selectedMeta.title}
              </h2>
              <p className="mt-0.5 text-xs text-[var(--nt-secondary)]">
                {selectedMeta.usageLabel}
              </p>
            </div>
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-display)]">
              <DotIcon
                name={selectedMeta.id}
                size={Math.min(previewSize, 48)}
                dotScale={dotScale}
                dotGap={dotGap}
                dotShape={dotShape}
                gridCols={gridCols ?? undefined}
                gridRows={gridRows ?? undefined}
                gridMode={gridMode}
                gridPadding={gridPadding}
                showGrid={showGrid}
                grid={customGrid ?? undefined}
                color={colorValue}
              />
            </div>
          </div>

          {/* Interactive Click-to-Paint Configurable Dot Matrix */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
              <span className="text-[var(--nt-muted)]">
                Interactive {resolvedGrid.cols}×{resolvedGrid.rowCount} Matrix ·{' '}
                <span className="tabular-nums text-[var(--nt-display)]">{litDotCount}</span> lit
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleInvertGrid}
                  className="inline-flex items-center gap-1 rounded border border-[var(--nt-line)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <Intersect className="h-3 w-3" />
                  Invert
                </button>
                <button
                  type="button"
                  onClick={handleClearGrid}
                  className="inline-flex items-center gap-1 rounded border border-[var(--nt-line)] px-2 py-0.5 text-[10px] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
                >
                  <Eraser className="h-3 w-3" />
                  Clear
                </button>
                {customGrid && (
                  <button
                    type="button"
                    data-testid="reset-painted-grid"
                    onClick={() => setCustomGrid(null)}
                    className="inline-flex items-center gap-1 rounded border border-[var(--nt-accent)]/50 px-2 py-0.5 text-[10px] text-[var(--nt-accent)] hover:bg-[var(--nt-accent)]/10 cursor-pointer"
                  >
                    <ArrowCounterClockwise className="h-3 w-3" />
                    Reset Grid
                  </button>
                )}
              </div>
            </div>

            <div
              data-testid="bitmap-magnifier"
              className="mx-auto grid w-fit max-w-full overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[#0A0A0A] p-4"
              style={{
                gridTemplateColumns: `repeat(${resolvedGrid.cols}, ${editorCellPx}px)`,
                gap: `${editorGapPx}px`,
              }}
            >
              {resolvedGrid.rows.flatMap((row, y) =>
                row.split('').map((ch, x) => {
                  const isLit = ch === '#';
                  const dotDisplayColor =
                    colorValue === 'currentColor' ? '#FFFFFF' : colorValue;
                  const radiusClass =
                    dotShape === 'square'
                      ? 'rounded-none'
                      : dotShape === 'rounded'
                        ? 'rounded-[3px]'
                        : 'rounded-full';
                  return (
                    <button
                      key={`${x}-${y}`}
                      type="button"
                      aria-label={`Toggle dot (${x}, ${y}) ${isLit ? 'lit' : 'off'}`}
                      aria-pressed={isLit}
                      onClick={() => handleToggleCell(x, y)}
                      className="flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--nt-accent)]"
                      style={{ width: editorCellPx, height: editorCellPx }}
                    >
                      <span
                        className={cn(
                          'block transition-all',
                          dotShape === 'diamond' ? 'rotate-45 rounded-[1px]' : radiusClass,
                        )}
                        style={{
                          width: `${Math.max(26, Math.min(100, Math.round(effectiveRadius * 2 * 100)))}%`,
                          height: `${Math.max(26, Math.min(100, Math.round(effectiveRadius * 2 * 100)))}%`,
                          backgroundColor: isLit ? dotDisplayColor : 'rgba(255,255,255,0.12)',
                        }}
                      />
                    </button>
                  );
                }),
              )}
            </div>
            <p className="text-center font-mono text-[10px] text-[var(--nt-muted)]">
              Click any dot to paint or erase · edits sync directly to SVG and React snippets
            </p>
          </div>

          {/* Size Preset Comparison */}
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-5 py-4 text-[var(--nt-display)]">
            {[16, 24, 32, Math.max(48, previewSize)].map((sz, idx) => (
              <div key={`${sz}-${idx}`} className="flex flex-col items-center gap-2">
                <DotIcon
                  name={selectedMeta.id}
                  size={sz}
                  dotScale={dotScale}
                  dotGap={dotGap}
                  dotShape={dotShape}
                  gridCols={gridCols ?? undefined}
                  gridRows={gridRows ?? undefined}
                  gridMode={gridMode}
                  gridPadding={gridPadding}
                  showGrid={showGrid}
                  grid={customGrid ?? undefined}
                  color={colorValue}
                  decorative
                />
                <span className="font-mono text-[10px] tabular-nums text-[var(--nt-muted)]">
                  {sz}px
                </span>
              </div>
            ))}
          </div>

          {/* Code Tabs: Web / Native / SVG */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex rounded-lg bg-[var(--nt-raised)] p-1">
                {(
                  [
                    { id: 'web', label: 'React' },
                    { id: 'native', label: 'Native' },
                    { id: 'svg', label: 'SVG' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSnippetTab(t.id)}
                    className={cn(
                      'rounded-md px-2.5 py-1 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                      snippetTab === t.id
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy('snippet', activeSnippet)}
                >
                  {copiedKey === 'snippet' ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copiedKey === 'snippet' ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadSvg}
                  aria-label="Download SVG"
                >
                  <DownloadSimple className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <pre
              data-testid="dot-icon-code-preview"
              className="max-h-48 overflow-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5 font-mono text-[11px] leading-relaxed text-[var(--nt-primary)]"
            >
              <code>{activeSnippet}</code>
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
