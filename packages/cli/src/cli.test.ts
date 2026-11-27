import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  NTHGUI_PACKAGE_NAME,
  buildCliExecCommand,
  buildComponentsJson,
  buildPackageInstallCommand,
  createDryRunPlan,
  detectProjectFromFiles,
  parseCliArgs,
  rewriteTemplateImports,
  type OfflineTemplateRecord,
} from './index';
import { runCli } from './runner';

const SAMPLE_TEMPLATES: OfflineTemplateRecord[] = [
  {
    slug: 'button',
    title: 'Button',
    category: 'Inputs & Actions',
    description: 'Monochrome action button with loading state.',
    webFile: `import { cn } from '../lib/cn';\nimport { Button as UiButton } from '@nothing-ui/ui';\nexport const Button = () => <UiButton className={cn('px-4')} />;`,
    nativeFile: `import { createNativeTheme } from "nothing-ui/native";\nexport function Button() { return createNativeTheme("dark"); }`,
  },
  {
    slug: 'glyph-matrix',
    title: 'Glyph Matrix',
    category: 'Data & Hardware',
    description: '25x25 LED dot matrix.',
    webFile: `import { getPreset } from '@nothing-ui/core';\nexport const matrix = getPreset('power', 25);`,
    nativeFile: `import { buildNativeGlyphPoints } from "nothing-ui/native";\nexport const pts = buildNativeGlyphPoints({ resolution: 13 });`,
  },
];

test('CLI helpers emit nthgui across all package managers and dry-run plans', () => {
  assert.equal(NTHGUI_PACKAGE_NAME, 'nthgui');
  assert.equal(buildCliExecCommand('npm', 'init'), 'npx nthgui init');
  assert.equal(buildCliExecCommand('bun', 'add button'), 'bunx --bun nthgui add button');
  assert.equal(buildCliExecCommand('pnpm', 'add button'), 'pnpm dlx nthgui add button');
  assert.equal(buildCliExecCommand('yarn', 'add button'), 'yarn dlx nthgui add button');
  assert.equal(buildPackageInstallCommand('npm'), 'npm install nthgui');
  assert.equal(buildPackageInstallCommand('bun'), 'bun add nthgui');

  const plan = createDryRunPlan(['button', 'glyph-matrix'], 'npm', 'vite');
  assert.equal(plan.packageName, 'nthgui');
  assert.deepEqual(plan.npmDependencies, ['nthgui']);
  assert.equal(plan.addCommand, 'npx nthgui add button glyph-matrix');
  assert.deepEqual(plan.targetFiles, [
    'src/components/nthgui/button.tsx',
    'src/components/nthgui/glyph-matrix.tsx',
  ]);
  const parsedConfig = JSON.parse(buildComponentsJson('vite'));
  assert.equal(parsedConfig.package, 'nthgui');
  assert.equal(parsedConfig.brand, 'Nothing UI');
});

test('parseCliArgs parses commands, flags, framework, and unknown flags', () => {
  const addArgs = parseCliArgs(['add', 'button', 'glyph-matrix', '--native', '--dry-run']);
  assert.equal(addArgs.command, 'add');
  assert.deepEqual(addArgs.targets, ['button', 'glyph-matrix']);
  assert.equal(addArgs.native, true);
  assert.equal(addArgs.dryRun, true);

  const initArgs = parseCliArgs(['init', '--framework=next', '--overwrite']);
  assert.equal(initArgs.command, 'init');
  assert.equal(initArgs.framework, 'next');
  assert.equal(initArgs.overwrite, true);

  const badArgs = parseCliArgs(['add', 'button', '--bogus']);
  assert.deepEqual(badArgs.unknownFlags, ['--bogus']);
});

