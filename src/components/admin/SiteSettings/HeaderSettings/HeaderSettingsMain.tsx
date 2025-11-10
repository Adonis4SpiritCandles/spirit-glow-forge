import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Upload, Plus, X, GripVertical } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface HeaderSettingsMainProps {
  onBack: () => void;
}

interface NavigationItem {
  label_en: string;
  label_pl: string;
  url: string;
  order: number;
  is_active: boolean;
}

interface LogoAnimation {
  enabled: boolean;
  speed: string;
  glow_intensity: string;
  hover_scale: string;
}

interface DesktopConfig {
  show_admin_icon: boolean;
  show_notification_bell: boolean;
  icon_sizes: {
    admin: string;
    notification: string;
    profile: string;
    cart: string;
  };
}

interface MobileConfig {
  logo_url?: string;
  logo_height?: string;
  logo_animation?: LogoAnimation;
  show_admin_icon: boolean;
  show_notification_bell: boolean;
  icon_sizes: {
    admin: string;
    notification: string;
    profile: string;
    cart: string;
  };
}

interface HeaderSettings {
  id: string;
  logo_url: string;
  logo_height: string;
  show_search: boolean;
  show_wishlist: boolean;
  show_cart: boolean;
  show_language_toggle: boolean;
  sticky_header: boolean;
  transparent_on_scroll: boolean;
  navigation_items: NavigationItem[];
  logo_animation?: LogoAnimation;
  desktop_config?: DesktopConfig;
  mobile_config?: MobileConfig;
}

