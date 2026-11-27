import * as React from 'react';
import { Tabs, TabsList, TabsPanel, TabsTab } from '@ui-sdk/react/tabs';
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from '@ui-sdk/react/accordion';
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from '@ui-sdk/react/collapsible';
import {
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationList,
  PaginationNext,
  PaginationPrevious,
} from '@ui-sdk/react/pagination';
import {
  Menu,
  MenuContent,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuSeparator,
  MenuShortcut,
  MenuTrigger,
} from '@ui-sdk/react/menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@ui-sdk/react/select';
import {
  Tree,
  TreeGroup,
  TreeItem,
  TreeItemIndicator,
  TreeItemLabel,
} from '@ui-sdk/react/tree';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@ui-sdk/react/command';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Folder,
  Plus,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NothingLoader,
  useAsyncAction,
  useResolvedLoading,
  type LoaderVariant,
} from '@nothing-ui/ui';

export interface NothingTabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export function NothingTabs({
  items,
  defaultValue,
  variant = 'underline',
  loading,
  loaderVariant,
  className,
}: {
  items: NothingTabItem[];
  defaultValue?: string;
  variant?: 'underline' | 'pill';
  loading?: boolean;
  loaderVariant?: LoaderVariant;
  className?: string;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <Tabs defaultValue={defaultValue ?? items[0]?.value} className={cn('w-full', className)}>
      <TabsList
        className={cn(
          variant === 'pill'
            ? 'inline-flex items-center gap-1 rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1'
            : 'flex items-center gap-6 border-b border-[var(--nt-line)]'
        )}
      >
        {items.map((item) => (
          <TabsTab
            key={item.value}
            value={item.value}
            className={cn(
              'font-mono text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]',
              variant === 'pill'
                ? 'rounded-full px-3.5 py-1.5 text-[var(--nt-secondary)] hover:text-[var(--nt-primary)] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]'
                : 'border-b-2 border-transparent pb-2.5 text-[var(--nt-secondary)] hover:text-[var(--nt-primary)] data-selected:border-[var(--nt-display)] data-selected:text-[var(--nt-display)]'
            )}
          >
            {item.label}
          </TabsTab>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsPanel key={item.value} value={item.value} className="pt-4">
          {isBusy ? (
            <div className="space-y-2.5" aria-busy="true">
              <NothingLoader variant={resolved.variant} size="xs" label="Loading view..." tone="muted" />
              <div className="nt-skeleton h-3 w-full rounded" />
              <div className="nt-skeleton h-3 w-3/4 rounded" />
            </div>
          ) : (
            item.content
          )}
        </TabsPanel>
      ))}
    </Tabs>
  );
}

const DEFAULT_ACCORDION_ITEMS = [
  {
    value: 'what',
    title: 'How does Nothing UI work with ui-sdk?',
    content:
      'Every interactive component delegates focus management, keyboard roving, popup positioning, and ARIA semantics to @ui-sdk/react while applying monochrome Nothing design tokens.',
  },
  {
    value: 'theme',
    title: 'Does it support both OLED Dark and Light mode?',
    content:
      'Yes. All surfaces, borders, text pairs, and the local-inverse dot field respond automatically to CSS custom properties and Tailwind dark mode.',
  },
  {
    value: 'copy',
    title: 'Can I copy individual components like shadcn/ui?',
    content:
      'Every component in the registry ships with standalone TypeScript source code and CLI install commands so you own every line directly inside your repository.',
  },
];

