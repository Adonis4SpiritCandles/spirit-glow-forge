import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface SEOSettings {
  title: string;
  description: string;
  keywords: string;
  og_image_url: string;
  noindex: boolean;
  loading: boolean;
}

/**
 * Custom hook to fetch SEO settings from database for a specific page
 * @param pageType - The page type (home, shop, about, contact, product_default, collection_default, custom_candles)
 * @returns SEO settings for the current language
 */
export function useSEOSettings(pageType: string): SEOSettings {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<SEOSettings>({
    title: '',
    description: '',
    keywords: '',
    og_image_url: 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
    noindex: false,
    loading: true,
  });

  useEffect(() => {
    const fetchSEOSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('seo_settings')
          .select('*')
          .eq('page_type', pageType)
          .single();

        if (error) {
          console.error('Error fetching SEO settings:', error);
          // Keep default/fallback values
          setSettings(prev => ({ ...prev, loading: false }));
          return;
        }

        if (data) {
          const titleField = language === 'en' ? 'title_en' : 'title_pl';
          const descField = language === 'en' ? 'description_en' : 'description_pl';
          const keywordsField = language === 'en' ? 'keywords_en' : 'keywords_pl';

          setSettings({
            title: data[titleField] || '',
            description: data[descField] || '',
            keywords: data[keywordsField] || '',
            og_image_url: data.og_image_url || 'https://spirit-candle.com/spiritcandles/og-image-default.jpg',
            noindex: data.noindex || false,
            loading: false,
          });
        } else {
          setSettings(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('Unexpected error fetching SEO settings:', err);
        setSettings(prev => ({ ...prev, loading: false }));
      }
    };

    fetchSEOSettings();
  }, [pageType, language]);

  return settings;
}

