
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useBackground } from '@/contexts/BackgroundContext';
import { RefreshCw, Search, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    full: string;
    small: string;
  };
  user: {
    name: string;
  };
  alt_description?: string;
}

const ACCESS_KEY = 'JR4Ke0B6s7I8hBlmBAdymVSys6UZ-UYe8T7W_ugpFWM';

export const UnsplashBackgroundSelector = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('random');
  const { backgroundUrl, setBackgroundUrl } = useBackground();

  const fetchRandomImages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.unsplash.com/photos/random?count=9&orientation=landscape&client_id=${ACCESS_KEY}`);
      if (!response.ok) throw new Error('Failed to fetch images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching random images:', error);
      toast.error('Error fetching images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const searchImages = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=9&orientation=landscape&client_id=${ACCESS_KEY}`);
      if (!response.ok) throw new Error('Failed to search images');
      const data = await response.json();
      setImages(data.results);
    } catch (error) {
      console.error('Error searching images:', error);
      toast.error('Error searching images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'random') {
      fetchRandomImages();
    }
  }, [activeTab]);

  const selectBackground = (imageUrl: string) => {
    setBackgroundUrl(imageUrl);
    toast.success('Background updated successfully');
  };

  const clearBackground = () => {
    setBackgroundUrl(null);
    toast.success('Background removed');
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'search') {
      setImages([]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium mb-1 dark:text-white">Background Image</h3>
        {backgroundUrl && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearBackground} 
            className="h-8 px-2 text-xs flex items-center gap-1"
          >
            <X size={14} />
            Remove
          </Button>
        )}
      </div>

      {backgroundUrl && (
        <div className="relative mb-4 rounded-md overflow-hidden">
          <img 
            src={backgroundUrl} 
            alt="Current background" 
            className="w-full h-24 object-cover rounded-md"
          />
          <div className="absolute bottom-1 right-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Current
          </div>
        </div>
      )}

      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="random">Random</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>

        <TabsContent value="random" className="space-y-4">
          <div className="flex justify-end mb-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={fetchRandomImages} 
              disabled={isLoading}
              className="flex items-center gap-1 h-8 px-2"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </Button>
          </div>
          <ImageGrid images={images} onSelect={selectBackground} isLoading={isLoading} currentTab={activeTab} />
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for images..."
              className="text-sm h-8"
              onKeyDown={(e) => e.key === 'Enter' && searchImages()}
            />
            <Button 
              onClick={searchImages} 
              disabled={isLoading || !searchQuery.trim()} 
              size="sm"
              className="h-8 px-2"
            >
              <Search size={16} />
            </Button>
          </div>
          <ImageGrid images={images} onSelect={selectBackground} isLoading={isLoading} currentTab={activeTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ImageGrid = ({ 
  images, 
  onSelect, 
  isLoading,
  currentTab 
}: { 
  images: UnsplashImage[]; 
  onSelect: (url: string) => void; 
  isLoading: boolean;
  currentTab: string;
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-2">
        {[...Array(9)].map((_, i) => (
          <div 
            key={i} 
            className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-md animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        {currentTab === 'search' ? 'Enter a search term to find images' : 'No images found'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {images.map((image) => (
        <div
          key={image.id}
          className="aspect-video relative cursor-pointer overflow-hidden rounded-md group"
          onClick={() => onSelect(image.urls.regular)}
        >
          <img 
            src={image.urls.small} 
            alt={image.alt_description || 'Unsplash image'} 
            className="w-full h-full object-cover transition-transform group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary" className="h-7 text-xs">
                Select
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
