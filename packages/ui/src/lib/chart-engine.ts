export type ChartCurveMode = 'linear' | 'smooth' | 'step';
export type ChartGridMode = 'horizontal' | 'both' | 'vertical' | 'none';
export type ChartPaletteId =
  | 'monochrome'
  | 'signal'
  | 'spectral'
  | 'ocean'
  | 'amber'
  | 'high-contrast'
  | 'custom';

export interface ChartPalettePreset {
  id: Exclude<ChartPaletteId, 'custom'>;
  label: string;
  colors: readonly [string, string, string, string, string, string];
}

export const CHART_PALETTES: readonly ChartPalettePreset[] = [
  {
    id: 'monochrome',
    label: 'OLED Mono',
    colors: ['#F5F5F5', '#D71921', '#A3A3A3', '#6E6E6E', '#D4D4D4', '#404040'],
  },
  {
    id: 'signal',
    label: 'Signal Red',
    colors: ['#D71921', '#F5F5F5', '#FF6B6B', '#9CA3AF', '#F59E0B', '#525252'],
  },
  {
    id: 'spectral',
    label: 'Spectral',
    colors: ['#38BDF8', '#A78BFA', '#34D399', '#FBBF24', '#F472B6', '#FB7185'],
  },
  {
    id: 'ocean',
    label: 'Cyan / Mint',
    colors: ['#22D3EE', '#10B981', '#60A5FA', '#2DD4BF', '#818CF8', '#94A3B8'],
  },
  {
    id: 'amber',
    label: 'Warm Amber',
    colors: ['#F59E0B', '#EF4444', '#FB923C', '#FDE047', '#EC4899', '#A8A29E'],
  },
  {
    id: 'high-contrast',
    label: 'AAA Contrast',
    colors: ['#FFFFFF', '#FF2E2E', '#00E5FF', '#FFE600', '#00FF85', '#C084FC'],
  },
] as const;

export interface ChartStyleConfig {
  palette: ChartPaletteId;
  seriesColors: Record<string, string>;
  curve: ChartCurveMode;
  strokeWidth: number;
  fillOpacity: number;
  dotSize: number;
  gridMode: ChartGridMode;
  showLabels: boolean;
  showArea: boolean;
  showThreshold: boolean;
  thresholdValue: number;
  thresholdColor: string;
  animate: boolean;
}

export const DEFAULT_CHART_STYLE: ChartStyleConfig = {
  palette: 'monochrome',
  seriesColors: {},
  curve: 'smooth',
  strokeWidth: 2,
  fillOpacity: 0.16,
  dotSize: 3.5,
  gridMode: 'horizontal',
  showLabels: false,
  showArea: true,
  showThreshold: false,
  thresholdValue: 75,
  thresholdColor: '#D71921',
  animate: true,
};

export function getPaletteColors(palette: ChartPaletteId): readonly string[] {
  const found = CHART_PALETTES.find((p) => p.id === palette);
  return found ? found.colors : CHART_PALETTES[0].colors;
}

export function resolveSeriesColor(
  seriesId: string,
  index: number,
  style: Pick<ChartStyleConfig, 'palette' | 'seriesColors'>,
  fallback?: string,
): string {
  const custom = style.seriesColors[seriesId];
  if (custom && /^#[0-9a-fA-F]{3,8}$/.test(custom)) {
    return custom;
  }
  const paletteColors = getPaletteColors(style.palette);
  if (style.palette === 'monochrome' && fallback && /^#[0-9a-fA-F]{3,8}$/.test(fallback)) {
    return fallback;
  }
  return paletteColors[index % paletteColors.length];
}

export interface Point2D {
  x: number;
  y: number;
}

export interface NiceDomain {
  min: number;
  max: number;
  ticks: number[];
}

