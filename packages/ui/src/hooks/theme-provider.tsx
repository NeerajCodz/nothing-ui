import * as React from 'react';
import type { DensityMode, ThemeMode } from '@nothing-ui/tokens';

export const THEME_STORAGE_KEY = 'nthgui-theme';

export function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'high-contrast';
}

export function readStoredTheme(storageKey: string | null = THEME_STORAGE_KEY): ThemeMode | null {
  if (!storageKey || typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return isThemeMode(raw) ? raw : null;
  } catch {
    return null;
  }
}

export function writeStoredTheme(
  theme: ThemeMode,
  storageKey: string | null = THEME_STORAGE_KEY,
): void {
  if (!storageKey || typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(storageKey, theme);
  } catch {
    // Ignore storage quota or restricted-context errors
  }
}

export function applyThemeToRoot(root: HTMLElement, theme: ThemeMode): void {
  root.classList.remove('light', 'dark', 'high-contrast');
  root.setAttribute('data-theme', theme);
  if (theme === 'light') {
    root.classList.add('light');
    root.style.colorScheme = 'light';
  } else if (theme === 'dark') {
    root.classList.add('dark');
    root.style.colorScheme = 'dark';
  } else if (theme === 'high-contrast') {
    root.classList.add('dark', 'high-contrast');
    root.style.colorScheme = 'dark';
  }
}

export interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  cycleTheme: () => void;
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  dir: 'ltr' | 'rtl';
  setDir: (dir: 'ltr' | 'rtl') => void;
}

export const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  defaultTheme = 'dark',
  defaultDensity = 'default',
  defaultDir = 'ltr',
  storageKey = THEME_STORAGE_KEY,
  children,
}: {
  defaultTheme?: ThemeMode;
  defaultDensity?: DensityMode;
  defaultDir?: 'ltr' | 'rtl';
  storageKey?: string | null;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = React.useState<ThemeMode>(
    () => readStoredTheme(storageKey) ?? defaultTheme,
  );
  const [density, setDensity] = React.useState<DensityMode>(defaultDensity);
  const [dir, setDir] = React.useState<'ltr' | 'rtl'>(defaultDir);

  const setTheme = React.useCallback(
    (next: ThemeMode) => {
      setThemeState(next);
      writeStoredTheme(next, storageKey);
    },
    [storageKey],
  );

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      applyThemeToRoot(document.documentElement, theme);
    }
    writeStoredTheme(theme, storageKey);
  }, [theme, storageKey]);

  React.useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return;
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      if (isThemeMode(event.newValue)) {
        setThemeState(event.newValue);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [storageKey]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-density', density);
    }
  }, [density]);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('dir', dir);
    }
  }, [dir]);

  const cycleTheme = React.useCallback(() => {
    setThemeState((prev) => {
      const next: ThemeMode =
        prev === 'dark' ? 'light' : prev === 'light' ? 'high-contrast' : 'dark';
      writeStoredTheme(next, storageKey);
      return next;
    });
  }, [storageKey]);

  const value = React.useMemo(
    () => ({ theme, setTheme, cycleTheme, density, setDensity, dir, setDir }),
    [theme, setTheme, cycleTheme, density, dir],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useOptionalTheme(): ThemeContextValue | null {
  return React.useContext(ThemeContext);
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside a ThemeProvider');
  }
  return ctx;
}

/**
 * Scoped theme & direction container for isolated demo previews.
 * Never mutates document.documentElement globally.
 */
export function ScopedTheme({
  theme,
  density,
  dir,
  className,
  children,
}: {
  theme?: ThemeMode;
  density?: DensityMode;
  dir?: 'ltr' | 'rtl';
  className?: string;
  children: React.ReactNode;
}) {
  const themeClasses =
    theme === 'light'
      ? 'light'
      : theme === 'dark'
        ? 'dark'
        : theme === 'high-contrast'
          ? 'dark high-contrast'
          : '';

  return (
    <div
      data-theme={theme}
      data-density={density}
      dir={dir}
      className={`${themeClasses} ${className ?? ''}`.trim()}
    >
      {children}
    </div>
  );
}
