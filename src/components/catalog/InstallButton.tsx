import { Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AppData } from '@/data/types';
import { useAppContext } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthenticatedUser } from '@/hooks/useAuthenticatedUser';

interface InstallButtonProps {
  app: AppData;
  className?: string;
}

/** Store-style install toggle backed by the user's personal app collection. */
export default function InstallButton({ app, className = '' }: InstallButtonProps) {
  const { addToFavorites, removeFromFavorites, isFavorite } = useAppContext();
  const userId = useAuthenticatedUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const installed = isFavorite(app.id);

  const toggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (!userId) {
      toast.info(t('catalog.signInInstall'));
      navigate('/auth');
      return;
    }
    if (installed) {
      removeFromFavorites(app.id);
    } else {
      addToFavorites(app);
    }
  };

  const palette = installed
    ? 'bg-install-soft text-install-soft-foreground hover:bg-install-soft/80'
    : 'bg-install text-install-foreground hover:bg-install/90';

  return (
    <Button
      type="button"
      size="sm"
      variant="ghost"
      onClick={toggle}
      aria-pressed={installed}
      className={`h-8 gap-1.5 rounded-full px-4 text-xs font-semibold ${palette} ${className}`}
    >
      {installed && <Check className="h-3.5 w-3.5" />}
      {installed ? t('catalog.installed') : t('catalog.install')}
    </Button>
  );
}
