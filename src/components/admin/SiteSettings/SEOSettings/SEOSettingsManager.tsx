import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, Eye, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SEOSetting {
  id: string;
  page_type: string;
  title_en: string | null;
  title_pl: string | null;
  description_en: string | null;
  description_pl: string | null;
  keywords_en: string | null;
  keywords_pl: string | null;
  og_image_url: string | null;
  noindex: boolean;
}

const SEOSettingsManager = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState<SEOSetting[]>([]);
  const [selectedPageType, setSelectedPageType] = useState('home');
  const [currentSetting, setCurrentSetting] = useState<SEOSetting | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings.length > 0) {
      const setting = settings.find(s => s.page_type === selectedPageType);
      setCurrentSetting(setting || null);
    }
  }, [selectedPageType, settings]);

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('seo_settings')
      .select('*')
      .order('page_type');

    if (error) {
      toast({
        title: language === 'en' ? 'Error loading SEO settings' : 'Błąd ładowania ustawień SEO',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    setSettings(data || []);
  };

  const handleSave = async () => {
    if (!currentSetting) return;

    setIsSaving(true);
    const { error } = await supabase
      .from('seo_settings')
      .update({
        title_en: currentSetting.title_en,
        title_pl: currentSetting.title_pl,
        description_en: currentSetting.description_en,
        description_pl: currentSetting.description_pl,
        keywords_en: currentSetting.keywords_en,
        keywords_pl: currentSetting.keywords_pl,
        og_image_url: currentSetting.og_image_url,
        noindex: currentSetting.noindex
      })
      .eq('page_type', currentSetting.page_type)
      .select();

    setIsSaving(false);

    if (error) {
      console.error('[SEOSettingsManager] Error saving:', error);
      toast({
        title: language === 'en' ? 'Error saving SEO settings' : 'Błąd zapisywania ustawień SEO',
        description: error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: language === 'en' ? 'SEO settings saved' : 'Ustawienia SEO zapisane',
      description: language === 'en' ? 'Changes applied successfully' : 'Zmiany zostały zastosowane'
    });

    loadSettings();
  };

  const updateField = (field: keyof SEOSetting, value: any) => {
    if (!currentSetting) return;
    setCurrentSetting({
      ...currentSetting,
      [field]: value
    });
  };

  const pageTypes = [
    { value: 'home', label: language === 'en' ? 'Homepage' : 'Strona główna' },
    { value: 'shop', label: language === 'en' ? 'Shop' : 'Sklep' },
    { value: 'product_default', label: language === 'en' ? 'Product Pages' : 'Strony produktów' },
    { value: 'collection_default', label: language === 'en' ? 'Collections' : 'Kolekcje' },
    { value: 'about', label: language === 'en' ? 'About' : 'O nas' },
    { value: 'contact', label: language === 'en' ? 'Contact' : 'Kontakt' }
  ];

  if (!currentSetting) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">
          {language === 'en' ? 'Loading SEO settings...' : 'Ładowanie ustawień SEO...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-playfair font-bold text-foreground">
            {language === 'en' ? 'SEO Settings' : 'Ustawienia SEO'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === 'en' 
              ? 'Manage meta tags, titles, and descriptions for all pages'
              : 'Zarządzaj meta tagami, tytułami i opisami dla wszystkich stron'}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving 
            ? (language === 'en' ? 'Saving...' : 'Zapisywanie...') 
            : (language === 'en' ? 'Save Changes' : 'Zapisz zmiany')}
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {language === 'en'
            ? 'SEO changes will take effect immediately on your website. Make sure titles are under 60 characters and descriptions under 160 characters.'
            : 'Zmiany SEO zostaną zastosowane natychmiast na stronie. Upewnij się, że tytuły mają mniej niż 60 znaków, a opisy mniej niż 160 znaków.'}
        </AlertDescription>
      </Alert>

      {/* Page Type Selector */}
      <div className="flex flex-wrap gap-2">
        {pageTypes.map((type) => (
          <Badge
            key={type.value}
            variant={selectedPageType === type.value ? 'default' : 'outline'}
            className="cursor-pointer px-4 py-2"
            onClick={() => setSelectedPageType(type.value)}
          >
            <Globe className="mr-1 h-3 w-3" />
            {type.label}
          </Badge>
        ))}
      </div>

      {/* SEO Fields */}
      <Tabs defaultValue="en" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="en">English</TabsTrigger>
          <TabsTrigger value="pl">Polski</TabsTrigger>
        </TabsList>

        <TabsContent value="en" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>English SEO</CardTitle>
              <CardDescription>Configure SEO for English version</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title_en">Title Tag</Label>
                <Input
                  id="title_en"
                  value={currentSetting.title_en || ''}
                  onChange={(e) => updateField('title_en', e.target.value)}
                  placeholder="SPIRIT CANDLES — Reborn Your Nature | Luxury Soy Candles"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {currentSetting.title_en?.length || 0}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_en">Meta Description</Label>
                <Textarea
                  id="description_en"
                  value={currentSetting.description_en || ''}
                  onChange={(e) => updateField('description_en', e.target.value)}
                  placeholder="Discover SPIRIT CANDLES luxury soy candles inspired by iconic fragrances..."
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {currentSetting.description_en?.length || 0}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords_en">Keywords (comma-separated)</Label>
                <Input
                  id="keywords_en"
                  value={currentSetting.keywords_en || ''}
                  onChange={(e) => updateField('keywords_en', e.target.value)}
                  placeholder="luxury candles, soy candles, wooden wick, natural candles"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pl" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Polski SEO</CardTitle>
              <CardDescription>Konfiguruj SEO dla wersji polskiej</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title_pl">Tytuł strony</Label>
                <Input
                  id="title_pl"
                  value={currentSetting.title_pl || ''}
                  onChange={(e) => updateField('title_pl', e.target.value)}
                  placeholder="SPIRIT CANDLES — Odrodź Swoją Naturę | Luksusowe Świece Sojowe"
                  maxLength={60}
                />
                <p className="text-xs text-muted-foreground">
                  {currentSetting.title_pl?.length || 0}/60 znaków
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description_pl">Meta Opis</Label>
                <Textarea
                  id="description_pl"
                  value={currentSetting.description_pl || ''}
                  onChange={(e) => updateField('description_pl', e.target.value)}
                  placeholder="Odkryj luksusowe świece sojowe SPIRIT CANDLES inspirowane kultowymi zapachami..."
                  maxLength={160}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {currentSetting.description_pl?.length || 0}/160 znaków
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords_pl">Słowa kluczowe (oddzielone przecinkami)</Label>
                <Input
                  id="keywords_pl"
                  value={currentSetting.keywords_pl || ''}
                  onChange={(e) => updateField('keywords_pl', e.target.value)}
                  placeholder="luksusowe świece, świece sojowe, drewniany knot, naturalne świece"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Open Graph Image */}
      <Card>
        <CardHeader>
          <CardTitle>Open Graph Image</CardTitle>
          <CardDescription>
            Image used when sharing on social media (recommended: 1200x630px)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={currentSetting.og_image_url || ''}
            onChange={(e) => updateField('og_image_url', e.target.value)}
            placeholder="https://spirit-candle.com/og-image-home.jpg"
          />
          {currentSetting.og_image_url && (
            <div className="mt-4">
              <img 
                src={currentSetting.og_image_url} 
                alt="Open Graph preview" 
                className="w-full max-w-md rounded-lg border border-border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* SEO Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Eye className="inline mr-2 h-5 w-5" />
            SEO Preview
          </CardTitle>
          <CardDescription>How your page will appear in search results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <div className="text-xl text-primary font-medium">
              {(language === 'en' ? currentSetting.title_en : currentSetting.title_pl) || 'Page Title'}
            </div>
            <div className="text-xs text-success">
              spirit-candle.com › {selectedPageType}
            </div>
            <div className="text-sm text-muted-foreground">
              {(language === 'en' ? currentSetting.description_en : currentSetting.description_pl) || 'Meta description will appear here...'}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOSettingsManager;