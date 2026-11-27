export type LoaderVariant = 'normal' | 'dots' | 'bars' | 'pulse';
export type LoadingPosition = 'start' | 'end' | 'replace';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export type LoadingArchetype =
  | 'async-action'
  | 'async-input'
  | 'async-navigation'
  | 'data-skeleton'
  | 'hardware-sync'
  | 'loader-primitive';

export interface LoadingConfigState {
  variant: LoaderVariant;
  skeletonAnimation: SkeletonAnimation;
  previewLoading: boolean;
}

export interface ComponentLoadingProfile {
  slug: string;
  archetype: LoadingArchetype;
  archetypeLabel: string;
  pendingCopy: string;
  triggerHint: string;
  usesSkeleton: boolean;
}

export const LOADER_VARIANTS: readonly LoaderVariant[] = [
  'normal',
  'dots',
  'bars',
  'pulse',
] as const;

export const LOADING_POSITIONS: readonly LoadingPosition[] = [
  'start',
  'end',
  'replace',
] as const;

export const DEFAULT_LOADER_VARIANT: LoaderVariant = 'normal';

export const DEFAULT_LOADING_CONFIG: LoadingConfigState = {
  variant: DEFAULT_LOADER_VARIANT,
  skeletonAnimation: 'shimmer',
  previewLoading: false,
};

export function resolveLoaderVariant(
  propVariant?: LoaderVariant,
  contextVariant?: LoaderVariant,
): LoaderVariant {
  if (propVariant && LOADER_VARIANTS.includes(propVariant)) {
    return propVariant;
  }
  if (contextVariant && LOADER_VARIANTS.includes(contextVariant)) {
    return contextVariant;
  }
  return DEFAULT_LOADER_VARIANT;
}

export function resolveLoadingFlag(
  propLoading?: boolean,
  contextPreviewLoading?: boolean,
): boolean {
  if (propLoading === true) return true;
  if (propLoading === false) return Boolean(contextPreviewLoading);
  return Boolean(contextPreviewLoading);
}

const ARCHETYPE_LABELS: Record<LoadingArchetype, string> = {
  'async-action': 'Async Action & Mutation',
  'async-input': 'Async Input & Validation',
  'async-navigation': 'Async Navigation & View Switch',
  'data-skeleton': 'Data Display & Skeleton Shimmer',
  'hardware-sync': 'Hardware, Media & Overlay Sync',
  'loader-primitive': 'Loader & Progress Primitive',
};

function profile(
  slug: string,
  archetype: LoadingArchetype,
  pendingCopy: string,
  triggerHint: string,
  usesSkeleton = false,
): ComponentLoadingProfile {
  return {
    slug,
    archetype,
    archetypeLabel: ARCHETYPE_LABELS[archetype],
    pendingCopy,
    triggerHint,
    usesSkeleton,
  };
}

