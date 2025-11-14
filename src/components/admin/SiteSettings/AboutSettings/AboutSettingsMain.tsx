import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Upload, Plus, Trash2, ArrowLeft, Save, Leaf, Heart, Flame, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AboutSettingsMainProps {
  onBack?: () => void;
}

const iconMap: Record<string, any> = {
  leaf: Leaf,
  heart: Heart,
  flame: Flame,
  award: Award,
};

export default function AboutSettingsMain({ onBack }: AboutSettingsMainProps) {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('about_settings')
      .select('*')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();
    
    if (data) {
      setSettings(data);
      setFeatures((data.features as any[]) || []);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const updateData = {
      hero_image_url: settings?.hero_image_url || null,
      hero_title_en: settings?.hero_title_en || null,
      hero_title_pl: settings?.hero_title_pl || null,
      hero_intro1_en: settings?.hero_intro1_en || null,
      hero_intro1_pl: settings?.hero_intro1_pl || null,
      hero_intro2_en: settings?.hero_intro2_en || null,
      hero_intro2_pl: settings?.hero_intro2_pl || null,
      hero_button_text_en: settings?.hero_button_text_en || null,
      hero_button_text_pl: settings?.hero_button_text_pl || null,
      hero_button_link: settings?.hero_button_link || '/shop',
      features_section_title_en: settings?.features_section_title_en || null,
      features_section_title_pl: settings?.features_section_title_pl || null,
      features_section_description_en: settings?.features_section_description_en || null,
      features_section_description_pl: settings?.features_section_description_pl || null,
      features: features,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('about_settings')
      .update(updateData)
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) {
      toast({ 
        title: language === 'pl' ? 'Błąd' : 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } else {
      toast({ 
        title: language === 'pl' ? 'Sukces' : 'Success', 
        description: language === 'pl' ? 'Ustawienia zapisane pomyślnie' : 'Settings saved successfully' 
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = `about-hero-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('collection-images')
      .upload(fileName, file);

    if (uploadError) {
      toast({ 
        title: language === 'pl' ? 'Błąd' : 'Error', 
        description: uploadError.message, 
        variant: 'destructive' 
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('collection-images')
      .getPublicUrl(fileName);

    setSettings({ ...settings, hero_image_url: publicUrl });
    toast({ 
      title: language === 'pl' ? 'Sukces' : 'Success', 
      description: language === 'pl' ? 'Obraz przesłany pomyślnie' : 'Image uploaded successfully' 
    });
  };

  const updateFeature = (index: number, field: string, value: any) => {
    const newFeatures = [...features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFeatures(newFeatures);
  };

  const addFeature = () => {
    setFeatures([...features, {
      icon: 'leaf',
      title_en: '',
      title_pl: '',
      description_en: '',
      description_pl: '',
      link: ''
    }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (!settings) {
    return <div className="text-center py-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h2 className="text-2xl md:text-3xl font-playfair font-bold">
            {language === 'pl' ? 'Ustawienia Strony O Nas' : 'About Page Settings'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'pl' 
              ? 'Zarządzaj treścią strony O Nas' 
              : 'Manage About page content'}
          </p>
        </div>
      </div>

      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Sekcja Hero' : 'Hero Section'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hero Image */}
          <div className="space-y-2">
            {settings?.hero_image_url && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <img 
                  src={settings.hero_image_url} 
                  alt="Hero" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <Label htmlFor="hero-upload">
                {language === 'pl' ? 'Prześlij Obraz Hero' : 'Upload Hero Image'}
              </Label>
              <Input 
                id="hero-upload"
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'pl' 
                  ? 'Zalecany rozmiar: 1200x800px' 
                  : 'Recommended size: 1200x800px'}
              </p>
            </div>
          </div>

          {/* Hero Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tytuł Hero (Angielski)' : 'Hero Title (English)'}</Label>
              <Input 
                value={settings?.hero_title_en || ''}
                onChange={(e) => setSettings({ ...settings, hero_title_en: e.target.value })}
                placeholder="Reborn Your Nature"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tytuł Hero (Polski)' : 'Hero Title (Polish)'}</Label>
              <Input 
                value={settings?.hero_title_pl || ''}
                onChange={(e) => setSettings({ ...settings, hero_title_pl: e.target.value })}
                placeholder="Odradzaj swoją naturę"
              />
            </div>
          </div>

          {/* Hero Intro 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Wprowadzenie 1 (Angielski)' : 'Intro 1 (English)'}</Label>
              <Textarea
                value={settings?.hero_intro1_en || ''}
                onChange={(e) => setSettings({ ...settings, hero_intro1_en: e.target.value })}
                rows={4}
                placeholder="At SPIRIT CANDLES, we believe..."
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Wprowadzenie 1 (Polski)' : 'Intro 1 (Polish)'}</Label>
              <Textarea
                value={settings?.hero_intro1_pl || ''}
                onChange={(e) => setSettings({ ...settings, hero_intro1_pl: e.target.value })}
                rows={4}
                placeholder="W SPIRIT CANDLES wierzymy..."
              />
            </div>
          </div>

          {/* Hero Intro 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Wprowadzenie 2 (Angielski)' : 'Intro 2 (English)'}</Label>
              <Textarea
                value={settings?.hero_intro2_en || ''}
                onChange={(e) => setSettings({ ...settings, hero_intro2_en: e.target.value })}
                rows={4}
                placeholder="Each candle is handcrafted..."
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Wprowadzenie 2 (Polski)' : 'Intro 2 (Polish)'}</Label>
              <Textarea
                value={settings?.hero_intro2_pl || ''}
                onChange={(e) => setSettings({ ...settings, hero_intro2_pl: e.target.value })}
                rows={4}
                placeholder="Każda świeca jest ręcznie wykonywana..."
              />
            </div>
          </div>

          {/* Hero Button */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tekst Przycisku (Angielski)' : 'Button Text (English)'}</Label>
              <Input 
                value={settings?.hero_button_text_en || ''}
                onChange={(e) => setSettings({ ...settings, hero_button_text_en: e.target.value })}
                placeholder="Discover Our Collection"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tekst Przycisku (Polski)' : 'Button Text (Polish)'}</Label>
              <Input 
                value={settings?.hero_button_text_pl || ''}
                onChange={(e) => setSettings({ ...settings, hero_button_text_pl: e.target.value })}
                placeholder="Odkryj Naszą Kolekcję"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Link Przycisku' : 'Button Link'}</Label>
              <Input 
                value={settings?.hero_button_link || '/shop'}
                onChange={(e) => setSettings({ ...settings, hero_button_link: e.target.value })}
                placeholder="/shop"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Sekcja Funkcji' : 'Features Section'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Features Section Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tytuł Sekcji (Angielski)' : 'Section Title (English)'}</Label>
              <Input 
                value={settings?.features_section_title_en || ''}
                onChange={(e) => setSettings({ ...settings, features_section_title_en: e.target.value })}
                placeholder="Why Choose SPIRIT CANDLES"
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Tytuł Sekcji (Polski)' : 'Section Title (Polish)'}</Label>
              <Input 
                value={settings?.features_section_title_pl || ''}
                onChange={(e) => setSettings({ ...settings, features_section_title_pl: e.target.value })}
                placeholder="Dlaczego Wybrać SPIRIT CANDLES"
              />
            </div>
          </div>

          {/* Features Section Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Opis Sekcji (Angielski)' : 'Section Description (English)'}</Label>
              <Textarea
                value={settings?.features_section_description_en || ''}
                onChange={(e) => setSettings({ ...settings, features_section_description_en: e.target.value })}
                rows={2}
                placeholder="Discover what makes our candles special..."
              />
            </div>
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Opis Sekcji (Polski)' : 'Section Description (Polish)'}</Label>
              <Textarea
                value={settings?.features_section_description_pl || ''}
                onChange={(e) => setSettings({ ...settings, features_section_description_pl: e.target.value })}
                rows={2}
                placeholder="Odkryj, co czyni nasze świece wyjątkowymi..."
              />
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>{language === 'pl' ? 'Funkcje' : 'Features'}</Label>
              <Button variant="outline" size="sm" onClick={addFeature}>
                <Plus className="h-4 w-4 mr-2" />
                {language === 'pl' ? 'Dodaj Funkcję' : 'Add Feature'}
              </Button>
            </div>

            {features.map((feature, index) => (
              <Card key={index} className="border-border/40">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm">
                      {language === 'pl' ? `Funkcja ${index + 1}` : `Feature ${index + 1}`}
                    </Label>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeFeature(index)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Icon Select */}
                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Ikona' : 'Icon'}</Label>
                    <div className="flex gap-2 flex-wrap">
                      {Object.keys(iconMap).map((iconName) => {
                        const IconComponent = iconMap[iconName];
                        const isSelected = feature.icon === iconName;
                        return (
                          <Button
                            key={iconName}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            size="sm"
                            onClick={() => updateFeature(index, 'icon', iconName)}
                            className="capitalize"
                          >
                            <IconComponent className="h-4 w-4 mr-1" />
                            {iconName}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Titles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'pl' ? 'Tytuł (Angielski)' : 'Title (English)'}</Label>
                      <Input
                        value={feature.title_en || ''}
                        onChange={(e) => updateFeature(index, 'title_en', e.target.value)}
                        placeholder="Feature title in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'pl' ? 'Tytuł (Polski)' : 'Title (Polish)'}</Label>
                      <Input
                        value={feature.title_pl || ''}
                        onChange={(e) => updateFeature(index, 'title_pl', e.target.value)}
                        placeholder="Tytuł funkcji po polsku"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'pl' ? 'Opis (Angielski)' : 'Description (English)'}</Label>
                      <Textarea
                        value={feature.description_en || ''}
                        onChange={(e) => updateFeature(index, 'description_en', e.target.value)}
                        rows={2}
                        placeholder="Feature description in English"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{language === 'pl' ? 'Opis (Polski)' : 'Description (Polish)'}</Label>
                      <Textarea
                        value={feature.description_pl || ''}
                        onChange={(e) => updateFeature(index, 'description_pl', e.target.value)}
                        rows={2}
                        placeholder="Opis funkcji po polsku"
                      />
                    </div>
                  </div>

                  {/* Link (optional) */}
                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Link (Opcjonalnie)' : 'Link (Optional)'}</Label>
                    <Input
                      value={feature.link || ''}
                      onChange={(e) => updateFeature(index, 'link', e.target.value)}
                      placeholder="/custom-candles"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        <Save className="h-4 w-4 mr-2" />
        {language === 'pl' ? 'Zapisz Wszystkie Ustawienia' : 'Save All Settings'}
      </Button>
    </div>
  );
}

