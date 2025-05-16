
import React from 'react';
import Header from '@/components/Header';

const Settings = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-gray-900">
      <Header title="Settings" />
      
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Settings</h2>
          <p className="text-gray-500 dark:text-gray-400">
            App settings page under construction.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
