export const PRIMITIVE_PALETTE = {
  black: '#000000',
  oledSurface: '#111111',
  oledRaised: '#1B1B1B',
  obsidian: '#171717',
  slateDark: '#222222',
  graphite: '#2A2A2A',
  steel: '#333333',
  ash: '#5A5A5A',
  pewter: '#737373',
  silver: '#9C9C9C',
  mist: '#D0D0D0',
  fog: '#E4E4E4',
  paperRaised: '#EBEBEB',
  paper: '#F4F4F4',
  white: '#FFFFFF',
  signalRed: '#D71921',
  signalRedDark: '#B8141B',
  signalRedBright: '#EF232B',
  signalRedHc: '#FF2A32',
  successLight: '#15803D',
  successDark: '#22C55E',
  warningLight: '#B45309',
  warningDark: '#F59E0B',
} as const;

export interface SemanticColorTokens {
  background: string;
  surface: string;
  surfaceGlass: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  foreground: string;
  foregroundPrimary: string;
  foregroundSecondary: string;
  foregroundMuted: string;
  border: string;
  borderStrong: string;
  interactive: string;
  interactiveForeground: string;
  signal: string;
  signalHover: string;
  signalSoft: string;
  signalForeground: string;
  success: string;
  warning: string;
  danger: string;
  focusRing: string;
  chart: readonly [string, string, string, string];
}
