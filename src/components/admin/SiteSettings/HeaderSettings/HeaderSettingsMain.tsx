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
      
      // Parse navigation_items from JSONB
      const parsedData = {
        ...data,
        navigation_items: (data.navigation_items as any) || []
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
