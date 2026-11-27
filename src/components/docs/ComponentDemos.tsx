import * as React from 'react';
import { Heart, Plus, Search, Sun } from 'lucide-react';
import { NothingButton } from '@/components/nothing/Button';
import {
  CopyField,
  NothingInput,
  NothingSearchInput,
  NothingTextarea,
} from '@/components/nothing/Input';
import { REGEX_VALIDATION_PRESETS } from '@nothing-ui/ui';
import {
  NothingCheckbox,
  NothingNumberInput,
  NothingOTPInput,
  NothingRadioGroup,
  NothingRating,
  NothingSegmentedControl,
  NothingSlider,
  NothingSwitch,
  NothingToggleGroup,
  RotaryKnob,
} from '@/components/nothing/Controls';
import {
  NothingAccordion,
  NothingCollapsible,
  NothingCommandInline,
  NothingDropdownMenu,
  NothingPagination,
  NothingSelect,
  NothingTabs,
  NothingTreeView,
} from '@/components/nothing/Navigation';
import {
  NothingDialogDemo,
  NothingDrawerDemo,
  NothingPopoverTooltipDemo,
  appToaster,
} from '@/components/nothing/Overlays';
import {
  DotLoader,
  InteractiveChipsDemo,
  NothingAlert,
  NothingAvatarGroup,
  NothingBanner,
  NothingBreadcrumb,
  NothingCodeBlock,
  NothingEmptyState,
  NothingKbd,
  NothingMeter,
  NothingProgress,
  NothingSeparator,
  NothingSkeleton,
  NothingStepper,
  SegmentedBar,
} from '@/components/nothing/Feedback';
import {
  ActivityStream,
  LiveCounter,
  MetricCard,
  NothingCalendar,
  NothingCard,
  NothingDataTable,
  NothingDropzone,
  NothingTimeline,
} from '@/components/nothing/DataDisplay';
import { GlyphMatrix } from '@/components/nothing/GlyphMatrix';
import { DotIcon } from '@/components/nothing/DotIcon';
import {
  GLYPH_PRESETS,
  buildPresetMatrix,
  clearGlyphMatrix,
  countAddressableGlyphDots,
  countLitGlyphDots,
  toggleGlyphCell,
  type GlyphPresetId,
} from '@/lib/glyph-matrix';
import {
  DOT_ICON_NAMES,
  buildDotIconUsageSnippet,
  type DotIconName,
} from '@/lib/dot-icons';
import { cn } from '@/lib/utils';
import {
  NothingLoader,
  useAsyncAction,
  useLoadingConfig,
  type LoaderVariant,
} from '@nothing-ui/ui';

function ConfigurableLoaderShowcase() {
  const config = useLoadingConfig();
  const [localVariant, setLocalVariant] = React.useState<LoaderVariant>(config.variant);
  const [label, setLabel] = React.useState('Loading');

  React.useEffect(() => {
    setLocalVariant(config.variant);
  }, [config.variant]);

  const variants: Array<{ id: LoaderVariant; label: string }> = [
    { id: 'normal', label: 'Normal (Default)' },
    { id: 'dots', label: 'Dots' },
    { id: 'bars', label: 'Bars' },
    { id: 'pulse', label: 'Pulse' },
  ];

  return (
    <div className="grid w-full gap-6 md:grid-cols-2">
      <div className="space-y-5">
        <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Configurable Loader
            </span>
            <span className="font-mono text-[10px] text-[var(--nt-secondary)]">
              default: normal
            </span>
          </div>

          <div
            role="group"
            aria-label="Loader variant switcher"
            className="flex flex-wrap gap-1.5"
          >
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                aria-pressed={localVariant === v.id}
                data-testid={`loader-showcase-${v.id}`}
                onClick={() => {
                  setLocalVariant(v.id);
                  setLabel(v.id === 'normal' ? 'Loading' : v.id === 'dots' ? 'Syncing' : v.id === 'bars' ? 'Streaming' : 'Polling');
                }}
                className={cn(
                  'rounded-md border px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap',
                  localVariant === v.id
                    ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line-2)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-bg)] p-4 text-center">
            {(['sm', 'md', 'lg'] as const).map((sz) => (
              <div key={sz} className="flex flex-col items-center justify-center gap-2.5 py-2">
                <div className="flex h-7 items-center justify-center">
                  <NothingLoader variant={localVariant} size={sz} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)] whitespace-nowrap">
                  {sz}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
            <span className="whitespace-nowrap">
              Variant: <code className="text-[var(--nt-display)]">{localVariant}</code> · {label}
            </span>
            <DotLoader label="DOT MATRIX" />
          </div>
        </div>

        <NothingSkeleton />
      </div>

      <NothingEmptyState
        title="No agents running"
        description="Create a workflow node or install a component block from the registry."
        actionLabel="Create Node"
        onAction={() => appToaster('Node initialized', { description: 'Ready for configuration.' })}
      />
    </div>
  );
}

