# Changelog

All notable changes to **Nothing UI** (`nthgui`) are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
The released parts — `ui`, `dot-icons` and `cli` — have their versions tracked separately in
[`version.json`](./version.json). They ship together as the `nthgui` npm package, which takes
its version from `ui`; headings here follow that version. Run `npm run version:sync` after
editing `version.json` to update each `package.json`.

## [Unreleased]

## [1.0.0] - 2026-11-27

First stable release of the `nthgui` package on npm.

### Added

- **Single package, two workflows**
  - `npm install nthgui` for direct imports from `nthgui`, `nthgui/native`,
    `nthgui/glyph`, `nthgui/icons`, `nthgui/tokens` and `nthgui/styles.css`.
  - `npx nthgui` copy-in CLI with `init`, `add`, `list`, `doctor` and `--version`,
    shipping 121 offline templates (web and React Native) with no network access needed.
- **Design tokens**: Light, Dark OLED and WCAG AAA High-Contrast themes, spacing,
  radius, density, typography and motion scales, plus CSS and JSON generators.
- **Glyph Matrix**: circular 13×13 and 25×25 grids with presets, transforms,
  animations and serialization, as `GlyphMatrix`, `GlyphProgress` and `GlyphAnimator`.
- **Dot Icons**: 1,600+ dot-pixel SVG icons (original sets plus a Lucide-derived pack)
  for React and React Native, with alias resolution.
- **Web components**: Button, Loader, dotted and hardware UI kits, standard component
  families, `ThemeProvider`, `LoadingConfigProvider` and the `cn` helper.
- **Charts**: interactive cartesian, polar and network charts on a shared chart engine,
  with palettes, threshold lines, live mode and CSV export.
- **Widgets**: clocks (analog, binary, flip, radial, word, world deck, stopwatch, studio),
  hardware (battery, network radar, pedometer, screen time), media (dithered photo frame,
  podcast player, voice memo) and productivity (calendar, agenda, habit matrix, pomodoro,
  notes, unit/FX converter), plus a search bar widget.
- **React Native**: native theme, glyph and dot-icon helpers and 111 native component specs.
- **Docs app**: component explorer, props playground, glyph studio, icon explorer,
  charts and widgets hubs, theme customizer and CLI setup guide.
- **Release tooling**: root `version.json` (separate ui, dot-icons and cli versions) and `CHANGELOG.md`, version sync and check
  scripts, CI on every push and pull request, and automated npm publishing with
  provenance, `npx` smoke tests, git tags and GitHub releases.

[Unreleased]: https://github.com/NeerajCodz/nothing-ui/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/NeerajCodz/nothing-ui/releases/tag/v1.0.0