export const COMPONENT_LOADING_PROFILES: Record<string, ComponentLoadingProfile> = {
  // Archetype A — Async Action & Mutation Controls (12)
  button: profile('button', 'async-action', 'Processing...', 'Click any button to trigger async loading'),
  switch: profile('switch', 'async-action', 'Saving...', 'Toggle a switch to run async persistence'),
  checkbox: profile('checkbox', 'async-action', 'Updating...', 'Click checkbox or radio to save preference'),
  'copy-field': profile('copy-field', 'async-action', 'Signing...', 'Click Copy to fetch & copy token'),
  toolbar: profile('toolbar', 'async-action', 'Syncing...', 'Click Export or Sync in toolbar'),
  'quick-settings': profile('quick-settings', 'async-action', 'Connecting...', 'Tap any tile for hardware handshake'),
  'hardware-kit': profile('hardware-kit', 'async-action', 'Scanning...', 'Toggle QuickSettingTile or scan signal'),
  dialog: profile('dialog', 'async-action', 'Pairing...', 'Open Dialog and click Confirm'),
  drawer: profile('drawer', 'async-action', 'Saving...', 'Open Bottom Sheet and click Save Schedule'),
  'dropdown-menu': profile('dropdown-menu', 'async-action', 'Running...', 'Choose an action from the menu'),
  'context-menu': profile('context-menu', 'async-action', 'Executing...', 'Trigger a context menu action'),
  toast: profile('toast', 'async-action', 'Syncing firmware...', 'Trigger Loading Toast for async resolution'),

  // Archetype B — Async Input, Validation & Lookup Controls (12)
  input: profile('input', 'async-input', 'Validating...', 'Type or toggle Loading for inline validation spinner'),
  combobox: profile('combobox', 'async-input', 'Searching...', 'Type to trigger async option lookup'),
  select: profile('select', 'async-input', 'Loading options...', 'Select a profile to sync remote config'),
  command: profile('command', 'async-input', 'Running command...', 'Select a command to execute asynchronously'),
  'otp-input': profile('otp-input', 'async-input', 'Verifying code...', 'Enter 6th digit to trigger auto-verification'),
  dropzone: profile('dropzone', 'async-input', 'Uploading...', 'Drop files or run simulated upload queue'),
  'tag-input': profile('tag-input', 'async-input', 'Validating tag...', 'Add a tag to run async validation'),
  'date-time-picker': profile('date-time-picker', 'async-input', 'Loading slots...', 'Select a date to load available time slots', true),
  'number-input': profile('number-input', 'async-input', 'Syncing...', 'Adjust stepper to sync value'),
  slider: profile('slider', 'async-input', 'Committing...', 'Adjust slider to commit setting'),
  'rotary-knob': profile('rotary-knob', 'async-input', 'Calibrating...', 'Drag or nudge knob to sync gain'),
  rating: profile('rating', 'async-input', 'Saving score...', 'Click a rating dot to submit score'),

  // Archetype C — Navigation & Async View Transitions (9)
  tabs: profile('tabs', 'async-navigation', 'Loading view...', 'Switch tabs to preview async panel transition', true),
  'segmented-control': profile('segmented-control', 'async-navigation', 'Switching...', 'Switch segment to load filtered slice'),
  pagination: profile('pagination', 'async-navigation', 'Loading page...', 'Click a page number to fetch page'),
  accordion: profile('accordion', 'async-navigation', 'Loading section...', 'Expand an item to load section body', true),
  'tree-view': profile('tree-view', 'async-navigation', 'Fetching nodes...', 'Select or expand a branch to load nodes'),
  sidebar: profile('sidebar', 'async-navigation', 'Loading workspace...', 'Toggle Loading for sidebar skeleton rows', true),
  'table-of-contents': profile('table-of-contents', 'async-navigation', 'Indexing headings...', 'Toggle Loading for TOC rail shimmer', true),
  stepper: profile('stepper', 'async-navigation', 'Validating step...', 'Click a step to validate before advancing'),
  breadcrumb: profile('breadcrumb', 'async-navigation', 'Resolving path...', 'Toggle Loading for breadcrumb segment shimmer', true),

  // Archetype D — Data Displays, Charts & Workflows (12)
  'data-table': profile('data-table', 'data-skeleton', 'Refreshing rows...', 'Click Refresh or toggle Loading for row skeletons', true),
  card: profile('card', 'data-skeleton', 'Loading card...', 'Toggle Loading for card & list skeleton', true),
  'metric-card': profile('metric-card', 'data-skeleton', 'Fetching KPI...', 'Click +12 or toggle Loading for KPI skeletons', true),
  'metric-grid': profile('metric-grid', 'data-skeleton', 'Refreshing telemetry...', 'Click Refresh Sample for 4-column telemetry shimmer', true),
  charts: profile('charts', 'data-skeleton', 'Rendering series...', 'Toggle Loading for chart bar/ring skeletons', true),
  'sparkline-strip': profile('sparkline-strip', 'data-skeleton', 'Loading timeframe...', 'Switch 24H / 7D / 30D to load telemetry series', true),
  'radar-chart': profile('radar-chart', 'data-skeleton', 'Recalculating...', 'Switch hardware profile to load radar benchmark', true),
  calendar: profile('calendar', 'data-skeleton', 'Checking dates...', 'Change month or toggle Loading for availability shimmer', true),
  timeline: profile('timeline', 'data-skeleton', 'Loading history...', 'Click Load older events or toggle Loading', true),
  'sortable-board': profile('sortable-board', 'data-skeleton', 'Saving order...', 'Move a card to trigger persistence indicator'),
  'productivity-kit': profile('productivity-kit', 'data-skeleton', 'Persisting...', 'Reorder or toggle checklist item to save'),
  chat: profile('chat', 'data-skeleton', 'Sending...', 'Send a message to see typing/sending bubble'),

  // Archetype E — Hardware, Media & Overlay Previews (8)
  'dot-matrix-clock': profile('dot-matrix-clock', 'hardware-sync', 'Syncing NTP...', 'Click Sync NTP or switch timezone'),
  'earbuds-battery': profile('earbuds-battery', 'hardware-sync', 'Scanning BLE...', 'Click Scan / Reconnect for discovery state'),
  'weather-matrix': profile('weather-matrix', 'hardware-sync', 'Updating forecast...', 'Click Refresh Forecast or switch condition', true),
  'media-kit': profile('media-kit', 'hardware-sync', 'Buffering...', 'Press Play to buffer audio or locate GPS'),
  popover: profile('popover', 'hardware-sync', 'Loading details...', 'Open Popover and click Refresh policy'),
  'hover-card': profile('hover-card', 'hardware-sync', 'Fetching metadata...', 'Open Hover Card with Loading toggled', true),
  alert: profile('alert', 'hardware-sync', 'Checking firmware...', 'Toggle Loading for pending status banner'),
  avatar: profile('avatar', 'hardware-sync', 'Applying filter...', 'Click a filter chip or toggle Loading for avatar skeletons', true),

  // Archetype F — Loaders, Progress & Visual Primitives (7)
  skeleton: profile('skeleton', 'loader-primitive', 'Loading...', 'Switch between Normal (default), Dots, Bars, and Pulse loaders', true),
  progress: profile('progress', 'loader-primitive', 'Processing...', 'Toggle Loading for indeterminate progress sweep'),
  'glyph-matrix': profile('glyph-matrix', 'loader-primitive', 'Booting LEDs...', 'Toggle Loading for Glyph scanning sequence'),
  'dot-icon': profile('dot-icon', 'loader-primitive', 'Spinning icon...', 'Toggle Loading for inline icon spin/pulse'),
  'dot-text': profile('dot-text', 'loader-primitive', 'Syncing readout...', 'Toggle Loading for indeterminate DotProgress'),
  'motion-kit': profile('motion-kit', 'loader-primitive', 'Transitioning...', 'Toggle Loading for calibrated shimmer motion'),
  'brand-logo': profile('brand-logo', 'loader-primitive', 'Starting...', 'Toggle Loading for subtle splash pulse'),

  // Complete 136/136 Parity Additions (28 modules)
  form: profile('form', 'async-input', 'Submitting form...', 'Submit validated fields to run async persistence'),
  'native-select': profile('native-select', 'async-input', 'Syncing option...', 'Change native select option to commit state'),
  questionnaire: profile('questionnaire', 'async-input', 'Saving responses...', 'Step through questions and submit survey'),
  'layer-dialog': profile('layer-dialog', 'async-action', 'Opening layer...', 'Open nested confirmation layer to commit action'),
  menubar: profile('menubar', 'async-action', 'Executing command...', 'Pick a command from File, Edit, or View menu'),
  'navigation-menu': profile('navigation-menu', 'async-navigation', 'Loading route...', 'Open mega-menu panel and select destination'),
  'layer-card': profile('layer-card', 'data-skeleton', 'Hydrating layers...', 'Switch stacked card layers or inspect metadata', true),
  marker: profile('marker', 'hardware-sync', 'Locating markers...', 'Click coordinate pins to inspect hardware node status'),
  carousel: profile('carousel', 'async-navigation', 'Loading slide...', 'Navigate slides or toggle autoplay transitions', true),
  'resizable-panels': profile('resizable-panels', 'async-navigation', 'Resizing layout...', 'Drag or nudge split divider to adjust panes'),
  'scroll-area': profile('scroll-area', 'data-skeleton', 'Loading entries...', 'Scroll or filter monospace log viewport', true),
  'aspect-ratio': profile('aspect-ratio', 'data-skeleton', 'Framing media...', 'Switch aspect ratio preset to recompute frame', true),
  grid: profile('grid', 'async-navigation', 'Reflowing grid...', 'Switch column count and gap density'),
  direction: profile('direction', 'async-navigation', 'Switching dir...', 'Toggle LTR and RTL reading direction'),
  'message-scroller': profile('message-scroller', 'data-skeleton', 'Syncing transcript...', 'Stream new messages or jump to latest'),
  'pie-chart': profile('pie-chart', 'data-skeleton', 'Computing slices...', 'Inspect segment proportions and totals', true),
  timeseries: profile('timeseries', 'data-skeleton', 'Querying range...', 'Switch timeframe window to re-sample series', true),
  sankey: profile('sankey', 'data-skeleton', 'Tracing flows...', 'Hover or select flow bands to inspect throughput', true),
  'map-chart': profile('map-chart', 'data-skeleton', 'Polling regions...', 'Select regional nodes to inspect edge latency', true),
  flow: profile('flow', 'data-skeleton', 'Evaluating graph...', 'Click nodes to trace directed execution pipeline', true),
  'custom-chart': profile('custom-chart', 'data-skeleton', 'Rendering layers...', 'Toggle composite bar, trendline, and threshold layers', true),
  'audio-recorder': profile('audio-recorder', 'hardware-sync', 'Encoding take...', 'Record voice memo and save waveform take'),
  'video-recorder': profile('video-recorder', 'hardware-sync', 'Capturing clip...', 'Toggle recording shutter and frame rate presets'),
  'camera-capture': profile('camera-capture', 'hardware-sync', 'Processing frame...', 'Fire shutter to capture viewfinder frame'),
  'media-studio': profile('media-studio', 'hardware-sync', 'Rendering timeline...', 'Scrub multi-track timeline and toggle mute/solo'),
  'media-viewer': profile('media-viewer', 'hardware-sync', 'Decoding asset...', 'Zoom, inspect EXIF telemetry, and step assets', true),
  editor: profile('editor', 'async-input', 'Autosaving doc...', 'Apply formatting blocks and edit markdown source'),
  'calendar-canvas': profile('calendar-canvas', 'data-skeleton', 'Syncing schedule...', 'Click time slots to create or move schedule blocks', true),
  'search-bar': profile('search-bar', 'async-input', 'Indexing results...', 'Type a query, switch scopes, or trigger voice search'),

  // Clock Varieties Suite & Promoted Roadmap Widgets (20 modules)
  'analog-clock': profile('analog-clock', 'hardware-sync', 'Calibrating escapement...', 'Switch dial faces, timezone, or mechanical sweep'),
  'flip-clock': profile('flip-clock', 'hardware-sync', 'Syncing split-flaps...', 'Toggle 12h/24h format or seconds drum'),
  'binary-dot-clock': profile('binary-dot-clock', 'hardware-sync', 'Clocking bit register...', 'Switch BCD 6×4 vs Pure Binary 3×6 modes'),
  'word-clock': profile('word-clock', 'hardware-sync', 'Illuminating phrase plate...', 'Step +5m preview or toggle grid mask'),
  'radial-clock': profile('radial-clock', 'hardware-sync', 'Aligning orbital rings...', 'Switch Orbital, Concentric Arcs, and Solar Horizon faces'),
  'clock-collection': profile('clock-collection', 'hardware-sync', 'Syncing master oscillator...', 'Filter clock families or change shared timezone'),
  'stopwatch-timer': profile('stopwatch-timer', 'hardware-sync', 'Arming quartz timer...', 'Start stopwatch laps or switch to countdown presets'),
  'world-clock-deck': profile('world-clock-deck', 'hardware-sync', 'Polling world zones...', 'Scrub ±12h meeting overlap offset across cities'),
  'agenda-ticker': profile('agenda-ticker', 'data-skeleton', 'Syncing calendar...', 'Switch upcoming event, snooze +5m, or copy room link', true),
  'pedometer-ring': profile('pedometer-ring', 'hardware-sync', 'Reading step sensor...', 'Log +500 steps, toggle km/mi, or change daily goal'),
  'battery-health-hub': profile('battery-health-hub', 'hardware-sync', 'Polling power cells...', 'Toggle charging state across Phone, Earbuds, Watch, and Laptop'),
  'screen-time-pulse': profile('screen-time-pulse', 'data-skeleton', 'Aggregating focus...', 'Toggle Flip-to-Glyph quiet mode or log category minutes', true),
  'network-speed-radar': profile('network-speed-radar', 'hardware-sync', 'Running RF sweep...', 'Switch Wi-Fi 7 / 5G UW / LTE profiles or trigger diagnostic test'),
  'podcast-mini-player': profile('podcast-mini-player', 'hardware-sync', 'Buffering chapter...', 'Play/pause, cycle 1×–2× speed, or jump chapters'),
  'voice-memo-transcriber': profile('voice-memo-transcriber', 'hardware-sync', 'Transcribing audio...', 'Record waveform audio, add timestamp markers, or copy transcript'),
  'photo-frame-dither': profile('photo-frame-dither', 'hardware-sync', 'Dithering halftone...', 'Cycle monochrome frames or toggle fine/coarse/inverted dither'),
  'pomodoro-focus-card': profile('pomodoro-focus-card', 'hardware-sync', 'Starting focus sprint...', 'Switch Focus/Break/Rest modes or toggle Glyph DND'),
  'quick-notes-pad': profile('quick-notes-pad', 'async-input', 'Saving note...', 'Add checklist tasks, toggle pin, or copy Markdown'),
  'habit-matrix-tracker': profile('habit-matrix-tracker', 'data-skeleton', 'Computing streaks...', 'Toggle 90-day matrix dots or switch tracked habits', true),
  'unit-fx-converter': profile('unit-fx-converter', 'async-input', 'Refreshing rates...', 'Switch converter category, edit amount, or invert units'),
  'calendar-widget': profile('calendar-widget', 'data-skeleton', 'Loading month matrix...', 'Select dates, drag magnetic hover reticle, or switch Single/Range mode', true),
  'nothing-analog-clock': profile('nothing-analog-clock', 'hardware-sync', 'Calibrating magnetic detent...', 'Customize ring tick density, style, Doto numerals, or stutter snap'),
};

export function getComponentLoadingProfile(slug: string): ComponentLoadingProfile {
  return (
    COMPONENT_LOADING_PROFILES[slug] ??
    profile(slug, 'async-action', 'Loading...', 'Toggle Loading in toolbar to inspect busy state')
  );
}