function ToastLoadingDemo() {
  const { loading, trigger } = useAsyncAction(950);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <NothingButton
        variant="primary"
        loading={loading}
        loadingText="Syncing..."
        onClick={() => {
          appToaster('Syncing firmware...', {
            description: 'Verifying SHA-256 package signature.',
          });
          trigger(() => {
            appToaster('Firmware synced', {
              description: 'Nothing OS tokens deployed cleanly.',
              action: {
                label: 'Undo',
                onAction: () => appToaster('Reverted', { description: 'Prior snapshot restored.' }),
              },
            });
          });
        }}
      >
        Trigger Loading Toast
      </NothingButton>
      <NothingButton
        variant="outline"
        onClick={() =>
          appToaster('Changes synced', {
            description: 'Registry tokens deployed cleanly.',
            action: {
              label: 'Undo',
              onAction: () => appToaster('Reverted', { description: 'Prior snapshot restored.' }),
            },
          })
        }
      >
        Instant Sync Toast
      </NothingButton>
      <NothingButton
        variant="signal"
        onClick={() =>
          appToaster('Signal Alert', {
            description: 'Glyph priority interrupt triggered on channel 3.',
          })
        }
      >
        Trigger Signal Toast
      </NothingButton>
    </div>
  );
}

function InteractiveGlyphStudio() {
  const [preset, setPreset] = React.useState<GlyphPresetId>('power');
  const [cells, setCells] = React.useState(() => buildPresetMatrix('power'));
  const [paintMode, setPaintMode] = React.useState<'on' | 'signal'>('on');

  const selectPreset = (id: GlyphPresetId) => {
    setPreset(id);
    setCells(buildPresetMatrix(id));
  };

  const litCount = countLitGlyphDots(cells);
  const totalCount = countAddressableGlyphDots();

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between w-full">
      <div className="flex flex-col items-center gap-3">
        <GlyphMatrix
          cells={cells}
          size={220}
          interactive
          onCellToggle={(idx) => setCells((prev) => toggleGlyphCell(prev, idx, paintMode))}
          label="Interactive 25x25 Glyph Matrix Editor"
        />
        <div
          className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]"
          data-testid="glyph-led-count"
        >
          {litCount} / {totalCount} LEDs lit · Click dots to paint
        </div>
      </div>

      <div className="flex-1 space-y-5 max-w-md">
        <div>
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
            Canonical Presets
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GLYPH_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selectPreset(item.id)}
                className={cn(
                  'rounded-md border px-2.5 py-2 font-mono text-xs transition-colors cursor-pointer',
                  preset === item.id
                    ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line-2)] text-[var(--nt-primary)] hover:border-[var(--nt-display)]'
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <NothingSegmentedControl
            ariaLabel="LED paint color"
            value={paintMode}
            onValueChange={setPaintMode}
            options={[
              { value: 'on', label: 'White LED' },
              { value: 'signal', label: 'Signal Red' },
            ]}
          />
          <NothingButton
            variant="outline"
            size="sm"
            onClick={() => setCells((prev) => clearGlyphMatrix(prev))}
          >
            Clear Grid
          </NothingButton>
        </div>
      </div>
    </div>
  );
}

