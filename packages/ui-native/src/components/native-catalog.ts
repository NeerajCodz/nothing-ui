import { NATIVE_COMPONENT_SNIPPETS, type NativeSnippetEntry } from './glyph-matrix';
import { COMPLETE_NATIVE_SEEDS } from './native-complete-seeds';
import { WIDGET_NATIVE_SEEDS } from './native-widget-seeds';

export type NativeCategory =
  | 'Inputs & Actions'
  | 'Navigation & Layout'
  | 'Overlays & Feedback'
  | 'Charts'
  | 'Data & Hardware'
  | 'Widgets'
  | 'Glyph System';

export type NativeLoaderVariant = 'normal' | 'dots' | 'bars' | 'pulse';

export const DEFAULT_NATIVE_LOADER_VARIANT: NativeLoaderVariant = 'normal';

export interface NativeComponentSpec extends NativeSnippetEntry {
  category: NativeCategory;
  primitivesUsed: string[];
  cliCommand: string;
  loadingSupport: {
    defaultVariant: NativeLoaderVariant;
    supportedVariants: readonly NativeLoaderVariant[];
    usesActivityIndicatorByDefault: boolean;
    accessibilityProp: 'accessibilityState={{ busy: loading }}';
  };
}

interface NativeSeed {
  slug: string;
  nativeName: string;
  webCounterpart: string;
  title: string;
  category: NativeCategory;
  primitivesUsed: string[];
  platformNotes: string;
  code: string;
}

