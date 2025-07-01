import React from 'react';
import { AppData } from '@/data/types';
import { CardType } from '@/services/CardTypeService';
import ListViewCard from './ListViewCard';
import HomeCard from './HomeCard';
import LargeCard from './LargeCard';
import GridCard from './GridCard';

interface CardFactoryProps {
  cardType: CardType;
  app: AppData;
  favorite: boolean;
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  smallerIcons?: boolean;
  index?: number;
  handleAction: (e: React.MouseEvent) => void;
  handleClick?: () => void;
}

export const CardFactory: React.FC<CardFactoryProps> = ({
  cardType,
  app,
  favorite,
  showRemove = false,
  showManage = false,
  onShowDetails,
  smallerIcons = false,
  index = 0,
  handleAction,
  handleClick
}) => {
  const commonProps = {
    app,
    favorite,
    handleAction,
    showRemove,
    showManage,
    onShowDetails
  };

  switch (cardType) {
    case 'list':
      return (
        <ListViewCard 
          {...commonProps}
          handleClick={handleClick || (() => {})}
        />
      );

    case 'home':
      return (
        <HomeCard 
          {...commonProps}
          handleClick={handleClick || (() => {})}
          smallerIcons={smallerIcons}
          index={index}
        />
      );

    case 'large':
      return (
        <LargeCard 
          {...commonProps}
          handleClick={handleClick || (() => {})}
        />
      );

    case 'grid':
    default:
      return (
        <GridCard 
          {...commonProps}
          handleClick={handleClick}
          smallerIcons={smallerIcons}
        />
      );
  }
};