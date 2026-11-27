/**
 * End-to-end check that `nthgui` works the way users run it: through npx and npm install.
 *
 *   tsx scripts/smoke-nthgui.ts ./nthgui-1.0.0.tgz   -> test a packed tarball (before publishing)
 *   tsx scripts/smoke-nthgui.ts nthgui@1.0.0         -> test the published package (after publishing)
 *
 * Each run uses a fresh temp project, so nothing from the monorepo leaks in.
 * Set SMOKE_RETRIES to retry the first npx call while a new release reaches the registry.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const spec = process.argv[2];
if (!spec) {
  console.error('Usage: tsx scripts/smoke-nthgui.ts <tarball path | nthgui@version>');
  process.exit(1);
}

const isTarball = spec.endsWith('.tgz');
const target = isTarball ? path.resolve(spec) : spec;
if (isTarball && !fs.existsSync(target)) {
  console.error(`Tarball not found: ${target}`);
  process.exit(1);
}
const expectedVersion = isTarball ? null : spec.split('@').pop() ?? null;
const retries = Number(process.env.SMOKE_RETRIES ?? '0');

const work = fs.mkdtempSync(path.join(os.tmpdir(), 'nthgui-smoke-'));
fs.writeFileSync(
  path.join(work, 'package.json'),
  JSON.stringify({ name: 'nthgui-smoke', private: true, type: 'module' }, null, 2),
);

function run(cmd: string, args: string[]): string {
  // npm/npx are .cmd shims on Windows and need a shell; node itself must not get one (it mangles -e code).
  const useShell = process.platform === 'win32' && cmd !== process.execPath;
  const quote = (arg: string) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
  const options = {
    cwd: work,
    encoding: 'utf8' as const,
    shell: useShell,
    env: { ...process.env, npm_config_yes: 'true', npm_config_update_notifier: 'false' },
  };
  const result = useShell
    ? spawnSync([cmd, ...args].map(quote).join(' '), options)
    : spawnSync(cmd, args, options);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  if (result.status !== 0) {
    throw new Error(`\`${cmd} ${args.join(' ')}\` exited ${result.status}\n${output}`);
  }
  return output;
}

const npx = (...args: string[]) => run('npx', ['--yes', '--package', target, 'nthgui', ...args]);

function step(label: string, fn: () => void): void {
  process.stdout.write(`• ${label} ... `);
  fn();
  console.log('ok');
}

function assertFile(rel: string): void {
  if (!fs.existsSync(path.join(work, rel))) throw new Error(`Expected ${rel} to be created`);
}

async function main(): Promise<void> {
  console.log(`Smoke testing ${spec} in ${work}\n`);

  step('npx nthgui --version', () => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const out = npx('--version');
        if (expectedVersion && !out.includes(`v${expectedVersion}`)) {
          throw new Error(`Expected v${expectedVersion}, got: ${out.trim()}`);
        }
        return;
      } catch (error) {
        lastError = error;
        if (attempt < retries) {
          spawnSync(process.execPath, ['-e', 'setTimeout(() => {}, 15000)']);
        }
      }
    }
    throw lastError;
  });

  step('npx nthgui --help', () => {
    if (!npx('--help').includes('npx nthgui add')) throw new Error('Help text is missing usage');
  });

  step('npx nthgui list', () => {
    if (!npx('list').includes('button')) throw new Error('`list` did not include button');
  });

  step('npx nthgui list --native', () => {
    npx('list', '--native');
  });

  step('npx nthgui init', () => {
    npx('init');
    for (const rel of ['components.json', 'src/lib/utils.ts', 'src/styles/nothing-tokens.css']) assertFile(rel);
  });

  step('npx nthgui add button glyph-matrix dot-icon', () => {
    npx('add', 'button', 'glyph-matrix', 'dot-icon');
    for (const name of ['button', 'glyph-matrix', 'dot-icon']) assertFile(`src/components/nthgui/${name}.tsx`);
  });

  step('npx nthgui add button --native', () => {
    npx('add', 'button', '--native');
    assertFile('components/nthgui-native/button.tsx');
  });

  step('npx nthgui add --dry-run writes nothing', () => {
    npx('add', 'switch', '--dry-run');
    if (fs.existsSync(path.join(work, 'src/components/nthgui/switch.tsx'))) {
      throw new Error('--dry-run wrote a file');
    }
  });

  step('npx nthgui doctor', () => {
    npx('doctor');
  });

  step('npm install', () => {
    run('npm', ['install', '--no-audit', '--no-fund', '--loglevel=error', target, 'react@18', 'react-dom@18']);
  });

  const pkgDir = path.join(work, 'node_modules', 'nthgui');
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8')) as {
    version: string;
    exports: Record<string, string | { types?: string; import?: string }>;
  };

  step('installed version and files', () => {
    if (expectedVersion && pkg.version !== expectedVersion) {
      throw new Error(`Installed ${pkg.version}, expected ${expectedVersion}`);
    }
    for (const [subpath, exp] of Object.entries(pkg.exports)) {
      const files = typeof exp === 'string' ? [exp] : [exp.import, exp.types].filter(Boolean) as string[];
      for (const file of files) {
        if (!fs.existsSync(path.join(pkgDir, file))) throw new Error(`Missing ${file} for export "${subpath}"`);
      }
    }
    for (const file of ['README.md', 'LICENSE']) {
      if (!fs.existsSync(path.join(pkgDir, file))) throw new Error(`Missing ${file} in package`);
    }
    if (fs.existsSync(path.join(pkgDir, 'src')) || fs.existsSync(path.join(pkgDir, 'tests'))) {
      throw new Error('Package should not ship src/ or tests/');
    }
  });

  // nthgui/native needs react-native, an optional peer, so it is only checked on disk above.
  const imports: Array<[string, string[]]> = [
    ['nthgui', ['Button', 'Loader', 'ThemeProvider', 'cn']],
    ['nthgui/glyph', ['GlyphMatrix', 'getPreset']],
    ['nthgui/icons', ['DotIcon', 'DOT_ICON_NAMES']],
    ['nthgui/tokens', ['THEMES', 'generateWebCss']],
  ];

  for (const [specifier, names] of imports) {
    step(`import "${specifier}"`, () => {
      const code = `const m = await import(${JSON.stringify(specifier)});
const missing = ${JSON.stringify(names)}.filter((n) => !(n in m));
if (missing.length) { console.error('missing exports: ' + missing.join(', ')); process.exit(1); }`;
      run(process.execPath, ['--input-type=module', '-e', code]);
    });
  }

  console.log(`\nAll smoke checks passed for ${spec}.`);
}

main()
  .catch((error) => {
    console.log('FAILED');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => {
    fs.rmSync(work, { recursive: true, force: true });
  });
