export interface BarZoomRange {
  startIndex: number;
  endIndex: number;
}

export const MIN_BAR_ZOOM_WINDOW = 2;

export function createFullZoomRange(totalCount: number): BarZoomRange {
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  return { startIndex: 0, endIndex: totalCount - 1 };
}

export function clampZoomRange(
  range: BarZoomRange,
  totalCount: number,
  minWindow = MIN_BAR_ZOOM_WINDOW,
): BarZoomRange {
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  const maxIndex = totalCount - 1;
  const effectiveMin = Math.min(Math.max(1, minWindow), totalCount);

  let start = Math.max(0, Math.min(maxIndex, Math.round(range.startIndex)));
  let end = Math.max(0, Math.min(maxIndex, Math.round(range.endIndex)));

  if (start > end) {
    const tmp = start;
    start = end;
    end = tmp;
  }

  const currentWindow = end - start + 1;
  if (currentWindow < effectiveMin) {
    const deficit = effectiveMin - currentWindow;
    const expandLeft = Math.floor(deficit / 2);
    const expandRight = deficit - expandLeft;
    start = Math.max(0, start - expandLeft);
    end = Math.min(maxIndex, end + expandRight);

    // If still short due to hitting a boundary, expand the opposite side
    const remaining = effectiveMin - (end - start + 1);
    if (remaining > 0) {
      if (start === 0) {
        end = Math.min(maxIndex, end + remaining);
      } else {
        start = Math.max(0, start - remaining);
      }
    }
  }

  return { startIndex: start, endIndex: end };
}

export function getZoomWindowSize(range: BarZoomRange, totalCount: number): number {
  if (totalCount <= 0) return 0;
  const clamped = clampZoomRange(range, totalCount, 1);
  return clamped.endIndex - clamped.startIndex + 1;
}

export function isZoomedRange(range: BarZoomRange, totalCount: number): boolean {
  if (totalCount <= 1) return false;
  return range.startIndex > 0 || range.endIndex < totalCount - 1;
}

export function getZoomMultiplier(range: BarZoomRange, totalCount: number): number {
  const windowSize = getZoomWindowSize(range, totalCount);
  if (windowSize <= 0 || totalCount <= 0) return 1;
  return Math.round((totalCount / windowSize) * 10) / 10;
}

/**
 * Zooms the visible index window in or out anchored around a horizontal focus ratio (0..1).
 */
export function zoomRangeAroundRatio(
  range: BarZoomRange,
  totalCount: number,
  direction: 'in' | 'out',
  focusRatio = 0.5,
  minWindow = MIN_BAR_ZOOM_WINDOW,
): BarZoomRange {
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }

  const clampedRatio = Math.max(0, Math.min(1, focusRatio));
  const current = clampZoomRange(range, totalCount, minWindow);
  const currentSize = current.endIndex - current.startIndex + 1;
  const effectiveMin = Math.min(Math.max(1, minWindow), totalCount);

  if (direction === 'in') {
    if (currentSize <= effectiveMin) {
      return current;
    }
    const delta = Math.max(1, Math.round(currentSize * 0.28));
    const targetSize = Math.max(effectiveMin, currentSize - delta);
    const trim = currentSize - targetSize;
    const trimLeft = Math.round(trim * clampedRatio);
    const trimRight = trim - trimLeft;

    return clampZoomRange(
      {
        startIndex: current.startIndex + trimLeft,
        endIndex: current.endIndex - trimRight,
      },
      totalCount,
      effectiveMin,
    );
  }

  // direction === 'out'
  if (currentSize >= totalCount) {
    return createFullZoomRange(totalCount);
  }
  const delta = Math.max(1, Math.round(currentSize * 0.4));
  const targetSize = Math.min(totalCount, currentSize + delta);
  const expand = targetSize - currentSize;
  const expandLeft = Math.round(expand * clampedRatio);
  const expandRight = expand - expandLeft;

  let nextStart = current.startIndex - expandLeft;
  let nextEnd = current.endIndex + expandRight;

  if (nextStart < 0) {
    nextEnd = Math.min(totalCount - 1, nextEnd + -nextStart);
    nextStart = 0;
  }
  if (nextEnd > totalCount - 1) {
    nextStart = Math.max(0, nextStart - (nextEnd - (totalCount - 1)));
    nextEnd = totalCount - 1;
  }

  return clampZoomRange({ startIndex: nextStart, endIndex: nextEnd }, totalCount, effectiveMin);
}

/**
 * Pans the current zoom window by `deltaSteps` indices while strictly preserving window width.
 * Positive `deltaSteps` moves right (toward later intervals); negative moves left.
 */
export function panZoomRange(
  range: BarZoomRange,
  totalCount: number,
  deltaSteps: number,
): BarZoomRange {
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  const current = clampZoomRange(range, totalCount, 1);
  const windowSize = current.endIndex - current.startIndex + 1;
  if (windowSize >= totalCount || deltaSteps === 0) {
    return current;
  }

  const maxStart = totalCount - windowSize;
  const nextStart = Math.max(0, Math.min(maxStart, current.startIndex + Math.round(deltaSteps)));
  return {
    startIndex: nextStart,
    endIndex: nextStart + windowSize - 1,
  };
}

/**
 * Converts a local drag-selection inside the currently visible slice into a clamped global zoom range.
 */
export function zoomToSelectionRange(
  currentRange: BarZoomRange,
  totalCount: number,
  localStartIdx: number,
  localEndIdx: number,
  minWindow = MIN_BAR_ZOOM_WINDOW,
): BarZoomRange {
  if (totalCount <= 0) {
    return { startIndex: 0, endIndex: 0 };
  }
  const minLocal = Math.min(localStartIdx, localEndIdx);
  const maxLocal = Math.max(localStartIdx, localEndIdx);

  return clampZoomRange(
    {
      startIndex: currentRange.startIndex + minLocal,
      endIndex: currentRange.startIndex + maxLocal,
    },
    totalCount,
    minWindow,
  );
}

export function sliceDataByZoomRange<T>(data: readonly T[], range: BarZoomRange): T[] {
  if (data.length === 0) return [];
  const clamped = clampZoomRange(range, data.length, 1);
  return data.slice(clamped.startIndex, clamped.endIndex + 1);
}
