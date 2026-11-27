import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogTitle,
} from '@ui-sdk/react/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@ui-sdk/react/command';
import { Search, SunMoon, X } from 'lucide-react';
import { COMPONENT_CATEGORIES, REGISTRY_COMPONENTS } from '@/lib/registry';
import type { AppSection } from './TopNav';

interface CommandSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectComponent: (componentId: string) => void;
  onNavigateSection: (section: AppSection) => void;
  onToggleTheme: () => void;
  theme: 'dark' | 'light';
}

export function CommandSearchModal({
  open,
  onOpenChange,
  onSelectComponent,
  onNavigateSection,
  onToggleTheme,
  theme,
}: CommandSearchModalProps) {
  const handleSelect = (val: string) => {
    if (val === '__theme__') {
      onToggleTheme();
      onOpenChange(false);
      return;
    }
    if (val.startsWith('section:')) {
      const section = val.replace('section:', '') as AppSection;
      onNavigateSection(section);
      onOpenChange(false);
      return;
    }
    onSelectComponent(val);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DialogContent className="fixed left-1/2 top-[15vh] z-50 w-[min(92vw,580px)] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] shadow-2xl">
        <DialogTitle className="sr-only">Search Nothing UI Registry</DialogTitle>
        <Command onAction={(val) => handleSelect(val)}>
          <div className="flex items-center gap-3 border-b border-[var(--nt-line)] px-4">
            <Search className="h-4 w-4 shrink-0 text-[var(--nt-muted)]" />
            <CommandInput
              autoFocus
              aria-label="Search components and pages"
              placeholder="Search components, primitives, widgets..."
              className="h-12 w-full bg-transparent font-mono text-xs text-[var(--nt-display)] placeholder:text-[var(--nt-muted)] focus:outline-none"
            />
            <button
              type="button"
              aria-label="Close search"
              onClick={() => onOpenChange(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <CommandList
            aria-label="Registry search results"
            className="max-h-[380px] overflow-y-auto p-2"
          >
            <CommandEmpty className="py-10 text-center font-mono text-xs text-[var(--nt-muted)]">
              No matching components in registry.
            </CommandEmpty>

            <CommandGroup>
              <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
                Quick Actions
              </CommandGroupLabel>
              <CommandItem
                value="__theme__"
                className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
              >
                <span className="inline-flex items-center gap-2">
                  <SunMoon className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </span>
                <span className="text-[10px] text-[var(--nt-muted)]">Theme</span>
              </CommandItem>
              <CommandItem
                value="section:foundations"
                className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
              >
                <span>Open Foundations (Colors, Type, Dot Field)</span>
                <span className="text-[10px] text-[var(--nt-muted)]">Section</span>
              </CommandItem>
              <CommandItem
                value="section:widgets"
                className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
              >
                <span>Open Nothing OS Widgets &amp; Workspace</span>
                <span className="text-[10px] text-[var(--nt-muted)]">Section</span>
              </CommandItem>
            </CommandGroup>

            <CommandSeparator className="my-2 h-px bg-[var(--nt-line)]" />

            {COMPONENT_CATEGORIES.map((category) => (
              <CommandGroup key={category}>
                <CommandGroupLabel className="px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">
                  {category}
                </CommandGroupLabel>
                {REGISTRY_COMPONENTS.filter((c) => c.category === category).map((comp) => (
                  <CommandItem
                    key={comp.id}
                    value={comp.id}
                    className="flex items-center justify-between rounded-lg px-3 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-display text-[11px] text-[var(--nt-muted)]">
                        {comp.number}
                      </span>
                      <span>{comp.name}</span>
                    </span>
                    <span className="text-[10px] text-[var(--nt-muted)]">
                      {comp.uiSdkPrimitive ?? 'Nothing Core'}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
