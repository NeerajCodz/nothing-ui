import * as React from 'react';
import {
  AgendaTickerWidget,
  AnalogClock,
  AnalogClockWidget,
  BatteryHealthHubWidget,
  BinaryClockWidget,
  CalendarWidget,
  ClockStudioWidget,
  FlipClockWidget,
  HabitMatrixTrackerWidget,
  NetworkSpeedRadarWidget,
  PedometerRingWidget,
  PhotoFrameDitherWidget,
  PodcastMiniPlayerWidget,
  PomodoroFocusWidget,
  QuickNotesPadWidget,
  RadialClockWidget,
  ScreenTimePulseWidget,
  StopwatchTimerWidget,
  UnitFxConverterWidget,
  VoiceMemoTranscriberWidget,
  WordClockWidget,
  WorldClockDeckWidget,
} from '@nothing-ui/ui';

import nothingAnalogClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/analog-clock.tsx?raw';
import analogClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/analog-clock-widget.tsx?raw';
import flipClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/flip-clock-widget.tsx?raw';
import binaryClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/binary-clock-widget.tsx?raw';
import wordClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/word-clock-widget.tsx?raw';
import radialClockRaw from '../../../../../packages/ui/src/components/widgets/clocks/radial-clock-widget.tsx?raw';
import clockStudioRaw from '../../../../../packages/ui/src/components/widgets/clocks/clock-studio-widget.tsx?raw';
import stopwatchTimerRaw from '../../../../../packages/ui/src/components/widgets/clocks/stopwatch-timer-widget.tsx?raw';
import worldClockDeckRaw from '../../../../../packages/ui/src/components/widgets/clocks/world-clock-deck-widget.tsx?raw';
import agendaTickerRaw from '../../../../../packages/ui/src/components/widgets/productivity/agenda-ticker-widget.tsx?raw';
import pedometerRingRaw from '../../../../../packages/ui/src/components/widgets/hardware/pedometer-ring-widget.tsx?raw';
import batteryHealthHubRaw from '../../../../../packages/ui/src/components/widgets/hardware/battery-health-hub-widget.tsx?raw';
import screenTimePulseRaw from '../../../../../packages/ui/src/components/widgets/hardware/screen-time-pulse-widget.tsx?raw';
import networkSpeedRadarRaw from '../../../../../packages/ui/src/components/widgets/hardware/network-speed-radar-widget.tsx?raw';
import podcastMiniPlayerRaw from '../../../../../packages/ui/src/components/widgets/media/podcast-mini-player-widget.tsx?raw';
import voiceMemoRaw from '../../../../../packages/ui/src/components/widgets/media/voice-memo-transcriber-widget.tsx?raw';
import photoFrameDitherRaw from '../../../../../packages/ui/src/components/widgets/media/photo-frame-dither-widget.tsx?raw';
import pomodoroFocusRaw from '../../../../../packages/ui/src/components/widgets/productivity/pomodoro-focus-widget.tsx?raw';
import quickNotesPadRaw from '../../../../../packages/ui/src/components/widgets/productivity/quick-notes-pad-widget.tsx?raw';
import habitMatrixRaw from '../../../../../packages/ui/src/components/widgets/productivity/habit-matrix-tracker-widget.tsx?raw';
import unitFxConverterRaw from '../../../../../packages/ui/src/components/widgets/productivity/unit-fx-converter-widget.tsx?raw';
import calendarWidgetRaw from '../../../../../packages/ui/src/components/widgets/productivity/calendar-widget.tsx?raw';

export const WIDGET_DEMO_SLUGS = new Set<string>([
  'analog-clock',
  'nothing-analog-clock',
  'calendar-widget',
  'flip-clock',
  'binary-dot-clock',
  'word-clock',
  'radial-clock',
  'clock-collection',
  'stopwatch-timer',
  'world-clock-deck',
  'agenda-ticker',
  'pedometer-ring',
  'battery-health-hub',
  'screen-time-pulse',
  'network-speed-radar',
  'podcast-mini-player',
  'voice-memo-transcriber',
  'photo-frame-dither',
  'pomodoro-focus-card',
  'quick-notes-pad',
  'habit-matrix-tracker',
  'unit-fx-converter',
]);

