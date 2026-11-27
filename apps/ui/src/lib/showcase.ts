export type ShowcaseCategory =
  | 'All'
  | 'Hardware OS'
  | 'Audio & Media'
  | 'Telemetry & Data'
  | 'Developer & SaaS'
  | 'Commerce & Pricing'
  | 'Auth & Forms'
  | 'Workspace';

export interface ShowcaseMeta {
  id: string;
  cliTarget: string;
  title: string;
  shortLabel: string;
  category: Exclude<ShowcaseCategory, 'All'>;
  kind: 'block' | 'widgets' | 'template';
  description: string;
  includedSlugs: string[];
  code: string;
}

export const SHOWCASE_CATEGORIES: readonly ShowcaseCategory[] = [
  'All',
  'Hardware OS',
  'Audio & Media',
  'Telemetry & Data',
  'Developer & SaaS',
  'Commerce & Pricing',
  'Auth & Forms',
  'Workspace',
];

export const SHOWCASE_CATALOG: readonly ShowcaseMeta[] = [
  {
    id: 'showcase-os-lockscreen',
    cliTarget: 'block-os-lockscreen',
    title: 'Nothing OS Lockscreen & Hardware Deck',
    shortLabel: 'OS Lockscreen Deck',
    category: 'Hardware OS',
    kind: 'block',
    description:
      'Complete Nothing OS hardware desktop pairing a live Dot Matrix Clock, Weather Matrix, Ear (3) Battery Rings, and 2×2 Quick Settings deck.',
    includedSlugs: ['dot-matrix-clock', 'weather-matrix', 'earbuds-battery', 'quick-settings'],
    code: `import { DotMatrixClock, WeatherMatrix, EarbudsBattery, QuickSettingsDeck } from "nthgui";

export function NothingOsLockscreenBlock() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-5 space-y-4">
        <DotMatrixClock format="24h" timezone="UTC" />
        <WeatherMatrix condition="clear" unit="C" />
      </div>
      <div className="lg:col-span-7 space-y-4">
        <EarbudsBattery left={88} right={84} caseLevel={62} ancMode="anc" />
        <QuickSettingsDeck />
      </div>
    </div>
  );
}`,
  },
  {
    id: 'showcase-widget-wall',
    cliTarget: 'showcase-widget-wall',
    title: 'Nothing OS Live Widget Wall (5 Compositions)',
    shortLabel: 'Live Widget Wall',
    category: 'Hardware OS',
    kind: 'widgets',
    description:
      'All 5 signature Nothing OS hardware widget compositions: Simulated Clock, Quick Settings Panel, Weather Card, Audio & Battery Status Card, and Glyph Countdown Timer.',
    includedSlugs: ['dot-text', 'quick-settings', 'weather-matrix', 'glyph-matrix', 'dot-icon'],
    code: `import { DotIcon } from "nthgui/icons";
import { GlyphMatrix } from "nthgui/glyph";
import { SegmentedBar, Button } from "nthgui";

export function NothingWidgetWall() {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {/* Dot Matrix Clock · Quick Settings · Weather Matrix */}
      {/* Ear (a) Battery SegmentedBar · 25x25 Glyph Countdown Timer */}
      <GlyphMatrix preset="live" size={146} />
      <SegmentedBar label="Earbuds" total={16} filled={14} />
      <Button variant="signal">Start Timer</Button>
      <DotIcon name="cloud" size={44} />
    </div>
  );
}`,
  },
  {
    id: 'showcase-camera-deck',
    cliTarget: 'showcase-camera-deck',
    title: 'Phone (3) Pro Camera & Optical Sensor Deck',
    shortLabel: 'Pro Camera Deck',
    category: 'Hardware OS',
    kind: 'template',
    description:
      'Manual camera control deck with optical focal-length switcher, ISO/Shutter/EV hardware sliders, live 13×13 Glyph fill-light ring, and async RAW capture trigger.',
    includedSlugs: ['slider', 'switch', 'glyph-matrix', 'button', 'dot-icon'],
    code: `import { Button, NothingSlider, NothingSwitch } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function ProCameraDeck() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-4">
        <NothingSlider label="ISO Sensitivity" defaultValue={400} min={50} max={3200} />
        <NothingSlider label="Exposure Comp (EV)" defaultValue={0} min={-20} max={20} />
        <Button variant="signal" loadingText="Capturing RAW...">Capture RAW</Button>
      </div>
      <div className="lg:col-span-5 space-y-4">
        <GlyphMatrix resolution={13} preset="power" size={136} />
        <NothingSwitch label="Glyph Ring Fill Light" defaultChecked />
      </div>
    </section>
  );
}`,
  },
  {
    id: 'showcase-audio-console',
    cliTarget: 'block-audio-console',
    title: 'Ear (3) Audio & ANC Console',
    shortLabel: 'Ear (3) Audio Console',
    category: 'Audio & Media',
    kind: 'block',
    description:
      'Interactive acoustic equalizer with 3-band hardware sliders, live frequency bars, Spatial Audio switches, and synced 13×13 Glyph Matrix.',
    includedSlugs: ['slider', 'switch', 'glyph-matrix', 'button'],
    code: `import { Button, NothingSlider, NothingSwitch } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function AudioConsoleBlock() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-7 space-y-4">
        <NothingSlider label="Sub Bass (60–120Hz)" defaultValue={68} unit="%" />
        <NothingSlider label="Vocal Mid (500Hz–1kHz)" defaultValue={54} unit="%" />
        <NothingSlider label="Air Treble (4kHz–8kHz)" defaultValue={76} unit="%" />
      </div>
      <div className="lg:col-span-5 space-y-4">
        <GlyphMatrix resolution={13} preset="sound" size={140} />
        <NothingSwitch label="Spatial Head Tracking" defaultChecked />
        <Button variant="signal">Save Acoustic Profile</Button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'showcase-glyph-focus',
    cliTarget: 'showcase-glyph-focus',
    title: 'Glyph Notification & Focus Composer',
    shortLabel: 'Glyph Focus Composer',
    category: 'Audio & Media',
    kind: 'template',
    description:
      'Configure Nothing OS Focus profiles, paint a custom 13×13 Glyph priority alert signature, toggle Flip-to-Glyph rules, and dispatch a live test interrupt.',
    includedSlugs: ['glyph-matrix', 'switch', 'button', 'toast'],
    code: `import { Button, NothingSwitch } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function GlyphFocusComposer() {
  return (
    <section className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-5 flex flex-col items-center gap-3">
        <GlyphMatrix resolution={13} preset="heart" interactive size={160} />
      </div>
      <div className="lg:col-span-7 space-y-4">
        <NothingSwitch label="Flip to Glyph" defaultChecked />
        <NothingSwitch label="Signal Red Urgent Bypass" tone="signal" defaultChecked />
        <Button variant="primary" loadingText="Applying Profile...">Apply Focus Profile</Button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'showcase-telemetry-ops',
    cliTarget: 'block-telemetry-ops',
    title: 'Fleet Telemetry & Operations Dashboard',
    shortLabel: 'Fleet Telemetry Ops',
    category: 'Telemetry & Data',
    kind: 'block',
    description:
      'Single-elevation operations console combining a 4-column KPI strip, timeframe Sparklines, interactive Sortable Data Table (search/sort/loading/empty states), and 6-axis Radar chart.',
    includedSlugs: ['metric-grid', 'sparkline-strip', 'data-table', 'radar-chart'],
    code: `import { HardwareKpiGrid, SparklineStrip, DataTable, RadarChart } from "nthgui";

export function FleetTelemetryBlock() {
  return (
    <div className="space-y-5">
      <HardwareKpiGrid />
      <SparklineStrip timeframe="24h" />
      <DataTable sortable searchable selectable />
      <RadarChart dataset="phone3" />
    </div>
  );
}`,
  },
  {
    id: 'showcase-developer-api',
    cliTarget: 'showcase-developer-api',
    title: 'Developer API & Webhook Console',
    shortLabel: 'Developer API Console',
    category: 'Developer & SaaS',
    kind: 'template',
    description:
      'Production developer console with API token rotation (async click-to-load), rate-limit SegmentedBar, live webhook ping dispatch, and skeleton loading mode.',
    includedSlugs: ['button', 'copy-field', 'switch', 'data-table', 'skeleton'],
    code: `import { Button, NothingSwitch, SegmentedBar } from "nthgui";

export function DeveloperApiConsole() {
  return (
    <section className="space-y-4">
      <SegmentedBar label="API Quota (74% used)" total={20} filled={15} />
      <NothingSwitch label="Webhook Auto-Retry (3×)" defaultChecked />
      <div className="flex gap-2">
        <Button variant="primary" loadingText="Dispatching...">Send Test Event</Button>
        <Button variant="outline" loadingText="Rotating...">Rotate Secret Key</Button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'showcase-hardware-store',
    cliTarget: 'showcase-hardware-store',
    title: 'Nothing Store Hardware Configurator',
    shortLabel: 'Store Configurator',
    category: 'Commerce & Pricing',
    kind: 'template',
    description:
      'Direct-to-consumer hardware configurator for Phone (3) with finish selection, storage capacity pricing, Ear (3) bundle toggle, quantity stepper, and async reservation flow.',
    includedSlugs: ['button', 'switch', 'number-input', 'glyph-matrix'],
    code: `import { Button, NothingSwitch } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function HardwareConfigurator() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5 flex items-center justify-center">
        <GlyphMatrix resolution={25} preset="power" size={184} />
      </div>
      <div className="lg:col-span-7 space-y-4">
        <NothingSwitch label="Bundle Ear (3) (+$129)" />
        <Button variant="signal" loadingText="Reserving unit...">Reserve Unit</Button>
      </div>
    </section>
  );
}`,
  },
  {
    id: 'showcase-passkey-auth',
    cliTarget: 'block-passkey-auth',
    title: 'Hardware Sign-In & Passkey OTP Flow',
    shortLabel: 'Passkey & OTP Auth',
    category: 'Auth & Forms',
    kind: 'block',
    description:
      'Monochrome split authentication shell with sensitive provisioning key toggle, 6-digit auto-advancing OTP input, async passkey verification, and live Glyph confirmation.',
    includedSlugs: ['input', 'otp-input', 'glyph-matrix', 'button'],
    code: `import { Button, Input, OtpInput } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";

export function PasskeyAuthBlock() {
  return (
    <form className="grid grid-cols-1 gap-5 md:grid-cols-12">
      <div className="md:col-span-5 flex items-center justify-center">
        <GlyphMatrix resolution={13} preset="power" size={124} />
      </div>
      <div className="md:col-span-7 space-y-4">
        <Input label="Work Email" type="email" />
        <OtpInput length={6} />
        <Button variant="signal" type="submit" loadingText="Verifying...">Verify Passkey</Button>
      </div>
    </form>
  );
}`,
  },
  {
    id: 'showcase-workspace-kanban',
    cliTarget: 'block-workspace-kanban',
    title: 'Workspace Settings & Sortable Task Shell',
    shortLabel: 'Workspace & Kanban',
    category: 'Workspace',
    kind: 'block',
    description:
      'Multi-view engineering workspace combining a drag-and-drop / keyboard Sortable Board with Combobox, Tag Input, and Date & Time Picker deployment controls.',
    includedSlugs: ['sortable-board', 'combobox', 'tag-input', 'date-time-picker'],
    code: `import { SortableBoard, Combobox, TagInput, DateTimePicker } from "nthgui";

export function WorkspaceKanbanBlock() {
  return (
    <div className="space-y-5">
      <SortableBoard />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Combobox placeholder="Target hardware..." />
        <DateTimePicker />
      </div>
      <TagInput />
    </div>
  );
}`,
  },
];

export function filterShowcaseItems(
  query: string,
  category: ShowcaseCategory = 'All',
): ShowcaseMeta[] {
  const q = query.trim().toLowerCase();
  return SHOWCASE_CATALOG.filter((item) => {
    if (category !== 'All' && item.category !== category) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.includedSlugs.some((slug) => slug.toLowerCase().includes(q))
    );
  });
}

export function countShowcasesByKind(): {
  total: number;
  blocks: number;
  widgets: number;
  templates: number;
} {
  let blocks = 0;
  let widgets = 0;
  let templates = 0;
  for (const item of SHOWCASE_CATALOG) {
    if (item.kind === 'block') blocks += 1;
    else if (item.kind === 'widgets') widgets += 1;
    else templates += 1;
  }
  return { total: SHOWCASE_CATALOG.length, blocks, widgets, templates };
}
