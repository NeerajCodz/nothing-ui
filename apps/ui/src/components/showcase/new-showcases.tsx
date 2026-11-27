import * as React from 'react';
import {
  Camera,
  Check,
  Copy,
  Key,
  Minus,
  PaperPlaneTilt,
  Plus,
  ShoppingBag,
  Sliders,
} from '@phosphor-icons/react';
import {
  Button,
  GlyphMatrix,
  NothingSlider,
  NothingSwitch,
  SegmentedBar,
  cn,
  useAsyncAction,
} from '@nothing-ui/ui';
import {
  AudioBatteryWidget,
  DotMatrixClockWidget,
  GlyphTimerWidget,
  QuickSettingsWidget,
  WeatherMatrixWidget,
} from '@/components/nothing/NothingWidgets';
import { appToaster } from '@/components/nothing/Overlays';

/* ── Showcase: Nothing OS Live Widget Wall (5 Moved Compositions) ─────────── */
export function LiveWidgetWallShowcase() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DotMatrixClockWidget />
        <QuickSettingsWidget />
        <WeatherMatrixWidget />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <AudioBatteryWidget />
        </div>
        <div className="lg:col-span-7">
          <GlyphTimerWidget />
        </div>
      </div>
    </div>
  );
}

/* ── Showcase: Phone (3) Pro Camera & Optical Sensor Deck ─────────────────── */
const LENS_PRESETS = [
  { id: '0.6x', focal: '14mm', aperture: 'f/2.2', label: '0.6×' },
  { id: '1x', focal: '24mm', aperture: 'f/1.88', label: '1×' },
  { id: '2x', focal: '48mm', aperture: 'f/1.88', label: '2×' },
  { id: '5x', focal: '120mm', aperture: 'f/2.6', label: '5×' },
] as const;

