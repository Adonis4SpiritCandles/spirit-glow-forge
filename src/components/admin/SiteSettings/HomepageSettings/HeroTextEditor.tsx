import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Type } from "lucide-react";

const HeroTextEditor = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    heading_line1_en: 'SPIRIT',
    heading_line2_en: 'CANDLES',
    heading_line1_pl: 'SPIRIT',
    heading_line2_pl: 'CANDLES',
    subtitle_en: 'Reborn Your Nature',
    subtitle_pl: 'Odradzaj swoją naturę',
    description_en: 'Transform your space with handcrafted soy candles',
    description_pl: 'Odmień swoją przestrzeń dzięki ręcznie robionym świecom sojowym',
    cta1_text_en: 'Shop Collection',
    cta1_text_pl: 'Zobacz Kolekcję',
    cta1_link: '/shop',
    cta2_text_en: 'Learn Our Story',
    cta2_text_pl: 'Nasza Historia',
    cta2_link: '/about',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_hero_text')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading hero text settings:', error);
      toast.error(language === 'pl' 
        ? 'Nie udało się załadować ustawień tekstu' 
        : 'Failed to load text settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_hero_text')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', (await supabase.from('homepage_hero_text').select('id').single()).data?.id);

      if (error) throw error;

      toast.success(language === 'pl' 
        ? 'Ustawienia tekstu zapisane!' 
        : 'Text settings saved!');
    } catch (error) {
      console.error('Error saving hero text settings:', error);
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
          <Type className="w-5 h-5" />
          {language === 'pl' ? 'Edytor Tekstu Hero' : 'Hero Text Editor'}
        </CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Edytuj nagłówki, napisy i przyciski CTA w sekcji hero'
            : 'Edit headings, subtitles, and CTA buttons in the hero section'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="en" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
            <TabsTrigger value="pl">🇵🇱 Polski</TabsTrigger>
          </TabsList>

          <TabsContent value="en" className="space-y-4 mt-4">
            {/* English Content */}
            <div className="space-y-2">
              <Label>Heading Line 1</Label>
              <Input
                value={settings.heading_line1_en}
                onChange={(e) => setSettings({ ...settings, heading_line1_en: e.target.value })}
                placeholder="SPIRIT"
              />
            </div>

            <div className="space-y-2">
              <Label>Heading Line 2</Label>
              <Input
                value={settings.heading_line2_en}
                onChange={(e) => setSettings({ ...settings, heading_line2_en: e.target.value })}
                placeholder="CANDLES"
              />
            </div>

            <div className="space-y-2">
              <Label>Subtitle (Italic)</Label>
              <Input
                value={settings.subtitle_en}
                onChange={(e) => setSettings({ ...settings, subtitle_en: e.target.value })}
                placeholder="Reborn Your Nature"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={settings.description_en}
                onChange={(e) => setSettings({ ...settings, description_en: e.target.value })}
                placeholder="Transform your space..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Button 1 Text</Label>
                <Input
                  value={settings.cta1_text_en}
                  onChange={(e) => setSettings({ ...settings, cta1_text_en: e.target.value })}
                  placeholder="Shop Collection"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Button 1 Link</Label>
                <Input
                  value={settings.cta1_link}
                  onChange={(e) => setSettings({ ...settings, cta1_link: e.target.value })}
                  placeholder="/shop"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Button 2 Text</Label>
                <Input
                  value={settings.cta2_text_en}
                  onChange={(e) => setSettings({ ...settings, cta2_text_en: e.target.value })}
                  placeholder="Learn Our Story"
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Button 2 Link</Label>
                <Input
                  value={settings.cta2_link}
                  onChange={(e) => setSettings({ ...settings, cta2_link: e.target.value })}
                  placeholder="/about"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pl" className="space-y-4 mt-4">
            {/* Polish Content */}
            <div className="space-y-2">
              <Label>Nagłówek Linia 1</Label>
              <Input
                value={settings.heading_line1_pl}
                onChange={(e) => setSettings({ ...settings, heading_line1_pl: e.target.value })}
                placeholder="SPIRIT"
              />
            </div>

            <div className="space-y-2">
              <Label>Nagłówek Linia 2</Label>
              <Input
                value={settings.heading_line2_pl}
                onChange={(e) => setSettings({ ...settings, heading_line2_pl: e.target.value })}
                placeholder="CANDLES"
              />
            </div>

            <div className="space-y-2">
              <Label>Podtytuł (Kursywa)</Label>
              <Input
                value={settings.subtitle_pl}
                onChange={(e) => setSettings({ ...settings, subtitle_pl: e.target.value })}
                placeholder="Odradzaj swoją naturę"
              />
            </div>

            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea
                value={settings.description_pl}
                onChange={(e) => setSettings({ ...settings, description_pl: e.target.value })}
                placeholder="Odmień swoją przestrzeń..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Tekst Przycisku CTA 1</Label>
              <Input
                value={settings.cta1_text_pl}
                onChange={(e) => setSettings({ ...settings, cta1_text_pl: e.target.value })}
                placeholder="Zobacz Kolekcję"
              />
            </div>

            <div className="space-y-2">
              <Label>Tekst Przycisku CTA 2</Label>
              <Input
                value={settings.cta2_text_pl}
                onChange={(e) => setSettings({ ...settings, cta2_text_pl: e.target.value })}
                placeholder="Nasza Historia"
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
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

export default HeroTextEditor;
