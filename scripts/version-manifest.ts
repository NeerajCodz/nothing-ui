/**
 * Shared reader for the root version.json.
 *
 * `packages` tracks the released parts (ui, dot-icons, cli) with separate versions.
 * `release` is the npm package that bundles them (nthgui); its version comes from
 * the `packages` entry named by `release.versionFrom`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

export interface VersionEntry {
  name: string;
  path: string;
  version: string;
}

export interface VersionManifest {
  release: { package: string; path: string; versionFrom: string };
  packages: Record<string, VersionEntry>;
}

export function readVersionManifest(): VersionManifest {
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')) as VersionManifest;
  if (!manifest.packages || typeof manifest.packages !== 'object') {
    throw new Error('version.json is missing a "packages" map.');
  }
  for (const [key, entry] of Object.entries(manifest.packages)) {
    if (!entry?.name || !entry.path || !SEMVER.test(entry.version ?? '')) {
      throw new Error(`version.json entry "${key}" needs a name, path and valid semver version.`);
    }
  }
  const release = manifest.release;
  if (!release?.package || !release.path || !manifest.packages[release.versionFrom]) {
    throw new Error('version.json "release" needs a package, path and a versionFrom that names a tracked package.');
  }
  return manifest;
}

/** The published npm package (nthgui) and the version it ships at. */
export function getReleaseEntry(manifest = readVersionManifest()): VersionEntry {
  const { release, packages } = manifest;
  return { name: release.package, path: release.path, version: packages[release.versionFrom].version };
}
