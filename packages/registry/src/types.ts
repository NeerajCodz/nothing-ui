export type ComponentStatus =
  | 'planned'
  | 'alpha'
  | 'beta'
  | 'stable'
  | 'deprecated'
  | 'unsupported';

export type ComponentMaturity = 'alpha' | 'beta' | 'stable' | 'deprecated';

export type CatalogItemKind = 'component' | 'widget' | 'glyph';

export type ComponentCategory =
  | 'Inputs & Actions'
  | 'Navigation & Layout'
  | 'Overlays & Feedback'
  | 'Charts'
  | 'Data & Hardware';

export type RegistryCategory = ComponentCategory | 'Widgets' | 'Glyph System';

export type WidgetGroup =
  | 'Calendar & Time'
  | 'Audio & Video'
  | 'Hardware OS'
  | 'Productivity & Utility';

export type PackageManager = 'bun' | 'pnpm' | 'npm' | 'yarn';

export type InstallMode = 'cli' | 'package';

export interface ComponentPropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface KeyboardRule {
  key: string;
  action: string;
}

export interface CatalogEntry {
  slug: string;
  moduleNumber: string;
  title: string;
  kind?: CatalogItemKind;
  category: RegistryCategory;
  widgetGroup?: WidgetGroup;
  description: string;
  keywords: string[];
  web: ComponentStatus;
  native: ComponentStatus;
  maturity?: ComponentMaturity;
  webImport: string;
  nativeImport?: string;
  uiSdkPrimitive?: string;
  dependencies: string[];
  registryDependencies?: string[];
  sourcePath: string;
  features: string[];
  props: ComponentPropDoc[];
  keyboard: KeyboardRule[];
  accessibilityNotes: string;
  related?: string[];
}

export interface ResolvedCatalogEntry extends CatalogEntry {
  kind: CatalogItemKind;
}

export interface PlannedWidgetEntry {
  slug: string;
  title: string;
  group: WidgetGroup;
  priority: 'P1' | 'P2' | 'P3';
  description: string;
  primitives: string[];
  nativeTarget: string;
  status: 'planned';
}

export interface ShadcnRegistryItem {
  $schema: 'https://ui.shadcn.com/schema/registry-item.json';
  name: string;
  type: 'registry:ui';
  title: string;
  description: string;
  dependencies: string[];
  registryDependencies: string[];
  files: Array<{
    path: string;
    type: 'registry:ui';
    target: string;
  }>;
  meta: {
    kind: CatalogItemKind;
    webStatus: ComponentStatus;
    nativeStatus: ComponentStatus;
    category: RegistryCategory;
  };
}
