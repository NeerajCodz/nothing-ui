import fs from 'node:fs';
import path from 'node:path';
import {
  NOTHING_UI_BRAND_NAME,
  NTHGUI_PACKAGE_NAME,
  buildComponentsJson,
  detectProjectFromFiles,
  parseCliArgs,
  resolveAliasToRelativePath,
  rewriteTemplateImports,
  type ComponentsJsonConfig,
  type OfflineTemplateRecord,
  type SupportedFramework,
} from './index';

export interface CliRunContext {
  cwd: string;
  version: string;
  templates: readonly OfflineTemplateRecord[];
  tokensCss: string;
  nativeThemeFile: string;
  utilsFile: string;
  stdout?: (line: string) => void;
  stderr?: (line: string) => void;
}

export interface CliRunResult {
  exitCode: number;
  writtenFiles: string[];
  skippedFiles: string[];
}

function readJsonSafe<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return null;
  }
}

function writeFileTracked(
  cwd: string,
  relPath: string,
  content: string,
  opts: { dryRun: boolean; overwrite: boolean },
  written: string[],
  skipped: string[],
): 'written' | 'skipped' | 'dry-run' {
  const absPath = path.join(cwd, relPath);
  const exists = fs.existsSync(absPath);
  if (exists && !opts.overwrite) {
    skipped.push(relPath);
    return 'skipped';
  }
  if (opts.dryRun) {
    written.push(relPath);
    return 'dry-run';
  }
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, content, 'utf8');
  written.push(relPath);
  return 'written';
}

function printHelp(stdout: (line: string) => void, version: string): void {
  stdout(`${NOTHING_UI_BRAND_NAME} CLI (${NTHGUI_PACKAGE_NAME} v${version})`);
  stdout('');
  stdout('Usage:');
  stdout(`  npx ${NTHGUI_PACKAGE_NAME} init [--native] [--framework vite|next|tanstack|expo] [--dry-run] [--overwrite]`);
  stdout(`  npx ${NTHGUI_PACKAGE_NAME} add <slug...> [--native] [--all] [--dry-run] [--overwrite]`);
  stdout(`  npx ${NTHGUI_PACKAGE_NAME} list [--native] [--category <name>]`);
  stdout(`  npx ${NTHGUI_PACKAGE_NAME} doctor`);
  stdout('');
  stdout('Single-package imports (zero extra installs):');
  stdout(`  npm install ${NTHGUI_PACKAGE_NAME}`);
  stdout(`  import { Button } from "${NTHGUI_PACKAGE_NAME}"`);
  stdout(`  import { Button } from "${NTHGUI_PACKAGE_NAME}/native"`);
  stdout(`  import { GlyphMatrix } from "${NTHGUI_PACKAGE_NAME}/glyph"`);
  stdout(`  import { DotIcon } from "${NTHGUI_PACKAGE_NAME}/icons"`);
  stdout(`  import "${NTHGUI_PACKAGE_NAME}/styles.css"`);
}

function suggestSlugs(
  input: string,
  templates: readonly OfflineTemplateRecord[],
): string[] {
  const q = input.toLowerCase();
  return templates
    .filter((t) => t.slug.includes(q) || q.includes(t.slug) || t.title.toLowerCase().includes(q))
    .slice(0, 4)
    .map((t) => t.slug);
}

