import { useMemo } from 'react';

export interface SidebarLayoutConfig {
  width: {
    mobile: string;
    desktop: string;
  };
  heights: {
    header: string;
    footer: string;
  };
  overlay: {
    background: string;
    zIndex: string;
    backdropBlur: string;
  };
  sidebar: {
    background: string;
    shadow: string;
    border: string;
    zIndex: string;
    transition: string;
  };
}

export const useSidebarLayout = () => {
  const config: SidebarLayoutConfig = useMemo(() => ({
    width: {
      mobile: 'w-full',
      desktop: 'md:w-[400px]'
    },
    heights: {
      header: 'h-[60px]',
      footer: 'h-[60px]'
    },
    overlay: {
      background: 'bg-black/20',
      backdropBlur: 'backdrop-blur-sm',
      zIndex: 'z-[100]'
    },
    sidebar: {
      background: 'backdrop-blur-xl bg-white/90 dark:bg-gray-900/90',
      shadow: 'shadow-2xl shadow-black/10 dark:shadow-black/30',
      border: 'border-white/10 dark:border-gray-800/20 border-r',
      zIndex: 'z-[101]',
      transition: 'transition-transform duration-300 ease-in-out'
    }
  }), []);

  const getSidebarClasses = (isOpen: boolean) => {
    const baseClasses = [
      'fixed top-0 left-0 h-screen flex flex-col',
      config.width.mobile,
      config.width.desktop,
      config.sidebar.background,
      config.sidebar.shadow,
      config.sidebar.border,
      config.sidebar.zIndex,
      config.sidebar.transition
    ];

    const transformClass = isOpen ? 'translate-x-0' : '-translate-x-full';
    
    return [...baseClasses, transformClass].join(' ');
  };

  const getOverlayClasses = () => {
    return [
      'fixed inset-0 md:hidden',
      config.overlay.background,
      config.overlay.backdropBlur,
      config.overlay.zIndex
    ].join(' ');
  };

  const getSectionClasses = (type: 'header' | 'footer') => {
    const height = type === 'header' ? config.heights.header : config.heights.footer;
    const borderClass = type === 'header' ? 'border-b' : 'border-t';
    
    return [
      height,
      'flex items-center',
      'backdrop-blur-sm bg-white/40 dark:bg-gray-800/40',
      `${borderClass} border-white/10 dark:border-gray-700/20`
    ].join(' ');
  };

  return {
    config,
    getSidebarClasses,
    getOverlayClasses,
    getSectionClasses
  };
};