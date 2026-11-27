import type {
  CatalogItemKind,
  ComponentCategory,
  PlannedWidgetEntry,
  RegistryCategory,
  WidgetGroup,
} from './types';

/**
 * Components are atomic, reusable UI building blocks & data visualizations.
 * Charts lives as its own dedicated subsection inside Components (never inside Data & Hardware).
 */
export const COMPONENT_CATEGORIES: readonly ComponentCategory[] = [
  'Inputs & Actions',
  'Navigation & Layout',
  'Overlays & Feedback',
  'Charts',
  'Data & Hardware',
];

export const WIDGET_GROUPS: readonly WidgetGroup[] = [
  'Calendar & Time',
  'Audio & Video',
  'Hardware OS',
  'Productivity & Utility',
];

/**
 * All 9 interactive chart & graph modules belong exclusively in Components -> Charts.
 */
export const CHART_SLUGS: ReadonlySet<string> = new Set([
  'charts',
  'sparkline-strip',
  'radar-chart',
  'pie-chart',
  'timeseries',
  'sankey',
  'map-chart',
  'flow',
  'custom-chart',
]);

/**
 * Glyph is its own standalone hardware matrix system — neither a Component nor a Widget.
 */
export const GLYPH_SLUGS: ReadonlySet<string> = new Set(['glyph-matrix']);

/**
 * Widgets are self-contained, stateful, task-complete mini-apps (Calendar, Audio/Video Recorders,
 * Camera Capture, Media Studio/Viewer, Clock, Weather, Battery Telemetry, Quick Settings).
 */
export const WIDGET_GROUP_BY_SLUG: Readonly<Record<string, WidgetGroup>> = {
  // Calendar & Time (14 widgets — including full Clock Varieties & Magnetic Calendar suite)
  calendar: 'Calendar & Time',
  'calendar-canvas': 'Calendar & Time',
  'calendar-widget': 'Calendar & Time',
  'dot-matrix-clock': 'Calendar & Time',
  'analog-clock': 'Calendar & Time',
  'nothing-analog-clock': 'Calendar & Time',
  'flip-clock': 'Calendar & Time',
  'binary-dot-clock': 'Calendar & Time',
  'word-clock': 'Calendar & Time',
  'radial-clock': 'Calendar & Time',
  'clock-collection': 'Calendar & Time',
  'stopwatch-timer': 'Calendar & Time',
  'world-clock-deck': 'Calendar & Time',
  'agenda-ticker': 'Calendar & Time',
  // Audio & Video (9 widgets)
  'audio-recorder': 'Audio & Video',
  'video-recorder': 'Audio & Video',
  'camera-capture': 'Audio & Video',
  'media-studio': 'Audio & Video',
  'media-viewer': 'Audio & Video',
  'media-kit': 'Audio & Video',
  'podcast-mini-player': 'Audio & Video',
  'voice-memo-transcriber': 'Audio & Video',
  'photo-frame-dither': 'Audio & Video',
  // Hardware OS (7 widgets)
  'earbuds-battery': 'Hardware OS',
  'weather-matrix': 'Hardware OS',
  'quick-settings': 'Hardware OS',
  'pedometer-ring': 'Hardware OS',
  'battery-health-hub': 'Hardware OS',
  'screen-time-pulse': 'Hardware OS',
  'network-speed-radar': 'Hardware OS',
  // Productivity & Utility (5 widgets)
  'search-bar': 'Productivity & Utility',
  'pomodoro-focus-card': 'Productivity & Utility',
  'quick-notes-pad': 'Productivity & Utility',
  'habit-matrix-tracker': 'Productivity & Utility',
  'unit-fx-converter': 'Productivity & Utility',
};

export const WIDGET_SLUGS: ReadonlySet<string> = new Set(Object.keys(WIDGET_GROUP_BY_SLUG));

/**
 * Slugs for the dedicated Clock Varieties suite inside Calendar & Time.
 */
export const CLOCK_WIDGET_SLUGS: ReadonlySet<string> = new Set([
  'analog-clock',
  'nothing-analog-clock',
  'dot-matrix-clock',
  'flip-clock',
  'binary-dot-clock',
  'word-clock',
  'radial-clock',
  'world-clock-deck',
  'stopwatch-timer',
  'clock-collection',
]);

export function classifyCatalogEntry(
  slug: string,
  rawCategory: RegistryCategory,
): {
  kind: CatalogItemKind;
  category: RegistryCategory;
  widgetGroup?: WidgetGroup;
} {
  if (GLYPH_SLUGS.has(slug)) {
    return {
      kind: 'glyph',
      category: 'Glyph System',
    };
  }

  const widgetGroup = WIDGET_GROUP_BY_SLUG[slug];
  if (widgetGroup) {
    return {
      kind: 'widget',
      category: 'Widgets',
      widgetGroup,
    };
  }

  if (CHART_SLUGS.has(slug)) {
    return {
      kind: 'component',
      category: 'Charts',
    };
  }

  return {
    kind: 'component',
    category: rawCategory,
  };
}

/**
 * Count of originally planned roadmap widgets that have all been promoted to live shipped modules.
 */
export const SHIPPED_ROADMAP_WIDGET_COUNT = 14;

/**
 * All 14 planned roadmap widgets have been completed and promoted to live shipped widgets in CATALOG.
 */
export const PLANNED_WIDGETS: readonly PlannedWidgetEntry[] = [];
