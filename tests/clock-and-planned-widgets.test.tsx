import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import {
  AnalogClockWidget,
  BinaryClockWidget,
  ClockStudioWidget,
  FlipClockWidget,
  HabitMatrixTrackerWidget,
  PedometerRingWidget,
  PomodoroFocusWidget,
  RadialClockWidget,
  StopwatchTimerWidget,
  UnitFxConverterWidget,
  WordClockWidget,
  WorldClockDeckWidget,
} from '@nothing-ui/ui';

const FIXED_DATE = new Date('2026-06-15T10:27:30.000Z');

describe('Clock Varieties & Promoted Planned Widgets', () => {
  it('switches analog clock dial faces and sweep/quartz movement', async () => {
    const user = userEvent.setup();
    render(<AnalogClockWidget fixedDate={FIXED_DATE} defaultTimeZone="UTC" />);

    expect(screen.getByRole('button', { name: 'Minimal Dots' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(screen.getByRole('button', { name: 'Chronograph' }));
    expect(screen.getByRole('button', { name: 'Chronograph' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('60S')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Bauhaus Numerals' }));
    expect(screen.getByText('12')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sweep' }));
    expect(screen.getByRole('button', { name: 'Quartz' })).toBeInTheDocument();
  });

  it('renders Flip, Binary BCD/Binary, Word Matrix, Radial, and Clock Studio interactively', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <FlipClockWidget fixedDate={FIXED_DATE} timeZone="UTC" />
        <BinaryClockWidget fixedDate={FIXED_DATE} timeZone="UTC" />
        <WordClockWidget fixedDate={FIXED_DATE} timeZone="UTC" />
        <RadialClockWidget fixedDate={FIXED_DATE} timeZone="UTC" />
      </div>,
    );

    // Word clock illuminates exact English phrase for 10:27 UTC
    expect(screen.getByText(/IT IS TWENTY FIVE PAST TEN \(\+2 min\)/i)).toBeInTheDocument();

    // Binary clock toggles from BCD to pure Binary
    await user.click(screen.getByRole('button', { name: 'Binary' }));
    expect(screen.getByText(/Pure Binary 3×6/i)).toBeInTheDocument();

    // Radial clock switches to Solar Horizon
    await user.click(screen.getByRole('button', { name: 'Solar' }));
    expect(screen.getByText('NOON')).toBeInTheDocument();

    // Flip clock toggles 12h format
    await user.click(screen.getByRole('button', { name: '24H' }));
    expect(screen.getByRole('button', { name: '12H' })).toBeInTheDocument();
  });

  it('filters synchronized clocks inside ClockStudioWidget', async () => {
    const user = userEvent.setup();
    render(<ClockStudioWidget fixedDate={FIXED_DATE} />);

    const studio = screen.getByLabelText('Clock Face Gallery and Studio');
    await user.click(within(studio).getByRole('button', { name: 'Analog (4)' }));
    expect(within(studio).getAllByText('Analog Hardware Clock').length).toBe(4);
    expect(within(studio).queryByText('Typographic Word Clock')).not.toBeInTheDocument();
  });

  it('handles World Clock, Stopwatch/Timer, Pedometer, Pomodoro, Habit Matrix, and Unit/FX Converter interactions', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <WorldClockDeckWidget fixedDate={FIXED_DATE} />
        <StopwatchTimerWidget />
        <PedometerRingWidget defaultSteps={8000} defaultGoal={10000} />
        <PomodoroFocusWidget />
        <HabitMatrixTrackerWidget />
        <UnitFxConverterWidget defaultCategory="temperature" />
      </div>,
    );

    // Stopwatch switches to Timer mode
    await user.click(screen.getByRole('button', { name: 'Timer' }));
    await user.click(screen.getByRole('button', { name: '10m' }));
    expect(screen.getByText('10:00')).toBeInTheDocument();

    // Pedometer logs +500 steps and switches km -> mi
    await user.click(screen.getByRole('button', { name: '+500 Steps' }));
    expect(screen.getByText('8,500')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'MI' }));
    expect(screen.getByText(/\d+\.\d+\s+mi/i)).toBeInTheDocument();

    // Pomodoro switches to Short Break
    await user.click(screen.getByRole('button', { name: 'Break 5m' }));
    expect(screen.getAllByText('05:00').length).toBeGreaterThanOrEqual(1);

    // Habit matrix toggles Day 1 button
    const day1 = screen.getByRole('button', { name: /^Day 1:/ });
    const beforePressed = day1.getAttribute('aria-pressed');
    await user.click(day1);
    expect(day1.getAttribute('aria-pressed')).not.toBe(beforePressed);

    // Temperature converter: default 100 C -> 212 F
    expect(screen.getByLabelText('Converted result')).toHaveTextContent('212');
    await user.click(screen.getByRole('button', { name: 'Invert conversion units' }));
    expect(screen.getByLabelText('Converted result')).toHaveTextContent('37.78');
  });
});
