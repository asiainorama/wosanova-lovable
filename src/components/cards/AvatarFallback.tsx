
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface AvatarFallbackProps {
  appName: string;
  className?: string;
}

export const getInitials = (name: string): string => {
  if (!name) return '?';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  return name.charAt(0).toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  if (!name) return 'bg-gray-200 dark:bg-gray-700';
  
  // Simple hash function for consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Choose from a set of pleasant colors
  const colors = [
    'bg-red-100 dark:bg-red-900',
    'bg-blue-100 dark:bg-blue-900',
    'bg-green-100 dark:bg-green-900',
    'bg-yellow-100 dark:bg-yellow-900',
    'bg-purple-100 dark:bg-purple-900',
    'bg-pink-100 dark:bg-pink-900',
    'bg-indigo-100 dark:bg-indigo-900',
    'bg-teal-100 dark:bg-teal-900',
    'bg-orange-100 dark:bg-orange-900',
    'bg-cyan-100 dark:bg-cyan-900'
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const AppAvatarFallback: React.FC<AvatarFallbackProps> = ({ appName, className }) => {
  return (
    <Avatar className={`${className} ${getAvatarColor(appName)}`}>
      <AvatarFallback className="font-semibold text-gray-700 dark:text-gray-300">
        {getInitials(appName)}
      </AvatarFallback>
    </Avatar>
  );
};

export default AppAvatarFallback;
