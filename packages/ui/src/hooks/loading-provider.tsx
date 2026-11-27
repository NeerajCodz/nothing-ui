import * as React from 'react';
import {
  DEFAULT_LOADING_CONFIG,
  resolveLoaderVariant,
  resolveLoadingFlag,
  type LoaderVariant,
  type LoadingConfigState,
  type SkeletonAnimation,
} from '../lib/loading-logic';

const LoadingConfigContext = React.createContext<LoadingConfigState>(DEFAULT_LOADING_CONFIG);

export interface LoadingConfigProviderProps {
  /** Global default loader style ("normal" monochrome spinner by default). */
  variant?: LoaderVariant;
  /** Global skeleton animation style ("shimmer" by default). */
  skeletonAnimation?: SkeletonAnimation;
  /** Optional preview-stage override forcing nested components into loading mode. */
  previewLoading?: boolean;
  children: React.ReactNode;
}

export function LoadingConfigProvider({
  variant,
  skeletonAnimation,
  previewLoading,
  children,
}: LoadingConfigProviderProps) {
  const parent = React.useContext(LoadingConfigContext);
  const value = React.useMemo<LoadingConfigState>(
    () => ({
      variant: variant ?? parent.variant,
      skeletonAnimation: skeletonAnimation ?? parent.skeletonAnimation,
      previewLoading: previewLoading ?? parent.previewLoading,
    }),
    [variant, skeletonAnimation, previewLoading, parent.variant, parent.skeletonAnimation, parent.previewLoading],
  );

  return (
    <LoadingConfigContext.Provider value={value}>
      {children}
    </LoadingConfigContext.Provider>
  );
}

export function useLoadingConfig(): LoadingConfigState {
  return React.useContext(LoadingConfigContext);
}

export function useResolvedLoading(options?: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}): {
  isLoading: boolean;
  loading: boolean;
  variant: LoaderVariant;
  loaderVariant: LoaderVariant;
  skeletonAnimation: SkeletonAnimation;
} {
  const ctx = React.useContext(LoadingConfigContext);
  const isLoading = resolveLoadingFlag(options?.loading, ctx.previewLoading);
  const variant = resolveLoaderVariant(options?.loaderVariant, ctx.variant);
  return {
    isLoading,
    loading: isLoading,
    variant,
    loaderVariant: variant,
    skeletonAnimation: ctx.skeletonAnimation,
  };
}

/**
 * Clean async interaction hook for click-to-load demos and controls.
 * Prevents duplicate clicks while pending and cleans up timers on unmount.
 */
export function useAsyncAction(durationMs = 950) {
  const [loading, setLoading] = React.useState(false);
  const [runCount, setRunCount] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const trigger = React.useCallback(
    (onComplete?: () => void) => {
      if (loading) return;
      setLoading(true);
      timerRef.current = window.setTimeout(() => {
        setLoading(false);
        setRunCount((c) => c + 1);
        timerRef.current = null;
        onComplete?.();
      }, durationMs);
    },
    [loading, durationMs],
  );

  const reset = React.useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setLoading(false);
  }, []);

  return { loading, runCount, trigger, reset };
}
