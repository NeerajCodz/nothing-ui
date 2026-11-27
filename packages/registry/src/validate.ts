import { CATALOG } from './catalog';
import { COMPLETE_INVENTORY_GROUPS } from './roadmap';
import { CHART_SLUGS, GLYPH_SLUGS, PLANNED_WIDGETS, WIDGET_SLUGS } from './widgets';

export function validateCatalogConsistency(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const entry of CATALOG) {
    if (seen.has(entry.slug)) {
      errors.push(`Duplicate slug: ${entry.slug}`);
    }
    seen.add(entry.slug);

    if (!entry.title.trim() || !entry.description.trim()) {
      errors.push(`${entry.slug}: missing title or description`);
    }
    if (!entry.sourcePath) {
      errors.push(`${entry.slug}: missing sourcePath`);
    }
    if (entry.props.length === 0) {
      errors.push(`${entry.slug}: missing API prop documentation`);
    }
    if (entry.keyboard.length === 0) {
      errors.push(`${entry.slug}: missing keyboard documentation`);
    }
    if ((entry.native === 'beta' || entry.native === 'stable') && !entry.nativeImport) {
      errors.push(`${entry.slug}: claims native ${entry.native} without nativeImport`);
    }

    // Strict 3-pillar taxonomy invariants:
    // 1. Charts belong exclusively to Components -> Charts (never Data & Hardware)
    if (CHART_SLUGS.has(entry.slug) && (entry.kind !== 'component' || entry.category !== 'Charts')) {
      errors.push(`${entry.slug}: chart must be classified as component / Charts`);
    }
    if (!CHART_SLUGS.has(entry.slug) && entry.category === 'Charts') {
      errors.push(`${entry.slug}: non-chart entry found inside Charts category`);
    }

    // 2. Widgets (Calendar, Audio/Video Recorders, Camera, Media, Clock, Weather, Battery, Quick Settings)
    if (WIDGET_SLUGS.has(entry.slug)) {
      if (entry.kind !== 'widget' || entry.category !== 'Widgets' || !entry.widgetGroup) {
        errors.push(`${entry.slug}: widget must have kind="widget", category="Widgets", and a widgetGroup`);
      }
    }

    // 3. Glyph is a separate standalone system (neither Component nor Widget)
    if (GLYPH_SLUGS.has(entry.slug) && (entry.kind !== 'glyph' || entry.category !== 'Glyph System')) {
      errors.push(`${entry.slug}: glyph entry must have kind="glyph" and category="Glyph System"`);
    }
  }

  // Validate Planned Widgets roadmap uniqueness and non-collision with shipped slugs
  const plannedSeen = new Set<string>();
  for (const planned of PLANNED_WIDGETS) {
    if (plannedSeen.has(planned.slug)) {
      errors.push(`Duplicate planned widget slug: ${planned.slug}`);
    }
    plannedSeen.add(planned.slug);
    if (seen.has(planned.slug)) {
      errors.push(`Planned widget "${planned.slug}" collides with an already-shipped catalog slug.`);
    }
  }

  for (const group of COMPLETE_INVENTORY_GROUPS) {
    for (const item of group.items) {
      if (item.status === 'planned') {
        errors.push(`Inventory item "${item.slug}" is still marked planned.`);
      }
      if (!item.shippedSlug) {
        errors.push(`Inventory item "${item.slug}" is missing a shippedSlug mapping.`);
      } else if (!seen.has(item.shippedSlug)) {
        errors.push(`Inventory item "${item.slug}" points to unknown catalog slug "${item.shippedSlug}".`);
      }
    }
  }

  return { valid: errors.length === 0, errors };
}
