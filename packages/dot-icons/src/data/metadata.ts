import {
  DOT_ICON_ALIASES,
  DOT_ICON_BITMAPS,
  DOT_ICON_NAMES,
  LUCIDE_DOT_GRID_SIZE,
  NOTHING_ORIGINAL_ICON_NAMES,
  type DotIconCanonicalName,
  type NothingOriginalDotIconName,
} from './bitmaps';
import { LUCIDE_DOT_ICON_PACKED, type LucideDotIconCanonicalName } from './bitmaps-lucide';

export type DotIconCategory =
  | 'Connectivity'
  | 'Controls'
  | 'Navigation'
  | 'Status'
  | 'Files & Data'
  | 'Media'
  | 'Communication'
  | 'Environment'
  | 'System';

export type DotIconSource = 'nothing' | 'lucide';

export const DOT_ICON_CATEGORIES: readonly DotIconCategory[] = [
  'Connectivity',
  'Controls',
  'Navigation',
  'Status',
  'Files & Data',
  'Media',
  'Communication',
  'Environment',
  'System',
] as const;

export interface DotIconMetadata {
  id: DotIconCanonicalName;
  title: string;
  category: DotIconCategory;
  source: DotIconSource;
  nativeGridSize: number;
  tags: string[];
  aliases?: string[];
  usageLabel: string;
}

type MetaSeed = [DotIconCategory, string, string[], string, string[]?];

