# Nothing UI (`nthgui`)

Monochrome industrial design system for **Web** and **React Native** — built around crisp 1px hairlines, dot-matrix typography, Signal Red accents, circular 13×13 & 25×25 Glyph Matrices, and 35 original 9×9 Dot Icons.

Nothing UI publishes as a single npm package (**`nthgui`**) supporting both **shadcn-style copy-in scaffolding** and **direct single-package imports** with zero extra installs.

---

## Option A · Copy-In CLI (Offline Bundled Templates)

```bash
# Initialize components.json, CSS tokens, and utils (Vite, Next.js, TanStack Start)
npx nthgui init

# Copy components into your project
npx nthgui add button glyph-matrix dot-icon

# React Native / Expo workflow
npx nthgui init --native
npx nthgui add button glyph-matrix --native

# Inspect available templates or check project health
npx nthgui list
npx nthgui doctor
```

---

## Option B · Direct Single-Package Install

```bash
npm install nthgui
```

Import styles once in your Web entry point:

```tsx
import "nthgui/styles.css";
import { Button, NothingCard, ThemeProvider } from "nthgui";
import { GlyphMatrix } from "nthgui/glyph";
import { DotIcon } from "nthgui/icons";
```

### React Native / Expo

```tsx
import { createNativeTheme, buildNativeGlyphPoints, DotIcon } from "nthgui/native";
```

---

## Subpath Exports

| Import Path | Contents |
| --- | --- |
| `nthgui` | Web UI components, loading config provider, theme provider, hooks, and `cn` utility |
| `nthgui/native` | React Native theme tokens, SVG Glyph Matrix & DotIcon helpers, and 60 native component specs |
| `nthgui/glyph` | 13×13 & 25×25 circular Glyph Matrix math, 8 presets, `GlyphMatrix`, `GlyphProgress`, `GlyphAnimator` |
| `nthgui/icons` | 35 original 9×9 monochrome dot-pixel SVG icons with `map-pin` alias support |
| `nthgui/tokens` | Light, Dark OLED, and WCAG AAA High-Contrast themes, scales, and CSS/JSON generators |
| `nthgui/styles.css` | Pre-built CSS custom properties, frosted dot-field surface, and loader keyframes |

---

## License

MIT
