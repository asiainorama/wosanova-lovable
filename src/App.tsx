import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import Catalog from '@/pages/Catalog';
import Settings from '@/pages/Settings';
import AppDetails from '@/pages/AppDetails';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './App.css';
import './styles/index.css'; // This now imports all our modular CSS files

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/app/:appId" element={<AppDetails />} />
            </Routes>
          </Router>
        </AppProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