const ORIGINAL_METADATA_SEEDS: Record<NothingOriginalDotIconName, MetaSeed> = {
  // ── Core 35 (preserved 1:1 categories & labels) ───────────────────────────
  signal: ['Connectivity', 'Signal', ['cellular', 'bars', '5g', 'network', 'reception'], 'Signal strength indicator'],
  wifi: ['Connectivity', 'Wi-Fi', ['wireless', 'internet', 'network', 'lan'], 'Wireless network status'],
  battery: ['Connectivity', 'Battery', ['power', 'charge', 'energy', 'reserve'], 'Battery level cue'],
  play: ['Controls', 'Play', ['start', 'media', 'audio', 'video', 'resume'], 'Start playback'],
  pause: ['Controls', 'Pause', ['hold', 'media', 'stop', 'wait'], 'Pause playback'],
  power: ['Controls', 'Power', ['shutdown', 'standby', 'boot', 'switch'], 'Power control'],
  plus: ['Controls', 'Plus', ['add', 'create', 'new', 'increment'], 'Add or create item'],
  check: ['Controls', 'Check', ['confirm', 'done', 'valid', 'complete'], 'Confirmed state'],
  close: ['Controls', 'Close', ['dismiss', 'cancel', 'remove', 'x'], 'Dismiss control', ['x']],
  more: ['Controls', 'More', ['ellipsis', 'menu', 'overflow', 'options'], 'Overflow actions'],
  home: ['Navigation', 'Home', ['start', 'dashboard', 'house', 'root'], 'Home navigation'],
  search: ['Navigation', 'Search', ['find', 'magnifier', 'lookup', 'query'], 'Search input cue'],
  grid: ['Navigation', 'Grid', ['layout', 'apps', 'matrix', 'tiles'], 'Grid view switcher'],
  up: ['Navigation', 'Up Arrow', ['arrow', 'north', 'upload', 'ascend'], 'Upward navigation', ['arrow-up']],
  mappin: ['Navigation', 'Map Pin', ['location', 'gps', 'pin', 'marker', 'place'], 'Location pin marker', ['map-pin']],
  bell: ['Status', 'Bell', ['notification', 'alert', 'ring', 'alarm'], 'Notification alert'],
  lock: ['Status', 'Lock', ['security', 'private', 'encrypted', 'auth'], 'Locked state'],
  clock: ['Status', 'Clock', ['time', 'timer', 'schedule', 'history'], 'Time and duration'],
  heart: ['Status', 'Heart', ['like', 'favorite', 'love', 'health'], 'Favorite action'],
  star: ['Status', 'Star', ['rating', 'bookmark', 'featured', 'rank'], 'Rating or bookmark'],
  bolt: ['Status', 'Bolt', ['glyph', 'flash', 'charging', 'fast', 'power'], 'Glyph LED or fast charge'],
  eye: ['Status', 'Eye', ['view', 'visible', 'preview', 'watch'], 'Visibility toggle'],
  folder: ['Files & Data', 'Folder', ['directory', 'files', 'storage', 'collection'], 'Directory container'],
  download: ['Files & Data', 'Download', ['export', 'save', 'install', 'arrow'], 'Download artifact'],
  trash: ['Files & Data', 'Trash', ['delete', 'remove', 'bin', 'discard'], 'Destructive delete', ['delete', 'remove']],
  music: ['Media', 'Music', ['audio', 'sound', 'note', 'track', 'ear'], 'Audio track cue'],
  camera: ['Media', 'Camera', ['photo', 'capture', 'lens', 'shutter'], 'Camera capture'],
  mail: ['Communication', 'Mail', ['email', 'inbox', 'envelope', 'message'], 'Inbox message'],
  chat: ['Communication', 'Chat', ['message', 'bubble', 'comment', 'reply'], 'Chat thread'],
  user: ['Communication', 'User', ['profile', 'account', 'person', 'avatar'], 'User profile'],
  sun: ['Environment', 'Sun', ['light', 'day', 'brightness', 'clear'], 'Light mode or sunny'],
  moon: ['Environment', 'Moon', ['dark', 'night', 'sleep', 'focus'], 'Dark mode or focus'],
  cloud: ['Environment', 'Cloud', ['weather', 'overcast', 'sync', 'storage'], 'Weather or cloud sync'],
  gear: ['System', 'Gear', ['settings', 'preferences', 'config', 'cog'], 'System settings', ['settings', 'cog']],
  calendar: ['System', 'Calendar', ['date', 'event', 'schedule', 'day'], 'Date picker cue'],

  // ── Arrows, Chevrons, Navigation & Layout (34) ────────────────────────────
  down: ['Navigation', 'Down Arrow', ['arrow', 'south', 'descend'], 'Downward navigation', ['arrow-down']],
  left: ['Navigation', 'Left Arrow', ['arrow', 'west', 'back', 'previous'], 'Back navigation', ['arrow-left']],
  right: ['Navigation', 'Right Arrow', ['arrow', 'east', 'forward', 'next'], 'Forward navigation', ['arrow-right']],
  'arrow-up-right': ['Navigation', 'Arrow Up Right', ['diagonal', 'outbound', 'external', 'trend'], 'Outbound link direction'],
  'arrow-up-left': ['Navigation', 'Arrow Up Left', ['diagonal', 'return', 'northwest'], 'Northwest directional cue'],
  'arrow-down-right': ['Navigation', 'Arrow Down Right', ['diagonal', 'southeast', 'expand'], 'Southeast directional cue'],
  'arrow-down-left': ['Navigation', 'Arrow Down Left', ['diagonal', 'inbound', 'southwest'], 'Inbound directional cue'],
  'chevron-up': ['Navigation', 'Chevron Up', ['collapse', 'caret', 'up'], 'Collapse disclosure'],
  'chevron-down': ['Navigation', 'Chevron Down', ['expand', 'dropdown', 'caret'], 'Expand dropdown'],
  'chevron-left': ['Navigation', 'Chevron Left', ['back', 'previous', 'caret'], 'Previous page step'],
  'chevron-right': ['Navigation', 'Chevron Right', ['next', 'forward', 'caret'], 'Next page step'],
  'chevrons-left': ['Navigation', 'Chevrons Left', ['first', 'rewind', 'jump'], 'Jump to start'],
  'chevrons-right': ['Navigation', 'Chevrons Right', ['last', 'skip', 'jump'], 'Jump to end'],
  'chevrons-up': ['Navigation', 'Chevrons Up', ['top', 'scroll', 'fast'], 'Jump to top'],
  'chevrons-down': ['Navigation', 'Chevrons Down', ['bottom', 'scroll', 'more'], 'Jump to bottom'],
  'swap-horizontal': ['Navigation', 'Swap Horizontal', ['exchange', 'transfer', 'bidirectional'], 'Swap left and right values'],
  'swap-vertical': ['Navigation', 'Swap Vertical', ['reorder', 'sort', 'vertical'], 'Swap vertical order'],
  refresh: ['Navigation', 'Refresh', ['reload', 'sync', 'retry', 'cycle'], 'Refresh view or data'],
  undo: ['Navigation', 'Undo', ['revert', 'back', 'history'], 'Undo previous action'],
  redo: ['Navigation', 'Redo', ['repeat', 'forward', 'history'], 'Redo undone action'],
  'external-link': ['Navigation', 'External Link', ['open', 'tab', 'url', 'outbound'], 'Open in new window'],
  'corner-down-right': ['Navigation', 'Corner Down Right', ['enter', 'reply', 'indent', 'subitem'], 'Nested reply or enter'],
  compass: ['Navigation', 'Compass', ['explore', 'discover', 'bearing', 'north'], 'Explore or heading indicator'],
  map: ['Navigation', 'Map', ['atlas', 'terrain', 'geography', 'world'], 'Map view toggle'],
  navigation: ['Navigation', 'Navigation Pointer', ['gps', 'cursor', 'heading', 'route'], 'Active GPS navigation'],
  route: ['Navigation', 'Route Path', ['waypoints', 'directions', 'journey'], 'Multi-stop route display'],
  crosshair: ['Navigation', 'Crosshair', ['target', 'locate', 'center', 'gps'], 'Center on current location'],
  sidebar: ['Navigation', 'Sidebar', ['panel', 'drawer', 'rail', 'layout'], 'Toggle sidebar panel'],
  'layout-columns': ['Navigation', 'Columns Layout', ['split', 'two-column', 'panes'], 'Multi-column workspace'],
  'layout-rows': ['Navigation', 'Rows Layout', ['stacked', 'horizontal', 'panes'], 'Stacked row workspace'],
  layers: ['Navigation', 'Layers', ['stack', 'depth', 'overlays', 'z-index'], 'Layer stack inspector'],
  maximize: ['Navigation', 'Maximize', ['fullscreen', 'expand', 'enlarge'], 'Enter fullscreen'],
  minimize: ['Navigation', 'Minimize', ['shrink', 'exit', 'collapse'], 'Exit fullscreen'],
  menu: ['Navigation', 'Menu', ['hamburger', 'drawer', 'nav', 'list'], 'Open navigation menu'],

  // ── UI Controls, Editing & Actions (38) ───────────────────────────────────
  minus: ['Controls', 'Minus', ['subtract', 'remove', 'decrement', 'dash'], 'Decrement or collapse'],
  'more-vertical': ['Controls', 'More Vertical', ['kebab', 'overflow', 'menu', 'dots'], 'Vertical action menu'],
  'plus-circle': ['Controls', 'Plus Circle', ['add', 'new', 'insert', 'circle'], 'Create new entry'],
  'minus-circle': ['Controls', 'Minus Circle', ['remove', 'subtract', 'circle'], 'Remove item'],
  'check-circle': ['Controls', 'Check Circle', ['success', 'verified', 'ok', 'complete'], 'Verified completion'],
  'x-circle': ['Controls', 'Close Circle', ['error', 'cancel', 'clear', 'dismiss'], 'Clear or failed state'],
  'check-square': ['Controls', 'Checked Box', ['checkbox', 'selected', 'task', 'done'], 'Checked selection'],
  square: ['Controls', 'Square', ['unchecked', 'box', 'shape'], 'Unchecked box or shape'],
  circle: ['Controls', 'Circle', ['radio', 'unselected', 'ring'], 'Unselected radio or ring'],
  'circle-dot': ['Controls', 'Circle Dot', ['radio', 'selected', 'active', 'target'], 'Selected radio state'],
  sliders: ['Controls', 'Sliders', ['tune', 'adjust', 'eq', 'controls', 'filter'], 'Fine-tune parameters'],
  'toggle-left': ['Controls', 'Toggle Off', ['switch', 'disabled', 'off', 'boolean'], 'Inactive toggle switch'],
  'toggle-right': ['Controls', 'Toggle On', ['switch', 'enabled', 'on', 'boolean'], 'Active toggle switch'],
  filter: ['Controls', 'Filter', ['funnel', 'refine', 'query', 'narrow'], 'Filter dataset'],
  'sort-asc': ['Controls', 'Sort Ascending', ['order', 'up', 'a-z', 'ranking'], 'Sort ascending'],
  'sort-desc': ['Controls', 'Sort Descending', ['order', 'down', 'z-a', 'ranking'], 'Sort descending'],
  'zoom-in': ['Controls', 'Zoom In', ['magnify', 'scale', 'enlarge'], 'Increase zoom level'],
  'zoom-out': ['Controls', 'Zoom Out', ['shrink', 'magnify', 'reduce'], 'Decrease zoom level'],
  edit: ['Controls', 'Edit', ['pencil', 'modify', 'rename', 'write'], 'Edit content'],
  pen: ['Controls', 'Pen', ['draw', 'stylus', 'annotate', 'ink'], 'Freehand drawing tool'],
  eraser: ['Controls', 'Eraser', ['clear', 'wipe', 'clean', 'draw'], 'Erase canvas cells'],
  copy: ['Controls', 'Copy', ['duplicate', 'clone', 'clipboard'], 'Copy to clipboard'],
  clipboard: ['Controls', 'Clipboard', ['paste', 'notes', 'buffer'], 'Paste or inspect clipboard'],
  scissors: ['Controls', 'Scissors', ['cut', 'trim', 'clip', 'splice'], 'Cut selection'],
  crop: ['Controls', 'Crop', ['frame', 'trim', 'aspect', 'photo'], 'Crop image or frame'],
  'grip-dots': ['Controls', 'Drag Handle', ['reorder', 'move', 'grab', 'sortable'], 'Sortable drag grip'],
  'eye-off': ['Controls', 'Eye Off', ['hide', 'private', 'mask', 'password'], 'Hide sensitive value'],
  pin: ['Controls', 'Pin', ['sticky', 'attach', 'lock', 'anchor'], 'Pin item to top'],
  bookmark: ['Controls', 'Bookmark', ['save', 'favorite', 'read-later'], 'Bookmark item'],
  tag: ['Controls', 'Tag', ['label', 'price', 'category', 'badge'], 'Categorize with tag'],
  link: ['Controls', 'Link', ['chain', 'url', 'connect', 'bind'], 'Attach or copy link'],
  unlink: ['Controls', 'Unlink', ['disconnect', 'break', 'detach'], 'Remove link'],
  share: ['Controls', 'Share', ['export', 'send', 'distribute', 'social'], 'Share item'],
  save: ['Controls', 'Save', ['floppy', 'disk', 'persist', 'commit'], 'Save changes'],
  print: ['Controls', 'Print', ['printer', 'paper', 'hardcopy'], 'Print document'],
  'list-bullet': ['Controls', 'Bullet List', ['items', 'unordered', 'outline'], 'Bulleted list view'],
  'align-left': ['Controls', 'Align Left', ['text', 'justify', 'format'], 'Left-align text'],
  'align-center': ['Controls', 'Align Center', ['text', 'center', 'format'], 'Center-align text'],

  // ── Media, Audio, Video & Studio (32) ─────────────────────────────────────
  stop: ['Media', 'Stop', ['halt', 'end', 'playback', 'square'], 'Stop media playback'],
  record: ['Media', 'Record', ['rec', 'capture', 'dot', 'signal'], 'Start recording'],
  'skip-back': ['Media', 'Skip Back', ['previous', 'track', 'start'], 'Previous track'],
  'skip-forward': ['Media', 'Skip Forward', ['next', 'track', 'end'], 'Next track'],
  rewind: ['Media', 'Rewind', ['seek', 'backward', 'scrub'], 'Seek backward'],
  'fast-forward': ['Media', 'Fast Forward', ['seek', 'forward', 'scrub'], 'Seek forward'],
  shuffle: ['Media', 'Shuffle', ['random', 'mix', 'queue'], 'Shuffle playback queue'],
  repeat: ['Media', 'Repeat', ['loop', 'cycle', 'replay'], 'Loop track or queue'],
  'volume-high': ['Media', 'Volume High', ['sound', 'loud', 'speaker', 'audio'], 'High output volume'],
  'volume-low': ['Media', 'Volume Low', ['sound', 'quiet', 'speaker', 'audio'], 'Low output volume'],
  'volume-mute': ['Media', 'Volume Mute', ['silent', 'muted', 'off', 'speaker'], 'Mute audio output', ['volume-x']],
  mic: ['Media', 'Microphone', ['voice', 'record', 'input', 'speech'], 'Voice input active'],
  'mic-off': ['Media', 'Microphone Off', ['mute', 'silent', 'disabled'], 'Mute microphone', ['mic-mute']],
  headphones: ['Media', 'Headphones', ['listen', 'audio', 'over-ear', 'monitor'], 'Headphone output'],
  earbuds: ['Media', 'Earbuds', ['ear', 'nothing', 'anc', 'tws', 'bluetooth'], 'Nothing Ear audio device'],
  speaker: ['Media', 'Speaker', ['monitor', 'woofer', 'hi-fi', 'output'], 'External speaker output'],
  waveform: ['Media', 'Waveform', ['audio', 'voice', 'amplitude', 'frequency'], 'Live audio waveform'],
  equalizer: ['Media', 'Equalizer', ['bars', 'levels', 'freq', 'mixer'], 'Audio equalizer bands'],
  disc: ['Media', 'Disc', ['vinyl', 'album', 'cd', 'record'], 'Album or disc media'],
  radio: ['Media', 'Radio', ['tuner', 'fm', 'broadcast', 'antenna'], 'Radio broadcast tuner'],
  video: ['Media', 'Video Camera', ['film', 'record', 'camcorder', 'call'], 'Video capture or call'],
  'video-off': ['Media', 'Video Off', ['camera-off', 'disabled', 'privacy'], 'Disable video stream'],
  film: ['Media', 'Film Strip', ['cinema', 'movie', 'frames', 'reel'], 'Cinema or timeline reel'],
  image: ['Media', 'Image', ['photo', 'picture', 'gallery', 'landscape'], 'Photo or media asset'],
  aperture: ['Media', 'Aperture', ['lens', 'shutter', 'exposure', 'pro'], 'Camera aperture control'],
  cast: ['Media', 'Cast', ['screen', 'stream', 'chromecast', 'airplay'], 'Cast to external display'],
  tv: ['Media', 'Television', ['screen', 'display', 'broadcast', 'monitor'], 'TV or set-top display'],
  subtitles: ['Media', 'Subtitles', ['cc', 'captions', 'transcript'], 'Closed captions toggle'],
  'play-circle': ['Media', 'Play Circle', ['watch', 'preview', 'video'], 'Play preview button'],
  'pause-circle': ['Media', 'Pause Circle', ['hold', 'video', 'audio'], 'Pause preview button'],
  podcast: ['Media', 'Podcast', ['broadcast', 'show', 'stream', 'audio'], 'Podcast feed'],
  playlist: ['Media', 'Playlist', ['queue', 'tracks', 'music', 'list'], 'Playback track queue'],

  // ── Connectivity, Hardware OS & Devices (34) ──────────────────────────────
  bluetooth: ['Connectivity', 'Bluetooth', ['wireless', 'pair', 'audio', 'ble'], 'Bluetooth pairing status'],
  'wifi-off': ['Connectivity', 'Wi-Fi Off', ['offline', 'disconnected', 'no-signal'], 'Disconnected Wi-Fi'],
  'signal-low': ['Connectivity', 'Weak Signal', ['cellular', 'low', 'bars', 'edge'], 'Low cellular reception'],
  airplane: ['Connectivity', 'Airplane Mode', ['flight', 'offline', 'radio-off'], 'Airplane mode toggle'],
  hotspot: ['Connectivity', 'Hotspot', ['tether', 'ap', 'broadcast', 'share'], 'Personal Wi-Fi hotspot'],
  nfc: ['Connectivity', 'NFC', ['tap', 'contactless', 'pay', 'tag'], 'Contactless NFC reader'],
  usb: ['Connectivity', 'USB', ['cable', 'port', 'transfer', 'peripheral'], 'USB device connection'],
  'battery-low': ['Connectivity', 'Battery Low', ['power', 'warning', 'drain'], 'Low battery indicator'],
  'battery-charging': ['Connectivity', 'Battery Charging', ['bolt', 'fast-charge', 'plugged'], 'Active charging status'],
  'battery-empty': ['Connectivity', 'Battery Empty', ['critical', 'depleted', 'zero'], 'Depleted battery state'],
  plug: ['Connectivity', 'Power Plug', ['ac', 'adapter', 'mains', 'outlet'], 'AC mains power source'],
  router: ['Connectivity', 'Router', ['gateway', 'modem', 'lan', 'wifi'], 'Network router status'],
  satellite: ['Connectivity', 'Satellite', ['orbital', 'gps', 'sos', 'uplink'], 'Satellite link status'],
  radar: ['Connectivity', 'Radar', ['scan', 'sweep', 'proximity', 'detect'], 'Nearby device scan'],
  sim: ['Connectivity', 'SIM Card', ['esim', 'carrier', 'mobile', 'slot'], 'Mobile SIM profile'],
  cpu: ['System', 'Processor CPU', ['chip', 'silicon', 'compute', 'core'], 'Processor load or hardware'],
  memory: ['System', 'RAM Memory', ['dimm', 'module', 'allocation'], 'Memory usage monitor'],
  'hard-drive': ['System', 'Storage Drive', ['ssd', 'disk', 'volume', 'nvme'], 'Local disk storage'],
  smartphone: ['System', 'Smartphone', ['phone', 'mobile', 'handset', 'nothing'], 'Mobile handset device'],
  tablet: ['System', 'Tablet', ['pad', 'slate', 'touchscreen'], 'Tablet device target'],
  laptop: ['System', 'Laptop', ['notebook', 'computer', 'workstation'], 'Laptop workstation'],
  monitor: ['System', 'Desktop Monitor', ['display', 'screen', 'external'], 'External desktop display'],
  watch: ['System', 'Smartwatch', ['wearable', 'wrist', 'cmf', 'time'], 'Wearable watch telemetry'],
  keyboard: ['System', 'Keyboard', ['typing', 'shortcuts', 'input', 'keys'], 'Keyboard shortcuts cue'],
  mouse: ['System', 'Mouse', ['pointer', 'cursor', 'scroll', 'input'], 'Pointer device control'],
  gamepad: ['System', 'Gamepad', ['controller', 'gaming', 'play', 'mode'], 'Game mode toggle'],
  qrcode: ['System', 'QR Code', ['matrix', 'scan', 'pair', 'share'], 'QR pairing matrix'],
  barcode: ['System', 'Barcode', ['serial', 'upc', 'inventory', 'sku'], 'Hardware serial code'],
  flashlight: ['System', 'Flashlight', ['torch', 'glyph', 'beam', 'light'], 'Rear flashlight toggle'],
  'glyph-led': ['System', 'Glyph LED', ['matrix', 'nothing', 'ring', 'led'], 'Addressable Glyph Matrix'],
  magnet: ['System', 'Magnet', ['snap', 'magsafe', 'attach', 'dock'], 'Magnetic accessory dock'],
  gauge: ['System', 'Performance Gauge', ['speed', 'meter', 'rpm', 'benchmark'], 'System performance meter'],
  thermometer: ['System', 'Thermometer', ['temperature', 'thermal', 'heat', 'cpu'], 'Thermal sensor readout'],
  server: ['System', 'Server Rack', ['cluster', 'backend', 'node', 'datacenter'], 'Server infrastructure node'],

  // ── Files, Developer Tools, Security & Analytics (36) ─────────────────────
  file: ['Files & Data', 'File', ['document', 'page', 'blank', 'item'], 'Generic file item'],
  'file-text': ['Files & Data', 'Text Document', ['readme', 'markdown', 'notes', 'doc'], 'Text or markdown file'],
  'file-code': ['Files & Data', 'Code File', ['source', 'ts', 'tsx', 'script'], 'Source code file'],
  'file-plus': ['Files & Data', 'New File', ['create', 'add', 'document'], 'Create new file'],
  'folder-open': ['Files & Data', 'Open Folder', ['directory', 'expanded', 'browse'], 'Expanded directory'],
  'folder-plus': ['Files & Data', 'New Folder', ['directory', 'create', 'group'], 'Create new directory'],
  upload: ['Files & Data', 'Upload', ['import', 'publish', 'send', 'arrow'], 'Upload artifact'],
  'cloud-upload': ['Files & Data', 'Cloud Upload', ['backup', 'sync', 'push'], 'Sync up to cloud'],
  'cloud-download': ['Files & Data', 'Cloud Download', ['pull', 'restore', 'fetch'], 'Fetch from cloud'],
  archive: ['Files & Data', 'Archive', ['zip', 'box', 'bundle', 'store'], 'Archived bundle'],
  package: ['Files & Data', 'Package', ['npm', 'nthgui', 'crate', 'module'], 'Published software package'],
  database: ['Files & Data', 'Database', ['sql', 'storage', 'records', 'schema'], 'Database store'],
  terminal: ['Files & Data', 'Terminal', ['cli', 'shell', 'bash', 'console', 'npx'], 'Command line interface'],
  code: ['Files & Data', 'Code Brackets', ['html', 'jsx', 'dev', 'markup'], 'Inspect source code'],
  braces: ['Files & Data', 'Curly Braces', ['json', 'object', 'tokens', 'schema'], 'JSON or token schema'],
  'git-branch': ['Files & Data', 'Git Branch', ['vcs', 'fork', 'version', 'repo'], 'Source control branch'],
  'git-commit': ['Files & Data', 'Git Commit', ['snapshot', 'revision', 'hash'], 'Version control commit'],
  'git-merge': ['Files & Data', 'Git Merge', ['pr', 'combine', 'integrate'], 'Merge pull request'],
  bug: ['Files & Data', 'Bug', ['debug', 'issue', 'defect', 'trace'], 'Issue or debugger'],
  wrench: ['System', 'Wrench', ['tool', 'repair', 'maintenance', 'utility'], 'Maintenance utility'],
  hammer: ['System', 'Hammer', ['build', 'compile', 'forge', 'craft'], 'Build or compile action'],
  command: ['System', 'Command Key', ['meta', 'shortcut', 'palette', 'cmd'], 'Command palette trigger'],
  hash: ['Files & Data', 'Hash', ['number', 'channel', 'tag', 'id'], 'Numeric ID or channel'],
  at: ['Communication', 'At Sign', ['mention', 'handle', 'email', 'address'], 'User mention or handle'],
  unlock: ['Status', 'Unlock', ['open', 'unsecured', 'access'], 'Unlocked state'],
  key: ['Status', 'Key', ['token', 'passkey', 'secret', 'auth'], 'API key or passkey'],
  shield: ['Status', 'Shield', ['security', 'protect', 'firewall', 'guard'], 'Security protection'],
  'shield-check': ['Status', 'Shield Verified', ['safe', 'trusted', 'verified', 'ssl'], 'Verified security state'],
  'shield-alert': ['Status', 'Shield Alert', ['warning', 'breach', 'risk'], 'Security warning'],
  fingerprint: ['Status', 'Fingerprint', ['biometric', 'touchid', 'identity', 'auth'], 'Biometric verification'],
  scan: ['System', 'Scanner', ['ocr', 'lens', 'barcode', 'qr', 'capture'], 'Optical scan frame'],
  table: ['Files & Data', 'Data Table', ['grid', 'spreadsheet', 'rows', 'matrix'], 'Tabular dataset view'],
  'bar-chart': ['Files & Data', 'Bar Chart', ['analytics', 'metrics', 'histogram'], 'Bar chart visualization'],
  'line-chart': ['Files & Data', 'Line Chart', ['trend', 'timeseries', 'growth'], 'Trend line chart'],
  'pie-chart': ['Files & Data', 'Pie Chart', ['distribution', 'share', 'ratio'], 'Proportional pie chart'],
  activity: ['Status', 'Activity Pulse', ['heartbeat', 'telemetry', 'health', 'live'], 'Live telemetry pulse'],

  // ── Communication, Status, Environment, Time & Everyday (38) ──────────────
  phone: ['Communication', 'Phone', ['call', 'voice', 'dial', 'handset'], 'Voice call action'],
  'phone-off': ['Communication', 'End Call', ['hangup', 'mute', 'offline'], 'End or mute call'],
  send: ['Communication', 'Send', ['paper-plane', 'submit', 'dispatch', 'message'], 'Send message'],
  inbox: ['Communication', 'Inbox', ['tray', 'messages', 'received', 'queue'], 'Incoming message tray'],
  'mail-open': ['Communication', 'Mail Open', ['read', 'envelope', 'opened'], 'Read message state'],
  users: ['Communication', 'Users Group', ['team', 'people', 'members', 'org'], 'Team or group view'],
  'user-plus': ['Communication', 'Add User', ['invite', 'member', 'contact'], 'Invite new member'],
  'user-check': ['Communication', 'Verified User', ['approved', 'active', 'contact'], 'Verified account'],
  'bell-off': ['Status', 'Bell Muted', ['silent', 'dnd', 'quiet', 'mute'], 'Muted notifications'],
  megaphone: ['Communication', 'Megaphone', ['announce', 'broadcast', 'changelog'], 'Announcement banner'],
  globe: ['Communication', 'Globe', ['world', 'web', 'i18n', 'language', 'region'], 'Global web or locale'],
  info: ['Status', 'Info', ['details', 'about', 'tooltip', 'hint'], 'Informational cue'],
  help: ['Status', 'Help', ['question', 'faq', 'support', 'docs'], 'Help or documentation'],
  'alert-triangle': ['Status', 'Warning Triangle', ['caution', 'warn', 'alpha', 'notice'], 'Caution or alpha warning'],
  'alert-circle': ['Status', 'Alert Circle', ['error', 'danger', 'critical', 'stop'], 'Critical alert notice'],
  flag: ['Status', 'Flag', ['milestone', 'report', 'mark', 'feature'], 'Feature flag or milestone'],
  flame: ['Status', 'Flame', ['hot', 'streak', 'trending', 'fire'], 'Trending or active streak'],
  sparkles: ['Status', 'Sparkles', ['highlight', 'new', 'featured', 'magic'], 'Highlight or featured'],
  award: ['Status', 'Award Ribbon', ['badge', 'certified', 'quality', 'medal'], 'Verified quality badge'],
  trophy: ['Status', 'Trophy', ['achievement', 'winner', 'rank', 'goal'], 'Goal milestone'],
  'cloud-rain': ['Environment', 'Rain', ['weather', 'storm', 'wet', 'forecast'], 'Rainy forecast'],
  'cloud-snow': ['Environment', 'Snow', ['weather', 'winter', 'cold', 'forecast'], 'Snowy forecast'],
  'cloud-lightning': ['Environment', 'Thunderstorm', ['weather', 'bolt', 'storm'], 'Electrical storm forecast'],
  wind: ['Environment', 'Wind', ['breeze', 'airflow', 'weather', 'gust'], 'Wind speed indicator'],
  droplet: ['Environment', 'Droplet', ['humidity', 'water', 'rain', 'liquid'], 'Humidity or liquid meter'],
  snowflake: ['Environment', 'Snowflake', ['freeze', 'cold', 'cool', 'ac'], 'Cooling or freeze alert'],
  sunrise: ['Environment', 'Sunrise', ['dawn', 'morning', 'horizon', 'day'], 'Morning sunrise schedule'],
  leaf: ['Environment', 'Leaf', ['eco', 'green', 'battery-saver', 'nature'], 'Eco or low-power mode'],
  alarm: ['Status', 'Alarm Clock', ['wake', 'reminder', 'alert', 'bell'], 'Scheduled alarm'],
  stopwatch: ['Status', 'Stopwatch', ['timer', 'lap', 'chrono', 'duration'], 'Precision stopwatch'],
  hourglass: ['Status', 'Hourglass', ['pending', 'wait', 'loading', 'timeout'], 'Pending or elapsed timer'],
  'shopping-cart': ['Communication', 'Shopping Cart', ['commerce', 'checkout', 'buy', 'store'], 'Shopping cart'],
  'shopping-bag': ['Communication', 'Shopping Bag', ['retail', 'order', 'store', 'pack'], 'Order or retail bag'],
  'credit-card': ['Communication', 'Credit Card', ['payment', 'billing', 'checkout'], 'Payment method'],
  wallet: ['Communication', 'Wallet', ['balance', 'funds', 'nfc', 'pass'], 'Digital wallet'],
  gift: ['Communication', 'Gift', ['reward', 'bonus', 'present', 'perk'], 'Reward or release gift'],
  rocket: ['System', 'Rocket', ['launch', 'deploy', 'release', 'fast'], 'Deploy or launch action'],
  coffee: ['Environment', 'Coffee', ['break', 'caffeine', 'awake', 'focus'], 'Keep awake or break'],
};

