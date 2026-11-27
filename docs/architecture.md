# Nothing UI Monorepo Architecture Contract

## Single-App Invariant
- `apps/ui` is the **only** application directory under `apps/`.
- Documentation, showcase, component playgrounds, React Native parity docs, Dot Icon Explorer, and Glyph Studio all live inside `apps/ui`.
- No `apps/showcase`, `apps/docs`, `apps/native`, or `apps/mobile` directories are permitted.

## Seven-Package Topology
1. `packages/tokens` (`@nothing-ui/tokens`): Canonical color, typography, spacing, radius, density, and motion tokens with Light, Dark, and High-Contrast themes plus Web CSS and React Native adapters.
2. `packages/core` (`@nothing-ui/core`): Pure, framework-agnostic TypeScript logic for 13x13 and 25x25 circular-masked Glyph Matrix geometry, presets, resampling, transforms, `GlyphPatternV1` serialization/validation, animation frame interpolation, rotary math, and WCAG contrast math. Zero React, DOM, or Node dependencies.
3. `packages/dot-icons` (`@nothing-ui/dot-icons`): Independently consumable 35-icon 9x9 round-dot bitmap icon pack with metadata, alias resolution (`map-pin` / `mappin`), SVG coordinate generators, and separate `/react` and `/native` renderers.
4. `packages/ui` (`@nothing-ui/ui`): Web React DOM component library built on headless `@ui-sdk/react` behavioral primitives, Phosphor icons for ordinary UI chrome, and `@nothing-ui/dot-icons` for dotted visuals.
5. `packages/ui-native` (`@nothing-ui/ui-native`): React Native component library sharing `@nothing-ui/tokens` and `@nothing-ui/core` with native `View`/`Text`/`Pressable`/`TextInput` and `react-native-svg` primitives.
6. `packages/registry` (`@nothing-ui/registry`): Typed component catalog with independent `web` and `native` status tracking, TONY 114-component roadmap tracking (excluding `thinking-orb`), consistency validation, and shadcn-compatible `registry-item` JSON compiler.
7. `packages/cli` (`@nothing-ui/cli`): Optional dry-run-safe installer CLI supporting package manager detection and dependency resolution.

## Dependency Direction
- `tokens` -> no internal workspace dependencies.
- `core` -> depends on no UI/React/DOM runtime.
- `dot-icons` -> zero dependency on `ui` or Phosphor.
- `ui` -> consumes `tokens`, `core`, `dot-icons`.
- `ui-native` -> consumes `tokens`, `core`, `dot-icons/native`; never imports `ui`.
- `registry` -> metadata & schema compiler; never executes DOM presentation code during validation.
- `apps/ui` -> consumes public package entrypoints only; never reaches into private package internals.
