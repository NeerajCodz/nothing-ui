export type InventoryTrack = 'standard' | 'exclusive';

export interface InventoryItem {
  slug: string;
  name: string;
  shippedSlug?: string;
  status: 'stable' | 'beta' | 'planned';
  nativeTarget?: string;
  note?: string;
}

export interface RoadmapGroup {
  familyNumber: number;
  category: string;
  track: InventoryTrack;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  items: InventoryItem[];
}

/**
 * A. Standard UI Components (114 entries across Families 1–13).
 * Complete monochrome component standard set — 100% stable for Web and React Native.
 */
export const REFERENCE_ROADMAP_GROUPS: RoadmapGroup[] = [
  {
    familyNumber: 1,
    category: 'Actions',
    track: 'standard',
    priority: 'P0',
    items: [
      { slug: 'button', name: 'Button', shippedSlug: 'button', status: 'stable', nativeTarget: 'Button' },
      { slug: 'button-group', name: 'Button Group', shippedSlug: 'button', status: 'stable' },
      { slug: 'toggle', name: 'Toggle', shippedSlug: 'segmented-control', status: 'stable' },
      { slug: 'toggle-group', name: 'Toggle Group', shippedSlug: 'segmented-control', status: 'stable' },
      { slug: 'toolbar', name: 'Toolbar', shippedSlug: 'toolbar', status: 'stable' },
      { slug: 'link', name: 'Link', shippedSlug: 'button', status: 'stable' },
      { slug: 'clipboard-text', name: 'Clipboard Text', shippedSlug: 'copy-field', status: 'stable' },
      { slug: 'inline-copy-text', name: 'Inline Copy Text', shippedSlug: 'copy-field', status: 'stable' },
      { slug: 'kbd', name: 'Kbd', shippedSlug: 'avatar', status: 'stable' },
    ],
  },
  {
    familyNumber: 2,
    category: 'Forms',
    track: 'standard',
    priority: 'P0',
    items: [
      { slug: 'input', name: 'Input', shippedSlug: 'input', status: 'stable', nativeTarget: 'Input' },
      { slug: 'textarea', name: 'Textarea', shippedSlug: 'input', status: 'stable' },
      { slug: 'input-group', name: 'Input Group', shippedSlug: 'input', status: 'stable' },
      { slug: 'field', name: 'Field', shippedSlug: 'input', status: 'stable' },
      { slug: 'label', name: 'Label', shippedSlug: 'input', status: 'stable' },
      { slug: 'form', name: 'Form', shippedSlug: 'form', status: 'stable' },
      { slug: 'native-select', name: 'Native Select', shippedSlug: 'native-select', status: 'stable' },
      { slug: 'select', name: 'Select', shippedSlug: 'select', status: 'stable' },
      { slug: 'checkbox', name: 'Checkbox', shippedSlug: 'checkbox', status: 'stable' },
      { slug: 'radio-group', name: 'Radio Group', shippedSlug: 'checkbox', status: 'stable' },
      { slug: 'switch', name: 'Switch', shippedSlug: 'switch', status: 'stable', nativeTarget: 'Switch' },
      { slug: 'slider', name: 'Slider', shippedSlug: 'slider', status: 'stable' },
      { slug: 'input-otp', name: 'Input OTP', shippedSlug: 'otp-input', status: 'stable' },
      { slug: 'sensitive-input', name: 'Sensitive Input', shippedSlug: 'input', status: 'stable' },
      { slug: 'segmented-control', name: 'Segmented Control', shippedSlug: 'segmented-control', status: 'stable' },
      { slug: 'combobox', name: 'Combobox', shippedSlug: 'combobox', status: 'stable' },
      { slug: 'autocomplete', name: 'Autocomplete', shippedSlug: 'combobox', status: 'stable' },
      { slug: 'tag-input', name: 'Tag Input', shippedSlug: 'tag-input', status: 'stable' },
      { slug: 'calendar', name: 'Calendar', shippedSlug: 'calendar', status: 'stable' },
      { slug: 'date-picker', name: 'Date Picker', shippedSlug: 'date-time-picker', status: 'stable' },
      { slug: 'time-picker', name: 'Time Picker', shippedSlug: 'date-time-picker', status: 'stable' },
      { slug: 'dropzone', name: 'Dropzone', shippedSlug: 'dropzone', status: 'stable' },
      { slug: 'questionnaire', name: 'Questionnaire', shippedSlug: 'questionnaire', status: 'stable' },
    ],
  },
  {
    familyNumber: 3,
    category: 'Overlays',
    track: 'standard',
    priority: 'P0',
    items: [
      { slug: 'dialog', name: 'Dialog', shippedSlug: 'dialog', status: 'stable' },
      { slug: 'alert-dialog', name: 'Alert Dialog', shippedSlug: 'dialog', status: 'stable' },
      { slug: 'layer-dialog', name: 'Layer Dialog', shippedSlug: 'layer-dialog', status: 'stable' },
      { slug: 'sheet', name: 'Sheet', shippedSlug: 'drawer', status: 'stable' },
      { slug: 'drawer', name: 'Drawer', shippedSlug: 'drawer', status: 'stable' },
      { slug: 'popover', name: 'Popover', shippedSlug: 'popover', status: 'stable' },
      { slug: 'hover-card', name: 'Hover Card', shippedSlug: 'hover-card', status: 'stable' },
      { slug: 'tooltip', name: 'Tooltip', shippedSlug: 'popover', status: 'stable' },
      { slug: 'dropdown-menu', name: 'Dropdown Menu', shippedSlug: 'dropdown-menu', status: 'stable' },
      { slug: 'context-menu', name: 'Context Menu', shippedSlug: 'context-menu', status: 'stable' },
      { slug: 'menubar', name: 'Menubar', shippedSlug: 'menubar', status: 'stable' },
      { slug: 'command', name: 'Command', shippedSlug: 'command', status: 'stable' },
    ],
  },
  {
    familyNumber: 4,
    category: 'Navigation',
    track: 'standard',
    priority: 'P1',
    items: [
      { slug: 'breadcrumb', name: 'Breadcrumb', shippedSlug: 'breadcrumb', status: 'stable' },
      { slug: 'navigation-menu', name: 'Navigation Menu', shippedSlug: 'navigation-menu', status: 'stable' },
      { slug: 'tabs', name: 'Tabs', shippedSlug: 'tabs', status: 'stable' },
      { slug: 'pagination', name: 'Pagination', shippedSlug: 'pagination', status: 'stable' },
      { slug: 'table-of-contents', name: 'Table of Contents', shippedSlug: 'table-of-contents', status: 'stable' },
      { slug: 'sidebar', name: 'Sidebar', shippedSlug: 'sidebar', status: 'stable' },
    ],
  },
  {
    familyNumber: 5,
    category: 'Data Display',
    track: 'standard',
    priority: 'P1',
    items: [
      { slug: 'avatar', name: 'Avatar', shippedSlug: 'avatar', status: 'stable' },
      { slug: 'badge', name: 'Badge', shippedSlug: 'avatar', status: 'stable', nativeTarget: 'Badge' },
      { slug: 'card', name: 'Card', shippedSlug: 'card', status: 'stable', nativeTarget: 'Card' },
      { slug: 'layer-card', name: 'Layer Card', shippedSlug: 'layer-card', status: 'stable' },
      { slug: 'metric-card', name: 'Metric Card', shippedSlug: 'metric-card', status: 'stable' },
      { slug: 'item', name: 'Item', shippedSlug: 'card', status: 'stable' },
      { slug: 'table', name: 'Table', shippedSlug: 'data-table', status: 'stable' },
      { slug: 'data-table', name: 'Data Table', shippedSlug: 'data-table', status: 'stable' },
      { slug: 'empty-state', name: 'Empty State', shippedSlug: 'skeleton', status: 'stable' },
      { slug: 'skeleton', name: 'Skeleton', shippedSlug: 'skeleton', status: 'stable', nativeTarget: 'Skeleton' },
      { slug: 'code-highlighted', name: 'Code Highlighted', shippedSlug: 'avatar', status: 'stable' },
      { slug: 'marker', name: 'Marker', shippedSlug: 'marker', status: 'stable' },
      { slug: 'typography', name: 'Typography', shippedSlug: 'dot-text', status: 'stable', nativeTarget: 'Text' },
    ],
  },
  {
    familyNumber: 6,
    category: 'Feedback',
    track: 'standard',
    priority: 'P0',
    items: [
      { slug: 'alert', name: 'Alert', shippedSlug: 'alert', status: 'stable' },
      { slug: 'banner', name: 'Banner', shippedSlug: 'alert', status: 'stable' },
      { slug: 'toast', name: 'Toast', shippedSlug: 'toast', status: 'stable' },
      { slug: 'progress', name: 'Progress', shippedSlug: 'progress', status: 'stable', nativeTarget: 'Progress' },
      { slug: 'meter', name: 'Meter', shippedSlug: 'progress', status: 'stable' },
      { slug: 'spinner', name: 'Spinner', shippedSlug: 'skeleton', status: 'stable' },
    ],
  },
  {
    familyNumber: 7,
    category: 'Layout',
    track: 'standard',
    priority: 'P1',
    items: [
      { slug: 'accordion', name: 'Accordion', shippedSlug: 'accordion', status: 'stable' },
      { slug: 'collapsible', name: 'Collapsible', shippedSlug: 'accordion', status: 'stable' },
      { slug: 'carousel', name: 'Carousel', shippedSlug: 'carousel', status: 'stable' },
      { slug: 'resizable-panels', name: 'Resizable Panels', shippedSlug: 'resizable-panels', status: 'stable' },
      { slug: 'scroll-area', name: 'Scroll Area', shippedSlug: 'scroll-area', status: 'stable' },
      { slug: 'separator', name: 'Separator', shippedSlug: 'breadcrumb', status: 'stable', nativeTarget: 'Separator' },
      { slug: 'aspect-ratio', name: 'Aspect Ratio', shippedSlug: 'aspect-ratio', status: 'stable' },
      { slug: 'grid', name: 'Grid', shippedSlug: 'grid', status: 'stable' },
      { slug: 'direction', name: 'Direction', shippedSlug: 'direction', status: 'stable' },
    ],
  },
  {
    familyNumber: 8,
    category: 'Chat',
    track: 'standard',
    priority: 'P2',
    items: [
      { slug: 'bubble', name: 'Bubble', shippedSlug: 'chat', status: 'stable' },
      { slug: 'message', name: 'Message', shippedSlug: 'chat', status: 'stable' },
      { slug: 'message-scroller', name: 'Message Scroller', shippedSlug: 'message-scroller', status: 'stable' },
      { slug: 'attachment', name: 'Attachment', shippedSlug: 'chat', status: 'stable' },
    ],
  },
  {
    familyNumber: 9,
    category: 'Charts',
    track: 'standard',
    priority: 'P2',
    items: [
      { slug: 'chart', name: 'Chart', shippedSlug: 'charts', status: 'stable' },
      { slug: 'bar-chart', name: 'Bar Chart', shippedSlug: 'charts', status: 'stable' },
      { slug: 'line-chart', name: 'Line Chart', shippedSlug: 'sparkline-strip', status: 'stable' },
      { slug: 'area-chart', name: 'Area Chart', shippedSlug: 'sparkline-strip', status: 'stable' },
      { slug: 'pie-chart', name: 'Pie Chart', shippedSlug: 'pie-chart', status: 'stable' },
      { slug: 'radar-chart', name: 'Radar Chart', shippedSlug: 'radar-chart', status: 'stable' },
      { slug: 'radial-chart', name: 'Radial Chart', shippedSlug: 'charts', status: 'stable' },
      { slug: 'sparkline', name: 'Sparkline', shippedSlug: 'sparkline-strip', status: 'stable' },
      { slug: 'timeseries', name: 'Timeseries', shippedSlug: 'timeseries', status: 'stable' },
      { slug: 'sankey', name: 'Sankey', shippedSlug: 'sankey', status: 'stable' },
      { slug: 'map-chart', name: 'Map Chart', shippedSlug: 'map-chart', status: 'stable' },
      { slug: 'flow', name: 'Flow', shippedSlug: 'flow', status: 'stable' },
      { slug: 'custom-chart', name: 'Custom Chart', shippedSlug: 'custom-chart', status: 'stable' },
    ],
  },
  {
    familyNumber: 10,
    category: 'Media',
    track: 'standard',
    priority: 'P2',
    items: [
      { slug: 'audio-player', name: 'Audio Player', shippedSlug: 'media-kit', status: 'stable' },
      { slug: 'audio-recorder', name: 'Audio Recorder', shippedSlug: 'audio-recorder', status: 'stable' },
      { slug: 'video-recorder', name: 'Video Recorder', shippedSlug: 'video-recorder', status: 'stable' },
      { slug: 'camera-capture', name: 'Camera Capture', shippedSlug: 'camera-capture', status: 'stable' },
      { slug: 'location-card', name: 'Location Card', shippedSlug: 'media-kit', status: 'stable' },
      { slug: 'media-studio', name: 'Media Studio', shippedSlug: 'media-studio', status: 'stable' },
      { slug: 'media-viewer', name: 'Media Viewer', shippedSlug: 'media-viewer', status: 'stable' },
    ],
  },
  {
    familyNumber: 11,
    category: 'Motion',
    track: 'standard',
    priority: 'P2',
    items: [
      { slug: 'motion', name: 'Motion', shippedSlug: 'motion-kit', status: 'stable' },
      { slug: 'fade-in', name: 'Fade In', shippedSlug: 'motion-kit', status: 'stable' },
      { slug: 'slide-in', name: 'Slide In', shippedSlug: 'motion-kit', status: 'stable' },
      { slug: 'scale-in', name: 'Scale In', shippedSlug: 'motion-kit', status: 'stable' },
      { slug: 'stagger', name: 'Stagger', shippedSlug: 'motion-kit', status: 'stable' },
      { slug: 'hover-effects', name: 'Hover Effects', shippedSlug: 'motion-kit', status: 'stable' },
    ],
  },
  {
    familyNumber: 12,
    category: 'Productivity',
    track: 'standard',
    priority: 'P3',
    items: [
      { slug: 'editor', name: 'Editor', shippedSlug: 'editor', status: 'stable' },
      { slug: 'calendar-canvas', name: 'Calendar Canvas', shippedSlug: 'calendar-canvas', status: 'stable' },
      { slug: 'drag-drop', name: 'Drag Drop', shippedSlug: 'sortable-board', status: 'stable' },
      { slug: 'sortable', name: 'Sortable', shippedSlug: 'sortable-board', status: 'stable' },
      { slug: 'onboarding', name: 'Onboarding', shippedSlug: 'productivity-kit', status: 'stable' },
    ],
  },
  {
    familyNumber: 13,
    category: 'Brand',
    track: 'standard',
    priority: 'P0',
    items: [
      { slug: 'logo', name: 'Logo', shippedSlug: 'brand-logo', status: 'stable', note: 'Original Nothing UI branding' },
    ],
  },
];