export function computeNiceDomain(
  values: readonly number[],
  options?: { includeZero?: boolean; tickCount?: number; padRatio?: number },
): NiceDomain {
  const tickCount = Math.max(2, options?.tickCount ?? 4);
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] };
  }

  let rawMin = Math.min(...finite);
  let rawMax = Math.max(...finite);
  if (options?.includeZero) {
    rawMin = Math.min(0, rawMin);
    rawMax = Math.max(0, rawMax);
  }
  if (rawMin === rawMax) {
    rawMin = rawMin === 0 ? 0 : rawMin * 0.85;
    rawMax = rawMax === 0 ? 10 : rawMax * 1.15;
  } else {
    const pad = (rawMax - rawMin) * (options?.padRatio ?? 0.08);
    rawMax += pad;
    if (!options?.includeZero || rawMin < 0) {
      rawMin -= pad;
    }
  }

  const range = rawMax - rawMin;
  const roughStep = range / tickCount;
  const mag = Math.pow(10, Math.floor(Math.log10(roughStep || 1)));
  const residual = roughStep / mag;
  const niceStep =
    residual <= 1 ? mag : residual <= 2 ? 2 * mag : residual <= 5 ? 5 * mag : 10 * mag;

  const min = Math.floor(rawMin / niceStep) * niceStep;
  const max = Math.ceil(rawMax / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let v = min; v <= max + niceStep * 0.001; v += niceStep) {
    ticks.push(Number(v.toFixed(6)));
  }

  return { min, max: max === min ? min + 1 : max, ticks };
}

export function buildLinePath(points: readonly Point2D[], curve: ChartCurveMode = 'smooth'): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  if (curve === 'linear') {
    return points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
  }

  if (curve === 'step') {
    let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = ((prev.x + curr.x) / 2).toFixed(2);
      d += ` H ${midX} V ${curr.y.toFixed(2)} H ${curr.x.toFixed(2)}`;
    }
    return d;
  }

  // Monotone-clamped Catmull-Rom spline for overshoot-free smooth curves
  let d = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = clampControlY(p1.y + (p2.y - p0.y) / 6, p1.y, p2.y);
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = clampControlY(p2.y - (p3.y - p1.y) / 6, p1.y, p2.y);

    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function clampControlY(cy: number, y1: number, y2: number): number {
  const lo = Math.min(y1, y2);
  const hi = Math.max(y1, y2);
  return Math.max(lo, Math.min(hi, cy));
}

