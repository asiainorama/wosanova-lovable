
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';

interface UserProfileSectionProps {
  username: string;
  avatarUrl: string;
  userId: string | null;
  onClose: () => void;
}

const UserProfileSection = ({ username, avatarUrl, userId, onClose }: UserProfileSectionProps) => {
  const { t } = useLanguage();

  if (!userId) return null;

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
