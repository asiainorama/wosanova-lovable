
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const AppDetails = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { allApps, favorites } = useAppContext();
  
  // Find the app with the matching ID from either allApps or favorites
  const app = allApps.find(app => app.id === appId) || favorites.find(app => app.id === appId);

  if (!app) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
        <Header title="App Not Found" />
        <main className="container mx-auto px-4 py-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">App not found</h2>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header title={app.name} />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center mb-6">
            {app.icon && (
              <img 
                src={app.icon} 
                alt={`${app.name} icon`}
                className="w-16 h-16 mr-4 rounded-lg"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{app.name}</h2>
              <p className="text-gray-500 dark:text-gray-400">{app.category}</p>
            </div>
          </div>
          
          <p className="mb-4">{app.description}</p>
          
          <div className="mt-6">
            <Button onClick={() => window.open(app.url, '_blank')}>
              Open App
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppDetails;
