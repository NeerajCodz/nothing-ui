/**
 * Keeps the tracked packages (ui, dot-icons, cli) and the published nthgui package
 * in step with version.json.
 *
 *   tsx scripts/sync-version.ts            -> write versions from version.json into each package.json
 *   tsx scripts/sync-version.ts --check    -> exit 1 if any package.json drifts from version.json
 *   tsx scripts/sync-version.ts --release  -> print "<npm package>@<version>" (for CI)
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, getReleaseEntry, readVersionManifest, type VersionEntry } from './version-manifest';

const manifest = readVersionManifest();
const release = getReleaseEntry(manifest);

if (process.argv.includes('--release')) {
  console.log(`${release.name}@${release.version}`);
  process.exit(0);
}

const checkOnly = process.argv.includes('--check');
const targets: Array<[string, VersionEntry]> = [
  ...Object.entries(manifest.packages),
  [`${release.name} (release, from ${manifest.release.versionFrom})`, release],
];
const problems: string[] = [];

for (const [label, entry] of targets) {
  const file = path.join(ROOT, entry.path, 'package.json');
  if (!fs.existsSync(file)) {
    problems.push(`${label}: ${entry.path}/package.json does not exist`);
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');
  const pkg = JSON.parse(raw) as { name?: string; version?: string };
  const changes: string[] = [];
  if (pkg.name !== entry.name) changes.push(`name ${pkg.name ?? '(none)'} -> ${entry.name}`);
  if (pkg.version !== entry.version) changes.push(`version ${pkg.version ?? '(none)'} -> ${entry.version}`);
  if (changes.length === 0) continue;

  problems.push(`${label} (${entry.path}): ${changes.join(', ')}`);
  if (!checkOnly) {
    pkg.name = entry.name;
    pkg.version = entry.version;
    const eol = raw.includes('\r\n') ? '\r\n' : '\n';
    fs.writeFileSync(file, JSON.stringify(pkg, null, 2).replace(/\n/g, eol) + eol, 'utf8');
  }
}

if (checkOnly && problems.length > 0) {
  console.error('package.json files are out of sync with version.json:');
  for (const line of problems) console.error(`  ${line}`);
  console.error('Run `npm run version:sync` to fix.');
  process.exit(1);
}

if (checkOnly) {
  console.log(`All ${targets.length} packages match version.json (${release.name}@${release.version}).`);
} else {
  console.log(problems.length === 0 ? 'All package.json files already match version.json.' : `Synced:\n  ${problems.join('\n  ')}`);
}
