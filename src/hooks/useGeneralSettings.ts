import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeneralSettings {
  show_floating_plus: boolean;
  show_live_chat: boolean;
  gradient_overlay_intensity: number;
  enable_notifications: boolean;
  enable_admin_notifications: boolean;
  maintenance_mode: boolean;
  enable_registration: boolean;
  newsletter_enabled: boolean;
}

export const useGeneralSettings = () => {
  const [settings, setSettings] = useState<GeneralSettings>({
    show_floating_plus: true,
    show_live_chat: true,
    gradient_overlay_intensity: 20,
    enable_notifications: true,
    enable_admin_notifications: true,
    maintenance_mode: false,
    enable_registration: true,
    newsletter_enabled: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Subscribe to changes
    const channel = supabase
      .channel('general_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'general_settings'
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
        .from('general_settings')
        .select('*')
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading general settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading };
};
