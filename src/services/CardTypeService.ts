import { AppData } from '@/data/types';

export type CardType = 'list' | 'home' | 'large' | 'grid';

export interface CardTypeConfig {
  type: CardType;
  shouldOpenDirectly: boolean;
}

export class CardTypeService {
  static determineCardType(
    listView: boolean,
    isHomePage: boolean,
    isCatalogPage: boolean,
    isLarge: boolean
  ): CardTypeConfig {
    if (listView) {
      return {
        type: 'list',
        shouldOpenDirectly: !isCatalogPage
      };
    }

    if (isHomePage) {
      return {
        type: 'home',
        shouldOpenDirectly: true
      };
    }

    if (isLarge) {
      return {
        type: 'large',
        shouldOpenDirectly: !isCatalogPage
      };
    }

    return {
      type: 'grid',
      shouldOpenDirectly: !isCatalogPage
    };
  }
}