export function NothingAccordion({
  items = DEFAULT_ACCORDION_ITEMS,
  loading,
  loaderVariant,
}: {
  items?: { value: string; title: string; content: string }[];
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <Accordion
      defaultValue={[items[0]?.value ?? 'what']}
      className="divide-y divide-[var(--nt-line)] border-y border-[var(--nt-line)]"
    >
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger className="group flex w-full items-center justify-between gap-4 py-3.5 text-left font-mono text-xs text-[var(--nt-primary)] transition-colors hover:text-[var(--nt-display)] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]">
              <span>{item.title}</span>
              {isBusy ? (
                <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />
              ) : (
                <Plus className="h-3.5 w-3.5 shrink-0 text-[var(--nt-muted)] transition-transform duration-200 group-data-open:rotate-45 group-data-open:text-[#D71921]" />
              )}
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className="pb-4 text-sm leading-relaxed text-[var(--nt-secondary)]">
            {isBusy ? (
              <div className="space-y-2 pt-1" aria-busy="true">
                <div className="nt-skeleton h-3 w-full rounded" />
                <div className="nt-skeleton h-3 w-5/6 rounded" />
              </div>
            ) : (
              item.content
            )}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function NothingCollapsible({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <Collapsible className="rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-mono text-xs text-[var(--nt-display)]">Hardware Telemetry Log</div>
          <div className="font-mono text-[11px] text-[var(--nt-muted)]">
            {isBusy ? 'Fetching diagnostic entries...' : '3 diagnostic entries'}
          </div>
        </div>
        <CollapsibleTrigger className="group inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--nt-line-2)] px-3 font-mono text-[11px] text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer">
          {isBusy ? (
            <NothingLoader variant={resolved.variant} size="xs" decorative />
          ) : (
            <>
              <span>Toggle</span>
              <ChevronDown className="h-3.5 w-3.5 transition-transform duration-150 group-data-open:rotate-180" />
            </>
          )}
        </CollapsibleTrigger>
      </div>
      <CollapsiblePanel className="mt-3 space-y-1.5 border-t border-[var(--nt-line)] pt-3 font-mono text-xs text-[var(--nt-secondary)] tabular-nums">
        <div className="flex justify-between">
          <span>LED Driver Bus</span>
          <span>Nominal · 120Hz</span>
        </div>
        <div className="flex justify-between">
          <span>Ambient Sensor</span>
          <span>340 lux</span>
        </div>
        <div className="flex justify-between">
          <span>Thermal Envelope</span>
          <span>31.4°C</span>
        </div>
      </CollapsiblePanel>
    </Collapsible>
  );
}

export function NothingPagination({
  pageCount = 10,
  defaultPage = 2,
  loading,
  loaderVariant,
}: {
  pageCount?: number;
  defaultPage?: number;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [page, setPage] = React.useState(defaultPage);
  const [pendingPage, setPendingPage] = React.useState<number | null>(null);
  const asyncAction = useAsyncAction(550);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handlePageChange = (next: number) => {
    if (isBusy) return;
    setPendingPage(next);
    asyncAction.trigger(() => {
      setPage(next);
      setPendingPage(null);
    });
  };

  return (
    <div className="space-y-3" aria-busy={isBusy || undefined}>
      <Pagination
        aria-label="Pagination"
        pageCount={pageCount}
        page={page}
        onPageChange={handlePageChange}
      >
        <PaginationList className={cn('flex flex-wrap items-center gap-1', isBusy && 'opacity-75')}>
          {({ items }) => (
            <>
              <PaginationItem>
                <PaginationPrevious
                  aria-label="Previous page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line-2)] text-[var(--nt-primary)] transition-colors hover:border-[var(--nt-display)] disabled:opacity-35 cursor-pointer"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </PaginationPrevious>
              </PaginationItem>
              {items.map((item) => (
                <PaginationItem key={item}>
                  {typeof item === 'number' ? (
                    <PaginationLink
                      page={item}
                      className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-xs tabular-nums text-[var(--nt-secondary)] transition-colors hover:bg-[var(--nt-raised)] data-current:bg-[var(--nt-inverse-bg)] data-current:text-[var(--nt-inverse-fg)] cursor-pointer"
                    />
                  ) : (
                    <PaginationEllipsis className="px-1.5 font-mono text-xs text-[var(--nt-muted)]">
                      …
                    </PaginationEllipsis>
                  )}
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  aria-label="Next page"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line-2)] text-[var(--nt-primary)] transition-colors hover:border-[var(--nt-display)] disabled:opacity-35 cursor-pointer"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </PaginationNext>
              </PaginationItem>
            </>
          )}
        </PaginationList>
      </Pagination>
      <div className="flex items-center gap-2 font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">
        {isBusy ? (
          <NothingLoader
            variant={resolved.variant}
            size="xs"
            label={`Loading page ${pendingPage ?? page} of ${pageCount}...`}
            tone="display"
          />
        ) : (
          <span>
            Active page {page} of {pageCount}
          </span>
        )}
      </div>
    </div>
  );
}

export function NothingDropdownMenu({
  onAction,
  loading,
  loaderVariant,
}: {
  onAction?: (action: string) => void;
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const [lastAction, setLastAction] = React.useState<string | null>(null);
  const [runningAction, setRunningAction] = React.useState<string | null>(null);
  const asyncAction = useAsyncAction(750);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handleSelect = (val: string) => {
    setRunningAction(val);
    asyncAction.trigger(() => {
      setRunningAction(null);
      setLastAction(val);
      onAction?.(val);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4" aria-busy={isBusy || undefined}>
      <Menu onAction={(val) => handleSelect(val)}>
        <MenuTrigger
          disabled={isBusy}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3.5 font-mono text-xs text-[var(--nt-primary)] transition-colors hover:border-[var(--nt-display)] disabled:opacity-70 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]"
        >
          {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>{isBusy ? `Running ${runningAction ?? 'action'}...` : 'Account Actions'}</span>
          {!isBusy && <ChevronDown className="h-3.5 w-3.5 text-[var(--nt-muted)]" />}
        </MenuTrigger>
        <MenuContent className="z-50 min-w-56 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1.5 shadow-2xl">
          <MenuGroup>
            <MenuGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Account
            </MenuGroupLabel>
            <MenuItem
              value="Profile"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Profile</span>
              <MenuShortcut className="text-[10px] text-[var(--nt-muted)]">⌘P</MenuShortcut>
            </MenuItem>
            <MenuItem
              value="Settings"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Settings</span>
              <MenuShortcut className="text-[10px] text-[var(--nt-muted)]">⌘,</MenuShortcut>
            </MenuItem>
            <MenuItem
              value="Switch workspace"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Switch workspace</span>
              <MenuShortcut className="text-[10px] text-[var(--nt-muted)]">⌘K</MenuShortcut>
            </MenuItem>
          </MenuGroup>
          <MenuSeparator className="my-1.5 h-px bg-[var(--nt-line)]" />
          <MenuItem
            value="Sign out"
            className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[#D71921] cursor-pointer data-highlighted:bg-[#D71921]/10"
          >
            <span>Sign out</span>
          </MenuItem>
        </MenuContent>
      </Menu>
      {lastAction && !isBusy && (
        <span className="font-mono text-xs text-[var(--nt-muted)]">
          Completed: <strong className="text-[var(--nt-primary)]">{lastAction}</strong>
        </span>
      )}
    </div>
  );
}

export function NothingSelect({
  label = 'Audio Profile',
  defaultValue = 'balanced',
  options = [
    { value: 'balanced', label: 'Balanced Studio' },
    { value: 'bass', label: 'Ultra Bass Boost' },
    { value: 'voice', label: 'Voice Clarity' },
    { value: 'custom', label: 'Custom 8-Band EQ' },
  ],
  loading,
  loaderVariant,
}: {
  label?: string;
  defaultValue?: string;
  options?: { value: string; label: string }[];
  loading?: boolean;
  loaderVariant?: LoaderVariant;
}) {
  const resolved = useResolvedLoading({ loading, loaderVariant });
  const isBusy = resolved.isLoading;

  return (
    <div className="flex w-full max-w-xs flex-col gap-1.5" aria-busy={isBusy || undefined}>
      <Select defaultValue={defaultValue} placeholder="Select profile" disabled={isBusy}>
        <SelectLabel className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--nt-secondary)]">
          {label}
        </SelectLabel>
        <SelectTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-primary)] transition-colors hover:border-[var(--nt-display)] disabled:opacity-70 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D71921]">
          {isBusy ? (
            <span className="text-[var(--nt-muted)]">Loading profiles...</span>
          ) : (
            <SelectValue />
          )}
          {isBusy ? (
            <NothingLoader variant={resolved.variant} size="xs" tone="muted" decorative />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
          )}
        </SelectTrigger>
        <SelectContent className="z-50 min-w-[var(--anchor-width)] rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1 shadow-2xl">
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <SelectItemText>{opt.label}</SelectItemText>
              <SelectItemIndicator>
                <Check className="h-3.5 w-3.5 text-[#D71921]" />
              </SelectItemIndicator>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function NothingTreeView({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const [selected, setSelected] = React.useState('src/components/GlyphMatrix.tsx');
  const asyncAction = useAsyncAction(450);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  return (
    <div className="space-y-3" aria-busy={isBusy || undefined}>
      <Tree
        aria-label="Repository files"
        defaultExpanded={['src', 'src/components', 'src/lib']}
        value={selected}
        onValueChange={(v) => {
          setSelected(String(v));
          asyncAction.trigger();
        }}
        className="w-full max-w-sm rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-2 font-mono text-xs"
      >
        <TreeItem value="src">
          <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-primary)] cursor-pointer hover:bg-[var(--nt-raised)]">
            <TreeItemIndicator className="transition-transform duration-150 data-expanded:rotate-90">
              <ChevronRight className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
            </TreeItemIndicator>
            <Folder className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
            <span>src</span>
          </TreeItemLabel>
          <TreeGroup className="pl-4">
            <TreeItem value="src/components">
              <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-primary)] cursor-pointer hover:bg-[var(--nt-raised)]">
                <TreeItemIndicator className="transition-transform duration-150 data-expanded:rotate-90">
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                </TreeItemIndicator>
                <Folder className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                <span>components</span>
              </TreeItemLabel>
              <TreeGroup className="pl-4">
                <TreeItem value="src/components/GlyphMatrix.tsx">
                  <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-secondary)] cursor-pointer hover:bg-[var(--nt-raised)] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]">
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>GlyphMatrix.tsx</span>
                  </TreeItemLabel>
                </TreeItem>
                <TreeItem value="src/components/Button.tsx">
                  <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-secondary)] cursor-pointer hover:bg-[var(--nt-raised)] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]">
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>Button.tsx</span>
                  </TreeItemLabel>
                </TreeItem>
              </TreeGroup>
            </TreeItem>
            <TreeItem value="src/lib">
              <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-primary)] cursor-pointer hover:bg-[var(--nt-raised)]">
                <TreeItemIndicator className="transition-transform duration-150 data-expanded:rotate-90">
                  <ChevronRight className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                </TreeItemIndicator>
                <Folder className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                <span>lib</span>
              </TreeItemLabel>
              <TreeGroup className="pl-4">
                <TreeItem value="src/lib/tokens.ts">
                  <TreeItemLabel className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[var(--nt-secondary)] cursor-pointer hover:bg-[var(--nt-raised)] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]">
                    <FileCode2 className="h-3.5 w-3.5" />
                    <span>tokens.ts</span>
                  </TreeItemLabel>
                </TreeItem>
              </TreeGroup>
            </TreeItem>
          </TreeGroup>
        </TreeItem>
      </Tree>
      <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--nt-muted)]">
        {isBusy ? (
          <NothingLoader variant={resolved.variant} size="xs" label={`Loading ${selected}...`} tone="display" />
        ) : (
          <span>
            Active path: <span className="text-[var(--nt-primary)]">{selected}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function NothingCommandInline({
  loading,
  loaderVariant,
}: {
  loading?: boolean;
  loaderVariant?: LoaderVariant;
} = {}) {
  const [selectedCommand, setSelectedCommand] = React.useState<string | null>(null);
  const [runningCommand, setRunningCommand] = React.useState<string | null>(null);
  const asyncAction = useAsyncAction(750);
  const resolved = useResolvedLoading({
    loading: loading || asyncAction.loading,
    loaderVariant,
  });
  const isBusy = resolved.isLoading;

  const handleRun = (val: string) => {
    setRunningCommand(val);
    asyncAction.trigger(() => {
      setRunningCommand(null);
      setSelectedCommand(val);
    });
  };

  return (
    <div className="space-y-2.5 w-full max-w-md" aria-busy={isBusy || undefined}>
      <Command
        onAction={handleRun}
        className="w-full overflow-hidden rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)]"
      >
        <div className="flex items-center gap-2.5 border-b border-[var(--nt-line)] px-3.5">
          {isBusy ? (
            <NothingLoader variant={resolved.variant} size="xs" tone="display" decorative />
          ) : (
            <Search className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
          )}
          <CommandInput
            aria-label="Filter commands"
            placeholder="Type a command or search..."
            className="h-10 w-full bg-transparent font-mono text-xs text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] focus:outline-none"
          />
          <span className="rounded border border-[var(--nt-line-2)] px-1.5 py-0.5 font-mono text-[9px] text-[var(--nt-muted)]">
            ESC
          </span>
        </div>
        <CommandList className="max-h-56 overflow-y-auto p-1.5">
          <CommandEmpty className="py-6 text-center font-mono text-xs text-[var(--nt-muted)]">
            No matching commands.
          </CommandEmpty>
          <CommandGroup>
            <CommandGroupLabel className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Actions
            </CommandGroupLabel>
            <CommandItem
              value="Refactor selection"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Refactor selection</span>
              <CommandShortcut className="text-[10px] text-[var(--nt-muted)]">⌘⇧R</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="Test Glyph Matrix"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Test Glyph Matrix</span>
              <CommandShortcut className="text-[10px] text-[var(--nt-muted)]">⌘G</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="Export CSS Tokens"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
            >
              <span>Export CSS Tokens</span>
              <CommandShortcut className="text-[10px] text-[var(--nt-muted)]">⌘E</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator className="my-1 h-px bg-[var(--nt-line)]" />
          <CommandGroup>
            <CommandGroupLabel className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
              Recent Files
            </CommandGroupLabel>
            <CommandItem
              value="glyph-matrix.ts"
              className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-secondary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)] data-highlighted:text-[var(--nt-primary)]"
            >
              <span>glyph-matrix.ts</span>
              <span className="text-[10px] text-[var(--nt-muted)]">↵</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
      {isBusy ? (
        <NothingLoader
          variant={resolved.variant}
          size="xs"
          label={`Executing ${runningCommand ?? 'command'}...`}
          tone="display"
        />
      ) : selectedCommand ? (
        <p className="font-mono text-[11px] text-[var(--nt-muted)]">
          Triggered: <span className="text-[var(--nt-display)]">{selectedCommand}</span>
        </p>
      ) : null}
    </div>
  );
}