export function runCli(argv: readonly string[], ctx: CliRunContext): CliRunResult {
  const stdout = ctx.stdout ?? ((line: string) => console.log(line));
  const stderr = ctx.stderr ?? ((line: string) => console.error(line));
  const parsed = parseCliArgs(argv);
  const writtenFiles: string[] = [];
  const skippedFiles: string[] = [];

  if (parsed.unknownFlags.length > 0) {
    stderr(`Unknown option(s): ${parsed.unknownFlags.join(', ')}`);
    stderr(`Run "npx ${NTHGUI_PACKAGE_NAME} --help" for usage.`);
    return { exitCode: 1, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'version') {
    stdout(`${NTHGUI_PACKAGE_NAME} v${ctx.version} (${NOTHING_UI_BRAND_NAME})`);
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'help') {
    printHelp(stdout, ctx.version);
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'list') {
    const filtered = ctx.templates.filter((item) => {
      if (parsed.native && !item.nativeFile) return false;
      if (!parsed.native && !item.webFile) return false;
      if (parsed.category && !item.category.toLowerCase().includes(parsed.category.toLowerCase())) {
        return false;
      }
      return true;
    });

    stdout(
      `${NOTHING_UI_BRAND_NAME} (${NTHGUI_PACKAGE_NAME}) — ${filtered.length} offline ${
        parsed.native ? 'React Native' : 'Web'
      } templates:`,
    );
    stdout('');

    const grouped = new Map<string, OfflineTemplateRecord[]>();
    for (const item of filtered) {
      const bucket = grouped.get(item.category) ?? [];
      bucket.push(item);
      grouped.set(item.category, bucket);
    }

    for (const [category, items] of grouped) {
      stdout(`[${category}] (${items.length})`);
      for (const item of items) {
        const platforms = [item.webFile ? 'web' : null, item.nativeFile ? 'native' : null]
          .filter(Boolean)
          .join('+');
        stdout(`  ${item.slug.padEnd(26)} ${item.title} (${platforms})`);
      }
      stdout('');
    }
    stdout(`Add components: npx ${NTHGUI_PACKAGE_NAME} add <slug>${parsed.native ? ' --native' : ''}`);
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'init') {
    const rootFiles = fs.existsSync(ctx.cwd) ? fs.readdirSync(ctx.cwd) : [];
    const pkgJson = readJsonSafe<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>(path.join(ctx.cwd, 'package.json'));

    const detected = detectProjectFromFiles(rootFiles, pkgJson ?? undefined);
    const framework: SupportedFramework = parsed.native
      ? 'expo'
      : parsed.framework ?? (detected.framework === 'unknown' ? 'vite' : detected.framework);

    const configStr = buildComponentsJson(framework);
    const config = JSON.parse(configStr) as ComponentsJsonConfig;

    stdout(`Initializing ${NOTHING_UI_BRAND_NAME} (${NTHGUI_PACKAGE_NAME}) for ${framework}...`);

    const configStatus = writeFileTracked(
      ctx.cwd,
      'components.json',
      `${configStr}\n`,
      { dryRun: parsed.dryRun, overwrite: parsed.overwrite },
      writtenFiles,
      skippedFiles,
    );
    stdout(`  ${configStatus === 'skipped' ? '• skipped' : '+'} components.json`);

    if (framework === 'expo') {
      const themeRel = `${resolveAliasToRelativePath(config.aliases.tokens, framework)}.ts`;
      const themeStatus = writeFileTracked(
        ctx.cwd,
        themeRel,
        ctx.nativeThemeFile,
        { dryRun: parsed.dryRun, overwrite: parsed.overwrite },
        writtenFiles,
        skippedFiles,
      );
      stdout(`  ${themeStatus === 'skipped' ? '• skipped' : '+'} ${themeRel}`);
    } else {
      const tokenRel = resolveAliasToRelativePath(config.aliases.tokens, framework);
      const tokenStatus = writeFileTracked(
        ctx.cwd,
        tokenRel,
        ctx.tokensCss,
        { dryRun: parsed.dryRun, overwrite: parsed.overwrite },
        writtenFiles,
        skippedFiles,
      );
      stdout(`  ${tokenStatus === 'skipped' ? '• skipped' : '+'} ${tokenRel}`);

      const utilsRel = `${resolveAliasToRelativePath(config.aliases.utils, framework)}.ts`;
      const utilsStatus = writeFileTracked(
        ctx.cwd,
        utilsRel,
        ctx.utilsFile,
        { dryRun: parsed.dryRun, overwrite: parsed.overwrite },
        writtenFiles,
        skippedFiles,
      );
      stdout(`  ${utilsStatus === 'skipped' ? '• skipped' : '+'} ${utilsRel}`);
    }

    stdout('');
    if (parsed.dryRun) {
      stdout('Dry run complete — no files were modified.');
    } else {
      stdout(`Ready. Add components with: npx ${NTHGUI_PACKAGE_NAME} add button${framework === 'expo' ? ' --native' : ''}`);
      if (framework !== 'expo') {
        stdout(`Or import directly from "${NTHGUI_PACKAGE_NAME}" after running: npm install ${NTHGUI_PACKAGE_NAME}`);
      }
    }
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'add') {
    const existingConfig = readJsonSafe<ComponentsJsonConfig>(path.join(ctx.cwd, 'components.json'));
    const isNative = parsed.native || existingConfig?.framework === 'expo';
    const framework: SupportedFramework = isNative
      ? 'expo'
      : existingConfig?.framework ?? 'vite';
    const defaultConfig = JSON.parse(buildComponentsJson(framework)) as ComponentsJsonConfig;
    const config = existingConfig ?? defaultConfig;

    const requestedSlugs = parsed.all
      ? ctx.templates
          .filter((t) => (isNative ? Boolean(t.nativeFile) : Boolean(t.webFile)))
          .map((t) => t.slug)
      : parsed.targets;

    if (requestedSlugs.length === 0) {
      stderr(`Please specify at least one component slug, or pass --all.`);
      stderr(`Example: npx ${NTHGUI_PACKAGE_NAME} add button glyph-matrix`);
      return { exitCode: 1, writtenFiles, skippedFiles };
    }

    const templateBySlug = new Map(ctx.templates.map((t) => [t.slug, t]));
    const resolvedQueue: OfflineTemplateRecord[] = [];
    const seen = new Set<string>();

    const enqueue = (slug: string): boolean => {
      const normalized = slug.trim().toLowerCase();
      if (seen.has(normalized)) return true;
      const entry = templateBySlug.get(normalized);
      if (!entry) {
        const hints = suggestSlugs(normalized, ctx.templates);
        stderr(`Unknown component "${slug}".`);
        if (hints.length > 0) {
          stderr(`Did you mean: ${hints.join(', ')}?`);
        }
        stderr(`Run "npx ${NTHGUI_PACKAGE_NAME} list" to see all available components.`);
        return false;
      }
      seen.add(normalized);
      for (const dep of entry.registryDependencies ?? []) {
        if (templateBySlug.has(dep)) {
          enqueue(dep);
        }
      }
      resolvedQueue.push(entry);
      return true;
    };

    for (const slug of requestedSlugs) {
      if (!enqueue(slug)) {
        return { exitCode: 1, writtenFiles, skippedFiles };
      }
    }

    const baseDir = resolveAliasToRelativePath(
      isNative
        ? existingConfig?.framework === 'expo'
          ? config.aliases.components
          : '@/components/nthgui-native'
        : config.aliases.components,
      framework,
    );

    stdout(
      `Resolved ${resolvedQueue.length} ${isNative ? 'React Native' : 'Web'} template(s) from offline ${NTHGUI_PACKAGE_NAME} registry:`,
    );

    const peerHints = new Set<string>();
    for (const item of resolvedQueue) {
      const rawContent = isNative ? item.nativeFile : item.webFile;
      if (!rawContent) {
        stderr(`Skipping "${item.slug}" — no ${isNative ? 'React Native' : 'Web'} template available.`);
        continue;
      }
      const normalizedContent = rewriteTemplateImports(rawContent, config.aliases.utils);
      const targetRel = path.posix.join(baseDir, `${item.slug}.tsx`);
      const status = writeFileTracked(
        ctx.cwd,
        targetRel,
        normalizedContent.endsWith('\n') ? normalizedContent : `${normalizedContent}\n`,
        { dryRun: parsed.dryRun, overwrite: parsed.overwrite },
        writtenFiles,
        skippedFiles,
      );
      stdout(`  ${status === 'skipped' ? '• skipped (exists)' : '+'} ${targetRel}`);
      for (const hint of item.peerHints ?? []) {
        peerHints.add(hint);
      }
    }

    stdout('');
    if (parsed.dryRun) {
      stdout('Dry run complete — no files were written.');
    } else {
      stdout(
        `Done. Wrote ${writtenFiles.length} file(s)${
          skippedFiles.length > 0 ? `, skipped ${skippedFiles.length} existing (use --overwrite to replace)` : ''
        }.`,
      );
      if (peerHints.size > 0) {
        stdout(`Peer notes: ${Array.from(peerHints).join(', ')}`);
      }
    }
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  if (parsed.command === 'doctor') {
    stdout(`${NOTHING_UI_BRAND_NAME} (${NTHGUI_PACKAGE_NAME}) Doctor`);
    stdout('');

    const configPath = path.join(ctx.cwd, 'components.json');
    const config = readJsonSafe<ComponentsJsonConfig>(configPath);
    const pkgJson = readJsonSafe<{
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    }>(path.join(ctx.cwd, 'package.json'));
    const deps = {
      ...(pkgJson?.dependencies ?? {}),
      ...(pkgJson?.devDependencies ?? {}),
    };

    const checks: Array<{ ok: boolean; label: string; fix?: string }> = [
      {
        ok: Boolean(config),
        label: 'components.json present',
        fix: `Run "npx ${NTHGUI_PACKAGE_NAME} init"`,
      },
      {
        ok: config ? config.package === NTHGUI_PACKAGE_NAME : false,
        label: `components.json configured for "${NTHGUI_PACKAGE_NAME}"`,
        fix: `Set "package": "${NTHGUI_PACKAGE_NAME}" in components.json`,
      },
      {
        ok: 'react' in deps,
        label: 'react peer dependency found in package.json',
        fix: 'Install react >= 18',
      },
    ];

    if (config) {
      const tokenPath =
        config.framework === 'expo'
          ? `${resolveAliasToRelativePath(config.aliases.tokens, config.framework)}.ts`
          : resolveAliasToRelativePath(config.aliases.tokens, config.framework);
      checks.push({
        ok: fs.existsSync(path.join(ctx.cwd, tokenPath)),
        label: `Theme/token file present (${tokenPath})`,
        fix: `Run "npx ${NTHGUI_PACKAGE_NAME} init${config.framework === 'expo' ? ' --native' : ''}"`,
      });
    }

    for (const check of checks) {
      stdout(`  [${check.ok ? 'OK' : 'WARN'}] ${check.label}`);
      if (!check.ok && check.fix) {
        stdout(`         -> ${check.fix}`);
      }
    }
    return { exitCode: 0, writtenFiles, skippedFiles };
  }

  return { exitCode: 0, writtenFiles, skippedFiles };
}
