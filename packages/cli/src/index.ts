export const NTHGUI_PACKAGE_NAME = 'nthgui' as const;
export const NOTHING_UI_BRAND_NAME = 'Nothing UI' as const;

export type SupportedPackageManager = 'bun' | 'pnpm' | 'npm' | 'yarn';
export type SupportedFramework = 'vite' | 'next' | 'expo' | 'tanstack';

export interface ProjectDetection {
  packageManager: SupportedPackageManager;
  hasTypeScript: boolean;
  hasTailwind: boolean;
  framework: SupportedFramework | 'unknown';
}

export interface InstallPlan {
  items: string[];
  dryRun: boolean;
  packageName: typeof NTHGUI_PACKAGE_NAME;
  npmDependencies: string[];
  extraPackagesRequired: 0;
  targetFiles: string[];
  initCommand: string;
  addCommand: string;
  packageInstallCommand: string;
  componentsJson: string;
}

export interface ComponentsJsonConfig {
  $schema?: string;
  brand?: string;
  package: string;
  style: string;
  framework: SupportedFramework;
  tsx: boolean;
  tailwind:
    | { enabled: false; mode: 'native-tokens' }
    | {
        config: string;
        css: string;
        baseColor: string;
        cssVariables: boolean;
      };
  aliases: {
    components: string;
    utils: string;
    tokens: string;
  };
}

export interface OfflineTemplateRecord {
  slug: string;
  title: string;
  category: string;
  description: string;
  webFile?: string;
  nativeFile?: string;
  registryDependencies?: readonly string[];
  peerHints?: readonly string[];
}

export interface ParsedCliArgs {
  command: 'init' | 'add' | 'list' | 'doctor' | 'help' | 'version';
  targets: string[];
  native: boolean;
  dryRun: boolean;
  overwrite: boolean;
  yes: boolean;
  all: boolean;
  framework?: SupportedFramework;
  category?: string;
  unknownFlags: string[];
}

export function detectPackageManager(lockfiles: readonly string[]): SupportedPackageManager {
  if (lockfiles.includes('bun.lock') || lockfiles.includes('bun.lockb')) return 'bun';
  if (lockfiles.includes('pnpm-lock.yaml')) return 'pnpm';
  if (lockfiles.includes('yarn.lock')) return 'yarn';
  return 'npm';
}

export function detectProjectFromFiles(
  rootFiles: readonly string[],
  packageJson?: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  },
): ProjectDetection {
  const deps = {
    ...(packageJson?.dependencies ?? {}),
    ...(packageJson?.devDependencies ?? {}),
  };

  const packageManager = detectPackageManager(rootFiles);
  const hasTypeScript =
    rootFiles.includes('tsconfig.json') || 'typescript' in deps;
  const hasTailwind =
    'tailwindcss' in deps ||
    '@tailwindcss/vite' in deps ||
    rootFiles.some((f) => f.startsWith('tailwind.config.'));

  let framework: SupportedFramework | 'unknown' = 'unknown';
  if ('expo' in deps || 'react-native' in deps || rootFiles.includes('app.json')) {
    if ('expo' in deps || 'react-native' in deps) {
      framework = 'expo';
    }
  }
  if (framework === 'unknown' && ('next' in deps || rootFiles.some((f) => f.startsWith('next.config.')))) {
    framework = 'next';
  }
  if (framework === 'unknown' && ('@tanstack/react-start' in deps || '@tanstack/start' in deps)) {
    framework = 'tanstack';
  }
  if (framework === 'unknown' && ('vite' in deps || rootFiles.some((f) => f.startsWith('vite.config.')))) {
    framework = 'vite';
  }

  return {
    packageManager,
    hasTypeScript,
    hasTailwind,
    framework,
  };
}

export function parseCliArgs(argv: readonly string[]): ParsedCliArgs {
  const flags = {
    native: false,
    dryRun: false,
    overwrite: false,
    yes: false,
    all: false,
    framework: undefined as SupportedFramework | undefined,
    category: undefined as string | undefined,
    unknownFlags: [] as string[],
  };
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '-h' || arg === '--help') {
      return { command: 'help', targets: [], ...flags };
    }
    if (arg === '-v' || arg === '--version') {
      return { command: 'version', targets: [], ...flags };
    }
    if (arg === '--native') {
      flags.native = true;
    } else if (arg === '--dry-run') {
      flags.dryRun = true;
    } else if (arg === '--overwrite' || arg === '-f' || arg === '--force') {
      flags.overwrite = true;
    } else if (arg === '--yes' || arg === '-y') {
      flags.yes = true;
    } else if (arg === '--all') {
      flags.all = true;
    } else if (arg === '--framework' && argv[i + 1]) {
      const candidate = argv[++i];
      if (candidate === 'vite' || candidate === 'next' || candidate === 'expo' || candidate === 'tanstack') {
        flags.framework = candidate;
      } else {
        flags.unknownFlags.push(`--framework=${candidate}`);
      }
    } else if (arg.startsWith('--framework=')) {
      const candidate = arg.slice('--framework='.length);
      if (candidate === 'vite' || candidate === 'next' || candidate === 'expo' || candidate === 'tanstack') {
        flags.framework = candidate;
      } else {
        flags.unknownFlags.push(arg);
      }
    } else if (arg === '--category' && argv[i + 1]) {
      flags.category = argv[++i];
    } else if (arg.startsWith('--category=')) {
      flags.category = arg.slice('--category='.length);
    } else if (arg.startsWith('-')) {
      flags.unknownFlags.push(arg);
    } else {
      positionals.push(arg);
    }
  }

  const [rawCmd, ...targets] = positionals;
  if (!rawCmd || rawCmd === 'help') {
    return { command: 'help', targets: [], ...flags };
  }
  if (rawCmd === 'init' || rawCmd === 'add' || rawCmd === 'list' || rawCmd === 'doctor') {
    return { command: rawCmd, targets, ...flags };
  }
  return { command: 'help', targets: positionals, ...flags };
}

export function buildCliExecCommand(
  pm: SupportedPackageManager,
  args: string,
): string {
  switch (pm) {
    case 'bun':
      return `bunx --bun ${NTHGUI_PACKAGE_NAME} ${args}`;
    case 'pnpm':
      return `pnpm dlx ${NTHGUI_PACKAGE_NAME} ${args}`;
    case 'yarn':
      return `yarn dlx ${NTHGUI_PACKAGE_NAME} ${args}`;
    default:
      return `npx ${NTHGUI_PACKAGE_NAME} ${args}`;
  }
}

export function buildPackageInstallCommand(
  pm: SupportedPackageManager,
): string {
  switch (pm) {
    case 'bun':
      return `bun add ${NTHGUI_PACKAGE_NAME}`;
    case 'pnpm':
      return `pnpm add ${NTHGUI_PACKAGE_NAME}`;
    case 'yarn':
      return `yarn add ${NTHGUI_PACKAGE_NAME}`;
    default:
      return `npm install ${NTHGUI_PACKAGE_NAME}`;
  }
}

export function buildComponentsJson(framework: SupportedFramework): string {
  const isNext = framework === 'next';
  const isExpo = framework === 'expo';
  const config: ComponentsJsonConfig = {
    $schema: 'https://nthgui.dev/schema.json',
    brand: NOTHING_UI_BRAND_NAME,
    package: NTHGUI_PACKAGE_NAME,
    style: 'nothing-default',
    framework,
    tsx: true,
    tailwind: isExpo
      ? { enabled: false, mode: 'native-tokens' }
      : {
          config: '',
          css: isNext ? 'app/globals.css' : 'src/index.css',
          baseColor: 'obsidian',
          cssVariables: true,
        },
    aliases: {
      components: isExpo ? '@/components/nthgui-native' : '@/components/nthgui',
      utils: '@/lib/utils',
      tokens: isExpo ? '@/theme/nothing-native' : '@/styles/nothing-tokens.css',
    },
  };
  return JSON.stringify(config, null, 2);
}

export function createDryRunPlan(
  items: readonly string[],
  pm: SupportedPackageManager,
  framework: SupportedFramework = 'vite',
): InstallPlan {
  const cleanItems = items.length > 0 ? [...items] : ['button'];
  const isExpo = framework === 'expo';
  const prefix = isExpo ? 'components/nthgui-native' : 'src/components/nthgui';
  const suffix = isExpo ? ' --native' : '';

  return {
    items: cleanItems,
    dryRun: true,
    packageName: NTHGUI_PACKAGE_NAME,
    npmDependencies: [NTHGUI_PACKAGE_NAME],
    extraPackagesRequired: 0,
    targetFiles: cleanItems.map((slug) => `${prefix}/${slug}.tsx`),
    initCommand: buildCliExecCommand(pm, `init${isExpo ? ' --native' : ''}`),
    addCommand: buildCliExecCommand(pm, `add ${cleanItems.join(' ')}${suffix}`),
    packageInstallCommand: buildPackageInstallCommand(pm),
    componentsJson: buildComponentsJson(framework),
  };
}