function InteractiveDotIconDemo() {
  const [selected, setSelected] = React.useState<DotIconName>('wifi');
  const [size, setSize] = React.useState(24);
  const [copied, setCopied] = React.useState(false);

  const snippet = buildDotIconUsageSnippet(selected, size);

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)]">
            <DotIcon name={selected} size={size} className="text-[var(--nt-display)]" />
          </div>
          <div>
            <div className="font-mono text-xs font-medium text-[var(--nt-display)]">{selected}</div>
            <div className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
              9×9 round-dot grid · {size}px
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[16, 24, 32, 40].map((px) => (
            <button
              key={px}
              type="button"
              onClick={() => setSize(px)}
              className={cn(
                'rounded-md border px-2.5 py-1 font-mono text-[11px] tabular-nums cursor-pointer',
                size === px
                  ? 'border-[var(--nt-inverse-bg)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'border-[var(--nt-line-2)] text-[var(--nt-secondary)]'
              )}
            >
              {px}px
            </button>
          ))}
          <NothingButton
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard?.writeText(snippet).catch(() => {});
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }}
          >
            {copied ? 'Copied JSX' : 'Copy JSX'}
          </NothingButton>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2 sm:grid-cols-7 md:grid-cols-9">
        {DOT_ICON_NAMES.map((iconName) => (
          <button
            key={iconName}
            type="button"
            onClick={() => setSelected(iconName)}
            aria-label={`Select ${iconName} icon`}
            className={cn(
              'flex flex-col items-center justify-center gap-1.5 rounded-lg border p-2.5 transition-colors cursor-pointer',
              selected === iconName
                ? 'border-[#D71921] bg-[#D71921]/10 text-[var(--nt-display)]'
                : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:border-[var(--nt-line-2)] hover:text-[var(--nt-display)]'
            )}
          >
            <DotIcon name={iconName} size={20} />
            <span className="font-mono text-[9px] truncate max-w-full">{iconName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function renderComponentDemo(componentId: string): React.ReactNode {
  switch (componentId) {
    case 'button':
      return (
        <div className="space-y-5 w-full">
          <div className="flex flex-wrap items-center gap-3">
            <NothingButton variant="primary">Primary Action</NothingButton>
            <NothingButton variant="outline">Outline</NothingButton>
            <NothingButton variant="signal">Signal Red</NothingButton>
            <NothingButton variant="ghost">Ghost Text</NothingButton>
            <NothingButton variant="primary" disabled>
              Disabled
            </NothingButton>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <NothingButton variant="primary" size="square" aria-label="Add item">
              <Plus className="h-4 w-4" />
            </NothingButton>
            <NothingButton variant="outline" size="icon" aria-label="Search">
              <Search className="h-4 w-4" />
            </NothingButton>
            <NothingButton variant="outline" size="icon" aria-label="Brightness">
              <Sun className="h-4 w-4" />
            </NothingButton>
            <NothingButton variant="outline" size="icon" aria-label="Favorite">
              <Heart className="h-4 w-4" />
            </NothingButton>
          </div>
        </div>
      );

    case 'input':
      return (
        <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
          <NothingInput
            label="Device Serial"
            defaultValue="NP3-481-A"
            validationRule={REGEX_VALIDATION_PRESETS.deviceSerial}
            description="Validates live against /^NP3-[A-Z0-9]{3}-[A-Z0-9]$/."
          />
          <NothingSearchInput label="Registry Filter" placeholder="Search components..." />
          <NothingInput
            label="Token Key"
            defaultValue="invalid_key"
            validationRule={REGEX_VALIDATION_PRESETS.tokenKey}
            validateOn="always"
          />
          <NothingTextarea
            label="Calibration Notes"
            placeholder="Record acoustic profile or LED pulse notes..."
          />
        </div>
      );

    case 'copy-field':
      return (
        <div className="w-full max-w-lg space-y-4">
          <CopyField
            value="npx nthgui add glyph-matrix"
            caption="Click to copy · shows inline spinner then confirms"
          />
          <CopyField value="npm install nthgui" />
        </div>
      );

    case 'otp-input':
      return <NothingOTPInput length={6} defaultValue="2048" />;

    case 'checkbox':
    case 'checkbox-radio':
      return (
        <div className="grid w-full max-w-xl gap-6 sm:grid-cols-2">
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Checkboxes
            </div>
            <div className="flex flex-col gap-2.5">
              <NothingCheckbox defaultChecked label="Enable Glyph Sync" />
              <NothingCheckbox defaultChecked label="Adaptive Refresh Rate" />
              <NothingCheckbox label="Developer Telemetry" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Radio Group
            </div>
            <NothingRadioGroup
              ariaLabel="Notification profile"
              defaultValue="essential"
              options={[
                { value: 'essential', label: 'Essential Alerts Only' },
                { value: 'all', label: 'All Matrix Events' },
                { value: 'silent', label: 'Silent Bedtime' },
              ]}
            />
          </div>
        </div>
      );

    case 'switch':
      return (
        <div className="w-full max-w-sm space-y-4">
          <NothingSwitch
            defaultChecked
            asyncToggle
            label="Glyph Interface"
            description="Click to toggle · simulates hardware handshake"
          />
          <NothingSwitch
            defaultChecked
            asyncToggle
            tone="signal"
            label="Live Voice Recorder"
            description="Signal Red recording indicator active"
          />
          <NothingSwitch
            asyncToggle
            label="Flip to Glyph"
            description="Place face-down to mute audio alerts"
          />
        </div>
      );

    case 'slider':
      return (
        <div className="w-full max-w-md space-y-6">
          <NothingSlider label="Glyph Brightness" defaultValue={72} unit="%" />
          <NothingSlider label="Haptic Intensity" defaultValue={40} step={10} unit="%" tone="signal" />
        </div>
      );

    case 'select':
      return <NothingSelect />;

    case 'number-input':
      return (
        <div className="flex flex-wrap items-end gap-6">
          <NothingNumberInput label="Pulse Repetitions" defaultValue={3} min={1} max={12} />
          <NothingNumberInput label="Frame Rate (Hz)" defaultValue={60} min={15} max={120} />
        </div>
      );

    case 'rating':
      return <NothingRating defaultValue={4} max={5} />;

    case 'dropzone':
    case 'file-dropzone':
      return (
        <div className="w-full max-w-md">
          <NothingDropzone />
        </div>
      );

    case 'rotary-knob':
      return (
        <div className="flex flex-wrap items-center gap-8">
          <RotaryKnob label="GAIN" defaultValue={50} />
          <RotaryKnob label="BASS" defaultValue={75} />
          <RotaryKnob label="TREBLE" defaultValue={35} />
        </div>
      );

    case 'tabs':
      return (
        <div className="w-full max-w-xl space-y-6">
          <NothingTabs
            variant="underline"
            defaultValue="overview"
            items={[
              {
                value: 'overview',
                label: 'Overview',
                content: (
                  <p className="text-sm leading-relaxed text-[var(--nt-secondary)]">
                    Built on nothing-ui Tabs with automatic roving tabindex, arrow-key switching, and ARIA tabpanel binding.
                  </p>
                ),
              },
              {
                value: 'logs',
                label: 'Logs',
                content: (
                  <p className="font-mono text-xs text-[var(--nt-secondary)]">
                    21:34 · All 60 primitive exports passed strict TypeScript verification.
                  </p>
                ),
              },
              {
                value: 'files',
                label: 'Files',
                content: (
                  <p className="font-mono text-xs text-[var(--nt-secondary)]">
                    Navigation.tsx · Controls.tsx · Overlays.tsx · GlyphMatrix.tsx
                  </p>
                ),
              },
            ]}
          />
          <NothingTabs
            variant="pill"
            defaultValue="dark"
            items={[
              {
                value: 'dark',
                label: 'OLED Dark',
                content: (
                  <p className="text-xs text-[var(--nt-muted)]">
                    Pure #000000 canvas paired with frosted #121212 glass surfaces.
                  </p>
                ),
              },
              {
                value: 'light',
                label: 'Paper Light',
                content: (
                  <p className="text-xs text-[var(--nt-muted)]">
                    Crisp #F4F4F4 architectural canvas with high-contrast #000000 display ink.
                  </p>
                ),
              },
            ]}
          />
        </div>
      );

    case 'segmented-control':
      return (
        <div className="flex flex-wrap items-center gap-6">
          <NothingSegmentedControl
            defaultValue="week"
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
            ]}
          />
          <NothingToggleGroup />
        </div>
      );

    case 'accordion':
      return (
        <div className="w-full max-w-xl space-y-5">
          <NothingAccordion />
          <NothingCollapsible />
        </div>
      );

    case 'breadcrumb':
      return (
        <div className="w-full max-w-lg space-y-6">
          <NothingBreadcrumb items={['Home', 'Registry', 'Navigation', 'Breadcrumb']} />
          <NothingSeparator label="Section Divider" />
        </div>
      );

    case 'pagination':
      return <NothingPagination pageCount={10} defaultPage={2} />;

    case 'command':
    case 'command-palette':
      return <NothingCommandInline />;

    case 'dropdown-menu':
      return <NothingDropdownMenu />;

    case 'tree-view':
      return <NothingTreeView />;

    case 'card':
    case 'cards-lists':
      return (
        <div className="grid w-full gap-4 sm:grid-cols-2">
          <NothingCard title="Ear (a) Telemetry" subtitle="Bluetooth 5.3 · LDAC Codec">
            <SegmentedBar label="Battery Reserve" total={16} filled={13} />
          </NothingCard>
          <NothingCard title="Module Queue" subtitle="3 active builds">
            <ul className="divide-y divide-[var(--nt-line)] font-mono text-xs">
              <li className="flex items-center justify-between py-2">
                <span>GlyphMatrix</span>
                <span className="text-[var(--nt-muted)]">25×25</span>
              </li>
              <li className="flex items-center justify-between py-2">
                <span>DotIcon</span>
                <span className="text-[var(--nt-muted)]">35 SVG</span>
              </li>
              <li className="flex items-center justify-between py-2">
                <span>RotaryKnob</span>
                <span className="text-[#D71921]">Active</span>
              </li>
            </ul>
          </NothingCard>
        </div>
      );

    case 'dialog':
      return <NothingDialogDemo />;

    case 'drawer':
      return <NothingDrawerDemo />;

    case 'popover':
    case 'popover-tooltip':
      return <NothingPopoverTooltipDemo />;

    case 'toast':
      return <ToastLoadingDemo />;

    case 'alert':
    case 'alerts-banner':
      return (
        <div className="w-full max-w-xl space-y-3">
          <NothingAlert
            tone="neutral"
            title="Firmware Ready"
            description="Nothing OS 3.2 package verified with SHA-256 checksum."
          />
          <NothingAlert
            tone="signal"
            title="Thermal Guard Active"
            description="Charging current throttled until back glass cools below 38°C."
          />
          <NothingBanner
            message="Nothing UI ships all 88 live modules (136 components) via a single nthgui package"
            actionLabel="Notify"
            onAction={() => appToaster('Registry Synced', { description: 'All primitives are up to date.' })}
          />
        </div>
      );

    case 'progress':
    case 'progress-stepper':
      return (
        <div className="w-full max-w-lg space-y-6">
          <NothingProgress label="Bundle Compilation" value={68} />
          <NothingMeter label="LED Thermal Budget" value={42} max={100} />
          <SegmentedBar label="Battery Cells" total={16} filled={12} />
          <NothingStepper steps={['Init', 'Tokens', 'Primitives', 'Ship']} initialStep={2} />
        </div>
      );

    case 'skeleton':
    case 'skeleton-loader':
      return <ConfigurableLoaderShowcase />;

    case 'data-table':
    case 'table':
      return (
        <div className="w-full">
          <NothingDataTable />
        </div>
      );

    case 'calendar':
      return <NothingCalendar defaultValue="2026-11-19" />;

    case 'timeline':
      return (
        <div className="grid w-full gap-6 md:grid-cols-2">
          <NothingTimeline />
          <ActivityStream />
        </div>
      );

    case 'metric-card':
    case 'metric-counter':
      return (
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <MetricCard label="Tokens" value="128K" delta="↑ 12% vs last week" positive />
          <MetricCard label="Errors" value="3" delta="↓ 40% reduction" positive />
          <LiveCounter label="Builds Verified" target={1482} />
        </div>
      );

    case 'avatar':
    case 'avatar-chips-kbd':
      return (
        <div className="w-full max-w-xl space-y-6">
          <NothingAvatarGroup initials={['NK', 'AL', 'MR']} overflowCount={5} />
          <InteractiveChipsDemo />
          <div className="flex items-center gap-2">
            <NothingKbd>⌘</NothingKbd>
            <NothingKbd>⇧</NothingKbd>
            <NothingKbd>K</NothingKbd>
            <span className="ml-2 font-mono text-xs text-[var(--nt-muted)]">Open command palette</span>
          </div>
          <NothingCodeBlock
            title="install.ts"
            code={`import { GlyphMatrix } from "nthgui/glyph"\n\nexport const panel = <GlyphMatrix preset="live" size={180} />`}
          />
        </div>
      );

    case 'glyph-matrix':
      return <InteractiveGlyphStudio />;

    case 'dot-icon':
    case 'dot-icons':
      return <InteractiveDotIconDemo />;

    default:
      return null;
  }
}
