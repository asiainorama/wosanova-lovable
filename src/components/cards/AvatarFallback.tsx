
import React from 'react';

interface AvatarFallbackProps {
  letter?: string;
  appName?: string;
  className?: string;
}

// Utility functions for avatar initials and color selection
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export const getAvatarColor = (name: string): string => {
  // Simple hash function to get a consistent color based on name
  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const colors = [
    'bg-blue-100 dark:bg-blue-900',
    'bg-green-100 dark:bg-green-900',
    'bg-yellow-100 dark:bg-yellow-900',
    'bg-red-100 dark:bg-red-900',
    'bg-purple-100 dark:bg-purple-900',
    'bg-pink-100 dark:bg-pink-900',
    'bg-indigo-100 dark:bg-indigo-900',
    'bg-gray-100 dark:bg-gray-800',
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ letter, appName, className }) => {
  // Determine what to display - either the provided letter or initials from appName
  const displayText = letter || (appName ? getInitials(appName) : '?');
  
  return (
    <span className={`text-gray-500 dark:text-gray-400 text-xs flex items-center justify-center ${className || ''}`}>
      {displayText}
    </span>
  );
};

export default AvatarFallback;
