import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AppData } from '@/data/types';
import { useLanguage } from '@/contexts/LanguageContext';
import StoreAppCard from './StoreAppCard';

interface AppDetailDialogProps {
  app: AppData | null;
  onOpenChange: (open: boolean) => void;
}

export default function AppDetailDialog({ app, onOpenChange }: AppDetailDialogProps) {
  const { t } = useLanguage();

  return (
    <Dialog open={Boolean(app)} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="sr-only">
          <DialogTitle>{app ? app.name : t('catalog.applications')}</DialogTitle>
        </DialogHeader>
        {app && <StoreAppCard app={app} detailed />}
      </DialogContent>
    </Dialog>
  );
}
