import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ScreenOverlayProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  style?: React.CSSProperties;
}

const ScreenOverlay: React.FC<ScreenOverlayProps> = ({ children, id, className, style }) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const close = () => navigate('/');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') navigate('/'); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="true"
      className={cn('fixed inset-0 z-50 overflow-y-auto overscroll-contain animate-fade-in', className)}
      style={style}
    >
      <div className="sticky top-0 z-30 flex justify-end px-3 pt-3 pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          onClick={close}
          aria-label={t('overlay.close')}
          title={t('overlay.close')}
          className="pointer-events-auto rounded-full shadow-md backdrop-blur-md bg-background/80"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="-mt-12">{children}</div>
    </div>
  );
};

export default ScreenOverlay;
