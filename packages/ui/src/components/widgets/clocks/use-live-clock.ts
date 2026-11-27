import * as React from 'react';

export function useLiveClock(intervalMs = 1000, fixedDate?: Date): Date {
  const [now, setNow] = React.useState<Date>(() => fixedDate ?? new Date());

  React.useEffect(() => {
    if (fixedDate) {
      setNow(fixedDate);
      return;
    }
    setNow(new Date());
    const id = window.setInterval(() => {
      setNow(new Date());
    }, Math.max(50, intervalMs));
    return () => window.clearInterval(id);
  }, [intervalMs, fixedDate]);

  return fixedDate ?? now;
}
