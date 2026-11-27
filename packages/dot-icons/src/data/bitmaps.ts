import { CORE_DOT_ICON_BITMAPS } from './bitmaps-core';
import { ARROWS_NAV_DOT_ICON_BITMAPS } from './bitmaps-arrows-nav';
import { CONTROLS_UI_DOT_ICON_BITMAPS } from './bitmaps-controls-ui';
import { MEDIA_AUDIO_DOT_ICON_BITMAPS } from './bitmaps-media-audio';
import { HARDWARE_CONN_DOT_ICON_BITMAPS } from './bitmaps-hardware-conn';
import { FILES_DEV_DOT_ICON_BITMAPS } from './bitmaps-files-dev';
import { COMM_ENV_LIFE_DOT_ICON_BITMAPS } from './bitmaps-comm-env-life';
import {
  LUCIDE_DIRECTORY_ALIAS_SOURCE_COUNT,
  LUCIDE_DIRECTORY_SOURCE_COUNT,
  LUCIDE_DOT_GRID_SIZE,
  LUCIDE_DOT_ICON_ALIASES,
  LUCIDE_DOT_ICON_BITMAPS,
  LUCIDE_DOT_ICON_NAMES,
  type LucideDotIconCanonicalName,
} from './bitmaps-lucide';

/**
 * Hand-crafted 247 original 9x9 round-dot pixel icon bitmaps across 9 categories.
 */
export const NOTHING_ORIGINAL_DOT_ICON_BITMAPS = {
  ...CORE_DOT_ICON_BITMAPS,
  ...ARROWS_NAV_DOT_ICON_BITMAPS,
  ...CONTROLS_UI_DOT_ICON_BITMAPS,
  ...MEDIA_AUDIO_DOT_ICON_BITMAPS,
  ...HARDWARE_CONN_DOT_ICON_BITMAPS,
  ...FILES_DEV_DOT_ICON_BITMAPS,
  ...COMM_ENV_LIFE_DOT_ICON_BITMAPS,
} as const;

export type NothingOriginalDotIconName = keyof typeof NOTHING_ORIGINAL_DOT_ICON_BITMAPS;

export const NOTHING_ORIGINAL_ICON_NAMES = Object.keys(
  NOTHING_ORIGINAL_DOT_ICON_BITMAPS,
) as NothingOriginalDotIconName[];

/**
 * Complete unified dot-matrix icon dictionary:
 * 247 hand-crafted Nothing UI 9x9 originals + 1,444 Lucide Directory 15x15 icons = 1,691 canonical icons
 * (100% coverage of all 1,638 canonical Lucide icons + 53 Nothing UI hardware exclusives).
 */
export const DOT_ICON_BITMAPS = {
  ...NOTHING_ORIGINAL_DOT_ICON_BITMAPS,
  ...LUCIDE_DOT_ICON_BITMAPS,
} as const;

export type DotIconCanonicalName = keyof typeof DOT_ICON_BITMAPS;

export const CORE_DOT_ICON_ALIASES = {
  'map-pin': 'mappin',
  settings: 'gear',
  cog: 'gear',
  x: 'close',
  delete: 'trash',
  remove: 'trash',
  'arrow-up': 'up',
  'arrow-down': 'down',
  'arrow-left': 'left',
  'arrow-right': 'right',
  'mic-mute': 'mic-off',
  'volume-x': 'volume-mute',
} as const satisfies Record<string, NothingOriginalDotIconName>;

/**
 * Combined 216 official aliases (12 core Nothing aliases + 204 Lucide directory aliases).
 */
export const DOT_ICON_ALIASES = {
  ...CORE_DOT_ICON_ALIASES,
  ...LUCIDE_DOT_ICON_ALIASES,
} as const satisfies Record<string, DotIconCanonicalName>;

export type DotIconAliasName = keyof typeof DOT_ICON_ALIASES;
export type DotIconName = DotIconCanonicalName | DotIconAliasName;

export const DOT_ICON_NAMES = Object.keys(DOT_ICON_BITMAPS) as DotIconCanonicalName[];

export {
  LUCIDE_DIRECTORY_ALIAS_SOURCE_COUNT,
  LUCIDE_DIRECTORY_SOURCE_COUNT,
  LUCIDE_DOT_GRID_SIZE,
  LUCIDE_DOT_ICON_NAMES,
  type LucideDotIconCanonicalName,
};
