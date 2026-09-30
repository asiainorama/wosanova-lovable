import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from '@/components/cards/AvatarFallback';
import { useLogoTone } from './useLogoTone';
import InstallButton from './InstallButton';

interface StoreAppCardProps {
  app: AppData;
  featured?: boolean;
  prominent?: boolean;
  detailed?: boolean;
}

const tones = {
  rose: 'bg-logo-rose',
  teal: 'bg-logo-teal',
  amber: 'bg-logo-amber',
  blue: 'bg-logo-blue',
};

export default function StoreAppCard({ app, featured = false, prominent = false, detailed = false }: StoreAppCardProps) {
  const { iconUrl, imageRef, handleImageError, handleImageLoad, imageError } = useAppLogo(app);
  const { tone, detected } = useLogoTone(imageError ? '' : iconUrl, app.id);
  const hasLogo = Boolean(iconUrl && !imageError);
  const cardBackground = detected || !hasLogo ? tones[tone] : 'bg-card';
  const themed = detected || !hasLogo;
  const { t } = useLanguage();
  const categoryKey = `category.${app.category.toLowerCase()}`;
  const categoryLabel = t(categoryKey) === categoryKey ? app.category : t(categoryKey);

  const icon = !hasLogo ? (
    <AppAvatarFallback appName={app.name} className={featured || detailed ? 'h-16 w-16 rounded-lg' : 'h-12 w-12 rounded-lg'} />
  ) : (
    <img ref={imageRef} src={iconUrl} alt="" onError={handleImageError} onLoad={handleImageLoad} loading="lazy" className={`${featured || detailed ? 'h-16 w-16' : 'h-12 w-12'} rounded-lg object-contain bg-card p-1`} />
  );

  if (featured) {
    return (
      <article className={`catalog-feature-shadow relative flex h-[320px] flex-col justify-between overflow-hidden rounded-lg border border-border p-5 sm:p-6 ${cardBackground} ${themed ? 'text-feature-foreground' : 'text-card-foreground'}`}>
        {hasLogo && <img src={iconUrl} alt="" aria-hidden="true" className="catalog-feature-art pointer-events-none absolute -right-8 bottom-0 h-48 w-48 object-cover opacity-25 sm:h-56 sm:w-56" />}
        {!hasLogo && <span aria-hidden="true" className="catalog-feature-art pointer-events-none absolute -right-6 bottom-0 text-[180px] font-black leading-none opacity-10">{app.name.charAt(0)}</span>}
        <div className="pointer-events-none absolute inset-0 bg-feature-overlay" aria-hidden="true" />
        <div className="relative flex items-start justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest opacity-70">{categoryLabel}</span>
        </div>
        <div className="relative mt-6 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3">{icon}</div>
            <h3 className="line-clamp-1 text-2xl font-bold">{app.name}</h3>
            <p className="mt-1 line-clamp-2 max-w-sm text-sm opacity-80">{app.description}</p>
            <Button asChild size="sm" variant="secondary" className="mt-4 gap-2">
              <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('catalog.visit')} ${app.name}`}><ExternalLink className="h-4 w-4" />{t('catalog.visit')}</a>
            </Button>
          </div>
          {prominent && <div className="hidden h-28 w-28 shrink-0 items-center justify-center rounded-lg border border-feature-foreground/10 bg-background/40 sm:flex lg:h-36 lg:w-36">{icon}</div>}
        </div>
        <InstallButton app={app} className="absolute bottom-4 right-4 z-10 sm:bottom-5 sm:right-5" />
      </article>
    );
  }

  return (
    <article className={`relative flex min-w-0 flex-col overflow-hidden rounded-lg border border-border ${cardBackground} ${themed ? 'text-feature-foreground' : 'text-card-foreground'} p-4 transition-colors hover:border-primary/40`}>
      {hasLogo && <img src={iconUrl} alt="" aria-hidden="true" className="catalog-card-wash pointer-events-none absolute -right-3 -top-3 h-32 w-32 object-cover opacity-20" />}
      <div className="relative flex items-start gap-3">
        {icon}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold" title={app.name}>{app.name}</h3>
          <p className="truncate text-xs text-feature-foreground/70">{categoryLabel}</p>
        </div>
      </div>
      <p className={`relative mt-4 ${detailed ? '' : 'line-clamp-2 min-h-[40px]'} text-sm text-feature-foreground/80`}>{app.description}</p>
      <div className="relative mt-4 flex items-end justify-between gap-3">
        <Button asChild variant="secondary" size="sm" className="gap-2">
          <a href={app.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('catalog.visit')} ${app.name}`}><ExternalLink className="h-3.5 w-3.5" />{t('catalog.visit')}</a>
        </Button>
        <InstallButton app={app} />
      </div>
    </article>
  );
}
