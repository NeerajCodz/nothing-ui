import * as React from 'react';
import type { DotIconCanonicalName } from '@nothing-ui/dot-icons';
import { CATALOG, PLANNED_WIDGETS, getCatalogEntry, getWidgetCatalog } from '@nothing-ui/registry';
import { NothingToastRegion } from '@nothing-ui/ui';
import { SiteHeader, type AppSection } from './components/layout/site-header';
import { DocsSidebar } from './components/layout/docs-sidebar';
import { OnPageToc } from './components/layout/on-page-toc';
import { SearchDialog, type DocsHubTab } from './components/layout/search-dialog';
import { OverviewShowcase } from './components/overview-showcase';
import { ComponentsExplorer } from './components/components-explorer';
import { ChartsHub } from './components/charts/charts-hub';
import { WidgetsHub } from './components/widgets/widgets-hub';
import { ShowcaseGallery } from './components/showcase/showcase-gallery';
import { GlyphStudio } from './components/glyph/glyph-studio';
import { DotIconExplorer } from './components/icons/icon-explorer';
import { NativeDocsHub } from './components/native-docs-hub';
import { hasPropsPlayground } from './components/playground/props-playground';
import { getTocItemsForView } from './lib/toc';

export function NothingUiApp() {
  const [section, setSection] = React.useState<AppSection>('overview');
  const [activeSlug, setActiveSlug] = React.useState<string>('button');
  const [docsTab, setDocsTab] = React.useState<DocsHubTab>('cli');
  const [selectedIcon, setSelectedIcon] = React.useState<DotIconCanonicalName>('wifi');
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNavigate = (next: AppSection) => {
    setSection(next);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSelectComponent = (slug: string) => {
    setActiveSlug(slug);
    setSection('components');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSelectIcon = (iconId: DotIconCanonicalName) => {
    setSelectedIcon(iconId);
    setSection('icons');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleNavigateDocsTab = (tab: DocsHubTab) => {
    setDocsTab(tab);
    setSection('docs');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const activeEntry = getCatalogEntry(activeSlug);
  const tocItems = React.useMemo(
    () =>
      getTocItemsForView({
        section,
        docsTab,
        hasRelatedComponents: Boolean(activeEntry?.related && activeEntry.related.length > 0),
        hasPlayground: section === 'components' && hasPropsPlayground(activeSlug),
      }),
    [section, docsTab, activeEntry, activeSlug],
  );

  const pageTitle =
    section === 'components'
      ? activeEntry?.title ?? 'Components'
      : section === 'charts'
        ? 'Charts'
        : section === 'widgets'
          ? 'Widgets'
          : section === 'showcase'
            ? 'Nothing UI Showcase'
            : section === 'studio'
              ? 'Glyph System'
              : section === 'icons'
                ? 'Dot Icons'
                : section === 'docs'
                  ? `Docs (${docsTab})`
                  : 'Overview';

  const headerSection: AppSection =
    section === 'components'
      ? activeEntry?.kind === 'widget'
        ? 'widgets'
        : activeEntry?.kind === 'glyph'
          ? 'studio'
          : activeEntry?.category === 'Charts'
            ? 'charts'
            : 'components'
      : section;

  return (
    <div className="relative min-h-screen bg-[var(--nt-bg)] text-[var(--nt-primary)] selection:bg-[var(--nt-accent)] selection:text-white">
      <div className="nt-dot-field" aria-hidden="true" />
      <SiteHeader
        section={headerSection}
        onNavigate={handleNavigate}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* 3-Column Documentation Shell: Left Sidebar · Center Main · Right On-Page TOC */}
      <div className="relative z-10 mx-auto flex max-w-[1536px] items-start">
        <DocsSidebar
          section={section}
          activeSlug={activeSlug}
          docsTab={docsTab}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onNavigate={handleNavigate}
          onSelectComponent={handleSelectComponent}
          onNavigateDocsTab={handleNavigateDocsTab}
        />

        <main className="min-w-0 flex-1 px-4 py-7 sm:px-6 lg:px-8">
          {section === 'overview' && (
            <OverviewShowcase
              onSelectComponent={handleSelectComponent}
              onNavigate={(next) => handleNavigate(next)}
              onOpenRoadmap={() => handleNavigateDocsTab('roadmap')}
              onOpenCliSetup={() => handleNavigateDocsTab('cli')}
            />
          )}

          {section === 'components' && (
            <ComponentsExplorer
              activeSlug={activeSlug}
              onSelectSlug={handleSelectComponent}
              onOpenGlyphStudio={() => handleNavigate('studio')}
              onOpenIconExplorer={() => handleNavigate('icons')}
              onOpenWidgets={() => handleNavigate('widgets')}
            />
          )}

          {section === 'charts' && (
            <ChartsHub onSelectChart={handleSelectComponent} />
          )}

          {section === 'widgets' && (
            <WidgetsHub onSelectWidget={handleSelectComponent} />
          )}

          {section === 'showcase' && (
            <ShowcaseGallery onSelectComponent={handleSelectComponent} />
          )}

          {section === 'studio' && <GlyphStudio />}

          {section === 'icons' && <DotIconExplorer initialIcon={selectedIcon} />}

          {section === 'docs' && (
            <NativeDocsHub
              initialTab={docsTab}
              onTabChange={setDocsTab}
              onSelectComponent={handleSelectComponent}
            />
          )}

          <footer className="mt-14 border-t border-[var(--nt-line)] pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] text-[var(--nt-muted)]">
                <span className="text-[var(--nt-display)]">NOTHING UI</span>
                <span>·</span>
                <span>v0.4.0</span>
                <span>·</span>
                <span>Single Published Package: nthgui (Web + Native)</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-[var(--nt-secondary)]">
                <button
                  type="button"
                  onClick={() => handleNavigateDocsTab('native')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  React Native ({CATALOG.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateDocsTab('cli')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  CLI &amp; Setup
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('charts')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  Charts
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('widgets')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  Widgets ({getWidgetCatalog().length}
                  {PLANNED_WIDGETS.length > 0 ? ` + ${PLANNED_WIDGETS.length}` : ''})
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('showcase')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  Showcase (10)
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateDocsTab('tokens')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  Theme Customizer
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateDocsTab('roadmap')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  136-Component Map
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigateDocsTab('changelog')}
                  className="hover:text-[var(--nt-display)] cursor-pointer"
                >
                  Changelog
                </button>
              </div>
            </div>
          </footer>
        </main>

        <OnPageToc
          items={tocItems}
          pageTitle={pageTitle}
          onOpenSearch={() => setSearchOpen(true)}
        />
      </div>

      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onNavigate={handleNavigate}
        onSelectComponent={handleSelectComponent}
        onSelectIcon={handleSelectIcon}
        onNavigateDocsTab={handleNavigateDocsTab}
      />

      <NothingToastRegion />
    </div>
  );
}

export default NothingUiApp;