function SortableNavItem({ item, index, onUpdate, onDelete }: { item: NavigationItem; index: number; onUpdate: (index: number, field: keyof NavigationItem, value: any) => void; onDelete: (index: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `nav-${index}` });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border">
      <div {...attributes} {...listeners} className="cursor-move">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-3">
        <Input 
          value={item.label_en} 
          onChange={(e) => onUpdate(index, 'label_en', e.target.value)}
          placeholder="English Label"
          className="text-sm"
        />
        <Input 
          value={item.label_pl} 
          onChange={(e) => onUpdate(index, 'label_pl', e.target.value)}
          placeholder="Polish Label"
          className="text-sm"
        />
        <Input 
          value={item.url} 
          onChange={(e) => onUpdate(index, 'url', e.target.value)}
          placeholder="/url"
          className="text-sm col-span-2"
        />
      </div>
      <Switch 
        checked={item.is_active}
        onCheckedChange={(checked) => onUpdate(index, 'is_active', checked)}
      />
      <Button variant="ghost" size="sm" onClick={() => onDelete(index)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function HeaderSettingsMain({ onBack }: HeaderSettingsMainProps) {
  const { language, t } = useLanguage();
  const { toast } = useToast();
  const [settings, setSettings] = useState<HeaderSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('header_settings')
        .select('*')
        .single();

      if (error) throw error;
      
      // Parse navigation_items and configs from JSONB with defaults
      const parsedData = {
        ...data,
        navigation_items: (data.navigation_items as any) || [],
        logo_animation: (data.logo_animation as any) || {
          enabled: true,
          speed: '4s',
          glow_intensity: '0.4',
          hover_scale: '1.05'
        },
        desktop_config: (data.desktop_config as any) || {
          show_admin_icon: true,
          show_notification_bell: true,
          icon_sizes: {
            admin: 'h-4 w-4',
            notification: 'h-5 w-5',
            profile: 'h-6 w-6',
            cart: 'h-5 w-5'
          }
        },
        mobile_config: (data.mobile_config as any) || {
          show_admin_icon: true,
          show_notification_bell: true,
          icon_sizes: {
            admin: 'h-5 w-5',
            notification: 'h-5 w-5',
            profile: 'h-6 w-6',
            cart: 'h-5 w-5'
          }
        }
      };
      
      setSettings(parsedData as HeaderSettings);
    } catch (error) {
      console.error('Error loading header settings:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' 
          ? 'Nie udało się załadować ustawień nagłówka' 
          : 'Failed to load header settings',
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
        .from('header_settings')
        .update({
          logo_url: settings.logo_url,
          logo_height: settings.logo_height,
          show_search: settings.show_search,
          show_wishlist: settings.show_wishlist,
          show_cart: settings.show_cart,
          show_language_toggle: settings.show_language_toggle,
          sticky_header: settings.sticky_header,
          transparent_on_scroll: settings.transparent_on_scroll,
          navigation_items: settings.navigation_items as any,
          logo_animation: settings.logo_animation as any,
          desktop_config: settings.desktop_config as any,
          mobile_config: settings.mobile_config as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Zapisano' : 'Saved',
        description: language === 'pl' 
          ? 'Ustawienia nagłówka zostały zaktualizowane' 
          : 'Header settings have been updated'
      });
    } catch (error) {
      console.error('Error saving header settings:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' 
          ? 'Nie udało się zapisać ustawień' 
          : 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleNavItemUpdate = (index: number, field: keyof NavigationItem, value: any) => {
    if (!settings) return;
    const newItems = [...settings.navigation_items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, navigation_items: newItems });
  };

  const handleNavItemDelete = (index: number) => {
    if (!settings) return;
    const newItems = settings.navigation_items.filter((_, i) => i !== index);
    setSettings({ ...settings, navigation_items: newItems });
  };

  const handleAddNavItem = () => {
    if (!settings) return;
    const newItem: NavigationItem = {
      label_en: 'New Item',
      label_pl: 'Nowy Element',
      url: '/new-page',
      order: settings.navigation_items.length + 1,
      is_active: true
    };
    setSettings({ ...settings, navigation_items: [...settings.navigation_items, newItem] });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!settings || !over || active.id === over.id) return;

    const oldIndex = settings.navigation_items.findIndex((_, i) => `nav-${i}` === active.id);
    const newIndex = settings.navigation_items.findIndex((_, i) => `nav-${i}` === over.id);

    const newItems = arrayMove(settings.navigation_items, oldIndex, newIndex).map((item, idx) => ({
      ...item,
      order: idx + 1
    }));

    setSettings({ ...settings, navigation_items: newItems });
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

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{t('headerSettings')}</h2>
            <p className="text-muted-foreground text-sm">
              {language === 'pl' 
                ? 'Dostosuj wygląd i zachowanie nagłówka' 
                : 'Customize header appearance and behavior'}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') : (language === 'pl' ? 'Zapisz zmiany' : 'Save Changes')}
        </Button>
      </div>

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Logo' : 'Logo'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Zarządzaj logo wyświetlanym w nagłówku' 
              : 'Manage the logo displayed in the header'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'URL Logo' : 'Logo URL'}</Label>
            <Input 
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="/spirit-logo-transparent.png"
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Wysokość Logo (Tailwind class)' : 'Logo Height (Tailwind class)'}</Label>
            <Input 
              value={settings.logo_height}
              onChange={(e) => setSettings({ ...settings, logo_height: e.target.value })}
              placeholder="h-12"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'pl' 
                ? 'Przykłady: h-8, h-10, h-12, h-16' 
                : 'Examples: h-8, h-10, h-12, h-16'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Items */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Elementy Nawigacji' : 'Navigation Items'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Zarządzaj elementami menu nawigacji. Przeciągnij aby zmienić kolejność.' 
              : 'Manage navigation menu items. Drag to reorder.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={settings.navigation_items.map((_, i) => `nav-${i}`)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {settings.navigation_items.map((item, index) => (
                  <SortableNavItem
                    key={`nav-${index}`}
                    item={item}
                    index={index}
                    onUpdate={handleNavItemUpdate}
                    onDelete={handleNavItemDelete}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          <Button onClick={handleAddNavItem} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {language === 'pl' ? 'Dodaj Element' : 'Add Item'}
          </Button>
        </CardContent>
      </Card>

      {/* Display Options */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Opcje Wyświetlania' : 'Display Options'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Kontroluj widoczność elementów nagłówka' 
              : 'Control visibility of header elements'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż wyszukiwanie' : 'Show Search'}</Label>
            <Switch 
              checked={settings.show_search}
              onCheckedChange={(checked) => setSettings({ ...settings, show_search: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż listę życzeń' : 'Show Wishlist'}</Label>
            <Switch 
              checked={settings.show_wishlist}
              onCheckedChange={(checked) => setSettings({ ...settings, show_wishlist: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż koszyk' : 'Show Cart'}</Label>
            <Switch 
              checked={settings.show_cart}
              onCheckedChange={(checked) => setSettings({ ...settings, show_cart: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż przełącznik języka' : 'Show Language Toggle'}</Label>
            <Switch 
              checked={settings.show_language_toggle}
              onCheckedChange={(checked) => setSettings({ ...settings, show_language_toggle: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logo Animation */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Animacja Logo' : 'Logo Animation'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Kontroluj efekty animacji i świecenia logo' 
              : 'Control logo animation and glow effects'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Włącz animację' : 'Enable Animation'}</Label>
            <Switch 
              checked={settings.logo_animation?.enabled ?? true}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                logo_animation: { ...settings.logo_animation!, enabled: checked }
              })}
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Prędkość animacji (sekundy)' : 'Animation Speed (seconds)'}</Label>
            <Input 
              type="number"
              value={parseFloat(settings.logo_animation?.speed || '4')}
              onChange={(e) => setSettings({ 
                ...settings, 
                logo_animation: { ...settings.logo_animation!, speed: e.target.value + 's' }
              })}
              placeholder="4"
              step="0.5"
              min="1"
              max="10"
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Intensywność świecenia (0-1)' : 'Glow Intensity (0-1)'}</Label>
            <Input 
              type="number"
              value={parseFloat(settings.logo_animation?.glow_intensity || '0.4')}
              onChange={(e) => setSettings({ 
                ...settings, 
                logo_animation: { ...settings.logo_animation!, glow_intensity: e.target.value }
              })}
              placeholder="0.4"
              step="0.1"
              min="0"
              max="1"
            />
          </div>
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Powiększenie przy najechaniu' : 'Hover Scale'}</Label>
            <Input 
              type="number"
              value={parseFloat(settings.logo_animation?.hover_scale || '1.05')}
              onChange={(e) => setSettings({ 
                ...settings, 
                logo_animation: { ...settings.logo_animation!, hover_scale: e.target.value }
              })}
              placeholder="1.05"
              step="0.05"
              min="1"
              max="1.5"
            />
          </div>
        </CardContent>
      </Card>

      {/* Desktop Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Konfiguracja Desktop (1024px+)' : 'Desktop Configuration (1024px+)'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Dostosuj wygląd nagłówka dla ekranów desktopowych' 
              : 'Customize header layout for desktop screens'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż ikonę admina' : 'Show Admin Icon'}</Label>
            <Switch 
              checked={settings.desktop_config?.show_admin_icon ?? true}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                desktop_config: { ...settings.desktop_config!, show_admin_icon: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż dzwonek powiadomień' : 'Show Notification Bell'}</Label>
            <Switch 
              checked={settings.desktop_config?.show_notification_bell ?? true}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                desktop_config: { ...settings.desktop_config!, show_notification_bell: checked }
              })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">{language === 'pl' ? 'Rozmiar ikony admina' : 'Admin Icon Size'}</Label>
              <Input 
                value={settings.desktop_config?.icon_sizes?.admin || 'h-4 w-4'}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  desktop_config: { 
                    ...settings.desktop_config!, 
                    icon_sizes: { ...settings.desktop_config!.icon_sizes, admin: e.target.value }
                  }
                })}
                placeholder="h-4 w-4"
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{language === 'pl' ? 'Rozmiar dzwonka' : 'Bell Icon Size'}</Label>
              <Input 
                value={settings.desktop_config?.icon_sizes?.notification || 'h-5 w-5'}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  desktop_config: { 
                    ...settings.desktop_config!, 
                    icon_sizes: { ...settings.desktop_config!.icon_sizes, notification: e.target.value }
                  }
                })}
                placeholder="h-5 w-5"
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile & Tablet Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Konfiguracja Mobile/Tablet (< 1024px)' : 'Mobile/Tablet Configuration (< 1024px)'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Dostosuj logo i animacje dla urządzeń mobilnych i tabletów' 
              : 'Customize logo and animations for mobile and tablet devices'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mobile Logo URL */}
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Logo URL (Mobile/Tablet)' : 'Logo URL (Mobile/Tablet)'}</Label>
            <Input 
              value={settings.mobile_config?.logo_url || settings.logo_url}
              onChange={(e) => setSettings({ 
                ...settings, 
                mobile_config: { ...settings.mobile_config!, logo_url: e.target.value }
              })}
              placeholder="/assets/icon-logo-candle-transparent.png"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'pl' 
                ? 'Zostaw puste, aby użyć logo desktop' 
                : 'Leave empty to use desktop logo'}
            </p>
          </div>

          {/* Mobile Logo Height */}
          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Wysokość Logo (Tailwind)' : 'Logo Height (Tailwind)'}</Label>
            <Input 
              value={settings.mobile_config?.logo_height || 'h-10'}
              onChange={(e) => setSettings({ 
                ...settings, 
                mobile_config: { ...settings.mobile_config!, logo_height: e.target.value }
              })}
              placeholder="h-10"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'pl' 
                ? 'Przykłady: h-8, h-10, h-12' 
                : 'Examples: h-8, h-10, h-12'}
            </p>
          </div>

          {/* Mobile Logo Animation */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{language === 'pl' ? 'Animacja Logo Mobile' : 'Mobile Logo Animation'}</Label>
            
            <div className="flex items-center justify-between pl-2">
              <Label className="text-sm">{language === 'pl' ? 'Włącz animację' : 'Enable Animation'}</Label>
              <Switch 
                checked={settings.mobile_config?.logo_animation?.enabled ?? true}
                onCheckedChange={(checked) => setSettings({ 
                  ...settings, 
                  mobile_config: { 
                    ...settings.mobile_config!, 
                    logo_animation: { ...settings.mobile_config!.logo_animation!, enabled: checked }
                  }
                })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pl-2">
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Velocità (s)' : 'Speed (s)'}</Label>
                <Input 
                  type="number"
                  value={parseFloat(settings.mobile_config?.logo_animation?.speed || '4')}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      logo_animation: { ...settings.mobile_config!.logo_animation!, speed: e.target.value + 's' }
                    }
                  })}
                  placeholder="4"
                  step="0.5"
                  min="1"
                  max="10"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Intensità' : 'Intensity'}</Label>
                <Input 
                  type="number"
                  value={parseFloat(settings.mobile_config?.logo_animation?.glow_intensity || '0.4')}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      logo_animation: { ...settings.mobile_config!.logo_animation!, glow_intensity: e.target.value }
                    }
                  })}
                  placeholder="0.4"
                  step="0.1"
                  min="0"
                  max="1"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-xs">{language === 'pl' ? 'Hover Scale' : 'Hover Scale'}</Label>
                <Input 
                  type="number"
                  value={parseFloat(settings.mobile_config?.logo_animation?.hover_scale || '1.05')}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      logo_animation: { ...settings.mobile_config!.logo_animation!, hover_scale: e.target.value }
                    }
                  })}
                  placeholder="1.05"
                  step="0.05"
                  min="1"
                  max="1.5"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mobile Icon Sizes */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">{language === 'pl' ? 'Rozmiary Ikon Mobile' : 'Mobile Icon Sizes'}</Label>
            <div className="grid grid-cols-2 gap-3 pl-2">
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Admin' : 'Admin'}</Label>
                <Input 
                  value={settings.mobile_config?.icon_sizes?.admin || 'h-5 w-5'}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      icon_sizes: { ...settings.mobile_config!.icon_sizes, admin: e.target.value }
                    }
                  })}
                  placeholder="h-5 w-5"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Notification' : 'Notification'}</Label>
                <Input 
                  value={settings.mobile_config?.icon_sizes?.notification || 'h-5 w-5'}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      icon_sizes: { ...settings.mobile_config!.icon_sizes, notification: e.target.value }
                    }
                  })}
                  placeholder="h-5 w-5"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Profile' : 'Profile'}</Label>
                <Input 
                  value={settings.mobile_config?.icon_sizes?.profile || 'h-6 w-6'}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      icon_sizes: { ...settings.mobile_config!.icon_sizes, profile: e.target.value }
                    }
                  })}
                  placeholder="h-6 w-6"
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">{language === 'pl' ? 'Cart' : 'Cart'}</Label>
                <Input 
                  value={settings.mobile_config?.icon_sizes?.cart || 'h-5 w-5'}
                  onChange={(e) => setSettings({ 
                    ...settings, 
                    mobile_config: { 
                      ...settings.mobile_config!, 
                      icon_sizes: { ...settings.mobile_config!.icon_sizes, cart: e.target.value }
                    }
                  })}
                  placeholder="h-5 w-5"
                  className="text-xs"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Behavior */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Konfiguracja Mobile (< 768px)' : 'Mobile Configuration (< 768px)'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Dostosuj wygląd nagłówka dla urządzeń mobilnych' 
              : 'Customize header layout for mobile devices'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż ikonę admina' : 'Show Admin Icon'}</Label>
            <Switch 
              checked={settings.mobile_config?.show_admin_icon ?? true}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                mobile_config: { ...settings.mobile_config!, show_admin_icon: checked }
              })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{language === 'pl' ? 'Pokaż dzwonek powiadomień' : 'Show Notification Bell'}</Label>
            <Switch 
              checked={settings.mobile_config?.show_notification_bell ?? true}
              onCheckedChange={(checked) => setSettings({ 
                ...settings, 
                mobile_config: { ...settings.mobile_config!, show_notification_bell: checked }
              })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">{language === 'pl' ? 'Rozmiar ikony admina' : 'Admin Icon Size'}</Label>
              <Input 
                value={settings.mobile_config?.icon_sizes?.admin || 'h-5 w-5'}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  mobile_config: { 
                    ...settings.mobile_config!, 
                    icon_sizes: { ...settings.mobile_config!.icon_sizes, admin: e.target.value }
                  }
                })}
                placeholder="h-5 w-5"
                className="text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">{language === 'pl' ? 'Rozmiar dzwonka' : 'Bell Icon Size'}</Label>
              <Input 
                value={settings.mobile_config?.icon_sizes?.notification || 'h-5 w-5'}
                onChange={(e) => setSettings({ 
                  ...settings, 
                  mobile_config: { 
                    ...settings.mobile_config!, 
                    icon_sizes: { ...settings.mobile_config!.icon_sizes, notification: e.target.value }
                  }
                })}
                placeholder="h-5 w-5"
                className="text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Zachowanie' : 'Behavior'}</CardTitle>
          <CardDescription>
            {language === 'pl' 
              ? 'Dostosuj zachowanie nagłówka podczas przewijania' 
              : 'Customize header behavior during scrolling'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>{language === 'pl' ? 'Przyklejony nagłówek' : 'Sticky Header'}</Label>
              <p className="text-xs text-muted-foreground">
                {language === 'pl' 
                  ? 'Nagłówek pozostaje widoczny podczas przewijania' 
                  : 'Header stays visible while scrolling'}
              </p>
            </div>
            <Switch 
              checked={settings.sticky_header}
              onCheckedChange={(checked) => setSettings({ ...settings, sticky_header: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>{language === 'pl' ? 'Przezroczystość przy przewijaniu' : 'Transparent on Scroll'}</Label>
              <p className="text-xs text-muted-foreground">
                {language === 'pl' 
                  ? 'Nagłówek staje się przezroczysty u góry strony' 
                  : 'Header becomes transparent at top of page'}
              </p>
            </div>
            <Switch 
              checked={settings.transparent_on_scroll}
              onCheckedChange={(checked) => setSettings({ ...settings, transparent_on_scroll: checked })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
