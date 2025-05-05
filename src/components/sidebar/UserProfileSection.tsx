
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserProfileSectionProps {
  username: string;
  avatarUrl: string;
  userId: string | null;
  onClose: () => void;
  compact?: boolean;
}

const UserProfileSection = ({ username, avatarUrl, userId, onClose, compact = false }: UserProfileSectionProps) => {
  const { t } = useLanguage();

  if (!userId) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/profile" onClick={onClose} className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatarUrl} alt={username} />
                  <AvatarFallback className="bg-primary/10">
                    <User size={16} />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium dark:text-white truncate text-sm max-w-[80px]">
                  {username || t('profile.username')}
                </span>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('profile.view')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center mt-4 mb-2">
      <Link to="/profile" onClick={onClose}>
        <Avatar className="h-12 w-12 mb-2">
          <AvatarImage src={avatarUrl} alt={username} />
          <AvatarFallback className="bg-primary/10">
            <User size={20} />
          </AvatarFallback>
        </Avatar>
      </Link>
      <span className="font-medium dark:text-white truncate theme-text">
        {username || t('profile.username')}
      </span>
    </div>
  );
};

export default UserProfileSection;
