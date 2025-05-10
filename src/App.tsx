
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppProvider } from './contexts/AppContext';
import { AppContextUpdater } from './contexts/AppContextUpdater';
import { Toaster } from '@/components/ui/sonner';
import Index from './pages/Index';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import Manage from './pages/Manage';
// Widgets
import AlarmWidget from './pages/widgets/AlarmWidget';
import CalculatorWidget from './pages/widgets/CalculatorWidget';
import NotesWidget from './pages/widgets/NotesWidget';
import ConverterWidget from './pages/widgets/ConverterWidget';
// PWA Components
import InstallPWA from './components/pwa/InstallPWA';
import SplashScreen from './components/pwa/SplashScreen';
import { registerServiceWorker } from './utils/registerServiceWorker';

function App() {
  // Registrar el Service Worker al cargar la aplicación
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <AppContextUpdater />
          {/* Splash Screen para PWA instalada */}
          <SplashScreen />
          
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/manage" element={<Manage />} />
              
              {/* Widget Routes */}
              <Route path="/widgets/alarm" element={<AlarmWidget />} />
              <Route path="/widgets/calculator" element={<CalculatorWidget />} />
              <Route path="/widgets/notes" element={<NotesWidget />} />
              <Route path="/widgets/converter" element={<ConverterWidget />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Componente de instalación de PWA */}
            <InstallPWA />
          </Router>
          
          <Toaster position="bottom-center" />
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
