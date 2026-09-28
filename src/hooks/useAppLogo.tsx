import { useState, useEffect, useRef, useCallback } from 'react';
import { getCachedLogo, registerSuccessfulLogo } from '@/services/LogoCacheService';
import { AppData } from '@/data/apps';
import { supabase } from '@/integrations/supabase/client';

interface UseAppLogoResult {
  iconUrl: string;
  imageLoading: boolean;
  imageError: boolean;
  imageRef: React.RefObject<HTMLImageElement>;
  handleImageError: () => void;
  handleImageLoad: () => void;
}

const GOOD_KEY = (id: string) => `icon_good_${id}`;
const reported = new Set<string>();

const getDomain = (url: string) => {
  try { return new URL(url).hostname; } catch { return ''; }
};

/** Ordered list of icon sources to try for an app. */
const buildCandidates = (app: AppData, dbIcon?: string | null): string[] => {
  const domain = getDomain(app.url);
  let origin = '';
  try { origin = new URL(app.url).origin; } catch { /* ignore */ }
  const list = [
    localStorage.getItem(GOOD_KEY(app.id)) || '',
    dbIcon || '',
    getCachedLogo(app),
    app.icon,
    domain ? `https://cdn.brandfetch.io/${domain}/w/256/h/256?c=1idP0DrE2OZDRG5HYTw` : '',
    origin ? `${origin}/apple-touch-icon.png` : '',
    domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '',
    domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : '',
  ];
  return [...new Set(list.filter(u => u && !u.includes('placeholder')))];
};

const reportBroken = (appId: string) => {
  if (reported.has(appId)) return;
  reported.add(appId);
  supabase.functions.invoke('refresh-app-icons', { body: { appId } }).catch(() => {});
};

export const useAppLogo = (app: AppData): UseAppLogoResult => {
  const imageRef = useRef<HTMLImageElement>(null);
  const [candidates, setCandidates] = useState<string[]>(() => buildCandidates(app));
  const [index, setIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let mounted = true;
    setCandidates(buildCandidates(app));
    setIndex(0);
    setImageError(false);
    if (!localStorage.getItem(GOOD_KEY(app.id))) {
      supabase.from('app_icons').select('icon_url').eq('app_id', app.id).maybeSingle()
        .then(({ data }) => {
          if (mounted && data?.icon_url) {
            setCandidates(buildCandidates(app, data.icon_url));
            setIndex(0);
          }
        });
    }
    return () => { mounted = false; };
  }, [app.id]);

  const next = useCallback(() => {
    setIndex(i => {
      if (i + 1 < candidates.length) return i + 1;
      setImageError(true);
      reportBroken(app.id);
      return i;
    });
  }, [candidates.length, app.id]);

  const iconUrl = candidates[index] || '';

  const handleImageError = () => {
    if (localStorage.getItem(GOOD_KEY(app.id)) === iconUrl) localStorage.removeItem(GOOD_KEY(app.id));
    next();
  };

  const handleImageLoad = () => {
    const img = imageRef.current;
    // Treat tiny images (generic globe / 16px favicons) as broken
    if (img && img.naturalWidth > 0 && img.naturalWidth < 32 && index + 1 < candidates.length) {
      next();
      return;
    }
    setImageError(false);
    localStorage.setItem(GOOD_KEY(app.id), iconUrl);
    const domain = getDomain(app.url);
    if (domain) registerSuccessfulLogo(app.id, iconUrl, domain, 'fast-load');
  };

  return { iconUrl, imageLoading: false, imageError, imageRef, handleImageError, handleImageLoad };
};

export default useAppLogo;
