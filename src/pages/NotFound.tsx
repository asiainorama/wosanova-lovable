import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { mode } = useTheme();
  
  // Redirect to home after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  // Determine if we should use dark mode based on the theme context
  const isDarkMode = mode === 'dark' || (mode === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-[64px]">
      <div className="flex justify-center mb-4">
        <img 
          src="/lovable-uploads/b14d8d91-9012-44c8-8337-2fb868e8575e.png"
          alt="WosaNova Logo" 
          className="w-24 h-24"
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">404 - Página no encontrada</h1>
      <p className="text-lg text-gray-600">Redirigiendo a la página de inicio...</p>
    </div>
  );
};

export default NotFound;
