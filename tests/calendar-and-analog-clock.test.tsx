import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AnalogClock, CalendarWidget } from '@nothing-ui/ui';

const FIXED_TODAY = new Date(2026, 10, 25, 10, 10, 30, 500); // Nov 25, 2026 10:10:30.500 local

describe('CalendarWidget (Minimalist Nothing OS Grid & Magnetic Hover)', () => {
  it('renders a 6x7 monochrome grid, handles single & range selection, month navigation, and magnetic hover', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const onSelectRange = vi.fn();

    render(
      <CalendarWidget
        today={FIXED_TODAY}
        defaultValue="2026-11-25"
        onSelectDate={onSelectDate}
        onSelectRange={onSelectRange}
      />,
    );

    expect(screen.getByTestId('calendar-month-heading')).toHaveTextContent('NOV 2026');
    const grid = screen.getByTestId('calendar-date-grid');
    expect(within(grid).getAllByRole('button')).toHaveLength(42);
    expect(screen.getByTestId('calendar-selected-readout')).toHaveTextContent('NOV 25, 2026');

    // Magnetic pointer hover updates active attribute and compositor transform
    const nov14 = within(grid).getByRole('button', { name: 'Saturday, November 14, 2026' });
    nov14.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 44, height: 44, right: 144, bottom: 144, x: 100, y: 100, toJSON: () => ({}) }) as DOMRect;
    fireEvent.pointerMove(nov14, { clientX: 142, clientY: 122 });
    expect(nov14).toHaveAttribute('data-magnetic-active', 'true');
    const innerSpan = screen.getByTestId('calendar-day-inner-2026-11-14');
    expect(innerSpan.style.transform).toContain('translate3d(');
    expect(innerSpan.style.transform).not.toBe('translate3d(0px, 0px, 0)');

    // Click to select November 14
    await user.click(nov14);
    expect(onSelectDate).toHaveBeenCalledWith('2026-11-14');
    expect(screen.getByTestId('calendar-selected-readout')).toHaveTextContent('NOV 14, 2026');

    // Switch to Range mode and select a 5-day inclusive range (Nov 10 -> Nov 14)
    await user.click(screen.getByRole('button', { name: 'Range' }));
    await user.click(within(grid).getByRole('button', { name: 'Tuesday, November 10, 2026' }));
    expect(onSelectRange).toHaveBeenCalledWith({ start: '2026-11-10', end: '2026-11-14' });
    expect(screen.getByTestId('calendar-selected-readout')).toHaveTextContent('NOV 10, 2026 → NOV 14, 2026');
    expect(screen.getByText('5 days')).toBeInTheDocument();

    // Step forward to December 2026 and jump back to Today
    await user.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByTestId('calendar-month-heading')).toHaveTextContent('DEC 2026');

    await user.click(screen.getByRole('button', { name: 'Today' }));
    expect(screen.getByTestId('calendar-month-heading')).toHaveTextContent('NOV 2026');
    expect(screen.getByTestId('calendar-selected-readout')).toHaveTextContent('NOV 25, 2026');

    // Switch week start from Monday to Sunday
    await user.click(screen.getByRole('button', { name: 'Sun' }));
    const colHeaders = screen.getAllByRole('columnheader');
    expect(colHeaders[0]).toHaveTextContent('SU');
  });
});

describe('AnalogClock (Doto Font, SVG Primitives, Magnetic Stutter & Customizable Ring Ticks)', () => {
  it('renders Doto cardinal numerals, SVG hands, magnetic stutter motion, and live customizable ring ticks', async () => {
    const user = userEvent.setup();
    const fixedUtc = new Date('2026-11-25T10:10:30.500Z');

    render(<AnalogClock fixedDate={fixedUtc} timeZone="UTC" />);

    const svg = screen.getByTestId('analog-clock-svg');
    expect(svg).toHaveAttribute('data-motion', 'magnetic-stutter');
    expect(svg).toHaveAttribute('data-tick-style', 'hybrid');
    expect(svg).toHaveAttribute('data-tick-count', '60');
    expect(screen.getByTestId('analog-clock-doto-readout')).toHaveTextContent('10:10:30');

    // Verify 60 perimeter ring ticks and Doto cardinal numerals
    const tickGroup = screen.getByTestId('analog-clock-ring-ticks');
    expect(tickGroup.children.length).toBe(60);
    const numerals = screen.getByTestId('analog-clock-doto-numerals');
    expect(numerals).toHaveTextContent('12030609');

    // Second hand locked magnetically onto 180deg at 30.500s
    expect(screen.getByTestId('analog-clock-second-hand')).toHaveAttribute('data-second-deg', '180');

    // Customize ring ticks -> 120 ticks, Batons style
    await user.click(screen.getByRole('button', { name: '120' }));
    expect(screen.getByTestId('analog-clock-ring-ticks').children.length).toBe(120);
    expect(svg).toHaveAttribute('data-tick-count', '120');

    await user.click(screen.getByRole('button', { name: 'Batons' }));
    expect(svg).toHaveAttribute('data-tick-style', 'batons');

    await user.click(screen.getByRole('button', { name: 'Dots' }));
    expect(svg).toHaveAttribute('data-tick-style', 'dots');

    // Toggle Doto cardinal numerals off
    await user.click(screen.getByRole('button', { name: /Doto Numerals: On/i }));
    expect(screen.queryByTestId('analog-clock-doto-numerals')).not.toBeInTheDocument();

    // Switch second-hand motion to Sweep -> 30.500s renders at 183deg
    await user.click(screen.getByRole('button', { name: 'Sweep' }));
    expect(svg).toHaveAttribute('data-motion', 'sweep');
    expect(screen.getByTestId('analog-clock-second-hand')).toHaveAttribute('data-second-deg', '183');
  });
});
