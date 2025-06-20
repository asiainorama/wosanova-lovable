
import React from 'react';
import { AppProviders } from './components/app/AppProviders';
import { AppRouter } from './components/app/AppRouter';
import { useAppInitialization } from './hooks/useAppInitialization';

// Importar el script de sincronización para que esté disponible globalmente
import "./scripts/syncAppsToSupabase";

const App = () => {
  const { session, isLoading, skipAuthCheck } = useAppInitialization();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <img 
          src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
          alt="WosaNova Logo" 
          className="w-16 h-16 sm:w-20 sm:h-20"
        />
      </div>
    );
  }

  return (
    <AppProviders>
      <AppRouter session={session} skipAuthCheck={skipAuthCheck} />
    </AppProviders>
  );
};

export default App;
