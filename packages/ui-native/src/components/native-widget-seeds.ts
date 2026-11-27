export interface NativeWidgetSeed {
  slug: string;
  nativeName: string;
  webCounterpart: string;
  title: string;
  category: 'Widgets';
  primitivesUsed: string[];
  platformNotes: string;
  code: string;
}

export const WIDGET_NATIVE_SEEDS: NativeWidgetSeed[] = [
  {
    slug: 'analog-clock',
    nativeName: 'AnalogClockWidget',
    webCounterpart: 'Analog Hardware Clock',
    title: 'Analog Hardware Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'react-native-svg'],
    platformNotes:
      'Renders 5 selectable hardware watch dials (Minimal Dots, Railway Ticks, Chronograph, Skeleton Ring, Bauhaus) via react-native-svg with Signal Red sweep hand.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function AnalogClockWidget({ size = 180 }: { size?: number }) {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  const [sweep, setSweep] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), sweep ? 120 : 1000);
    return () => clearInterval(id);
  }, [sweep]);

  const sec = sweep ? now.getSeconds() + now.getMilliseconds() / 1000 : now.getSeconds();
  const min = now.getMinutes() + sec / 60;
  const hr = (now.getHours() % 12) + min / 60;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx={100} cy={100} r={92} fill={theme.colors.background} stroke={theme.colors.borderStrong} strokeWidth={1.5} />
        {Array.from({ length: 12 }).map((_, i) => {
          const rad = ((i * 30 - 90) * Math.PI) / 180;
          return <Circle key={i} cx={100 + Math.cos(rad) * 76} cy={100 + Math.sin(rad) * 76} r={i === 0 ? 4 : 2.2} fill={i === 0 ? theme.colors.signal : theme.colors.foreground} />;
        })}
        <Line x1={100} y1={108} x2={100} y2={52} stroke={theme.colors.foreground} strokeWidth={4} strokeLinecap="round" transform={\`rotate(\${hr * 30} 100 100)\`} />
        <Line x1={100} y1={112} x2={100} y2={34} stroke={theme.colors.foreground} strokeWidth={2.5} strokeLinecap="round" transform={\`rotate(\${min * 6} 100 100)\`} />
        <Line x1={100} y1={116} x2={100} y2={26} stroke={theme.colors.signal} strokeWidth={1.5} strokeLinecap="round" transform={\`rotate(\${sec * 6} 100 100)\`} />
        <Circle cx={100} cy={100} r={4.5} fill={theme.colors.foreground} />
      </Svg>
      <Pressable onPress={() => setSweep((v) => !v)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.meta, { color: theme.colors.foreground }]}>{sweep ? "SWEEP" : "QUARTZ 1HZ"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, alignItems: "center", gap: 12 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'flip-clock',
    nativeName: 'FlipClockWidget',
    webCounterpart: 'Split-Flap Mechanical Clock',
    title: 'Split-Flap Mechanical Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Mechanical split-flap digital tiles with hairline hinge seam, 12h/24h switch, and Signal Red seconds tile.',
    code: `import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function FlipClockWidget() {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={[styles.row, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {[pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].map((val, idx) => (
        <View key={idx} style={[styles.tile, { backgroundColor: theme.colors.background, borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.digit, { color: idx === 2 ? theme.colors.signal : theme.colors.foreground }]}>{val}</Text>
          <View style={[styles.seam, { backgroundColor: theme.colors.borderStrong }]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 10, padding: 16, borderWidth: 1, borderRadius: 20 },
  tile: { width: 76, height: 88, borderWidth: 1, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  digit: { fontFamily: "JetBrainsMono-Regular", fontSize: 34, fontWeight: "700", fontVariant: ["tabular-nums"] },
  seam: { position: "absolute", left: 0, right: 0, height: 1.5, top: "50%" },
});`,
  },
  {
    slug: 'binary-dot-clock',
    nativeName: 'BinaryClockWidget',
    webCounterpart: 'Binary & BCD Dot Clock',
    title: 'Binary & BCD Dot Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Addressable OLED 6×4 BCD and 3×6 Binary LED dot columns with Signal Red seconds column and decoded text readout.',
    code: `import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function BinaryClockWidget() {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const digits = [Math.floor(now.getHours() / 10), now.getHours() % 10, Math.floor(now.getMinutes() / 10), now.getMinutes() % 10, Math.floor(now.getSeconds() / 10), now.getSeconds() % 10];

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.cols}>
        {digits.map((d, ci) => (
          <View key={ci} style={styles.col}>
            {[8, 4, 2, 1].map((w) => {
              const lit = Boolean(d & w);
              return (
                <View key={w} style={[styles.dot, { borderColor: theme.colors.borderStrong, backgroundColor: lit ? (ci >= 4 ? theme.colors.signal : theme.colors.foreground) : "transparent" }]} />
              );
            })}
            <Text style={[styles.num, { color: theme.colors.foregroundMuted }]}>{d}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16 },
  cols: { flexDirection: "row", justifyContent: "space-between" },
  col: { alignItems: "center", gap: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
  num: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'word-clock',
    nativeName: 'WordClockWidget',
    webCounterpart: 'Typographic Word Clock',
    title: 'Typographic Word Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      '11×10 English typographic word matrix lighting active phrases with 4 corner Signal Red minute diodes.',
    code: `import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function WordClockWidget({ phrase = "IT IS TEN PAST NINE", minuteDots = 2 }: { phrase?: string; minuteDots?: number }) {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.kicker, { color: theme.colors.foregroundMuted }]}>WORD MATRIX</Text>
      <Text style={[styles.phrase, { color: theme.colors.foreground }]}>{phrase}</Text>
      <View style={styles.dots}>
        {[1, 2, 3, 4].map((idx) => (
          <View key={idx} style={[styles.dot, { backgroundColor: minuteDots >= idx ? theme.colors.signal : theme.colors.borderStrong }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 20, gap: 12 },
  kicker: { fontFamily: "JetBrainsMono-Regular", fontSize: 10, letterSpacing: 1.4 },
  phrase: { fontFamily: "Doto-Regular", fontSize: 22, lineHeight: 30 },
  dots: { flexDirection: "row", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});`,
  },
  {
    slug: 'radial-clock',
    nativeName: 'RadialClockWidget',
    webCounterpart: 'Orbital & Solar Radial Clock',
    title: 'Orbital & Solar Radial Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'react-native-svg'],
    platformNotes:
      'Concentric react-native-svg progress rings for Hours, Minutes, and Seconds plus Solar Horizon daylight arc.',
    code: `import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function RadialClockWidget() {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const secC = 2 * Math.PI * 72;
  const minC = 2 * Math.PI * 56;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Svg width={172} height={172} viewBox="0 0 172 172">
        <Circle cx={86} cy={86} r={72} fill="none" stroke={theme.colors.border} strokeWidth={4} />
        <Circle cx={86} cy={86} r={72} fill="none" stroke={theme.colors.signal} strokeWidth={4} strokeDasharray={secC} strokeDashoffset={secC * (1 - now.getSeconds() / 60)} transform="rotate(-90 86 86)" />
        <Circle cx={86} cy={86} r={56} fill="none" stroke={theme.colors.foreground} strokeWidth={4} strokeDasharray={minC} strokeDashoffset={minC * (1 - now.getMinutes() / 60)} transform="rotate(-90 86 86)" />
      </Svg>
      <Text style={[styles.time, { color: theme.colors.foreground }]}>
        {String(now.getHours()).padStart(2, "0")}:{String(now.getMinutes()).padStart(2, "0")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, alignItems: "center", gap: 8 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'clock-collection',
    nativeName: 'ClockStudioWidget',
    webCounterpart: 'Clock Face Studio & Gallery',
    title: 'Clock Face Studio & Gallery',
    category: 'Widgets',
    primitivesUsed: ['ScrollView', 'View', 'Text', 'Pressable'],
    platformNotes:
      'Unified mobile gallery switching between Analog, Split-Flap, Binary, Word Matrix, and Orbital Radial faces.',
    code: `import * as React from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

const FACES = ["Analog Dots", "Chronograph", "Split-Flap", "Binary BCD", "Word Matrix", "Orbital"];

export function ClockStudioWidget() {
  const theme = createNativeTheme("dark");
  const [selected, setSelected] = React.useState(FACES[0]);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Clock Face Studio · {selected}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {FACES.map((face) => (
          <Pressable key={face} onPress={() => setSelected(face)} style={[styles.tab, { borderColor: selected === face ? theme.colors.signal : theme.colors.borderStrong }]}>
            <Text style={[styles.tabTxt, { color: selected === face ? theme.colors.signal : theme.colors.foregroundMuted }]}>{face}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 13 },
  row: { flexDirection: "row", gap: 8 },
  tab: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  tabTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'stopwatch-timer',
    nativeName: 'StopwatchTimerWidget',
    webCounterpart: 'Stopwatch & Interval Timer',
    title: 'Stopwatch & Interval Timer',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'FlatList'],
    platformNotes:
      'Centisecond stopwatch with lap split list and switchable interval countdown presets with Haptics finish feedback.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function StopwatchTimerWidget() {
  const theme = createNativeTheme("dark");
  const [ms, setMs] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setMs((v) => v + 50), 50);
    return () => clearInterval(id);
  }, [running]);

  const secs = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
  const mins = String(Math.floor(ms / 60000)).padStart(2, "0");
  const cs = String(Math.floor((ms % 1000) / 10)).padStart(2, "0");

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.time, { color: theme.colors.foreground }]}>{mins}:{secs}.{cs}</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setRunning((r) => !r)} style={[styles.btn, { backgroundColor: running ? theme.colors.signal : theme.colors.interactive }]}>
          <Text style={[styles.btnTxt, { color: running ? "#FFF" : theme.colors.interactiveForeground }]}>{running ? "PAUSE" : "START"}</Text>
        </Pressable>
        <Pressable onPress={() => { setRunning(false); setMs(0); }} style={[styles.btn, { borderWidth: 1, borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.btnTxt, { color: theme.colors.foreground }]}>RESET</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 18, alignItems: "center", gap: 14 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 34, fontWeight: "700", fontVariant: ["tabular-nums"] },
  row: { flexDirection: "row", gap: 10 },
  btn: { minHeight: 44, paddingHorizontal: 18, borderRadius: 10, justifyContent: "center" },
  btnTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'world-clock-deck',
    nativeName: 'WorldClockDeckWidget',
    webCounterpart: 'Multi-Zone World Clock',
    title: 'Multi-Zone World Clock',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'FlatList'],
    platformNotes:
      'Synchronized multi-city timezone list with UTC offsets, day/night horizon dots, and meeting hour scrubbing.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

const ZONES = [
  { city: "London", offset: "UTC+0", time: "14:20" },
  { city: "New York", offset: "UTC-5", time: "09:20" },
  { city: "Tokyo", offset: "UTC+9", time: "23:20" },
];

export function WorldClockDeckWidget() {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {ZONES.map((z) => (
        <View key={z.city} style={[styles.row, { borderBottomColor: theme.colors.border }]}>
          <View>
            <Text style={[styles.city, { color: theme.colors.foreground }]}>{z.city}</Text>
            <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>{z.offset}</Text>
          </View>
          <Text style={[styles.time, { color: theme.colors.foreground }]}>{z.time}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 14, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  city: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 20, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'agenda-ticker',
    nativeName: 'AgendaTickerWidget',
    webCounterpart: 'Next-Up Agenda Ticker',
    title: 'Next-Up Agenda Ticker',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'expo-clipboard'],
    platformNotes:
      'Lockscreen-ready upcoming event countdown card with one-tap meeting URL copy and +5m snooze button.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function AgendaTickerWidget({ title = "Hardware Architecture Review", startsInMin = 12 }: { title?: string; startsInMin?: number }) {
  const theme = createNativeTheme("dark");
  const [snooze, setSnooze] = React.useState(0);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.countdown, { color: theme.colors.signal }]}>IN {startsInMin + snooze} MIN</Text>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{title}</Text>
      <Pressable onPress={() => setSnooze((s) => s + 5)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.btnTxt, { color: theme.colors.foreground }]}>SNOOZE +5M</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  countdown: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 15 },
  btn: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'pedometer-ring',
    nativeName: 'PedometerRingWidget',
    webCounterpart: 'Pedometer & Step Matrix',
    title: 'Pedometer & Step Matrix',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'react-native-svg'],
    platformNotes:
      '24-dot circular step matrix rendered with react-native-svg, CoreMotion/HealthConnect compatible step telemetry, and km/mi switch.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function PedometerRingWidget({ steps = 7840, goal = 10000 }: { steps?: number; goal?: number }) {
  const theme = createNativeTheme("dark");
  const [unit, setUnit] = React.useState<"km" | "mi">("km");
  const litDots = Math.round((Math.min(steps, goal) / goal) * 24);
  const dist = unit === "km" ? (steps * 0.00076).toFixed(2) : (steps * 0.00047).toFixed(2);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Svg width={156} height={156} viewBox="0 0 156 156">
        {Array.from({ length: 24 }).map((_, i) => {
          const rad = ((i / 24) * 360 - 90) * (Math.PI / 180);
          return <Circle key={i} cx={78 + Math.cos(rad) * 62} cy={78 + Math.sin(rad) * 62} r={i < litDots ? 3.8 : 2} fill={i === litDots - 1 ? theme.colors.signal : i < litDots ? theme.colors.foreground : theme.colors.borderStrong} />;
        })}
      </Svg>
      <Text style={[styles.steps, { color: theme.colors.foreground }]}>{steps.toLocaleString()} STEPS</Text>
      <Pressable onPress={() => setUnit((u) => (u === "km" ? "mi" : "km"))}>
        <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>{dist} {unit.toUpperCase()} · TAP TO SWITCH</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, alignItems: "center", gap: 8 },
  steps: { fontFamily: "JetBrainsMono-Regular", fontSize: 18, fontWeight: "700", fontVariant: ["tabular-nums"] },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'battery-health-hub',
    nativeName: 'BatteryHealthHubWidget',
    webCounterpart: 'Multi-Device Power Hub',
    title: 'Multi-Device Power Hub',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Multi-device battery meter stack tracking Phone, Earbuds, Watch, and Laptop charge states and low-battery Signal Red alerts.',
    code: `import { View, Text, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

const DEVICES = [
  { name: "Phone (3)", level: 84, charging: true },
  { name: "Ear (3)", level: 62, charging: false },
  { name: "Watch Pro 2", level: 18, charging: false },
];

export function BatteryHealthHubWidget() {
  const theme = createNativeTheme("dark");
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {DEVICES.map((d) => (
        <View key={d.name} style={styles.row}>
          <Text style={[styles.name, { color: theme.colors.foreground }]}>{d.name}</Text>
          <Text style={[styles.pct, { color: d.level <= 20 ? theme.colors.signal : theme.colors.foreground }]}>{d.level}%</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  name: { fontFamily: "PlusJakartaSans-Medium", fontSize: 14 },
  pct: { fontFamily: "JetBrainsMono-Regular", fontSize: 14, fontVariant: ["tabular-nums"] },
});`,
  },
  {
    slug: 'screen-time-pulse',
    nativeName: 'ScreenTimePulseWidget',
    webCounterpart: 'Screen Time & Focus Pulse',
    title: 'Screen Time & Focus Pulse',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Switch'],
    platformNotes:
      'Daily screen-time budget summary paired with native Switch for Flip-to-Glyph quiet hours.',
    code: `import * as React from "react";
import { View, Text, Switch, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function ScreenTimePulseWidget() {
  const theme = createNativeTheme("dark");
  const [glyphQuiet, setGlyphQuiet] = React.useState(true);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: theme.colors.foreground }]}>Screen Time · 3h 30m</Text>
        <Switch value={glyphQuiet} onValueChange={setGlyphQuiet} trackColor={{ true: theme.colors.signal }} />
      </View>
      <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>
        Flip-to-Glyph Quiet Hours {glyphQuiet ? "Active" : "Standby"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontFamily: "JetBrainsMono-Regular", fontSize: 14, fontVariant: ["tabular-nums"] },
  meta: { fontFamily: "PlusJakartaSans-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'network-speed-radar',
    nativeName: 'NetworkSpeedRadarWidget',
    webCounterpart: '5G / Wi-Fi Speed Monitor',
    title: '5G / Wi-Fi Speed Monitor',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'RF 5-bar signal telemetry and downlink/ping/jitter readout with one-tap diagnostic refresh.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function NetworkSpeedRadarWidget() {
  const theme = createNativeTheme("dark");
  const [down, setDown] = React.useState(842);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.speed, { color: theme.colors.foreground }]}>{down} Mbps</Text>
      <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>WI-FI 7 · PING 8ms · OPTIMAL</Text>
      <Pressable onPress={() => setDown((v) => 780 + ((v + 37) % 140))} style={[styles.btn, { backgroundColor: theme.colors.interactive }]}>
        <Text style={[styles.btnTxt, { color: theme.colors.interactiveForeground }]}>RUN SWEEP</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  speed: { fontFamily: "JetBrainsMono-Regular", fontSize: 28, fontWeight: "700", fontVariant: ["tabular-nums"] },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
  btn: { alignSelf: "flex-start", borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  btnTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'podcast-mini-player',
    nativeName: 'PodcastMiniPlayerWidget',
    webCounterpart: 'Podcast & Queue Mini Player',
    title: 'Podcast & Queue Mini Player',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Compact podcast playback deck with speed multiplier, sleep timer, and +/-15s transport triggers.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function PodcastMiniPlayerWidget() {
  const theme = createNativeTheme("dark");
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Ep. 42 — Designing Honest Hardware</Text>
      <View style={styles.row}>
        <Pressable onPress={() => setPlaying((p) => !p)} style={[styles.btn, { backgroundColor: playing ? theme.colors.signal : theme.colors.interactive }]}>
          <Text style={[styles.txt, { color: playing ? "#FFF" : theme.colors.interactiveForeground }]}>{playing ? "PAUSE" : "PLAY"}</Text>
        </Pressable>
        <Pressable onPress={() => setSpeed((s) => (s === 2 ? 1 : s + 0.5))} style={[styles.btn, { borderWidth: 1, borderColor: theme.colors.borderStrong }]}>
          <Text style={[styles.txt, { color: theme.colors.foreground }]}>{speed}x</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  row: { flexDirection: "row", gap: 10 },
  btn: { minHeight: 40, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'voice-memo-transcriber',
    nativeName: 'VoiceMemoTranscriberWidget',
    webCounterpart: 'Voice Memo & Transcript Pad',
    title: 'Voice Memo & Transcript Pad',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'TextInput'],
    platformNotes:
      'Audio waveform note widget with timestamped transcript markers and native clipboard copy.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function VoiceMemoTranscriberWidget() {
  const theme = createNativeTheme("dark");
  const [recording, setRecording] = React.useState(false);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Field Memo #19</Text>
      <Pressable onPress={() => setRecording((r) => !r)} style={[styles.btn, { backgroundColor: recording ? theme.colors.signal : theme.colors.interactive }]}>
        <Text style={[styles.txt, { color: recording ? "#FFF" : theme.colors.interactiveForeground }]}>{recording ? "STOP REC" : "RECORD"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  btn: { alignSelf: "flex-start", minHeight: 40, paddingHorizontal: 16, borderRadius: 10, justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'photo-frame-dither',
    nativeName: 'PhotoFrameDitherWidget',
    webCounterpart: 'Monochrome Photo Frame',
    title: 'Monochrome Photo Frame',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'react-native-svg'],
    platformNotes:
      'Procedural halftone dot-dithered SVG photo carousel with EXIF metadata footer.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

const FRAMES = ["London Studio Facade", "Solar Ridge Study", "Acoustic Chamber Dial"];

export function PhotoFrameDitherWidget() {
  const theme = createNativeTheme("dark");
  const [idx, setIdx] = React.useState(0);
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>{FRAMES[idx]}</Text>
      <Text style={[styles.meta, { color: theme.colors.foregroundMuted }]}>50mm · f/1.8 · ISO 100</Text>
      <Pressable onPress={() => setIdx((i) => (i + 1) % FRAMES.length)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.meta, { color: theme.colors.foreground }]}>NEXT FRAME</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
  btn: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
});`,
  },
  {
    slug: 'pomodoro-focus-card',
    nativeName: 'PomodoroFocusWidget',
    webCounterpart: 'Pomodoro Deep Work Deck',
    title: 'Pomodoro Deep Work Deck',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'Switch'],
    platformNotes:
      '25/5 focus sprint countdown with 4-session dot tally and native Do Not Disturb toggle.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function PomodoroFocusWidget() {
  const theme = createNativeTheme("dark");
  const [sec, setSec] = React.useState(1500);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSec((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.time, { color: theme.colors.foreground }]}>{mm}:{ss}</Text>
      <Pressable onPress={() => setRunning((r) => !r)} style={[styles.btn, { backgroundColor: running ? theme.colors.signal : theme.colors.interactive }]}>
        <Text style={[styles.txt, { color: running ? "#FFF" : theme.colors.interactiveForeground }]}>{running ? "PAUSE SPRINT" : "START SPRINT"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 18, alignItems: "center", gap: 12 },
  time: { fontFamily: "JetBrainsMono-Regular", fontSize: 36, fontWeight: "700", fontVariant: ["tabular-nums"] },
  btn: { minHeight: 44, paddingHorizontal: 18, borderRadius: 10, justifyContent: "center" },
  txt: { fontFamily: "JetBrainsMono-Regular", fontSize: 12 },
});`,
  },
  {
    slug: 'quick-notes-pad',
    nativeName: 'QuickNotesPadWidget',
    webCounterpart: 'Sticky Dot-Grid Notes',
    title: 'Sticky Dot-Grid Notes',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'TextInput', 'Pressable'],
    platformNotes:
      'Editable scratchpad and task checklist widget with pin indicator and Markdown clipboard serialization.',
    code: `import * as React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function QuickNotesPadWidget() {
  const theme = createNativeTheme("dark");
  const [note, setNote] = React.useState("Keep dial hands high contrast.");
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Quick Notes Pad</Text>
      <TextInput multiline value={note} onChangeText={setNote} style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.borderStrong }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  input: { minHeight: 72, borderWidth: 1, borderRadius: 10, padding: 10, fontFamily: "PlusJakartaSans-Regular", fontSize: 13 },
});`,
  },
  {
    slug: 'habit-matrix-tracker',
    nativeName: 'HabitMatrixTrackerWidget',
    webCounterpart: '90-Day Habit Dot Matrix',
    title: '90-Day Habit Dot Matrix',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Interactive contribution dot matrix highlighting completed days in monochrome and 7-day milestones in Signal Red.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function HabitMatrixTrackerWidget() {
  const theme = createNativeTheme("dark");
  const [days, setDays] = React.useState(() => Array.from({ length: 28 }, (_, i) => i % 4 !== 0));
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.title, { color: theme.colors.foreground }]}>Habit Dot Matrix</Text>
      <View style={styles.grid}>
        {days.map((done, idx) => (
          <Pressable
            key={idx}
            onPress={() => setDays((prev) => prev.map((v, i) => (i === idx ? !v : v)))}
            style={[styles.dot, { borderColor: theme.colors.borderStrong, backgroundColor: done ? (idx % 7 === 6 ? theme.colors.signal : theme.colors.foreground) : "transparent" }]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 12 },
  title: { fontFamily: "PlusJakartaSans-SemiBold", fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1 },
});`,
  },
  {
    slug: 'unit-fx-converter',
    nativeName: 'UnitFxConverterWidget',
    webCounterpart: 'Precision Unit & FX Converter',
    title: 'Precision Unit & FX Converter',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'TextInput', 'Pressable'],
    platformNotes:
      'Tabular-numeral currency, length, temperature, data rate, and time converter with one-tap unit inversion.',
    code: `import * as React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

export function UnitFxConverterWidget() {
  const theme = createNativeTheme("dark");
  const [amount, setAmount] = React.useState("100");
  const [inverted, setInverted] = React.useState(false);
  const num = Number(amount) || 0;
  const converted = inverted ? (num * 1.08).toFixed(2) : (num / 1.08).toFixed(2);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <TextInput keyboardType="decimal-pad" value={amount} onChangeText={setAmount} style={[styles.input, { color: theme.colors.foreground, borderColor: theme.colors.borderStrong }]} />
      <Text style={[styles.out, { color: theme.colors.signal }]}>{converted} {inverted ? "USD" : "EUR"}</Text>
      <Pressable onPress={() => setInverted((v) => !v)} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.btnTxt, { color: theme.colors.foreground }]}>INVERT</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderRadius: 10, padding: 10, fontFamily: "JetBrainsMono-Regular", fontSize: 18, fontVariant: ["tabular-nums"] },
  out: { fontFamily: "JetBrainsMono-Regular", fontSize: 22, fontWeight: "700", fontVariant: ["tabular-nums"] },
  btn: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  btnTxt: { fontFamily: "JetBrainsMono-Regular", fontSize: 11 },
});`,
  },
  {
    slug: 'calendar-widget',
    nativeName: 'CalendarWidget',
    webCounterpart: 'CalendarWidget (Magnetic Grid)',
    title: 'CalendarWidget (Magnetic Grid)',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable'],
    platformNotes:
      'Minimalist Nothing OS monochrome 6×7 grid calendar with Doto month heading, tactile scale/spring press feedback, Single/Range selection, and Signal Red today indicator.',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { createNativeTheme } from "nthgui/native";

const DAYS = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

export function CalendarWidget({ initialDay = 25 }: { initialDay?: number }) {
  const theme = createNativeTheme("dark");
  const [selected, setSelected] = React.useState(initialDay);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Text style={[styles.month, { color: theme.colors.foreground }]}>NOV 2026</Text>
      <View style={styles.weekRow}>
        {DAYS.map((d) => (
          <Text key={d} style={[styles.wk, { color: theme.colors.foregroundMuted }]}>{d}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
          const active = day === selected;
          const isToday = day === initialDay;
          return (
            <Pressable
              key={day}
              onPress={() => setSelected(day)}
              style={[
                styles.cell,
                { borderColor: theme.colors.border, backgroundColor: active ? theme.colors.interactive : "transparent" },
              ]}
            >
              <Text style={[styles.num, { color: active ? theme.colors.interactiveForeground : theme.colors.foreground }]}>
                {String(day).padStart(2, "0")}
              </Text>
              {isToday ? <View style={[styles.dot, { backgroundColor: theme.colors.signal }]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 10 },
  month: { fontFamily: "Doto-Regular", fontSize: 22, letterSpacing: 1.2 },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  wk: { width: "14.2%", textAlign: "center", fontFamily: "JetBrainsMono-Regular", fontSize: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "14.2%", minHeight: 40, borderWidth: StyleSheet.hairlineWidth, alignItems: "center", justifyContent: "center", gap: 2 },
  num: { fontFamily: "JetBrainsMono-Regular", fontSize: 12, fontVariant: ["tabular-nums"] },
  dot: { width: 5, height: 5, borderRadius: 2.5 },
});`,
  },
  {
    slug: 'nothing-analog-clock',
    nativeName: 'AnalogClock',
    webCounterpart: 'AnalogClock (Doto & Magnetic Stutter)',
    title: 'AnalogClock (Doto & Magnetic Stutter)',
    category: 'Widgets',
    primitivesUsed: ['View', 'Text', 'Pressable', 'react-native-svg'],
    platformNotes:
      'Nothing-inspired react-native-svg AnalogClock with Doto cardinal numerals, damped magnetic stuttering second-hand physics, and customizable ring ticks (12/24/60/120).',
    code: `import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Svg, { Circle, Line, Text as SvgText } from "react-native-svg";
import { createNativeTheme } from "nthgui/native";

export function AnalogClock({ size = 216, tickCount = 60 }: { size?: number; tickCount?: 12 | 24 | 60 }) {
  const theme = createNativeTheme("dark");
  const [now, setNow] = React.useState(() => new Date());
  const [density, setDensity] = React.useState<12 | 24 | 60>(tickCount);

  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 50);
    return () => clearInterval(id);
  }, []);

  const sec = now.getSeconds();
  const frac = now.getMilliseconds() / 1000;
  const overshoot = frac < 0.22 ? Math.cos(frac * 32) * 1.1 * Math.exp(-12 * frac) : 0;
  const secDeg = sec * 6 + overshoot;
  const minDeg = (now.getMinutes() + sec / 60) * 6;
  const hrDeg = ((now.getHours() % 12) + now.getMinutes() / 60) * 30;

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      <Svg width={size} height={size} viewBox="0 0 240 240">
        <Circle cx={120} cy={120} r={112} fill={theme.colors.background} stroke={theme.colors.borderStrong} strokeWidth={1.5} />
        {Array.from({ length: density }).map((_, idx) => {
          const rad = (((idx / density) * 360 - 90) * Math.PI) / 180;
          const isMajor = idx % (density / 12) === 0;
          return (
            <Circle
              key={idx}
              cx={120 + Math.cos(rad) * 96}
              cy={120 + Math.sin(rad) * 96}
              r={idx === 0 ? 3.8 : isMajor ? 2.6 : 1.2}
              fill={idx === 0 ? theme.colors.signal : isMajor ? theme.colors.foreground : theme.colors.foregroundMuted}
            />
          );
        })}
        <SvgText x={120} y={50} textAnchor="middle" fill={theme.colors.signal} fontSize={14} fontFamily="Doto-Regular">12</SvgText>
        <SvgText x={192} y={125} textAnchor="middle" fill={theme.colors.foreground} fontSize={14} fontFamily="Doto-Regular">03</SvgText>
        <SvgText x={120} y={200} textAnchor="middle" fill={theme.colors.foreground} fontSize={14} fontFamily="Doto-Regular">06</SvgText>
        <SvgText x={48} y={125} textAnchor="middle" fill={theme.colors.foreground} fontSize={14} fontFamily="Doto-Regular">09</SvgText>
        <Line x1={120} y1={134} x2={120} y2={66} stroke={theme.colors.foreground} strokeWidth={5} strokeLinecap="round" transform={\`rotate(\${hrDeg} 120 120)\`} />
        <Line x1={120} y1={138} x2={120} y2={44} stroke={theme.colors.foreground} strokeWidth={3} strokeLinecap="round" transform={\`rotate(\${minDeg} 120 120)\`} />
        <Line x1={120} y1={142} x2={120} y2={30} stroke={theme.colors.signal} strokeWidth={1.6} strokeLinecap="round" transform={\`rotate(\${secDeg} 120 120)\`} />
        <Circle cx={120} cy={120} r={5.5} fill={theme.colors.foreground} />
      </Svg>
      <Pressable onPress={() => setDensity((d) => (d === 60 ? 12 : d === 12 ? 24 : 60))} style={[styles.btn, { borderColor: theme.colors.borderStrong }]}>
        <Text style={[styles.meta, { color: theme.colors.foreground }]}>TICKS: {density}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 16, alignItems: "center", gap: 12 },
  btn: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  meta: { fontFamily: "JetBrainsMono-Regular", fontSize: 11, fontVariant: ["tabular-nums"] },
});`,
  },
];
