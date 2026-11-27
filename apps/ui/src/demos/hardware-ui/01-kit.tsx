import * as React from 'react';
import {
  LEDIndicator,
  QuickSettingTile,
  RotaryKnob,
  SegmentedBar,
  SignalMeter,
  Stepper,
} from '@nothing-ui/ui';

export const meta = {
  title: 'Family 16 · Hardware-Inspired Controls',
  description: 'LEDIndicator, SignalMeter, QuickSettingTile, RotaryKnob, SegmentedBar, and Stepper.',
};

export default function HardwareUiKitDemo() {
  const [wifiOn, setWifiOn] = React.useState(true);
  const [glyphOn, setGlyphOn] = React.useState(true);
  const [dndOn, setDndOn] = React.useState(false);
  const [bars, setBars] = React.useState(4);

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div className="flex flex-wrap items-center gap-5 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-4 py-3">
        <LEDIndicator tone="signal" cadence="pulse" label="GLYPH LIVE" />
        <LEDIndicator tone="mono" label="SYNCED" />
        <LEDIndicator tone="success" label="NOMINAL" />
        <LEDIndicator tone="warning" label="THERMAL" />
        <LEDIndicator tone="off" label="STANDBY" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <QuickSettingTile
          icon="wifi"
          label="Wi-Fi 7"
          detail={wifiOn ? 'Studio_5GHz' : 'Offline'}
          pressed={wifiOn}
          onPressedChange={setWifiOn}
        />
        <QuickSettingTile
          icon="bolt"
          label="Glyph Lights"
          detail={glyphOn ? '481 LEDs' : 'Muted'}
          pressed={glyphOn}
          onPressedChange={setGlyphOn}
          accent="signal"
        />
        <QuickSettingTile
          icon="moon"
          label="Focus Mode"
          detail={dndOn ? 'Silenced' : 'Off'}
          pressed={dndOn}
          onPressedChange={setDndOn}
        />
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <div className="space-y-2">
          <SignalMeter strength={bars} label="5G NR" readout={`${-95 + bars * 6} dBm`} />
          <div className="flex gap-1.5 font-mono text-[10px]">
            {[1, 2, 3, 4, 5].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBars(b)}
                className="rounded border border-[var(--nt-line-2)] px-2 py-0.5 text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                {b}
              </button>
            ))}
          </div>
        </div>
        <RotaryKnob defaultValue={68} label="OUTPUT" />
      </div>

      <SegmentedBar total={15} filled={bars * 3} label="CHANNEL SIGNAL" tone="signal" />
      <Stepper />
    </div>
  );
}
