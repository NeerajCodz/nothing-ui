<div align="center">

# Nothing UI

**A monochrome, industrial design system for Web and React Native.**
Crisp 1px hairlines, dot-matrix type, Signal Red accents, circular Glyph Matrices and 1,600+ dot-pixel icons.
Shipped as one npm package, **`nthgui`**.

[![npm](https://img.shields.io/npm/v/nthgui?color=D71921&label=nthgui)](https://www.npmjs.com/package/nthgui)
[![CI](https://github.com/NeerajCodz/nothing-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/NeerajCodz/nothing-ui/actions/workflows/ci.yml)
[![Release](https://github.com/NeerajCodz/nothing-ui/actions/workflows/release.yml/badge.svg)](https://github.com/NeerajCodz/nothing-ui/actions/workflows/release.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-black)](./packages/nthgui/LICENSE)

</div>

---

## Quick start

`nthgui` works two ways. Use either, or both.

### 1. Copy-in CLI (shadcn-style)

Own the source. Components are copied into your project from templates bundled inside the
package, so no network or registry access is needed.

```bash
npx nthgui init                          # components.json, tokens CSS and the cn() util
npx nthgui add button glyph-matrix dot-icon
npx nthgui list                          # all 121 templates, grouped by category
npx nthgui doctor                        # check your project setup
```

React Native and Expo:

```bash
npx nthgui init --native
npx nthgui add button glyph-matrix --native
```

| Command | Flags |
| --- | --- |
| `init` | `--native`, `--framework vite\|next\|tanstack\|expo`, `--dry-run`, `--overwrite` |
| `add <slug...>` | `--native`, `--all`, `--dry-run`, `--overwrite` |
| `list` | `--native`, `--category <name>` |
| `doctor` | |
| `--version`, `--help` | |

### 2. Install the package

```bash
npm install nthgui
```

```tsx
import "nthgui/styles.css";
import { Button, ThemeProvider } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";
import { DotIcon } from "nthgui/icons";

export function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <GlyphMatrix resolution={25} preset="heart" />
      <Button variant="signal">
        <DotIcon name="bolt" size={16} /> Charge
      </Button>
    </ThemeProvider>
  );
}
```

React Native:

```tsx
import { createNativeTheme, buildNativeGlyphPoints, DotIcon } from "nthgui/native";
```

Peer dependencies: `react >= 18`, plus `react-dom` for web or `react-native` and
`react-native-svg` for native.

---

## What's inside

| Import | Contents |
| --- | --- |
| `nthgui` | Web components, charts, widgets, `ThemeProvider`, `LoadingConfigProvider`, hooks and `cn` |
| `nthgui/glyph` | 13×13 and 25×25 circular Glyph Matrix math, presets, `GlyphMatrix`, `GlyphProgress`, `GlyphAnimator` |
| `nthgui/icons` | 1,691 dot-pixel SVG icons (original sets plus a Lucide-derived pack) with 216 aliases |
| `nthgui/tokens` | Light, Dark OLED and WCAG AAA High-Contrast themes, scales, CSS and JSON generators |
| `nthgui/native` | React Native theme, glyph and dot-icon helpers, and 111 native component specs |
| `nthgui/styles.css` | CSS custom properties, frosted dot-field surface and loader keyframes |

**Components**: buttons, inputs, selects, sliders, rotary knobs, OTP inputs, date and time
pickers, tag inputs, navigation, layout, overlays, feedback, loaders and skeletons, plus dotted
and hardware UI kits.

**Charts**: interactive bar, line, radial, sparkline, radar, pie and donut, timeseries, Sankey,
map, flow and custom charts on one chart engine, with palettes, thresholds, live mode and CSV export.

**Widgets**

| Group | Widgets |
| --- | --- |
| Clocks | Analog, Binary, Flip, Radial, Word, World Clock Deck, Stopwatch & Timer, Clock Studio |
| Hardware | Battery Health Hub, Network Speed Radar, Pedometer Ring, Screen Time Pulse |
| Media | Dithered Photo Frame, Podcast Mini Player, Voice Memo Transcriber |
| Productivity | Calendar, Agenda Ticker, Habit Matrix Tracker, Pomodoro Focus, Quick Notes, Unit & FX Converter |
| Utility | Search Bar |

---

## Repository layout

A Bun + Turborepo monorepo. Only `nthgui` is published; it bundles the other packages.

```
apps/
  ui/                 docs site: component explorer, playground, Glyph Studio, icon explorer, charts and widgets hubs
packages/
  nthgui/             the published npm package (library entry points + the CLI)
  ui/                 web React components, charts and widgets   (@nothing-ui/ui)
  dot-icons/          dot-pixel icon bitmaps and renderers         (@nothing-ui/dot-icons)
  cli/                copy-in CLI runner                           (@nothing-ui/cli)
  core/               framework-free glyph, rotary and color math
  tokens/             design tokens and themes
  ui-native/          React Native components and specs
  registry/           typed component catalog and validation
scripts/              build, version, changelog and smoke-test scripts
src/                  site entry and Nothing component sources
tests/                Vitest + Testing Library component tests
```

See [`docs/architecture.md`](./docs/architecture.md) for package boundaries and dependency rules.

---

## Development

Requires [Bun](https://bun.sh) 1.3+ and Node.js 18+ (22 recommended).

```bash
bun install
npm run dev            # docs site at http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the docs site |
| `npm run build` | Build the docs site |
| `npm run build:nthgui` | Build `packages/nthgui/dist` (library entry points, `styles.css`, `cli.mjs`) |
| `npm run lint` | Typecheck with `tsc --noEmit` |
| `npm test` | Unit, component and package tests |
| `npm run verify` | Version check, typecheck, tests and build: the full pre-push check |
| `npm run release:pack` | Build and pack `nthgui` into `./nthgui-<version>.tgz` |
| `npm run smoke -- <tgz or nthgui@x.y.z>` | Test the package end to end through `npx` and `npm install` |

---

## Versioning and releases

- [`version.json`](./version.json) tracks the versions of the released parts (`ui`,
  `dot-icons` and `cli`) separately. `nthgui` takes its npm version from `ui`.
- [`CHANGELOG.md`](./CHANGELOG.md) follows Keep a Changelog. Every release needs a section.
- Pushing a `version.json` change to `main` runs the release workflow. It tests and packs
  `nthgui`, publishes that exact tarball to npm via trusted publishing (OIDC, no stored tokens,
  automatic provenance), checks the live package with `npx`, then creates the `vX.Y.Z` tag and
  GitHub release.

Full steps are in [`docs/releasing.md`](./docs/releasing.md).

---

## License

[MIT](./packages/nthgui/LICENSE) © NeerajCodz
