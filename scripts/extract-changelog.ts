/**
 * Prints the CHANGELOG.md section for a version (used as GitHub release notes).
 *
 *   tsx scripts/extract-changelog.ts            -> section for the released package's version in version.json
 *   tsx scripts/extract-changelog.ts 1.2.0      -> section for 1.2.0
 *
 * Exits 1 if the version has no "## [x.y.z]" heading, so releases can't ship undocumented.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, getReleaseEntry } from './version-manifest';

const version = process.argv[2] ?? getReleaseEntry().version;

const lines = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8').split(/\r?\n/);
const escaped = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const heading = new RegExp(`^## \\[?v?${escaped}\\]?(\\s|$)`);

const start = lines.findIndex((line) => heading.test(line));
if (start === -1) {
  console.error(`CHANGELOG.md has no "## [${version}]" section.`);
  process.exit(1);
}

let end = lines.length;
for (let i = start + 1; i < lines.length; i++) {
  if (/^## /.test(lines[i]) || /^\[[^\]]+\]:\s/.test(lines[i])) {
    end = i;
    break;
  }
}

console.log(lines.slice(start + 1, end).join('\n').trim());
