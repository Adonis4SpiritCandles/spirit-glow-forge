import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Mail } from "lucide-react";

const NewsletterManager = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    heading_en: 'Join Our Community',
    heading_pl: 'Dołącz Do Naszej Społeczności',
    subtitle_en: 'Subscribe and get 10% off your first order!',
    subtitle_pl: 'Zapisz się i otrzymaj 10% zniżki na pierwsze zamówienie!',
    success_message_en: 'Check your email to receive your 10% discount code!',
    success_message_pl: 'Sprawdź swoją skrzynkę email, aby otrzymać kod rabatowy 10%!',
    discount_percentage: 10,
    gdpr_text_en: 'I agree to receive the newsletter and accept the privacy policy. I can unsubscribe at any time.',
    gdpr_text_pl: 'Zgadzam się na otrzymywanie newslettera i akceptuję politykę prywatności. Mogę się wypisać w każdej chwili.',
    is_active: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading newsletter settings:', error);
      toast.error(language === 'pl' 
        ? 'Nie udało się załadować ustawień newslettera' 
        : 'Failed to load newsletter settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('newsletter_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', (await supabase.from('newsletter_settings').select('id').single()).data?.id);

      if (error) throw error;

      toast.success(language === 'pl' 
        ? 'Ustawienia newslettera zapisane!' 
        : 'Newsletter settings saved!');
    } catch (error) {
      console.error('Error saving newsletter settings:', error);
      toast.error(language === 'pl' 
        ? 'Nie udało się zapisać ustawień' 
        : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            {language === 'pl' ? 'Ładowanie...' : 'Loading...'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          {language === 'pl' ? 'Ustawienia Newslettera' : 'Newsletter Settings'}
        </CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Zarządzaj tekstem i ustawieniami sekcji zapisu do newslettera'
            : 'Manage text and settings for the newsletter signup section'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-4">
            <div className="space-y-2">
              <Label>Heading</Label>
              <Input
                value={settings.heading_en}
                onChange={(e) => setSettings({ ...settings, heading_en: e.target.value })}
                placeholder="Join Our Community"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input
                value={settings.subtitle_en}
                onChange={(e) => setSettings({ ...settings, subtitle_en: e.target.value })}
                placeholder="Subscribe and get 10% off..."
              />
            </div>

            <div className="space-y-2">
              <Label>Success Message</Label>
              <Textarea
                value={settings.success_message_en}
                onChange={(e) => setSettings({ ...settings, success_message_en: e.target.value })}
                placeholder="Check your email..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>GDPR Consent Text</Label>
              <Textarea
                value={settings.gdpr_text_en}
                onChange={(e) => setSettings({ ...settings, gdpr_text_en: e.target.value })}
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="pl" className="space-y-4">
            <div className="space-y-2">
              <Label>Nagłówek</Label>
              <Input
                value={settings.heading_pl}
                onChange={(e) => setSettings({ ...settings, heading_pl: e.target.value })}
                placeholder="Dołącz Do Naszej Społeczności"
              />
            </div>

            <div className="space-y-2">
              <Label>Podtytuł</Label>
              <Input
                value={settings.subtitle_pl}
                onChange={(e) => setSettings({ ...settings, subtitle_pl: e.target.value })}
                placeholder="Zapisz się i otrzymaj..."
              />
            </div>

            <div className="space-y-2">
              <Label>Wiadomość Sukcesu</Label>
              <Textarea
                value={settings.success_message_pl}
                onChange={(e) => setSettings({ ...settings, success_message_pl: e.target.value })}
                placeholder="Sprawdź swoją skrzynkę..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Tekst Zgody RODO</Label>
              <Textarea
                value={settings.gdpr_text_pl}
                onChange={(e) => setSettings({ ...settings, gdpr_text_pl: e.target.value })}
                rows={3}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-4 mt-6 pt-6 border-t">
          <div className="space-y-2">
            <Label>Discount Percentage</Label>
            <Input
              type="number"
              value={settings.discount_percentage}
              onChange={(e) => setSettings({ ...settings, discount_percentage: parseInt(e.target.value) })}
              min={0}
              max={100}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="newsletter-active">
                {language === 'pl' ? 'Aktywny Newsletter' : 'Newsletter Active'}
              </Label>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Wyświetl sekcję zapisu do newslettera na stronie głównej'
                  : 'Display newsletter signup section on homepage'}
              </p>
            </div>
            <Switch
              id="newsletter-active"
              checked={settings.is_active}
              onCheckedChange={(checked) => setSettings({ ...settings, is_active: checked })}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving
              ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...')
              : (language === 'pl' ? 'Zapisz Zmiany' : 'Save Changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsletterManager;
