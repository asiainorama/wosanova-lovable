import type { CSSProperties } from 'react';
import liquidGlass from '@/assets/wallpapers/liquid-glass.jpg';
import obsidian from '@/assets/wallpapers/obsidian.jpg';
import cosmos from '@/assets/wallpapers/cosmos.jpg';
import geometric from '@/assets/wallpapers/geometric.jpg';
import dunes from '@/assets/wallpapers/dunes.jpg';
import luminous from '@/assets/wallpapers/luminous.jpg';

export type BackgroundType =
  | 'default'
  | 'gradient-blue'
  | 'gradient-purple'
  | 'gradient-green'
  | 'gradient-orange'
  | 'gradient-pink';

const base: CSSProperties = {
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundAttachment: 'fixed',
};

export const wallpaperImages: Record<BackgroundType, string> = {
  default: liquidGlass,
  'gradient-blue': obsidian,
  'gradient-purple': cosmos,
  'gradient-green': geometric,
  'gradient-orange': dunes,
  'gradient-pink': luminous,
};

export const wallpaperLabelKeys: Record<BackgroundType, string> = {
  default: 'profile.wallpaper.liquidGlass',
  'gradient-blue': 'profile.wallpaper.obsidian',
  'gradient-purple': 'profile.wallpaper.cosmos',
  'gradient-green': 'profile.wallpaper.geometric',
  'gradient-orange': 'profile.wallpaper.dunes',
  'gradient-pink': 'profile.wallpaper.luminous',
};

/** Wallpapers whose surface is bright: app names must be rendered dark on them. */
export const lightBackgrounds: BackgroundType[] = [
  'gradient-green',
  'gradient-orange',
  'gradient-pink',
];

export const backgroundStyles: Record<BackgroundType, CSSProperties> =
  (Object.keys(wallpaperImages) as BackgroundType[]).reduce((acc, key) => {
    acc[key] = { ...base, backgroundImage: `url(${wallpaperImages[key]})` };
    return acc;
  }, {} as Record<BackgroundType, CSSProperties>);
