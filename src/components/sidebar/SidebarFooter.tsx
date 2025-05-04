
import React from 'react';

const SidebarFooter = () => {
  return (
    <div className="p-4 text-xs text-center text-muted-foreground">
      © {new Date().getFullYear()} WosaNova
    </div>
  );
};

export default SidebarFooter;
