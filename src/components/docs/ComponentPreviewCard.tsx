import * as React from 'react';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@ui-sdk/react/tabs';
import { Check, Copy, Terminal } from 'lucide-react';
import {
  buildCliInstallCommand,
  type PackageManager,
  type RegistryComponent,
} from '@/lib/registry';
import { cn } from '@/lib/utils';
import { renderComponentDemo } from './ComponentDemos';

interface ComponentPreviewCardProps {
  component: RegistryComponent;
}

const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'bun', 'yarn'];

export function ComponentPreviewCard({ component }: ComponentPreviewCardProps) {
  const [pm, setPm] = React.useState<PackageManager>('npm');
  const [copiedCli, setCopiedCli] = React.useState(false);
  const [copiedSource, setCopiedSource] = React.useState(false);
  const [codeView, setCodeView] = React.useState<'usage' | 'source'>('usage');

  React.useEffect(() => {
    setCodeView('usage');
  }, [component.id]);

  const cliCommand = buildCliInstallCommand(component.id, pm);
  const activeCode = codeView === 'usage' ? component.usageCode : component.code;

  const copyText = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setter(true);
    window.setTimeout(() => setter(false), 1600);
  };

  return (
    <div className="space-y-8">
      {/* Header block */}
      <div className="space-y-2.5 border-b border-[var(--nt-line)] pb-6">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs text-[var(--nt-muted)]">
          <span className="font-display text-sm text-[var(--nt-secondary)]">
            {component.number}
          </span>
          <span aria-hidden="true">·</span>
          <span>{component.category}</span>
          {component.uiSdkPrimitive && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--nt-primary)]">{component.uiSdkPrimitive}</span>
            </>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-4xl tracking-wide text-[var(--nt-display)]">
          {component.name}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--nt-secondary)]">
          {component.summary}
        </p>
      </div>

      {/* Preview / Code Tabs built on @ui-sdk/react/tabs */}
      <Tabs key={component.id} defaultValue="preview" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="inline-flex items-center gap-1 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1">
            <TabsTab
              value="preview"
              className="rounded-md px-3.5 py-1.5 font-mono text-xs text-[var(--nt-secondary)] transition-colors cursor-pointer data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]"
            >
              Preview
            </TabsTab>
            <TabsTab
              value="code"
              className="rounded-md px-3.5 py-1.5 font-mono text-xs text-[var(--nt-secondary)] transition-colors cursor-pointer data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]"
            >
              Code
            </TabsTab>
          </TabsList>

          <span className="font-mono text-[11px] text-[var(--nt-muted)]">
            Interactive · Keyboard accessible
          </span>
        </div>

        <TabsPanel value="preview">
          <div className="nt-card-surface flex min-h-[260px] w-full items-center justify-center rounded-2xl p-6 sm:p-10">
            {renderComponentDemo(component.id)}
          </div>
        </TabsPanel>

        <TabsPanel value="code">
          <div className="overflow-hidden rounded-2xl border border-[var(--nt-line)] bg-[#0b0b0b] text-[#e8e8e8]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#222222] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCodeView('usage')}
                  className={cn(
                    'rounded px-2.5 py-1 font-mono text-[11px] cursor-pointer transition-colors',
                    codeView === 'usage'
                      ? 'bg-white text-black'
                      : 'text-[#9a9a9a] hover:text-white'
                  )}
                >
                  Usage
                </button>
                <button
                  type="button"
                  onClick={() => setCodeView('source')}
                  className={cn(
                    'rounded px-2.5 py-1 font-mono text-[11px] cursor-pointer transition-colors',
                    codeView === 'source'
                      ? 'bg-white text-black'
                      : 'text-[#9a9a9a] hover:text-white'
                  )}
                >
                  Component Source
                </button>
              </div>
              <button
                type="button"
                onClick={() => copyText(activeCode, setCopiedSource)}
                className="inline-flex items-center gap-1.5 rounded border border-[#2d2d2d] px-2.5 py-1 font-mono text-[11px] text-[#cccccc] hover:border-white hover:text-white cursor-pointer"
              >
                {copiedSource ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                <span>{copiedSource ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="max-h-[420px] overflow-auto p-5 font-mono text-xs leading-relaxed">
              <code>{activeCode}</code>
            </pre>
          </div>
        </TabsPanel>
      </Tabs>

      {/* CLI Install Section */}
      <section aria-labelledby="install-heading" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="install-heading"
            className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[var(--nt-display)]"
          >
            Installation
          </h2>
          <div className="flex items-center gap-1 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-0.5">
            {PACKAGE_MANAGERS.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={pm === item}
                onClick={() => setPm(item)}
                className={cn(
                  'rounded px-2.5 py-1 font-mono text-[11px] transition-colors cursor-pointer',
                  pm === item
                    ? 'bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]'
                    : 'text-[var(--nt-secondary)] hover:text-[var(--nt-display)]'
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <Terminal className="h-4 w-4 shrink-0 text-[var(--nt-muted)]" />
            <code className="truncate font-mono text-xs text-[var(--nt-display)]" data-testid="cli-command">
              {cliCommand}
            </code>
          </div>
          <button
            type="button"
            onClick={() => copyText(cliCommand, setCopiedCli)}
            className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[var(--nt-inverse-bg)] px-3 font-mono text-[11px] text-[var(--nt-inverse-fg)] hover:opacity-85 cursor-pointer shrink-0"
          >
            {copiedCli ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copiedCli ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        {component.installDeps.length > 0 && (
          <p className="font-mono text-[11px] text-[var(--nt-muted)]">
            Peer primitives: {component.installDeps.join(' · ')}
          </p>
        )}
      </section>

      {/* Props Reference Table */}
      <section aria-labelledby="props-heading" className="space-y-3">
        <h2
          id="props-heading"
          className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-[var(--nt-display)]"
        >
          API Reference
        </h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)]">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/50 text-[10px] uppercase tracking-[0.12em] text-[var(--nt-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Prop</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Default</th>
                <th className="px-4 py-3 font-medium">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--nt-line)]">
              {component.props.map((prop) => (
                <tr key={prop.name}>
                  <td className="px-4 py-3 font-medium text-[var(--nt-display)] whitespace-nowrap">
                    {prop.name}
                  </td>
                  <td className="px-4 py-3 text-[#D71921]">{prop.type}</td>
                  <td className="px-4 py-3 text-[var(--nt-muted)] whitespace-nowrap">
                    {prop.defaultValue}
                  </td>
                  <td className="px-4 py-3 font-sans text-xs text-[var(--nt-secondary)]">
                    {prop.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
