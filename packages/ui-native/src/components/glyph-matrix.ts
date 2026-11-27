import { getPreset, type GlyphCellState, type GlyphPresetId, type GlyphResolution } from '@nothing-ui/core';
import { createNativeTheme } from '../styles/theme';

export interface NativeGlyphPoint {
  index: number;
  cx: number;
  cy: number;
  r: number;
  fill: string;
  state: Exclude<GlyphCellState, 'void'>;
}

/**
 * Pure React Native SVG layout projection for GlyphMatrix13 and GlyphMatrix25.
 * Shares exact circular mask coordinates from @nothing-ui/core without DOM coupling.
 */
export function buildNativeGlyphPoints({
  resolution = 25,
  preset = 'power',
  cells,
  mode = 'dark',
}: {
  resolution?: GlyphResolution;
  preset?: GlyphPresetId;
  cells?: readonly GlyphCellState[];
  mode?: 'light' | 'dark' | 'high-contrast';
}): { viewBoxSize: number; points: NativeGlyphPoint[] } {
  const theme = createNativeTheme(mode);
  const activeCells =
    cells && cells.length === resolution * resolution ? cells : getPreset(preset, resolution);
  const viewBoxSize = resolution * 10;
  const r = resolution === 13 ? 3.35 : 3.15;
  const points: NativeGlyphPoint[] = [];

  for (let i = 0; i < activeCells.length; i++) {
    const state = activeCells[i];
    if (state === 'void') continue;
    const x = i % resolution;
    const y = Math.floor(i / resolution);
    const fill =
      state === 'signal'
        ? theme.colors.signal
        : state === 'on'
          ? '#FFFFFF'
          : 'rgba(255,255,255,0.14)';
    points.push({
      index: i,
      cx: x * 10 + 5,
      cy: y * 10 + 5,
      r,
      fill,
      state,
    });
  }

  return { viewBoxSize, points };
}

export interface NativeSnippetEntry {
  slug: string;
  nativeName: string;
  webCounterpart: string;
  title: string;
  status: 'stable' | 'beta' | 'alpha' | 'planned';
  importPath: string;
  code: string;
  platformNotes: string;
}

