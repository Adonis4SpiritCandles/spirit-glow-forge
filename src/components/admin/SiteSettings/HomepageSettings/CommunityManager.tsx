import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, Globe } from 'lucide-react';

export default function CommunityManager() {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_community_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Create default settings if not exists
        const defaultSettings = {
          id: '00000000-0000-0000-0000-000000000001',
          title_en: 'Join Our Community',
          title_pl: 'Dołącz Do Społeczności',
          subtitle_en: 'See how our customers create magical ambiance with our candles',
          subtitle_pl: 'Zobacz jak nasi klienci tworzą magiczną atmosferę z naszymi świecami',
          is_active: true
        };
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Error loading community settings:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message || (language === 'pl' ? 'Nie udało się załadować ustawień' : 'Failed to load settings'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_community_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Ustawienia zapisane pomyślnie' : 'Settings saved successfully'
      });
    } catch (error: any) {
      console.error('Error saving community settings:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message || (language === 'pl' ? 'Nie udało się zapisać ustawień' : 'Failed to save settings'),
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</p>
        </CardContent>
      </Card>
    );
  }

  if (!settings) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{language === 'pl' ? 'Błąd ładowania ustawień' : 'Error loading settings'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          {language === 'pl' ? 'Ustawienia Sekcji Społeczności' : 'Community Section Settings'}
        </CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Zarządzaj treścią sekcji "Join Our Community" na stronie głównej'
            : 'Manage the "Join Our Community" section content on the homepage'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Toggle Section Active */}
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="community-active" className="text-base font-semibold">
              {language === 'pl' ? 'Aktywna Sekcja Społeczności' : 'Community Section Active'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Wyświetl sekcję "Join Our Community" na stronie głównej'
                : 'Display the "Join Our Community" section on the homepage'}
            </p>
          </div>
          <Switch
            id="community-active"
            checked={settings.is_active}
            onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
          />
        </div>

        {/* Title */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Tytuł (Angielski)' : 'Title (English)'}</Label>
            <Input
              value={settings.title_en || ''}
              onChange={(e) => setSettings({ ...settings, title_en: e.target.value })}
              placeholder="Join Our Community"
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Tytuł (Polski)' : 'Title (Polish)'}</Label>
            <Input
              value={settings.title_pl || ''}
              onChange={(e) => setSettings({ ...settings, title_pl: e.target.value })}
              placeholder="Dołącz Do Społeczności"
            />
          </div>
        </div>

        {/* Subtitle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Podtytuł (Angielski)' : 'Subtitle (English)'}</Label>
            <Textarea
              value={settings.subtitle_en || ''}
              onChange={(e) => setSettings({ ...settings, subtitle_en: e.target.value })}
              rows={3}
              placeholder="See how our customers create magical ambiance with our candles"
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Podtytuł (Polski)' : 'Subtitle (Polish)'}</Label>
            <Textarea
              value={settings.subtitle_pl || ''}
              onChange={(e) => setSettings({ ...settings, subtitle_pl: e.target.value })}
              rows={3}
              placeholder="Zobacz jak nasi klienci tworzą magiczną atmosferę z naszymi świecami"
            />
          </div>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {language === 'pl'
              ? 'Nota: I post social media per questa sezione sono gestiti da "Social Media Settings" nell\'admin dashboard. Questa sezione visualizza i post attivi da quella configurazione.'
              : 'Note: Social media posts for this section are managed from "Social Media Settings" in the admin dashboard. This section displays active posts from that configuration.'}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving
              ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...')
              : (language === 'pl' ? 'Zapisz Zmiany' : 'Save Changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

