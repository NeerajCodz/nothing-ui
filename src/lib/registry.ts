export type ComponentCategory =
  | 'Inputs & Actions'
  | 'Navigation & Layout'
  | 'Overlays & Feedback'
  | 'Data & Hardware';

export type PackageManager = 'npm' | 'pnpm' | 'bun' | 'yarn';

export interface PropDoc {
  name: string;
  type: string;
  defaultValue: string;
  description: string;
}

export interface RegistryComponent {
  id: string;
  number: string;
  name: string;
  category: ComponentCategory;
  summary: string;
  uiSdkPrimitive: string | null;
  tags: string[];
  installDeps: string[];
  code: string;
  usageCode: string;
  props: PropDoc[];
}

export const COMPONENT_CATEGORIES: ComponentCategory[] = [
  'Inputs & Actions',
  'Navigation & Layout',
  'Overlays & Feedback',
  'Data & Hardware',
];

export const REGISTRY_COMPONENTS: RegistryComponent[] = [
  // ================= INPUTS & ACTIONS =================
  {
    id: 'button',
    number: '05',
    name: 'Button',
    category: 'Inputs & Actions',
    summary: 'High-contrast monochrome action buttons with Signal Red critical variant, outline, ghost, icon-circle, and square forms built on @ui-sdk/react/button.',
    uiSdkPrimitive: '@ui-sdk/react/button',
    tags: ['button', 'action', 'cta', 'icon', 'primary'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingButton } from "@/components/nothing/Button"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <NothingButton variant="primary">Deploy Release</NothingButton>
      <NothingButton variant="outline">View Logs</NothingButton>
      <NothingButton variant="signal">Emergency Stop</NothingButton>
      <NothingButton variant="ghost">Cancel</NothingButton>
    </div>
  )
}`,
    code: `import { Button } from "@ui-sdk/react/button"
import { cn } from "@/lib/utils"

export interface NothingButtonProps extends React.ComponentProps<typeof Button> {
  variant?: "primary" | "outline" | "ghost" | "signal"
  size?: "sm" | "md" | "lg" | "icon" | "square"
}

