import type { CatalogEntry, ComponentMaturity, ComponentStatus } from '@nothing-ui/registry';

export type ComponentMaturityLevel = ComponentMaturity | 'planned';

export interface ComponentMaturityMeta {
  level: ComponentMaturityLevel;
  label: string;
  shortNote: string;
  advisory: string | null;
  /** Nothing UI semantic CSS custom property backing this maturity level */
  colorToken: string;
  dotClass: string;
  textClass: string;
  badgeClass: string;
  advisoryClass: string;
}

/**
 * Explicit lifecycle maturity levels for newer/preview catalog modules whose
 * runtime builds are live while APIs continue maturing.
 */
export const COMPONENT_MATURITY_OVERRIDES: Readonly<Record<string, ComponentMaturity>> = {
  'custom-chart': 'alpha',
  flow: 'alpha',
  sankey: 'alpha',
  'media-studio': 'beta',
  'calendar-canvas': 'beta',
  'map-chart': 'beta',
  'native-select': 'deprecated',
};

const MATURITY_CONFIG: Readonly<Record<ComponentMaturityLevel, ComponentMaturityMeta>> = {
  stable: {
    level: 'stable',
    label: 'Stable',
    shortNote: 'Production ready',
    advisory: null,
    colorToken: '--nt-success',
    dotClass: 'bg-[var(--nt-success)]',
    textClass: 'text-[var(--nt-success)]',
    badgeClass: 'border-[var(--nt-success)]/40 bg-[var(--nt-surface)] text-[var(--nt-success)]',
    advisoryClass: 'border-[var(--nt-success)]/30 bg-[var(--nt-surface)] text-[var(--nt-secondary)]',
  },
  beta: {
    level: 'beta',
    label: 'Beta',
    shortNote: 'API stabilizing',
    advisory: null,
    colorToken: '--nt-display',
    dotClass: 'bg-[var(--nt-display)]',
    textClass: 'text-[var(--nt-display)]',
    badgeClass: 'border-[var(--nt-line-2)] bg-[var(--nt-raised)] text-[var(--nt-display)]',
    advisoryClass: 'border-[var(--nt-line-2)] bg-[var(--nt-surface)] text-[var(--nt-secondary)]',
  },
  alpha: {
    level: 'alpha',
    label: 'Alpha',
    shortNote: 'Early preview',
    advisory: 'Alpha preview: props, slots, and visual tokens may evolve before v1.0.',
    colorToken: '--nt-warning',
    dotClass: 'bg-[var(--nt-warning)]',
    textClass: 'text-[var(--nt-warning)]',
    badgeClass: 'border-[var(--nt-warning)]/45 bg-[var(--nt-surface)] text-[var(--nt-warning)]',
    advisoryClass: 'border-[var(--nt-warning)]/35 bg-[var(--nt-surface)] text-[var(--nt-warning)]',
  },
  deprecated: {
    level: 'deprecated',
    label: 'Deprecated',
    shortNote: 'Scheduled for removal',
    advisory: 'Deprecated module: scheduled for removal in a future release. Prefer the modern replacement.',
    colorToken: '--nt-danger',
    dotClass: 'bg-[var(--nt-danger)]',
    textClass: 'text-[var(--nt-danger)]',
    badgeClass: 'border-[var(--nt-danger)]/50 bg-[var(--nt-accent-soft)] text-[var(--nt-danger)]',
    advisoryClass: 'border-[var(--nt-danger)]/40 bg-[var(--nt-accent-soft)] text-[var(--nt-danger)]',
  },
  planned: {
    level: 'planned',
    label: 'Planned',
    shortNote: 'On roadmap',
    advisory: 'Planned specification: implementation has not shipped yet.',
    colorToken: '--nt-muted',
    dotClass: 'bg-[var(--nt-muted)]',
    textClass: 'text-[var(--nt-muted)]',
    badgeClass: 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-muted)]',
    advisoryClass: 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-muted)]',
  },
};

function normalizeStatusToMaturity(status: ComponentStatus | ComponentMaturityLevel): ComponentMaturityLevel {
  if (status === 'deprecated') return 'deprecated';
  if (status === 'alpha') return 'alpha';
  if (status === 'beta') return 'beta';
  if (status === 'planned' || status === 'unsupported') return 'planned';
  return 'stable';
}

export function getMaturityMeta(level: ComponentMaturityLevel): ComponentMaturityMeta {
  return MATURITY_CONFIG[level];
}

/**
 * Resolves the display maturity metadata for a catalog entry using:
 * 1. Explicit override (if passed),
 * 2. Entry's `maturity` field,
 * 3. `COMPONENT_MATURITY_OVERRIDES` for preview modules,
 * 4. Entry's `web` status.
 */
export function resolveComponentMaturity(
  entry: Pick<CatalogEntry, 'slug' | 'web' | 'maturity'>,
  override?: ComponentMaturityLevel,
): ComponentMaturityMeta {
  if (override) {
    return MATURITY_CONFIG[normalizeStatusToMaturity(override)];
  }
  if (entry.maturity) {
    return MATURITY_CONFIG[normalizeStatusToMaturity(entry.maturity)];
  }
  const mapped = COMPONENT_MATURITY_OVERRIDES[entry.slug];
  if (mapped) {
    return MATURITY_CONFIG[mapped];
  }
  return MATURITY_CONFIG[normalizeStatusToMaturity(entry.web)];
}
