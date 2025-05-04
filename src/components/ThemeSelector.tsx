
import React from 'react';
import { useTheme, ThemeMode } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sun, Moon, Monitor } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

interface ThemeSelectorProps {
  onThemeChange?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onThemeChange }) => {
  const { mode, setMode } = useTheme();
  const { t } = useLanguage();

  // Handle theme change via dropdown
  const handleThemeChange = (value: string) => {
    console.log("Theme changed to:", value);
    setMode(value as ThemeMode);
    if (onThemeChange) onThemeChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-3">
        <span className="text-sm font-medium">
          {t('profile.theme.selector')}
        </span>
        
        <Select value={mode} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t('profile.theme.select')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4" />
                <span>{t('profile.theme.light')}</span>
              </div>
            </SelectItem>
            <SelectItem value="dark">
              <div className="flex items-center gap-2">
                <Moon className="h-4 w-4" />
                <span>{t('profile.theme.dark')}</span>
              </div>
            </SelectItem>
            <SelectItem value="system">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span>{t('profile.theme.system')}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ThemeSelector;
