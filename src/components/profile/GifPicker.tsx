import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Image, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GifPickerProps {
  onSelectGif: (gifUrl: string) => void;
}

const TENOR_CLIENT_KEY = 'spirit_candles';

export default function GifPicker({ onSelectGif }: GifPickerProps) {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenorApiKey, setTenorApiKey] = useState<string>('');

  // Load Tenor API key from Supabase secrets
  useEffect(() => {
    const loadApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-tenor-key');
        if (error) throw error;
        if (data?.key) {
          setTenorApiKey(data.key);
        }
      } catch (err) {
        console.error('Error loading Tenor API key:', err);
      }
    };
    loadApiKey();
  }, []);

  const searchGifs = async (query: string) => {
    if (!query.trim() || !tenorApiKey) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(query)}&key=${tenorApiKey}&client_key=${TENOR_CLIENT_KEY}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch GIFs');
      }
      
      const data = await response.json();
      setGifs(data.results || []);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
      setError(language === 'pl' ? 'Nie udało się załadować GIF-ów' : 'Failed to load GIFs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchGifs(searchQuery);
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder={t('searchGifs')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="sm" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
        </Button>
      </form>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {gifs.length > 0 && (
        <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto rounded-lg border p-2">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              onClick={() => {
                const gifUrl = gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url;
                if (gifUrl) {
                  onSelectGif(gifUrl);
                }
              }}
              className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
            >
              <img
                src={gif.media_formats?.tinygif?.url || gif.media_formats?.gif?.url}
                alt={gif.content_description}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
