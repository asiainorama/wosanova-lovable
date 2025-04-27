import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AppGrid from '@/components/AppGrid';
import AppDetails from '@/components/AppDetails';
import { useAppContext } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { categories } from '@/data/apps';
import { Search, X } from 'lucide-react';
import { AppData } from '@/data/apps';

const Catalog = () => {
  const { allApps } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [filteredApps, setFilteredApps] = useState(allApps);
  const [selectedApp, setSelectedApp] = useState<AppData | null>(null);

  useEffect(() => {
    let filtered = [...allApps];
    
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'Todas') {
      filtered = filtered.filter(app => app.category === selectedCategory);
    }
    
    setFilteredApps(filtered);
  }, [searchTerm, selectedCategory, allApps]);

  const handleShowDetails = (app: AppData) => {
    setSelectedApp(app);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Catálogo" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6 space-y-4">
          <h2 className="text-xl font-semibold">Aplicaciones de IA</h2>
          
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar aplicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 py-2 w-full bg-gray-100 border-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full bg-gray-100 border-none">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Destacadas</h3>
          <AppGrid 
            apps={filteredApps.slice(0, 8)} 
            showManage={true}
            onShowDetails={handleShowDetails}
          />
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Todas las aplicaciones</h3>
          <AppGrid 
            apps={filteredApps}
            showManage={true}
            onShowDetails={handleShowDetails}
          />
        </div>

        <AppDetails 
          app={selectedApp}
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      </main>
    </div>
  );
};

export default Catalog;
