import * as React from 'react';
import {
  Dialog,
  DialogBackdrop,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@ui-sdk/react/dialog';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@ui-sdk/react/alert-dialog';
import {
  Drawer,
  DrawerBackdrop,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
} from '@ui-sdk/react/drawer';
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from '@ui-sdk/react/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@ui-sdk/react/tooltip';
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastRegion,
  ToastTitle,
  createToaster,
} from '@ui-sdk/react/toast';
import { X } from 'lucide-react';
import { NothingInput } from './Input';
import { NothingSwitch } from './Controls';
import {
  NothingLoader,
  useAsyncAction,
  useResolvedLoading,
} from '@nothing-ui/ui';

export const appToaster = createToaster();

export function NothingToastRegion() {
  return (
    <ToastRegion
      toaster={appToaster}
      className="fixed bottom-5 right-5 z-[100] flex w-[min(92vw,360px)] flex-col gap-2.5"
    >
      {() => (
        <Toast className="flex items-start justify-between gap-3 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 shadow-2xl">
          <div className="min-w-0">
            <ToastTitle className="font-mono text-xs font-medium text-[var(--nt-display)]" />
            <ToastDescription className="mt-1 text-xs text-[var(--nt-secondary)]" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <ToastAction className="rounded-md bg-[var(--nt-inverse-bg)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-inverse-fg)] cursor-pointer hover:opacity-85" />
            <ToastClose
              aria-label="Dismiss notification"
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--nt-muted)] hover:text-[var(--nt-display)] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </ToastClose>
          </div>
        </Toast>
      )}
    </ToastRegion>
  );
}