/**
 * B. Nothing UI Exclusive Components (22 entries across Families 14–16).
 */
export const NOTHING_EXCLUSIVE_GROUPS: RoadmapGroup[] = [
  {
    familyNumber: 14,
    category: 'Glyph Matrix',
    track: 'exclusive',
    priority: 'P0',
    items: [
      { slug: 'glyph-matrix', name: 'GlyphMatrix', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Generic configurable matrix' },
      { slug: 'glyph-matrix-25', name: 'GlyphMatrix25', shippedSlug: 'glyph-matrix', status: 'stable', nativeTarget: 'GlyphMatrix25', note: '25×25 circular grid (481 LEDs)' },
      { slug: 'glyph-matrix-13', name: 'GlyphMatrix13', shippedSlug: 'glyph-matrix', status: 'stable', nativeTarget: 'GlyphMatrix13', note: '13×13 circular grid (121 LEDs)' },
      { slug: 'glyph-cell', name: 'GlyphCell', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Individual LED cell' },
      { slug: 'glyph-pattern-preview', name: 'GlyphPatternPreview', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Static pattern preview' },
      { slug: 'glyph-pattern-picker', name: 'GlyphPatternPicker', shippedSlug: 'glyph-matrix', status: 'stable', note: '8-preset selector' },
      { slug: 'glyph-progress', name: 'GlyphProgress', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Circular matrix progress' },
      { slug: 'glyph-animator', name: 'GlyphAnimator', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Animated glyph sequences' },
      { slug: 'glyph-editor', name: 'GlyphEditor', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Interactive grid editor' },
      { slug: 'glyph-timeline', name: 'GlyphTimeline', shippedSlug: 'glyph-matrix', status: 'stable', note: 'Animation frame timeline' },
    ],
  },
  {
    familyNumber: 15,
    category: 'Dotted UI',
    track: 'exclusive',
    priority: 'P0',
    items: [
      { slug: 'dot-icon', name: 'DotIcon', shippedSlug: 'dot-icon', status: 'stable', nativeTarget: 'DotIcon', note: 'Custom 9×9 dotted icon renderer' },
      { slug: 'dot-text', name: 'DotText', shippedSlug: 'dot-text', status: 'stable', note: 'Dot-matrix typography' },
      { slug: 'dot-loader', name: 'DotLoader', shippedSlug: 'skeleton', status: 'stable', note: 'Animated 3×3 dotted loader' },
      { slug: 'dot-counter', name: 'DotCounter', shippedSlug: 'dot-text', status: 'stable', note: 'Numeric dot display' },
      { slug: 'dot-progress', name: 'DotProgress', shippedSlug: 'dot-text', status: 'stable', note: 'Dotted progress bar' },
      { slug: 'dot-matrix-clock', name: 'DotMatrixClock', shippedSlug: 'dot-matrix-clock', status: 'stable', note: 'Dot-based clock display' },
    ],
  },
  {
    familyNumber: 16,
    category: 'Hardware-Inspired',
    track: 'exclusive',
    priority: 'P0',
    items: [
      { slug: 'rotary-knob', name: 'RotaryKnob', shippedSlug: 'rotary-knob', status: 'stable', note: 'Circular adjustment control' },
      { slug: 'segmented-bar', name: 'SegmentedBar', shippedSlug: 'progress', status: 'stable', note: 'Segmented level indicator' },
      { slug: 'led-indicator', name: 'LEDIndicator', shippedSlug: 'hardware-kit', status: 'stable', note: 'Illuminated state indicator' },
      { slug: 'signal-meter', name: 'SignalMeter', shippedSlug: 'hardware-kit', status: 'stable', note: 'Signal-strength display' },
      { slug: 'quick-setting-tile', name: 'QuickSettingTile', shippedSlug: 'quick-settings', status: 'stable', note: 'Hardware-style setting tile' },
      { slug: 'stepper', name: 'Stepper', shippedSlug: 'stepper', status: 'stable', note: 'Multi-stage progress/input control' },
    ],
  },
];

function toPascalNativeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9]+/g, '');
}

/**
 * Complete 16-family, 136-component public inventory with 100% React Native target mapping.
 */
export const COMPLETE_INVENTORY_GROUPS: RoadmapGroup[] = [
  ...REFERENCE_ROADMAP_GROUPS,
  ...NOTHING_EXCLUSIVE_GROUPS,
].map((group) => ({
  ...group,
  items: group.items.map((item) => ({
    ...item,
    nativeTarget: item.nativeTarget ?? toPascalNativeName(item.name),
  })),
}));

/**
 * Backwards-compatible summary list of Nothing signature additions (all 22 exclusive components).
 */
export const NOTHING_SIGNATURE_ADDITIONS = NOTHING_EXCLUSIVE_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    slug: item.slug,
    title: item.name,
    family: group.category,
    note: item.note ?? '',
    status: item.status,
    native: 'stable' as const,
    shippedSlug: item.shippedSlug,
  })),
);

