# Releasing `nthgui`

Nothing UI ships to npm as a single package, **`nthgui`**. It bundles the UI, the dot icons
and the CLI, and is used two ways:

```bash
npx nthgui init && npx nthgui add button   # copy-in CLI
npm install nthgui                         # direct imports
```

## Versions: `version.json`

The released parts have their versions tracked separately in the root `version.json`:

| Key | Package | Path |
| --- | --- | --- |
| `ui` | `@nothing-ui/ui` | `packages/ui` |
| `dot-icons` | `@nothing-ui/dot-icons` | `packages/dot-icons` |
| `cli` | `@nothing-ui/cli` | `packages/cli` |

`release.versionFrom` is `ui`, so **the `nthgui` npm version equals the `ui` version**.
`npm run version:sync` writes these into each `package.json`, and `npm run version:check`
(run in CI) fails if any of them drift.

## Cutting a release

1. Bump the versions in `version.json` (at least `ui`, since that is the npm version).
2. Run `npm run version:sync`.
3. Add a `## [x.y.z] - YYYY-MM-DD` section to `CHANGELOG.md`. CI fails without one.
4. Optionally check locally: `npm run release:pack && npm run smoke -- ./nthgui-x.y.z.tgz`.
5. Commit and push to `main`.

Pushing a change to `version.json` on `main` runs `.github/workflows/release.yml`, which:

1. Runs the full CI suite (typecheck, unit, component and package tests, docs build) and
   packs `nthgui` into a tarball.
2. Smoke-tests that tarball through `npx nthgui` (`--version`, `list`, `init`, `add`,
   `doctor`) and `npm install` in a clean temp project.
3. Skips publishing if that version is already on npm.
4. Publishes **the exact tarball that was tested**, using trusted publishing (provenance is
   automatic). Versions with a prerelease suffix (`1.1.0-beta.1`) go to the `next` dist-tag;
   the rest go to `latest`.
5. Runs the same smoke test against the live `nthgui@x.y.z` from npm.
6. Creates the `vx.y.z` git tag and a GitHub release with the CHANGELOG section as notes,
   with the tarball attached.

You can also run it from **Actions → Release → Run workflow**, with an optional **dry run**
that does everything except publish and create the release.

## Authentication: trusted publishing (no npm token)

CI publishes with [npm trusted publishing](https://docs.npmjs.com/trusted-publishers) (OIDC).
GitHub Actions proves its identity to npm directly, so **no npm token is stored in the repo**,
2FA doesn't block CI, and provenance is attached automatically. npm is phasing out direct
publishing with 2FA-bypass tokens
([changelog](https://github.blog/changelog/2026-07-08-npm-install-time-security-and-gat-bypass2fa-deprecation/)),
so tokens aren't used at all.

Requirements, already handled by `release.yml`: GitHub-hosted runner, `id-token: write`,
Node >= 22.14, npm >= 11.5.1, and `repository.url` in `packages/nthgui/package.json`
matching this repo.

### One-time setup

A trusted publisher is configured on the package's npm settings page, so the package must
exist first. The **very first publish is done once by hand**:

```bash
npm login                                   # your npm account, with 2FA
npm run release:pack                        # builds and writes ./nthgui-<version>.tgz
npm run smoke -- ./nthgui-<version>.tgz     # optional: same checks CI runs
npm publish ./nthgui-<version>.tgz --access public --otp=<code from your authenticator>
```

Then, on npmjs.com → **nthgui → Settings → Trusted Publisher → GitHub Actions**, enter:

| Field | Value |
| --- | --- |
| Organization or user | `NeerajCodz` |
| Repository | `nothing-ui` |
| Workflow filename | `release.yml` |
| Environment | *(leave empty)* |

Fields are case-sensitive and npm doesn't check them when you save. A mismatch shows up
later as `ENEEDAUTH` when publishing. A new trusted publisher must complete a publish
within 2 days or it expires.

Finally, run **Actions → Release → Run workflow** once. The version is already on npm, so it
skips publishing, smoke-tests the live package and creates the GitHub release.

Recommended hardening afterwards: npm → nthgui → Settings → Publishing access →
**"Require two-factor authentication and disallow tokens"**, then revoke any old publish tokens.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run version:sync` | Write `version.json` versions into each `package.json` |
| `npm run version:check` | Fail if any `package.json` drifts from `version.json` |
| `npm run version:release` | Print `nthgui@<version>` |
| `npm run changelog:extract [version]` | Print the CHANGELOG section for a version |
| `npm run release:pack` | Build `nthgui` and pack it into `./nthgui-<version>.tgz` |
| `npm run smoke -- <tarball or nthgui@version>` | Run the npx / npm install smoke test |
