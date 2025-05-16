
import React from 'react';

interface AvatarFallbackProps {
  letter?: string;
}

const AvatarFallback: React.FC<AvatarFallbackProps> = ({ letter }) => {
  return (
    <span className="text-gray-500 dark:text-gray-400 text-xs">
      {letter || '?'}
    </span>
  );
};

export default AvatarFallback;