export function ProCameraDeckShowcase() {
  const [lens, setLens] = React.useState<(typeof LENS_PRESETS)[number]['id']>('1x');
  const [iso, setIso] = React.useState(400);
  const [shutterIdx, setShutterIdx] = React.useState(6);
  const [ev, setEv] = React.useState(0);
  const [rawDng, setRawDng] = React.useState(true);
  const [glyphFill, setGlyphFill] = React.useState(true);
  const [gridOverlay, setGridOverlay] = React.useState(true);
  const [shotCount, setShotCount] = React.useState(14);
  const [captures, setCaptures] = React.useState<string[]>(['IMG_014.DNG · 24mm · ISO 400']);
  const shutterAction = useAsyncAction(750);

  const SHUTTER_SPEEDS = ['1/30', '1/60', '1/125', '1/250', '1/500', '1/1000', '1/2000', '1/4000'];
  const activeLens = LENS_PRESETS.find((l) => l.id === lens) ?? LENS_PRESETS[1];
  const shutterLabel = SHUTTER_SPEEDS[Math.min(SHUTTER_SPEEDS.length - 1, Math.max(0, shutterIdx))];

  const handleCapture = () => {
    shutterAction.trigger(() => {
      const nextNum = shotCount + 1;
      setShotCount(nextNum);
      const ext = rawDng ? 'DNG' : 'JPG';
      const entry = `IMG_${String(nextNum).padStart(3, '0')}.${ext} · ${activeLens.focal} · ISO ${iso}`;
      setCaptures((prev) => [entry, ...prev].slice(0, 3));
      appToaster('Frame captured', { description: entry });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      {/* Left: Viewfinder HUD + Optical Sliders */}
      <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="font-mono text-[11px] text-[var(--nt-muted)] tabular-nums">
              50MP TrueLens · {activeLens.focal} · {activeLens.aperture} · {rawDng ? '12-bit RAW' : 'HEIF'}
            </div>
            <h3 className="font-display text-2xl text-[var(--nt-display)]">
              Pro Sensor Deck
            </h3>
          </div>
          <div
            role="group"
            aria-label="Optical lens focal length"
            className="inline-flex rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] p-0.5 font-mono text-xs"
          >
            {LENS_PRESETS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={lens === item.id}
                onClick={() => setLens(item.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap',
                  lens === item.id
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Simulated Monochrome Optical Reticle */}
        <div className="relative h-36 overflow-hidden rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-3.5">
          {gridOverlay && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3"
            >
              {Array.from({ length: 9 }).map((_, idx) => (
                <div key={idx} className="border-[0.5px] border-[var(--nt-line)]/50" />
              ))}
            </div>
          )}
          <div className="relative z-10 flex h-full flex-col justify-between font-mono text-[11px] tabular-nums">
            <div className="flex items-center justify-between text-[var(--nt-secondary)]">
              <span>AF-C · FACE LOCK</span>
              <span>{ev >= 0 ? `+${(ev / 10).toFixed(1)}` : (ev / 10).toFixed(1)} EV</span>
            </div>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nt-accent)]/70">
              <div className="h-1.5 w-1.5 rounded-full bg-[var(--nt-accent)]" />
            </div>
            <div className="flex items-center justify-between text-[var(--nt-display)]">
              <span>ISO {iso}</span>
              <span>{shutterLabel}s</span>
              <span>{shotCount} frames</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <NothingSlider
            label="ISO Sensitivity"
            value={iso}
            min={100}
            max={3200}
            step={100}
            onValueChange={setIso}
          />
          <NothingSlider
            label={`Shutter Speed (${shutterLabel}s)`}
            value={shutterIdx}
            min={0}
            max={SHUTTER_SPEEDS.length - 1}
            step={1}
            onValueChange={setShutterIdx}
          />
          <NothingSlider
            label="Exposure Bias (×0.1 EV)"
            value={ev}
            min={-20}
            max={20}
            step={5}
            onValueChange={setEv}
          />
        </div>
      </div>

      {/* Right: Glyph Fill Ring + Controls + Capture Trigger */}
      <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="flex flex-col items-center gap-3">
          <GlyphMatrix
            resolution={13}
            preset={glyphFill ? 'power' : 'plus'}
            paintState={shutterAction.loading ? 'signal' : 'on'}
            size={136}
            label="Glyph fill light ring preview"
          />
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            Glyph Fill Ring · {glyphFill ? 'Armed (6500K)' : 'Off'}
          </span>
        </div>

        <div className="space-y-3 border-y border-[var(--nt-line)] py-4">
          <NothingSwitch label="12-bit RAW DNG Output" checked={rawDng} onCheckedChange={setRawDng} />
          <NothingSwitch
            label="Glyph Ring Fill Light"
            tone="signal"
            checked={glyphFill}
            onCheckedChange={setGlyphFill}
          />
          <NothingSwitch label="Rule-of-Thirds Grid" checked={gridOverlay} onCheckedChange={setGridOverlay} />
        </div>

        <div className="space-y-3">
          <Button
            variant="signal"
            className="w-full"
            loading={shutterAction.loading}
            loadingText="Writing DNG..."
            onClick={handleCapture}
          >
            <Camera className="h-4 w-4" />
            Capture {rawDng ? 'RAW' : 'Photo'}
          </Button>
          <div className="space-y-1 font-mono text-[11px] text-[var(--nt-muted)] tabular-nums">
            <div className="text-[10px] uppercase tracking-[0.12em]">Recent Buffer</div>
            {captures.map((cap) => (
              <div key={cap} className="truncate text-[var(--nt-secondary)]">
                {cap}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Showcase: Glyph Notification & Focus Composer ────────────────────────── */
const FOCUS_PROFILES = [
  { id: 'deep-work', label: 'Deep Work', preset: 'power' as const, summary: 'Silences social apps; allows urgent contacts.' },
  { id: 'studio', label: 'Studio', preset: 'sound' as const, summary: 'Acoustic monitoring mode; visual Glyph cues only.' },
  { id: 'sleep', label: 'Sleep', preset: 'smiley' as const, summary: 'Dimmed monochrome LEDs; alarm channel only.' },
  { id: 'essential', label: 'Essential', preset: 'heart' as const, summary: 'Signal Red interrupt reserved for VIP contacts.' },
] as const;

export function GlyphFocusComposerShowcase() {
  const [profileId, setProfileId] = React.useState<(typeof FOCUS_PROFILES)[number]['id']>('essential');
  const [flipToGlyph, setFlipToGlyph] = React.useState(true);
  const [vipBypass, setVipBypass] = React.useState(true);
  const [brightness, setBrightness] = React.useState(75);
  const [appliedLabel, setAppliedLabel] = React.useState<string | null>(null);
  const applyAction = useAsyncAction(700);

  const activeProfile = FOCUS_PROFILES.find((p) => p.id === profileId) ?? FOCUS_PROFILES[0];

  const handleApply = () => {
    applyAction.trigger(() => {
      setAppliedLabel(activeProfile.label);
      appToaster(`${activeProfile.label} profile synced`, {
        description: `Glyph brightness ${brightness}% · ${flipToGlyph ? 'Flip-to-Glyph armed' : 'Always active'}.`,
      });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <div className="lg:col-span-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="w-full flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>Alert Signature</span>
          <span className="text-[var(--nt-display)]">{activeProfile.label}</span>
        </div>
        <GlyphMatrix
          resolution={13}
          preset={activeProfile.preset}
          paintState={vipBypass ? 'signal' : 'on'}
          interactive
          size={156}
          label="Interactive focus glyph pattern"
        />
        <p className="text-center font-mono text-[11px] text-[var(--nt-muted)]">
          Tap dots to customize your hardware notification signature.
        </p>
      </div>

      <div className="lg:col-span-7 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
            <Sliders className="h-3.5 w-3.5" />
            <span>Focus Profile</span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {FOCUS_PROFILES.map((profile) => (
              <button
                key={profile.id}
                type="button"
                aria-pressed={profileId === profile.id}
                onClick={() => setProfileId(profile.id)}
                className={cn(
                  'rounded-lg border px-3 py-2 font-mono text-xs transition-colors cursor-pointer whitespace-nowrap',
                  profileId === profile.id
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                )}
              >
                {profile.label}
              </button>
            ))}
          </div>
          <p className="text-xs leading-relaxed text-[var(--nt-secondary)]">
            {activeProfile.summary}
          </p>
        </div>

        <div className="space-y-3 border-y border-[var(--nt-line)] py-4">
          <NothingSlider
            label="Glyph LED Luminance"
            value={brightness}
            min={10}
            max={100}
            unit="%"
            onValueChange={setBrightness}
          />
          <NothingSwitch label="Flip to Glyph (Mute audio face-down)" checked={flipToGlyph} onCheckedChange={setFlipToGlyph} />
          <NothingSwitch
            label="Signal Red Urgent Bypass"
            tone="signal"
            checked={vipBypass}
            onCheckedChange={setVipBypass}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            {appliedLabel ? `Active on Phone (3): ${appliedLabel}` : 'Unsaved focus draft'}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                appToaster('Glyph Interrupt Test', {
                  description: `Dispatched ${activeProfile.label} pattern (${brightness}% LED).`,
                })
              }
            >
              Test Alert
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={applyAction.loading}
              loadingText="Syncing..."
              onClick={handleApply}
            >
              Apply Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Showcase: Developer API & Webhook Console ────────────────────────────── */
interface WebhookLog {
  id: string;
  event: string;
  status: number;
  latencyMs: number;
  timestamp: string;
}

const INITIAL_LOGS: WebhookLog[] = [
  { id: 'evt_9402', event: 'glyph.pattern.deployed', status: 200, latencyMs: 42, timestamp: '14:22:08' },
  { id: 'evt_9401', event: 'device.telemetry.batch', status: 200, latencyMs: 68, timestamp: '14:20:41' },
  { id: 'evt_9400', event: 'auth.passkey.verified', status: 200, latencyMs: 31, timestamp: '14:18:19' },
  { id: 'evt_9399', event: 'firmware.ota.retry', status: 429, latencyMs: 118, timestamp: '14:12:04' },
];

export function DeveloperApiConsoleShowcase() {
  const [apiKey, setApiKey] = React.useState('nt_live_7f4a_992b_e81c');
  const [copied, setCopied] = React.useState(false);
  const [autoRetry, setAutoRetry] = React.useState(true);
  const [tableLoading, setTableLoading] = React.useState(false);
  const [logs, setLogs] = React.useState<WebhookLog[]>(INITIAL_LOGS);
  const rotateAction = useAsyncAction(700);
  const pingAction = useAsyncAction(650);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const handleRotateKey = () => {
    rotateAction.trigger(() => {
      const suffix = Math.random().toString(16).slice(2, 6);
      const next = `nt_live_${suffix}_992b_e81c`;
      setApiKey(next);
      appToaster('API key rotated', { description: `Active prefix updated to ${next.slice(0, 14)}…` });
    });
  };

  const handleSendTest = () => {
    pingAction.trigger(() => {
      const now = new Date();
      const ts = now.toTimeString().slice(0, 8);
      const nextEvent: WebhookLog = {
        id: `evt_${9403 + logs.length}`,
        event: 'webhook.ping.manual',
        status: 200,
        latencyMs: 28 + (logs.length % 19),
        timestamp: ts,
      };
      setLogs((prev) => [nextEvent, ...prev].slice(0, 6));
      appToaster('Webhook delivered (200 OK)', { description: `${nextEvent.id} · ${nextEvent.latencyMs}ms` });
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Secret Key & Quota */}
        <div className="lg:col-span-7 space-y-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-mono text-xs text-[var(--nt-display)]">
              <Key className="h-4 w-4 text-[var(--nt-accent)]" />
              <span>Production API Key</span>
            </div>
            <span className="font-mono text-[11px] text-[var(--nt-muted)]">
              Scope: telemetry:read · glyph:write
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 py-2">
            <code className="truncate font-mono text-xs text-[var(--nt-display)]">{apiKey}</code>
            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="sm" onClick={handleCopyKey}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                loading={rotateAction.loading}
                loadingText="Rotating..."
                onClick={handleRotateKey}
              >
                Rotate Key
              </Button>
            </div>
          </div>

          <SegmentedBar label="Monthly API Quota (74,200 / 100,000 req)" total={20} filled={15} />
        </div>

        {/* Webhook Delivery Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-5">
          <div className="space-y-3">
            <div className="font-mono text-xs text-[var(--nt-display)]">Webhook Endpoint</div>
            <div className="rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2 font-mono text-[11px] text-[var(--nt-secondary)] truncate">
              https://api.nothing.example/v1/hooks
            </div>
            <NothingSwitch
              label="Exponential Auto-Retry (3×)"
              checked={autoRetry}
              onCheckedChange={setAutoRetry}
              asyncToggle
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              size="sm"
              loading={pingAction.loading}
              loadingText="Dispatching..."
              onClick={handleSendTest}
            >
              <PaperPlaneTilt className="h-3.5 w-3.5" />
              Send Test Event
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTableLoading((v) => !v)}>
              {tableLoading ? 'Show Logs' : 'Skeleton Mode'}
            </Button>
          </div>
        </div>
      </div>

      {/* Delivery Log Table */}
      <div className="overflow-x-auto rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)]">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-[var(--nt-line)] bg-[var(--nt-surface)] text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              <th className="px-4 py-2.5">Event ID</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">HTTP</th>
              <th className="px-4 py-2.5 text-right">Latency</th>
              <th className="px-4 py-2.5 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--nt-line)]">
            {tableLoading
              ? Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx}>
                    <td colSpan={5} className="px-4 py-3">
                      <div className="h-4 w-full animate-pulse rounded bg-[var(--nt-raised)]" />
                    </td>
                  </tr>
                ))
              : logs.map((row) => (
                  <tr key={row.id} className="hover:bg-[var(--nt-surface)]/50">
                    <td className="px-4 py-2.5 text-[var(--nt-muted)] tabular-nums">{row.id}</td>
                    <td className="px-4 py-2.5 text-[var(--nt-display)]">{row.event}</td>
                    <td
                      className={cn(
                        'px-4 py-2.5 tabular-nums',
                        row.status === 200 ? 'text-[var(--nt-success)]' : 'text-[var(--nt-accent)]',
                      )}
                    >
                      {row.status} {row.status === 200 ? 'OK' : 'RATE'}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--nt-secondary)]">
                      {row.latencyMs} ms
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums text-[var(--nt-muted)]">
                      {row.timestamp}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Showcase: Nothing Store Hardware Configurator ────────────────────────── */
const FINISHES = [
  { id: 'obsidian', label: 'Obsidian Matte', preset: 'power' as const, accent: false },
  { id: 'chalk', label: 'Chalk White', preset: 'arrow' as const, accent: false },
  { id: 'signal', label: 'Signal Edition', preset: 'live' as const, accent: true },
] as const;

const STORAGE_TIERS = [
  { id: '256', label: '256 GB', price: 699 },
  { id: '512', label: '512 GB', price: 799 },
  { id: '1tb', label: '1 TB', price: 949 },
] as const;

export function HardwareStoreConfiguratorShowcase() {
  const [finishId, setFinishId] = React.useState<(typeof FINISHES)[number]['id']>('obsidian');
  const [storageId, setStorageId] = React.useState<(typeof STORAGE_TIERS)[number]['id']>('256');
  const [bundleEarbuds, setBundleEarbuds] = React.useState(false);
  const [qty, setQty] = React.useState(1);
  const [reserved, setReserved] = React.useState(false);
  const reserveAction = useAsyncAction(800);

  const activeFinish = FINISHES.find((f) => f.id === finishId) ?? FINISHES[0];
  const activeStorage = STORAGE_TIERS.find((s) => s.id === storageId) ?? STORAGE_TIERS[0];
  const unitPrice = activeStorage.price + (bundleEarbuds ? 129 : 0);
  const totalPrice = unitPrice * qty;

  const handleReserve = () => {
    reserveAction.trigger(() => {
      setReserved(true);
      appToaster('Hardware unit reserved', {
        description: `${qty}× Phone (3) ${activeStorage.label} (${activeFinish.label}) — $${totalPrice.toLocaleString()}`,
      });
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Hardware Preview Column */}
      <div className="lg:col-span-5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-6">
        <div className="w-full flex items-center justify-between font-mono text-[11px] text-[var(--nt-muted)]">
          <span>Phone (3) Transparent</span>
          <span className="text-[var(--nt-display)]">{activeFinish.label}</span>
        </div>
        <GlyphMatrix
          resolution={25}
          preset={activeFinish.preset}
          paintState={activeFinish.accent ? 'signal' : 'on'}
          size={184}
          label="Phone (3) rear glyph matrix preview"
        />
        <div className="w-full flex items-center justify-between border-t border-[var(--nt-line)] pt-3 font-mono text-[11px] text-[var(--nt-secondary)] tabular-nums">
          <span>481 Rear LEDs · IP68</span>
          <span>Ships in 2 days</span>
        </div>
      </div>

      {/* Configurator & Checkout Column */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-5 rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-bg)] p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-2xl text-[var(--nt-display)]">
              Configure Phone (3)
            </h3>
            <span
              data-testid="configurator-total-price"
              className="font-mono text-xl font-medium tabular-nums text-[var(--nt-display)]"
            >
              ${totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Finish Picker */}
          <div className="space-y-1.5">
            <div className="font-mono text-[11px] text-[var(--nt-muted)]">Chassis Finish</div>
            <div className="grid grid-cols-3 gap-2">
              {FINISHES.map((finish) => (
                <button
                  key={finish.id}
                  type="button"
                  aria-pressed={finishId === finish.id}
                  onClick={() => {
                    setFinishId(finish.id);
                    setReserved(false);
                  }}
                  className={cn(
                    'rounded-lg border px-3 py-2 font-mono text-xs transition-colors cursor-pointer whitespace-nowrap',
                    finishId === finish.id
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  {finish.label}
                </button>
              ))}
            </div>
          </div>

          {/* Storage Tier Picker */}
          <div className="space-y-1.5">
            <div className="font-mono text-[11px] text-[var(--nt-muted)]">Storage Capacity</div>
            <div className="grid grid-cols-3 gap-2">
              {STORAGE_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  aria-pressed={storageId === tier.id}
                  onClick={() => {
                    setStorageId(tier.id);
                    setReserved(false);
                  }}
                  className={cn(
                    'flex items-center justify-between rounded-lg border px-3 py-2 font-mono text-xs tabular-nums transition-colors cursor-pointer',
                    storageId === tier.id
                      ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                      : 'border-[var(--nt-line)] bg-[var(--nt-surface)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]',
                  )}
                >
                  <span>{tier.label}</span>
                  <span className="opacity-75">${tier.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bundle Toggle & Quantity */}
          <div className="space-y-3 border-t border-[var(--nt-line)] pt-4">
            <NothingSwitch
              label="Bundle Ear (3) Active ANC (+$129)"
              tone="signal"
              checked={bundleEarbuds}
              onCheckedChange={(checked) => {
                setBundleEarbuds(checked);
                setReserved(false);
              }}
            />

            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[var(--nt-primary)]">Quantity</span>
              <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1 font-mono text-xs tabular-nums">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => {
                    setQty((q) => Math.max(1, q - 1));
                    setReserved(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--nt-raised)] text-[var(--nt-display)] cursor-pointer"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-[var(--nt-display)]">{qty}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => {
                    setQty((q) => Math.min(5, q + 1));
                    setReserved(false);
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded hover:bg-[var(--nt-raised)] text-[var(--nt-display)] cursor-pointer"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--nt-line)] pt-4">
          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            {reserved
              ? `Reserved · Order #NT-${2040 + totalPrice}`
              : `${activeStorage.label} · ${bundleEarbuds ? 'With Ear (3)' : 'Device only'}`}
          </span>
          <Button
            variant={reserved ? 'primary' : 'signal'}
            size="md"
            loading={reserveAction.loading}
            loadingText="Reserving..."
            onClick={handleReserve}
          >
            <ShoppingBag className="h-4 w-4" />
            {reserved ? 'Reserved in Bag' : 'Reserve Unit'}
          </Button>
        </div>
      </div>
    </div>
  );
}