export function NothingButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: NothingButtonProps) {
  return (
    <Button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-mono text-xs tracking-wide transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--nt-accent)] disabled:opacity-35 disabled:pointer-events-none",
        variant === "primary" && "bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)] hover:opacity-85",
        variant === "outline" && "border border-[var(--nt-line-2)] text-[var(--nt-primary)] hover:border-[var(--nt-primary)]",
        variant === "ghost" && "text-[var(--nt-primary)] hover:bg-[var(--nt-raised)]",
        variant === "signal" && "bg-[#D71921] text-white hover:bg-[#b8141b]",
        size === "sm" && "h-8 px-3 rounded-md",
        size === "md" && "h-9 px-4 rounded-md",
        size === "lg" && "h-11 px-6 rounded-lg text-sm",
        size === "icon" && "h-9 w-9 rounded-full p-0",
        size === "square" && "h-9 w-9 rounded-md p-0",
        className
      )}
      {...props}
    />
  )
}`,
    props: [
      { name: 'variant', type: '"primary" | "outline" | "ghost" | "signal"', defaultValue: '"primary"', description: 'Visual contrast treatment adhering to Nothing monochrome + Signal Red rules.' },
      { name: 'size', type: '"sm" | "md" | "lg" | "icon" | "square"', defaultValue: '"md"', description: 'Control height, padding, and circular/square geometry.' },
      { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables pointer interaction and sets native disabled state.' },
    ],
  },
  {
    id: 'input',
    number: '06',
    name: 'Input & Textarea',
    category: 'Inputs & Actions',
    summary: 'Accessible text inputs, clearable input groups, validation states, and auto-resizing textareas powered by @ui-sdk/react/input, textarea, and field.',
    uiSdkPrimitive: '@ui-sdk/react/input',
    tags: ['input', 'textarea', 'field', 'form', 'search'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingInput, NothingTextarea } from "@/components/nothing/Input"

export function InputDemo() {
  return (
    <div className="space-y-4 max-w-md">
      <NothingInput label="Device Serial" placeholder="NT-P3-8824" clearable />
      <NothingTextarea label="Diagnostic Notes" placeholder="Describe acoustic or LED behavior..." />
    </div>
  )
}`,
    code: `import { Field, FieldDescription, FieldLabel } from "@ui-sdk/react/field"
import { Input, InputClear, InputGroup } from "@ui-sdk/react/input"
import { X } from "lucide-react"

export function NothingInput({ label, description, clearable, ...props }) {
  return (
    <Field className="flex flex-col gap-1.5">
      {label && <FieldLabel className="font-mono text-[11px] tracking-wider uppercase text-[var(--nt-secondary)]">{label}</FieldLabel>}
      <InputGroup className="relative flex items-center">
        <Input
          className="w-full h-10 rounded-md border border-[var(--nt-line-2)] bg-transparent px-3 font-mono text-xs text-[var(--nt-primary)] placeholder:text-[var(--nt-muted)] focus:border-[var(--nt-display)] focus:outline-none"
          {...props}
        />
        {clearable && (
          <InputClear aria-label="Clear input" className="absolute right-2.5 text-[var(--nt-muted)] hover:text-[var(--nt-primary)]">
            <X className="w-3.5 h-3.5" />
          </InputClear>
        )}
      </InputGroup>
      {description && <FieldDescription className="text-xs text-[var(--nt-muted)]">{description}</FieldDescription>}
    </Field>
  )
}`,
    props: [
      { name: 'label', type: 'string', defaultValue: 'undefined', description: 'Accessible label wired automatically via @ui-sdk/react/field.' },
      { name: 'clearable', type: 'boolean', defaultValue: 'false', description: 'Renders an InputClear button when text is present.' },
      { name: 'invalid', type: 'boolean', defaultValue: 'false', description: 'Applies Signal Red border and error messaging.' },
    ],
  },
  {
    id: 'copy-field',
    number: '46',
    name: 'Copy Field',
    category: 'Inputs & Actions',
    summary: 'Monospace command or API token bar with one-click clipboard copy and inline state confirmation.',
    uiSdkPrimitive: '@ui-sdk/react/button',
    tags: ['copy', 'clipboard', 'cli', 'command', 'code'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { CopyField } from "@/components/nothing/Input"

export function CopyFieldDemo() {
  return <CopyField value="npx nthgui add glyph-matrix" />
}`,
    code: `import { useState } from "react"
import { Button } from "@ui-sdk/react/button"

export function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard?.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-raised)] px-3 py-2">
      <code className="truncate font-mono text-xs text-[var(--nt-primary)]">{value}</code>
      <Button onClick={handleCopy} className="font-mono text-[11px] uppercase px-2.5 py-1 rounded bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]">
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}`,
    props: [
      { name: 'value', type: 'string', defaultValue: 'required', description: 'Monospace text string copied to the clipboard.' },
      { name: 'caption', type: 'string', defaultValue: 'undefined', description: 'Optional muted micro-caption displayed beneath the bar.' },
    ],
  },
  {
    id: 'otp-input',
    number: '43',
    name: 'Verification Code',
    category: 'Inputs & Actions',
    summary: 'Dot-matrix numeric verification code slots supporting paste, keyboard arrows, and auto-advance via @ui-sdk/react/otp-input.',
    uiSdkPrimitive: '@ui-sdk/react/otp-input',
    tags: ['otp', 'verification', 'code', 'pin', 'auth'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingOTPInput } from "@/components/nothing/Controls"

export function OTPDemo() {
  return <NothingOTPInput length={6} defaultValue="2048" />
}`,
    code: `import { OTPInput, OTPInputGroup, OTPInputSeparator, OTPInputSlot } from "@ui-sdk/react/otp-input"

export function NothingOTPInput({ length = 6, ...props }) {
  return (
    <OTPInput maxLength={length} className="flex items-center gap-2" {...props}>
      <OTPInputGroup className="flex items-center gap-2">
        {Array.from({ length: Math.min(3, length) }).map((_, i) => (
          <OTPInputSlot
            key={i}
            index={i}
            className="flex h-12 w-10 items-center justify-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] font-display text-xl text-[var(--nt-display)] data-active:border-[var(--nt-display)] data-active:ring-1 data-active:ring-[var(--nt-display)]"
          />
        ))}
      </OTPInputGroup>
      {length > 3 && (
        <>
          <OTPInputSeparator className="text-[var(--nt-muted)] font-mono">·</OTPInputSeparator>
          <OTPInputGroup className="flex items-center gap-2">
            {Array.from({ length: length - 3 }).map((_, idx) => (
              <OTPInputSlot
                key={idx + 3}
                index={idx + 3}
                className="flex h-12 w-10 items-center justify-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] font-display text-xl text-[var(--nt-display)] data-active:border-[var(--nt-display)] data-active:ring-1 data-active:ring-[var(--nt-display)]"
              />
            ))}
          </OTPInputGroup>
        </>
      )}
    </OTPInput>
  )
}`,
    props: [
      { name: 'length', type: 'number', defaultValue: '6', description: 'Total number of OTP digit slots.' },
      { name: 'defaultValue', type: 'string', defaultValue: '""', description: 'Initial code digits.' },
      { name: 'onValueChange', type: '(value: string) => void', defaultValue: 'undefined', description: 'Fires whenever digits change.' },
    ],
  },
  {
    id: 'checkbox-radio',
    number: '06B',
    name: 'Checkbox & Radio',
    category: 'Inputs & Actions',
    summary: 'Sharp monochrome checkboxes, checkbox groups, and radio groups powered by @ui-sdk/react/checkbox and @ui-sdk/react/radio.',
    uiSdkPrimitive: '@ui-sdk/react/checkbox',
    tags: ['checkbox', 'radio', 'selection', 'form'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingCheckbox, NothingRadioGroup } from "@/components/nothing/Controls"

export function SelectionDemo() {
  return (
    <div className="space-y-4">
      <NothingCheckbox defaultChecked label="Enable Glyph Sync" />
      <NothingRadioGroup
        defaultValue="essential"
        options={[
          { value: "essential", label: "Essential Alerts" },
          { value: "all", label: "All Notifications" },
          { value: "silent", label: "Silent Matrix" },
        ]}
      />
    </div>
  )
}`,
    code: `import { Checkbox, CheckboxIndicator } from "@ui-sdk/react/checkbox"
import { Radio, RadioGroup, RadioIndicator } from "@ui-sdk/react/radio"
import { Check } from "lucide-react"

export function NothingCheckbox({ label, ...props }) {
  return (
    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <Checkbox
        className="flex h-4.5 w-4.5 items-center justify-center rounded-[4px] border border-[var(--nt-line-2)] bg-transparent transition-colors data-checked:border-[var(--nt-inverse-bg)] data-checked:bg-[var(--nt-inverse-bg)] text-[var(--nt-inverse-fg)]"
        {...props}
      >
        <CheckboxIndicator>
          <Check className="h-3 w-3 stroke-[3]" />
        </CheckboxIndicator>
      </Checkbox>
      <span className="font-mono text-xs text-[var(--nt-primary)]">{label}</span>
    </label>
  )
}`,
    props: [
      { name: 'checked / defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Controlled or uncontrolled checked state.' },
      { name: 'options', type: '{ value: string; label: string }[]', defaultValue: '[]', description: 'Radio options array for NothingRadioGroup.' },
    ],
  },
  {
    id: 'switch',
    number: '11',
    name: 'Switch',
    category: 'Inputs & Actions',
    summary: 'Mechanical hardware-inspired toggle switch with monochrome default and Signal Red critical accent built on @ui-sdk/react/switch.',
    uiSdkPrimitive: '@ui-sdk/react/switch',
    tags: ['switch', 'toggle', 'hardware', 'boolean'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingSwitch } from "@/components/nothing/Controls"

export function SwitchDemo() {
  return (
    <div className="space-y-3">
      <NothingSwitch defaultChecked label="Glyph Interface" />
      <NothingSwitch defaultChecked tone="signal" label="Record Audio" />
      <NothingSwitch label="Flip to Glyph" />
    </div>
  )
}`,
    code: `import { Switch, SwitchThumb } from "@ui-sdk/react/switch"

export function NothingSwitch({ label, tone = "default", ...props }) {
  return (
    <label className="inline-flex items-center justify-between gap-4 cursor-pointer select-none">
      {label && <span className="font-mono text-xs text-[var(--nt-primary)]">{label}</span>}
      <Switch
        className={\`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-0.5 transition-colors duration-150 \${
          tone === "signal" ? "data-checked:bg-[#D71921] data-checked:border-[#D71921]" : "data-checked:bg-[var(--nt-inverse-bg)] data-checked:border-[var(--nt-inverse-bg)]"
        }\`}
        {...props}
      >
        <SwitchThumb className="h-4.5 w-4.5 rounded-full bg-[var(--nt-secondary)] transition-transform duration-150 data-checked:translate-x-5 data-checked:bg-[var(--nt-inverse-fg)]" />
      </Switch>
    </label>
  )
}`,
    props: [
      { name: 'tone', type: '"default" | "signal"', defaultValue: '"default"', description: 'Use "signal" exclusively for high-attention toggles such as recording or alerts.' },
      { name: 'checked / defaultChecked', type: 'boolean', defaultValue: 'false', description: 'Toggle state controlled by @ui-sdk/react/switch.' },
    ],
  },
  {
    id: 'slider',
    number: '08',
    name: 'Slider',
    category: 'Inputs & Actions',
    summary: 'Precision linear slider with live tabular value readout and optional Signal Red fill built on @ui-sdk/react/slider.',
    uiSdkPrimitive: '@ui-sdk/react/slider',
    tags: ['slider', 'range', 'volume', 'brightness'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingSlider } from "@/components/nothing/Controls"

export function SliderDemo() {
  return <NothingSlider label="Glyph Brightness" defaultValue={68} unit="%" />
}`,
    code: `import { Slider, SliderControl, SliderIndicator, SliderThumb, SliderTrack, SliderValue } from "@ui-sdk/react/slider"

export function NothingSlider({ label, unit = "", ...props }) {
  return (
    <Slider className="flex w-full flex-col gap-2" {...props}>
      <div className="flex items-center justify-between font-mono text-xs">
        <span className="text-[var(--nt-secondary)] uppercase tracking-wider">{label}</span>
        <span className="tabular-nums text-[var(--nt-display)]"><SliderValue />{unit}</span>
      </div>
      <SliderControl className="relative flex h-6 w-full touch-none items-center">
        <SliderTrack className="relative h-1.5 w-full rounded-full bg-[var(--nt-line-2)]">
          <SliderIndicator className="h-full rounded-full bg-[var(--nt-display)]" />
          <SliderThumb aria-label={label} className="h-4 w-4 rounded-full border-2 border-[var(--nt-display)] bg-[var(--nt-bg)] shadow-sm transition-transform hover:scale-110" />
        </SliderTrack>
      </SliderControl>
    </Slider>
  )
}`,
    props: [
      { name: 'defaultValue', type: 'number', defaultValue: '50', description: 'Starting slider value.' },
      { name: 'min / max / step', type: 'number', defaultValue: '0 / 100 / 1', description: 'Numeric bounds and increment step.' },
      { name: 'tone', type: '"default" | "signal"', defaultValue: '"default"', description: 'Track fill accent tone.' },
    ],
  },
  {
    id: 'select',
    number: '22B',
    name: 'Select',
    category: 'Inputs & Actions',
    summary: 'Accessible keyboard-navigable dropdown select with check indicator and frosted popover panel powered by @ui-sdk/react/select.',
    uiSdkPrimitive: '@ui-sdk/react/select',
    tags: ['select', 'dropdown', 'combobox', 'picker'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingSelect } from "@/components/nothing/Navigation"

export function SelectDemo() {
  return (
    <NothingSelect
      label="Audio Profile"
      defaultValue="balanced"
      options={[
        { value: "balanced", label: "Balanced Studio" },
        { value: "bass", label: "Ultra Bass" },
        { value: "voice", label: "Voice Clarity" },
        { value: "custom", label: "Custom EQ" },
      ]}
    />
  )
}`,
    code: `import { Select, SelectContent, SelectItem, SelectItemIndicator, SelectItemText, SelectLabel, SelectTrigger, SelectValue } from "@ui-sdk/react/select"
import { Check, ChevronDown } from "lucide-react"

export function NothingSelect({ label, options, defaultValue, placeholder = "Select option" }) {
  return (
    <Select defaultValue={defaultValue} placeholder={placeholder} className="flex flex-col gap-1.5">
      {label && <SelectLabel className="font-mono text-[11px] uppercase tracking-wider text-[var(--nt-secondary)]">{label}</SelectLabel>}
      <SelectTrigger className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] px-3 font-mono text-xs text-[var(--nt-primary)]">
        <SelectValue />
        <ChevronDown className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
      </SelectTrigger>
      <SelectContent className="z-50 min-w-[var(--anchor-width)] rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1 shadow-xl">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[var(--nt-primary)] cursor-pointer data-highlighted:bg-[var(--nt-raised)]">
            <SelectItemText>{opt.label}</SelectItemText>
            <SelectItemIndicator><Check className="h-3.5 w-3.5 text-[#D71921]" /></SelectItemIndicator>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}`,
    props: [
      { name: 'options', type: '{ value: string; label: string }[]', defaultValue: '[]', description: 'Selectable items rendered in the anchored listbox.' },
      { name: 'defaultValue', type: 'string', defaultValue: 'undefined', description: 'Initially selected option value.' },
    ],
  },
  {
    id: 'number-input',
    number: '34B',
    name: 'Number Stepper',
    category: 'Inputs & Actions',
    summary: 'Tactile quantity and numeric stepper with horizontal scrub area built on @ui-sdk/react/number-input.',
    uiSdkPrimitive: '@ui-sdk/react/number-input',
    tags: ['number', 'stepper', 'quantity', 'counter'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingNumberInput } from "@/components/nothing/Controls"

export function NumberInputDemo() {
  return <NothingNumberInput label="Glyph Pulse Count" defaultValue={3} min={1} max={12} />
}`,
    code: `import { NumberInput, NumberInputControl, NumberInputDecrement, NumberInputGroup, NumberInputIncrement } from "@ui-sdk/react/number-input"
import { Minus, Plus } from "lucide-react"

export function NothingNumberInput({ label, defaultValue = 1, min = 0, max = 99 }) {
  return (
    <NumberInput defaultValue={defaultValue} min={min} max={max} className="inline-flex flex-col gap-1.5">
      {label && <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--nt-secondary)]">{label}</span>}
      <NumberInputGroup className="inline-flex items-center rounded-md border border-[var(--nt-line-2)] bg-[var(--nt-surface)] overflow-hidden">
        <NumberInputDecrement aria-label="Decrease" className="flex h-9 w-9 items-center justify-center text-[var(--nt-primary)] hover:bg-[var(--nt-raised)]">
          <Minus className="h-3.5 w-3.5" />
        </NumberInputDecrement>
        <NumberInputControl className="w-12 bg-transparent text-center font-mono text-xs tabular-nums text-[var(--nt-display)] focus:outline-none" />
        <NumberInputIncrement aria-label="Increase" className="flex h-9 w-9 items-center justify-center text-[var(--nt-primary)] hover:bg-[var(--nt-raised)]">
          <Plus className="h-3.5 w-3.5" />
        </NumberInputIncrement>
      </NumberInputGroup>
    </NumberInput>
  )
}`,
    props: [
      { name: 'min / max', type: 'number', defaultValue: '0 / 99', description: 'Numeric lower and upper limits.' },
      { name: 'step', type: 'number', defaultValue: '1', description: 'Increment per button press or arrow key.' },
    ],
  },
  {
    id: 'rating',
    number: '34',
    name: 'Rating',
    category: 'Inputs & Actions',
    summary: 'Accessible dot-matrix score picker with hover preview and keyboard arrow control built on @ui-sdk/react/rating.',
    uiSdkPrimitive: '@ui-sdk/react/rating',
    tags: ['rating', 'stars', 'score', 'review'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingRating } from "@/components/nothing/Controls"

export function RatingDemo() {
  return <NothingRating defaultValue={4} max={5} />
}`,
    code: `import { Rating, RatingItem } from "@ui-sdk/react/rating"

export function NothingRating({ defaultValue = 3, max = 5 }) {
  return (
    <Rating aria-label="Rating" defaultValue={defaultValue} max={max} className="inline-flex items-center gap-2">
      <RatingItem className="h-5 w-5 rounded-full border border-[var(--nt-line-2)] bg-transparent transition-all cursor-pointer data-filled:border-[#D71921] data-filled:bg-[#D71921] data-highlighted:scale-110" />
    </Rating>
  )
}`,
    props: [
      { name: 'defaultValue', type: 'number', defaultValue: '3', description: 'Initial score value.' },
      { name: 'max', type: 'number', defaultValue: '5', description: 'Total selectable items.' },
    ],
  },
  {
    id: 'file-dropzone',
    number: '35',
    name: 'Dropzone',
    category: 'Inputs & Actions',
    summary: 'Drag-and-drop file uploader with dot-icon cue, clipboard paste support, and removable file list powered by @ui-sdk/react/file-input.',
    uiSdkPrimitive: '@ui-sdk/react/file-input',
    tags: ['dropzone', 'upload', 'file', 'attachment'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingDropzone } from "@/components/nothing/DataDisplay"

export function DropzoneDemo() {
  return <NothingDropzone />
}`,
    code: `import { FileInput, FileInputDropzone, FileInputItem, FileInputItemRemove, FileInputList, FileInputTrigger, formatFileSize } from "@ui-sdk/react/file-input"
import { DotIcon } from "@/components/nothing/DotIcon"
import { X } from "lucide-react"

export function NothingDropzone() {
  return (
    <FileInput multiple className="space-y-3">
      <FileInputDropzone className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--nt-line-2)] bg-[var(--nt-raised)]/40 p-8 text-center transition-colors data-dragging:border-[#D71921] data-dragging:bg-[#D71921]/5">
        <DotIcon name="download" size={28} />
        <p className="font-mono text-xs text-[var(--nt-primary)]">Drop files or browse firmware packages</p>
        <FileInputTrigger className="rounded-md border border-[var(--nt-line-2)] px-3 py-1.5 font-mono text-[11px] text-[var(--nt-primary)] hover:border-[var(--nt-display)]">
          Select Files
        </FileInputTrigger>
      </FileInputDropzone>
      <FileInputList aria-label="Selected files" className="space-y-1.5">
        <FileInputItem className="flex items-center justify-between rounded-md border border-[var(--nt-line)] px-3 py-2 font-mono text-xs">
          {({ file }) => (
            <>
              <span className="truncate">{file.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-[var(--nt-muted)] tabular-nums">{formatFileSize(file.size)}</span>
                <FileInputItemRemove aria-label={\`Remove \${file.name}\`}><X className="h-3.5 w-3.5" /></FileInputItemRemove>
              </div>
            </>
          )}
        </FileInputItem>
      </FileInputList>
    </FileInput>
  )
}`,
    props: [
      { name: 'multiple', type: 'boolean', defaultValue: 'true', description: 'Allows queuing multiple files simultaneously.' },
      { name: 'accept', type: 'string', defaultValue: 'undefined', description: 'MIME type or extension filter string.' },
    ],
  },
  {
    id: 'rotary-knob',
    number: '41',
    name: 'Rotary Knob',
    category: 'Inputs & Actions',
    summary: 'Hardware-inspired tactile rotary encoder with vertical drag, keyboard arrows, and 270-degree LED dot ring.',
    uiSdkPrimitive: null,
    tags: ['knob', 'rotary', 'dial', 'audio', 'gain', 'hardware'],
    installDeps: [],
    usageCode: `import { RotaryKnob } from "@/components/nothing/Controls"

export function RotaryDemo() {
  return <RotaryKnob label="GAIN" defaultValue={50} min={0} max={100} />
}`,
    code: `import { useState } from "react"
import { applyDragDelta, clampRotaryValue, valueToKnobAngle } from "@/lib/rotary"

export function RotaryKnob({ label = "GAIN", defaultValue = 50, min = 0, max = 100 }) {
  const [value, setValue] = useState(defaultValue)
  const angle = valueToKnobAngle(value, min, max)
  // Supports pointer drag + ArrowUp/ArrowDown keyboard control
  return (
    <div className="inline-flex flex-col items-center gap-2">
      <button
        type="button"
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="relative h-24 w-24 rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] flex items-center justify-center cursor-ns-resize"
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") setValue((v) => clampRotaryValue(v + 5, min, max))
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") setValue((v) => clampRotaryValue(v - 5, min, max))
        }}
      >
        <span className="font-display text-2xl tabular-nums text-[var(--nt-display)]">{value}</span>
        <span
          className="absolute inset-2 rounded-full pointer-events-none"
          style={{ transform: \`rotate(\${angle}deg)\` }}
        >
          <span className="block mx-auto h-2 w-2 rounded-full bg-[#D71921]" />
        </span>
      </button>
      <span className="font-mono text-[10px] tracking-[0.16em] text-[var(--nt-muted)]">{label}</span>
    </div>
  )
}`,
    props: [
      { name: 'label', type: 'string', defaultValue: '"GAIN"', description: 'Hardware channel caption beneath the dial.' },
      { name: 'min / max', type: 'number', defaultValue: '0 / 100', description: 'Swept numeric range mapped across 270 degrees.' },
    ],
  },

  // ================= NAVIGATION & LAYOUT =================
  {
    id: 'tabs',
    number: '38',
    name: 'Tabs',
    category: 'Navigation & Layout',
    summary: 'Underline and segmented-pill tab bars with keyboard arrow navigation and live sliding indicator powered by @ui-sdk/react/tabs.',
    uiSdkPrimitive: '@ui-sdk/react/tabs',
    tags: ['tabs', 'navigation', 'panels', 'switcher'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingTabs } from "@/components/nothing/Navigation"

export function TabsDemo() {
  return (
    <NothingTabs
      defaultValue="overview"
      items={[
        { value: "overview", label: "Overview", content: "Core telemetry and hardware specifications." },
        { value: "logs", label: "Logs", content: "14 recent build artifacts verified cleanly." },
        { value: "files", label: "Files", content: "tokens.css, nothing-ui.tsx, glyph-matrix.ts" },
      ]}
    />
  )
}`,
    code: `import { Tabs, TabsList, TabsPanel, TabsTab } from "@ui-sdk/react/tabs"

export function NothingTabs({ items, defaultValue, variant = "underline" }) {
  return (
    <Tabs defaultValue={defaultValue ?? items[0]?.value} className="w-full">
      <TabsList className={variant === "pill" ? "inline-flex gap-1 rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1" : "flex gap-5 border-b border-[var(--nt-line)]"}>
        {items.map((item) => (
          <TabsTab
            key={item.value}
            value={item.value}
            className={variant === "pill"
              ? "rounded-full px-3.5 py-1.5 font-mono text-xs text-[var(--nt-secondary)] transition-colors data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]"
              : "pb-2.5 font-mono text-xs text-[var(--nt-secondary)] border-b-2 border-transparent transition-colors data-selected:border-[var(--nt-display)] data-selected:text-[var(--nt-display)]"}
          >
            {item.label}
          </TabsTab>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsPanel key={item.value} value={item.value} className="pt-4 text-sm text-[var(--nt-secondary)]">
          {item.content}
        </TabsPanel>
      ))}
    </Tabs>
  )
}`,
    props: [
      { name: 'variant', type: '"underline" | "pill"', defaultValue: '"underline"', description: 'Switches between editorial hairline underline and pill track styles.' },
      { name: 'items', type: '{ value: string; label: string; content: ReactNode }[]', defaultValue: '[]', description: 'Tab triggers and associated panels.' },
    ],
  },
  {
    id: 'segmented-control',
    number: '30',
    name: 'Segmented & Toggle Group',
    category: 'Navigation & Layout',
    summary: 'Single-choice segmented switcher and multi-toggle formatting button group built on @ui-sdk/react/segmented-control and @ui-sdk/react/toggle.',
    uiSdkPrimitive: '@ui-sdk/react/segmented-control',
    tags: ['segmented', 'toggle', 'group', 'switcher'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingSegmentedControl, NothingToggleGroup } from "@/components/nothing/Controls"

export function SegmentedDemo() {
  return (
    <div className="space-y-4">
      <NothingSegmentedControl defaultValue="week" options={[
        { value: "day", label: "Day" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
      ]} />
      <NothingToggleGroup />
    </div>
  )
}`,
    code: `import { SegmentedControl, SegmentedControlItem } from "@ui-sdk/react/segmented-control"

export function NothingSegmentedControl({ options, defaultValue, onValueChange }) {
  return (
    <SegmentedControl
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      className="inline-flex items-center gap-1 rounded-lg border border-[var(--nt-line-2)] bg-[var(--nt-raised)] p-1"
    >
      {options.map((opt) => (
        <SegmentedControlItem
          key={opt.value}
          value={opt.value}
          className="rounded-md px-3 py-1.5 font-mono text-xs text-[var(--nt-secondary)] transition-colors cursor-pointer data-checked:bg-[var(--nt-inverse-bg)] data-checked:text-[var(--nt-inverse-fg)]"
        >
          {opt.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}`,
    props: [
      { name: 'options', type: '{ value: string; label: string }[]', defaultValue: '[]', description: 'Mutually exclusive segments.' },
      { name: 'defaultValue', type: 'string', defaultValue: 'undefined', description: 'Initially checked segment value.' },
    ],
  },
  {
    id: 'accordion',
    number: '23',
    name: 'Accordion & Collapsible',
    category: 'Navigation & Layout',
    summary: 'Hairline-divided disclosure rows with crisp rotational + indicators built on @ui-sdk/react/accordion and @ui-sdk/react/collapsible.',
    uiSdkPrimitive: '@ui-sdk/react/accordion',
    tags: ['accordion', 'collapsible', 'faq', 'disclosure'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingAccordion } from "@/components/nothing/Navigation"

export function AccordionDemo() {
  return <NothingAccordion />
}`,
    code: `import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, AccordionTrigger } from "@ui-sdk/react/accordion"
import { Plus } from "lucide-react"

export function NothingAccordion({ items }) {
  return (
    <Accordion defaultValue={[items[0]?.value]} className="divide-y divide-[var(--nt-line)] border-y border-[var(--nt-line)]">
      {items.map((item) => (
        <AccordionItem key={item.value} value={item.value}>
          <AccordionHeader>
            <AccordionTrigger className="flex w-full items-center justify-between py-3.5 text-left font-mono text-xs text-[var(--nt-primary)] hover:text-[var(--nt-display)] group">
              <span>{item.title}</span>
              <Plus className="h-3.5 w-3.5 text-[var(--nt-muted)] transition-transform duration-200 group-data-open:rotate-45 group-data-open:text-[#D71921]" />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionPanel className="pb-4 text-sm leading-relaxed text-[var(--nt-secondary)]">
            {item.content}
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  )
}`,
    props: [
      { name: 'items', type: '{ value: string; title: string; content: string }[]', defaultValue: '[]', description: 'Expandable accordion items.' },
      { name: 'multiple', type: 'boolean', defaultValue: 'false', description: 'Allows multiple panels open simultaneously.' },
    ],
  },
  {
    id: 'breadcrumb',
    number: '24',
    name: 'Breadcrumb & Separator',
    category: 'Navigation & Layout',
    summary: 'Clean slash-separated navigation breadcrumbs paired with labeled hairline dividers from @ui-sdk/react/separator.',
    uiSdkPrimitive: '@ui-sdk/react/separator',
    tags: ['breadcrumb', 'separator', 'divider', 'navigation'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingBreadcrumb, NothingSeparator } from "@/components/nothing/Feedback"

export function BreadcrumbDemo() {
  return (
    <div className="space-y-5">
      <NothingBreadcrumb items={["Home", "Components", "Navigation", "Breadcrumb"]} />
      <NothingSeparator label="Section" />
    </div>
  )
}`,
    code: `import { Separator } from "@ui-sdk/react/separator"

export function NothingSeparator({ label }: { label?: string }) {
  if (!label) return <Separator className="h-px w-full bg-[var(--nt-line)]" />
  return (
    <div className="flex items-center gap-3">
      <Separator className="h-px flex-1 bg-[var(--nt-line)]" />
      <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">{label}</span>
      <Separator className="h-px flex-1 bg-[var(--nt-line)]" />
    </div>
  )
}`,
    props: [
      { name: 'items', type: 'string[]', defaultValue: '[]', description: 'Path segments rendered with slash separators.' },
      { name: 'label', type: 'string', defaultValue: 'undefined', description: 'Optional centered label inside the hairline separator.' },
    ],
  },
  {
    id: 'pagination',
    number: '09',
    name: 'Pagination',
    category: 'Navigation & Layout',
    summary: 'Accessible page navigation with smart ellipsis ranges and keyboard focus powered by @ui-sdk/react/pagination.',
    uiSdkPrimitive: '@ui-sdk/react/pagination',
    tags: ['pagination', 'pages', 'navigation'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingPagination } from "@/components/nothing/Navigation"

export function PaginationDemo() {
  return <NothingPagination pageCount={10} defaultPage={2} />
}`,
    code: `import { Pagination, PaginationEllipsis, PaginationItem, PaginationLink, PaginationList, PaginationNext, PaginationPrevious } from "@ui-sdk/react/pagination"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function NothingPagination({ pageCount = 10, defaultPage = 1 }) {
  return (
    <Pagination aria-label="Pagination" pageCount={pageCount} defaultPage={defaultPage}>
      <PaginationList className="flex items-center gap-1">
        {({ items }) => (
          <>
            <PaginationItem>
              <PaginationPrevious aria-label="Previous page" className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line-2)] text-[var(--nt-primary)] hover:border-[var(--nt-display)] disabled:opacity-35">
                <ChevronLeft className="h-3.5 w-3.5" />
              </PaginationPrevious>
            </PaginationItem>
            {items.map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink page={item} className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 font-mono text-xs tabular-nums text-[var(--nt-secondary)] hover:bg-[var(--nt-raised)] data-current:bg-[var(--nt-inverse-bg)] data-current:text-[var(--nt-inverse-fg)]" />
                ) : (
                  <PaginationEllipsis className="px-1.5 font-mono text-xs text-[var(--nt-muted)]">…</PaginationEllipsis>
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext aria-label="Next page" className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line-2)] text-[var(--nt-primary)] hover:border-[var(--nt-display)] disabled:opacity-35">
                <ChevronRight className="h-3.5 w-3.5" />
              </PaginationNext>
            </PaginationItem>
          </>
        )}
      </PaginationList>
    </Pagination>
  )
}`,
    props: [
      { name: 'pageCount', type: 'number', defaultValue: '10', description: 'Total number of pages.' },
      { name: 'defaultPage', type: 'number', defaultValue: '1', description: 'Starting active page.' },
    ],
  },
  {
    id: 'command-palette',
    number: '27',
    name: 'Command Palette',
    category: 'Navigation & Layout',
    summary: 'Live filterable command launcher with grouped actions, keyboard shortcuts, and empty states powered by @ui-sdk/react/command.',
    uiSdkPrimitive: '@ui-sdk/react/command',
    tags: ['command', 'palette', 'search', 'cmdk', 'shortcuts'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingCommandInline } from "@/components/nothing/Navigation"

export function CommandDemo() {
  return <NothingCommandInline />
}`,
    code: `import { Command, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandList, CommandShortcut } from "@ui-sdk/react/command"

export function NothingCommandInline() {
  return (
    <Command className="w-full max-w-md rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] overflow-hidden">
      <div className="flex items-center border-b border-[var(--nt-line)] px-3">
        <CommandInput placeholder="Type a command or search..." className="h-10 w-full bg-transparent font-mono text-xs text-[var(--nt-primary)] focus:outline-none" />
      </div>
      <CommandList className="max-h-56 overflow-y-auto p-1.5">
        <CommandEmpty className="py-6 text-center font-mono text-xs text-[var(--nt-muted)]">No matching commands.</CommandEmpty>
        <CommandGroup>
          <CommandGroupLabel className="px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--nt-muted)]">Actions</CommandGroupLabel>
          <CommandItem value="glyph" className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs data-highlighted:bg-[var(--nt-raised)]">
            <span>Test Glyph Pattern</span>
            <CommandShortcut keys="mod+g" className="text-[10px] text-[var(--nt-muted)]" />
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}`,
    props: [
      { name: 'onSelect', type: '(value: string) => void', defaultValue: 'undefined', description: 'Callback triggered when a command item is chosen.' },
    ],
  },
  {
    id: 'dropdown-menu',
    number: '22',
    name: 'Dropdown Menu',
    category: 'Navigation & Layout',
    summary: 'Anchored action menus with section labels, keyboard shortcuts, separators, and Signal Red destructive actions built on @ui-sdk/react/menu.',
    uiSdkPrimitive: '@ui-sdk/react/menu',
    tags: ['menu', 'dropdown', 'context', 'actions'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingDropdownMenu } from "@/components/nothing/Navigation"

export function MenuDemo() {
  return <NothingDropdownMenu />
}`,
    code: `import { Menu, MenuContent, MenuGroup, MenuGroupLabel, MenuItem, MenuSeparator, MenuShortcut, MenuTrigger } from "@ui-sdk/react/menu"

export function NothingDropdownMenu() {
  return (
    <Menu>
      <MenuTrigger className="inline-flex h-9 items-center gap-2 rounded-md border border-[var(--nt-line-2)] px-3.5 font-mono text-xs text-[var(--nt-primary)] hover:border-[var(--nt-display)]">
        Account Menu
      </MenuTrigger>
      <MenuContent className="z-50 min-w-52 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-1.5 shadow-xl">
        <MenuGroup>
          <MenuGroupLabel className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--nt-muted)]">Account</MenuGroupLabel>
          <MenuItem value="profile" className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs cursor-pointer data-highlighted:bg-[var(--nt-raised)]">
            <span>Profile</span>
            <MenuShortcut keys="mod+p" className="text-[10px] text-[var(--nt-muted)]" />
          </MenuItem>
          <MenuItem value="settings" className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs cursor-pointer data-highlighted:bg-[var(--nt-raised)]">
            <span>Settings</span>
            <MenuShortcut keys="mod+," className="text-[10px] text-[var(--nt-muted)]" />
          </MenuItem>
        </MenuGroup>
        <MenuSeparator className="my-1 h-px bg-[var(--nt-line)]" />
        <MenuItem value="signout" className="flex items-center justify-between rounded-md px-2.5 py-2 font-mono text-xs text-[#D71921] cursor-pointer data-highlighted:bg-[#D71921]/10">
          <span>Sign Out</span>
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}`,
    props: [
      { name: 'onSelect', type: '(value: string) => void', defaultValue: 'undefined', description: 'Triggered when any MenuItem is activated.' },
    ],
  },
  {
    id: 'tree-view',
    number: '39',
    name: 'Tree View',
    category: 'Navigation & Layout',
    summary: 'Hierarchical keyboard-accessible file explorer with expandable branches built on @ui-sdk/react/tree.',
    uiSdkPrimitive: '@ui-sdk/react/tree',
    tags: ['tree', 'files', 'explorer', 'hierarchy'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingTreeView } from "@/components/nothing/Navigation"

export function TreeDemo() {
  return <NothingTreeView />
}`,
    code: `import { Tree, TreeGroup, TreeItem, TreeItemIndicator, TreeItemLabel } from "@ui-sdk/react/tree"
import { ChevronRight, FileCode2, Folder } from "lucide-react"

export function NothingTreeView() {
  return (
    <Tree aria-label="Project Files" defaultExpanded={["src", "src/components"]} className="font-mono text-xs">
      <TreeItem value="src">
        <TreeItemLabel className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-[var(--nt-raised)]">
          <TreeItemIndicator className="transition-transform data-expanded:rotate-90"><ChevronRight className="h-3.5 w-3.5" /></TreeItemIndicator>
          <Folder className="h-3.5 w-3.5 text-[var(--nt-muted)]" />
          <span>src</span>
        </TreeItemLabel>
        <TreeGroup className="pl-5">
          <TreeItem value="src/index.ts">
            <TreeItemLabel className="flex items-center gap-2 rounded px-2 py-1.5 cursor-pointer hover:bg-[var(--nt-raised)] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]">
              <FileCode2 className="h-3.5 w-3.5" />
              <span>index.ts</span>
            </TreeItemLabel>
          </TreeItem>
        </TreeGroup>
      </TreeItem>
    </Tree>
  )
}`,
    props: [
      { name: 'defaultExpanded', type: 'string[]', defaultValue: '[]', description: 'Node values expanded on initial render.' },
    ],
  },
  {
    id: 'cards-lists',
    number: '13',
    name: 'Cards & Lists',
    category: 'Navigation & Layout',
    summary: 'Frosted borderless Nothing surface cards, battery segmented bar telemetry cards, and hairline interactive list rows.',
    uiSdkPrimitive: null,
    tags: ['card', 'list', 'surface', 'frosted', 'glass'],
    installDeps: [],
    usageCode: `import { NothingCard } from "@/components/nothing/DataDisplay"

export function CardDemo() {
  return (
    <NothingCard title="Ear (a) Battery" subtitle="Left 92% · Right 88% · Case 74%">
      <p className="text-sm text-[var(--nt-secondary)]">Adaptive ANC active on low-latency mode.</p>
    </NothingCard>
  )
}`,
    code: `export function NothingCard({ title, subtitle, children, className }) {
  return (
    <div className={\`nt-card-surface rounded-xl p-5 \${className ?? ""}\`}>
      {title && <h3 className="font-display text-lg tracking-wide text-[var(--nt-display)]">{title}</h3>}
      {subtitle && <p className="mt-1 font-mono text-[11px] text-[var(--nt-muted)]">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}`,
    props: [
      { name: 'title', type: 'string', defaultValue: 'undefined', description: 'Card display title set in Doto.' },
      { name: 'subtitle', type: 'string', defaultValue: 'undefined', description: 'Quiet inline metadata line.' },
    ],
  },

  // ================= OVERLAYS & FEEDBACK =================
  {
    id: 'dialog',
    number: '18',
    name: 'Dialog & Alert Dialog',
    category: 'Overlays & Feedback',
    summary: 'Accessible modal and destructive confirmation dialogs with backdrop blur, focus trapping, and Escape dismissal via @ui-sdk/react/dialog and alert-dialog.',
    uiSdkPrimitive: '@ui-sdk/react/dialog',
    tags: ['dialog', 'modal', 'alert', 'confirm', 'overlay'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingDialogDemo } from "@/components/nothing/Overlays"

export function DialogExample() {
  return <NothingDialogDemo />
}`,
    code: `import { Dialog, DialogBackdrop, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@ui-sdk/react/dialog"

export function NothingDialog({ triggerLabel, title, description, children }) {
  return (
    <Dialog>
      <DialogTrigger className="inline-flex h-9 items-center rounded-md bg-[var(--nt-inverse-bg)] px-4 font-mono text-xs text-[var(--nt-inverse-fg)]">
        {triggerLabel}
      </DialogTrigger>
      <DialogBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DialogContent className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl">
        <DialogTitle className="font-display text-xl text-[var(--nt-display)]">{title}</DialogTitle>
        <DialogDescription className="mt-2 text-sm text-[var(--nt-secondary)]">{description}</DialogDescription>
        <div className="mt-5">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <DialogClose className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)]">Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  )
}`,
    props: [
      { name: 'open / defaultOpen', type: 'boolean', defaultValue: 'false', description: 'Controls modal visibility.' },
      { name: 'onOpenChange', type: '(open: boolean) => void', defaultValue: 'undefined', description: 'Fires on open or dismiss.' },
    ],
  },
  {
    id: 'drawer',
    number: '18B',
    name: 'Drawer',
    category: 'Overlays & Feedback',
    summary: 'Hardware-sheet bottom drawer with tactile grip handle and backdrop blur built on @ui-sdk/react/drawer.',
    uiSdkPrimitive: '@ui-sdk/react/drawer',
    tags: ['drawer', 'sheet', 'bottom-sheet', 'overlay'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingDrawerDemo } from "@/components/nothing/Overlays"

export function DrawerExample() {
  return <NothingDrawerDemo />
}`,
    code: `import { Drawer, DrawerBackdrop, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "@ui-sdk/react/drawer"

export function NothingDrawer() {
  return (
    <Drawer>
      <DrawerTrigger className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs text-[var(--nt-primary)]">
        Open Sheet
      </DrawerTrigger>
      <DrawerBackdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
      <DrawerContent className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-lg rounded-t-2xl border-t border-x border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-6 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-[var(--nt-line-2)]" />
        <DrawerTitle className="font-display text-xl text-[var(--nt-display)]">Glyph Schedule</DrawerTitle>
        <DrawerDescription className="mt-1 text-sm text-[var(--nt-secondary)]">Configure bedtime dimming and priority LED rings.</DrawerDescription>
        <div className="mt-6 flex justify-end">
          <DrawerClose className="h-9 rounded-md bg-[var(--nt-inverse-bg)] px-4 font-mono text-xs text-[var(--nt-inverse-fg)]">Done</DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  )
}`,
    props: [
      { name: 'edge', type: '"bottom" | "right" | "left"', defaultValue: '"bottom"', description: 'Slide direction of the sheet.' },
    ],
  },
  {
    id: 'popover-tooltip',
    number: '17',
    name: 'Popover & Tooltip',
    category: 'Overlays & Feedback',
    summary: 'Collision-aware floating popovers and instant crisp tooltips powered by @ui-sdk/react/popover and @ui-sdk/react/tooltip.',
    uiSdkPrimitive: '@ui-sdk/react/popover',
    tags: ['popover', 'tooltip', 'floating', 'hint'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingPopoverTooltipDemo } from "@/components/nothing/Overlays"

export function PopoverTooltipExample() {
  return <NothingPopoverTooltipDemo />
}`,
    code: `import { Popover, PopoverContent, PopoverDescription, PopoverTitle, PopoverTrigger } from "@ui-sdk/react/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@ui-sdk/react/tooltip"

export function PopoverTooltipPair() {
  return (
    <div className="flex items-center gap-3">
      <Popover>
        <PopoverTrigger className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs">
          Inspect Policy
        </PopoverTrigger>
        <PopoverContent className="z-50 w-72 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 shadow-xl">
          <PopoverTitle className="font-mono text-xs font-medium text-[var(--nt-display)]">Auto-Approve</PopoverTitle>
          <PopoverDescription className="mt-1.5 text-xs leading-relaxed text-[var(--nt-secondary)]">
            Trusted workflows run without prompting for step-by-step confirmation.
          </PopoverDescription>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger className="h-9 rounded-md border border-[var(--nt-line-2)] px-4 font-mono text-xs">
          Hover Me
        </TooltipTrigger>
        <TooltipContent className="z-50 rounded-md bg-[var(--nt-inverse-bg)] px-2.5 py-1.5 font-mono text-[11px] text-[var(--nt-inverse-fg)]">
          25×25 circular LED grid
        </TooltipContent>
      </Tooltip>
    </div>
  )
}`,
    props: [
      { name: 'placement', type: '"top" | "bottom" | "left" | "right"', defaultValue: '"bottom"', description: 'Preferred anchor side for floating content.' },
    ],
  },
  {
    id: 'toast',
    number: '29',
    name: 'Toast',
    category: 'Overlays & Feedback',
    summary: 'Programmatic toast notification queue with inline Undo actions and auto-dismissal powered by @ui-sdk/react/toast.',
    uiSdkPrimitive: '@ui-sdk/react/toast',
    tags: ['toast', 'notification', 'snackbar', 'alert'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { appToaster } from "@/components/nothing/Overlays"

export function ToastTrigger() {
  return (
    <button onClick={() => appToaster("Firmware synced", { description: "Phone (3) OS 3.2 verified" })}>
      Dispatch Toast
    </button>
  )
}`,
    code: `import { Toast, ToastAction, ToastClose, ToastDescription, ToastRegion, ToastTitle, createToaster } from "@ui-sdk/react/toast"

export const appToaster = createToaster()

export function NothingToastRegion() {
  return (
    <ToastRegion toaster={appToaster} className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-[min(92vw,360px)]">
      {() => (
        <Toast className="flex items-start justify-between gap-3 rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4 shadow-2xl">
          <div>
            <ToastTitle className="font-mono text-xs font-medium text-[var(--nt-display)]" />
            <ToastDescription className="mt-1 text-xs text-[var(--nt-secondary)]" />
          </div>
          <div className="flex items-center gap-2">
            <ToastAction className="rounded bg-[var(--nt-inverse-bg)] px-2.5 py-1 font-mono text-[11px] text-[var(--nt-inverse-fg)]" />
            <ToastClose aria-label="Dismiss" className="text-[var(--nt-muted)] hover:text-[var(--nt-display)]">×</ToastClose>
          </div>
        </Toast>
      )}
    </ToastRegion>
  )
}`,
    props: [
      { name: 'toaster', type: 'Toaster', defaultValue: 'appToaster', description: 'Shared toaster instance created with createToaster().' },
    ],
  },
  {
    id: 'alerts-banner',
    number: '10',
    name: 'Alerts & Banner',
    category: 'Overlays & Feedback',
    summary: 'High-contrast inline alert boxes and full-width dismissible system announcement banners with explicit semantic iconography.',
    uiSdkPrimitive: null,
    tags: ['alert', 'banner', 'notice', 'warning', 'error'],
    installDeps: [],
    usageCode: `import { NothingAlert, NothingBanner } from "@/components/nothing/Feedback"

export function AlertDemo() {
  return (
    <div className="space-y-3">
      <NothingAlert tone="neutral" title="Update Ready" description="Nothing OS 3.2 patch downloaded over Wi-Fi." />
      <NothingAlert tone="signal" title="Thermal Warning" description="Fast charging paused until casing drops below 38°C." />
      <NothingBanner message="Registry v1.4 available with @ui-sdk/react primitives" actionLabel="Inspect" />
    </div>
  )
}`,
    code: `export function NothingAlert({ tone = "neutral", title, description }) {
  return (
    <div role="status" className={\`rounded-xl border p-4 \${
      tone === "signal"
        ? "border-[#D71921]/40 bg-[#D71921]/8 text-[var(--nt-primary)]"
        : "border-[var(--nt-line-2)] bg-[var(--nt-raised)]/50 text-[var(--nt-primary)]"
    }\`}>
      <div className="font-mono text-xs font-medium uppercase tracking-wider">{title}</div>
      <p className="mt-1 text-sm text-[var(--nt-secondary)]">{description}</p>
    </div>
  )
}`,
    props: [
      { name: 'tone', type: '"neutral" | "signal" | "success"', defaultValue: '"neutral"', description: 'Semantic tone paired with explicit text/icon signifiers.' },
    ],
  },
  {
    id: 'progress-stepper',
    number: '19',
    name: 'Progress, Meter & Stepper',
    category: 'Overlays & Feedback',
    summary: 'Linear progress indicators, segmented hardware meters, and interactive multi-step workflows built on @ui-sdk/react/progress and @ui-sdk/react/meter.',
    uiSdkPrimitive: '@ui-sdk/react/progress',
    tags: ['progress', 'meter', 'stepper', 'steps', 'loading'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingProgress, NothingStepper, SegmentedBar } from "@/components/nothing/Feedback"

export function ProgressDemo() {
  return (
    <div className="space-y-5">
      <NothingProgress label="Bundle Sync" value={68} />
      <SegmentedBar label="Battery Cells" total={16} filled={12} />
      <NothingStepper steps={["Init", "Tokens", "Primitives", "Ship"]} currentStep={2} />
    </div>
  )
}`,
    code: `import { Progress, ProgressIndicator, ProgressLabel, ProgressTrack, ProgressValue } from "@ui-sdk/react/progress"

export function NothingProgress({ label, value }) {
  return (
    <Progress value={value} className="space-y-2">
      <div className="flex items-center justify-between font-mono text-xs">
        <ProgressLabel className="uppercase tracking-wider text-[var(--nt-secondary)]">{label}</ProgressLabel>
        <ProgressValue className="tabular-nums text-[var(--nt-display)]" />
      </div>
      <ProgressTrack className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--nt-line-2)]">
        <ProgressIndicator className="h-full bg-[var(--nt-display)] transition-all duration-300" />
      </ProgressTrack>
    </Progress>
  )
}`,
    props: [
      { name: 'value', type: 'number', defaultValue: '0', description: 'Current percentage from 0 to 100.' },
      { name: 'steps', type: 'string[]', defaultValue: '[]', description: 'Ordered step labels for NothingStepper.' },
    ],
  },
  {
    id: 'skeleton-loader',
    number: '42',
    name: 'Skeleton, Dot Loader & Empty',
    category: 'Overlays & Feedback',
    summary: '3×3 Nothing Dot Matrix Loader, geometry-matched skeleton placeholders, and crisp empty state panels.',
    uiSdkPrimitive: null,
    tags: ['skeleton', 'loader', 'spinner', 'empty', 'loading'],
    installDeps: [],
    usageCode: `import { DotLoader, NothingSkeleton, NothingEmptyState } from "@/components/nothing/Feedback"

export function LoaderDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <DotLoader label="LOADING" />
      <NothingEmptyState title="No modules staged" description="Add a component from the registry to begin." actionLabel="Browse Registry" />
    </div>
  )
}`,
    code: `export function DotLoader({ label = "LOADING" }) {
  return (
    <div className="inline-flex flex-col items-center gap-3" role="status" aria-label={label}>
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }).map((_, idx) => (
          <span
            key={idx}
            className="nt-dot-loader-cell h-2 w-2 rounded-full bg-[var(--nt-display)]"
            style={{ animationDelay: \`\${idx * 90}ms\` }}
          />
        ))}
      </div>
      <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--nt-muted)]">{label}</span>
    </div>
  )
}`,
    props: [
      { name: 'label', type: 'string', defaultValue: '"LOADING"', description: 'Accessible status text shown beneath the 3×3 matrix.' },
    ],
  },

  // ================= DATA & HARDWARE =================
  {
    id: 'table',
    number: '15',
    name: 'Data Table',
    category: 'Data & Hardware',
    summary: 'High-density sortable tabular-numerals data table with live search filtering and crisp hairline row alignment.',
    uiSdkPrimitive: null,
    tags: ['table', 'data', 'grid', 'sort', 'filter'],
    installDeps: [],
    usageCode: `import { NothingDataTable } from "@/components/nothing/DataDisplay"

export function TableDemo() {
  return <NothingDataTable />
}`,
    code: `export function NothingDataTable({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--nt-line)]">
      <table className="w-full border-collapse text-left font-mono text-xs">
        <thead className="border-b border-[var(--nt-line)] bg-[var(--nt-raised)]/60 text-[10px] uppercase tracking-wider text-[var(--nt-muted)]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-medium">{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--nt-line)] tabular-nums">
          {rows.map((row, idx) => (
            <tr key={idx} className="hover:bg-[var(--nt-raised)]/40 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-[var(--nt-primary)]">{row[col.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}`,
    props: [
      { name: 'sortable', type: 'boolean', defaultValue: 'true', description: 'Enables column sorting with visual direction arrows.' },
    ],
  },
  {
    id: 'calendar',
    number: '16',
    name: 'Calendar',
    category: 'Data & Hardware',
    summary: 'Full keyboard-navigable monthly date grid with Signal Red today marker and inverse selected date built on @ui-sdk/react/calendar.',
    uiSdkPrimitive: '@ui-sdk/react/calendar',
    tags: ['calendar', 'date', 'picker', 'schedule'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingCalendar } from "@/components/nothing/DataDisplay"

export function CalendarDemo() {
  return <NothingCalendar defaultValue="2026-11-19" />
}`,
    code: `import { Calendar, CalendarDay, CalendarGrid, CalendarHeading, CalendarNext, CalendarPrevious, CalendarWeekday, CalendarWeekdays, CalendarWeeks } from "@ui-sdk/react/calendar"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function NothingCalendar({ defaultValue = "2026-11-19" }) {
  return (
    <Calendar defaultValue={defaultValue} className="w-fit rounded-xl border border-[var(--nt-line-2)] bg-[var(--nt-surface)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <CalendarPrevious aria-label="Previous month" className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] hover:border-[var(--nt-display)]">
          <ChevronLeft className="h-3.5 w-3.5" />
        </CalendarPrevious>
        <CalendarHeading className="font-display text-base tracking-wide text-[var(--nt-display)]" />
        <CalendarNext aria-label="Next month" className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--nt-line)] hover:border-[var(--nt-display)]">
          <ChevronRight className="h-3.5 w-3.5" />
        </CalendarNext>
      </div>
      <CalendarGrid className="border-collapse font-mono text-xs tabular-nums">
        <CalendarWeekdays className="text-[10px] uppercase text-[var(--nt-muted)]">
          {(index) => <CalendarWeekday index={index} className="h-8 w-9 text-center font-normal" />}
        </CalendarWeekdays>
        <CalendarWeeks>
          {(cell) => (
            <CalendarDay
              value={cell.date}
              className="flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-[var(--nt-raised)] data-outside:opacity-30 data-today:border data-today:border-[#D71921] data-selected:bg-[var(--nt-inverse-bg)] data-selected:text-[var(--nt-inverse-fg)]"
            />
          )}
        </CalendarWeeks>
      </CalendarGrid>
    </Calendar>
  )
}`,
    props: [
      { name: 'defaultValue', type: 'string (YYYY-MM-DD)', defaultValue: '"2026-11-19"', description: 'ISO date string selected initially.' },
    ],
  },
  {
    id: 'timeline',
    number: '32',
    name: 'Timeline & Activity Stream',
    category: 'Data & Hardware',
    summary: 'Structured event timelines built on @ui-sdk/react/timeline paired with a live pauseable telemetry stream.',
    uiSdkPrimitive: '@ui-sdk/react/timeline',
    tags: ['timeline', 'activity', 'stream', 'feed', 'events'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingTimeline, ActivityStream } from "@/components/nothing/DataDisplay"

export function TimelineDemo() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <NothingTimeline />
      <ActivityStream />
    </div>
  )
}`,
    code: `import { Timeline, TimelineConnector, TimelineDescription, TimelineItem, TimelineMarker, TimelineTime, TimelineTitle } from "@ui-sdk/react/timeline"

export function NothingTimeline({ events }) {
  return (
    <Timeline aria-label="Deployment Timeline" className="space-y-4">
      {events.map((ev, idx) => (
        <TimelineItem key={ev.title} className="relative flex gap-4 pl-1">
          <div className="flex flex-col items-center">
            <TimelineMarker className="mt-1 h-2.5 w-2.5 rounded-full bg-[var(--nt-display)]" />
            {idx < events.length - 1 && <TimelineConnector className="mt-1.5 w-px flex-1 bg-[var(--nt-line-2)]" />}
          </div>
          <div className="pb-3">
            <div className="flex items-center gap-3">
              <TimelineTitle className="font-mono text-xs font-medium text-[var(--nt-display)]">{ev.title}</TimelineTitle>
              <TimelineTime className="font-mono text-[11px] tabular-nums text-[var(--nt-muted)]">{ev.time}</TimelineTime>
            </div>
            <TimelineDescription className="mt-1 text-xs text-[var(--nt-secondary)]">{ev.description}</TimelineDescription>
          </div>
        </TimelineItem>
      ))}
    </Timeline>
  )
}`,
    props: [
      { name: 'events', type: 'TimelineEvent[]', defaultValue: 'defaultEvents', description: 'Chronological events rendered with keyboard navigation.' },
    ],
  },
  {
    id: 'metric-counter',
    number: '37',
    name: 'Metric & Live Counter',
    category: 'Data & Hardware',
    summary: 'Dot-matrix tabular KPI tiles and smooth animated live counters for real-time telemetry.',
    uiSdkPrimitive: null,
    tags: ['metric', 'kpi', 'counter', 'stats', 'numbers'],
    installDeps: [],
    usageCode: `import { MetricCard, LiveCounter } from "@/components/nothing/DataDisplay"

export function MetricDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="Tokens" value="128K" delta="+12%" positive />
      <MetricCard label="Errors" value="3" delta="-40%" positive />
      <LiveCounter label="Events Processed" target={1482} />
    </div>
  )
}`,
    code: `export function MetricCard({ label, value, delta, positive = true }) {
  return (
    <div className="rounded-xl border border-[var(--nt-line)] bg-[var(--nt-surface)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--nt-muted)]">{label}</div>
      <div className="mt-2 font-display text-3xl tabular-nums text-[var(--nt-display)]">{value}</div>
      <div className={\`mt-1.5 font-mono text-[11px] tabular-nums \${positive ? "text-[var(--nt-secondary)]" : "text-[#D71921]"}\`}>
        {delta}
      </div>
    </div>
  )
}`,
    props: [
      { name: 'value', type: 'string | number', defaultValue: 'required', description: 'Primary display figure rendered in Doto tabular numerals.' },
      { name: 'delta', type: 'string', defaultValue: 'undefined', description: 'Relative change label with explicit sign.' },
    ],
  },
  {
    id: 'avatar-chips-kbd',
    number: '12',
    name: 'Avatar, Chips & Kbd',
    category: 'Data & Hardware',
    summary: 'Monochrome avatar stacks powered by @ui-sdk/react/avatar, interactive filterable chips, keyboard keycaps, and syntax-styled code blocks.',
    uiSdkPrimitive: '@ui-sdk/react/avatar',
    tags: ['avatar', 'chip', 'tag', 'kbd', 'code', 'badge'],
    installDeps: ['@ui-sdk/react', '@ui-sdk/core'],
    usageCode: `import { NothingAvatarGroup, NothingKbd, InteractiveChipsDemo } from "@/components/nothing/Feedback"

export function AvatarKbdDemo() {
  return (
    <div className="space-y-4">
      <NothingAvatarGroup initials={["NK", "AL", "MR"]} overflowCount={5} />
      <InteractiveChipsDemo />
      <div className="flex items-center gap-1.5"><NothingKbd>⌘</NothingKbd><NothingKbd>K</NothingKbd></div>
    </div>
  )
}`,
    code: `import { Avatar, AvatarFallback } from "@ui-sdk/react/avatar"

export function NothingAvatar({ fallback }: { fallback: string }) {
  return (
    <Avatar className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--nt-line-2)] bg-[var(--nt-raised)] font-mono text-xs text-[var(--nt-display)]">
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}`,
    props: [
      { name: 'initials', type: 'string[]', defaultValue: '[]', description: 'Collaborator initials rendered in overlapping circular frames.' },
    ],
  },
  {
    id: 'glyph-matrix',
    number: '40',
    name: 'Glyph Matrix (25×25)',
    category: 'Data & Hardware',
    summary: 'Canonical Phone (3) circularly masked 25×25 addressable LED dot grid with 8 built-in geometric glyphs and interactive pixel painting.',
    uiSdkPrimitive: null,
    tags: ['glyph', 'matrix', 'led', 'phone3', 'dot-matrix', 'hardware'],
    installDeps: [],
    usageCode: `import { GlyphMatrix } from "@/components/nothing/GlyphMatrix"

export function GlyphDemo() {
  return <GlyphMatrix preset="power" size={180} />
}`,
    code: `import { buildPresetMatrix } from "@/lib/glyph-matrix"

export function GlyphMatrix({ preset = "power", size = 180 }) {
  const cells = buildPresetMatrix(preset)
  return (
    <div
      style={{ width: size, height: size }}
      className="grid grid-cols-[repeat(25,1fr)] gap-[1.5px] rounded-full border border-[#232323] bg-[#070707] p-[6.5%]"
    >
      {cells.map((state, idx) => (
        <span
          key={idx}
          className={
            state === "void"
              ? "bg-transparent"
              : state === "signal"
                ? "rounded-full bg-[#D71921]"
                : state === "on"
                  ? "rounded-full bg-white"
                  : "rounded-full bg-white/8"
          }
        />
      ))}
    </div>
  )
}`,
    props: [
      { name: 'preset', type: '"power" | "play" | "heart" | "live" | "arrow" | "sound" | "smiley" | "plus"', defaultValue: '"power"', description: 'Built-in geometric LED preset.' },
      { name: 'interactive', type: 'boolean', defaultValue: 'false', description: 'Enables clicking individual addressable LEDs to toggle them on/off.' },
    ],
  },
  {
    id: 'dot-icons',
    number: '21',
    name: 'Dot Icon Library',
    category: 'Data & Hardware',
    summary: '35 crisp 9×9 round-dot pixel SVG icons inspired by Nothing OS iconography with scalable sizing and one-click JSX export.',
    uiSdkPrimitive: null,
    tags: ['icons', 'dot-icon', 'svg', 'pixel', '9x9'],
    installDeps: [],
    usageCode: `import { DotIcon } from "@/components/nothing/DotIcon"

export function IconDemo() {
  return (
    <div className="flex items-center gap-4">
      <DotIcon name="signal" size={24} />
      <DotIcon name="wifi" size={24} />
      <DotIcon name="battery" size={24} />
      <DotIcon name="bolt" size={24} />
    </div>
  )
}`,
    code: `import { getDotIconPoints, type DotIconName } from "@/lib/dot-icons"

export function DotIcon({ name, size = 20, className }: { name: DotIconName; size?: number; className?: string }) {
  const points = getDotIconPoints(name)
  return (
    <svg width={size} height={size} viewBox="0 0 9 9" fill="currentColor" aria-hidden="true" className={className}>
      {points.map((pt, i) => (
        <circle key={i} cx={pt.x + 0.5} cy={pt.y + 0.5} r={0.38} />
      ))}
    </svg>
  )
}`,
    props: [
      { name: 'name', type: 'DotIconName (35 icons)', defaultValue: 'required', description: 'Icon identifier from the 9×9 Nothing dot-matrix icon set.' },
      { name: 'size', type: 'number', defaultValue: '20', description: 'Rendered SVG width and height in pixels.' },
    ],
  },
];