const ACRONYM_MAP: Record<string, string> = {
  ai: 'AI',
  api: 'API',
  az: 'A–Z',
  za: 'Z–A',
  cc: 'CC',
  cctv: 'CCTV',
  cpu: 'CPU',
  css: 'CSS',
  csv: 'CSV',
  dna: 'DNA',
  ev: 'EV',
  gpu: 'GPU',
  hd: 'HD',
  hdmi: 'HDMI',
  hdr: 'HDR',
  id: 'ID',
  ip: 'IP',
  json: 'JSON',
  led: 'LED',
  nfc: 'NFC',
  pc: 'PC',
  pdf: 'PDF',
  qr: 'QR',
  rgb: 'RGB',
  rss: 'RSS',
  sim: 'SIM',
  sms: 'SMS',
  sql: 'SQL',
  svg: 'SVG',
  tv: 'TV',
  ui: 'UI',
  url: 'URL',
  usb: 'USB',
  ux: 'UX',
  vpn: 'VPN',
  wifi: 'Wi-Fi',
  xml: 'XML',
};

function formatLucideTitle(slug: string): string {
  return slug
    .split('-')
    .map((part) => ACRONYM_MAP[part] ?? (part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ');
}

const CATEGORY_USAGE_LABEL: Record<DotIconCategory, string> = {
  Connectivity: 'Lucide dot-matrix connectivity indicator',
  Controls: 'Lucide dot-matrix interface control',
  Navigation: 'Lucide dot-matrix navigation cue',
  Status: 'Lucide dot-matrix status & feedback indicator',
  'Files & Data': 'Lucide dot-matrix file, code, or data icon',
  Media: 'Lucide dot-matrix audio, video, or creative icon',
  Communication: 'Lucide dot-matrix social, commerce, or messaging icon',
  Environment: 'Lucide dot-matrix weather, food, or nature icon',
  System: 'Lucide dot-matrix hardware, device, or tool icon',
};

// Build reverse alias map: canonicalId -> all alias names pointing to it
const ALIASES_BY_CANONICAL = new Map<DotIconCanonicalName, string[]>();
for (const [alias, target] of Object.entries(DOT_ICON_ALIASES)) {
  const list = ALIASES_BY_CANONICAL.get(target) ?? [];
  if (!list.includes(alias)) {
    list.push(alias);
    ALIASES_BY_CANONICAL.set(target, list);
  }
}

const ORIGINAL_SET = new Set<string>(NOTHING_ORIGINAL_ICON_NAMES);

export const DOT_ICON_METADATA: Record<DotIconCanonicalName, DotIconMetadata> = Object.fromEntries(
  DOT_ICON_NAMES.map((id) => {
    const attachedAliases = ALIASES_BY_CANONICAL.get(id);

    if (ORIGINAL_SET.has(id)) {
      const [category, title, tags, usageLabel, seedAliases] =
        ORIGINAL_METADATA_SEEDS[id as NothingOriginalDotIconName];
      const mergedAliases = Array.from(
        new Set([...(seedAliases ?? []), ...(attachedAliases ?? [])]),
      );
      const meta: DotIconMetadata = {
        id,
        title,
        category,
        source: 'nothing',
        nativeGridSize: DOT_ICON_BITMAPS[id].length,
        tags,
        usageLabel,
        ...(mergedAliases.length > 0 ? { aliases: mergedAliases } : {}),
      };
      return [id, meta];
    }

    const [, categoryIdx] = LUCIDE_DOT_ICON_PACKED[id as LucideDotIconCanonicalName];
    const category = DOT_ICON_CATEGORIES[categoryIdx] ?? 'Controls';
    const title = formatLucideTitle(id);
    const slugTokens = id.split('-').filter((tok) => tok.length > 0);
    const aliasTokens = (attachedAliases ?? []).flatMap((a) => a.split('-'));
    const tags = Array.from(new Set(['lucide', ...slugTokens, ...aliasTokens]));

    const meta: DotIconMetadata = {
      id,
      title,
      category,
      source: 'lucide',
      nativeGridSize: LUCIDE_DOT_GRID_SIZE,
      tags,
      usageLabel: CATEGORY_USAGE_LABEL[category],
      ...(attachedAliases && attachedAliases.length > 0 ? { aliases: attachedAliases } : {}),
    };
    return [id, meta];
  }),
) as Record<DotIconCanonicalName, DotIconMetadata>;

export const DOT_ICON_LIST: DotIconMetadata[] = Object.values(DOT_ICON_METADATA);
