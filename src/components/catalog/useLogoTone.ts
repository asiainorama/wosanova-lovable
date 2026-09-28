import { useEffect, useState } from 'react';

export type LogoTone = 'rose' | 'teal' | 'amber' | 'blue';

const palette: LogoTone[] = ['rose', 'teal', 'amber', 'blue'];

function fallbackTone(key: string): LogoTone {
  let hash = 0;
  for (const character of key) hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  return palette[Math.abs(hash % palette.length)];
}

function classifyLogo(image: HTMLImageElement): LogoTone | null {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, 32, 32);
  const pixels = context.getImageData(0, 0, 32, 32).data;
  let red = 0, green = 0, blue = 0, weight = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const [r, g, b, alpha] = [pixels[i], pixels[i + 1], pixels[i + 2], pixels[i + 3]];
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    const strength = (alpha / 255) * (spread / 255);
    if (strength < 0.07) continue;
    red += r * strength;
    green += g * strength;
    blue += b * strength;
    weight += strength;
  }
  if (!weight) return null;
  red /= weight; green /= weight; blue /= weight;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let hue = 0;
  if (max !== min) {
    if (max === red) hue = ((green - blue) / (max - min) + 6) % 6;
    else if (max === green) hue = (blue - red) / (max - min) + 2;
    else hue = (red - green) / (max - min) + 4;
    hue *= 60;
  }
  if (hue < 45 || hue >= 320) return 'rose';
  if (hue < 85) return 'amber';
  if (hue < 185) return 'teal';
  return 'blue';
}

export function useLogoTone(url: string, key: string): { tone: LogoTone; detected: boolean } {
  const [result, setResult] = useState<{ tone: LogoTone; detected: boolean }>(() => ({ tone: fallbackTone(key), detected: false }));

  useEffect(() => {
    setResult({ tone: fallbackTone(key), detected: false });
    if (!url) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    let active = true;
    image.onload = () => {
      try {
        const result = classifyLogo(image);
        if (active && result) setResult({ tone: result, detected: true });
      } catch {
        // Remote logos without CORS permission still receive a stable themed fallback.
      }
    };
    image.src = url;
    return () => { active = false; };
  }, [url, key]);

  return result;
}