export function buildAreaPath(
  points: readonly Point2D[],
  baselineY: number,
  curve: ChartCurveMode = 'smooth',
): string {
  if (points.length < 2) return '';
  const line = buildLinePath(points, curve);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x.toFixed(2)} ${baselineY.toFixed(2)} L ${first.x.toFixed(2)} ${baselineY.toFixed(2)} Z`;
}

export interface SeriesStats {
  min: number;
  max: number;
  avg: number;
  sum: number;
  latest: number;
  delta: number;
  deltaPct: number;
}

export function computeSeriesStats(values: readonly number[]): SeriesStats {
  const finite = values.filter((v) => Number.isFinite(v));
  if (finite.length === 0) {
    return { min: 0, max: 0, avg: 0, sum: 0, latest: 0, delta: 0, deltaPct: 0 };
  }
  let min = finite[0];
  let max = finite[0];
  let sum = 0;
  for (const v of finite) {
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  const avg = sum / finite.length;
  const first = finite[0];
  const latest = finite[finite.length - 1];
  const delta = latest - first;
  const deltaPct = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  return { min, max, avg, sum, latest, delta, deltaPct };
}

export function clampBrushDomain(
  startIdx: number,
  endIdx: number,
  totalLength: number,
): [number, number] {
  const maxIdx = Math.max(0, totalLength - 1);
  let lo = Math.max(0, Math.min(maxIdx, Math.round(Math.min(startIdx, endIdx))));
  let hi = Math.max(0, Math.min(maxIdx, Math.round(Math.max(startIdx, endIdx))));
  if (hi - lo < 1 && maxIdx >= 1) {
    if (hi < maxIdx) hi = lo + 1;
    else lo = Math.max(0, hi - 1);
  }
  return [lo, hi];
}

export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): Point2D {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

export function describeDonutSlicePath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = Math.min(359.99, Math.max(0.01, endAngle - startAngle));
  const safeEnd = startAngle + sweep;
  const outerStart = polarToCartesian(cx, cy, outerR, safeEnd);
  const outerEnd = polarToCartesian(cx, cy, outerR, startAngle);
  const largeArc = sweep > 180 ? 1 : 0;

  if (innerR <= 0.5) {
    return [
      `M ${cx.toFixed(2)} ${cy.toFixed(2)}`,
      `L ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
      `A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${largeArc} 1 ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
      'Z',
    ].join(' ');
  }

  const innerStart = polarToCartesian(cx, cy, innerR, safeEnd);
  const innerEnd = polarToCartesian(cx, cy, innerR, startAngle);
  return [
    `M ${outerEnd.x.toFixed(2)} ${outerEnd.y.toFixed(2)}`,
    `A ${outerR.toFixed(2)} ${outerR.toFixed(2)} 0 ${largeArc} 1 ${outerStart.x.toFixed(2)} ${outerStart.y.toFixed(2)}`,
    `L ${innerStart.x.toFixed(2)} ${innerStart.y.toFixed(2)}`,
    `A ${innerR.toFixed(2)} ${innerR.toFixed(2)} 0 ${largeArc} 0 ${innerEnd.x.toFixed(2)} ${innerEnd.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export function formatMetricNumber(val: number, unit = '', decimals = 1): string {
  if (!Number.isFinite(val)) return '—';
  const rounded = Math.abs(val) >= 100 || Number.isInteger(val) ? val.toFixed(0) : val.toFixed(decimals);
  return unit ? `${rounded}${unit}` : rounded;
}

export function serializeChartCsv(
  headers: readonly string[],
  rows: readonly (readonly (string | number)[])[],
): string {
  const escape = (cell: string | number) => {
    const str = String(cell ?? '');
    if (/[",\n\r]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push(row.map(escape).join(','));
  }
  return lines.join('\n');
}

function resolveCssVarsInString(raw: string, computed: CSSStyleDeclaration): string {
  return raw.replace(/var\((--[a-zA-Z0-9-_]+)\)/g, (match, varName: string) => {
    const val = computed.getPropertyValue(varName).trim();
    return val || match;
  });
}

export function prepareStandaloneSvgString(svgEl: SVGSVGElement): {
  svgString: string;
  width: number;
  height: number;
  bgColor: string;
} {
  const computed = window.getComputedStyle(svgEl);
  const rootComputed = window.getComputedStyle(document.documentElement);
  const bgColor =
    computed.getPropertyValue('--nt-bg').trim() ||
    rootComputed.getPropertyValue('--nt-bg').trim() ||
    '#000000';

  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const vb = svgEl.viewBox.baseVal;
  const rect = svgEl.getBoundingClientRect();
  const width = Math.max(320, Math.round(rect.width || vb?.width || 640));
  const height = Math.max(180, Math.round(rect.height || vb?.height || 320));

  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  // Insert solid background rect for crisp standalone SVG / PNG rendering
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', bgColor);
  clone.insertBefore(bgRect, clone.firstChild);

  const serializer = new XMLSerializer();
  const rawString = serializer.serializeToString(clone);
  const resolved = resolveCssVarsInString(
    resolveCssVarsInString(rawString, computed),
    rootComputed,
  );
  return { svgString: resolved, width, height, bgColor };
}

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportSvgElementToSvg(svgEl: SVGSVGElement, filename: string): void {
  const { svgString } = prepareStandaloneSvgString(svgEl);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  triggerBrowserDownload(blob, filename.endsWith('.svg') ? filename : `${filename}.svg`);
}

export async function exportSvgElementToPng(
  svgEl: SVGSVGElement,
  filename: string,
  scale = 2,
): Promise<boolean> {
  try {
    const { svgString, width, height, bgColor } = prepareStandaloneSvgString(svgEl);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = width * scale;
          canvas.height = height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              triggerBrowserDownload(
                pngBlob,
                filename.endsWith('.png') ? filename : `${filename}.png`,
              );
              resolve();
            } else {
              reject(new Error('PNG encoding failed'));
            }
          }, 'image/png');
        } catch (err) {
          reject(err);
        } finally {
          URL.revokeObjectURL(url);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('SVG image load failed'));
      };
      img.src = url;
    });
    return true;
  } catch {
    return false;
  }
}

export function exportCsvFile(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerBrowserDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}

export async function copyTextSafely(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to textarea fallback
  }
  try {
    const el = document.createElement('textarea');
    el.value = text;
    el.setAttribute('readonly', '');
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
