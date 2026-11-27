/**
 * Generates `/packages/dot-icons/src/data/bitmaps-lucide.ts` directly from the official
 * `lucide-react` icon directory (`node_modules/lucide-react/dist/esm/icons/*.js`).
 *
 * Implements a complete W3C SVG 2D geometry rasterizer supporting all 7 SVG primitives
 * (`path` with M/L/H/V/C/S/Q/T/A/Z, `circle`, `ellipse`, `rect`, `line`, `polyline`, `polygon`)
 * sampled via Euclidean stroke distance field onto crisp 15x15 monochrome dot matrices,
 * then compactly bit-packed with `encodeDotBitmap`.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { encodeDotBitmap } from '../packages/dot-icons/src/core/bitmap-codec';
import { CORE_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-core';
import { ARROWS_NAV_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-arrows-nav';
import { CONTROLS_UI_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-controls-ui';
import { MEDIA_AUDIO_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-media-audio';
import { HARDWARE_CONN_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-hardware-conn';
import { FILES_DEV_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-files-dev';
import { COMM_ENV_LIFE_DOT_ICON_BITMAPS } from '../packages/dot-icons/src/data/bitmaps-comm-env-life';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const LUCIDE_ICONS_DIR = path.join(ROOT, 'node_modules/lucide-react/dist/esm/icons');
const OUTPUT_FILE = path.join(ROOT, 'packages/dot-icons/src/data/bitmaps-lucide.ts');

const GRID_SIZE = 15;
const SAMPLE_MIN = 1.4;
const SAMPLE_MAX = 22.6;
const STROKE_DIST_THRESHOLD = 0.76;

const EXISTING_CANONICAL = new Set<string>([
  ...Object.keys(CORE_DOT_ICON_BITMAPS),
  ...Object.keys(ARROWS_NAV_DOT_ICON_BITMAPS),
  ...Object.keys(CONTROLS_UI_DOT_ICON_BITMAPS),
  ...Object.keys(MEDIA_AUDIO_DOT_ICON_BITMAPS),
  ...Object.keys(HARDWARE_CONN_DOT_ICON_BITMAPS),
  ...Object.keys(FILES_DEV_DOT_ICON_BITMAPS),
  ...Object.keys(COMM_ENV_LIFE_DOT_ICON_BITMAPS),
]);

const EXISTING_ALIASES: Record<string, string> = {
  'map-pin': 'mappin',
  settings: 'gear',
  cog: 'gear',
  x: 'close',
  delete: 'trash',
  remove: 'trash',
  'arrow-up': 'up',
  'arrow-down': 'down',
  'arrow-left': 'left',
  'arrow-right': 'right',
  'mic-mute': 'mic-off',
  'volume-x': 'volume-mute',
};

interface Vec2 {
  x: number;
  y: number;
}

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface DotPointMark {
  x: number;
  y: number;
  r: number;
}

type SvgNode = [string, Record<string, string | number>];

// ── SVG Path Tokenizer & W3C Geometry Tessellator ─────────────────────────────

function tokenizePath(d: string): string[] {
  const tokens: string[] = [];
  const re = /([a-zA-Z])|([+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(d)) !== null) {
    tokens.push(m[0]);
  }
  return tokens;
}

function sampleCubic(
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  p3: Vec2,
  out: Segment[],
  steps = 18,
): void {
  let prev = p0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x =
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x;
    const y =
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y;
    const next = { x, y };
    out.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

function sampleQuad(
  p0: Vec2,
  p1: Vec2,
  p2: Vec2,
  out: Segment[],
  steps = 14,
): void {
  let prev = p0;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const mt = 1 - t;
    const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
    const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
    const next = { x, y };
    out.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

function vectorAngle(ux: number, uy: number, vx: number, vy: number): number {
  const dot = ux * vx + uy * vy;
  const len = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  if (len === 0) return 0;
  const cos = Math.max(-1, Math.min(1, dot / len));
  const sign = ux * vy - uy * vx < 0 ? -1 : 1;
  return sign * Math.acos(cos);
}

/**
 * Exact W3C SVG 1.1 Implementation Notes F.6.5/F.6.6 elliptical arc tessellation.
 */
