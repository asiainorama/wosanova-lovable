
import React from 'react';
import { AppData } from '@/data/apps';
import { useAppCardLogic } from '@/hooks/useAppCardLogic';
import { CardFactory } from './cards/CardFactory';

interface AppCardProps {
  app: AppData; 
  showRemove?: boolean;
  showManage?: boolean;
  onShowDetails?: (app: AppData) => void;
  isLarge?: boolean;
  listView?: boolean;
  smallerIcons?: boolean;
  index?: number;
}

const AppCard: React.FC<AppCardProps> = ({ 
  app, 
  showRemove = false,
  showManage = false,
  onShowDetails,
  isLarge = false,
  listView = false,
  smallerIcons = false,
  index = 0
}) => {
  const { favorite, cardType, handleAction, handleClick } = useAppCardLogic(
    app,
    showRemove,
    listView,
    isLarge
  );

  return (
    <CardFactory
      cardType={cardType}
      app={app}
      favorite={favorite}
      showRemove={showRemove}
      showManage={showManage}
      onShowDetails={onShowDetails}
      smallerIcons={smallerIcons}
      index={index}
      handleAction={handleAction}
      handleClick={handleClick}
    />
  );
};

export default AppCard;