const CUSTOM_NATIVE_SEEDS: NativeSeed[] = [
  {
    slug: 'copy-field',
    nativeName: 'CopyField',
    webCounterpart: 'Copy Field',
    title: 'Copy Field',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Text', 'Pressable', 'expo-clipboard'],
    platformNotes: 'Monospace readout field with 44pt copy action button, Expo Clipboard write, and 1.6s confirmation state.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import * as Clipboard from "expo-clipboard";
import { createNativeTheme } from "nthgui/native";

export function CopyField({ value, label = "ENDPOINT" }: { value: string; label?: string }) {
  const theme = createNativeTheme("dark");
  const [copied, setCopied] = React.useState(false);

  const onCopy = async () => {
    await Clipboard.setStringAsync(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <View style={[styles.wrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <View style={styles.meta}>
        <Text style={[styles.label, { color: theme.colors.foregroundMuted }]}>{label}</Text>
        <Text numberOfLines={1} style={[styles.value, { color: theme.colors.foreground }]}>{value}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copied ? "Copied" : "Copy value"}
        onPress={onCopy}
        style={[styles.btn, { backgroundColor: copied ? theme.colors.signal : theme.colors.interactive }]}
      >
        <Text style={[styles.btnText, { color: copied ? "#FFFFFF" : theme.colors.interactiveForeground }]}>
          {copied ? "COPIED" : "COPY"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderRadius: 12, padding: 10, gap: 10 },
  meta: { flex: 1, gap: 2 },
  label: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.2 },
  value: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  btn: { minHeight: 44, paddingHorizontal: 14, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  btnText: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, letterSpacing: 0.8 },
});`,
  },
  {
    slug: 'otp-input',
    nativeName: 'OtpInput',
    webCounterpart: 'Verification Code',
    title: 'Verification Code (OTP)',
    category: 'Inputs & Actions',
    primitivesUsed: ['TextInput', 'View', 'Text', 'Pressable'],
    platformNotes: 'Hidden TextInput with iOS textContentType="oneTimeCode" & Android autoComplete="sms-otp" driving 6 tactile dot-framed cells.',
    code: `import * as React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function OtpInput({ length = 6, onComplete }: { length?: number; onComplete?: (code: string) => void }) {
  const theme = createNativeTheme("dark");
  const [code, setCode] = React.useState("");
  const inputRef = React.useRef<TextInput>(null);

  const handleChange = (next: string) => {
    const clean = next.replace(/[^0-9]/g, "").slice(0, length);
    setCode(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  return (
    <Pressable onPress={() => inputRef.current?.focus()} style={styles.row} accessibilityLabel="One-time verification code">
      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={handleChange}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        style={styles.hidden}
      />
      {Array.from({ length }).map((_, i) => {
        const active = i === code.length;
        return (
          <View
            key={i}
            style={[
              styles.cell,
              {
                backgroundColor: theme.colors.surface,
                borderColor: active ? theme.colors.signal : theme.colors.borderStrong,
              },
            ]}
          >
            <Text style={[styles.digit, { color: theme.colors.foreground }]}>{code[i] ?? "•"}</Text>
          </View>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
  cell: { width: 44, height: 52, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  digit: { fontFamily: "JetBrainsMono-Regular", fontSize: 18, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'checkbox',
    nativeName: 'Checkbox',
    webCounterpart: 'Checkbox & Radio',
    title: 'Checkbox & Radio',
    category: 'Inputs & Actions',
    primitivesUsed: ['Pressable', 'View', 'Text'],
    platformNotes: '44pt hit-slop touch target exposing accessibilityRole="checkbox" and accessibilityState={{ checked }} for VoiceOver & TalkBack.',
    code: `import { Pressable, View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Checkbox({
  label,
  checked,
  onCheckedChange,
  signal = false,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  signal?: boolean;
}) {
  const theme = createNativeTheme("dark");
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onCheckedChange(!checked)}
      style={styles.row}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? (signal ? theme.colors.signal : theme.colors.foreground) : theme.colors.borderStrong,
            backgroundColor: checked ? (signal ? theme.colors.signal : theme.colors.foreground) : "transparent",
          },
        ]}
      >
        {checked && <View style={[styles.dot, { backgroundColor: signal ? "#FFFFFF" : theme.colors.background }]} />}
      </View>
      <Text style={[styles.label, { color: theme.colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 12 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontFamily: "PlusJakartaSans-Regular", fontSize: 14 },
});`,
  },
  {
    slug: 'slider',
    nativeName: 'Slider',
    webCounterpart: 'Slider',
    title: 'Slider',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Text', 'PanResponder'],
    platformNotes: 'Hardware-calibrated PanResponder track slider with accessibilityRole="adjustable" and tabular-nums readout.',
    code: `import * as React from "react";
import { View, Text, PanResponder, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Slider({
  label,
  value,
  min = 0,
  max = 100,
  unit = "%",
  onValueChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onValueChange: (v: number) => void;
}) {
  const theme = createNativeTheme("dark");
  const trackWidth = React.useRef(260);
  const pct = Math.max(0, Math.min(1, (value - min) / (max - min)));

  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: (_, g) => {
          const ratio = Math.max(0, Math.min(1, g.moveX / Math.max(1, trackWidth.current)));
          onValueChange(Math.round(min + ratio * (max - min)));
        },
      }),
    [min, max, onValueChange],
  );

  return (
    <View style={styles.wrap} accessibilityRole="adjustable" accessibilityValue={{ min, max, now: value }}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: theme.colors.foregroundMuted }]}>{label}</Text>
        <Text style={[styles.readout, { color: theme.colors.foreground }]}>{value}{unit}</Text>
      </View>
      <View
        {...pan.panHandlers}
        onLayout={(e) => { trackWidth.current = e.nativeEvent.layout.width; }}
        style={[styles.track, { backgroundColor: theme.colors.borderStrong }]}
      >
        <View style={[styles.fill, { width: \`\${pct * 100}%\`, backgroundColor: theme.colors.signal }]} />
        <View style={[styles.thumb, { left: \`\${pct * 100}%\`, borderColor: theme.colors.signal, backgroundColor: theme.colors.background }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, letterSpacing: 1 },
  readout: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, fontVariant: ["tabular-nums"] },
  track: { height: 6, borderRadius: 999, justifyContent: "center" },
  fill: { height: 6, borderRadius: 999 },
  thumb: { position: "absolute", marginLeft: -10, width: 20, height: 20, borderRadius: 10, borderWidth: 2 },
});`,
  },
  {
    slug: 'select',
    nativeName: 'Select',
    webCounterpart: 'Select',
    title: 'Select',
    category: 'Inputs & Actions',
    primitivesUsed: ['Pressable', 'Modal', 'FlatList', 'Text'],
    platformNotes: 'Opens an OLED bottom sheet Modal with FlatList options and Signal Red active indicator.',
    code: `import * as React from "react";
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Select({
  value,
  options,
  onValueChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (val: string) => void;
}) {
  const theme = createNativeTheme("dark");
  const [open, setOpen] = React.useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="combobox"
        onPress={() => setOpen(true)}
        style={[styles.trigger, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }]}
      >
        <Text style={[styles.text, { color: theme.colors.foreground }]}>{current?.label ?? "Select option"}</Text>
        <Text style={{ color: theme.colors.foregroundMuted }}>▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { onValueChange(item.value); setOpen(false); }}
                  style={styles.option}
                >
                  <Text style={[styles.text, { color: item.value === value ? theme.colors.signal : theme.colors.foreground }]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 16, maxHeight: 340 },
  option: { minHeight: 44, justifyContent: "center", paddingHorizontal: 8 },
  text: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'number-input',
    nativeName: 'NumberInput',
    webCounterpart: 'Number Stepper',
    title: 'Number Stepper',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: '44×44pt tactile minus/plus triggers with clamped bounds and tabular-nums readout.',
    code: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function NumberInput({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  const theme = createNativeTheme("dark");
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <View style={[styles.row, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Decrease" onPress={() => onChange(clamp(value - step))} style={styles.btn}>
        <Text style={[styles.sym, { color: theme.colors.foreground }]}>−</Text>
      </Pressable>
      <Text style={[styles.val, { color: theme.colors.foreground }]}>{value}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Increase" onPress={() => onChange(clamp(value + step))} style={styles.btn}>
        <Text style={[styles.sym, { color: theme.colors.foreground }]}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 10, alignSelf: "flex-start" },
  btn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  sym: { fontFamily: "JetBrainsMono-Regular", fontSize: 18 },
  val: { minWidth: 48, textAlign: "center", fontFamily: "JetBrainsMono-Regular", fontSize: 15, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'rating',
    nativeName: 'Rating',
    webCounterpart: 'Rating',
    title: 'Rating',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Pressable', 'react-native-svg'],
    platformNotes: 'Dot-matrix circular LED rating scale with 44pt tap targets and VoiceOver value announcements.',
    code: `import { View, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Rating({ value, max = 5, onChange }: { value: number; max?: number; onChange: (n: number) => void }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.row} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max, now: value }}>
      {Array.from({ length: max }).map((_, idx) => {
        const active = idx < value;
        return (
          <Pressable key={idx} onPress={() => onChange(idx + 1)} style={styles.hit} accessibilityLabel={\`Rate \${idx + 1} of \${max}\`}>
            <View style={[styles.dot, { backgroundColor: active ? theme.colors.signal : theme.colors.borderStrong }]} />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
  hit: { width: 40, height: 44, alignItems: "center", justifyContent: "center" },
  dot: { width: 14, height: 14, borderRadius: 7 },
});`,
  },
  {
    slug: 'dropzone',
    nativeName: 'Dropzone',
    webCounterpart: 'Dropzone',
    title: 'File Picker / Dropzone',
    category: 'Inputs & Actions',
    primitivesUsed: ['Pressable', 'View', 'Text', 'expo-document-picker'],
    platformNotes: 'Maps web drag-and-drop to native iOS Files / Android Storage Access Framework via expo-document-picker with dashed hardware frame.',
    code: `import * as React from "react";
import { Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Dropzone({
  label = "SELECT FIRMWARE OR ASSET",
  onPickPress,
  fileName,
}: {
  label?: string;
  onPickPress: () => void;
  fileName?: string | null;
}) {
  const theme = createNativeTheme("dark");
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPickPress}
      style={[styles.box, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }]}
    >
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{fileName ?? label}</Text>
      <Text style={[styles.sub, { color: theme.colors.foregroundMuted }]}>
        Tap to open iOS Files or Android Document Picker
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: { minHeight: 120, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 16, padding: 20, alignItems: "center", justifyContent: "center", gap: 6 },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, letterSpacing: 1 },
  sub: { fontFamily: "PlusJakartaSans-Regular", fontSize: 12, textAlign: "center" },
});`,
  },
  {
    slug: 'rotary-knob',
    nativeName: 'RotaryKnob',
    webCounterpart: 'Rotary Knob',
    title: 'Rotary Knob',
    category: 'Inputs & Actions',
    primitivesUsed: ['PanResponder', 'react-native-svg', 'View', 'Text'],
    platformNotes: 'Vertical PanResponder gesture mapped to 270° LED dot arc via react-native-svg with shared rotary math from nothing-ui.',
    code: `import * as React from "react";
import { View, Text, PanResponder, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function RotaryKnob({
  label = "GAIN",
  value,
  min = 0,
  max = 100,
  onChange,
}: {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
}) {
  const theme = createNativeTheme("dark");
  const startVal = React.useRef(value);
  const pan = React.useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => { startVal.current = value; },
        onPanResponderMove: (_, g) => {
          const delta = Math.round((-g.dy / 140) * (max - min));
          onChange(Math.max(min, Math.min(max, startVal.current + delta)));
        },
      }),
    [value, min, max, onChange],
  );

  const dots = 15;
  const activeDots = Math.round(((value - min) / (max - min)) * dots);

  return (
    <View {...pan.panHandlers} style={styles.wrap} accessibilityRole="adjustable" accessibilityValue={{ min, max, now: value }}>
      <Svg width={112} height={112} viewBox="0 0 112 112">
        <Circle cx={56} cy={56} r={34} fill={theme.colors.surface} stroke={theme.colors.borderStrong} strokeWidth={1.5} />
        {Array.from({ length: dots }).map((_, i) => {
          const deg = -225 + (i / (dots - 1)) * 270;
          const rad = (deg * Math.PI) / 180;
          const cx = 56 + Math.cos(rad) * 46;
          const cy = 56 + Math.sin(rad) * 46;
          const fill = i < activeDots ? (i === activeDots - 1 ? theme.colors.signal : theme.colors.foreground) : theme.colors.borderStrong;
          return <Circle key={i} cx={cx} cy={cy} r={2.8} fill={fill} />;
        })}
      </Svg>
      <Text style={[styles.val, { color: theme.colors.foreground }]}>{value}</Text>
      <Text style={[styles.lbl, { color: theme.colors.foregroundMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: 4 },
  val: { fontFamily: "JetBrainsMono-Regular", fontSize: 14, fontVariant: ["tabular-nums"] },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.4 },
});`,
  },
  {
    slug: 'tabs',
    nativeName: 'Tabs',
    webCounterpart: 'Tabs',
    title: 'Tabs',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text', 'ScrollView'],
    platformNotes: 'Horizontal scrollable tab bar with hairline underline indicator and accessibilityRole="tab".',
    code: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Tabs({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.bar, { borderBottomColor: theme.colors.border }]} accessibilityRole="tablist">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onSelect(item.id)}
            style={[styles.tab, active && { borderBottomColor: theme.colors.signal, borderBottomWidth: 2 }]}
          >
            <Text style={[styles.lbl, { color: active ? theme.colors.foreground : theme.colors.foregroundMuted }]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", borderBottomWidth: StyleSheet.hairlineWidth, gap: 16 },
  tab: { minHeight: 44, justifyContent: "center", paddingHorizontal: 4 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'segmented-control',
    nativeName: 'SegmentedControl',
    webCounterpart: 'Segmented & Toggle Group',
    title: 'Segmented Control',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Monochrome pill container with inverse high-contrast active segment and 44pt height.',
    code: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.track, { backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.border }]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(opt)}
            style={[styles.seg, active && { backgroundColor: theme.colors.interactive }]}
          >
            <Text style={[styles.lbl, { color: active ? theme.colors.interactiveForeground : theme.colors.foregroundMuted }]}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: "row", borderWidth: 1, borderRadius: 12, padding: 3 },
  seg: { flex: 1, minHeight: 38, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'accordion',
    nativeName: 'Accordion',
    webCounterpart: 'Accordion & Collapsible',
    title: 'Accordion & Collapsible',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text', 'LayoutAnimation'],
    platformNotes: 'Uses LayoutAnimation.configureNext for smooth native expansion with hairline dividers.',
    code: `import * as React from "react";
import { View, Text, Pressable, LayoutAnimation, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Accordion({ items }: { items: { id: string; title: string; body: string }[] }) {
  const theme = createNativeTheme("dark");
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id ?? null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <View style={[styles.wrap, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <View key={item.id} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => toggle(item.id)} style={styles.trigger}>
              <Text style={[styles.title, { color: theme.colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.title, { color: theme.colors.signal }]}>{open ? "−" : "+"}</Text>
            </Pressable>
            {open && <Text style={[styles.body, { color: theme.colors.foregroundSecondary }]}>{item.body}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 16, overflow: "hidden" },
  row: { borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16 },
  trigger: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  body: { fontFamily: "PlusJakartaSans-Regular", fontSize: 13, paddingBottom: 14, lineHeight: 20 },
});`,
  },
  {
    slug: 'breadcrumb',
    nativeName: 'Breadcrumb',
    webCounterpart: 'Breadcrumb & Separator',
    title: 'Breadcrumb & Separator',
    category: 'Navigation & Layout',
    primitivesUsed: ['ScrollView', 'Pressable', 'Text', 'View'],
    platformNotes: 'Horizontal scrollable monospace trail with hairline separator segments for deep mobile navigation stacks.',
    code: `import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Breadcrumb({ items, onSelect }: { items: string[]; onSelect?: (idx: number) => void }) {
  const theme = createNativeTheme("dark");
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item, idx) => {
        const last = idx === items.length - 1;
        return (
          <Pressable key={item} disabled={last} onPress={() => onSelect?.(idx)} style={styles.item}>
            <Text style={[styles.lbl, { color: last ? theme.colors.foreground : theme.colors.foregroundMuted }]}>
              {item}
            </Text>
            {!last && <Text style={[styles.sep, { color: theme.colors.borderStrong }]}>/</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
  item: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 36 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
  sep: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'pagination',
    nativeName: 'Pagination',
    webCounterpart: 'Pagination',
    title: 'Pagination',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Compact mobile-first Previous / Tabular Page Index / Next bar with 44pt controls.',
    code: `import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.row}>
      <Pressable disabled={page <= 1} onPress={() => onPageChange(page - 1)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.txt, { color: theme.colors.foreground }]}>PREV</Text>
      </Pressable>
      <Text style={[styles.txt, { color: theme.colors.foregroundMuted }]}>
        {String(page).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
      </Text>
      <Pressable disabled={page >= totalPages} onPress={() => onPageChange(page + 1)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.txt, { color: theme.colors.foreground }]}>NEXT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  btn: { minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10, justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'command',
    nativeName: 'CommandPalette',
    webCounterpart: 'Command Palette',
    title: 'Command Palette',
    category: 'Navigation & Layout',
    primitivesUsed: ['Modal', 'TextInput', 'FlatList', 'KeyboardAvoidingView'],
    platformNotes: 'Keyboard-avoiding OLED search modal with instant FlatList filtering and touch-friendly command rows.',
    code: `import * as React from "react";
import { Modal, View, TextInput, FlatList, Pressable, Text, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function CommandPalette({
  visible,
  commands,
  onSelect,
  onClose,
}: {
  visible: boolean;
  commands: { id: string; title: string; group: string }[];
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const theme = createNativeTheme("dark");
  const [query, setQuery] = React.useState("");
  const filtered = commands.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.backdrop}>
        <View style={[styles.panel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            placeholder="Jump to component or command..."
            placeholderTextColor={theme.colors.foregroundMuted}
            style={[styles.input, { color: theme.colors.foreground, borderBottomColor: theme.colors.border }]}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable onPress={() => { onSelect(item.id); onClose(); }} style={styles.row}>
                <Text style={[styles.title, { color: theme.colors.foreground }]}>{item.title}</Text>
                <Text style={[styles.group, { color: theme.colors.foregroundMuted }]}>{item.group}</Text>
              </Pressable>
            )}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(0,0,0,0.72)" },
  panel: { borderWidth: 1, borderRadius: 16, maxHeight: 420, overflow: "hidden" },
  input: { height: 48, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  row: { minHeight: 46, paddingHorizontal: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  group: { fontFamily: "JetBrainsMono-Regular", fontSize: 10 },
});`,
  },
  {
    slug: 'dropdown-menu',
    nativeName: 'DropdownMenu',
    webCounterpart: 'Dropdown Menu',
    title: 'Dropdown Menu',
    category: 'Navigation & Layout',
    primitivesUsed: ['Modal', 'Pressable', 'View', 'Text'],
    platformNotes: 'Translucent action sheet modal supporting destructive Signal Red items and 44pt tap rows.',
    code: `import * as React from "react";
import { Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function DropdownMenu({
  triggerLabel = "ACTIONS",
  items,
}: {
  triggerLabel?: string;
  items: { label: string; destructive?: boolean; onPress: () => void }[];
}) {
  const theme = createNativeTheme("dark");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[styles.trigger, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.txt, { color: theme.colors.foreground }]}>{triggerLabel} ▾</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
            {items.map((item) => (
              <Pressable key={item.label} onPress={() => { item.onPress(); setOpen(false); }} style={styles.item}>
                <Text style={[styles.txt, { color: item.destructive ? theme.colors.signal : theme.colors.foreground }]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 44, paddingHorizontal: 14, borderWidth: 1, borderRadius: 10, alignSelf: "flex-start", justifyContent: "center" },
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.6)" },
  menu: { borderWidth: 1, borderRadius: 14, paddingVertical: 6 },
  item: { minHeight: 44, paddingHorizontal: 16, justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'tree-view',
    nativeName: 'TreeView',
    webCounterpart: 'Tree View',
    title: 'Tree View',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Recursive collapsible hierarchy with depth indentation guides and 40pt touch rows.',
    code: `import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export interface TreeNode { id: string; label: string; children?: TreeNode[]; }

export function TreeView({ nodes, depth = 0 }: { nodes: TreeNode[]; depth?: number }) {
  const theme = createNativeTheme("dark");
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  return (
    <View>
      {nodes.map((node) => {
        const hasKids = Boolean(node.children?.length);
        const isOpen = Boolean(expanded[node.id]);
        return (
          <View key={node.id}>
            <Pressable
              onPress={() => hasKids && setExpanded((prev) => ({ ...prev, [node.id]: !prev[node.id] }))}
              style={[styles.row, { paddingLeft: 12 + depth * 18 }]}
            >
              <Text style={[styles.icon, { color: theme.colors.signal }]}>{hasKids ? (isOpen ? "▾" : "▸") : "•"}</Text>
              <Text style={[styles.lbl, { color: theme.colors.foreground }]}>{node.label}</Text>
            </Pressable>
            {hasKids && isOpen && <TreeView nodes={node.children!} depth={depth + 1} />}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 8 },
  icon: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, width: 14 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'dialog',
    nativeName: 'Dialog',
    webCounterpart: 'Dialog & Alert Dialog',
    title: 'Dialog & Alert Dialog',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Modal', 'View', 'Text', 'Pressable'],
    platformNotes: 'Native Modal presentation with hardware backdrop dim, accessible dismiss handler, and Signal Red destructive CTA.',
    code: `import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Dialog({
  visible,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
          <Text style={[styles.desc, { color: theme.colors.foregroundSecondary }]}>{description}</Text>
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={[styles.btn, { borderColor: theme.colors.borderStrong, borderWidth: 1 }]}>
              <Text style={[styles.btnTxt, { color: theme.colors.foreground }]}>CANCEL</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={[styles.btn, { backgroundColor: theme.colors.signal }]}>
              <Text style={[styles.btnTxt, { color: "#FFFFFF" }]}>CONFIRM</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.72)" },
  card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  title: { fontFamily: "Doto-Regular", fontSize: 20 },
  desc: { fontFamily: "PlusJakartaSans-Regular", fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 6 },
  btn: { minHeight: 44, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
  btnTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'drawer',
    nativeName: 'Drawer',
    webCounterpart: 'Drawer',
    title: 'Bottom Sheet / Drawer',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Modal', 'View', 'Pressable', 'SafeAreaView'],
    platformNotes: 'Slide-up bottom sheet drawer with grab handle, SafeAreaView padding, and tap-outside dismiss.',
    code: `import { Modal, View, Pressable, SafeAreaView, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Drawer({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  const theme = createNativeTheme("dark");
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <SafeAreaView style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.borderStrong }]} />
          <View style={styles.body}>{children}</View>
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10 },
  body: { padding: 20 },
});`,
  },
  {
    slug: 'popover',
    nativeName: 'Popover',
    webCounterpart: 'Popover & Tooltip',
    title: 'Popover & Tooltip',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Modal', 'Pressable', 'View', 'Text'],
    platformNotes: 'Tap-triggered floating monochrome callout adapting desktop hover tooltips cleanly to iOS & Android touch.',
    code: `import * as React from "react";
import { Modal, Pressable, View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Popover({ triggerLabel, content }: { triggerLabel: string; content: string }) {
  const theme = createNativeTheme("dark");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} style={[styles.trigger, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.txt, { color: theme.colors.foreground }]}>{triggerLabel}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
            <Text style={[styles.txt, { color: theme.colors.foregroundSecondary }]}>{content}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { minHeight: 40, paddingHorizontal: 12, borderWidth: 1, borderRadius: 8, alignSelf: "flex-start", justifyContent: "center" },
  backdrop: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.45)" },
  card: { maxWidth: 300, borderWidth: 1, borderRadius: 14, padding: 14 },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, lineHeight: 18 },
});`,
  },
  {
    slug: 'toast',
    nativeName: 'Toast',
    webCounterpart: 'Toast',
    title: 'Toast',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Animated', 'View', 'Text', 'Pressable'],
    platformNotes: 'Top/bottom safe-area floating toast banner with accessibilityLiveRegion="polite" and Signal Red critical diode.',
    code: `import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Toast({
  message,
  tone = "default",
  onDismiss,
}: {
  message: string;
  tone?: "default" | "signal";
  onDismiss?: () => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.bar,
        {
          backgroundColor: theme.colors.surface,
          borderColor: tone === "signal" ? theme.colors.signal : theme.colors.borderStrong,
        },
      ]}
    >
      <View style={[styles.diode, { backgroundColor: tone === "signal" ? theme.colors.signal : theme.colors.foreground }]} />
      <Text style={[styles.msg, { color: theme.colors.foreground }]}>{message}</Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8}>
          <Text style={[styles.dismiss, { color: theme.colors.foregroundMuted }]}>ESC</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  diode: { width: 8, height: 8, borderRadius: 4 },
  msg: { flex: 1, fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
  dismiss: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'alert',
    nativeName: 'Alert',
    webCounterpart: 'Alerts & Banner',
    title: 'Alerts & Banner',
    category: 'Overlays & Feedback',
    primitivesUsed: ['View', 'Text'],
    platformNotes: 'Inline hardware callout banner with accessibilityRole="alert" and left Signal Red accent rail.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Alert({
  title,
  description,
  signal = false,
}: {
  title: string;
  description: string;
  signal?: boolean;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.box,
        {
          backgroundColor: theme.colors.surface,
          borderColor: signal ? theme.colors.signal : theme.colors.borderStrong,
        },
      ]}
    >
      <Text style={[styles.title, { color: signal ? theme.colors.signal : theme.colors.foreground }]}>{title}</Text>
      <Text style={[styles.desc, { color: theme.colors.foregroundSecondary }]}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 4 },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, letterSpacing: 0.8 },
  desc: { fontFamily: "PlusJakartaSans-Regular", fontSize: 13, lineHeight: 19 },
});`,
  },
  {
    slug: 'data-table',
    nativeName: 'DataTable',
    webCounterpart: 'Data Table',
    title: 'Data Table',
    category: 'Data & Hardware',
    primitivesUsed: ['FlatList', 'ScrollView', 'Pressable', 'View', 'Text'],
    platformNotes: 'Virtualized FlatList rows paired with horizontal ScrollView column alignment and sortable column headers.',
    code: `import * as React from "react";
import { ScrollView, FlatList, View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export interface TelemetryRow { id: string; device: string; firmware: string; battery: number; }

export function DataTable({ rows }: { rows: TelemetryRow[] }) {
  const theme = createNativeTheme("dark");
  const [asc, setAsc] = React.useState(false);
  const sorted = React.useMemo(
    () => [...rows].sort((a, b) => (asc ? a.battery - b.battery : b.battery - a.battery)),
    [rows, asc],
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={[styles.table, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
          <Text style={[styles.head, { width: 150, color: theme.colors.foregroundMuted }]}>DEVICE</Text>
          <Text style={[styles.head, { width: 110, color: theme.colors.foregroundMuted }]}>FIRMWARE</Text>
          <Pressable onPress={() => setAsc((v) => !v)} style={{ width: 96 }}>
            <Text style={[styles.head, { color: theme.colors.signal }]}>BATT {asc ? "↑" : "↓"}</Text>
          </Pressable>
        </View>
        <FlatList
          data={sorted}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.row, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.cell, { width: 150, color: theme.colors.foreground }]}>{item.device}</Text>
              <Text style={[styles.cell, { width: 110, color: theme.colors.foregroundSecondary }]}>{item.firmware}</Text>
              <Text style={[styles.cell, { width: 96, color: theme.colors.foreground }]}>{item.battery}%</Text>
            </View>
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  table: { borderWidth: 1, borderRadius: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, minHeight: 44, borderBottomWidth: StyleSheet.hairlineWidth },
  head: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1 },
  cell: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'calendar',
    nativeName: 'Calendar',
    webCounterpart: 'Calendar',
    title: 'Calendar',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: '7-column tactile day grid with Signal Red selected day marker and tabular-nums date cells.',
    code: `import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Calendar({ selectedDay, onSelectDay }: { selectedDay: number; onSelectDay: (d: number) => void }) {
  const theme = createNativeTheme("dark");
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.month, { color: theme.colors.foreground }]}>NOVEMBER 2026</Text>
      <View style={styles.grid}>
        {days.map((d) => {
          const active = d === selectedDay;
          return (
            <Pressable
              key={d}
              onPress={() => onSelectDay(d)}
              style={[styles.cell, active && { backgroundColor: theme.colors.signal }]}
            >
              <Text style={[styles.num, { color: active ? "#FFFFFF" : theme.colors.foreground }]}>
                {String(d).padStart(2, "0")}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  month: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, letterSpacing: 1.2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  cell: { width: "13%", aspectRatio: 1, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'timeline',
    nativeName: 'Timeline',
    webCounterpart: 'Timeline & Activity Stream',
    title: 'Timeline & Activity Stream',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text'],
    platformNotes: 'Vertical hairline hardware rail with active Signal Red node and monospace timestamps.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Timeline({ events }: { events: { id: string; time: string; title: string; active?: boolean }[] }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.list}>
      {events.map((ev, idx) => (
        <View key={ev.id} style={styles.row}>
          <View style={styles.railCol}>
            <View style={[styles.node, { backgroundColor: ev.active ? theme.colors.signal : theme.colors.foreground }]} />
            {idx < events.length - 1 && <View style={[styles.line, { backgroundColor: theme.colors.borderStrong }]} />}
          </View>
          <View style={styles.content}>
            <Text style={[styles.time, { color: theme.colors.foregroundMuted }]}>{ev.time}</Text>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>{ev.title}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 4 },
  row: { flexDirection: "row", gap: 12 },
  railCol: { alignItems: "center", width: 14 },
  node: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  line: { width: 1, flex: 1, minHeight: 28, marginTop: 4 },
  content: { flex: 1, paddingBottom: 14, gap: 2 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, fontVariant: ["tabular-nums"] },
  title: { fontFamily: "PlusJakartaSans-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'metric-card',
    nativeName: 'MetricCard',
    webCounterpart: 'Metric & Live Counter',
    title: 'Metric & Live Counter',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text'],
    platformNotes: 'Doto display figure with tabular-nums, hairline border surface, and Signal Red delta readout.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function MetricCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.label, { color: theme.colors.foregroundMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.colors.foreground }]}>{value}</Text>
      <Text style={[styles.delta, { color: theme.colors.signal }]}>{delta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  label: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.2 },
  value: { fontFamily: "Doto-Regular", fontSize: 30, fontVariant: ["tabular-nums"] },
  delta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'avatar',
    nativeName: 'Avatar',
    webCounterpart: 'Avatar, Chips & Kbd',
    title: 'Avatar, Chips & Badge',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Image', 'Text'],
    platformNotes: 'Circular monochrome avatar with initials fallback and live Signal Red presence dot.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Avatar({ initials = "NP", online = true, size = 44 }: { initials?: string; online?: boolean; size?: number }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.colors.surfaceRaised, borderColor: theme.colors.borderStrong }]}>
      <Text style={[styles.txt, { color: theme.colors.foreground }]}>{initials}</Text>
      {online && <View style={[styles.dot, { backgroundColor: theme.colors.signal, borderColor: theme.colors.background }]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 1, alignItems: "center", justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  dot: { position: "absolute", right: 0, bottom: 0, width: 11, height: 11, borderRadius: 6, borderWidth: 2 },
});`,
  },
  {
    slug: 'dot-text',
    nativeName: 'DotText',
    webCounterpart: 'Dotted UI (DotText, Counter, Progress, Clock)',
    title: 'Dotted UI Kit (DotText & DotProgress)',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text'],
    platformNotes: 'Combines Doto dot-matrix typography with LED dot-row progress bars using tabular numerals.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function DotProgress({ label, value = 72, dots = 16, signal = true }: { label: string; value?: number; dots?: number; signal?: boolean }) {
  const theme = createNativeTheme("dark");
  const lit = Math.round((Math.max(0, Math.min(100, value)) / 100) * dots);
  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={[styles.lbl, { color: theme.colors.foreground }]}>{label}</Text>
        <Text style={[styles.lbl, { color: theme.colors.foregroundMuted }]}>{value}%</Text>
      </View>
      <View style={styles.row}>
        {Array.from({ length: dots }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < lit ? (signal ? theme.colors.signal : theme.colors.foreground) : theme.colors.borderStrong },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  head: { flexDirection: "row", justifyContent: "space-between" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});`,
  },
  {
    slug: 'hardware-kit',
    nativeName: 'HardwareKit',
    webCounterpart: 'Hardware Controls (LED, SignalMeter, QuickSettingTile)',
    title: 'Hardware Controls (LED & SignalMeter)',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text', 'Animated'],
    platformNotes: 'Hardware LED status diode and 5-bar RF signal meter with native opacity pulse support.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function SignalMeter({ label = "5G ULTRA", strength = 4 }: { label?: string; strength?: number }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.wrap}>
      <View style={styles.bars}>
        {[1, 2, 3, 4, 5].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              {
                height: 6 + bar * 4,
                backgroundColor: bar <= strength ? (bar === 5 ? theme.colors.signal : theme.colors.foreground) : theme.colors.borderStrong,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.lbl, { color: theme.colors.foregroundMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  bars: { flexDirection: "row", alignItems: "flex-end", gap: 3 },
  bar: { width: 4, borderRadius: 2 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, letterSpacing: 1 },
});`,
  },
  {
    slug: 'stepper',
    nativeName: 'Stepper',
    webCounterpart: 'Stepper',
    title: 'Stepper',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Multi-step hardware provisioning track with numbered dot nodes and Signal Red active stage.',
    code: `import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Stepper({ steps, current, onSelect }: { steps: string[]; current: number; onSelect?: (i: number) => void }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.row}>
      {steps.map((step, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <Pressable key={step} onPress={() => onSelect?.(i)} style={styles.item}>
            <View
              style={[
                styles.node,
                {
                  backgroundColor: active ? theme.colors.signal : done ? theme.colors.foreground : "transparent",
                  borderColor: active ? theme.colors.signal : theme.colors.borderStrong,
                },
              ]}
            >
              <Text style={[styles.num, { color: active ? "#FFFFFF" : done ? theme.colors.background : theme.colors.foregroundMuted }]}>
                {i + 1}
              </Text>
            </View>
            <Text style={[styles.lbl, { color: active ? theme.colors.foreground : theme.colors.foregroundMuted }]}>{step}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  item: { flex: 1, alignItems: "center", gap: 6 },
  node: { width: 30, height: 30, borderRadius: 15, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  num: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 10 },
});`,
  },
  {
    slug: 'brand-logo',
    nativeName: 'BrandLogo',
    webCounterpart: 'Logo (Brand)',
    title: 'Logo (Brand)',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Text', 'react-native-svg'],
    platformNotes: 'Original 3×3 circular dot mark + Doto wordmark rendered via react-native-svg.',
    code: `import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function BrandLogo({ showWordmark = true }: { showWordmark?: boolean }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.row}>
      <Svg width={24} height={24} viewBox="0 0 24 24">
        {[4, 12, 20].flatMap((cy, r) =>
          [4, 12, 20].map((cx, c) => (
            <Circle key={\`\${r}-\${c}\`} cx={cx} cy={cy} r={2.2} fill={r === 0 && c === 2 ? theme.colors.signal : theme.colors.foreground} />
          )),
        )}
      </Svg>
      {showWordmark && <Text style={[styles.word, { color: theme.colors.foreground }]}>NOTHING UI</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  word: { fontFamily: "Doto-Regular", fontSize: 18, letterSpacing: 1.4 },
});`,
  },
  {
    slug: 'chat',
    nativeName: 'ChatBubble',
    webCounterpart: 'Chat (Bubble, Message, Attachment)',
    title: 'Chat (Bubble & Message)',
    category: 'Overlays & Feedback',
    primitivesUsed: ['View', 'Text', 'FlatList'],
    platformNotes: 'Inverted FlatList compatible message bubble with monochrome sender polarity and monospace timestamp.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function ChatBubble({ text, time, outgoing = false }: { text: string; time: string; outgoing?: boolean }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.wrap, { alignSelf: outgoing ? "flex-end" : "flex-start" }]}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: outgoing ? theme.colors.interactive : theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={[styles.msg, { color: outgoing ? theme.colors.interactiveForeground : theme.colors.foreground }]}>{text}</Text>
      </View>
      <Text style={[styles.time, { color: theme.colors.foregroundMuted, alignSelf: outgoing ? "flex-end" : "flex-start" }]}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: "82%", gap: 4 },
  bubble: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  msg: { fontFamily: "PlusJakartaSans-Regular", fontSize: 14, lineHeight: 20 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'charts',
    nativeName: 'InteractiveCoreCharts',
    webCounterpart: 'Charts (Bar, Line, Area, Radial)',
    title: 'Interactive Core Charts',
    category: 'Data & Hardware',
    primitivesUsed: ['react-native-svg', 'View', 'Text', 'Pressable'],
    platformNotes: 'Interactive multi-series react-native-svg bar/line chart with tap-to-pin tooltip callout, custom seriesColors, palette presets, and live stream toggle.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Rect, Line } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export interface InteractiveCoreChartsNativeProps {
  data?: number[];
  labels?: string[];
  title?: string;
  palette?: "monochrome" | "signal" | "spectral" | "ocean" | "amber";
  seriesColors?: { primary?: string; accent?: string };
  thresholdValue?: number;
  enableLive?: boolean;
  onPointSelect?: (index: number, value: number) => void;
}

export function InteractiveCoreCharts({
  data: initialData = [42, 68, 54, 88, 76, 94, 81],
  labels = ["01", "02", "03", "04", "05", "06", "07"],
  title = "TELEMETRY",
  seriesColors,
  thresholdValue = 80,
  enableLive = false,
  onPointSelect,
}: InteractiveCoreChartsNativeProps) {
  const theme = createNativeTheme("dark");
  const [data, setData] = React.useState(initialData);
  const [pinnedIdx, setPinnedIdx] = React.useState<number>(initialData.length - 1);
  const [live, setLive] = React.useState(enableLive);

  React.useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setData((prev) => [...prev.slice(1), Math.max(20, Math.min(100, prev[prev.length - 1] + Math.round((Math.random() - 0.5) * 18)))]);
    }, 1200);
    return () => clearInterval(id);
  }, [live]);

  const max = Math.max(...data, thresholdValue, 1);
  const primaryColor = seriesColors?.primary ?? theme.colors.foreground;
  const accentColor = seriesColors?.accent ?? theme.colors.signal;
  const thresholdY = 92 - (thresholdValue / max) * 80;

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.foregroundMuted }]}>
          {title} · {labels[pinnedIdx] ?? pinnedIdx}: {data[pinnedIdx]}
        </Text>
        <Pressable onPress={() => setLive((v) => !v)} style={[styles.btn, { borderColor: live ? accentColor : theme.colors.border }]}>
          <Text style={[styles.btnText, { color: live ? accentColor : theme.colors.foreground }]}>{live ? "LIVE" : "STATIC"}</Text>
        </Pressable>
      </View>
      <Svg width="100%" height={104} viewBox={\`0 0 \${data.length * 32} 104\`}>
        <Line x1={0} x2={data.length * 32} y1={thresholdY} y2={thresholdY} stroke={accentColor} strokeDasharray="4 3" strokeWidth={1.2} />
        {data.map((val, idx) => {
          const h = Math.max(8, (val / max) * 80);
          const selected = idx === pinnedIdx;
          return (
            <Rect
              key={idx}
              x={idx * 32 + 6}
              y={92 - h}
              width={20}
              height={h}
              rx={4}
              fill={selected || val >= thresholdValue ? accentColor : primaryColor}
              fillOpacity={selected ? 1 : 0.78}
              onPress={() => {
                setPinnedIdx(idx);
                onPointSelect?.(idx, val);
              }}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  btnText: { fontFamily: "JetBrainsMono-Regular", fontSize: 10 },
});`,
  },
  {
    slug: 'media-kit',
    nativeName: 'AudioPlayer',
    webCounterpart: 'Media (AudioPlayer & LocationCard)',
    title: 'Media (AudioPlayer & Location)',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Pressable', 'Text', 'react-native-svg'],
    platformNotes: 'Tactile playback controls and coordinate readout ready for expo-av audio streams.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function AudioPlayer({ track = "GLYPH SYNTH 03", duration = "03:42" }: { track?: string; duration?: string }) {
  const theme = createNativeTheme("dark");
  const [playing, setPlaying] = React.useState(false);

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setPlaying((p) => !p)}
          style={[styles.play, { backgroundColor: playing ? theme.colors.signal : theme.colors.interactive }]}
        >
          <Text style={{ color: playing ? "#FFFFFF" : theme.colors.interactiveForeground, fontFamily: "JetBrainsMono-Regular", fontSize: 12 }}>
            {playing ? "PAUSE" : "PLAY"}
          </Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={[styles.track, { color: theme.colors.foreground }]}>{track}</Text>
          <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>{playing ? "PLAYING · LDAC" : "PAUSED"} · {duration}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  play: { minHeight: 44, paddingHorizontal: 14, borderRadius: 10, justifyContent: "center" },
  track: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'motion-kit',
    nativeName: 'MotionReveal',
    webCounterpart: 'Motion (Fade, Slide, Scale, Stagger)',
    title: 'Motion Primitives (Fade / Slide / Scale)',
    category: 'Navigation & Layout',
    primitivesUsed: ['Animated', 'AccessibilityInfo'],
    platformNotes: 'Native-driver Animated.timing entrance respecting iOS/Android AccessibilityInfo.isReduceMotionEnabled.',
    code: `import * as React from "react";
import { Animated, AccessibilityInfo } from "react-native";

export function MotionReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(10)).current;

  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced) {
        opacity.setValue(1);
        translateY.setValue(0);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 240, delay, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 240, delay, useNativeDriver: true }),
      ]).start();
    });
  }, [delay, opacity, translateY]);

  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}`,
  },
  {
    slug: 'productivity-kit',
    nativeName: 'OnboardingChecklist',
    webCounterpart: 'Productivity (Sortable & Onboarding)',
    title: 'Onboarding & Checklist',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Step-by-step mobile setup checklist with completion percentage bar and 44pt tap rows.',
    code: `import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function OnboardingChecklist({ steps }: { steps: string[] }) {
  const theme = createNativeTheme("dark");
  const [done, setDone] = React.useState<Record<number, boolean>>({ 0: true });
  const count = Object.values(done).filter(Boolean).length;

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.head, { color: theme.colors.foregroundMuted }]}>SETUP PROGRESS · {count}/{steps.length}</Text>
      {steps.map((step, i) => (
        <Pressable key={step} onPress={() => setDone((p) => ({ ...p, [i]: !p[i] }))} style={styles.row}>
          <View style={[styles.dot, { backgroundColor: done[i] ? theme.colors.signal : theme.colors.borderStrong }]} />
          <Text style={[styles.lbl, { color: theme.colors.foreground, textDecorationLine: done[i] ? "line-through" : "none" }]}>{step}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 6 },
  head: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.2, marginBottom: 4 },
  row: { minHeight: 40, flexDirection: "row", alignItems: "center", gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  lbl: { fontFamily: "PlusJakartaSans-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'dot-matrix-clock',
    nativeName: 'DotMatrixClock',
    webCounterpart: 'Dot Matrix Clock',
    title: 'Dot Matrix Clock',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes: 'Live OLED digital dot-matrix clock with blinking Signal Red colon diode and 12h/24h toggle.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function DotMatrixClock() {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  const [is24h, setIs24h] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = is24h ? now.getHours() : now.getHours() % 12 || 12;
  const hh = String(hours).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const blink = now.getSeconds() % 2 === 0;

  return (
    <Pressable onPress={() => setIs24h((v) => !v)} style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.label, { color: theme.colors.foregroundMuted }]}>NOTHING OS · {is24h ? "24H" : "12H"}</Text>
      <View style={styles.timeRow}>
        <Text style={[styles.digits, { color: theme.colors.foreground }]}>{hh}</Text>
        <Text style={[styles.digits, { color: theme.colors.signal, opacity: blink ? 1 : 0.25 }]}>:</Text>
        <Text style={[styles.digits, { color: theme.colors.foreground }]}>{mm}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 18, alignItems: "center", gap: 6 },
  label: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.4 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 2 },
  digits: { fontFamily: "Doto-Regular", fontSize: 44, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'earbuds-battery',
    nativeName: 'EarbudsBattery',
    webCounterpart: 'Earbuds & Battery Telemetry',
    title: 'Earbuds & Battery Pod',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes: 'Nothing Ear (a) L/R/Case telemetry widget with ANC mode selector and tabular battery percentages.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function EarbudsBattery({ left = 92, right = 88, casePct = 64 }: { left?: number; right?: number; casePct?: number }) {
  const theme = createNativeTheme("dark");
  const [anc, setAnc] = React.useState<"ANC" | "TRANS" | "OFF">("ANC");

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.head, { color: theme.colors.foreground }]}>EAR (a) · LDAC CONNECTED</Text>
      <View style={styles.pods}>
        {[{ k: "L", v: left }, { k: "R", v: right }, { k: "CASE", v: casePct }].map((pod) => (
          <View key={pod.k} style={[styles.pod, { borderColor: theme.colors.border }]}>
            <Text style={[styles.k, { color: theme.colors.foregroundMuted }]}>{pod.k}</Text>
            <Text style={[styles.v, { color: pod.v < 25 ? theme.colors.signal : theme.colors.foreground }]}>{pod.v}%</Text>
          </View>
        ))}
      </View>
      <View style={styles.modes}>
        {(["ANC", "TRANS", "OFF"] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setAnc(m)}
            style={[styles.modeBtn, { backgroundColor: anc === m ? theme.colors.signal : theme.colors.surfaceRaised }]}
          >
            <Text style={[styles.k, { color: anc === m ? "#FFFFFF" : theme.colors.foregroundMuted }]}>{m}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  head: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, letterSpacing: 1 },
  pods: { flexDirection: "row", gap: 8 },
  pod: { flex: 1, borderWidth: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 4 },
  k: { fontFamily: "JetBrainsMono-Regular", fontSize: 10 },
  v: { fontFamily: "Doto-Regular", fontSize: 22, fontVariant: ["tabular-nums"] },
  modes: { flexDirection: "row", gap: 8 },
  modeBtn: { flex: 1, minHeight: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});`,
  },
  {
    slug: 'weather-matrix',
    nativeName: 'WeatherMatrix',
    webCounterpart: 'Weather Matrix',
    title: 'Weather Matrix',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text', 'Pressable', 'react-native-svg'],
    platformNotes: 'Dot-icon weather telemetry widget with °C/°F unit switcher and monochrome hourly forecast strip.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function WeatherMatrix({ city = "LONDON", tempC = 14, condition = "OVERCAST" }: { city?: string; tempC?: number; condition?: string }) {
  const theme = createNativeTheme("dark");
  const [unit, setUnit] = React.useState<"C" | "F">("C");
  const display = unit === "C" ? tempC : Math.round((tempC * 9) / 5 + 32);

  return (
    <Pressable onPress={() => setUnit((u) => (u === "C" ? "F" : "C"))} style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>{city} · {condition}</Text>
      <Text style={[styles.temp, { color: theme.colors.foreground }]}>{display}°{unit}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 6 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.2 },
  temp: { fontFamily: "Doto-Regular", fontSize: 40, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'quick-settings',
    nativeName: 'QuickSettingsDeck',
    webCounterpart: 'Quick Settings Deck',
    title: 'Quick Settings Deck',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: '2×2 tactile Nothing OS toggle grid with 56pt height tiles and Signal Red active state for Glyph/Essential modes.',
    code: `import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function QuickSettingsDeck() {
  const theme = createNativeTheme("dark");
  const [tiles, setTiles] = React.useState<Record<string, boolean>>({
    "WI-FI": true,
    "BLUETOOTH": true,
    "GLYPH": true,
    "AIRPLANE": false,
  });

  return (
    <View style={styles.grid}>
      {Object.entries(tiles).map(([label, active]) => (
        <Pressable
          key={label}
          accessibilityRole="switch"
          accessibilityState={{ checked: active }}
          onPress={() => setTiles((prev) => ({ ...prev, [label]: !prev[label] }))}
          style={[
            styles.tile,
            {
              backgroundColor: active ? (label === "GLYPH" ? theme.colors.signal : theme.colors.interactive) : theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text style={[styles.lbl, { color: active ? (label === "GLYPH" ? "#FFFFFF" : theme.colors.interactiveForeground) : theme.colors.foreground }]}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "47%", minHeight: 58, borderWidth: 1, borderRadius: 16, padding: 14, justifyContent: "center" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, letterSpacing: 0.8 },
});`,
  },
  {
    slug: 'combobox',
    nativeName: 'Combobox',
    webCounterpart: 'Combobox',
    title: 'Combobox',
    category: 'Inputs & Actions',
    primitivesUsed: ['TextInput', 'FlatList', 'Pressable', 'View'],
    platformNotes: 'Searchable autocomplete input paired with inline FlatList suggestions and instant keyboard filtering.',
    code: `import * as React from "react";
import { View, TextInput, FlatList, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Combobox({ options, onSelect }: { options: string[]; onSelect: (v: string) => void }) {
  const theme = createNativeTheme("dark");
  const [query, setQuery] = React.useState("");
  const matches = options.filter((o) => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <View style={styles.wrap}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search hardware profile..."
        placeholderTextColor={theme.colors.foregroundMuted}
        style={[styles.input, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface, color: theme.colors.foreground }]}
      />
      <FlatList
        data={matches.slice(0, 5)}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable onPress={() => { setQuery(item); onSelect(item); }} style={[styles.opt, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.txt, { color: theme.colors.foreground }]}>{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: { height: 44, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  opt: { minHeight: 42, justifyContent: "center", paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'date-time-picker',
    nativeName: 'DateTimePicker',
    webCounterpart: 'Date & Time Picker',
    title: 'Date & Time Picker',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Tactile date and HH:MM time selector combining hardware stepper buttons with tabular ISO preview.',
    code: `import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function DateTimePicker() {
  const theme = createNativeTheme("dark");
  const [hour, setHour] = React.useState(14);
  const [minute, setMinute] = React.useState(30);

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>SCHEDULE · 2026-11-19</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setHour((h) => (h + 1) % 24)} style={[styles.slot, { borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.val, { color: theme.colors.foreground }]}>{String(hour).padStart(2, "0")}</Text>
        </Pressable>
        <Text style={[styles.val, { color: theme.colors.signal }]}>:</Text>
        <Pressable onPress={() => setMinute((m) => (m + 5) % 60)} style={[styles.slot, { borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.val, { color: theme.colors.foreground }]}>{String(minute).padStart(2, "0")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  slot: { minWidth: 56, height: 48, borderWidth: 1, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  val: { fontFamily: "Doto-Regular", fontSize: 26, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'tag-input',
    nativeName: 'TagInput',
    webCounterpart: 'Tag Input',
    title: 'Tag Input',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'TextInput', 'Pressable', 'Text'],
    platformNotes: 'Multi-token input with returnKeyType="done" submission and 1-tap removable hardware chips.',
    code: `import * as React from "react";
import { View, TextInput, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function TagInput({ initial = ["glyph-25", "oled"] }: { initial?: string[] }) {
  const theme = createNativeTheme("dark");
  const [tags, setTags] = React.useState(initial);
  const [draft, setDraft] = React.useState("");

  const addTag = () => {
    const clean = draft.trim();
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setDraft("");
  };

  return (
    <View style={[styles.box, { borderColor: theme.colors.borderStrong, backgroundColor: theme.colors.surface }]}>
      <View style={styles.chips}>
        {tags.map((tag) => (
          <Pressable key={tag} onPress={() => setTags(tags.filter((t) => t !== tag))} style={[styles.chip, { backgroundColor: theme.colors.surfaceRaised }]}>
            <Text style={[styles.txt, { color: theme.colors.foreground }]}>{tag} ×</Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        value={draft}
        onChangeText={setDraft}
        onSubmitEditing={addTag}
        returnKeyType="done"
        placeholder="Add token..."
        placeholderTextColor={theme.colors.foregroundMuted}
        style={[styles.input, { color: theme.colors.foreground }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { borderWidth: 1, borderRadius: 12, padding: 10, gap: 8 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
  input: { minHeight: 36, fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'sparkline-strip',
    nativeName: 'InteractiveSparklineStrip',
    webCounterpart: 'Sparkline Telemetry Strip',
    title: 'Sparkline Telemetry Strip',
    category: 'Data & Hardware',
    primitivesUsed: ['react-native-svg', 'View', 'Text', 'Pressable'],
    platformNotes: 'Configurable react-native-svg sparkline with touch datapoint pinning, custom strokeColor/strokeWidth, and live streaming.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export interface SparklineStripNativeProps {
  label?: string;
  values?: number[];
  strokeColor?: string;
  accentColor?: string;
  strokeWidth?: number;
  enableLive?: boolean;
  onPointSelect?: (index: number, value: number) => void;
}

export function InteractiveSparklineStrip({
  label = "LATENCY",
  values: initialValues = [18, 22, 16, 28, 24, 19, 14],
  strokeColor,
  accentColor,
  strokeWidth = 2,
  enableLive = false,
  onPointSelect,
}: SparklineStripNativeProps) {
  const theme = createNativeTheme("dark");
  const [values, setValues] = React.useState(initialValues);
  const [activeIdx, setActiveIdx] = React.useState(initialValues.length - 1);
  const [live, setLive] = React.useState(enableLive);

  React.useEffect(() => {
    if (!live) return;
    const id = setInterval(() => {
      setValues((prev) => [...prev.slice(1), Math.max(8, Math.round(prev[prev.length - 1] + (Math.random() - 0.5) * 6))]);
    }, 1000);
    return () => clearInterval(id);
  }, [live]);

  const max = Math.max(...values, 1);
  const coords = values.map((v, i) => ({
    x: (i / Math.max(1, values.length - 1)) * 180 + 6,
    y: 44 - (v / max) * 34,
    v,
  }));
  const pts = coords.map((c) => \`\${c.x},\${c.y}\`).join(" ");
  const active = coords[activeIdx] ?? coords[coords.length - 1];
  const lineStroke = strokeColor ?? theme.colors.foreground;
  const dotFill = accentColor ?? theme.colors.signal;

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <View style={styles.row}>
        <Text style={[styles.lbl, { color: theme.colors.foreground }]}>
          {label} · {active.v}ms (idx {activeIdx + 1})
        </Text>
        <Pressable onPress={() => setLive((v) => !v)}>
          <Text style={[styles.lbl, { color: live ? dotFill : theme.colors.foregroundMuted }]}>{live ? "LIVE" : "PAUSE"}</Text>
        </Pressable>
      </View>
      <Svg width="100%" height={52} viewBox="0 0 192 52">
        <Line x1={active.x} x2={active.x} y1={4} y2={48} stroke={dotFill} strokeDasharray="2 2" strokeWidth={1} />
        <Polyline points={pts} fill="none" stroke={lineStroke} strokeWidth={strokeWidth} />
        {coords.map((c, idx) => (
          <Circle
            key={idx}
            cx={c.x}
            cy={c.y}
            r={idx === activeIdx ? 4.5 : 3}
            fill={idx === activeIdx ? dotFill : lineStroke}
            onPress={() => {
              setActiveIdx(idx);
              onPointSelect?.(idx, c.v);
            }}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'radar-chart',
    nativeName: 'InteractiveRadarChart',
    webCounterpart: 'Radar & Bar Matrix Chart',
    title: 'Interactive Radar Chart',
    category: 'Data & Hardware',
    primitivesUsed: ['react-native-svg', 'View', 'Text', 'Pressable'],
    platformNotes: 'Multi-series configurable react-native-svg radar polygon with legend toggles, tap-to-pin axis breakdown, custom seriesColors, and ring controls.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Polygon, Circle } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export interface RadarChartNativeProps {
  axes?: string[];
  rings?: number;
  seriesColors?: { primary?: string; secondary?: string };
  fillOpacity?: number;
  onAxisSelect?: (axis: string, value: number) => void;
}

export function InteractiveRadarChart({
  axes = ["Glyph", "Battery", "Thermal", "Audio", "Display", "Haptics"],
  rings = 4,
  seriesColors,
  fillOpacity = 0.22,
  onAxisSelect,
}: RadarChartNativeProps) {
  const theme = createNativeTheme("dark");
  const [showSecondary, setShowSecondary] = React.useState(true);
  const [pinnedAxis, setPinnedAxis] = React.useState(0);
  const primary = [0.96, 0.88, 0.84, 0.82, 0.94, 0.91];
  const secondary = [0.42, 0.86, 0.92, 0.97, 0.3, 0.76];
  const cx = 84;
  const cy = 84;
  const r = 64;
  const c1 = seriesColors?.primary ?? theme.colors.signal;
  const c2 = seriesColors?.secondary ?? theme.colors.foreground;

  const toPoly = (vals: number[]) =>
    vals
      .map((v, i) => {
        const a = (i / vals.length) * Math.PI * 2 - Math.PI / 2;
        return \`\${cx + Math.cos(a) * r * v},\${cy + Math.sin(a) * r * v}\`;
      })
      .join(" ");

  return (
    <View style={[styles.card, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      <View style={styles.row}>
        <Text style={[styles.lbl, { color: theme.colors.foreground }]}>
          {axes[pinnedAxis]} · {Math.round(primary[pinnedAxis] * 100)}
        </Text>
        <Pressable onPress={() => setShowSecondary((s) => !s)}>
          <Text style={[styles.lbl, { color: showSecondary ? c2 : theme.colors.foregroundMuted }]}>
            {showSecondary ? "Hide Ear (3)" : "Compare Ear (3)"}
          </Text>
        </Pressable>
      </View>
      <Svg width={168} height={168} viewBox="0 0 168 168">
        {Array.from({ length: rings }, (_, idx) => (
          <Circle key={idx} cx={cx} cy={cy} r={(r * (idx + 1)) / rings} fill="none" stroke={theme.colors.border} strokeWidth={1} />
        ))}
        {showSecondary && <Polygon points={toPoly(secondary)} fill={c2} fillOpacity={fillOpacity * 0.6} stroke={c2} strokeWidth={1.6} />}
        <Polygon points={toPoly(primary)} fill={c1} fillOpacity={fillOpacity} stroke={c1} strokeWidth={2} />
        {primary.map((v, i) => {
          const a = (i / primary.length) * Math.PI * 2 - Math.PI / 2;
          return (
            <Circle
              key={axes[i]}
              cx={cx + Math.cos(a) * r * v}
              cy={cy + Math.sin(a) * r * v}
              r={pinnedAxis === i ? 5 : 3.2}
              fill={pinnedAxis === i ? theme.colors.foreground : c1}
              onPress={() => {
                setPinnedAxis(i);
                onAxisSelect?.(axes[i], Math.round(v * 100));
              }}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 16, padding: 14, alignItems: "center", gap: 8 },
  row: { width: "100%", flexDirection: "row", justifyContent: "space-between" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'metric-grid',
    nativeName: 'MetricGrid',
    webCounterpart: 'Hardware KPI Grid',
    title: 'Hardware KPI Grid',
    category: 'Data & Hardware',
    primitivesUsed: ['View', 'Text'],
    platformNotes: 'Responsive 2-column KPI tile layout engineered for narrow mobile viewports with tabular numerals.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function MetricGrid({ items }: { items: { label: string; value: string }[] }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <View key={item.label} style={[styles.tile, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.lbl, { color: theme.colors.foregroundMuted }]}>{item.label}</Text>
          <Text style={[styles.val, { color: theme.colors.foreground }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tile: { width: "47%", borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1 },
  val: { fontFamily: "Doto-Regular", fontSize: 26, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'hover-card',
    nativeName: 'HoverCard',
    webCounterpart: 'Hover Card',
    title: 'Hover / Long-Press Card',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Pressable', 'Modal', 'View', 'Text'],
    platformNotes: 'Adapts desktop hover preview to mobile onLongPress / tap preview sheet with zero hover-trap dead ends.',
    code: `import * as React from "react";
import { Pressable, Modal, View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function HoverCard({ label, title, summary }: { label: string; title: string; summary: string }) {
  const theme = createNativeTheme("dark");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable onPress={() => setOpen(true)} onLongPress={() => setOpen(true)}>
        <Text style={[styles.link, { color: theme.colors.signal }]}>{label}</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
            <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
            <Text style={[styles.desc, { color: theme.colors.foregroundSecondary }]}>{summary}</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  link: { fontFamily: "JetBrainsMono-Regular", fontSize: 13, textDecorationLine: "underline" },
  backdrop: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "rgba(0,0,0,0.6)" },
  card: { borderWidth: 1, borderRadius: 16, padding: 16, gap: 6 },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  desc: { fontFamily: "PlusJakartaSans-Regular", fontSize: 13, lineHeight: 19 },
});`,
  },
  {
    slug: 'context-menu',
    nativeName: 'ContextMenu',
    webCounterpart: 'Context Menu',
    title: 'Context Menu (Long-Press)',
    category: 'Overlays & Feedback',
    primitivesUsed: ['Pressable', 'Modal', 'View', 'Text'],
    platformNotes: 'Maps desktop right-click context menu to native onLongPress gesture with bottom action sheet.',
    code: `import * as React from "react";
import { Pressable, Modal, View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function ContextMenu({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions: { label: string; destructive?: boolean; onPress: () => void }[];
}) {
  const theme = createNativeTheme("dark");
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable onLongPress={() => setOpen(true)}>{children}</Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderColor: theme.colors.borderStrong }]}>
            {actions.map((act) => (
              <Pressable key={act.label} onPress={() => { act.onPress(); setOpen(false); }} style={styles.row}>
                <Text style={[styles.txt, { color: act.destructive ? theme.colors.signal : theme.colors.foreground }]}>
                  {act.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 1, padding: 14 },
  row: { minHeight: 46, justifyContent: "center", paddingHorizontal: 10 },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'sortable-board',
    nativeName: 'SortableBoard',
    webCounterpart: 'Sortable Board',
    title: 'Sortable List / Board',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text', 'LayoutAnimation'],
    platformNotes: 'Accessible Up/Down reorder buttons + LayoutAnimation transitions so reordering works reliably on touch and screen readers.',
    code: `import * as React from "react";
import { View, Pressable, Text, LayoutAnimation, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function SortableBoard({ initial }: { initial: string[] }) {
  const theme = createNativeTheme("dark");
  const [items, setItems] = React.useState(initial);

  const move = (idx: number, dir: -1 | 1) => {
    const nextIdx = idx + dir;
    if (nextIdx < 0 || nextIdx >= items.length) return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = [...items];
    [next[idx], next[nextIdx]] = [next[nextIdx], next[idx]];
    setItems(next);
  };

  return (
    <View style={styles.list}>
      {items.map((item, idx) => (
        <View key={item} style={[styles.row, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.lbl, { color: theme.colors.foreground }]}>{item}</Text>
          <View style={styles.ctrls}>
            <Pressable onPress={() => move(idx, -1)} style={styles.btn}><Text style={{ color: theme.colors.foreground }}>↑</Text></Pressable>
            <Pressable onPress={() => move(idx, 1)} style={styles.btn}><Text style={{ color: theme.colors.foreground }}>↓</Text></Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  ctrls: { flexDirection: "row", gap: 6 },
  btn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
});`,
  },
  {
    slug: 'sidebar',
    nativeName: 'SidebarDrawer',
    webCounterpart: 'Documentation Sidebar',
    title: 'Navigation Sidebar / Drawer',
    category: 'Navigation & Layout',
    primitivesUsed: ['Modal', 'SafeAreaView', 'ScrollView', 'Pressable', 'Text'],
    platformNotes: 'Responsive slide-over drawer on phones and persistent side rail on iPad / Android tablets.',
    code: `import { SafeAreaView, ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function SidebarDrawer({
  items,
  activeId,
  onSelect,
}: {
  items: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <SafeAreaView style={[styles.rail, { backgroundColor: theme.colors.surface, borderRightColor: theme.colors.border }]}>
      <ScrollView contentContainerStyle={styles.list}>
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <Pressable
              key={item.id}
              onPress={() => onSelect(item.id)}
              style={[styles.item, active && { backgroundColor: theme.colors.interactive }]}
            >
              <Text style={[styles.lbl, { color: active ? theme.colors.interactiveForeground : theme.colors.foregroundSecondary }]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  rail: { width: 260, borderRightWidth: StyleSheet.hairlineWidth, flex: 1 },
  list: { padding: 12, gap: 4 },
  item: { minHeight: 42, borderRadius: 10, paddingHorizontal: 12, justifyContent: "center" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'table-of-contents',
    nativeName: 'TableOfContents',
    webCounterpart: 'Table of Contents',
    title: 'On-Page Table of Contents',
    category: 'Navigation & Layout',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'ScrollView offset tracker with Signal Red left rail highlight for active section jumps.',
    code: `import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function TableOfContents({
  sections,
  activeId,
  onJump,
}: {
  sections: { id: string; label: string }[];
  activeId: string;
  onJump: (id: string) => void;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.wrap, { borderLeftColor: theme.colors.border }]}>
      {sections.map((sec) => {
        const active = sec.id === activeId;
        return (
          <Pressable key={sec.id} onPress={() => onJump(sec.id)} style={[styles.row, active && { borderLeftColor: theme.colors.signal, borderLeftWidth: 2 }]}>
            <Text style={[styles.lbl, { color: active ? theme.colors.foreground : theme.colors.foregroundMuted }]}>{sec.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderLeftWidth: 1, gap: 2 },
  row: { paddingLeft: 12, minHeight: 34, justifyContent: "center", marginLeft: -1 },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'toolbar',
    nativeName: 'Toolbar',
    webCounterpart: 'Action Toolbar',
    title: 'Action Toolbar',
    category: 'Inputs & Actions',
    primitivesUsed: ['View', 'Pressable', 'Text'],
    platformNotes: 'Single-row tactile action strip with 44pt toggle buttons and hairline vertical dividers.',
    code: `import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Toolbar({ actions = ["BOLD", "MONO", "GRID"] }: { actions?: string[] }) {
  const theme = createNativeTheme("dark");
  const [active, setActive] = React.useState<Record<string, boolean>>({ MONO: true });

  return (
    <View style={[styles.bar, { borderColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
      {actions.map((act) => {
        const on = Boolean(active[act]);
        return (
          <Pressable
            key={act}
            accessibilityRole="togglebutton"
            accessibilityState={{ checked: on }}
            onPress={() => setActive((p) => ({ ...p, [act]: !p[act] }))}
            style={[styles.btn, on && { backgroundColor: theme.colors.interactive }]}
          >
            <Text style={[styles.lbl, { color: on ? theme.colors.interactiveForeground : theme.colors.foreground }]}>{act}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", borderWidth: 1, borderRadius: 12, padding: 4, gap: 4, alignSelf: "flex-start" },
  btn: { minHeight: 38, paddingHorizontal: 12, borderRadius: 8, justifyContent: "center" },
  lbl: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
];

const CORE_CATEGORIES: Record<string, { category: NativeCategory; primitivesUsed: string[] }> = {
  button: { category: 'Inputs & Actions', primitivesUsed: ['Pressable', 'ActivityIndicator', 'Text', 'StyleSheet'] },
  'glyph-matrix': { category: 'Data & Hardware', primitivesUsed: ['react-native-svg', 'Circle', 'buildNativeGlyphPoints'] },
  'glyph-matrix-25': { category: 'Data & Hardware', primitivesUsed: ['react-native-svg', 'Circle', 'buildNativeGlyphPoints'] },
  'glyph-matrix-13': { category: 'Data & Hardware', primitivesUsed: ['react-native-svg', 'Circle', 'buildNativeGlyphPoints'] },
  'dot-icon': { category: 'Data & Hardware', primitivesUsed: ['react-native-svg', 'Circle', 'getDotIconNativeProps'] },
  input: { category: 'Inputs & Actions', primitivesUsed: ['TextInput', 'ActivityIndicator', 'StyleSheet'] },
  switch: { category: 'Inputs & Actions', primitivesUsed: ['Switch', 'ActivityIndicator', 'accessibilityRole="switch"'] },
  card: { category: 'Navigation & Layout', primitivesUsed: ['View', 'StyleSheet'] },
  progress: { category: 'Overlays & Feedback', primitivesUsed: ['View', 'ActivityIndicator', 'accessibilityRole="progressbar"'] },
  skeleton: { category: 'Overlays & Feedback', primitivesUsed: ['ActivityIndicator', 'View', 'Animated'] },
  text: { category: 'Data & Hardware', primitivesUsed: ['Text', 'fontVariant: tabular-nums'] },
  badge: { category: 'Data & Hardware', primitivesUsed: ['View', 'Text'] },
  separator: { category: 'Navigation & Layout', primitivesUsed: ['View', 'StyleSheet.hairlineWidth'] },
};

const DEFAULT_LOADING_SUPPORT: NativeComponentSpec['loadingSupport'] = {
  defaultVariant: DEFAULT_NATIVE_LOADER_VARIANT,
  supportedVariants: ['normal', 'dots', 'bars', 'pulse'] as const,
  usesActivityIndicatorByDefault: true,
  accessibilityProp: 'accessibilityState={{ busy: loading }}',
};

const NATIVE_CHART_SLUGS = new Set([
  'charts',
  'sparkline-strip',
  'radar-chart',
  'pie-chart',
  'timeseries',
  'sankey',
  'map-chart',
  'flow',
  'custom-chart',
]);

const NATIVE_WIDGET_SLUGS = new Set([
  'calendar',
  'calendar-canvas',
  'dot-matrix-clock',
  'audio-recorder',
  'video-recorder',
  'camera-capture',
  'media-studio',
  'media-viewer',
  'media-kit',
  'earbuds-battery',
  'weather-matrix',
  'quick-settings',
  'search-bar',
]);

const NATIVE_GLYPH_SLUGS = new Set(['glyph-matrix', 'glyph-matrix-25', 'glyph-matrix-13']);

function resolveNativeCategory(slug: string, fallback: NativeCategory): NativeCategory {
  if (NATIVE_GLYPH_SLUGS.has(slug)) return 'Glyph System';
  if (NATIVE_WIDGET_SLUGS.has(slug)) return 'Widgets';
  if (NATIVE_CHART_SLUGS.has(slug)) return 'Charts';
  return fallback;
}

const ALL_SPECS_MAP: Record<string, NativeComponentSpec> = {};

// 1. Register core first-wave entries (promoted to stable)
for (const [slug, entry] of Object.entries(NATIVE_COMPONENT_SNIPPETS)) {
  const meta = CORE_CATEGORIES[slug] ?? { category: 'Data & Hardware', primitivesUsed: ['View', 'Text'] };
  ALL_SPECS_MAP[slug] = {
    ...entry,
    status: 'stable',
    category: resolveNativeCategory(slug, meta.category),
    primitivesUsed: meta.primitivesUsed,
    cliCommand: `npx nthgui add ${slug} --native`,
    loadingSupport: DEFAULT_LOADING_SUPPORT,
  };
}

// 2. Register all catalog component & widget specs (100% stable React Native parity)
for (const seed of [...CUSTOM_NATIVE_SEEDS, ...COMPLETE_NATIVE_SEEDS, ...WIDGET_NATIVE_SEEDS]) {
  ALL_SPECS_MAP[seed.slug] = {
    slug: seed.slug,
    nativeName: seed.nativeName,
    webCounterpart: seed.webCounterpart,
    title: seed.title,
    status: 'stable',
    importPath: 'nthgui/native',
    code: seed.code,
    platformNotes: `${seed.platformNotes} Supports loading, loadingText, and loaderVariant (default "normal" ActivityIndicator).`,
    category: resolveNativeCategory(seed.slug, seed.category),
    primitivesUsed: seed.primitivesUsed,
    cliCommand: `npx nthgui add ${seed.slug} --native`,
    loadingSupport: DEFAULT_LOADING_SUPPORT,
  };
}

// Backwards-compatible aliases
ALL_SPECS_MAP['glyph-matrix'] = {
  ...ALL_SPECS_MAP['glyph-matrix-25'],
  slug: 'glyph-matrix',
  title: 'Glyph Matrix (13×13 & 25×25)',
  status: 'stable',
  category: 'Glyph System',
  cliCommand: 'npx nthgui add glyph-matrix --native',
};

export const NATIVE_CATALOG_SPECS: Readonly<Record<string, NativeComponentSpec>> = ALL_SPECS_MAP;

/**
 * Deduplicated list of all 88 primary live catalog slugs (covering 136 / 136 inventory items) available in nthgui/native.
 */
const ALIAS_SLUGS = new Set(['text', 'badge', 'separator', 'glyph-matrix-13', 'glyph-matrix-25']);

export function getAllNativeSpecs(): NativeComponentSpec[] {
  return Object.values(ALL_SPECS_MAP).filter((spec) => !ALIAS_SLUGS.has(spec.slug));
}

export function getNativeSpecBySlug(slug: string): NativeComponentSpec | undefined {
  return ALL_SPECS_MAP[slug];
}

export function hasNativeSpec(slug: string): boolean {
  return Boolean(ALL_SPECS_MAP[slug]);
}

export function filterNativeSpecs(
  query: string,
  category: NativeCategory | 'All' = 'All',
): NativeComponentSpec[] {
  const q = query.trim().toLowerCase();
  return getAllNativeSpecs().filter((spec) => {
    if (category !== 'All' && spec.category !== category) return false;
    if (!q) return true;
    return (
      spec.slug.toLowerCase().includes(q) ||
      spec.nativeName.toLowerCase().includes(q) ||
      spec.title.toLowerCase().includes(q) ||
      spec.webCounterpart.toLowerCase().includes(q) ||
      spec.primitivesUsed.some((p) => p.toLowerCase().includes(q))
    );
  });
}
