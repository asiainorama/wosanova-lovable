import { AppData } from '@/data/types';
import { useAppLogo } from '@/hooks/useAppLogo';
import AppAvatarFallback from '@/components/cards/AvatarFallback';
import { useLogoTone } from './useLogoTone';

interface AppIconTileProps {
  app: AppData;
  onSelect: (app: AppData) => void;
}

const tones = {
  rose: 'bg-logo-rose',
  teal: 'bg-logo-teal',
  amber: 'bg-logo-amber',
  blue: 'bg-logo-blue',
};

/** Compact store-style icon; opens the detailed card in a dialog when pressed. */
export default function AppIconTile({ app, onSelect }: AppIconTileProps) {
  const { iconUrl, imageRef, handleImageError, handleImageLoad, imageError } = useAppLogo(app);
  const { tone, detected } = useLogoTone(imageError ? '' : iconUrl, app.id);
  const hasLogo = Boolean(iconUrl && !imageError);
  const surface = detected || !hasLogo ? tones[tone] : 'bg-card';

  return (
    <button
      type="button"
      onClick={() => onSelect(app)}
      className="group flex w-full flex-col items-center gap-2 rounded-lg p-2 text-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border ${surface} transition-transform group-hover:scale-105`}
      >
        {hasLogo ? (
          <img
            ref={imageRef}
            src={iconUrl}
            alt=""
            onError={handleImageError}
            onLoad={handleImageLoad}
            loading="lazy"
            className="h-12 w-12 rounded-lg bg-card object-contain p-1"
          />
        ) : (
          <AppAvatarFallback appName={app.name} className="h-12 w-12 rounded-lg" />
        )}
      </span>
      <span className="line-clamp-2 w-full text-xs font-medium leading-tight text-foreground">{app.name}</span>
    </button>
  );
}