function sampleArc(
  p0: Vec2,
  rxIn: number,
  ryIn: number,
  xAxisRotationDeg: number,
  largeArcFlag: number,
  sweepFlag: number,
  p1: Vec2,
  out: Segment[],
): void {
  const dx = p0.x - p1.x;
  const dy = p0.y - p1.y;
  if (Math.hypot(dx, dy) < 1e-6) return;

  let rx = Math.abs(rxIn);
  let ry = Math.abs(ryIn);
  if (rx < 1e-6 || ry < 1e-6) {
    out.push({ x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y });
    return;
  }

  const phi = (xAxisRotationDeg * Math.PI) / 180;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);

  const dx2 = (p0.x - p1.x) / 2;
  const dy2 = (p0.y - p1.y) / 2;
  const x1p = cosPhi * dx2 + sinPhi * dy2;
  const y1p = -sinPhi * dx2 + cosPhi * dy2;

  const rxSq = rx * rx;
  const rySq = ry * ry;
  const x1pSq = x1p * x1p;
  const y1pSq = y1p * y1p;

  const lambda = x1pSq / rxSq + y1pSq / rySq;
  if (lambda > 1) {
    const scale = Math.sqrt(lambda);
    rx *= scale;
    ry *= scale;
  }

  const rx2 = rx * rx;
  const ry2 = ry * ry;
  const num = Math.max(0, rx2 * ry2 - rx2 * y1pSq - ry2 * x1pSq);
  const den = rx2 * y1pSq + ry2 * x1pSq;
  const coef = (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(den === 0 ? 0 : num / den);

  const cxp = (coef * rx * y1p) / ry;
  const cyp = (-coef * ry * x1p) / rx;

  const cx = cosPhi * cxp - sinPhi * cyp + (p0.x + p1.x) / 2;
  const cy = sinPhi * cxp + cosPhi * cyp + (p0.y + p1.y) / 2;

  const ux = (x1p - cxp) / rx;
  const uy = (y1p - cyp) / ry;
  const vx = (-x1p - cxp) / rx;
  const vy = (-y1p - cyp) / ry;

  const theta1 = vectorAngle(1, 0, ux, uy);
  let dTheta = vectorAngle(ux, uy, vx, vy);

  if (!sweepFlag && dTheta > 0) dTheta -= 2 * Math.PI;
  if (sweepFlag && dTheta < 0) dTheta += 2 * Math.PI;

  const steps = Math.max(8, Math.ceil((Math.abs(dTheta) / (Math.PI * 2)) * 36));
  let prev = p0;
  for (let i = 1; i <= steps; i++) {
    const angle = theta1 + (dTheta * i) / steps;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const x = cosPhi * rx * cosA - sinPhi * ry * sinA + cx;
    const y = sinPhi * rx * cosA + cosPhi * ry * sinA + cy;
    const next = { x, y };
    out.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

function parsePathToSegments(d: string, outSegments: Segment[], outDots: DotPointMark[]): void {
  const tokens = tokenizePath(d);
  let idx = 0;
  let cmd = '';
  let curr: Vec2 = { x: 0, y: 0 };
  let start: Vec2 = { x: 0, y: 0 };
  let lastCubicCtrl: Vec2 | null = null;
  let lastQuadCtrl: Vec2 | null = null;

  const isLetter = (tok: string | undefined) => tok !== undefined && /^[a-zA-Z]$/.test(tok);
  const nextNum = () => Number(tokens[idx++] ?? 0);

  while (idx < tokens.length) {
    if (isLetter(tokens[idx])) {
      cmd = tokens[idx++];
    } else if (!cmd) {
      idx++;
      continue;
    }

    switch (cmd) {
      case 'M':
      case 'm': {
        const rel = cmd === 'm';
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        curr = { x, y };
        start = { x, y };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        // Subsequent coordinate pairs after M/m are treated as L/l
        cmd = rel ? 'l' : 'L';
        break;
      }
      case 'L':
      case 'l': {
        const rel = cmd === 'l';
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        if (Math.hypot(x - curr.x, y - curr.y) < 0.08) {
          outDots.push({ x: (x + curr.x) / 2, y: (y + curr.y) / 2, r: 0.9 });
        } else {
          outSegments.push({ x1: curr.x, y1: curr.y, x2: x, y2: y });
        }
        curr = { x, y };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        break;
      }
      case 'H':
      case 'h': {
        const rel = cmd === 'h';
        const x = nextNum() + (rel ? curr.x : 0);
        if (Math.abs(x - curr.x) < 0.08) {
          outDots.push({ x: (x + curr.x) / 2, y: curr.y, r: 0.9 });
        } else {
          outSegments.push({ x1: curr.x, y1: curr.y, x2: x, y2: curr.y });
        }
        curr = { x, y: curr.y };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        break;
      }
      case 'V':
      case 'v': {
        const rel = cmd === 'v';
        const y = nextNum() + (rel ? curr.y : 0);
        if (Math.abs(y - curr.y) < 0.08) {
          outDots.push({ x: curr.x, y: (y + curr.y) / 2, r: 0.9 });
        } else {
          outSegments.push({ x1: curr.x, y1: curr.y, x2: curr.x, y2: y });
        }
        curr = { x: curr.x, y };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        break;
      }
      case 'C':
      case 'c': {
        const rel = cmd === 'c';
        const x1 = nextNum() + (rel ? curr.x : 0);
        const y1 = nextNum() + (rel ? curr.y : 0);
        const x2 = nextNum() + (rel ? curr.x : 0);
        const y2 = nextNum() + (rel ? curr.y : 0);
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        sampleCubic(curr, { x: x1, y: y1 }, { x: x2, y: y2 }, { x, y }, outSegments);
        lastCubicCtrl = { x: x2, y: y2 };
        lastQuadCtrl = null;
        curr = { x, y };
        break;
      }
      case 'S':
      case 's': {
        const rel = cmd === 's';
        const c1 = lastCubicCtrl
          ? { x: 2 * curr.x - lastCubicCtrl.x, y: 2 * curr.y - lastCubicCtrl.y }
          : curr;
        const x2 = nextNum() + (rel ? curr.x : 0);
        const y2 = nextNum() + (rel ? curr.y : 0);
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        sampleCubic(curr, c1, { x: x2, y: y2 }, { x, y }, outSegments);
        lastCubicCtrl = { x: x2, y: y2 };
        lastQuadCtrl = null;
        curr = { x, y };
        break;
      }
      case 'Q':
      case 'q': {
        const rel = cmd === 'q';
        const x1 = nextNum() + (rel ? curr.x : 0);
        const y1 = nextNum() + (rel ? curr.y : 0);
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        sampleQuad(curr, { x: x1, y: y1 }, { x, y }, outSegments);
        lastQuadCtrl = { x: x1, y: y1 };
        lastCubicCtrl = null;
        curr = { x, y };
        break;
      }
      case 'T':
      case 't': {
        const rel = cmd === 't';
        const c1: { x: number; y: number } = lastQuadCtrl
          ? { x: 2 * curr.x - lastQuadCtrl.x, y: 2 * curr.y - lastQuadCtrl.y }
          : curr;
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        sampleQuad(curr, c1, { x, y }, outSegments);
        lastQuadCtrl = c1;
        lastCubicCtrl = null;
        curr = { x, y };
        break;
      }
      case 'A':
      case 'a': {
        const rel = cmd === 'a';
        const rx = nextNum();
        const ry = nextNum();
        const rot = nextNum();
        const largeArc = nextNum();
        const sweep = nextNum();
        const x = nextNum() + (rel ? curr.x : 0);
        const y = nextNum() + (rel ? curr.y : 0);
        sampleArc(curr, rx, ry, rot, largeArc, sweep, { x, y }, outSegments);
        curr = { x, y };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        break;
      }
      case 'Z':
      case 'z': {
        if (Math.hypot(start.x - curr.x, start.y - curr.y) > 1e-4) {
          outSegments.push({ x1: curr.x, y1: curr.y, x2: start.x, y2: start.y });
        }
        curr = { ...start };
        lastCubicCtrl = null;
        lastQuadCtrl = null;
        cmd = '';
        break;
      }
      default: {
        idx++;
        break;
      }
    }
  }
}

function sampleEllipseContour(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  outSegments: Segment[],
  outDots: DotPointMark[],
): void {
  if (Math.max(rx, ry) <= 1.25) {
    outDots.push({ x: cx, y: cy, r: Math.max(rx, ry, 0.9) });
    return;
  }
  const steps = Math.max(20, Math.round(Math.max(rx, ry) * 6));
  let prev = { x: cx + rx, y: cy };
  for (let i = 1; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const next = { x: cx + Math.cos(a) * rx, y: cy + Math.sin(a) * ry };
    outSegments.push({ x1: prev.x, y1: prev.y, x2: next.x, y2: next.y });
    prev = next;
  }
}

function sampleRectContour(
  x: number,
  y: number,
  w: number,
  h: number,
  rxIn: number,
  ryIn: number,
  outSegments: Segment[],
): void {
  const rx = Math.min(w / 2, Math.max(0, rxIn || ryIn || 0));
  const ry = Math.min(h / 2, Math.max(0, ryIn || rxIn || 0));
  if (rx <= 0.1 && ry <= 0.1) {
    outSegments.push(
      { x1: x, y1: y, x2: x + w, y2: y },
      { x1: x + w, y1: y, x2: x + w, y2: y + h },
      { x1: x + w, y1: y + h, x2: x, y2: y + h },
      { x1: x, y1: y + h, x2: x, y2: y },
    );
    return;
  }
  const pathStr = [
    `M ${x + rx} ${y}`,
    `H ${x + w - rx}`,
    `A ${rx} ${ry} 0 0 1 ${x + w} ${y + ry}`,
    `V ${y + h - ry}`,
    `A ${rx} ${ry} 0 0 1 ${x + w - rx} ${y + h}`,
    `H ${x + rx}`,
    `A ${rx} ${ry} 0 0 1 ${x} ${y + h - ry}`,
    `V ${y + ry}`,
    `A ${rx} ${ry} 0 0 1 ${x + rx} ${y}`,
    'Z',
  ].join(' ');
  parsePathToSegments(pathStr, outSegments, []);
}

function parsePointsAttr(pointsStr: string): Vec2[] {
  const nums = (pointsStr.match(/[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/g) ?? []).map(Number);
  const pts: Vec2[] = [];
  for (let i = 0; i + 1 < nums.length; i += 2) {
    pts.push({ x: nums[i], y: nums[i + 1] });
  }
  return pts;
}

function pointToSegmentDist(px: number, py: number, s: Segment): number {
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-8) return Math.hypot(px - s.x1, py - s.y1);
  const t = Math.max(0, Math.min(1, ((px - s.x1) * dx + (py - s.y1) * dy) / lenSq));
  return Math.hypot(px - (s.x1 + t * dx), py - (s.y1 + t * dy));
}

function rasterizeIconNodes(nodes: SvgNode[], size = GRID_SIZE): string[] {
  const segments: Segment[] = [];
  const dots: DotPointMark[] = [];

  for (const [tag, attrs] of nodes) {
    switch (tag) {
      case 'path': {
        if (typeof attrs.d === 'string') {
          parsePathToSegments(attrs.d, segments, dots);
        }
        break;
      }
      case 'line': {
        const x1 = Number(attrs.x1 ?? 0);
        const y1 = Number(attrs.y1 ?? 0);
        const x2 = Number(attrs.x2 ?? 0);
        const y2 = Number(attrs.y2 ?? 0);
        if (Math.hypot(x2 - x1, y2 - y1) < 0.08) {
          dots.push({ x: x1, y: y1, r: 0.9 });
        } else {
          segments.push({ x1, y1, x2, y2 });
        }
        break;
      }
      case 'circle': {
        sampleEllipseContour(
          Number(attrs.cx ?? 0),
          Number(attrs.cy ?? 0),
          Number(attrs.r ?? 0),
          Number(attrs.r ?? 0),
          segments,
          dots,
        );
        break;
      }
      case 'ellipse': {
        sampleEllipseContour(
          Number(attrs.cx ?? 0),
          Number(attrs.cy ?? 0),
          Number(attrs.rx ?? 0),
          Number(attrs.ry ?? 0),
          segments,
          dots,
        );
        break;
      }
      case 'rect': {
        sampleRectContour(
          Number(attrs.x ?? 0),
          Number(attrs.y ?? 0),
          Number(attrs.width ?? 0),
          Number(attrs.height ?? 0),
          Number(attrs.rx ?? 0),
          Number(attrs.ry ?? 0),
          segments,
        );
        break;
      }
      case 'polyline':
      case 'polygon': {
        const pts = parsePointsAttr(String(attrs.points ?? ''));
        for (let i = 0; i + 1 < pts.length; i++) {
          segments.push({ x1: pts[i].x, y1: pts[i].y, x2: pts[i + 1].x, y2: pts[i + 1].y });
        }
        if (tag === 'polygon' && pts.length > 2) {
          segments.push({
            x1: pts[pts.length - 1].x,
            y1: pts[pts.length - 1].y,
            x2: pts[0].x,
            y2: pts[0].y,
          });
        }
        break;
      }
      default:
        break;
    }
  }

  const span = SAMPLE_MAX - SAMPLE_MIN;
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const sampleWithThreshold = (threshold: number): number => {
    let lit = 0;
    for (let gy = 0; gy < size; gy++) {
      const py = SAMPLE_MIN + ((gy + 0.5) / size) * span;
      for (let gx = 0; gx < size; gx++) {
        const px = SAMPLE_MIN + ((gx + 0.5) / size) * span;
        let minDist = Infinity;
        for (let i = 0; i < segments.length; i++) {
          const d = pointToSegmentDist(px, py, segments[i]);
          if (d < minDist) {
            minDist = d;
            if (minDist <= threshold) break;
          }
        }
        if (minDist <= threshold) {
          grid[gy][gx] = true;
          lit++;
          continue;
        }
        for (let i = 0; i < dots.length; i++) {
          const d = Math.hypot(px - dots[i].x, py - dots[i].y);
          if (d <= Math.max(threshold, dots[i].r)) {
            grid[gy][gx] = true;
            lit++;
            break;
          }
        }
      }
    }
    // Guarantee every zero-length dot mark illuminates at least its nearest matrix cell
    for (const pt of dots) {
      const gx = Math.max(0, Math.min(size - 1, Math.floor(((pt.x - SAMPLE_MIN) / span) * size)));
      const gy = Math.max(0, Math.min(size - 1, Math.floor(((pt.y - SAMPLE_MIN) / span) * size)));
      if (!grid[gy][gx]) {
        grid[gy][gx] = true;
        lit++;
      }
    }
    return lit;
  };

  let litCount = sampleWithThreshold(STROKE_DIST_THRESHOLD);
  if (litCount === 0) {
    litCount = sampleWithThreshold(1.6);
  }
  if (litCount === 0) {
    grid[Math.floor(size / 2)][Math.floor(size / 2)] = true;
  }

  return grid.map((row) => row.map((on) => (on ? '#' : '.')).join(''));
}

// ── Deterministic 9-Category Classifier for All Lucide Icons ──────────────────
// Category indices align 1:1 with DOT_ICON_CATEGORIES:
// 0: Connectivity, 1: Controls, 2: Navigation, 3: Status, 4: Files & Data,
// 5: Media, 6: Communication, 7: Environment, 8: System

function classifyLucideCategory(slug: string): number {
  const s = slug.toLowerCase();

  // 0: Connectivity
  if (
    /(wifi|bluetooth|signal|antenna|nfc|satellite|router|network|radio-tower|cast|usb|cable|plug|battery|ethernet|webhook|rss|radio-receiver|tower-control|radar|airplay|hotspot|cellular|sim|voicemail)/.test(
      s,
    )
  ) {
    return 0;
  }

  // 2: Navigation
  if (
    /(^arrow|^chevron|^move|^corner|^undo|^redo|^refresh|^rotate|^repeat|^compass|^map|^navigation|^route|^signpost|^milestone|^waypoints|^locate|^crosshair|^panel|^sidebar|^layout|^columns|^rows|^grid|^layers|^maximize|^minimize|^expand|^shrink|^fullscreen|^menu|^external-link|^log-in|^log-out|^door|^milestone|^orbit|^plane|^car|^bus|^train|^tram|^bike|^ship|^anchor|^sailboat|^rocket|^truck|^tractor|^forklift|^ambulance|^footprints|^tent|^mountain|^landmark|^building|^house|^home|^hotel|^store|^warehouse|^factory|^school|^church|^castle)/.test(
      s,
    )
  ) {
    return 2;
  }

  // 5: Media
  if (
    /(music|audio|video|camera|film|clapperboard|image|photo|aperture|focus|mic|volume|speaker|headphone|headset|ear|radio|tv|disc|vinyl|cassette|guitar|drum|piano|podcast|play|pause|stop|rewind|fast-forward|skip|shuffle|subtitles|captions|boom-box|megaphone|spotlight|projector|screen-share|picture-in-picture|palette|paintbrush|brush|pipette|swatch|blend|contrast|crop|flip|frame|gallery|scan-eye|camera)/.test(
      s,
    )
  ) {
    return 5;
  }

  // 4: Files & Data
  if (
    /(^file|^folder|^book|^notebook|^clipboard|^archive|^package|^box|^boxes|^database|^table|^sheet|^chart|^bar-chart|^line-chart|^pie-chart|^trending|^git-|^code|^braces|^brackets|^terminal|^binary|^regex|^variable|^function|^sigma|^pi$|^percent|^calculator|^hash|^bug|^webhook|^server|^hard-drive|^save|^download|^upload|^import|^export|^cloud-download|^cloud-upload|^scroll|^newspaper|^receipt|^ticket|^tag|^tags|^bookmark|^library|^kanban|^list|^spreadsheet|^diff|^blocks|^component|^workflow|^network|^sitemap|^folder)/.test(
      s,
    )
  ) {
    return 4;
  }

  // 6: Communication
  if (
    /(^mail|^inbox|^send|^message|^chat|^phone|^contact|^user|^users|^person|^handshake|^heart-handshake|^at-sign|^share|^reply|^forward|^speech|^quote|^thumbs|^smile|^frown|^meh|^laugh|^angry|^annoyed|^party|^gift|^shopping|^store|^credit-card|^wallet|^banknote|^coins|^dollar|^euro|^pound|^yen|^indian-rupee|^russian-ruble|^swiss-franc|^bitcoin|^badge-dollar|^badge-euro|^badge-percent|^hand-coins|^piggy-bank|^briefcase|^award|^crown|^gem|^diamond|^trophy|^medal|^graduation|^stethoscope|^heart-pulse|^pill|^syringe|^bandage|^baby|^accessibility)/.test(
      s,
    )
  ) {
    return 6;
  }

  // 7: Environment
  if (
    /(^sun|^moon|^cloud|^rain|^snow|^wind|^tornado|^umbrella|^rainbow|^droplet|^waves|^flame|^fire|^thermometer|^leaf|^tree|^flower|^sprout|^clover|^vegan|^apple|^banana|^cherry|^citrus|^grape|^nut|^wheat|^bean|^carrot|^coffee|^cup-soda|^beer|^wine|^martini|^milk|^pizza|^sandwich|^salad|^soup|^cake|^cookie|^croissant|^donut|^egg|^fish|^beef|^ham|^drumstick|^utensils|^chef-hat|^cooking|^flame-kindling|^campfire|^sunrise|^sunset|^eclipse|^haze|^bird|^cat|^dog|^rabbit|^turtle|^squirrel|^snail|^bug|^paw|^feather|^shell|^bone|^egg|^earth|^globe|^sprout|^trees|^shrub|^palmtree|^palm-tree)/.test(
      s,
    )
  ) {
    return 7;
  }

  // 3: Status
  if (
    /(^bell|^alarm|^clock|^timer|^watch|^hourglass|^calendar|^lock|^unlock|^key|^shield|^fingerprint|^eye|^alert|^triangle-alert|^circle-alert|^octagon-alert|^badge-alert|^badge-check|^badge-info|^badge-help|^badge-x|^info|^help|^circle-help|^circle-check|^circle-x|^heart|^star|^sparkle|^zap|^bolt|^flag|^activity|^pulse|^check|^ban|^skull|^ghost|^siren|^radiation|^biohazard|^flame|^verified|^loader)/.test(
      s,
    )
  ) {
    return 3;
  }

  // 8: System
  if (
    /(^cpu|^chip|^microchip|^circuit|^brain|^bot|^memory|^monitor|^laptop|^tablet|^smartphone|^keyboard|^mouse|^gamepad|^joystick|^printer|^scanner|^qr-code|^barcode|^scan|^wrench|^hammer|^screwdriver|^axe|^pickaxe|^shovel|^anvil|^cog|^settings|^sliders|^gauge|^speedometer|^power|^plug|^flashlight|^lamp|^lightbulb|^magnet|^scale|^ruler|^compass|^telescope|^microscope|^flask|^test-tube|^atom|^dna|^orbit|^satellite|^rocket|^bot|^command|^option|^alt|^delete|^backspace|^space|^tab|^enter|^caps|^shift|^control|^esc)/.test(
      s,
    )
  ) {
    return 8;
  }

  // 1: Controls (default UI actions, editing, typography, shapes, toggles)
  return 1;
}

function main() {
  if (!fs.existsSync(LUCIDE_ICONS_DIR)) {
    throw new Error(`Lucide icons directory not found at ${LUCIDE_ICONS_DIR}`);
  }

  const files = fs
    .readdirSync(LUCIDE_ICONS_DIR)
    .filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    .sort();

  const rawCanonicalNodes = new Map<string, SvgNode[]>();
  const rawAliases = new Map<string, string>();

  for (const file of files) {
    const slug = file.replace(/\.js$/, '');
    const content = fs.readFileSync(path.join(LUCIDE_ICONS_DIR, file), 'utf8');
    const nodeMatch = content.match(/const __iconNode = (\[[\s\S]*?\]);/);
    if (nodeMatch) {
      const nodes = vm.runInNewContext(nodeMatch[1]) as SvgNode[];
      rawCanonicalNodes.set(slug, nodes);
    } else {
      const aliasMatch = content.match(/from '\.\/([^']+)\.js'/);
      if (aliasMatch) {
        rawAliases.set(slug, aliasMatch[1]);
      }
    }
  }

  // Rasterize all brand-new canonical Lucide icons not already covered by our 247 originals / 12 aliases
  const packedEntries: Array<[string, string, number]> = [];
  const samplePreviewSlugs = [
    'a-arrow-down',
    'accessibility',
    'alarm-clock',
    'bike',
    'brain-circuit',
    'castle',
    'crown',
    'ghost',
    'guitar',
    'palette',
    'skull',
    'umbrella',
  ];
  const samplePreviews: Record<string, string[]> = {};

  for (const [slug, nodes] of rawCanonicalNodes) {
    if (EXISTING_CANONICAL.has(slug) || slug in EXISTING_ALIASES) {
      continue;
    }
    const bitmap = rasterizeIconNodes(nodes, GRID_SIZE);
    const packed = encodeDotBitmap(bitmap);
    const catIdx = classifyLucideCategory(slug);
    packedEntries.push([slug, packed, catIdx]);
    if (samplePreviewSlugs.includes(slug)) {
      samplePreviews[slug] = bitmap;
    }
  }

  // Resolve all new Lucide aliases directly to canonical keys in DOT_ICON_BITMAPS
  const addedCanonicalSet = new Set(packedEntries.map(([slug]) => slug));
  const resolvedAliases: Array<[string, string]> = [];

  for (const [alias, rawTarget] of rawAliases) {
    if (EXISTING_CANONICAL.has(alias) || alias in EXISTING_ALIASES) {
      continue;
    }
    // Follow alias chains if needed
    let target = rawTarget;
    for (let hop = 0; hop < 4; hop++) {
      if (target in EXISTING_ALIASES) {
        target = EXISTING_ALIASES[target];
      } else if (rawAliases.has(target)) {
        target = rawAliases.get(target)!;
      } else {
        break;
      }
    }
    if (EXISTING_CANONICAL.has(target) || addedCanonicalSet.has(target)) {
      resolvedAliases.push([alias, target]);
    }
  }

  resolvedAliases.sort(([a], [b]) => a.localeCompare(b));

  // Emit compact, clean, strictly typed TypeScript module
  const packedLines = packedEntries.map(
    ([slug, packed, catIdx]) => `  ${JSON.stringify(slug)}: [${JSON.stringify(packed)}, ${catIdx}],`,
  );
  const aliasLines = resolvedAliases.map(
    ([alias, target]) => `  ${JSON.stringify(alias)}: ${JSON.stringify(target)},`,
  );

  const output = `/**
 * AUTO-GENERATED by scripts/generate-lucide-dot-icons.ts from lucide-react v0.546.0.
 * Complete Lucide Icons directory rasterized from official 24x24 SVG vector geometry
 * onto crisp ${GRID_SIZE}x${GRID_SIZE} monochrome dot-matrix bitmaps and compactly bit-packed.
 *
 * Canonical Lucide icons added: ${packedEntries.length}
 * Official Lucide aliases added: ${resolvedAliases.length}
 * Total Lucide directory coverage (with 247 Nothing originals + 12 core aliases): 100% (${rawCanonicalNodes.size} canonical + ${rawAliases.size} aliases)
 */
import { decodeDotBitmap } from '../core/bitmap-codec';

export const LUCIDE_DOT_GRID_SIZE = ${GRID_SIZE} as const;
export const LUCIDE_DIRECTORY_SOURCE_COUNT = ${rawCanonicalNodes.size} as const;
export const LUCIDE_DIRECTORY_ALIAS_SOURCE_COUNT = ${rawAliases.size} as const;

/**
 * Compact [base64Packed15x15Bitmap, categoryIndex] dictionary for all ${packedEntries.length}
 * Lucide directory dot icons not already provided by the 247 hand-crafted Nothing UI originals.
 */
export const LUCIDE_DOT_ICON_PACKED = {
${packedLines.join('\n')}
} as const satisfies Record<string, readonly [string, number]>;

export type LucideDotIconCanonicalName = keyof typeof LUCIDE_DOT_ICON_PACKED;

export const LUCIDE_DOT_ICON_NAMES = Object.keys(
  LUCIDE_DOT_ICON_PACKED,
) as LucideDotIconCanonicalName[];

/**
 * Unpacked ${GRID_SIZE}x${GRID_SIZE} '#' / '.' bitmaps for every Lucide directory icon.
 */
export const LUCIDE_DOT_ICON_BITMAPS = Object.fromEntries(
  LUCIDE_DOT_ICON_NAMES.map((name) => [
    name,
    decodeDotBitmap(LUCIDE_DOT_ICON_PACKED[name][0], LUCIDE_DOT_GRID_SIZE, LUCIDE_DOT_GRID_SIZE),
  ]),
) as Record<LucideDotIconCanonicalName, readonly string[]>;

/**
 * Official Lucide icon aliases (${resolvedAliases.length} entries) mapped directly to canonical
 * Nothing UI / Lucide dot icon keys.
 */
export const LUCIDE_DOT_ICON_ALIASES = {
${aliasLines.join('\n')}
} as const;
`;

  fs.writeFileSync(OUTPUT_FILE, output, 'utf8');

  const fileStats = fs.statSync(OUTPUT_FILE);
  console.log(
    `Generated ${path.relative(ROOT, OUTPUT_FILE)}: ${packedEntries.length} Lucide canonical icons + ${resolvedAliases.length} aliases (${(fileStats.size / 1024).toFixed(1)} KB)`,
  );

  // Print category distribution
  const catDist = new Array(9).fill(0);
  for (const [, , c] of packedEntries) catDist[c]++;
  console.log('Category distribution across 9 categories:', catDist);

  // Print a few ASCII previews to inspect rasterization quality
  for (const slug of ['alarm-clock', 'brain-circuit', 'crown', 'ghost']) {
    if (samplePreviews[slug]) {
      console.log(`\n--- ${slug} (${GRID_SIZE}x${GRID_SIZE}) ---`);
      console.log(samplePreviews[slug].join('\n'));
    }
  }
}

main();
