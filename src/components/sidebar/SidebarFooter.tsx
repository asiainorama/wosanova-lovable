
import React, { useEffect, useState } from 'react';

const SidebarFooter = () => {
  // Usamos un estado para controlar el número de versión
  // Esto permitirá que se incremente cada vez que se publique una nueva versión
  const [version, setVersion] = useState('1.0.0');

  // En una implementación real, aquí podríamos obtener la versión desde algún lugar 
  // como localStorage, una API, o environment variables
  useEffect(() => {
    // Aquí se podría implementar lógica para detectar actualizaciones
    // y cambiar automáticamente la versión
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion) {
      setVersion(storedVersion);
    }
  }, []);

  return (
    <div className="p-4 text-xs text-center text-muted-foreground">
      © {new Date().getFullYear()} WosaNova <span className="ml-1">v{version}</span>
    </div>
  );
};

export default SidebarFooter;
