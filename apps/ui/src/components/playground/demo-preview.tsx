import * as React from 'react';
import {
  ArrowCounterClockwise,
  Check,
  Code,
  Copy,
  Desktop,
  DeviceMobile,
  DeviceTablet,
  Eye,
  TextAlignLeft,
  TextAlignRight,
} from '@phosphor-icons/react';
import type { ThemeMode } from '@nothing-ui/tokens';
import {
  DEFAULT_LOADER_VARIANT,
  LoadingConfigProvider,
  NothingLoader,
  ScopedTheme,
  cn,
  type ComponentLoadingProfile,
  type LoaderVariant,
} from '@nothing-ui/ui';

type ViewportPreset = 'full' | 'tablet' | 'phone';

class DemoErrorBoundary extends React.Component<
  { children: React.ReactNode; resetKey: number },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode; resetKey: number }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Demo render error' };
  }

  componentDidUpdate(prevProps: { resetKey: number }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, message: '' });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-[var(--nt-accent)] bg-[var(--nt-accent-soft)] p-5 font-mono text-xs text-[var(--nt-display)]"
        >
          Preview error: {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}

export interface DemoPreviewProps {
  title?: string;
  description?: string;
  sourceCode: string;
  sourceLabel?: string;
  nativeCode?: string;
  nativeLabel?: string;
  nativeNotes?: string;
  nativePrimitives?: string[];
  nativeCliCommand?: string;
  loadingProfile?: ComponentLoadingProfile;
  children: React.ReactNode;
}

