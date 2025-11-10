import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NavigationItem {
  label_en: string;
  label_pl: string;
  url: string;
  order: number;
  is_active: boolean;
}

interface LogoAnimation {
  enabled: boolean;
  speed: string;
  glow_intensity: string;
  hover_scale: string;
}

interface HeaderSettings {
  logo_url: string;
  logo_height: string;
  logo_transparent_bg: boolean;
  logo_animation?: LogoAnimation;
  mobile_logo_url?: string;
  mobile_logo_height?: string;
  mobile_logo_animation?: LogoAnimation;
  tablet_logo_url?: string;
  tablet_logo_height?: string;
  tablet_logo_animation?: LogoAnimation;
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
        logo_transparent_bg: data.logo_transparent_bg ?? true,
        logo_animation: (data.logo_animation as any) || { enabled: true, speed: '4s', glow_intensity: '0.4', hover_scale: '1.05' },
        mobile_logo_animation: (data.mobile_logo_animation as any) || { enabled: true, speed: '4s', glow_intensity: '0.4', hover_scale: '1.05' },
        tablet_logo_animation: (data.tablet_logo_animation as any) || { enabled: true, speed: '4s', glow_intensity: '0.4', hover_scale: '1.05' },
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
