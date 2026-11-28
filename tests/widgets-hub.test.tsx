import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CLOCK_WIDGET_SLUGS, PLANNED_WIDGETS, getWidgetCatalog } from '@nothing-ui/registry';
import { WidgetsHub } from '@apps/ui/components/widgets/widgets-hub';

describe('WidgetsHub', () => {
  it('renders all 35 live widgets, clock preview suite, and 100% roadmap shipped banner', () => {
    render(
      <WidgetsHub
        onSelectWidget={vi.fn()}
      />,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Nothing UI Widgets' })).toBeInTheDocument();

    expect(screen.queryByLabelText('Nothing UI 3-track taxonomy')).not.toBeInTheDocument();

    const liveGrid = screen.getByTestId('live-widgets-grid');
    expect(liveGrid.children.length).toBe(getWidgetCatalog().length);
    expect(getWidgetCatalog().length).toBe(35);
    expect(PLANNED_WIDGETS.length).toBe(0);

    // Core + promoted planned + clock variety + signature magnetic calendar & Doto analog clock widgets are all live
    expect(screen.getByTestId('widget-card-calendar')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-calendar-widget')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-analog-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-nothing-analog-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-flip-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-word-clock')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-pedometer-ring')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-pomodoro-focus-card')).toBeInTheDocument();
    expect(screen.getByTestId('widget-card-unit-fx-converter')).toBeInTheDocument();

    expect(screen.getByTestId('roadmap-complete-banner')).toBeInTheDocument();
  });

  it('filters live widgets by Clocks and widget groups and triggers onSelectWidget on click', async () => {
    const user = userEvent.setup();
    const onSelectWidget = vi.fn();

    render(
      <WidgetsHub
        onSelectWidget={onSelectWidget}
      />,
    );

    const liveFilterGroup = screen.getByRole('group', { name: 'Filter live widgets by group' });

    // Clocks filter
    await user.click(within(liveFilterGroup).getByRole('button', { name: /Clocks/i }));
    expect(screen.getByTestId('live-widgets-grid').children.length).toBe(CLOCK_WIDGET_SLUGS.size);
    expect(screen.getByTestId('widget-card-analog-clock')).toBeInTheDocument();
    expect(screen.queryByTestId('widget-card-pedometer-ring')).not.toBeInTheDocument();

    // Audio & Video filter (9 live widgets)
    await user.click(within(liveFilterGroup).getByRole('button', { name: /Audio & Video/i }));
    expect(screen.getByTestId('live-widgets-grid').children.length).toBe(9);
    expect(screen.getByTestId('widget-card-podcast-mini-player')).toBeInTheDocument();

    await user.click(screen.getByTestId('widget-card-podcast-mini-player'));
    expect(onSelectWidget).toHaveBeenCalledWith('podcast-mini-player');

    // Productivity & Utility filter (5 live widgets)
    await user.click(within(liveFilterGroup).getByRole('button', { name: /Productivity & Utility/i }));
    expect(screen.getByTestId('live-widgets-grid').children.length).toBe(5);
    await user.click(screen.getByTestId('widget-card-pomodoro-focus-card'));
    expect(onSelectWidget).toHaveBeenCalledWith('pomodoro-focus-card');
  });

  it('opens the clock studio from the header quick launch', async () => {
    const user = userEvent.setup();
    const onSelectWidget = vi.fn();

    render(<WidgetsHub onSelectWidget={onSelectWidget} />);

    await user.click(screen.getByRole('button', { name: /Open Clock Studio/i }));
    expect(onSelectWidget).toHaveBeenCalledWith('clock-collection');
  });
});