/**
 * Rewrites internal workspace imports so copied files compile cleanly in an external project.
 */
export function rewriteTemplateImports(
  source: string,
  utilsAlias = '@/lib/utils',
): string {
  return source
    .replaceAll("from '@nothing-ui/dot-icons/react'", `from '${NTHGUI_PACKAGE_NAME}/icons'`)
    .replaceAll('from "@nothing-ui/dot-icons/react"', `from "${NTHGUI_PACKAGE_NAME}/icons"`)
    .replaceAll("from '@nothing-ui/dot-icons/native'", `from '${NTHGUI_PACKAGE_NAME}/native'`)
    .replaceAll('from "@nothing-ui/dot-icons/native"', `from "${NTHGUI_PACKAGE_NAME}/native"`)
    .replaceAll("from '@nothing-ui/dot-icons'", `from '${NTHGUI_PACKAGE_NAME}/icons'`)
    .replaceAll('from "@nothing-ui/dot-icons"', `from "${NTHGUI_PACKAGE_NAME}/icons"`)
    .replaceAll("from '@nothing-ui/core'", `from '${NTHGUI_PACKAGE_NAME}/glyph'`)
    .replaceAll('from "@nothing-ui/core"', `from "${NTHGUI_PACKAGE_NAME}/glyph"`)
    .replaceAll("from '@nothing-ui/tokens'", `from '${NTHGUI_PACKAGE_NAME}/tokens'`)
    .replaceAll('from "@nothing-ui/tokens"', `from "${NTHGUI_PACKAGE_NAME}/tokens"`)
    .replaceAll("from '@nothing-ui/ui-native'", `from '${NTHGUI_PACKAGE_NAME}/native'`)
    .replaceAll('from "@nothing-ui/ui-native"', `from "${NTHGUI_PACKAGE_NAME}/native"`)
    .replaceAll("from '@nothing-ui/ui'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll('from "@nothing-ui/ui"', `from "${NTHGUI_PACKAGE_NAME}"`)
    .replaceAll("from 'nothing-ui/native'", `from '${NTHGUI_PACKAGE_NAME}/native'`)
    .replaceAll('from "nothing-ui/native"', `from "${NTHGUI_PACKAGE_NAME}/native"`)
    .replaceAll("from 'nothing-ui/icons'", `from '${NTHGUI_PACKAGE_NAME}/icons'`)
    .replaceAll('from "nothing-ui/icons"', `from "${NTHGUI_PACKAGE_NAME}/icons"`)
    .replaceAll("from 'nothing-ui/glyph'", `from '${NTHGUI_PACKAGE_NAME}/glyph'`)
    .replaceAll('from "nothing-ui/glyph"', `from "${NTHGUI_PACKAGE_NAME}/glyph"`)
    .replaceAll("from 'nothing-ui/tokens'", `from '${NTHGUI_PACKAGE_NAME}/tokens'`)
    .replaceAll('from "nothing-ui/tokens"', `from "${NTHGUI_PACKAGE_NAME}/tokens"`)
    .replaceAll("from 'nothing-ui'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll('from "nothing-ui"', `from "${NTHGUI_PACKAGE_NAME}"`)
    .replaceAll("from '../lib/cn'", `from '${utilsAlias}'`)
    .replaceAll('from "../lib/cn"', `from "${utilsAlias}"`)
    .replaceAll("from '@/lib/utils'", `from '${utilsAlias}'`)
    .replaceAll('from "@/lib/utils"', `from "${utilsAlias}"`)
    .replaceAll("from '@/lib/rotary'", `from '${NTHGUI_PACKAGE_NAME}/glyph'`)
    .replaceAll("from '@/lib/dot-icons'", `from '${NTHGUI_PACKAGE_NAME}/icons'`)
    .replaceAll("from '../hooks/loading-provider'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll("from '../lib/loading-logic'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll("from './loader'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll("from './button'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll("from '@/components/nothing/Button'", `from '${NTHGUI_PACKAGE_NAME}'`)
    .replaceAll("from '@/components/nothing/Feedback'", `from '${NTHGUI_PACKAGE_NAME}'`);
}

export function resolveAliasToRelativePath(
  alias: string,
  framework: SupportedFramework,
): string {
  const stripped = alias.replace(/^@\//, '').replace(/^~\//, '');
  if (framework === 'next' || framework === 'expo') {
    return stripped;
  }
  if (stripped.startsWith('src/')) {
    return stripped;
  }
  return `src/${stripped}`;
}
