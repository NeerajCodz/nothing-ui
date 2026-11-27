import * as React from 'react';
import { ArrowRight, Bell, Check, Power } from '@phosphor-icons/react';
import { Button } from '@nothing-ui/ui';

export const meta = {
  title: 'Variants, Shapes & Click-to-Load States',
  description:
    'Click any button to trigger its async loading state. Defaults to a clean normal monochrome spinner; switch Loader Style in the toolbar to test Dots, Bars, or Pulse.',
};

export default function ButtonVariantsDemo() {
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [lastCompleted, setLastCompleted] = React.useState<string | null>(null);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const triggerLoad = (id: string, label: string) => {
    if (busyId) return;
    setBusyId(id);
    timerRef.current = window.setTimeout(() => {
      setBusyId(null);
      setLastCompleted(label);
      timerRef.current = null;
    }, 950);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="primary"
          loading={busyId === 'primary'}
          loadingText="Deploying..."
          onClick={() => triggerLoad('primary', 'Primary Action')}
        >
          Primary Action
        </Button>
        <Button
          variant="secondary"
          loading={busyId === 'secondary'}
          loadingText="Syncing..."
          onClick={() => triggerLoad('secondary', 'Secondary')}
        >
          Secondary
        </Button>
        <Button
          variant="outline"
          loading={busyId === 'outline'}
          loadingText="Saving..."
          onClick={() => triggerLoad('outline', 'Outline')}
        >
          Outline
        </Button>
        <Button
          variant="ghost"
          loading={busyId === 'ghost'}
          loadingText="Loading..."
          onClick={() => triggerLoad('ghost', 'Ghost')}
        >
          Ghost
        </Button>
        <Button
          variant="signal"
          loading={busyId === 'signal'}
          loadingText="Resetting..."
          onClick={() => triggerLoad('signal', 'Signal Red')}
        >
          Signal Red
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button
          variant="primary"
          shape="pill"
          loadingPosition="end"
          loading={busyId === 'pill'}
          loadingText="Continuing"
          onClick={() => triggerLoad('pill', 'Continue')}
        >
          Continue <ArrowRight className="h-3.5 w-3.5" weight="bold" />
        </Button>
        <Button
          variant="outline"
          shape="square"
          loadingPosition="replace"
          loading={busyId === 'square'}
          onClick={() => triggerLoad('square', 'Square Hardware')}
        >
          Square Hardware
        </Button>
        <Button
          variant="outline"
          size="icon"
          shape="pill"
          aria-label="Power"
          loading={busyId === 'power'}
          onClick={() => triggerLoad('power', 'Power')}
        >
          <Power className="h-4 w-4" />
        </Button>
        <Button
          variant="signal"
          size="icon"
          shape="pill"
          aria-label="Alerts"
          loading={busyId === 'alerts'}
          onClick={() => triggerLoad('alerts', 'Alerts')}
        >
          <Bell className="h-4 w-4" />
        </Button>
        <Button
          variant="primary"
          size="icon"
          shape="square"
          aria-label="Confirm"
          loading={busyId === 'confirm'}
          onClick={() => triggerLoad('confirm', 'Confirm')}
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>

      <p className="font-mono text-[11px] text-[var(--nt-muted)]">
        {busyId
          ? 'Async action in progress · duplicate clicks locked (aria-busy)'
          : lastCompleted
            ? `Completed: ${lastCompleted} · Click any button to trigger loading`
            : 'Click any button to trigger loading · supports start, end, and replace positions'}
      </p>
    </div>
  );
}
