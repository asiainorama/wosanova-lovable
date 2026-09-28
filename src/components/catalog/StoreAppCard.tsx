import { ExternalLink, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/types';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from '@/components/cards/AvatarFallback';

interface StoreAppCardProps {
  app: AppData;
  featured?: boolean;
  tone?: 'rose' | 'teal' | 'amber' | 'blue';
}

const tones = {
  rose: 'bg-feature-rose',
  teal: 'bg-feature-teal',
  amber: 'bg-feature-amber',
  blue: 'bg-feature-blue',
};

export default function StoreAppCard({ app, featured = false, tone = 'rose' }: StoreAppCardProps) {
  const { iconUrl, imageError, handleImageError } = useAppLogo(app);
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const userId = useAuthenticatedUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const favorite = isFavorite(app.id);
  const categoryKey = `category.${app.category.toLowerCase()}`;
  const categoryLabel = t(categoryKey) === categoryKey ? app.category : t(categoryKey);

  const toggleFavorite = () => {
    if (!userId) {
      toast.info(t('catalog.signInFavorites'));
      navigate('/auth');
      return;
    }
    if (favorite) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  const icon = imageError || !iconUrl ? (
    <AppAvatarFallback appName={app.name} className={featured ? 'h-16 w-16 rounded-lg' : 'h-12 w-12 rounded-lg'} />
  ) : (
    <img src={iconUrl} alt="" onError={handleImageError} loading="lazy" className={`${featured ? 'h-16 w-16' : 'h-12 w-12'} rounded-lg object-contain bg-card p-1`} />
  );

  if (featured) {
    return (
      <article className={`relative flex min-h-[240px] flex-col justify-between overflow-hidden rounded-lg border border-border p-5 sm:p-6 ${tones[tone]} text-feature-foreground`}>
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-70">{categoryLabel}</span>
          <Button variant="ghost" size="icon" onClick={toggleFavorite} aria-label={favorite ? t('catalog.removeFavorite') : t('catalog.addFavorite')} title={favorite ? t('catalog.removeFavorite') : t('catalog.addFavorite')} className="h-8 w-8 text-feature-foreground hover:bg-background/20">
            <Heart className={`h-4 w-4 ${favorite ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3">{icon}</div>
            <h3 className="line-clamp-1 text-2xl font-bold">{app.name}</h3>
            <p className="mt-1 line-clamp-2 max-w-sm text-sm opacity-80">{app.description}</p>
            <Button asChild size="sm" variant="secondary" className="mt-4 gap-2">
              <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('catalog.visit')} ${app.name}`}><ExternalLink className="h-4 w-4" />{t('catalog.visit')}</a>
            </Button>
          </div>
          <div className="hidden shrink-0 sm:flex h-28 w-28 items-center justify-center rounded-lg border border-feature-foreground/10 bg-background/10 lg:h-36 lg:w-36">
            {imageError || !iconUrl ? <AppAvatarFallback appName={app.name} className="h-20 w-20 rounded-lg" /> : <img src={iconUrl} alt="" onError={handleImageError} className="h-20 w-20 object-contain lg:h-24 lg:w-24" />}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-border bg-card p-4 text-card-foreground transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold" title={app.name}>{app.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{categoryLabel}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={toggleFavorite} aria-label={favorite ? t('catalog.removeFavorite') : t('catalog.addFavorite')} title={favorite ? t('catalog.removeFavorite') : t('catalog.addFavorite')} className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary">
          <Heart className={`h-4 w-4 ${favorite ? 'fill-current text-primary' : ''}`} />
        </Button>
      </div>
      <p className="mt-4 line-clamp-2 min-h-[40px] text-sm text-muted-foreground">{app.description}</p>
      <Button asChild variant="secondary" size="sm" className="mt-4 w-fit gap-2">
        <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('catalog.visit')} ${app.name}`}><ExternalLink className="h-3.5 w-3.5" />{t('catalog.visit')}</a>
      </Button>
    </article>
  );
}