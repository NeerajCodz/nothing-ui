import { DOT_ICON_METADATA, type DotIconCanonicalName } from '@nothing-ui/dot-icons';
import { getCatalogEntry } from '@nothing-ui/registry';
import type { AppSection } from '../components/layout/site-header';
import type { DocsHubTab } from '../components/layout/search-dialog';

/**
 * URL scheme for the docs app:
 *
 *   /                      overview
 *   /components            components explorer (default component)
 *   /components/:slug      component page
 *   /charts                charts hub
 *   /charts/:slug          chart component page
 *   /widgets               widgets hub
 *   /widgets/:slug         widget page
 *   /glyph                 Glyph Studio
 *   /glyph/:slug           glyph catalog page (e.g. glyph-matrix)
 *   /icons                 Dot Icon explorer
 *   /icons/:name           Dot Icon explorer with an icon selected
 *   /docs                  docs hub (CLI & Setup)
 *   /docs/:tab             docs hub tab (native, tokens, roadmap, changelog)
 *   /showcase              showcase gallery
 *
 * Unknown paths fall back to the closest hub, or the overview.
 */

export const DEFAULT_COMPONENT_SLUG = 'button';
export const DEFAULT_ICON: DotIconCanonicalName = 'wifi';
export const DEFAULT_DOCS_TAB: DocsHubTab = 'cli';

const DOCS_TABS: readonly DocsHubTab[] = ['cli', 'native', 'tokens', 'roadmap', 'changelog'];

export interface AppRoute {
  section: AppSection;
  /** Catalog slug when `section === 'components'`. */
  slug?: string;
  /** Docs hub tab when `section === 'docs'`. */
  docsTab?: DocsHubTab;
  /** Selected icon when `section === 'icons'`. */
  icon?: DotIconCanonicalName;
}

export interface AppRouteState {
  section: AppSection;
  activeSlug: string;
  docsTab: DocsHubTab;
  selectedIcon: DotIconCanonicalName;
}

function isIconName(name: string): name is DotIconCanonicalName {
  return Object.prototype.hasOwnProperty.call(DOT_ICON_METADATA, name);
}

function isDocsTab(tab: string): tab is DocsHubTab {
  return (DOCS_TABS as readonly string[]).includes(tab);
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

/** Parses a pathname into an app route. Never throws. */
export function parseAppPath(pathname: string): AppRoute {
  const [head = '', rawParam] = pathname
    .split('/')
    .filter(Boolean)
    .map((part) => safeDecode(part).toLowerCase());
  const param = rawParam ?? '';

  switch (head) {
    case '':
      return { section: 'overview' };
    case 'components':
    case 'charts':
    case 'widgets':
    case 'glyph': {
      if (param && getCatalogEntry(param)) {
        return { section: 'components', slug: param };
      }
      if (head === 'components') return { section: 'components', slug: DEFAULT_COMPONENT_SLUG };
      return { section: head === 'glyph' ? 'studio' : head };
    }
    case 'icons':
      return { section: 'icons', icon: param && isIconName(param) ? param : DEFAULT_ICON };
    case 'docs':
      return { section: 'docs', docsTab: param && isDocsTab(param) ? param : DEFAULT_DOCS_TAB };
    case 'showcase':
      return { section: 'showcase' };
    default:
      return { section: 'overview' };
  }
}

/** Returns the URL prefix a catalog entry lives under. */
export function getCatalogPathPrefix(slug: string): string {
  const entry = getCatalogEntry(slug);
  if (entry?.kind === 'widget') return '/widgets';
  if (entry?.kind === 'glyph') return '/glyph';
  if (entry?.category === 'Charts') return '/charts';
  return '/components';
}

/** Formats the canonical pathname for the current app state. */
export function formatAppPath(state: AppRouteState): string {
  switch (state.section) {
    case 'overview':
      return '/';
    case 'components':
      return `${getCatalogPathPrefix(state.activeSlug)}/${encodeURIComponent(state.activeSlug)}`;
    case 'charts':
      return '/charts';
    case 'widgets':
      return '/widgets';
    case 'studio':
      return '/glyph';
    case 'icons':
      return state.selectedIcon === DEFAULT_ICON
        ? '/icons'
        : `/icons/${encodeURIComponent(state.selectedIcon)}`;
    case 'docs':
      return state.docsTab === DEFAULT_DOCS_TAB ? '/docs' : `/docs/${state.docsTab}`;
    case 'showcase':
      return '/showcase';
    default:
      return '/';
  }
}
