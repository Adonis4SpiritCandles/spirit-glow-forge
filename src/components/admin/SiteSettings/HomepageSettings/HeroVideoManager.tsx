import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Save, Video, Upload } from "lucide-react";

const HeroVideoManager = () => {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    video_url: '/videos/hero-background.mp4',
    opacity_overlay: 0.6,
    autoplay: true,
    loop_video: true,
    muted: true,
    mobile_video_url: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_hero_video')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          video_url: data.video_url,
          opacity_overlay: data.opacity_overlay,
          autoplay: data.autoplay,
          loop_video: data.loop_video,
          muted: data.muted,
          mobile_video_url: data.mobile_video_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading hero video settings:', error);
      toast.error(language === 'pl' 
        ? 'Nie udało się załadować ustawień wideo' 
        : 'Failed to load video settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('homepage_hero_video')
        .update({
          video_url: settings.video_url,
          opacity_overlay: settings.opacity_overlay,
          autoplay: settings.autoplay,
          loop_video: settings.loop_video,
          muted: settings.muted,
          mobile_video_url: settings.mobile_video_url || null,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', (await supabase.from('homepage_hero_video').select('id').single()).data?.id);

      if (error) throw error;

      toast.success(language === 'pl' 
        ? 'Ustawienia wideo zapisane!' 
        : 'Video settings saved!');
    } catch (error) {
      console.error('Error saving hero video settings:', error);
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
          <Video className="w-5 h-5" />
          {language === 'pl' ? 'Zarządzanie Wideo Hero' : 'Hero Video Manager'}
        </CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Zarządzaj wideo w tle, overlayem i ustawieniami odtwarzania'
            : 'Manage background video, overlay, and playback settings'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video URL */}
        <div className="space-y-2">
          <Label htmlFor="video-url">
            {language === 'pl' ? 'URL Wideo (Desktop)' : 'Video URL (Desktop)'}
          </Label>
          <div className="flex gap-2">
            <Input
              id="video-url"
              type="text"
              value={settings.video_url}
              onChange={(e) => setSettings({ ...settings, video_url: e.target.value })}
              placeholder="/videos/hero-background.mp4"
            />
            <Button variant="outline" size="icon">
              <Upload className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {language === 'pl'
              ? 'Ścieżka do pliku wideo w folderze public/videos/ lub pełny URL'
              : 'Path to video file in public/videos/ folder or full URL'}
          </p>
        </div>

        {/* Mobile Video URL */}
        <div className="space-y-2">
          <Label htmlFor="mobile-video-url">
            {language === 'pl' ? 'URL Wideo (Mobile - opcjonalne)' : 'Video URL (Mobile - optional)'}
          </Label>
          <Input
            id="mobile-video-url"
            type="text"
            value={settings.mobile_video_url}
            onChange={(e) => setSettings({ ...settings, mobile_video_url: e.target.value })}
            placeholder="/videos/hero-mobile.mp4"
          />
          <p className="text-xs text-muted-foreground">
            {language === 'pl'
              ? 'Opcjonalnie: mniejszy plik wideo zoptymalizowany dla urządzeń mobilnych'
              : 'Optional: smaller video file optimized for mobile devices'}
          </p>
        </div>

        {/* Opacity Overlay */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>
              {language === 'pl' ? 'Przezroczystość Nakładki' : 'Overlay Opacity'}
            </Label>
            <span className="text-sm text-muted-foreground">
              {Math.round(settings.opacity_overlay * 100)}%
            </span>
          </div>
          <Slider
            value={[settings.opacity_overlay]}
            onValueChange={(value) => setSettings({ ...settings, opacity_overlay: value[0] })}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            {language === 'pl'
              ? 'Kontroluj intensywność ciemnej nakładki na wideo'
              : 'Control the intensity of the dark overlay on the video'}
          </p>
        </div>

        {/* Autoplay */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="autoplay">
              {language === 'pl' ? 'Automatyczne Odtwarzanie' : 'Autoplay'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Rozpocznij odtwarzanie wideo automatycznie'
                : 'Start video playback automatically'}
            </p>
          </div>
          <Switch
            id="autoplay"
            checked={settings.autoplay}
            onCheckedChange={(checked) => setSettings({ ...settings, autoplay: checked })}
          />
        </div>

        {/* Loop */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="loop">
              {language === 'pl' ? 'Zapętlenie' : 'Loop'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Odtwarzaj wideo w nieskończonej pętli'
                : 'Play video in an infinite loop'}
            </p>
          </div>
          <Switch
            id="loop"
            checked={settings.loop_video}
            onCheckedChange={(checked) => setSettings({ ...settings, loop_video: checked })}
          />
        </div>

        {/* Muted */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="muted">
              {language === 'pl' ? 'Wyciszone' : 'Muted'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Odtwarzaj wideo bez dźwięku'
                : 'Play video without sound'}
            </p>
          </div>
          <Switch
            id="muted"
            checked={settings.muted}
            onCheckedChange={(checked) => setSettings({ ...settings, muted: checked })}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
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

export default HeroVideoManager;