export const NATIVE_COMPONENT_SNIPPETS: Record<string, NativeSnippetEntry> = {
  text: {
    slug: 'text',
    nativeName: 'Text',
    webCounterpart: 'Typography',
    title: 'Text (Typography)',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Maps Doto display, Plus Jakarta Sans body, and JetBrains Mono metrics with tabular-nums fontVariant on iOS & Android.',
    code: `import { Text as RNText } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Text({ variant = "body", children }: { variant?: "display" | "body" | "mono"; children: string }) {
  const theme = createNativeTheme("dark");
  const fontFamily = variant === "display" ? "Doto-Regular" : variant === "mono" ? "JetBrainsMono-Regular" : "PlusJakartaSans-Regular";
  return (
    <RNText style={{ fontFamily, color: theme.colors.foreground, fontVariant: ["tabular-nums"] }}>
      {children}
    </RNText>
  );
}`,
  },
  button: {
    slug: 'button',
    nativeName: 'Button',
    webCounterpart: 'Button',
    title: 'Button',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Uses Pressable with 44pt minimum touch target, ActivityIndicator default ("normal") or configurable loaderVariant ("dots" | "bars" | "pulse"), and accessibilityState={{ busy: loading }}.',
    code: `import { ActivityIndicator, Pressable, Text, View, StyleSheet } from "react-native";
import { createNativeTheme, type NativeLoaderVariant } from "nthgui/native";

export function Button({
  label,
  variant = "primary",
  loading = false,
  loadingText,
  loaderVariant = "normal",
  onPress,
}: {
  label: string;
  variant?: "primary" | "outline" | "signal";
  loading?: boolean;
  loadingText?: string;
  loaderVariant?: NativeLoaderVariant;
  onPress?: () => void;
}) {
  const theme = createNativeTheme("dark");
  const isSignal = variant === "signal";
  const isOutline = variant === "outline";
  const fg = isOutline ? theme.colors.foreground : theme.colors.interactiveForeground;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: loading, busy: loading }}
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: isSignal ? theme.colors.signal : isOutline ? "transparent" : theme.colors.interactive,
          borderColor: isOutline ? theme.colors.borderStrong : "transparent",
          opacity: loading ? 0.8 : pressed ? 0.86 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        {loading && (
          loaderVariant === "normal" ? (
            <ActivityIndicator size="small" color={fg} />
          ) : (
            <Text style={[styles.label, { color: fg }]}>{loaderVariant === "dots" ? "•••" : "|||"}</Text>
          )
        )}
        <Text style={[styles.label, { color: fg }]}>
          {loading && loadingText ? loadingText : label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 44, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  label: { fontFamily: "JetBrainsMono-Regular", fontSize: 13, letterSpacing: 0.4 },
});`,
  },
  card: {
    slug: 'card',
    nativeName: 'Card',
    webCounterpart: 'Card',
    title: 'Card',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Hairline border surface card using OLED #111111 dark or #FFFFFF light paper tokens.',
    code: `import { View } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Card({ children }: { children: React.ReactNode }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderWidth: 1, borderRadius: 16, padding: 16 }}>
      {children}
    </View>
  );
}`,
  },
  input: {
    slug: 'input',
    nativeName: 'Input',
    webCounterpart: 'Input',
    title: 'Input',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Accessible TextInput with focus hairline border, trailing ActivityIndicator when loading, and Signal Red validation state.',
    code: `import { ActivityIndicator, TextInput, View } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Input({
  value,
  onChangeText,
  placeholder,
  loading = false,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  loading?: boolean;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View
      accessibilityState={{ busy: loading }}
      style={{
        height: 44,
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.borderStrong,
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 12,
        gap: 8,
      }}
    >
      <TextInput
        value={value}
        editable={!loading}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.foregroundMuted}
        style={{ flex: 1, color: theme.colors.foreground, fontFamily: "JetBrainsMono-Regular" }}
      />
      {loading && <ActivityIndicator size="small" color={theme.colors.foregroundMuted} />}
    </View>
  );
}`,
  },
  badge: {
    slug: 'badge',
    nativeName: 'Badge',
    webCounterpart: 'Badge',
    title: 'Badge',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Compact monochrome or Signal Red status cue designed for inline metadata and hardware tags.',
    code: `import { View, Text } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Badge({ label, signal = false }: { label: string; signal?: boolean }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={{ alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: signal ? theme.colors.signal : theme.colors.surfaceRaised }}>
      <Text style={{ fontFamily: "JetBrainsMono-Regular", fontSize: 11, color: signal ? "#FFFFFF" : theme.colors.foreground }}>
        {label}
      </Text>
    </View>
  );
}`,
  },
  separator: {
    slug: 'separator',
    nativeName: 'Separator',
    webCounterpart: 'Separator',
    title: 'Separator',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Uses StyleSheet.hairlineWidth for razor-sharp 1 physical pixel dividers on retina displays.',
    code: `import { View, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Separator() {
  const theme = createNativeTheme("dark");
  return <View accessibilityRole="none" style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.border }} />;
}`,
  },
  switch: {
    slug: 'switch',
    nativeName: 'Switch',
    webCounterpart: 'Switch',
    title: 'Switch',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Tactile hardware toggle honoring accessibilityRole="switch", inline ActivityIndicator when loading, and Signal Red critical channel tint.',
    code: `import { ActivityIndicator, Switch as RNSwitch, View } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Switch({
  value,
  onValueChange,
  signal = false,
  loading = false,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  signal?: boolean;
  loading?: boolean;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }} accessibilityState={{ busy: loading }}>
      <RNSwitch
        value={value}
        disabled={loading}
        onValueChange={onValueChange}
        trackColor={{ false: theme.colors.borderStrong, true: signal ? theme.colors.signal : theme.colors.interactive }}
        thumbColor={value && !signal ? theme.colors.interactiveForeground : "#FFFFFF"}
      />
      {loading && <ActivityIndicator size="small" color={theme.colors.foregroundMuted} />}
    </View>
  );
}`,
  },
  progress: {
    slug: 'progress',
    nativeName: 'Progress',
    webCounterpart: 'Progress',
    title: 'Progress',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Linear progress bar supporting determinate value and indeterminate loading mode with ActivityIndicator fallback.',
    code: `import { ActivityIndicator, View } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function Progress({ value = 64, signal = false, loading = false }: { value?: number; signal?: boolean; loading?: boolean }) {
  const theme = createNativeTheme("dark");
  const clamped = Math.max(0, Math.min(100, value));
  if (loading) {
    return (
      <View accessibilityRole="progressbar" accessibilityState={{ busy: true }} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <ActivityIndicator size="small" color={signal ? theme.colors.signal : theme.colors.foreground} />
      </View>
    );
  }
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: clamped }} style={{ height: 6, borderRadius: 999, backgroundColor: theme.colors.border, overflow: "hidden" }}>
      <View style={{ width: \`\${clamped}%\`, height: "100%", backgroundColor: signal ? theme.colors.signal : theme.colors.foreground }} />
    </View>
  );
}`,
  },
  skeleton: {
    slug: 'skeleton',
    nativeName: 'Skeleton & Loader',
    webCounterpart: 'Skeleton, Dot Loader & Empty',
    title: 'Skeleton & Configurable Loader',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Configurable NativeLoader defaulting to standard ActivityIndicator ("normal") with opt-in "dots" | "bars" | "pulse" variants and reduced-motion-safe Skeleton block.',
    code: `import { ActivityIndicator, Text, View } from "react-native";
import { createNativeTheme, type NativeLoaderVariant } from "nthgui/native";

export function Loader({
  variant = "normal",
  label = "Loading",
}: {
  variant?: NativeLoaderVariant;
  label?: string;
}) {
  const theme = createNativeTheme("dark");
  return (
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityState={{ busy: true }}>
      {variant === "normal" ? (
        <ActivityIndicator size="small" color={theme.colors.foreground} />
      ) : (
        <Text style={{ fontFamily: "JetBrainsMono-Regular", fontSize: 12, color: theme.colors.foreground }}>
          {variant === "dots" ? "•••" : variant === "bars" ? "|||" : "◯"}
        </Text>
      )}
    </View>
  );
}

export function Skeleton({ width = "100%", height = 16, radius = 8 }: { width?: number | string; height?: number; radius?: number }) {
  const theme = createNativeTheme("dark");
  return <View style={{ width: width as any, height, borderRadius: radius, backgroundColor: theme.colors.surfaceRaised }} />;
}`,
  },
  'glyph-matrix-13': {
    slug: 'glyph-matrix-13',
    nativeName: 'GlyphMatrix13',
    webCounterpart: 'GlyphMatrix13',
    title: 'GlyphMatrix13 (13×13 · 121 LEDs)',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Renders exact 121-dot circular mask from @nothing-ui/core via react-native-svg with zero web DOM coupling.',
    code: `import Svg, { Circle } from "react-native-svg";
import { buildNativeGlyphPoints } from "nthgui/native";

export function GlyphMatrix13({ preset = "heart", size = 160 }: { preset?: "power" | "heart" | "live" | "play"; size?: number }) {
  const { viewBoxSize, points } = buildNativeGlyphPoints({ resolution: 13, preset });
  return (
    <Svg width={size} height={size} viewBox={\`0 0 \${viewBoxSize} \${viewBoxSize}\`}>
      <Circle cx={viewBoxSize / 2} cy={viewBoxSize / 2} r={viewBoxSize / 2 - 1} fill="#080808" />
      {points.map((pt) => (
        <Circle key={pt.index} cx={pt.cx} cy={pt.cy} r={pt.r} fill={pt.fill} />
      ))}
    </Svg>
  );
}`,
  },
  'glyph-matrix-25': {
    slug: 'glyph-matrix-25',
    nativeName: 'GlyphMatrix25',
    webCounterpart: 'GlyphMatrix25',
    title: 'GlyphMatrix25 (25×25 · 481 LEDs)',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Full Phone (3) 25×25 circular LED matrix (481 addressable, 144 void) rendered natively via react-native-svg.',
    code: `import Svg, { Circle } from "react-native-svg";
import { buildNativeGlyphPoints } from "nthgui/native";

export function GlyphMatrix25({ preset = "power", size = 220 }: { preset?: "power" | "heart" | "live" | "play"; size?: number }) {
  const { viewBoxSize, points } = buildNativeGlyphPoints({ resolution: 25, preset });
  return (
    <Svg width={size} height={size} viewBox={\`0 0 \${viewBoxSize} \${viewBoxSize}\`}>
      <Circle cx={viewBoxSize / 2} cy={viewBoxSize / 2} r={viewBoxSize / 2 - 1} fill="#080808" />
      {points.map((pt) => (
        <Circle key={pt.index} cx={pt.cx} cy={pt.cy} r={pt.r} fill={pt.fill} />
      ))}
    </Svg>
  );
}`,
  },
  'dot-icon': {
    slug: 'dot-icon',
    nativeName: 'DotIcon',
    webCounterpart: 'DotIcon',
    title: 'DotIcon (9×9 Bitmap Pack)',
    status: 'beta',
    importPath: 'nthgui/native',
    platformNotes: 'Driven by the exact same 35 9×9 bitmap definitions bundled in nthgui (including map-pin alias).',
    code: `import Svg, { Circle } from "react-native-svg";
import { getDotIconNativeProps } from "nthgui/native";

export function DotIcon({ name = "wifi", size = 24, color = "#FFFFFF" }: { name?: string; size?: number; color?: string }) {
  const { viewBox, circles } = getDotIconNativeProps(name as any, { size, color });
  return (
    <Svg width={size} height={size} viewBox={viewBox}>
      {circles.map((c, idx) => (
        <Circle key={idx} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill} />
      ))}
    </Svg>
  );
}`,
  },
};

// Backwards-compatible alias for earlier slug references
NATIVE_COMPONENT_SNIPPETS['glyph-matrix'] = NATIVE_COMPONENT_SNIPPETS['glyph-matrix-25'];