export function DemoPreview({
  title,
  description,
  sourceCode,
  sourceLabel,
  nativeCode,
  nativeLabel,
  nativeNotes,
  nativePrimitives,
  nativeCliCommand,
  loadingProfile,
  children,
}: DemoPreviewProps) {
  const [tab, setTab] = React.useState<'preview' | 'code' | 'native'>('preview');
  const [viewport, setViewport] = React.useState<ViewportPreset>('full');
  const [scopedTheme, setScopedTheme] = React.useState<'inherit' | ThemeMode>('inherit');
  const [rtl, setRtl] = React.useState(false);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [loaderVariant, setLoaderVariant] = React.useState<LoaderVariant>(DEFAULT_LOADER_VARIANT);
  const [resetCount, setResetCount] = React.useState(0);
  const [copied, setCopied] = React.useState(false);

  const activeCode = tab === 'native' && nativeCode ? nativeCode : sourceCode;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const handleReset = () => {
    setPreviewLoading(false);
    setLoaderVariant(DEFAULT_LOADER_VARIANT);
    setResetCount((c) => c + 1);
  };

  const widthClass =
    viewport === 'phone'
      ? 'max-w-[375px] mx-auto border-x border-[var(--nt-line)]'
      : viewport === 'tablet'
        ? 'max-w-[768px] mx-auto border-x border-[var(--nt-line)]'
        : 'w-full';

  return (
    <div className="space-y-3">
      {(title || description) && (
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          {title && (
            <h3 className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-[var(--nt-display)]">
              {title}
            </h3>
          )}
          {description && <p className="text-xs text-[var(--nt-secondary)]">{description}</p>}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] px-3 py-2">
        <div
          role="tablist"
          aria-label="Demo view mode"
          className="inline-flex items-center gap-1 rounded-lg bg-[var(--nt-raised)] p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'preview'}
            onClick={() => setTab('preview')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
              tab === 'preview'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'code'}
            onClick={() => setTab('code')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
              tab === 'code'
                ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
            )}
          >
            <Code className="h-3.5 w-3.5" />
            Web Code
          </button>
          {nativeCode && (
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'native'}
              onClick={() => setTab('native')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1 font-mono text-xs whitespace-nowrap transition-colors cursor-pointer',
                tab === 'native'
                  ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                  : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
              )}
            >
              <DeviceMobile className="h-3.5 w-3.5" />
              React Native
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {tab === 'preview' && (
            <>
              <button
                type="button"
                data-testid="preview-loading-toggle"
                aria-label="Toggle loading state"
                aria-pressed={previewLoading}
                onClick={() => setPreviewLoading((prev) => !prev)}
                className={cn(
                  'inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                  previewLoading
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                {previewLoading && <NothingLoader variant={loaderVariant} size="xs" decorative />}
                <span>Loading</span>
              </button>

              <select
                data-testid="preview-loader-variant"
                aria-label="Loader style"
                value={loaderVariant}
                onChange={(e) => setLoaderVariant(e.target.value as LoaderVariant)}
                className="h-8 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2 font-mono text-[11px] text-[var(--nt-secondary)] focus:outline-none focus:border-[var(--nt-display)] cursor-pointer"
              >
                <option value="normal">Loader: Normal</option>
                <option value="dots">Loader: Dots</option>
                <option value="bars">Loader: Bars</option>
                <option value="pulse">Loader: Pulse</option>
              </select>

              <div className="inline-flex items-center rounded-lg border border-[var(--nt-line)] p-0.5">
                {(
                  [
                    { id: 'full', label: 'Full width', icon: Desktop },
                    { id: 'tablet', label: 'Tablet 768px', icon: DeviceTablet },
                    { id: 'phone', label: 'Phone 375px', icon: DeviceMobile },
                  ] as const
                ).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    type="button"
                    aria-label={label}
                    aria-pressed={viewport === id}
                    onClick={() => setViewport(id)}
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer',
                      viewport === id
                        ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                        : 'text-[var(--nt-muted)] hover:text-[var(--nt-display)]'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>

              <button
                type="button"
                aria-label="Toggle RTL direction"
                aria-pressed={rtl}
                onClick={() => setRtl((prev) => !prev)}
                className={cn(
                  'inline-flex h-8 items-center gap-1 rounded-lg border px-2.5 font-mono text-[11px] whitespace-nowrap transition-colors cursor-pointer',
                  rtl
                    ? 'border-[var(--nt-display)] bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                {rtl ? <TextAlignRight className="h-3.5 w-3.5" /> : <TextAlignLeft className="h-3.5 w-3.5" />}
                {rtl ? 'RTL' : 'LTR'}
              </button>

              <select
                aria-label="Scoped preview theme"
                value={scopedTheme}
                onChange={(e) => setScopedTheme(e.target.value as 'inherit' | ThemeMode)}
                className="h-8 rounded-lg border border-[var(--nt-line)] bg-[var(--nt-surface)] px-2 font-mono text-[11px] text-[var(--nt-secondary)] focus:outline-none focus:border-[var(--nt-display)] cursor-pointer"
              >
                <option value="inherit">Theme: Auto</option>
                <option value="dark">Scoped: Dark</option>
                <option value="light">Scoped: Light</option>
                <option value="high-contrast">Scoped: High Contrast</option>
              </select>

              <button
                type="button"
                aria-label="Reset demo state"
                onClick={handleReset}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--nt-line)] text-[var(--nt-secondary)] hover:text-[var(--nt-display)] cursor-pointer"
              >
                <ArrowCounterClockwise className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--nt-line)] px-2.5 font-mono text-[11px] text-[var(--nt-display)] hover:bg-[var(--nt-raised)] whitespace-nowrap cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-[var(--nt-success)]" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied' : tab === 'native' ? 'Copy RN' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stage — preserves mounted demo state when switching Preview/Code/Native */}
      <div className={tab === 'preview' ? 'block' : 'hidden'}>
        <ScopedTheme
          theme={scopedTheme === 'inherit' ? undefined : scopedTheme}
          dir={rtl ? 'rtl' : 'ltr'}
          className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)] transition-colors"
        >
          {previewLoading && loadingProfile && (
            <div
              data-testid="preview-loading-banner"
              className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 px-4 py-2 font-mono text-[11px] text-[var(--nt-secondary)]"
            >
              <NothingLoader
                variant={loaderVariant}
                size="xs"
                label={loadingProfile.pendingCopy}
                tone="display"
              />
              <span className="text-[var(--nt-muted)]">
                {loadingProfile.archetypeLabel} · loaderVariant=&quot;{loaderVariant}&quot;
              </span>
            </div>
          )}
          <div
            data-testid="demo-preview-stage"
            data-viewport={viewport}
            data-preview-loading={previewLoading ? 'true' : 'false'}
            data-loader-variant={loaderVariant}
            dir={rtl ? 'rtl' : 'ltr'}
            className={cn(
              'min-h-[260px] flex items-center justify-center p-6 sm:p-8 text-[var(--nt-primary)] transition-all',
              widthClass
            )}
          >
            <LoadingConfigProvider variant={loaderVariant} previewLoading={previewLoading}>
              <DemoErrorBoundary resetKey={resetCount}>
                <React.Fragment key={resetCount}>{children}</React.Fragment>
              </DemoErrorBoundary>
            </LoadingConfigProvider>
          </div>
        </ScopedTheme>
      </div>

      {tab === 'code' && (
        <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
          {sourceLabel && (
            <div className="flex items-center justify-between border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 px-4 py-2 font-mono text-[11px] text-[var(--nt-muted)]">
              <span>{sourceLabel}</span>
              <span>Source-backed TSX</span>
            </div>
          )}
          <pre className="max-h-[440px] overflow-auto p-5 font-mono text-xs leading-relaxed text-[var(--nt-primary)]">
            <code>{sourceCode}</code>
          </pre>
        </div>
      )}

      {tab === 'native' && nativeCode && (
        <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 px-4 py-2.5 font-mono text-[11px] text-[var(--nt-muted)]">
            <span className="text-[var(--nt-display)]">{nativeLabel ?? 'nthgui/native'}</span>
            {nativeCliCommand && <span>{nativeCliCommand}</span>}
          </div>
          {(nativeNotes || (nativePrimitives && nativePrimitives.length > 0)) && (
            <div className="border-b border-[var(--nt-line)] bg-[var(--nt-bg)]/50 px-4 py-2.5 space-y-1">
              {nativeNotes && (
                <p className="text-xs text-[var(--nt-secondary)] leading-relaxed">{nativeNotes}</p>
              )}
              {nativePrimitives && nativePrimitives.length > 0 && (
                <div className="font-mono text-[11px] text-[var(--nt-muted)]">
                  RN Primitives: <span className="text-[var(--nt-display)]">{nativePrimitives.join(' · ')}</span>
                </div>
              )}
            </div>
          )}
          <pre
            data-testid="native-component-code"
            className="max-h-[440px] overflow-auto p-5 font-mono text-xs leading-relaxed text-[var(--nt-primary)]"
          >
            <code>{nativeCode}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
