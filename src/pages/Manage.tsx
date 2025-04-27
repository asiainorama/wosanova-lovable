
import React from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import { useAppContext } from '@/contexts/AppContext';

const Manage = () => {
  const { favorites } = useAppContext();

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Gestionar Apps" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">Mis Aplicaciones</h2>
          <p className="text-gray-500 mt-1">Aquí puedes eliminar las aplicaciones que ya no quieras tener</p>
        </div>
        
        <AppGrid apps={favorites} showManage={true} showRemove={true} />
      </main>
    </div>
  );
};

export default Manage;
