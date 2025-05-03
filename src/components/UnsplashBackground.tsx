
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UnsplashPhoto {
  id: string;
  urls: {
    regular: string;
    full: string;
  };
  user: {
    name: string;
  };
  description: string | null;
  alt_description: string | null;
}

interface UnsplashBackgroundProps {
  onBackgroundChange: (url: string) => void;
}

const UNSPLASH_ACCESS_KEY = 'YdV_21yDVGZvP22JpraJ-NBLRBqvQIZDjkwXIQYAVL4'; // Free public key for demo purposes

// Predefined categories
const backgroundCategories = [
  { value: 'nature', label: 'Naturaleza' },
  { value: 'abstract', label: 'Abstracto' },
  { value: 'space', label: 'Espacio' },
  { value: 'technology', label: 'Tecnología' },
  { value: 'minimal', label: 'Minimalista' },
  { value: 'gradient', label: 'Gradiente' }
];

export const UnsplashBackground: React.FC<UnsplashBackgroundProps> = ({ onBackgroundChange }) => {
  const [query, setQuery] = useState('');
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('nature');
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch random images from Unsplash
  const fetchRandomImages = async (searchTerm = '') => {
    setIsLoading(true);
    try {
      const searchParam = searchTerm || selectedCategory;
      const response = await fetch(
        `https://api.unsplash.com/photos/random?query=${searchParam}&count=6&orientation=landscape`, 
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Error al cargar imágenes');
      }
      
      const data = await response.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('No se pudieron cargar las imágenes. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Load images when component mounts or category changes
  useEffect(() => {
    fetchRandomImages();
  }, [selectedCategory]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRandomImages(query);
  };

  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  // Handle image selection
  const handleSelectImage = (url: string) => {
    onBackgroundChange(url);
    toast.success('Fondo actualizado');
    
    // Save to localStorage
    localStorage.setItem('backgroundUrl', url);
  };

  // Load more images
  const handleRefresh = () => {
    fetchRandomImages();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium dark:text-white">Elige un fondo de pantalla</h3>
      
      {/* Search and category selector */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input 
            type="text"
            placeholder="Buscar imágenes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <Button type="submit" size="sm" className="h-9">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] h-9 text-sm">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            {backgroundCategories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Image grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {isLoading ? (
          // Loading state
          Array(6).fill(0).map((_, index) => (
            <div 
              key={index} 
              className="aspect-video bg-gray-200 animate-pulse rounded-md dark:bg-gray-700" 
            />
          ))
        ) : (
          // Photos grid
          photos.map((photo) => (
            <div 
              key={photo.id}
              className="relative aspect-video rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-100 dark:border-gray-700"
              onClick={() => handleSelectImage(photo.urls.regular)}
            >
              <img 
                src={photo.urls.regular} 
                alt={photo.alt_description || 'Unsplash background'} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end">
                <span className="text-xs text-white p-1.5 truncate">
                  Por: {photo.user.name}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Refresh button */}
      <div className="flex justify-center">
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          disabled={isLoading}
          className="dark:bg-gray-800 dark:border-gray-700 text-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Cargar más imágenes
        </Button>
      </div>
    </div>
  );
};

export default UnsplashBackground;
