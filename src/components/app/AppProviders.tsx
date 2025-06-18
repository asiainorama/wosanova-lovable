
import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BackgroundProvider } from "@/contexts/BackgroundContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { FloatingWidgetsProvider } from "@/contexts/FloatingWidgetsContext";
import { TooltipProvider } from "@/components/ui/tooltip";

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BackgroundProvider>
          <LanguageProvider>
            <AppProvider>
              <FloatingWidgetsProvider>
                <TooltipProvider>
                  {children}
                </TooltipProvider>
              </FloatingWidgetsProvider>
            </AppProvider>
          </LanguageProvider>
        </BackgroundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
