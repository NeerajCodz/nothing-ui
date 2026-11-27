export type DensityMode = 'compact' | 'default' | 'comfortable';

export const TYPOGRAPHY_TOKENS = {
  families: {
    display: '"Doto", ui-monospace, monospace',
    sans: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, monospace',
  },
  nativeFamilies: {
    display: 'Doto',
    sans: 'PlusJakartaSans-Regular',
    mono: 'JetBrainsMono-Regular',
  },
  roles: {
    hero: { size: 'clamp(2.25rem, 4.2vw, 3.5rem)', lineHeight: 1.04, tracking: '0.02em', weight: 700 },
    heading: { size: '1.75rem', lineHeight: 1.15, tracking: '-0.01em', weight: 600 },
    subheading: { size: '1.125rem', lineHeight: 1.3, tracking: '0em', weight: 600 },
    body: { size: '0.9375rem', lineHeight: 1.6, tracking: '0em', weight: 400 },
    caption: { size: '0.75rem', lineHeight: 1.4, tracking: '0.02em', weight: 400 },
    micro: { size: '0.6875rem', lineHeight: 1.25, tracking: '0.14em', weight: 500 },
    code: { size: '0.8125rem', lineHeight: 1.55, tracking: '0em', weight: 400 },
  },
} as const;

export const SPACING_SCALE = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

export const RADIUS_TOKENS = {
  control: 8,
  card: 16,
  panel: 20,
  pill: 9999,
  circle: 9999,
} as const;

export const DENSITY_TOKENS: Record<
  DensityMode,
  { controlHeight: number; cellPaddingY: number; cardPadding: number; gap: number }
> = {
  compact: { controlHeight: 32, cellPaddingY: 6, cardPadding: 14, gap: 10 },
  default: { controlHeight: 38, cellPaddingY: 10, cardPadding: 20, gap: 16 },
  comfortable: { controlHeight: 44, cellPaddingY: 14, cardPadding: 24, gap: 20 },
};

export const MOTION_TOKENS = {
  durations: {
    instant: 0,
    fast: 120,
    normal: 180,
    slow: 280,
  },
  easing: {
    standard: 'cubic-bezier(0.16, 1, 0.3, 1)',
    linear: 'linear',
  },
} as const;
