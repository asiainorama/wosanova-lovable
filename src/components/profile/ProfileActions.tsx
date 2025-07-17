
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileActionsProps {
  showDeleteConfirm: boolean;
  onShowDeleteConfirm: (show: boolean) => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

const ProfileActions = ({
  showDeleteConfirm,
  onShowDeleteConfirm,
  onSignOut,
  onDeleteAccount
}: ProfileActionsProps) => {
  const { t } = useLanguage();

  if (showDeleteConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {t('profile.delete.description')}
        </p>
        <div className="flex gap-2">
          <Button 
            onClick={() => onShowDeleteConfirm(false)}
            variant="outline" 
            className="flex-1"
            size="sm"
          >
            {t('profile.cancel')}
          </Button>
          <Button 
            onClick={onDeleteAccount}
            variant="destructive" 
            className="flex-1"
            size="sm"
          >
            {t('profile.delete.confirm')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <Button 
        onClick={onSignOut}
        variant="outline" 
        className="flex-1"
        size="sm"
      >
        <LogOut className="h-4 w-4 mr-2" />
        {t('profile.logout')}
      </Button>

      <Button 
        onClick={() => onShowDeleteConfirm(true)}
        variant="destructive" 
        className="flex-1"
        size="sm"
      >
        <AlertTriangle className="h-4 w-4 mr-2" />
        Eliminar cuenta
      </Button>
    </div>
  );
};

export default ProfileActions;