export function NothingDialogDemo() {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const pairAction = useAsyncAction(950);
  const resetAction = useAsyncAction(950);
  const resolved = useResolvedLoading();

  const pairBusy = pairAction.loading || resolved.isLoading;
  const resetBusy = resetAction.loading || resolved.isLoading;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => {
          if (!pairAction.loading) setDialogOpen(next);
        }}
      >
        <DialogTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[var(--nt-inverse-bg)] px-4 font-mono text-xs text-[var(--nt-inverse-fg)] transition-opacity hover:opacity-85 cursor-pointer">
          {resolved.isLoading && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>{resolved.isLoading ? 'Loading Dialog...' : 'Open Dialog'}</span>
        </DialogTrigger>
        <DialogBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="font-display text-2xl tracking-wide text-[var(--nt-display)]">
                Pair Hardware Node
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-[var(--nt-secondary)]">
                Enter the 8-character identifier printed inside the transparent casing.
              </DialogDescription>
            </div>
            <DialogClose
              aria-label="Close dialog"
              disabled={pairAction.loading}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nt-line-2)] text-[var(--nt-muted)] hover:text-[var(--nt-display)] disabled:opacity-40 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </DialogClose>
          </div>
          <div className="mt-5">
            <NothingInput label="Device Serial" defaultValue="NT-P3-8840" clearable loading={pairAction.loading} />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <DialogClose
              disabled={pairAction.loading}
              className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] disabled:opacity-40 cursor-pointer"
            >
              Cancel
            </DialogClose>
            <button
              type="button"
              disabled={pairBusy}
              aria-busy={pairBusy || undefined}
              onClick={() =>
                pairAction.trigger(() => {
                  setDialogOpen(false);
                  appToaster('Node paired', { description: 'NT-P3-8840 connected via BLE 5.4.' });
                })
              }
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--nt-inverse-bg)] px-4 font-mono text-xs text-[var(--nt-inverse-fg)] hover:opacity-85 disabled:opacity-75 cursor-pointer"
            >
              {pairBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
              <span>{pairBusy ? 'Pairing...' : 'Confirm'}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={alertOpen}
        onOpenChange={(next) => {
          if (!resetAction.loading) setAlertOpen(next);
        }}
      >
        <AlertDialogTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#D71921]/50 bg-[#D71921]/10 px-4 font-mono text-xs text-[#D71921] transition-colors hover:bg-[#D71921] hover:text-white cursor-pointer">
          {resolved.isLoading && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>Reset Glyph Calibration</span>
        </AlertDialogTrigger>
        <AlertDialogBackdrop className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm" />
        <AlertDialogContent className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl">
          <AlertDialogTitle className="font-display text-2xl text-[var(--nt-display)]">
            Erase Calibration?
          </AlertDialogTitle>
          <AlertDialogDescription className="mt-2 text-sm leading-relaxed text-[var(--nt-secondary)]">
            Custom LED sequences and ringtone timings will revert to factory defaults. This cannot be undone.
          </AlertDialogDescription>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialogClose
              disabled={resetAction.loading}
              className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)] disabled:opacity-40 cursor-pointer"
            >
              Keep Custom
            </AlertDialogClose>
            <button
              type="button"
              disabled={resetBusy}
              aria-busy={resetBusy || undefined}
              onClick={() =>
                resetAction.trigger(() => {
                  setAlertOpen(false);
                  appToaster('Calibration reset', {
                    description: 'Factory 25×25 matrix curve restored.',
                  });
                })
              }
              className="inline-flex h-9 items-center gap-2 rounded-md bg-[#D71921] px-4 font-mono text-xs text-white hover:bg-[#b8141b] disabled:opacity-75 cursor-pointer"
            >
              {resetBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
              <span>{resetBusy ? 'Resetting...' : 'Reset Now'}</span>
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function NothingDrawerDemo() {
  const [open, setOpen] = React.useState(false);
  const saveAction = useAsyncAction(950);
  const resolved = useResolvedLoading();
  const isBusy = saveAction.loading || resolved.isLoading;

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        if (!saveAction.loading) setOpen(next);
      }}
    >
      <DrawerTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer">
        {resolved.isLoading && <NothingLoader variant={resolved.variant} size="xs" decorative />}
        <span>{resolved.isLoading ? 'Preparing Sheet...' : 'Open Bottom Sheet'}</span>
      </DrawerTrigger>
      <DrawerBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DrawerContent className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-lg rounded-t-2xl border-x border-t border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-12 rounded-full bg-[var(--nt-line-2)]" aria-hidden="true" />
        <DrawerTitle className="font-display text-2xl text-[var(--nt-display)]">
          Glyph Bedtime Schedule
        </DrawerTitle>
        <DrawerDescription className="mt-1 text-sm text-[var(--nt-secondary)]">
          Automatically silence non-essential LED segments between 23:00 and 07:00.
        </DrawerDescription>
        <div className="mt-5 space-y-3 border-y border-[var(--nt-line)] py-4">
          <NothingSwitch defaultChecked label="Bedtime Dimming" description="Reduce matrix output to 15%" />
          <NothingSwitch defaultChecked tone="signal" label="Allow Priority Contacts" description="Signal Red override for starred callers" />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <DrawerClose
            disabled={saveAction.loading}
            className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)] disabled:opacity-40 cursor-pointer"
          >
            Close
          </DrawerClose>
          <button
            type="button"
            disabled={isBusy}
            aria-busy={isBusy || undefined}
            onClick={() =>
              saveAction.trigger(() => {
                setOpen(false);
                appToaster('Schedule saved', { description: 'Active 23:00 — 07:00 daily.' });
              })
            }
            className="inline-flex h-9 items-center gap-2 rounded-md bg-[var(--nt-inverse-bg)] px-4 font-mono text-xs text-[var(--nt-inverse-fg)] disabled:opacity-75 cursor-pointer"
          >
            {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
            <span>{isBusy ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function NothingPopoverTooltipDemo() {
  const refreshAction = useAsyncAction(850);
  const resolved = useResolvedLoading({ loading: refreshAction.loading });
  const isBusy = resolved.isLoading;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <Popover>
        <PopoverTrigger className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer">
          {isBusy && <NothingLoader variant={resolved.variant} size="xs" decorative />}
          <span>Inspect Auto-Approve</span>
        </PopoverTrigger>
        <PopoverContent className="z-50 w-72 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 shadow-2xl">
          <PopoverTitle className="font-mono text-xs font-medium text-[var(--nt-display)]">
            Auto-Approve Policy
          </PopoverTitle>
          {isBusy ? (
            <div className="mt-3 space-y-2 py-2" aria-busy="true">
              <NothingLoader variant={resolved.variant} size="xs" label="Syncing policy..." tone="muted" />
              <div className="nt-skeleton h-2.5 w-full rounded" />
              <div className="nt-skeleton h-2.5 w-4/5 rounded" />
            </div>
          ) : (
            <PopoverDescription className="mt-1.5 text-xs leading-relaxed text-[var(--nt-secondary)]">
              Trusted workflows execute verified registry updates without pausing for manual step approval.
            </PopoverDescription>
          )}
          <div className="mt-4 flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={isBusy}
              onClick={() => refreshAction.trigger()}
              className="font-mono text-[11px] text-[var(--nt-muted)] hover:text-[var(--nt-display)] disabled:opacity-45 cursor-pointer"
            >
              {isBusy ? 'Refreshing...' : 'Refresh policy'}
            </button>
            <PopoverClose className="rounded-md bg-[var(--nt-inverse-bg)] px-3 py-1 font-mono text-[11px] text-[var(--nt-inverse-fg)] cursor-pointer">
              Understood
            </PopoverClose>
          </div>
        </PopoverContent>
      </Popover>

      <Tooltip>
        <TooltipTrigger className="inline-flex h-9 items-center justify-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-4 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)] cursor-pointer">
          Hover for Tooltip
        </TooltipTrigger>
        <TooltipContent className="z-50 rounded-md bg-[var(--nt-inverse-bg)] px-3 py-1.5 font-mono text-[11px] text-[var(--nt-inverse-fg)] shadow-lg">
          481 addressable LEDs · 25×25 mask
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
