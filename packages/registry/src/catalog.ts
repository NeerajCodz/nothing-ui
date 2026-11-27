import type {
  CatalogEntry,
  CatalogItemKind,
  InstallMode,
  PackageManager,
  RegistryCategory,
  ResolvedCatalogEntry,
  ShadcnRegistryItem,
} from './types';
import { COMPLETE_CATALOG_ENTRIES } from './catalog-complete';
import { WIDGETS_CATALOG_ENTRIES } from './catalog-widgets';
import { COMPONENT_CATEGORIES, classifyCatalogEntry } from './widgets';

export const REGISTRY_CATEGORIES: RegistryCategory[] = [
  ...COMPONENT_CATEGORIES,
  'Widgets',
  'Glyph System',
];

const RAW_CATALOG: CatalogEntry[] = [
  {
    slug: 'button',
    moduleNumber: '05',
    title: 'Button',
    category: 'Inputs & Actions',
    description:
      'High-contrast monochrome action button with Signal Red critical variant, outline, ghost, pill, square, and accessible loading spinner built on @ui-sdk/react/button.',
    keywords: ['action', 'cta', 'submit', 'signal', 'loading', 'pill'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/button',
    dependencies: ['@ui-sdk/react', '@phosphor-icons/react'],
    sourcePath: 'packages/ui/src/components/button.tsx',
    features: [
      'Six semantic variants: primary, secondary, outline, ghost, signal, and link',
      'Three hardware shapes: rounded, pill, and zero-radius square',
      'Loading state sets aria-busy and blocks pointer/keyboard activation',
    ],
    props: [
      { name: 'variant', type: '"primary" | "secondary" | "outline" | "ghost" | "signal" | "link"', defaultValue: '"primary"', description: 'Visual contrast and emphasis role.' },
      { name: 'size', type: '"sm" | "md" | "lg" | "icon"', defaultValue: '"md"', description: 'Touch-safe control sizing.' },
      { name: 'shape', type: '"rounded" | "pill" | "square"', defaultValue: '"rounded"', description: 'Corner geometry.' },
      { name: 'loading', type: 'boolean', defaultValue: 'false', description: 'Sets aria-busy, blocks duplicate clicks, and displays the configured loader.' },
    ],
    keyboard: [
      { key: 'Enter / Space', action: 'Activates the button when enabled.' },
      { key: 'Tab', action: 'Moves focus with visible 2px focus ring.' },
    ],
    accessibilityNotes: 'Uses native <button> semantics via @ui-sdk/react/button. Icon-only buttons require aria-label.',
    related: ['input', 'dialog', 'dropdown-menu'],
  },
  {
    slug: 'glyph-matrix',
    moduleNumber: '40',
    title: 'Glyph Matrix (13×13 & 25×25)',
    category: 'Data & Hardware',
    description:
      'Circularly masked addressable LED dot matrices in 25×25 (481 dots) and 13×13 (121 dots) resolutions, with 8 presets, pointer/keyboard painting, ring progress, and frame animation.',
    keywords: ['glyph', 'led', 'matrix', '25x25', '13x13', 'phone 3', 'hardware', 'animation'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    dependencies: ['@nothing-ui/core'],
    sourcePath: 'packages/ui/src/components/glyph-matrix.tsx',
    features: [
      'Canonical 25×25 (radius 12.3 → 481 LEDs) and 13×13 (radius 6.15 → 121 LEDs) circular void masks',
      'Controlled (cells + onCellsChange) and uncontrolled (preset / defaultCells) state',
      'Pointer drag painting, keyboard arrow + Space editing, GlyphProgress, and reduced-motion GlyphAnimator',
    ],
    props: [
      { name: 'resolution', type: '13 | 25', defaultValue: '25', description: 'Grid resolution and circular mask geometry.' },
      { name: 'preset', type: '"power" | "play" | "heart" | "live" | "arrow" | "sound" | "smiley" | "plus"', defaultValue: '"power"', description: 'Initial built-in geometric pattern.' },
      { name: 'cells', type: 'readonly GlyphCellState[]', description: 'Controlled flat cell array matching resolution * resolution.' },
      { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Enables click/drag LED painting and keyboard navigation.' },
      { name: 'paintState', type: '"off" | "on" | "signal"', defaultValue: '"on"', description: 'Active LED state applied on click/drag.' },
    ],
    keyboard: [
      { key: 'Arrow Keys', action: 'Moves focus cursor across addressable circular LEDs.' },
      { key: 'Space / Enter', action: 'Toggles the focused LED using the active paint state.' },
    ],
    accessibilityNotes: 'Static matrices expose role="img" with descriptive aria-label. Interactive matrices expose role="application" with per-LED coordinate labels and respect prefers-reduced-motion.',
    related: ['dot-icon', 'rotary-knob', 'progress'],
  },
  {
    slug: 'dot-icon',
    moduleNumber: '21',
    title: 'Dot Icon (1,691-Icon Pack · Full Lucide)',
    category: 'Data & Hardware',
    description:
      'Built-in nthgui/icons subpath containing 1,691 dot-matrix SVG icons — 247 hand-crafted Nothing originals plus 100% of the Lucide Icons directory (1,638 canonical + 230 aliases) — with fully configurable size, color, single-dot scale, dot shape, and 5×5 to 25×25 matrix grids for web and native.',
    keywords: ['icon', 'dot', 'pixel', '9x9', '15x15', 'lucide', 'matrix', 'grid', 'svg', 'mappin', 'map-pin'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/dot-icons/react',
    nativeImport: '@nothing-ui/dot-icons/native',
    dependencies: ['@nothing-ui/dot-icons'],
    sourcePath: 'packages/dot-icons/src/react/dot-icon.tsx',
    features: [
      '1,691 validated monochrome dot-matrix icons (247 hand-crafted 9×9 Nothing originals + 1,444 crisp 15×15 Lucide Directory icons + 216 official aliases) across 9 categories with zero external runtime dependency',
      'Fully configurable dot grid (gridSize, independent gridCols/gridRows 5–25, scale/center fit, padding, showGrid unlit matrix, and custom painted grid override)',
      'Adjustable size, color, single-dot dotScale, dotGap, dotShape (circle/rounded/square/diamond), and backwards-compatible dotRadius',
    ],
    props: [
      { name: 'name', type: 'DotIconName', description: 'Canonical icon ID or alias (e.g. "wifi", "earbuds", "map-pin", "settings").' },
      { name: 'size', type: 'number', defaultValue: '20', description: 'Rendered SVG size in pixels (longest side for rectangular grids).' },
      { name: 'color', type: 'string', defaultValue: '"currentColor"', description: 'Active lit dot fill color (hex, CSS variable, or currentColor).' },
      { name: 'dotScale', type: 'number', defaultValue: '0.78', description: 'Single-dot size scale relative to cell width (0.2–1.2).' },
      { name: 'dotGap', type: 'number', defaultValue: '0', description: 'Additional inter-dot spacing inset (0–0.5).' },
      { name: 'dotShape', type: '"circle" | "rounded" | "square" | "diamond"', defaultValue: '"circle"', description: 'Geometry of every dot inside the matrix.' },
      { name: 'gridSize', type: 'number', defaultValue: '9', description: 'Shorthand square dot-grid resolution (5–25).' },
      { name: 'gridCols', type: 'number', description: 'Independent horizontal dot count (5–25); overrides gridSize.' },
      { name: 'gridRows', type: 'number', description: 'Independent vertical dot count (5–25); overrides gridSize.' },
      { name: 'gridMode', type: '"scale" | "center"', defaultValue: '"scale"', description: 'Resample bitmap proportionally or center inside the target grid.' },
      { name: 'gridPadding', type: 'number', defaultValue: '0', description: 'Unlit margin cells around the icon inside the grid (0–4).' },
      { name: 'showGrid', type: 'boolean', defaultValue: 'false', description: 'Renders the unlit background dot matrix behind active dots.' },
      { name: 'grid', type: 'readonly string[]', description: 'Direct custom "#" / "." bitmap override for custom painted icons.' },
      { name: 'dotRadius', type: 'number', description: 'Legacy explicit radius override inside the unit cell (0.08–0.58).' },
      { name: 'decorative', type: 'boolean', defaultValue: 'false', description: 'Sets aria-hidden="true" when paired with adjacent text.' },
    ],
    keyboard: [{ key: 'N/A', action: 'Non-interactive vector icon; wrap inside a Button for interactive actions.' }],
    accessibilityNotes: 'Defaults to role="img" with descriptive aria-label; pass decorative when accompanied by visible text.',
    related: ['glyph-matrix', 'button'],
  },
  {
    slug: 'input',
    moduleNumber: '06',
    title: 'Input & Textarea',
    category: 'Inputs & Actions',
    description:
      'Accessible text fields with customizable regex-based validation, live format hints, aria-invalid error indicators, and multi-line textareas built on @ui-sdk/react/input, textarea, and field.',
    keywords: ['text', 'form', 'field', 'textarea', 'validation', 'regex', 'pattern'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/input',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Input.tsx',
    features: [
      'Built-in customizable regex validation (validationRule / validationRegex + flags + custom error copy) with safe syntax diagnostics',
      'Automatic label, format mask hint, helper, and invalid error wiring via @ui-sdk/react/field',
      'Signal Red aria-invalid border, surface tint, and inline alert icon paired with descriptive error text',
    ],
    props: [
      { name: 'label', type: 'string', description: 'Associated visible field label.' },
      { name: 'validationRule', type: 'RegexValidationRule', description: 'Full regex rule object (pattern, flags, formatLabel, message, normalize, required).' },
      { name: 'validationRegex', type: 'RegExp | string', description: 'Shorthand regular expression or pattern string validated on change or blur.' },
      { name: 'validationFlags', type: 'string', description: 'Optional regex flags (i, m, s, u, v) used with validationRegex.' },
      { name: 'validationMessage', type: 'string', description: 'Custom Nothing UI error message displayed on pattern mismatch.' },
      { name: 'formatHint', type: 'string', description: 'Monospace format mask displayed opposite the label (e.g. NP3-XXX-X).' },
      { name: 'validateOn', type: '"change" | "blur" | "always"', defaultValue: '"change"', description: 'Controls when built-in regex errors appear.' },
      { name: 'error', type: 'string', description: 'Explicit validation error text; sets invalid state and aria-invalid.' },
      { name: 'description', type: 'string', description: 'Helper text linked via aria-describedby.' },
    ],
    keyboard: [
      { key: 'Tab', action: 'Moves focus into and out of the input field.' },
    ],
    accessibilityNotes: 'Never communicates invalid state by red border alone — always pairs Signal Red borders with trailing error icons and readable error text.',
    related: ['form', 'copy-field', 'otp-input', 'select'],
  },
  {
    slug: 'copy-field',
    moduleNumber: '46',
    title: 'Copy Field',
    category: 'Inputs & Actions',
    description:
      'Monospace command or token field with one-click clipboard copy and inline confirmation feedback.',
    keywords: ['clipboard', 'copy', 'cli', 'command', 'token'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/button',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Input.tsx',
    features: ['Tabular monospace display with overflow truncation', 'Instant visual Copied confirmation state'],
    props: [
      { name: 'value', type: 'string', description: 'Read-only string copied to clipboard.' },
      { name: 'label', type: 'string', description: 'Optional uppercase caption above the field.' },
    ],
    keyboard: [{ key: 'Enter / Space', action: 'Triggers clipboard copy when copy button is focused.' }],
    accessibilityNotes: 'Provides explicit button aria-label and visible confirmation text.',
    related: ['input', 'button'],
  },
  {
    slug: 'otp-input',
    moduleNumber: '43',
    title: 'Verification Code',
    category: 'Inputs & Actions',
    description:
      'Dot-matrix numeric verification code slots supporting paste, keyboard arrows, and auto-advance via @ui-sdk/react/otp-input.',
    keywords: ['otp', 'pin', '2fa', 'verification', 'code'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/otp-input',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['6-digit split slot groups with center dot separator', 'Full clipboard paste and arrow-key navigation'],
    props: [
      { name: 'defaultValue', type: 'string', defaultValue: '"2048"', description: 'Initial code digits.' },
      { name: 'maxLength', type: 'number', defaultValue: '6', description: 'Number of character slots.' },
    ],
    keyboard: [
      { key: '0-9 / Backspace', action: 'Enters or deletes digits with auto-advance.' },
      { key: 'ArrowLeft / ArrowRight', action: 'Navigates across code slots.' },
    ],
    accessibilityNotes: 'Uses a single accessible hidden textbox backed by visual slot indicators.',
    related: ['input', 'number-input'],
  },
  {
    slug: 'checkbox',
    moduleNumber: '06B',
    title: 'Checkbox & Radio',
    category: 'Inputs & Actions',
    description:
      'Sharp monochrome checkboxes and mutually exclusive radio groups powered by @ui-sdk/react/checkbox and @ui-sdk/react/radio.',
    keywords: ['checkbox', 'radio', 'selection', 'form'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/checkbox',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Explicit check glyph indicator paired with inverse fill', 'Roving tabindex arrow navigation in RadioGroup'],
    props: [
      { name: 'label', type: 'string', description: 'Clickable text label bound to the control.' },
      { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Uncontrolled initial checked state.' },
    ],
    keyboard: [
      { key: 'Space', action: 'Toggles Checkbox or selects focused Radio item.' },
      { key: 'ArrowUp / ArrowDown', action: 'Moves selection between Radio options.' },
    ],
    accessibilityNotes: 'Maintains native checkbox/radio roles and full label hit targets.',
    related: ['switch', 'segmented-control'],
  },
  {
    slug: 'switch',
    moduleNumber: '11',
    title: 'Switch',
    category: 'Inputs & Actions',
    description:
      'Mechanical hardware-inspired toggle switch with monochrome default and Signal Red critical channel accent built on @ui-sdk/react/switch.',
    keywords: ['toggle', 'switch', 'boolean', 'settings'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/switch',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Smooth 150ms compositor-only thumb translation', 'Optional Signal Red tone for alerts and critical channels'],
    props: [
      { name: 'label', type: 'string', description: 'Visible switch label.' },
      { name: 'tone', type: '"mono" | "signal"', defaultValue: '"mono"', description: 'Track fill when checked.' },
      { name: 'defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Initial toggle state.' },
    ],
    keyboard: [{ key: 'Space / Enter', action: 'Toggles the switch state.' }],
    accessibilityNotes: 'Exposes role="switch" and aria-checked synchronized with the label.',
    related: ['checkbox', 'slider'],
  },
  {
    slug: 'slider',
    moduleNumber: '08',
    title: 'Slider',
    category: 'Inputs & Actions',
    description:
      'Precision linear slider with tabular value readout and optional Signal Red track built on @ui-sdk/react/slider.',
    keywords: ['range', 'slider', 'volume', 'brightness'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/slider',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Subpixel-centered thumb positioning via @ui-sdk/core', 'Live tabular-nums value indicator with unit suffix'],
    props: [
      { name: 'label', type: 'string', description: 'Accessible slider name and visible caption.' },
      { name: 'defaultValue', type: 'number', defaultValue: '50', description: 'Starting numeric value.' },
      { name: 'min / max / step', type: 'number', defaultValue: '0 / 100 / 1', description: 'Numeric bounds and step size.' },
      { name: 'tone', type: '"mono" | "signal"', defaultValue: '"mono"', description: 'Active indicator fill color.' },
    ],
    keyboard: [
      { key: 'ArrowLeft / ArrowRight', action: 'Decrements or increments by one step.' },
      { key: 'Home / End', action: 'Jumps to min or max bound.' },
    ],
    accessibilityNotes: 'Announces live value and range bounds via aria-valuemin/max/now.',
    related: ['rotary-knob', 'progress'],
  },
  {
    slug: 'select',
    moduleNumber: '22B',
    title: 'Select',
    category: 'Inputs & Actions',
    description:
      'Keyboard-navigable dropdown select with frosted floating panel and active check indicator powered by @ui-sdk/react/select.',
    keywords: ['dropdown', 'picker', 'options', 'select'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/select',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Collision-aware floating listbox', 'Typeahead item jumping and Escape dismissal'],
    props: [
      { name: 'label', type: 'string', description: 'Field label above the select trigger.' },
      { name: 'options', type: 'Array<{ value: string; label: string }>', description: 'Selectable option list.' },
    ],
    keyboard: [
      { key: 'Enter / Space / ArrowDown', action: 'Opens the listbox.' },
      { key: 'Escape', action: 'Closes listbox and restores focus to trigger.' },
    ],
    accessibilityNotes: 'Maintains ARIA combobox/listbox relationship with active descendant tracking.',
    related: ['dropdown-menu', 'command'],
  },
  {
    slug: 'number-input',
    moduleNumber: '34B',
    title: 'Number Stepper',
    category: 'Inputs & Actions',
    description:
      'Tactile numeric stepper with increment/decrement buttons and tabular numerals built on @ui-sdk/react/number-input.',
    keywords: ['quantity', 'counter', 'stepper', 'number'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/number-input',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Bounded min/max clamping with step increments', 'Monospace tabular input display'],
    props: [
      { name: 'defaultValue', type: 'number', defaultValue: '24', description: 'Initial numeric value.' },
      { name: 'min / max', type: 'number', defaultValue: '0 / 100', description: 'Allowed range.' },
    ],
    keyboard: [{ key: 'ArrowUp / ArrowDown', action: 'Increments or decrements the numeric value.' }],
    accessibilityNotes: 'Exposes spinbutton role with explicit increment/decrement button labels.',
    related: ['slider', 'rotary-knob'],
  },
  {
    slug: 'rating',
    moduleNumber: '34',
    title: 'Rating',
    category: 'Inputs & Actions',
    description:
      'Dot-matrix score picker with Signal Red active dots and keyboard arrow control built on @ui-sdk/react/rating.',
    keywords: ['score', 'stars', 'dots', 'rating'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/rating',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Interactive circular dot indicators', 'Live tabular numeric readout alongside dots'],
    props: [
      { name: 'defaultValue', type: 'number', defaultValue: '4', description: 'Initial rating.' },
      { name: 'max', type: 'number', defaultValue: '5', description: 'Maximum score.' },
    ],
    keyboard: [{ key: 'ArrowLeft / ArrowRight', action: 'Adjusts selected score.' }],
    accessibilityNotes: 'Provides numeric readout so score is never communicated by color alone.',
    related: ['slider', 'meter'],
  },
  {
    slug: 'dropzone',
    moduleNumber: '35',
    title: 'Dropzone',
    category: 'Inputs & Actions',
    description:
      'Drag-and-drop file uploader with dot-icon visual cue and removable file queue powered by @ui-sdk/react/file-input.',
    keywords: ['upload', 'file', 'dropzone', 'drag'],
    web: 'stable',
    native: 'unsupported',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/file-input',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Drag-over highlight and keyboard file picker trigger', 'Per-file removable rows with byte sizing'],
    props: [{ name: 'accept', type: 'string', description: 'Accepted MIME types or extensions.' }],
    keyboard: [{ key: 'Enter / Space', action: 'Opens native OS file chooser.' }],
    accessibilityNotes: 'Keyboard-focusable drop region with accessible file removal buttons.',
    related: ['input', 'button'],
  },
  {
    slug: 'rotary-knob',
    moduleNumber: '41',
    title: 'Rotary Knob',
    category: 'Inputs & Actions',
    description:
      'Hardware-inspired tactile rotary encoder with vertical pointer drag, keyboard arrows, and 270° LED dot ring bundled in nothing-ui.',
    keywords: ['knob', 'dial', 'encoder', 'audio', 'gain', 'hardware'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/core'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['270° angular sweep mapped from -135° to +135°', 'Vertical drag sensitivity + keyboard arrow/Home/End support'],
    props: [
      { name: 'label', type: 'string', defaultValue: '"GAIN"', description: 'Encoder label and aria-label.' },
      { name: 'defaultValue', type: 'number', defaultValue: '55', description: 'Initial value.' },
      { name: 'min / max', type: 'number', defaultValue: '0 / 100', description: 'Numeric bounds.' },
    ],
    keyboard: [
      { key: 'ArrowUp / ArrowRight', action: 'Increases value by step.' },
      { key: 'ArrowDown / ArrowLeft', action: 'Decreases value by step.' },
    ],
    accessibilityNotes: 'Exposes role="slider" with aria-valuemin, aria-valuemax, and aria-valuenow.',
    related: ['slider', 'glyph-matrix'],
  },
  {
    slug: 'tabs',
    moduleNumber: '38',
    title: 'Tabs',
    category: 'Navigation & Layout',
    description:
      'Underline and segmented tab bars with keyboard roving focus built on @ui-sdk/react/tabs.',
    keywords: ['tabs', 'panels', 'navigation', 'switcher'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/tabs',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Underline and segmented visual treatments', 'Automatic ARIA tablist/tab/tabpanel binding'],
    props: [{ name: 'variant', type: '"underline" | "segmented"', defaultValue: '"underline"', description: 'Tab list presentation.' }],
    keyboard: [{ key: 'ArrowLeft / ArrowRight', action: 'Cycles focus between tab triggers.' }],
    accessibilityNotes: 'Follows WAI-ARIA Tabs Pattern with Home/End support.',
    related: ['segmented-control', 'accordion'],
  },
  {
    slug: 'segmented-control',
    moduleNumber: '30',
    title: 'Segmented & Toggle Group',
    category: 'Navigation & Layout',
    description:
      'Single-choice segmented switcher and multi-toggle toolbar buttons built on @ui-sdk/react/segmented-control and @ui-sdk/react/toggle.',
    keywords: ['segmented', 'toggle', 'radio', 'switcher'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/segmented-control',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Controls.tsx',
    features: ['Single-select radiogroup semantics for segmented switchers', 'Independent toggle states for formatting bars'],
    props: [
      { name: 'options', type: 'Array<{ value: string; label: string }>', description: 'Segmented choices.' },
      { name: 'defaultValue', type: 'string', description: 'Initially selected segment.' },
    ],
    keyboard: [{ key: 'ArrowLeft / ArrowRight', action: 'Moves selection between segments.' }],
    accessibilityNotes: 'Uses radiogroup/radio semantics with clear active contrast.',
    related: ['tabs', 'checkbox'],
  },
  {
    slug: 'accordion',
    moduleNumber: '23',
    title: 'Accordion & Collapsible',
    category: 'Navigation & Layout',
    description:
      'Hairline-divided disclosure rows with crisp rotational indicators built on @ui-sdk/react/accordion and @ui-sdk/react/collapsible.',
    keywords: ['accordion', 'collapsible', 'disclosure', 'faq'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/accordion',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Single or multi-expand disclosure sections', 'Hairline monochrome separators without card clutter'],
    props: [{ name: 'items', type: 'Array<{ id: string; title: string; content: string }>', description: 'Accordion rows.' }],
    keyboard: [{ key: 'Enter / Space', action: 'Expands or collapses the focused disclosure header.' }],
    accessibilityNotes: 'Sets aria-expanded and aria-controls on each disclosure trigger.',
    related: ['tabs', 'tree-view'],
  },
  {
    slug: 'breadcrumb',
    moduleNumber: '24',
    title: 'Breadcrumb & Separator',
    category: 'Navigation & Layout',
    description:
      'Slash-separated navigation breadcrumbs paired with labeled hairline dividers built on @ui-sdk/react/separator.',
    keywords: ['breadcrumb', 'divider', 'separator', 'path'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/separator',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['Semantic <nav aria-label="Breadcrumb"> list', 'Horizontal and vertical hairline Separator primitives'],
    props: [{ name: 'items', type: 'Array<{ label: string; href?: string }>', description: 'Ordered path segments.' }],
    keyboard: [{ key: 'Tab', action: 'Moves focus across interactive breadcrumb links.' }],
    accessibilityNotes: 'Marks the current page with aria-current="page".',
    related: ['pagination', 'tabs'],
  },
  {
    slug: 'pagination',
    moduleNumber: '09',
    title: 'Pagination',
    category: 'Navigation & Layout',
    description:
      'Accessible multi-page navigation with smart ellipsis ranges powered by @ui-sdk/react/pagination.',
    keywords: ['pages', 'pagination', 'table', 'list'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/pagination',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Automatic range ellipsis and prev/next boundary disabling', 'Tabular-numerals square page buttons'],
    props: [{ name: 'totalPages', type: 'number', defaultValue: '12', description: 'Total number of pages.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Focuses and activates page controls.' }],
    accessibilityNotes: 'Marks active page with aria-current="page".',
    related: ['data-table', 'breadcrumb'],
  },
  {
    slug: 'command',
    moduleNumber: '27',
    title: 'Command Palette',
    category: 'Navigation & Layout',
    description:
      'Live filterable command launcher with grouped actions, keyboard shortcuts, and empty states built on @ui-sdk/react/command.',
    keywords: ['cmdk', 'search', 'palette', 'launcher', 'shortcuts'],
    web: 'stable',
    native: 'unsupported',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/command',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Instant substring filtering across groups', 'Keyboard Up/Down highlight and Enter execution'],
    props: [{ name: 'onAction', type: '(value: string) => void', description: 'Callback fired when a command item is selected.' }],
    keyboard: [
      { key: 'ArrowUp / ArrowDown', action: 'Moves active highlight across matching commands.' },
      { key: 'Enter', action: 'Executes highlighted command.' },
    ],
    accessibilityNotes: 'Implements ARIA combobox + listbox with labeled options and empty announcement.',
    related: ['dialog', 'dropdown-menu'],
  },
  {
    slug: 'dropdown-menu',
    moduleNumber: '22',
    title: 'Dropdown Menu',
    category: 'Navigation & Layout',
    description:
      'Anchored action menu with section labels, keyboard shortcuts, separators, and Signal Red destructive actions built on @ui-sdk/react/menu.',
    keywords: ['menu', 'dropdown', 'actions', 'context'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/menu',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Collision-aware positioning', 'Keyboard arrow navigation and typeahead selection'],
    props: [{ name: 'onAction', type: '(value: string) => void', description: 'Handler fired with chosen menu item value.' }],
    keyboard: [
      { key: 'ArrowDown / ArrowUp', action: 'Navigates menu items.' },
      { key: 'Escape', action: 'Dismisses menu and returns focus to trigger.' },
    ],
    accessibilityNotes: 'Uses WAI-ARIA menu/menuitem roles with focus restoration.',
    related: ['select', 'popover'],
  },
  {
    slug: 'tree-view',
    moduleNumber: '39',
    title: 'Tree View',
    category: 'Navigation & Layout',
    description:
      'Hierarchical keyboard-accessible directory explorer with expandable branches built on @ui-sdk/react/tree.',
    keywords: ['tree', 'files', 'explorer', 'hierarchy'],
    web: 'stable',
    native: 'unsupported',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/tree',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Navigation.tsx',
    features: ['Expand/collapse nested branches with keyboard arrows', 'Monospace technical hierarchy typography'],
    props: [{ name: 'defaultExpanded', type: 'string[]', description: 'Initially expanded branch IDs.' }],
    keyboard: [
      { key: 'ArrowRight / ArrowLeft', action: 'Expands or collapses focused branch.' },
      { key: 'ArrowDown / ArrowUp', action: 'Moves focus between visible tree nodes.' },
    ],
    accessibilityNotes: 'Exposes role="tree" and aria-expanded per branch.',
    related: ['accordion', 'data-table'],
  },
  {
    slug: 'card',
    moduleNumber: '13',
    title: 'Cards & Lists',
    category: 'Navigation & Layout',
    description:
      'Monochrome surface cards with 1px hairline borders, segmented battery bars, and clean interactive list rows.',
    keywords: ['card', 'surface', 'panel', 'list'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Single-elevation monochrome surface paired across light, dark, and high-contrast modes', 'Header kicker and trailing action slot'],
    props: [
      { name: 'title', type: 'string', description: 'Card heading.' },
      { name: 'kicker', type: 'string', description: 'Optional quiet micro-label above heading.' },
    ],
    keyboard: [{ key: 'Tab', action: 'Focuses interactive actions inside the card.' }],
    accessibilityNotes: 'Uses semantic section/heading structure without nested card-in-card clutter.',
    related: ['metric-card', 'alert'],
  },
  {
    slug: 'dialog',
    moduleNumber: '18',
    title: 'Dialog & Alert Dialog',
    category: 'Overlays & Feedback',
    description:
      'Accessible modal and destructive confirmation dialogs with backdrop blur, focus trapping, and Escape dismissal via @ui-sdk/react/dialog and alert-dialog.',
    keywords: ['modal', 'dialog', 'alert', 'confirm', 'overlay'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/dialog',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Overlays.tsx',
    features: ['Focus trap and focus restoration on close', 'AlertDialog prevents accidental backdrop dismissal for destructive actions'],
    props: [{ name: 'open / onOpenChange', type: 'boolean / (open: boolean) => void', description: 'Controlled visibility state.' }],
    keyboard: [
      { key: 'Escape', action: 'Closes standard Dialog.' },
      { key: 'Tab', action: 'Cycles focus within the open dialog.' },
    ],
    accessibilityNotes: 'Links DialogTitle via aria-labelledby and DialogDescription via aria-describedby.',
    related: ['drawer', 'popover'],
  },
  {
    slug: 'drawer',
    moduleNumber: '18B',
    title: 'Drawer',
    category: 'Overlays & Feedback',
    description:
      'Hardware-sheet bottom drawer with tactile grip handle and backdrop blur built on @ui-sdk/react/drawer.',
    keywords: ['sheet', 'bottom-sheet', 'drawer', 'mobile'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/drawer',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Overlays.tsx',
    features: ['Mobile-friendly bottom sheet geometry', 'Focus trapping and Escape dismissal'],
    props: [{ name: 'open / onOpenChange', type: 'boolean / (open: boolean) => void', description: 'Controlled open state.' }],
    keyboard: [{ key: 'Escape', action: 'Dismisses the bottom drawer.' }],
    accessibilityNotes: 'Exposes modal dialog semantics with visible close control.',
    related: ['dialog', 'popover'],
  },
  {
    slug: 'popover',
    moduleNumber: '17',
    title: 'Popover & Tooltip',
    category: 'Overlays & Feedback',
    description:
      'Collision-aware floating popovers and instant high-contrast tooltips powered by @ui-sdk/react/popover and @ui-sdk/react/tooltip.',
    keywords: ['popover', 'tooltip', 'floating', 'hint'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/popover',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Overlays.tsx',
    features: ['Viewport collision flipping', 'Keyboard focus-triggered tooltips without blocking clicks'],
    props: [{ name: 'content', type: 'ReactNode', description: 'Floating panel or tooltip body.' }],
    keyboard: [{ key: 'Escape', action: 'Dismisses active Popover or Tooltip.' }],
    accessibilityNotes: 'Tooltips link via aria-describedby; interactive content uses Popover, never Tooltip.',
    related: ['dropdown-menu', 'dialog'],
  },
  {
    slug: 'toast',
    moduleNumber: '29',
    title: 'Toast',
    category: 'Overlays & Feedback',
    description:
      'Programmatic toast notification queue with inline Undo actions and auto-dismissal powered by @ui-sdk/react/toast.',
    keywords: ['notification', 'snackbar', 'toast', 'status'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/toast',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Overlays.tsx',
    features: ['Imperative appToaster.create() queue API', 'Screen-reader live region announcements and manual close button'],
    props: [
      { name: 'title', type: 'string', description: 'Primary toast message.' },
      { name: 'description', type: 'string', description: 'Supporting details.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Focuses inline Undo or dismiss button.' }],
    accessibilityNotes: 'Polite live region announces toasts without stealing keyboard focus.',
    related: ['alert', 'dialog'],
  },
  {
    slug: 'alert',
    moduleNumber: '10',
    title: 'Alerts & Banner',
    category: 'Overlays & Feedback',
    description:
      'High-contrast inline alert boxes and dismissible system banners pairing semantic colors with explicit icons and labels.',
    keywords: ['alert', 'banner', 'callout', 'warning', 'error'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['Default, Signal Red error, warning, and success tones', 'Zero hue-only signaling — always pairs icon + label'],
    props: [
      { name: 'tone', type: '"neutral" | "signal" | "success" | "warning"', defaultValue: '"neutral"', description: 'Semantic intent.' },
      { name: 'title', type: 'string', description: 'Concise alert heading.' },
    ],
    keyboard: [{ key: 'Enter / Space', action: 'Dismisses closable banners.' }],
    accessibilityNotes: 'Uses role="alert" for critical messages and role="status" for informational notices.',
    related: ['toast', 'card'],
  },
  {
    slug: 'progress',
    moduleNumber: '19',
    title: 'Progress, Meter & Stepper',
    category: 'Overlays & Feedback',
    description:
      'Linear progress bars, segmented hardware meters, and interactive step indicators built on @ui-sdk/react/progress and @ui-sdk/react/meter.',
    keywords: ['progress', 'meter', 'battery', 'stepper', 'bar'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/progress',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['Determinate progress bar + 16-block Nothing SegmentedBar', 'Accessible value/max numeric readout'],
    props: [
      { name: 'value', type: 'number', defaultValue: '68', description: 'Current percentage (0..100).' },
      { name: 'segments', type: 'number', defaultValue: '16', description: 'Block count for SegmentedBar.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Activates interactive Stepper steps.' }],
    accessibilityNotes: 'Exposes progressbar/meter ARIA values with paired percentage text.',
    related: ['glyph-matrix', 'slider'],
  },
  {
    slug: 'skeleton',
    moduleNumber: '42',
    title: 'Skeleton, Dot Loader & Empty',
    category: 'Overlays & Feedback',
    description:
      '3×3 Nothing Dot Matrix Loader, geometry-matched skeleton placeholders, and crisp empty state panels.',
    keywords: ['loading', 'skeleton', 'spinner', 'empty', 'dot-loader'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['3×3 animated dot-matrix loader honoring prefers-reduced-motion', 'Subtle shimmer skeleton and actionable empty state'],
    props: [{ name: 'label', type: 'string', defaultValue: '"SYNC"', description: 'Accessible status label for DotLoader.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Focuses primary recovery CTA inside EmptyState.' }],
    accessibilityNotes: 'DotLoader exposes role="status"; animations halt automatically under reduced-motion.',
    related: ['progress', 'card'],
  },
  {
    slug: 'data-table',
    moduleNumber: '15',
    title: 'Data Table',
    category: 'Data & Hardware',
    description:
      'High-density sortable tabular-numerals data table with live client-side search filtering and hairline row alignment.',
    keywords: ['table', 'grid', 'sort', 'filter', 'tabular'],
    web: 'stable',
    native: 'unsupported',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Click-to-sort columns with directional indicator', 'Live search filtering with explicit empty state'],
    props: [{ name: 'rows', type: 'TableRow[]', description: 'Tabular dataset rendered with tabular-nums.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Triggers column header sorting.' }],
    accessibilityNotes: 'Uses semantic <table>, <thead>, <th scope="col">, and aria-sort.',
    related: ['pagination', 'metric-card'],
  },
  {
    slug: 'calendar',
    moduleNumber: '16',
    title: 'Calendar',
    category: 'Data & Hardware',
    description:
      'Full keyboard-navigable monthly date grid with Signal Red today marker and inverse selected date built on @ui-sdk/react/calendar.',
    keywords: ['date', 'calendar', 'month', 'schedule'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/calendar',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Arrow-key day traversal and month pagination', 'High-contrast selected day + Signal Red today ring'],
    props: [{ name: 'defaultValue', type: 'Date', description: 'Initially selected date.' }],
    keyboard: [
      { key: 'Arrow Keys', action: 'Moves focus across days and weeks.' },
      { key: 'Enter / Space', action: 'Selects focused calendar date.' },
    ],
    accessibilityNotes: 'Follows ARIA grid calendar navigation with full weekday headers.',
    related: ['input', 'popover'],
  },
  {
    slug: 'timeline',
    moduleNumber: '32',
    title: 'Timeline & Activity Stream',
    category: 'Data & Hardware',
    description:
      'Structured event timelines built on @ui-sdk/react/timeline paired with a live pauseable telemetry stream.',
    keywords: ['timeline', 'activity', 'log', 'events', 'stream'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    uiSdkPrimitive: '@ui-sdk/react/timeline',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Chronological vertical connector timeline', 'Pauseable ActivityStream with clean timer cleanup'],
    props: [{ name: 'items', type: 'TimelineEntry[]', description: 'Ordered timeline milestones.' }],
    keyboard: [{ key: 'Enter / Space', action: 'Toggles pause/resume on ActivityStream.' }],
    accessibilityNotes: 'Timestamps use tabular numerals and semantic list markup.',
    related: ['data-table', 'metric-card'],
  },
  {
    slug: 'metric-card',
    moduleNumber: '37',
    title: 'Metric & Live Counter',
    category: 'Data & Hardware',
    description:
      'Dot-matrix Doto display KPI tiles and smooth tabular live counters for structured metrics.',
    keywords: ['kpi', 'metric', 'counter', 'stats', 'doto'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/DataDisplay.tsx',
    features: ['Doto dot-matrix display figures with tabular alignment', 'Explicit unit and delta context labels'],
    props: [
      { name: 'label', type: 'string', description: 'Metric descriptor.' },
      { name: 'value', type: 'string | number', description: 'Primary figure.' },
    ],
    keyboard: [{ key: 'N/A', action: 'Read-only data display tile.' }],
    accessibilityNotes: 'Delta trends pair signed numbers with explicit text rather than color alone.',
    related: ['card', 'data-table'],
  },
  {
    slug: 'avatar',
    moduleNumber: '12',
    title: 'Avatar, Chips & Kbd',
    category: 'Data & Hardware',
    description:
      'Monochrome avatar stacks powered by @ui-sdk/react/avatar, interactive filterable chips, keyboard keycaps, and code blocks.',
    keywords: ['avatar', 'badge', 'chip', 'kbd', 'code'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    uiSdkPrimitive: '@ui-sdk/react/avatar',
    dependencies: ['@ui-sdk/react'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['Graceful monogram fallbacks on Avatar', 'Interactive filter buttons, crisp <kbd> keycaps, and copyable CodeBlock'],
    props: [{ name: 'initials', type: 'string', description: 'Monogram fallback text.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Toggles interactive filter chips.' }],
    accessibilityNotes: 'Separates decorative initials from interactive filter chip buttons.',
    related: ['card', 'copy-field'],
  },
  {
    slug: 'dot-text',
    moduleNumber: '47',
    title: 'Dotted UI (DotText, Counter, Progress, Clock)',
    category: 'Data & Hardware',
    description:
      'Family 15 Nothing UI exclusive dotted primitives: DotText display typography, DotCounter tabular readouts, DotProgress discrete dot bars, DotMatrixClock, and DotLoader.',
    keywords: ['dot-text', 'dot-counter', 'dot-progress', 'dot-matrix-clock', 'typography', 'doto', 'exclusive'],
    web: 'stable',
    native: 'beta',
    webImport: '@nothing-ui/ui',
    nativeImport: '@nothing-ui/ui-native',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'packages/ui/src/components/dotted-ui.tsx',
    features: [
      'DotText maps Doto optical display sizes with Signal Red accent option',
      'DotCounter, DotProgress (role="progressbar"), and live 12h/24h DotMatrixClock',
    ],
    props: [
      { name: 'size', type: '"sm" | "md" | "lg" | "xl" | "2xl"', defaultValue: '"md"', description: 'Display scale for DotText.' },
      { name: 'value', type: 'number', defaultValue: '72', description: 'Current value for DotProgress / DotCounter.' },
    ],
    keyboard: [{ key: 'Enter / Space', action: 'Toggles 12H/24H mode on DotMatrixClock.' }],
    accessibilityNotes: 'Uses tabular-nums across all numeric readouts and standard progressbar ARIA semantics.',
    related: ['dot-icon', 'glyph-matrix', 'metric-card'],
  },
  {
    slug: 'hardware-kit',
    moduleNumber: '48',
    title: 'Hardware Controls (LED, SignalMeter, QuickSettingTile)',
    category: 'Data & Hardware',
    description:
      'Family 16 Nothing UI exclusive hardware primitives: LEDIndicator diodes, SignalMeter RF reception bars, and Nothing OS QuickSettingTile toggles.',
    keywords: ['led-indicator', 'signal-meter', 'quick-setting-tile', 'hardware', 'exclusive', 'nothing-os'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/dot-icons', '@nothing-ui/tokens'],
    sourcePath: 'packages/ui/src/components/hardware-ui.tsx',
    features: [
      'LEDIndicator supports mono, signal, success, warning, off tones and reduced-motion pulse',
      'SignalMeter exposes role="meter" with RSSI/dBm readout; QuickSettingTile uses aria-pressed',
    ],
    props: [
      { name: 'tone', type: '"mono" | "signal" | "success" | "warning" | "off"', defaultValue: '"signal"', description: 'LEDIndicator illumination state.' },
      { name: 'strength', type: 'number', defaultValue: '4', description: 'Active bar count for SignalMeter.' },
      { name: 'pressed', type: 'boolean', description: 'Controlled toggle state for QuickSettingTile.' },
    ],
    keyboard: [{ key: 'Enter / Space', action: 'Toggles QuickSettingTile active state.' }],
    accessibilityNotes: 'Never communicates state by hue alone; every LED and tile includes explicit text labels.',
    related: ['rotary-knob', 'progress', 'dot-icon'],
  },
  {
    slug: 'stepper',
    moduleNumber: '49',
    title: 'Stepper',
    category: 'Data & Hardware',
    description:
      'Multi-stage hardware-inspired workflow stepper with completed, active Signal Red, and upcoming states.',
    keywords: ['stepper', 'steps', 'wizard', 'progress', 'hardware', 'exclusive'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'src/components/nothing/Feedback.tsx',
    features: ['Numbered monochrome + Signal Red active step nodes', 'Keyboard-accessible step switching'],
    props: [{ name: 'activeStep', type: 'number', defaultValue: '1', description: 'Zero-based index of the current stage.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Navigates and activates interactive step buttons.' }],
    accessibilityNotes: 'Marks the current step with aria-current="step".',
    related: ['progress', 'hardware-kit'],
  },
  {
    slug: 'brand-logo',
    moduleNumber: '50',
    title: 'Logo (Brand)',
    category: 'Navigation & Layout',
    description:
      'Original Nothing UI 3×3 monochrome + Signal Red dot-matrix emblem and Doto wordmark across sm, md, and lg scales.',
    keywords: ['logo', 'brand', 'wordmark', 'mark', 'identity'],
    web: 'stable',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@nothing-ui/tokens'],
    sourcePath: 'packages/ui/src/components/standard-extras.tsx',
    features: ['3×3 dot-matrix mark with single Signal Red top-right diode', 'Optional mark-only compact mode'],
    props: [
      { name: 'size', type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: 'Brand lockup scale.' },
      { name: 'showWordmark', type: 'boolean', defaultValue: 'true', description: 'Toggles the NOTHING UI Doto text lockup.' },
    ],
    keyboard: [{ key: 'N/A', action: 'Wrap in a link or home button for interactive navigation.' }],
    accessibilityNotes: 'Decorative matrix dots carry aria-hidden="true" so screen readers announce clean brand text.',
    related: ['dot-text', 'dot-icon'],
  },
  {
    slug: 'chat',
    moduleNumber: '51',
    title: 'Chat (Bubble, Message, Attachment)',
    category: 'Overlays & Feedback',
    description:
      'Family 8 messaging primitives: monochrome incoming/outgoing ChatBubble, timestamped Message layout, and inline file Attachment chips.',
    keywords: ['chat', 'bubble', 'message', 'attachment', 'conversation'],
    web: 'beta',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@phosphor-icons/react'],
    sourcePath: 'packages/ui/src/components/standard-extras.tsx',
    features: ['High-contrast inverse outgoing vs hairline incoming bubbles', 'Inline tabular timestamp and file attachment metadata'],
    props: [
      { name: 'role', type: '"incoming" | "outgoing"', description: 'Bubble alignment and contrast polarity.' },
      { name: 'attachment', type: '{ name: string; size: string }', description: 'Optional attached artifact descriptor.' },
    ],
    keyboard: [{ key: 'Tab', action: 'Moves through interactive attachment actions.' }],
    accessibilityNotes: 'Uses high-contrast ink tokens in Light, Dark OLED, and High-Contrast modes.',
    related: ['card', 'timeline'],
  },
  {
    slug: 'charts',
    moduleNumber: '52',
    title: 'Charts (Bar, Line, Area, Radial)',
    category: 'Data & Hardware',
    description:
      'Family 9 interactive, fully configurable SVG visualizations with floating hover tooltips, click-to-pin breakdowns, legend solo/toggle, brush zoom, live stream simulation, custom hex color pickers, and SVG/PNG/CSV export.',
    keywords: ['chart', 'bar-chart', 'line-chart', 'area-chart', 'radial-chart', 'interactive', 'telemetry'],
    web: 'stable',
    native: 'stable',
    webImport: 'nthgui',
    dependencies: ['nthgui'],
    sourcePath: 'packages/ui/src/components/charts/cartesian-charts.tsx',
    features: [
      'Floating hover tooltips with magnetic crosshairs and click-to-pin statistical breakdown',
      'Fully customizable color palettes plus per-series hex color pickers, curve, stroke, grid, and threshold settings',
      'Drag-to-zoom, playhead scrubber, live telemetry stream toggle, and 1-click SVG / 2× PNG / CSV export',
    ],
    props: [
      { name: 'mode', type: '"bar" | "line" | "radial"', defaultValue: '"bar"', description: 'Active visualization renderer.' },
      { name: 'palette', type: 'ChartPaletteId', defaultValue: '"monochrome"', description: 'Color palette preset or custom per-series hex colors.' },
      { name: 'curve', type: '"linear" | "smooth" | "step"', defaultValue: '"smooth"', description: 'Line and area interpolation mode.' },
      { name: 'stacked', type: 'boolean', defaultValue: 'false', description: 'Stacks multi-series bars when in bar mode.' },
      { name: 'strokeWidth', type: 'number', defaultValue: '2', description: 'Vector stroke width in pixels.' },
      { name: 'fillOpacity', type: 'number', defaultValue: '0.16', description: 'Area fill opacity (0 to 0.6).' },
      { name: 'showGrid', type: 'boolean', defaultValue: 'true', description: 'Toggles Cartesian reference gridlines.' },
      { name: 'showThreshold', type: 'boolean', defaultValue: 'false', description: 'Draws a configurable target threshold line.' },
      { name: 'defaultLive', type: 'boolean', defaultValue: 'false', description: 'Starts with live telemetry simulation active.' },
    ],
    keyboard: [
      { key: 'Tab / Enter', action: 'Focuses legend toggles, config panel controls, and export actions.' },
      { key: 'ArrowLeft / ArrowRight', action: 'Scrubs the playhead across datapoints.' },
    ],
    accessibilityNotes: 'Every chart exposes descriptive aria-label text, keyboard playhead scrubbing, and tabular numeric readouts.',
    related: ['timeseries', 'sparkline-strip', 'radar-chart'],
  },
  {
    slug: 'media-kit',
    moduleNumber: '53',
    title: 'Media (AudioPlayer & LocationCard)',
    category: 'Data & Hardware',
    description:
      'Family 10 media primitives: waveform-bar NothingAudioPlayer and WGS84 coordinate NothingLocationCard.',
    keywords: ['audio-player', 'location-card', 'media', 'waveform', 'gps'],
    web: 'beta',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@phosphor-icons/react'],
    sourcePath: 'packages/ui/src/components/standard-extras.tsx',
    features: ['Play/pause Signal Red transport control with stepped waveform bars', 'Coordinate & elevation LocationCard with Phosphor pin'],
    props: [
      { name: 'track', type: 'string', description: 'Audio track title.' },
      { name: 'coords', type: 'string', description: 'Formatted latitude/longitude readout.' },
    ],
    keyboard: [{ key: 'Enter / Space', action: 'Toggles AudioPlayer playback.' }],
    accessibilityNotes: 'Transport buttons provide explicit Play/Pause aria-labels.',
    related: ['hardware-kit', 'card'],
  },
  {
    slug: 'motion-kit',
    moduleNumber: '54',
    title: 'Motion (Fade, Slide, Scale, Stagger)',
    category: 'Navigation & Layout',
    description:
      'Family 11 calibrated micro-interaction presets (FadeIn, SlideIn, ScaleIn, Stagger, HoverEffects) honoring prefers-reduced-motion.',
    keywords: ['motion', 'fade-in', 'slide-in', 'scale-in', 'stagger', 'hover-effects'],
    web: 'beta',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['motion'],
    sourcePath: 'packages/ui/src/components/standard-extras.tsx',
    features: ['Calibrated 150–250ms industrial easing curves', 'Automatic instant fallback when reduced-motion is enabled'],
    props: [{ name: 'preset', type: '"fade" | "slide" | "scale" | "stagger"', defaultValue: '"fade"', description: 'Entrance transition preset.' }],
    keyboard: [{ key: 'Enter / Space', action: 'Replays the selected transition preset.' }],
    accessibilityNotes: 'Strictly respects prefers-reduced-motion media queries.',
    related: ['glyph-matrix', 'skeleton'],
  },
  {
    slug: 'productivity-kit',
    moduleNumber: '55',
    title: 'Productivity (Sortable & Onboarding)',
    category: 'Navigation & Layout',
    description:
      'Family 12 workflow primitives: keyboard-reorderable NothingSortableList and interactive NothingOnboardingChecklist.',
    keywords: ['sortable', 'onboarding', 'drag-drop', 'checklist', 'productivity'],
    web: 'beta',
    native: 'planned',
    webImport: '@nothing-ui/ui',
    dependencies: ['@phosphor-icons/react'],
    sourcePath: 'packages/ui/src/components/standard-extras.tsx',
    features: ['Accessible button-driven up/down list reordering without pointer-only lock-in', 'Interactive setup progress checklist'],
    props: [{ name: 'initialItems', type: 'string[]', description: 'Initial ordered items for SortableList.' }],
    keyboard: [{ key: 'Tab / Enter', action: 'Reorders items up/down or toggles onboarding completion.' }],
    accessibilityNotes: 'Every reorder control includes item-specific aria-label text.',
    related: ['accordion', 'stepper'],
  },
  // ── v0.2 Expanded 16 Components (Hardware Widgets, Advanced Forms, Data & Charts, Overlays & Productivity) ──
  {
    slug: 'dot-matrix-clock',
    moduleNumber: '56',
    title: 'Dot Matrix Clock',
    category: 'Data & Hardware',
    description:
      'Live ticking Nothing OS dot-matrix digital clock with blinking Signal Red seconds diode, 12h/24h toggle, and world timezone switcher.',
    keywords: ['clock', 'time', 'dot-matrix', 'hardware', 'widget', 'timezone'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Live 1-second hardware clock tick with tabular dot-matrix numerals',
      '12-hour and 24-hour format switcher with blinking Signal Red diode',
      'Multi-city timezone presets (UTC, London, Tokyo, San Francisco)',
    ],
    props: [
      { name: 'format', type: '"12h" | "24h"', defaultValue: '"24h"', description: 'Clock hour display format.' },
      { name: 'timezone', type: 'string', defaultValue: '"UTC"', description: 'IANA timezone identifier.' },
      { name: 'showSeconds', type: 'boolean', defaultValue: 'true', description: 'Renders live seconds counter and pulse diode.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Switches 12h/24h format and city timezone presets.' }],
    accessibilityNotes: 'Uses aria-live="off" on high-frequency ticks with an accessible time element readout.',
    related: ['glyph-matrix', 'weather-matrix', 'earbuds-battery'],
  },
  {
    slug: 'earbuds-battery',
    moduleNumber: '57',
    title: 'Earbuds & Battery Telemetry',
    category: 'Data & Hardware',
    description:
      'Ear (3) hardware status module displaying Left, Right, and Case battery rings, ANC mode selector, and live charging simulation.',
    keywords: ['earbuds', 'battery', 'audio', 'anc', 'hardware', 'widget', 'ear 3'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Three independent circular battery rings for Left, Right, and Case telemetry',
      'Interactive ANC / Transparency / Off acoustic mode selector',
      'Live USB-C fast-charge simulation toggle with tabular percentage readouts',
    ],
    props: [
      { name: 'left', type: 'number', defaultValue: '88', description: 'Left earbud battery percentage (0-100).' },
      { name: 'right', type: 'number', defaultValue: '84', description: 'Right earbud battery percentage (0-100).' },
      { name: 'caseLevel', type: 'number', defaultValue: '62', description: 'Charging case battery percentage (0-100).' },
      { name: 'ancMode', type: '"anc" | "transparency" | "off"', defaultValue: '"anc"', description: 'Active noise control profile.' },
    ],
    keyboard: [{ key: 'Tab / Space', action: 'Cycles acoustic modes and toggles charging state.' }],
    accessibilityNotes: 'Every battery gauge exposes role="meter" with min, max, and current percentage values.',
    related: ['dot-matrix-clock', 'quick-settings', 'hardware-kit'],
  },
  {
    slug: 'weather-matrix',
    moduleNumber: '58',
    title: 'Weather Matrix',
    category: 'Data & Hardware',
    description:
      'Monochrome Nothing OS weather widget pairing 9×9 dotted atmospheric icons with °C/°F unit conversion and 4-slot hourly forecast.',
    keywords: ['weather', 'forecast', 'dot-icon', 'temperature', 'hardware', 'widget'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Switchable atmospheric profiles (Clear, Rain, Storm, Fog) driven by 9×9 DotIcon',
      'Instant Celsius / Fahrenheit temperature conversion with tabular numerals',
      'Compact 4-interval monochrome hourly outlook strip',
    ],
    props: [
      { name: 'condition', type: '"clear" | "rain" | "storm" | "fog"', defaultValue: '"clear"', description: 'Atmospheric state rendered with dotted iconography.' },
      { name: 'unit', type: '"C" | "F"', defaultValue: '"C"', description: 'Temperature unit scale.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Switches weather condition presets and °C/°F units.' }],
    accessibilityNotes: 'Weather glyphs pair with explicit condition text so status is never conveyed by icon alone.',
    related: ['dot-icon', 'dot-matrix-clock', 'quick-settings'],
  },
  {
    slug: 'quick-settings',
    moduleNumber: '59',
    title: 'Quick Settings Deck',
    category: 'Data & Hardware',
    description:
      'Nothing OS 2×2 tactile hardware tile matrix for Wi-Fi, Bluetooth, Glyph Interface, and Do Not Disturb with Signal Red active feedback.',
    keywords: ['quick-settings', 'tiles', 'wifi', 'bluetooth', 'hardware', 'widget', 'toggle'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      '4 tactile hardware tiles with independent active/standby telemetry labels',
      'Instant summary status strip counting active radios and hardware channels',
      'Full aria-pressed toggle semantics and keyboard navigation',
    ],
    props: [
      { name: 'tiles', type: 'QuickSettingTileItem[]', description: 'Array of hardware toggle tiles with label, sublabel, and tone.' },
      { name: 'onToggle', type: '(id: string) => void', description: 'Callback fired when a tile is toggled.' },
    ],
    keyboard: [{ key: 'Tab / Space / Enter', action: 'Toggles the focused hardware quick-setting tile.' }],
    accessibilityNotes: 'Each tile is a native <button> with explicit aria-pressed state and high-contrast monochrome inversion.',
    related: ['switch', 'hardware-kit', 'earbuds-battery'],
  },
  {
    slug: 'combobox',
    moduleNumber: '60',
    title: 'Combobox',
    category: 'Inputs & Actions',
    description:
      'Searchable autocomplete combobox with instant keyboard arrow navigation, Enter selection, empty-state handling, and clear button.',
    keywords: ['combobox', 'autocomplete', 'search', 'select', 'dropdown', 'form'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Live client-side typeahead filtering across labeled hardware options',
      'Full ArrowUp / ArrowDown / Enter / Escape keyboard listbox contract',
      'One-click clear button and explicit zero-result empty state',
    ],
    props: [
      { name: 'options', type: '{ value: string; label: string; meta?: string }[]', description: 'Searchable list of selectable options.' },
      { name: 'value', type: 'string', description: 'Controlled selected value.' },
      { name: 'placeholder', type: 'string', defaultValue: '"Search option..."', description: 'Input placeholder text.' },
    ],
    keyboard: [
      { key: 'ArrowDown / ArrowUp', action: 'Moves active highlight through filtered results.' },
      { key: 'Enter', action: 'Selects the highlighted option and closes the listbox.' },
      { key: 'Escape', action: 'Closes the listbox and preserves focus.' },
    ],
    accessibilityNotes: 'Implements role="combobox", aria-expanded, aria-controls, and aria-activedescendant patterns.',
    related: ['select', 'tag-input', 'command'],
  },
  {
    slug: 'date-time-picker',
    moduleNumber: '61',
    title: 'Date & Time Picker',
    category: 'Inputs & Actions',
    description:
      'Combined monochrome calendar date picker and 24-hour hardware time slot selector with month navigation and formatted ISO readout.',
    keywords: ['date-picker', 'time-picker', 'calendar', 'schedule', 'form'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Month-by-month calendar grid with keyboard-accessible day selection',
      'Precision 24-hour time slot picker paired alongside the date grid',
      'Live formatted ISO timestamp summary with Signal Red active selection marker',
    ],
    props: [
      { name: 'value', type: 'Date', description: 'Selected date value.' },
      { name: 'timeSlot', type: 'string', defaultValue: '"09:30"', description: 'Selected 24-hour time slot.' },
      { name: 'onChange', type: '(date: Date, time: string) => void', description: 'Fires whenever date or time slot changes.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Navigates months, selects calendar days, and picks time slots.' }],
    accessibilityNotes: 'Selected date exposes aria-pressed and formatted full-date aria-label for screen readers.',
    related: ['calendar', 'input', 'combobox'],
  },
  {
    slug: 'tag-input',
    moduleNumber: '62',
    title: 'Tag Input',
    category: 'Inputs & Actions',
    description:
      'Tokenized multi-tag input supporting Enter or comma commits, Backspace deletion, duplicate prevention, and suggested quick-add chips.',
    keywords: ['tag-input', 'chips', 'tokens', 'multi-value', 'form', 'input'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Commit new tags via Enter or comma with automatic whitespace trimming and deduping',
      'Backspace on an empty input removes the trailing tag immediately',
      'Suggested quick-add options and per-tag accessible remove buttons',
    ],
    props: [
      { name: 'tags', type: 'string[]', description: 'Controlled list of active tags.' },
      { name: 'maxTags', type: 'number', defaultValue: '8', description: 'Maximum permitted tags.' },
      { name: 'onTagsChange', type: '(tags: string[]) => void', description: 'Called when tags are added or removed.' },
    ],
    keyboard: [
      { key: 'Enter / Comma', action: 'Commits the typed string as a new tag.' },
      { key: 'Backspace', action: 'Removes the last tag when the input field is empty.' },
    ],
    accessibilityNotes: 'Each tag delete button includes an explicit aria-label ("Remove <tag>").',
    related: ['input', 'combobox', 'select'],
  },
  {
    slug: 'sparkline-strip',
    moduleNumber: '63',
    title: 'Sparkline Telemetry Strip',
    category: 'Data & Hardware',
    description:
      'Synchronized multi-card SVG sparkline telemetry strip with shared magnetic hover crosshair, click-to-pin stats, timeframe switching, brush zoom, live streaming, custom color pickers, and SVG/PNG/CSV export.',
    keywords: ['sparkline', 'line-chart', 'area-chart', 'telemetry', 'metrics', 'charts', 'interactive'],
    web: 'stable',
    native: 'stable',
    webImport: 'nthgui',
    dependencies: ['nthgui'],
    sourcePath: 'packages/ui/src/components/charts/cartesian-charts.tsx',
    features: [
      'Synchronized magnetic hover crosshair across all KPI sparklines with floating tooltip readout',
      'Per-series custom color pickers, curve interpolation (smooth / linear / step), area fill, and marker controls',
      '24H / 7D / 30D timeframe selector, live streaming mode, playhead scrubber, and SVG/PNG/CSV export',
    ],
    props: [
      { name: 'palette', type: 'ChartPaletteId', defaultValue: '"monochrome"', description: 'Color preset or custom per-series hex palette.' },
      { name: 'curve', type: '"linear" | "smooth" | "step"', defaultValue: '"smooth"', description: 'Sparkline path interpolation.' },
      { name: 'strokeWidth', type: 'number', defaultValue: '2', description: 'Sparkline stroke width.' },
      { name: 'fillOpacity', type: 'number', defaultValue: '0.16', description: 'Area fill opacity under each sparkline.' },
      { name: 'dotSize', type: 'number', defaultValue: '3.5', description: 'Active marker dot radius.' },
      { name: 'showArea', type: 'boolean', defaultValue: 'true', description: 'Toggles subtle translucent area shading.' },
      { name: 'defaultLive', type: 'boolean', defaultValue: 'false', description: 'Enables live streaming updates on mount.' },
    ],
    keyboard: [{ key: 'Tab / ArrowLeft / ArrowRight', action: 'Switches timeframes, toggles series, and scrubs synchronized datapoints.' }],
    accessibilityNotes: 'Every sparkline SVG carries a descriptive aria-label alongside keyboard-navigable pinned stat summaries.',
    related: ['radar-chart', 'timeseries', 'charts'],
  },
  {
    slug: 'radar-chart',
    moduleNumber: '64',
    title: 'Radar & Bar Matrix Chart',
    category: 'Data & Hardware',
    description:
      'Interactive multi-series SVG radar polygon comparing hardware profiles simultaneously with hover tooltips, click-to-pin axis breakdown, legend solo/toggle, custom series colors, zoom scale, and SVG/PNG/CSV export.',
    keywords: ['radar-chart', 'polygon', 'charts', 'analytics', 'telemetry', 'svg', 'interactive'],
    web: 'stable',
    native: 'stable',
    webImport: 'nthgui',
    dependencies: ['nthgui'],
    sourcePath: 'packages/ui/src/components/charts/polar-charts.tsx',
    features: [
      'Simultaneous multi-series radar overlays (Phone (3), Ear (3), Watch Pro) with legend toggle and Solo isolate',
      'Hover any axis vertex for comparative floating tooltip and click to pin exact score deltas',
      'Configurable calibration rings, polygon fill opacity, vertex dot size, custom hex colors, and SVG/PNG/CSV export',
    ],
    props: [
      { name: 'palette', type: 'ChartPaletteId', defaultValue: '"monochrome"', description: 'Color palette preset or custom hex overrides.' },
      { name: 'rings', type: 'number', defaultValue: '4', description: 'Number of concentric calibration rings (2–6).' },
      { name: 'strokeWidth', type: 'number', defaultValue: '2', description: 'Polygon perimeter stroke width.' },
      { name: 'fillOpacity', type: 'number', defaultValue: '0.22', description: 'Translucent polygon fill opacity.' },
      { name: 'dotSize', type: 'number', defaultValue: '3.5', description: 'Axis vertex marker radius.' },
      { name: 'showLabels', type: 'boolean', defaultValue: 'true', description: 'Displays radial axis labels.' },
      { name: 'defaultLive', type: 'boolean', defaultValue: 'false', description: 'Streams live hardware telemetry fluctuations.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Toggles hardware profiles, pins axes, and opens chart configuration.' }],
    accessibilityNotes: 'Pairs the SVG radar chart with keyboard-accessible pinned axis score cards and tabular numerals.',
    related: ['sparkline-strip', 'charts', 'pie-chart'],
  },
  {
    slug: 'metric-grid',
    moduleNumber: '65',
    title: 'Hardware KPI Grid',
    category: 'Data & Hardware',
    description:
      'Structured 4-column telemetry stat strip with 1px hairline borders, tabular numerals, explicit semantic state text, and zero nested card clutter.',
    keywords: ['kpi', 'metrics', 'stats', 'telemetry', 'dashboard', 'grid'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Single-elevation 4-column metric layout following strict 1px hairline discipline',
      'Explicit Nominal / Warning / Critical text labels paired with semantic accents',
      'Live refresh simulation button demonstrating tabular-nums stability',
    ],
    props: [
      { name: 'items', type: 'MetricItem[]', description: 'Array of metric label, value, delta, and state entries.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Activates live sample refresh control.' }],
    accessibilityNotes: 'State is always signaled via explicit text labels alongside color.',
    related: ['metric-card', 'sparkline-strip', 'data-table'],
  },
  {
    slug: 'hover-card',
    moduleNumber: '66',
    title: 'Hover Card',
    category: 'Overlays & Feedback',
    description:
      'Pointer and keyboard-focus preview card revealing structured module metadata, version info, and quick specs without blocking workflow.',
    keywords: ['hover-card', 'preview', 'popover', 'overlay', 'tooltip'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Opens on hover or keyboard focus with clean Escape dismissal',
      'Click-to-pin toggle for touch devices and inspection testing',
      'Single-elevation surface with hairline border and crisp typographic hierarchy',
    ],
    props: [
      { name: 'trigger', type: 'ReactNode', description: 'Focusable inline link or button trigger.' },
      { name: 'content', type: 'ReactNode', description: 'Structured preview card content.' },
    ],
    keyboard: [
      { key: 'Tab / Focus', action: 'Reveals the hover card preview.' },
      { key: 'Escape', action: 'Dismisses the open preview card.' },
    ],
    accessibilityNotes: 'Works identically via keyboard focus and touch click so pointer-only users are never excluded.',
    related: ['popover', 'context-menu', 'dialog'],
  },
  {
    slug: 'context-menu',
    moduleNumber: '67',
    title: 'Context Menu',
    category: 'Overlays & Feedback',
    description:
      'Right-click and keyboard-triggered contextual action menu with grouped shortcuts, Signal Red destructive action, and live action log.',
    keywords: ['context-menu', 'right-click', 'menu', 'overlay', 'actions'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Opens on right-click (onContextMenu) anywhere in the target surface or via keyboard button',
      'Grouped actions with monospace keyboard shortcut hints and destructive Signal Red item',
      'Escape and outside-click dismissal with live selected action feedback',
    ],
    props: [
      { name: 'items', type: 'ContextMenuItem[]', description: 'Menu commands with label, shortcut, and destructive flag.' },
      { name: 'onSelect', type: '(id: string) => void', description: 'Called when a command is chosen.' },
    ],
    keyboard: [
      { key: 'Shift + F10 / Enter', action: 'Opens the context menu from the keyboard trigger.' },
      { key: 'Escape', action: 'Closes the context menu.' },
    ],
    accessibilityNotes: 'Exposes role="menu" and role="menuitem" with visible focus rings and non-pointer trigger parity.',
    related: ['dropdown-menu', 'hover-card', 'command'],
  },
  {
    slug: 'sortable-board',
    moduleNumber: '68',
    title: 'Sortable Board',
    category: 'Navigation & Layout',
    description:
      'Multi-column reorderable hardware task board supporting both drag-and-drop and accessible up/down + column-shift keyboard controls.',
    keywords: ['sortable', 'drag-drop', 'kanban', 'board', 'productivity', 'tasks'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'HTML5 drag-and-drop between Backlog, Active, and Shipped columns',
      'Full button & keyboard controls to reorder items or move cards across columns',
      'Add new task inline with immediate live column counter updates',
    ],
    props: [
      { name: 'columns', type: 'BoardColumn[]', description: 'Ordered columns containing sortable task cards.' },
      { name: 'onMove', type: '(taskId: string, toColumn: string) => void', description: 'Fires when a card changes column or index.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Moves focused cards up, down, or across workflow columns.' }],
    accessibilityNotes: 'Every drag action has an equivalent explicit button control with descriptive aria-labels.',
    related: ['productivity-kit', 'accordion', 'data-table'],
  },
  {
    slug: 'sidebar',
    moduleNumber: '69',
    title: 'Documentation Sidebar',
    category: 'Navigation & Layout',
    description:
      'Collapsible categorized navigation sidebar with live filter input, platform toggle, active-item indicator, and compact rail collapse mode.',
    keywords: ['sidebar', 'navigation', 'drawer', 'rail', 'layout', 'docs'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Collapsible category sections with tabular item counts and quick search filter',
      'Expanded and compact icon-rail toggle matching Nothing UI docs architecture',
      'Clear aria-current="page" active indicator with zero-pill typography',
    ],
    props: [
      { name: 'collapsed', type: 'boolean', defaultValue: 'false', description: 'Toggles compact rail mode.' },
      { name: 'activeId', type: 'string', description: 'Currently active navigation item.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Expands groups, selects items, and toggles rail width.' }],
    accessibilityNotes: 'Uses semantic <aside> and <nav aria-label="..."> landmarks with aria-expanded group triggers.',
    related: ['table-of-contents', 'breadcrumb', 'drawer'],
  },
  {
    slug: 'table-of-contents',
    moduleNumber: '70',
    title: 'Table of Contents',
    category: 'Navigation & Layout',
    description:
      'Sticky On-Page Table of Contents with Signal Red active rail indicator, nested heading indentation, and smooth section jumping.',
    keywords: ['table-of-contents', 'toc', 'scroll-spy', 'anchors', 'navigation', 'docs'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Live scroll-spy active section tracking with 2px Signal Red indicator bar',
      'Supports level-2 and nested level-3 heading hierarchy',
      'Keyboard-accessible anchor buttons with aria-current="location"',
    ],
    props: [
      { name: 'items', type: '{ id: string; label: string; level?: 2 | 3 }[]', description: 'Ordered page section anchors.' },
      { name: 'activeId', type: 'string', description: 'Currently visible section identifier.' },
    ],
    keyboard: [{ key: 'Tab / Enter', action: 'Jumps directly to the targeted section anchor.' }],
    accessibilityNotes: 'Marks the active item with aria-current="location" inside a labeled <nav> landmark.',
    related: ['sidebar', 'tabs', 'breadcrumb'],
  },
  {
    slug: 'toolbar',
    moduleNumber: '71',
    title: 'Action Toolbar',
    category: 'Inputs & Actions',
    description:
      'Compact horizontal formatting and hardware mode toolbar with toggle states, alignment groups, separator hairlines, and live canvas preview.',
    keywords: ['toolbar', 'actions', 'editor', 'formatting', 'toggle-group'],
    web: 'stable',
    native: 'planned',
    webImport: 'nothing-ui',
    dependencies: ['nothing-ui'],
    sourcePath: 'apps/ui/src/demos/expanded/v02-components.tsx',
    features: [
      'Grouped toggle buttons for typography weight, alignment, and dot-grid overlay',
      'Single-line controls with 1px vertical hairline separators',
      'Live preview surface reflecting active toolbar state immediately',
    ],
    props: [
      { name: 'orientation', type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: 'Toolbar layout axis.' },
    ],
    keyboard: [{ key: 'Tab / Space / Enter', action: 'Toggles active formatting and layout switches.' }],
    accessibilityNotes: 'Exposes role="toolbar" with aria-pressed states on every toggle control.',
    related: ['button', 'segmented-control', 'context-menu'],
  },
  ...COMPLETE_CATALOG_ENTRIES,
  ...WIDGETS_CATALOG_ENTRIES,
];

const STANDARD_LOADING_PROPS: CatalogEntry['props'] = [
  {
    name: 'loading',
    type: 'boolean',
    defaultValue: 'false',
    description: 'Enables accessible busy state (aria-busy / accessibilityState.busy) and renders the configured loader or skeleton.',
  },
  {
    name: 'loaderVariant',
    type: '"normal" | "dots" | "bars" | "pulse"',
    defaultValue: '"normal"',
    description: 'Overrides the loader visual style (defaults to clean normal spinner; configurable globally via LoadingConfigProvider).',
  },
  {
    name: 'loadingText',
    type: 'string',
    description: 'Optional status copy shown while loading is active.',
  },
];

export const CATALOG: ResolvedCatalogEntry[] = RAW_CATALOG.map((entry) => {
  const existingNames = new Set(entry.props.map((p) => p.name));
  const extraLoadingProps = STANDARD_LOADING_PROPS.filter((p) => !existingNames.has(p.name));
  if (entry.slug === 'button' && !existingNames.has('loadingPosition')) {
    extraLoadingProps.push({
      name: 'loadingPosition',
      type: '"start" | "end" | "replace"',
      defaultValue: '"start"',
      description: 'Places the loader before/after label or replaces content while preserving button width.',
    });
  }

  const classification = classifyCatalogEntry(entry.slug, entry.category);

  return {
    ...entry,
    kind: classification.kind,
    category: classification.category,
    widgetGroup: classification.widgetGroup,
    web: 'stable',
    native: 'stable',
    webImport:
      entry.slug === 'dot-icon'
        ? 'nthgui/icons'
        : entry.slug === 'glyph-matrix'
          ? 'nthgui/glyph'
          : 'nthgui',
    nativeImport: 'nthgui/native',
    dependencies: ['nthgui'],
    props: [...entry.props, ...extraLoadingProps],
  };
});

export function getCatalogEntry(slug: string): ResolvedCatalogEntry | undefined {
  return CATALOG.find((c) => c.slug === slug);
}

export function getComponentCatalog(): ResolvedCatalogEntry[] {
  return CATALOG.filter((entry) => entry.kind === 'component');
}

export function getChartsCatalog(): ResolvedCatalogEntry[] {
  return CATALOG.filter((entry) => entry.kind === 'component' && entry.category === 'Charts');
}

export function getWidgetCatalog(): ResolvedCatalogEntry[] {
  return CATALOG.filter((entry) => entry.kind === 'widget');
}

export function getGlyphCatalog(): ResolvedCatalogEntry[] {
  return CATALOG.filter((entry) => entry.kind === 'glyph');
}

export function filterCatalog(
  query: string,
  options?: {
    kind?: CatalogItemKind | 'all';
    category?: RegistryCategory | 'All';
    platform?: 'all' | 'web' | 'native';
    status?: 'all' | 'stable' | 'beta';
  }
): ResolvedCatalogEntry[] {
  const q = query.trim().toLowerCase();
  return CATALOG.filter((entry) => {
    if (options?.kind && options.kind !== 'all' && entry.kind !== options.kind) {
      return false;
    }
    if (options?.category && options.category !== 'All' && entry.category !== options.category) {
      return false;
    }
    if (options?.platform === 'native' && entry.native !== 'beta' && entry.native !== 'stable') {
      return false;
    }
    if (options?.status && options.status !== 'all') {
      if (entry.web !== options.status) return false;
    }
    if (!q) return true;
    return (
      entry.slug.includes(q) ||
      entry.title.toLowerCase().includes(q) ||
      entry.description.toLowerCase().includes(q) ||
      entry.category.toLowerCase().includes(q) ||
      (entry.widgetGroup?.toLowerCase().includes(q) ?? false) ||
      entry.keywords.some((k) => k.toLowerCase().includes(q)) ||
      (entry.uiSdkPrimitive?.toLowerCase().includes(q) ?? false)
    );
  });
}

export function getPublicImportPath(
  entry: CatalogEntry,
  platform: 'web' | 'native' = 'web',
): string {
  if (platform === 'native') {
    return 'nthgui/native';
  }
  if (entry.slug === 'dot-icon') {
    return 'nthgui/icons';
  }
  if (entry.slug === 'glyph-matrix') {
    return 'nthgui/glyph';
  }
  return 'nthgui';
}

export function buildInstallCommand(
  entry: CatalogEntry,
  pm: PackageManager,
  platform: 'web' | 'native' = 'web',
  mode: InstallMode = 'cli',
): string | null {
  if (platform === 'native') {
    if (entry.native === 'planned' || entry.native === 'unsupported') return null;
  } else {
    if (entry.web === 'planned' || entry.web === 'unsupported') return null;
  }

  if (mode === 'package') {
    return formatSinglePackageInstall(pm);
  }

  const nativeFlag = platform === 'native' ? ' --native' : '';
  return formatCliAdd(pm, `${entry.slug}${nativeFlag}`);
}

export function formatCliAdd(pm: PackageManager, target: string): string {
  switch (pm) {
    case 'bun':
      return `bunx --bun nthgui add ${target}`;
    case 'pnpm':
      return `pnpm dlx nthgui add ${target}`;
    case 'yarn':
      return `yarn dlx nthgui add ${target}`;
    default:
      return `npx nthgui add ${target}`;
  }
}

export function formatSinglePackageInstall(pm: PackageManager): string {
  switch (pm) {
    case 'bun':
      return 'bun add nthgui';
    case 'pnpm':
      return 'pnpm add nthgui';
    case 'yarn':
      return 'yarn add nthgui';
    default:
      return 'npm install nthgui';
  }
}

export function compileShadcnRegistryItem(entry: ResolvedCatalogEntry): ShadcnRegistryItem {
  return {
    $schema: 'https://ui.shadcn.com/schema/registry-item.json',
    name: entry.slug,
    type: 'registry:ui',
    title: entry.title,
    description: entry.description,
    dependencies: ['nthgui'],
    registryDependencies: [...(entry.registryDependencies ?? [])],
    files: [
      {
        path: entry.sourcePath,
        type: 'registry:ui',
        target: `src/components/nthgui/${entry.slug}.tsx`,
      },
      {
        path: 'packages/ui-native/src/components/native-catalog.ts',
        type: 'registry:ui',
        target: `components/nthgui-native/${entry.slug}.tsx`,
      },
    ],
    meta: {
      kind: entry.kind,
      webStatus: entry.web,
      nativeStatus: entry.native,
      category: entry.category,
    },
  };
}
