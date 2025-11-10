import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface GeneralSettings {
  show_floating_plus: boolean;
  show_live_chat: boolean;
  gradient_overlay_intensity: number;
}

export default function GeneralSettingsMain({ onBack }: { onBack: () => void }) {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<GeneralSettings>({
    show_floating_plus: true,
    show_live_chat: true,
    gradient_overlay_intensity: 20
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('general_settings')
        .upsert(settings);
      
      if (error) throw error;

      toast.success(language === 'pl' ? 'Ustawienia zapisane' : 'Settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(language === 'pl' ? 'Błąd zapisu' : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          {language === 'pl' ? 'Ładowanie...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'pl' ? 'Ustawienia Ogólne' : 'General Settings'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'pl' ? 'Zarządzaj ogólnymi ustawieniami strony' : 'Manage general site settings'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Elementy Pływające' : 'Floating UI Elements'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="floating-plus">
              {language === 'pl' ? 'Pokaż przycisk +' : 'Show Floating + Button'}
            </Label>
            <Switch
              id="floating-plus"
              checked={settings.show_floating_plus}
              onCheckedChange={(checked) => setSettings({ ...settings, show_floating_plus: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="live-chat">
              {language === 'pl' ? 'Pokaż Live Chat' : 'Show Live Chat Button'}
            </Label>
            <Switch
              id="live-chat"
              checked={settings.show_live_chat}
              onCheckedChange={(checked) => setSettings({ ...settings, show_live_chat: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Kontrola Gradientów Spirit Tools' : 'Spirit Tools Gradient Control'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>
              {language === 'pl' ? 'Intensywność Ciemnego Overlay (%)' : 'Dark Overlay Intensity (%)'}
            </Label>
            <div className="flex items-center gap-4 mt-2">
              <Slider
                value={[settings.gradient_overlay_intensity]}
                onValueChange={(val) => setSettings({ ...settings, gradient_overlay_intensity: val[0] })}
                max={50}
                step={5}
                className="flex-1"
              />
              <span className="text-sm font-medium w-12">{settings.gradient_overlay_intensity}%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'pl' 
                ? 'Kontroluje ciemność nakładki na kartach gradientowych w sekcji Spirit Tools' 
                : 'Controls darkness of overlay on gradient cards in Spirit Tools section'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving 
          ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') 
          : (language === 'pl' ? 'Zapisz Ustawienia' : 'Save Settings')}
      </Button>
    </div>
  );
}
