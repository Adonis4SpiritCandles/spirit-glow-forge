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
import { Upload, Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface CustomCandlesSettingsMainProps {
  onBack?: () => void;
}

export default function CustomCandlesSettingsMain({ onBack }: CustomCandlesSettingsMainProps) {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<any>(null);
  const [fragrances, setFragrances] = useState<string[]>([]);
  const [qualityItemsEn, setQualityItemsEn] = useState<string[]>([]);
  const [qualityItemsPl, setQualityItemsPl] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const { data } = await supabase
      .from('custom_candles_settings')
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
      setFragrances((data.fragrances as string[]) || []);
      setQualityItemsEn((data.quality_items_en as string[]) || []);
      setQualityItemsPl((data.quality_items_pl as string[]) || []);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    // Ensure hero_image_url and hero_image_url_external are explicitly included in the update
    const updateData = {
      hero_image_url: settings?.hero_image_url || null,
      hero_image_url_external: settings?.hero_image_url_external || null,
      hero_animation_enabled: settings?.hero_animation_enabled ?? true,
      hero_fluorescent_enabled: settings?.hero_fluorescent_enabled ?? false,
      hero_fluorescent_intensity: settings?.hero_fluorescent_intensity ?? 30,
      hero_image_size: settings?.hero_image_size || 'medium',
      hero_parallax_strength: settings?.hero_parallax_strength ?? 300,
      fragrances,
      quality_items_en: qualityItemsEn,
      quality_items_pl: qualityItemsPl,
      info_card_title_en: settings?.info_card_title_en || null,
      info_card_text_en: settings?.info_card_text_en || null,
      info_card_title_pl: settings?.info_card_title_pl || null,
      info_card_text_pl: settings?.info_card_text_pl || null,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('custom_candles_settings')
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

    const fileName = `custom-candles-hero-${Date.now()}.${file.name.split('.').pop()}`;
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
            {language === 'pl' ? 'Ustawienia Strony Personalizacji' : 'Custom Candles Page Settings'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'pl' 
              ? 'Zarządzaj treścią strony personalizacji świec' 
              : 'Manage all customization page content'}
          </p>
        </div>
      </div>

      {/* Hero Image */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Obraz Hero' : 'Hero Image'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {language === 'pl' ? 'Prześlij Nowy Obraz' : 'Upload New Image'}
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
                ? 'Zalecany rozmiar: 1920x1080px' 
                : 'Recommended size: 1920x1080px'}
            </p>
          </div>
          <div className="pt-4 border-t">
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
        </CardContent>
      </Card>

      {/* Fragrances Management */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Lista Zapachów' : 'Fragrances List'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fragrances.map((frag, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={frag}
                onChange={(e) => {
                  const newFrags = [...fragrances];
                  newFrags[index] = e.target.value;
                  setFragrances(newFrags);
                }}
                placeholder={language === 'pl' ? 'Nazwa zapachu' : 'Fragrance name'}
              />
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => setFragrances(fragrances.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            variant="outline"
            onClick={() => setFragrances([...fragrances, ''])}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Dodaj Zapach' : 'Add Fragrance'}
          </Button>
        </CardContent>
      </Card>

      {/* Info Card Text EN */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Karta Informacyjna (Angielski)' : 'Info Card (English)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{language === 'pl' ? 'Tytuł' : 'Title'}</Label>
            <Input 
              value={settings?.info_card_title_en || ''}
              onChange={(e) => setSettings({ ...settings, info_card_title_en: e.target.value })}
              placeholder="What is Customization?"
            />
          </div>
          <div>
            <Label>{language === 'pl' ? 'Treść' : 'Content'}</Label>
            <Textarea 
              value={settings?.info_card_text_en || ''}
              onChange={(e) => setSettings({ ...settings, info_card_text_en: e.target.value })}
              rows={6}
              placeholder="Our customization service allows..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Info Card Text PL */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Karta Informacyjna (Polski)' : 'Info Card (Polish)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{language === 'pl' ? 'Tytuł' : 'Title'}</Label>
            <Input 
              value={settings?.info_card_title_pl || ''}
              onChange={(e) => setSettings({ ...settings, info_card_title_pl: e.target.value })}
              placeholder="Czym jest personalizacja?"
            />
          </div>
          <div>
            <Label>{language === 'pl' ? 'Treść' : 'Content'}</Label>
            <Textarea 
              value={settings?.info_card_text_pl || ''}
              onChange={(e) => setSettings({ ...settings, info_card_text_pl: e.target.value })}
              rows={6}
              placeholder="Nasza usługa personalizacji..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Items EN */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Punkty Jakości (Angielski)' : 'Quality Items (English)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualityItemsEn.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={item}
                onChange={(e) => {
                  const newItems = [...qualityItemsEn];
                  newItems[index] = e.target.value;
                  setQualityItemsEn(newItems);
                }}
                placeholder="Quality point..."
              />
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => setQualityItemsEn(qualityItemsEn.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            variant="outline"
            onClick={() => setQualityItemsEn([...qualityItemsEn, ''])}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Dodaj Punkt' : 'Add Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Quality Items PL */}
      <Card>
        <CardHeader>
          <CardTitle>
            {language === 'pl' ? 'Punkty Jakości (Polski)' : 'Quality Items (Polish)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {qualityItemsPl.map((item, index) => (
            <div key={index} className="flex gap-2">
              <Input 
                value={item}
                onChange={(e) => {
                  const newItems = [...qualityItemsPl];
                  newItems[index] = e.target.value;
                  setQualityItemsPl(newItems);
                }}
                placeholder="Punkt jakości..."
              />
              <Button 
                variant="destructive" 
                size="icon"
                onClick={() => setQualityItemsPl(qualityItemsPl.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button 
            variant="outline"
            onClick={() => setQualityItemsPl([...qualityItemsPl, ''])}
          >
            <Plus className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Dodaj Punkt' : 'Add Item'}
          </Button>
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