/**
 * D. Showcase-only compositions (5) — rendered in apps/ui only, not yet separate public exports.
 */
export const SHOWCASE_ONLY_COMPOSITIONS = [
  { id: 'simulated-clock', title: 'Simulated Clock', description: 'Live dot-matrix digital clock composition with blinking seconds diode.' },
  { id: 'audio-battery-card', title: 'Audio & Battery Status Card', description: 'Simulated Ear / wireless audio battery status with hardware percentage rings.' },
  { id: 'weather-card', title: 'Weather Card', description: 'Monochrome weather condition card with 9×9 environment dot icons.' },
  { id: 'glyph-countdown-timer', title: 'Glyph Countdown Timer', description: 'Countdown timer driving a circular 25×25 Glyph Matrix progress ring.' },
  { id: 'quick-settings-panel', title: 'Quick Settings Panel', description: 'Nothing OS inspired multi-tile connectivity and audio quick settings grid.' },
] as const;

/**
 * E. First-wave React Native component targets (12) — not double-counted in the 136 total.
 */
export interface NativeWaveTarget {
  nativeName: string;
  webCounterpart: string;
  webSlug: string;
  status: 'stable' | 'beta' | 'alpha' | 'planned';
  packageName: 'nthgui/native';
}

export const NATIVE_FIRST_WAVE_TARGETS: readonly NativeWaveTarget[] = [
  { nativeName: 'Text', webCounterpart: 'Typography', webSlug: 'dot-text', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Button', webCounterpart: 'Button', webSlug: 'button', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Card', webCounterpart: 'Card', webSlug: 'card', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Input', webCounterpart: 'Input', webSlug: 'input', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Badge', webCounterpart: 'Badge', webSlug: 'avatar', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Separator', webCounterpart: 'Separator', webSlug: 'breadcrumb', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Switch', webCounterpart: 'Switch', webSlug: 'switch', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Progress', webCounterpart: 'Progress', webSlug: 'progress', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'Skeleton', webCounterpart: 'Skeleton', webSlug: 'skeleton', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'GlyphMatrix13', webCounterpart: 'GlyphMatrix13', webSlug: 'glyph-matrix', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'GlyphMatrix25', webCounterpart: 'GlyphMatrix25', webSlug: 'glyph-matrix', status: 'stable', packageName: 'nthgui/native' },
  { nativeName: 'DotIcon', webCounterpart: 'DotIcon', webSlug: 'dot-icon', status: 'stable', packageName: 'nthgui/native' },
] as const;

export function countReferenceRoadmapEntries(): { total: number; shipped: number; planned: number } {
  let total = 0;
  let shipped = 0;
  let planned = 0;
  for (const group of REFERENCE_ROADMAP_GROUPS) {
    for (const item of group.items) {
      total++;
      if (item.status === 'planned') planned++;
      else shipped++;
    }
  }
  return { total, shipped, planned };
}

export function countCompleteInventory(): {
  total: number;
  standard: number;
  exclusive: number;
  families: number;
  shipped: number;
  planned: number;
} {
  let standard = 0;
  let exclusive = 0;
  let shipped = 0;
  let planned = 0;

  for (const group of COMPLETE_INVENTORY_GROUPS) {
    for (const item of group.items) {
      if (group.track === 'standard') standard++;
      else exclusive++;
      if (item.status === 'planned') planned++;
      else shipped++;
    }
  }

  return {
    total: standard + exclusive,
    standard,
    exclusive,
    families: COMPLETE_INVENTORY_GROUPS.length,
    shipped,
    planned,
  };
}
