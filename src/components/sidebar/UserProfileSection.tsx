
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface UserProfileSectionProps {
  username: string;
  avatarUrl: string;
  userId: string | null;
  onClose: () => void;
  compact?: boolean;
  avatarOnly?: boolean;
}

const UserProfileSection = ({ 
  username, 
  avatarUrl, 
  userId, 
  onClose, 
  compact = false, 
  avatarOnly = false 
}: UserProfileSectionProps) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    onClose();
    
    if (!userId) {
      toast.info('Inicia sesión para acceder a tu perfil');
      navigate('/auth');
      return;
    }
    
    navigate('/profile');
  };

  if (avatarOnly) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button onClick={handleProfileClick} className="flex justify-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={userId ? avatarUrl : undefined} alt={userId ? username : 'Usuario'} />
                <AvatarFallback className="bg-primary/10">
                  <User size={18} />
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{userId ? t('profile.view') : 'Iniciar sesión'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={handleProfileClick} className="flex items-center gap-2">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={userId ? avatarUrl : undefined} alt={userId ? username : 'Usuario'} />
                  <AvatarFallback className="bg-primary/10">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium dark:text-white truncate text-sm max-w-[80px]">
                  {userId ? (username || t('profile.username')) : 'Iniciar sesión'}
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{userId ? t('profile.view') : 'Iniciar sesión'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-4 mb-2">
      <button onClick={handleProfileClick} className="flex justify-center">
        <Avatar className="h-12 w-12 mb-2">
          <AvatarImage src={userId ? avatarUrl : undefined} alt={userId ? username : 'Usuario'} />
          <AvatarFallback className="bg-primary/10">
            <User size={20} />
          </AvatarFallback>
        </Avatar>
      </button>
      <span className="font-medium dark:text-white truncate theme-text text-center">
        {userId ? (username || t('profile.username')) : 'Iniciar sesión'}
      </span>
    </div>
  );
};

export default UserProfileSection;