const RAW_SOURCES: Record<string, { code: string; label: string }> = {
  'analog-clock': {
    code: analogClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/analog-clock-widget.tsx',
  },
  'flip-clock': {
    code: flipClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/flip-clock-widget.tsx',
  },
  'binary-dot-clock': {
    code: binaryClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/binary-clock-widget.tsx',
  },
  'word-clock': {
    code: wordClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/word-clock-widget.tsx',
  },
  'radial-clock': {
    code: radialClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/radial-clock-widget.tsx',
  },
  'clock-collection': {
    code: clockStudioRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/clock-studio-widget.tsx',
  },
  'stopwatch-timer': {
    code: stopwatchTimerRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/stopwatch-timer-widget.tsx',
  },
  'world-clock-deck': {
    code: worldClockDeckRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/world-clock-deck-widget.tsx',
  },
  'agenda-ticker': {
    code: agendaTickerRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/agenda-ticker-widget.tsx',
  },
  'pedometer-ring': {
    code: pedometerRingRaw.trim(),
    label: 'packages/ui/src/components/widgets/hardware/pedometer-ring-widget.tsx',
  },
  'battery-health-hub': {
    code: batteryHealthHubRaw.trim(),
    label: 'packages/ui/src/components/widgets/hardware/battery-health-hub-widget.tsx',
  },
  'screen-time-pulse': {
    code: screenTimePulseRaw.trim(),
    label: 'packages/ui/src/components/widgets/hardware/screen-time-pulse-widget.tsx',
  },
  'network-speed-radar': {
    code: networkSpeedRadarRaw.trim(),
    label: 'packages/ui/src/components/widgets/hardware/network-speed-radar-widget.tsx',
  },
  'podcast-mini-player': {
    code: podcastMiniPlayerRaw.trim(),
    label: 'packages/ui/src/components/widgets/media/podcast-mini-player-widget.tsx',
  },
  'voice-memo-transcriber': {
    code: voiceMemoRaw.trim(),
    label: 'packages/ui/src/components/widgets/media/voice-memo-transcriber-widget.tsx',
  },
  'photo-frame-dither': {
    code: photoFrameDitherRaw.trim(),
    label: 'packages/ui/src/components/widgets/media/photo-frame-dither-widget.tsx',
  },
  'pomodoro-focus-card': {
    code: pomodoroFocusRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/pomodoro-focus-widget.tsx',
  },
  'quick-notes-pad': {
    code: quickNotesPadRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/quick-notes-pad-widget.tsx',
  },
  'habit-matrix-tracker': {
    code: habitMatrixRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/habit-matrix-tracker-widget.tsx',
  },
  'unit-fx-converter': {
    code: unitFxConverterRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/unit-fx-converter-widget.tsx',
  },
  'calendar-widget': {
    code: calendarWidgetRaw.trim(),
    label: 'packages/ui/src/components/widgets/productivity/calendar-widget.tsx',
  },
  'nothing-analog-clock': {
    code: nothingAnalogClockRaw.trim(),
    label: 'packages/ui/src/components/widgets/clocks/analog-clock.tsx',
  },
};

export function getWidgetDemoSource(slug: string): { code: string; label: string } | null {
  return RAW_SOURCES[slug] ?? null;
}

export function WidgetSuiteDemo({ slug }: { slug: string }) {
  switch (slug) {
    case 'analog-clock':
      return (
        <div className="w-full max-w-md mx-auto">
          <AnalogClockWidget />
        </div>
      );
    case 'flip-clock':
      return (
        <div className="w-full max-w-lg mx-auto">
          <FlipClockWidget />
        </div>
      );
    case 'binary-dot-clock':
      return (
        <div className="w-full max-w-lg mx-auto">
          <BinaryClockWidget />
        </div>
      );
    case 'word-clock':
      return (
        <div className="w-full max-w-md mx-auto">
          <WordClockWidget />
        </div>
      );
    case 'radial-clock':
      return (
        <div className="w-full max-w-md mx-auto">
          <RadialClockWidget />
        </div>
      );
    case 'clock-collection':
      return (
        <div className="w-full">
          <ClockStudioWidget />
        </div>
      );
    case 'stopwatch-timer':
      return (
        <div className="w-full max-w-md mx-auto">
          <StopwatchTimerWidget />
        </div>
      );
    case 'world-clock-deck':
      return (
        <div className="w-full max-w-2xl mx-auto">
          <WorldClockDeckWidget />
        </div>
      );
    case 'agenda-ticker':
      return (
        <div className="w-full max-w-lg mx-auto">
          <AgendaTickerWidget />
        </div>
      );
    case 'pedometer-ring':
      return (
        <div className="w-full max-w-xl mx-auto">
          <PedometerRingWidget />
        </div>
      );
    case 'battery-health-hub':
      return (
        <div className="w-full max-w-lg mx-auto">
          <BatteryHealthHubWidget />
        </div>
      );
    case 'screen-time-pulse':
      return (
        <div className="w-full max-w-lg mx-auto">
          <ScreenTimePulseWidget />
        </div>
      );
    case 'network-speed-radar':
      return (
        <div className="w-full max-w-lg mx-auto">
          <NetworkSpeedRadarWidget />
        </div>
      );
    case 'podcast-mini-player':
      return (
        <div className="w-full max-w-lg mx-auto">
          <PodcastMiniPlayerWidget />
        </div>
      );
    case 'voice-memo-transcriber':
      return (
        <div className="w-full max-w-lg mx-auto">
          <VoiceMemoTranscriberWidget />
        </div>
      );
    case 'photo-frame-dither':
      return (
        <div className="w-full max-w-lg mx-auto">
          <PhotoFrameDitherWidget />
        </div>
      );
    case 'pomodoro-focus-card':
      return (
        <div className="w-full max-w-md mx-auto">
          <PomodoroFocusWidget />
        </div>
      );
    case 'quick-notes-pad':
      return (
        <div className="w-full max-w-lg mx-auto">
          <QuickNotesPadWidget />
        </div>
      );
    case 'habit-matrix-tracker':
      return (
        <div className="w-full max-w-xl mx-auto">
          <HabitMatrixTrackerWidget />
        </div>
      );
    case 'unit-fx-converter':
      return (
        <div className="w-full max-w-lg mx-auto">
          <UnitFxConverterWidget />
        </div>
      );
    case 'calendar-widget':
      return (
        <div className="w-full max-w-md mx-auto">
          <CalendarWidget />
        </div>
      );
    case 'nothing-analog-clock':
      return (
        <div className="w-full max-w-md mx-auto">
          <AnalogClock />
        </div>
      );
    default:
      return null;
  }
}
