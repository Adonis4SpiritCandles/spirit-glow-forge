import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  label_en: string;
  label_pl: string;
  url: string;
  order: number;
  is_active: boolean;
}

interface HeaderSettings {
  logo_url: string;
  logo_height: string;
  show_search: boolean;
  show_wishlist: boolean;
  show_cart: boolean;
  show_language_toggle: boolean;
  sticky_header: boolean;
  transparent_on_scroll: boolean;
  navigation_items: NavigationItem[];
}

export function useHeaderSettings() {
  const [settings, setSettings] = useState<HeaderSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('header_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'header_settings'
        },
        () => {
          loadSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings({
        ...data,
        navigation_items: (data.navigation_items as any) || []
      } as HeaderSettings);
    } catch (error) {
      console.error('Error loading header settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
}