test('detectProjectFromFiles detects Vite, Next.js, and Expo correctly', () => {
  assert.equal(
    detectProjectFromFiles(['pnpm-lock.yaml', 'tsconfig.json', 'next.config.ts'], {
      dependencies: { next: '15.0.0', react: '19.0.0' },
    }).framework,
    'next',
  );
  assert.equal(
    detectProjectFromFiles(['bun.lock', 'app.json'], {
      dependencies: { expo: '52.0.0', 'react-native': '0.76.0' },
    }).framework,
    'expo',
  );
});

test('rewriteTemplateImports strips internal @nothing-ui/* and stale nothing-ui imports', () => {
  const rewritten = rewriteTemplateImports(SAMPLE_TEMPLATES[0].webFile!, '@/lib/utils');
  assert.ok(!rewritten.includes('@nothing-ui/'));
  assert.ok(!rewritten.includes('nothing-ui'));
  assert.ok(rewritten.includes("from '@/lib/utils'"));
  assert.ok(rewritten.includes("from 'nthgui'"));

  const rewrittenNative = rewriteTemplateImports(SAMPLE_TEMPLATES[0].nativeFile!);
  assert.ok(rewrittenNative.includes('from "nthgui/native"'));
  assert.ok(!rewrittenNative.includes('nothing-ui/native'));
});

test('runCli executes init, add (web & native), list, and doctor in an isolated directory', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nthgui-cli-test-'));
  try {
    fs.writeFileSync(
      path.join(tmpDir, 'package.json'),
      JSON.stringify({ name: 'demo-app', dependencies: { react: '^19.0.0', vite: '^6.0.0' } }),
    );
    const logs: string[] = [];
    const errs: string[] = [];
    const baseCtx = {
      cwd: tmpDir,
      version: '0.1.0',
      templates: SAMPLE_TEMPLATES,
      tokensCss: ':root { --nt-accent: #d71921; }\n',
      nativeThemeFile: 'export const theme = {};\n',
      utilsFile: 'export const cn = (...a: string[]) => a.join(" ");\n',
      stdout: (l: string) => logs.push(l),
      stderr: (l: string) => errs.push(l),
    };

    // 1. init
    const initRes = runCli(['init', '--framework', 'vite'], baseCtx);
    assert.equal(initRes.exitCode, 0);
    assert.ok(fs.existsSync(path.join(tmpDir, 'components.json')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'src/styles/nothing-tokens.css')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'src/lib/utils.ts')));

    // 2. add web components
    const addRes = runCli(['add', 'button', 'glyph-matrix'], baseCtx);
    assert.equal(addRes.exitCode, 0);
    const btnPath = path.join(tmpDir, 'src/components/nthgui/button.tsx');
    assert.ok(fs.existsSync(btnPath));
    const btnSrc = fs.readFileSync(btnPath, 'utf8');
    assert.ok(btnSrc.includes("from 'nthgui'"));
    assert.ok(!btnSrc.includes('@nothing-ui/'));

    // 3. re-running add without --overwrite skips existing file
    const skipRes = runCli(['add', 'button'], baseCtx);
    assert.equal(skipRes.exitCode, 0);
    assert.equal(skipRes.skippedFiles.length, 1);

    // 4. add native component
    const nativeRes = runCli(['add', 'button', '--native'], baseCtx);
    assert.equal(nativeRes.exitCode, 0);
    const nativeBtnPath = path.join(tmpDir, 'components/nthgui-native/button.tsx');
    assert.ok(fs.existsSync(nativeBtnPath));
    assert.ok(fs.readFileSync(nativeBtnPath, 'utf8').includes('from "nthgui/native"'));

    // 5. unknown slug returns non-zero exit code with helpful message
    const badRes = runCli(['add', 'nonexistent-widget'], baseCtx);
    assert.equal(badRes.exitCode, 1);
    assert.ok(errs.some((line) => line.includes('Unknown component')));

    // 6. list & doctor succeed
    assert.equal(runCli(['list'], baseCtx).exitCode, 0);
    assert.equal(runCli(['doctor'], baseCtx).exitCode, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