export function filterRegistryComponents(
  query: string,
  category: ComponentCategory | 'All' = 'All'
): RegistryComponent[] {
  const normalized = query.trim().toLowerCase();
  return REGISTRY_COMPONENTS.filter((item) => {
    const categoryMatch = category === 'All' || item.category === category;
    if (!categoryMatch) return false;
    if (!normalized) return true;
    return (
      item.name.toLowerCase().includes(normalized) ||
      item.id.toLowerCase().includes(normalized) ||
      item.summary.toLowerCase().includes(normalized) ||
      (item.uiSdkPrimitive?.toLowerCase().includes(normalized) ?? false) ||
      item.tags.some((t) => t.toLowerCase().includes(normalized))
    );
  });
}

export function buildCliInstallCommand(componentId: string, pm: PackageManager): string {
  switch (pm) {
    case 'pnpm':
      return `pnpm dlx nthgui add ${componentId}`;
    case 'bun':
      return `bunx --bun nthgui add ${componentId}`;
    case 'yarn':
      return `yarn dlx nthgui add ${componentId}`;
    case 'npm':
    default:
      return `npx nthgui add ${componentId}`;
  }
}

export function getComponentById(id: string): RegistryComponent | undefined {
  return REGISTRY_COMPONENTS.find((c) => c.id === id);
}
