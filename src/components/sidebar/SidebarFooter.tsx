
import React from 'react';
import { appVersion, lastUpdateDate } from '@/data/appVersion';

const SidebarFooter = () => {
  // Formatear la fecha para mostrarla de manera amigable
  const formattedDate = new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(lastUpdateDate);

  return (
    <div className="p-4 space-y-1 text-center text-xs text-muted-foreground">
      <div>© {new Date().getFullYear()} WosaNova</div>
      <div className="flex items-center justify-center space-x-2">
        <span className="px-2 py-0.5 bg-muted rounded-md">v{appVersion.toString()}</span>
        <span>•</span>
        <span>Actualizado: {formattedDate}</span>
      </div>
    </div>
  );
};

export default SidebarFooter;
