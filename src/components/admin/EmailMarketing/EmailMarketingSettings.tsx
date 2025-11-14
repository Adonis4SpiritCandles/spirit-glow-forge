import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, Settings, Mail } from 'lucide-react';

export default function EmailMarketingSettings() {
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
        .from('email_marketing_settings')
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
          show_newsletter_section_homepage: true,
          show_newsletter_checkbox_registration: true,
          show_newsletter_checkbox_contact: true
        };
        setSettings(defaultSettings);
      }
    } catch (error: any) {
      console.error('Error loading email marketing settings:', error);
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
        .from('email_marketing_settings')
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
      console.error('Error saving email marketing settings:', error);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'pl' ? 'Ustawienia Email Marketing' : 'Email Marketing Settings'}
          </CardTitle>
          <CardDescription>
            {language === 'pl'
              ? 'Zarządzaj widocznością sekcji newsletter i checkboxów na stronie'
              : 'Manage newsletter section and checkbox visibility across the site'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Newsletter Section Homepage Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="newsletter-section-homepage" className="text-base font-semibold">
                {language === 'pl' ? 'Sekcja Newsletter na Stronie Głównej' : 'Newsletter Section on Homepage'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Wyświetl sekcję zapisu do newslettera na stronie głównej'
                  : 'Display the newsletter signup section on the homepage'}
              </p>
            </div>
            <Switch
              id="newsletter-section-homepage"
              checked={settings.show_newsletter_section_homepage}
              onCheckedChange={async (checked) => {
                const newSettings = { ...settings, show_newsletter_section_homepage: checked };
                setSettings(newSettings);
                // Save immediately when toggle changes
                try {
                  const { error } = await supabase
                    .from('email_marketing_settings')
                    .upsert({
                      ...newSettings,
                      updated_at: new Date().toISOString()
                    }, {
                      onConflict: 'id'
                    });
                  
                  if (error) throw error;
                  
                  toast({
                    title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
                    description: language === 'pl' ? 'Ustawienia zapisane pomyślnie' : 'Settings saved successfully'
                  });
                } catch (error: any) {
                  console.error('Error saving email marketing settings:', error);
                  toast({
                    title: language === 'pl' ? 'Błąd' : 'Error',
                    description: error.message || (language === 'pl' ? 'Nie udało się zapisać ustawień' : 'Failed to save settings'),
                    variant: 'destructive'
                  });
                  // Revert on error
                  setSettings({ ...settings });
                }
              }}
            />
          </div>

          {/* Newsletter Checkbox Registration Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="newsletter-checkbox-registration" className="text-base font-semibold">
                {language === 'pl' ? 'Checkbox Newsletter w Rejestracji' : 'Newsletter Checkbox in Registration'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Wyświetl checkbox "Chcę otrzymywać newsletter z wiadomościami i ofertami" podczas rejestracji użytkownika'
                  : 'Display the "I want to receive newsletters with news and offers" checkbox during user registration'}
              </p>
            </div>
            <Switch
              id="newsletter-checkbox-registration"
              checked={settings.show_newsletter_checkbox_registration}
              onCheckedChange={async (checked) => {
                const newSettings = { ...settings, show_newsletter_checkbox_registration: checked };
                setSettings(newSettings);
                // Save immediately when toggle changes
                try {
                  const { error } = await supabase
                    .from('email_marketing_settings')
                    .upsert({
                      ...newSettings,
                      updated_at: new Date().toISOString()
                    }, {
                      onConflict: 'id'
                    });
                  
                  if (error) throw error;
                  
                  toast({
                    title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
                    description: language === 'pl' ? 'Ustawienia zapisane pomyślnie' : 'Settings saved successfully'
                  });
                } catch (error: any) {
                  console.error('Error saving email marketing settings:', error);
                  toast({
                    title: language === 'pl' ? 'Błąd' : 'Error',
                    description: error.message || (language === 'pl' ? 'Nie udało się zapisać ustawień' : 'Failed to save settings'),
                    variant: 'destructive'
                  });
                  // Revert on error
                  setSettings({ ...settings });
                }
              }}
            />
          </div>

          {/* Newsletter Checkbox Contact Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
            <div className="space-y-0.5 flex-1">
              <Label htmlFor="newsletter-checkbox-contact" className="text-base font-semibold">
                {language === 'pl' ? 'Checkbox Newsletter w Formularzu Kontaktowym' : 'Newsletter Checkbox in Contact Form'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Wyświetl checkbox "Chcę otrzymywać newsletter z wiadomościami i ofertami" w formularzu kontaktowym'
                  : 'Display the "I want to receive newsletters with news and offers" checkbox in the contact form'}
              </p>
            </div>
            <Switch
              id="newsletter-checkbox-contact"
              checked={settings.show_newsletter_checkbox_contact}
              onCheckedChange={async (checked) => {
                const newSettings = { ...settings, show_newsletter_checkbox_contact: checked };
                setSettings(newSettings);
                // Save immediately when toggle changes
                try {
                  const { error } = await supabase
                    .from('email_marketing_settings')
                    .upsert({
                      ...newSettings,
                      updated_at: new Date().toISOString()
                    }, {
                      onConflict: 'id'
                    });
                  
                  if (error) throw error;
                  
                  toast({
                    title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
                    description: language === 'pl' ? 'Ustawienia zapisane pomyślnie' : 'Settings saved successfully'
                  });
                } catch (error: any) {
                  console.error('Error saving email marketing settings:', error);
                  toast({
                    title: language === 'pl' ? 'Błąd' : 'Error',
                    description: error.message || (language === 'pl' ? 'Nie udało się zapisać ustawień' : 'Failed to save settings'),
                    variant: 'destructive'
                  });
                  // Revert on error
                  setSettings({ ...settings });
                }
              }}
            />
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
    </div>
  );
}

