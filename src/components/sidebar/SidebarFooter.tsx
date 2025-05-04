
import React from 'react';
import { appVersion } from '@/data/appVersion';

const SidebarFooter = () => {
  return (
    <div className="p-4 text-center text-xs text-muted-foreground">
      <div>© {new Date().getFullYear()} WosaNova <span className="px-2 py-0.5 bg-muted rounded-md">v{appVersion.toString()}</span></div>
    </div>
  );
};

export default SidebarFooter;
