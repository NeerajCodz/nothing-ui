import {
  buildCliExecCommand,
  type SupportedPackageManager,
} from '@nothing-ui/cli';

export interface ComponentAddCliOptions {
  slug: string;
  packageManager?: SupportedPackageManager;
  native?: boolean;
}

export interface CopiedToastPayload {
  title: 'Copied!';
  description: string;
}

/**
 * Pure builder for single-component CLI copy-in commands (e.g. `npx nthgui add button`).
 */
export function buildComponentAddCliCommand({
  slug,
  packageManager = 'npm',
  native = false,
}: ComponentAddCliOptions): string {
  const cleanSlug = slug.trim() || 'button';
  const args = native ? `add ${cleanSlug} --native` : `add ${cleanSlug}`;
  return buildCliExecCommand(packageManager, args);
}

/**
 * Formats the visual toast confirmation payload shown when a CLI command is copied.
 */
export function formatCopiedToastPayload(command: string): CopiedToastPayload {
  return {
    title: 'Copied!',
    description: command.trim(),
  };
}

/**
 * Copies text to the clipboard using the async Clipboard API with a synchronous
 * textarea fallback for restricted iframe or headless browser contexts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy textarea copy fallback
    }
  }

  if (typeof document !== 'undefined' && document.body) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const ok = document.execCommand('copy');
      return ok;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }

  return false;
}
