import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      setSettings({
        ...data,
        hero_animation_enabled: data.hero_animation_enabled ?? true,
        hero_fluorescent_enabled: data.hero_fluorescent_enabled ?? false,
        hero_fluorescent_intensity: data.hero_fluorescent_intensity ?? 30,
        hero_image_size: data.hero_image_size || 'medium',
        hero_parallax_strength: data.hero_parallax_strength ?? 300,
      });
      setFeatures((data.features as any[]) || []);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    const updateData = {
      hero_image_url: settings?.hero_image_url || null,
      hero_image_url_external: settings?.hero_image_url_external || null,
      hero_animation_enabled: settings?.hero_animation_enabled ?? true,
      hero_fluorescent_enabled: settings?.hero_fluorescent_enabled ?? false,
      hero_fluorescent_intensity: settings?.hero_fluorescent_intensity ?? 30,
      hero_image_size: settings?.hero_image_size || 'medium',
      hero_parallax_strength: settings?.hero_parallax_strength ?? 300,
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
            {(settings?.hero_image_url || settings?.hero_image_url_external) && (
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <img 
                  src={settings.hero_image_url || settings.hero_image_url_external} 
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
            <div className="pt-2 border-t mt-2">
              <Label htmlFor="hero-url">
                {language === 'pl' ? 'Lub użyj URL zewnętrznego obrazu' : 'Or use external image URL'}
              </Label>
              <Input 
                id="hero-url"
                type="url"
                value={settings?.hero_image_url_external || ''}
                onChange={(e) => setSettings({ ...settings, hero_image_url_external: e.target.value })}
                placeholder={language === 'pl' ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'pl' 
                  ? 'Jeśli przesłany obraz istnieje, będzie użyty zamiast URL' 
                  : 'If uploaded image exists, it will be used instead of URL'}
              </p>
            </div>
          </div>

          {/* Advanced Hero Image Settings */}
          <div className="pt-6 border-t space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hero-animation">
                  {language === 'pl' ? 'Animacja Obrazu Hero' : 'Hero Image Animation'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'pl' 
                    ? 'Włącz/wyłącz animację obrazu hero' 
                    : 'Enable/disable hero image animation'}
                </p>
              </div>
              <Switch
                id="hero-animation"
                checked={settings?.hero_animation_enabled ?? true}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, hero_animation_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hero-fluorescent">
                  {language === 'pl' ? 'Efekt Fluorescencyjny' : 'Fluorescent Effect'}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'pl' 
                    ? 'Włącz/wyłącz efekt luminescencji wokół obrazu' 
                    : 'Enable/disable glow effect around the image'}
                </p>
              </div>
              <Switch
                id="hero-fluorescent"
                checked={settings?.hero_fluorescent_enabled ?? false}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, hero_fluorescent_enabled: checked })
                }
              />
            </div>

            {settings?.hero_fluorescent_enabled && (
              <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="fluorescent-intensity">
                    {language === 'pl' ? 'Intensywność Fluorescencji' : 'Fluorescent Intensity'}
                  </Label>
                  <span className="text-sm text-muted-foreground">
                    {settings?.hero_fluorescent_intensity ?? 30}%
                  </span>
                </div>
                <Slider
                  id="fluorescent-intensity"
                  min={0}
                  max={100}
                  step={5}
                  value={[settings?.hero_fluorescent_intensity ?? 30]}
                  onValueChange={(value) => 
                    setSettings({ ...settings, hero_fluorescent_intensity: value[0] })
                  }
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  {language === 'pl' 
                    ? 'Kontroluj intensywność efektu luminescencji (0-100%)' 
                    : 'Control the intensity of the glow effect (0-100%)'}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hero-image-size">
                {language === 'pl' ? 'Rozmiar Obrazu Hero' : 'Hero Image Size'}
              </Label>
              <Select
                value={settings?.hero_image_size || 'medium'}
                onValueChange={(value) => 
                  setSettings({ ...settings, hero_image_size: value })
                }
              >
                <SelectTrigger id="hero-image-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    {language === 'pl' ? 'Mały' : 'Small'}
                  </SelectItem>
                  <SelectItem value="medium">
                    {language === 'pl' ? 'Średni' : 'Medium'}
                  </SelectItem>
                  <SelectItem value="large">
                    {language === 'pl' ? 'Duży' : 'Large'}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {language === 'pl' 
                  ? 'Wybierz rozmiar obrazu hero (mały, średni, duży)' 
                  : 'Select the hero image size (small, medium, large)'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="parallax-strength">
                  {language === 'pl' ? 'Siła Parallax' : 'Parallax Strength'}
                </Label>
                <span className="text-sm text-muted-foreground">
                  {settings?.hero_parallax_strength ?? 300}
                </span>
              </div>
              <Slider
                id="parallax-strength"
                min={0}
                max={500}
                step={25}
                value={[settings?.hero_parallax_strength ?? 300]}
                onValueChange={(value) => 
                  setSettings({ ...settings, hero_parallax_strength: value[0] })
                }
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'pl' 
                  ? 'Kontroluj siłę efektu parallax podczas scrollowania (0-500)' 
                  : 'Control the parallax scrolling effect strength (0-500)'}
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

