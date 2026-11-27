import { getNativeTheme, type ThemeMode } from '@nothing-ui/tokens';

export type NativeTheme = ReturnType<typeof getNativeTheme>;

export function createNativeTheme(mode: ThemeMode = 'dark'): NativeTheme {
  return getNativeTheme(mode);
}

export const NATIVE_COMPATIBILITY_MATRIX = {
  reactNative: '>=0.74',
  expoSdk: '51 / 52 / 53',
  reactNativeSvg: '>=15.0',
  coverage: '88 / 88 live · 136 / 136 stable',
  platforms: ['iOS 15+', 'Android API 24+'],
  statusNote:
    'All 88 live Nothing UI modules (covering 100% of the 136-component inventory) ship as stable for both Web and React Native under nthgui/native with zero extra package installs.',
} as const;

