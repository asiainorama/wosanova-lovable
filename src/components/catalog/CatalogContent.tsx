import { useEffect, useMemo, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';
import StoreAppCard from './StoreAppCard';

interface CatalogContentProps {
  loading: boolean;
  selectedCategory: string | null;
  searchTerm: string;
  apps: AppData[];
  onCategoryChange: (category: string | null) => void;
}

const byName = (a: AppData, b: AppData) => a.name.localeCompare(b.name);

const CatalogContent = ({ loading, selectedCategory, searchTerm, apps, onCategoryChange }: CatalogContentProps) => {
  const { t } = useLanguage();
  const [visibleCount, setVisibleCount] = useState(12);
  const searching = Boolean(searchTerm.trim());
  const filteredView = searching || selectedCategory !== null;

  useEffect(() => setVisibleCount(12), [searchTerm, selectedCategory]);

  const groups = useMemo(() => {
    const map = new Map<string, AppData[]>();
    apps.forEach(app => map.set(app.category, [...(map.get(app.category) || []), app]));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => ({ category, items: items.sort(byName) }));
  }, [apps]);

  const featured = useMemo(() => [...apps].sort((a, b) => {
    const aTime = a.created_at ? Date.parse(a.created_at) || 0 : 0;
    const bTime = b.created_at ? Date.parse(b.created_at) || 0 : 0;
    return bTime - aTime || byName(a, b);
  }).slice(0, 3), [apps]);

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
        {filteredView && <Button variant="outline" className="mt-6" onClick={() => { onCategoryChange(null); window.dispatchEvent(new CustomEvent('catalogClearSearch')); }}>{t('catalog.allApps')}</Button>}
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16">
      <div className="border-b border-border pb-6 pt-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">WosaNova</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">{filteredView ? selectedCategory && !searching ? categoryLabel(selectedCategory) : t('catalog.results') : t('catalog.title')}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{filteredView ? `${apps.length} ${t('catalog.applications').toLowerCase()}` : t('catalog.storeSubtitle')}</p>
      </div>

      {filteredView ? (
        <section aria-label={t('catalog.results')}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedApps.slice(0, visibleCount).map(app => <StoreAppCard key={app.id} app={app} />)}
          </div>
          {visibleCount < sortedApps.length && <Button variant="outline" className="mt-6" onClick={() => setVisibleCount(count => count + 12)}>{t('catalog.showMore')}</Button>}
        </section>
      ) : (
        <>
          <section aria-labelledby="featured-title">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t('catalog.discover')}</p><h2 id="featured-title" className="mt-1 text-2xl font-bold">{t('catalog.featured')}</h2></div>
              <span className="hidden text-sm text-muted-foreground sm:block">{t('catalog.featuredSubtitle')}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((app, index) => <StoreAppCard key={app.id} app={app} featured tone={(['rose', 'teal', 'amber'] as const)[index]} />)}
            </div>
          </section>

          <section aria-labelledby="categories-title">
            <div className="mb-5"><p className="text-xs font-semibold uppercase tracking-widest text-primary">{t('catalog.explore')}</p><h2 id="categories-title" className="mt-1 text-2xl font-bold">{t('catalog.allCategories')}</h2></div>
            <div className="flex flex-wrap gap-2">
              {groups.map(({ category }) => <Button key={category} variant="outline" size="sm" className="rounded-full" onClick={() => onCategoryChange(category)}>{categoryLabel(category)}</Button>)}
            </div>
          </section>

          {groups.map(({ category, items }) => (
            <section key={category} aria-label={categoryLabel(category)} className="border-t border-border pt-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div><h2 className="text-xl font-bold sm:text-2xl">{categoryLabel(category)}</h2><p className="mt-1 text-sm text-muted-foreground">{items.length} {t('catalog.applications').toLowerCase()}</p></div>
                <Button variant="ghost" className="shrink-0 gap-1 text-primary" onClick={() => onCategoryChange(category)}>{t('catalog.viewAll')}<ArrowRight className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.slice(0, 4).map(app => <StoreAppCard key={app.id} app={app} />)}
              </div>
            </section>
          ))}

          <section aria-labelledby="all-apps-title" className="border-t border-border pt-8">
            <div className="mb-5 flex items-center justify-between"><h2 id="all-apps-title" className="text-xl font-bold sm:text-2xl">{t('catalog.allApps')}</h2><span className="text-sm text-muted-foreground">{apps.length}</span></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedApps.slice(0, visibleCount).map(app => <StoreAppCard key={app.id} app={app} />)}
            </div>
            {visibleCount < sortedApps.length && <Button variant="outline" className="mt-6" onClick={() => setVisibleCount(count => count + 12)}>{t('catalog.showMore')}</Button>}
          </section>
        </>
      )}
    </div>
  );
};

export default CatalogContent;