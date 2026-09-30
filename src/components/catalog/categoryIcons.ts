import {
  BookOpen,
  Gamepad2,
  GraduationCap,
  LayoutGrid,
  MessagesSquare,
  Newspaper,
  Palette,
  ShoppingBag,
  Users,
  Wallet,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Themed icon per catalog category. Keys are normalised (lowercase, accent-free)
 * so both Spanish database values and English labels resolve to the same icon.
 */
const iconByCategory: Record<string, LucideIcon> = {
  'comercio electronico': ShoppingBag,
  'e-commerce': ShoppingBag,
  ecommerce: ShoppingBag,
  comunicacion: MessagesSquare,
  communication: MessagesSquare,
  creatividad: Palette,
  creativity: Palette,
  educacion: GraduationCap,
  education: GraduationCap,
  entretenimiento: Gamepad2,
  entertainment: Gamepad2,
  finanzas: Wallet,
  finance: Wallet,
  'noticias e informacion': Newspaper,
  'news & information': Newspaper,
  news: Newspaper,
  productividad: Zap,
  productivity: Zap,
  'redes sociales': Users,
  'social networks': Users,
  social: Users,
  utilidades: Wrench,
  utilities: Wrench,
  lectura: BookOpen,
  reading: BookOpen,
};

const normalise = (value: string) =>
  value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export function getCategoryIcon(category: string): LucideIcon {
  return iconByCategory[normalise(category)] ?? LayoutGrid;
}
