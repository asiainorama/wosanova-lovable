import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppContext } from '@/contexts/AppContext';
import StoreAppCard from './StoreAppCard';
import AppIconTile from './AppIconTile';
import AppDetailDialog from './AppDetailDialog';
import { getCategoryIcon } from './categoryIcons';

interface CatalogContentProps {
  loading: boolean;
  selectedCategory: string | null;
  searchTerm: string;
  apps: AppData[];
  onCategoryChange: (category: string | null) => void;
  onClear: () => void;
}

const byName = (a: AppData, b: AppData) => a.name.localeCompare(b.name);

const CatalogContent = ({ loading, selectedCategory, searchTerm, apps, onCategoryChange, onClear }: CatalogContentProps) => {
  const { t } = useLanguage();
  const { allApps } = useAppContext();
  const [visibleCount, setVisibleCount] = useState(30);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);
  const searching = Boolean(searchTerm.trim());
  const filteredView = searching || selectedCategory !== null;

  useEffect(() => setVisibleCount(30), [searchTerm, selectedCategory]);

  useEffect(() => {
    if (featuredIds.length || !allApps.length) return;
    const previous = new Set(JSON.parse(sessionStorage.getItem('catalog-last-featured') || '[]') as string[]);
    const unused = allApps.filter(app => !previous.has(app.id));
    const pool = unused.length >= Math.min(3, allApps.length) ? [...unused] : [...allApps];
    for (let i = 0; i < Math.min(3, pool.length); i++) {
      const chosen = i + Math.floor(Math.random() * (pool.length - i));
      [pool[i], pool[chosen]] = [pool[chosen], pool[i]];
    }
    const nextIds = pool.slice(0, 3).map(app => app.id);
    sessionStorage.setItem('catalog-last-featured', JSON.stringify(nextIds));
    setFeaturedIds(nextIds);
  }, [allApps, featuredIds.length]);

  const groups = useMemo(() => {
    const map = new Map<string, AppData[]>();
    apps.forEach(app => map.set(app.category, [...(map.get(app.category) || []), app]));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => ({ category, items: items.sort(byName) }));
  }, [apps]);

  const featured = useMemo(() => featuredIds.map(id => allApps.find(app => app.id === id)).filter((app): app is AppData => Boolean(app)), [allApps, featuredIds]);

  const sortedApps = useMemo(() => [...apps].sort(byName), [apps]);

  const categoryLabel = (category: string) => {
    const key = `category.${category.toLowerCase()}`;
    return t(key) === key ? category : t(key);
  };

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label={t('catalog.loading')}><div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>;
  }

  if (!apps.length) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">{t('catalog.noResults')}</h1>
        <p className="mt-2 text-muted-foreground">{t('catalog.tryAnother')}</p>
        {filteredView && <Button variant="outline" className="mt-6" onClick={onClear}>{t('catalog.allApps')}</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      <div className="border-b border-border pb-6 pt-3">
        {filteredView && (
          <Button variant="ghost" size="sm" className="-ml-2 mb-2" onClick={() => { onClear(); onCategoryChange(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <ArrowLeft className="h-4 w-4" /> {t('catalog.back')}
          </Button>
        )}
        {(() => {
          const showCategory = filteredView && selectedCategory && !searching;
          const HeadingIcon = showCategory ? getCategoryIcon(selectedCategory) : null;
          return (
            <h1 className="flex items-center gap-3 text-3xl font-bold text-foreground sm:text-4xl">
              {HeadingIcon && (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:h-12 sm:w-12">
                  <HeadingIcon className="h-6 w-6" aria-hidden="true" />
                </span>
              )}
              <span className="min-w-0">{filteredView ? (showCategory ? categoryLabel(selectedCategory) : t('catalog.results')) : t('catalog.title')}</span>
            </h1>
          );
        })()}
        {!filteredView && <p className="mt-2 text-sm text-muted-foreground">{t('catalog.storeSubtitle')}</p>}
      </div>

      {filteredView ? (
        <section aria-label={t('catalog.results')}>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {sortedApps.slice(0, visibleCount).map(app => <AppIconTile key={app.id} app={app} onSelect={setSelectedApp} />)}
          </div>
          {visibleCount < sortedApps.length && <Button variant="outline" className="mt-6" onClick={() => setVisibleCount(count => count + 24)}>{t('catalog.showMore')}</Button>}
        </section>
      ) : (
        <>
          <section aria-labelledby="featured-title">
            <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t('catalog.discover')}</p><h2 id="featured-title" className="mt-1 text-2xl font-bold">{t('catalog.featured')}</h2></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {featured.map((app, index) => <div key={app.id} className={index === 0 ? 'md:col-span-2' : 'min-w-0'}><StoreAppCard app={app} featured prominent={index === 0} /></div>)}
            </div>
          </section>

          <section aria-labelledby="categories-title">
            <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t('catalog.explore')}</p><h2 id="categories-title" className="mt-1 text-2xl font-bold">{t('catalog.allCategories')}</h2></div>
            <div className="flex flex-wrap justify-center gap-2 lg:flex-nowrap lg:gap-1">
              {groups.map(({ category }) => {
                const Icon = getCategoryIcon(category);
                return (
                  <Button key={category} variant="outline" size="sm" className="max-w-full gap-1.5 rounded-full px-3 text-xs lg:px-2" onClick={() => onCategoryChange(category)}>
                    <Icon className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                    {categoryLabel(category)}
                  </Button>
                );
              })}
            </div>
          </section>

          {groups.map(({ category, items }) => {
            const Icon = getCategoryIcon(category);
            return (
              <section key={category} aria-label={categoryLabel(category)} className="border-t border-border pt-8">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2 className="flex min-w-0 items-center gap-2 text-xl font-bold sm:text-2xl">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                    <span className="truncate">{categoryLabel(category)}</span>
                  </h2>
                  <Button variant="ghost" className="shrink-0 gap-1 text-primary" onClick={() => onCategoryChange(category)}>{t('catalog.viewAll')}<ArrowRight className="h-4 w-4" /></Button>
                </div>
                <div className="-mx-1 grid grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-1 pb-2 auto-cols-[minmax(84px,1fr)] sm:auto-cols-[minmax(96px,1fr)]">
                  {items.slice(0, 16).map(app => <AppIconTile key={app.id} app={app} onSelect={setSelectedApp} />)}
                </div>
              </section>
            );
          })}

          <section aria-labelledby="all-apps-title" className="border-t border-border pt-8">
            <div className="mb-5"><h2 id="all-apps-title" className="text-xl font-bold sm:text-2xl">{t('catalog.allApps')}</h2></div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {sortedApps.slice(0, visibleCount).map(app => <AppIconTile key={app.id} app={app} onSelect={setSelectedApp} />)}
            </div>
            {visibleCount < sortedApps.length && <Button variant="outline" className="mt-6" onClick={() => setVisibleCount(count => count + 24)}>{t('catalog.showMore')}</Button>}
          </section>
        </>
      )}
      <AppDetailDialog app={selectedApp} onOpenChange={open => { if (!open) setSelectedApp(null); }} />
    </div>
  );
};

export default CatalogContent;