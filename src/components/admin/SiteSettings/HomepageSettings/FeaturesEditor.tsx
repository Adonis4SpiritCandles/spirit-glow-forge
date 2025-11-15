import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { Plus, Edit, Trash2, GripVertical, Sparkles } from "lucide-react";
import * as Icons from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Feature {
  id: string;
  title_en: string;
  title_pl: string;
  description_en: string;
  description_pl: string;
  icon_name: string;
  tooltip_en?: string;
  tooltip_pl?: string;
  display_order: number;
  is_active: boolean;
}

const FeaturesEditor = () => {
  const { language } = useLanguage();
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sectionToggle, setSectionToggle] = useState<boolean>(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    loadFeatures();
    loadSectionToggle();
  }, []);

  const loadSectionToggle = async () => {
    try {
      const { data } = await supabase
        .from('homepage_sections_toggle')
        .select('features_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (data) {
        setSectionToggle(data.features_section_active ?? true);
      }
    } catch (error) {
      console.error('Error loading section toggle:', error);
    }
  };

  const handleToggleSection = async (checked: boolean) => {
    setSectionToggle(checked);
    try {
      const { error } = await supabase
        .from('homepage_sections_toggle')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          features_section_active: checked,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });
      
      if (error) throw error;
      toast.success(language === 'pl' ? 'Sekcja zaktualizowana' : 'Section updated');
    } catch (error: any) {
      console.error('Error updating section toggle:', error);
      toast.error(language === 'pl' ? 'Nie udało się zaktualizować sekcji' : 'Failed to update section');
      setSectionToggle(!checked); // Revert on error
    }
  };

  const loadFeatures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('homepage_features')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setFeatures(data || []);
    } catch (error) {
      console.error('Error loading features:', error);
      toast.error(language === 'pl' ? 'Nie udało się załadować funkcji' : 'Failed to load features');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = features.findIndex((f) => f.id === active.id);
      const newIndex = features.findIndex((f) => f.id === over.id);
      const newFeatures = arrayMove(features, oldIndex, newIndex).map((f, index) => ({
        ...f,
        display_order: index,
      }));
      setFeatures(newFeatures);

      // Update in database
      try {
        const updates = newFeatures.map((f) => ({
          id: f.id,
          display_order: f.display_order,
        }));
        for (const update of updates) {
          await supabase.from('homepage_features').update({ display_order: update.display_order }).eq('id', update.id);
        }
        toast.success(language === 'pl' ? 'Kolejność zaktualizowana!' : 'Order updated!');
      } catch (error) {
        console.error('Error updating order:', error);
        toast.error(language === 'pl' ? 'Nie udało się zaktualizować kolejności' : 'Failed to update order');
      }
    }
  };

  const handleSaveFeature = async () => {
    if (!editingFeature) return;

    try {
      if (editingFeature.id === 'new') {
        const { error } = await supabase.from('homepage_features').insert({
          title_en: editingFeature.title_en,
          title_pl: editingFeature.title_pl,
          description_en: editingFeature.description_en,
          description_pl: editingFeature.description_pl,
          icon_name: editingFeature.icon_name,
          tooltip_en: editingFeature.tooltip_en,
          tooltip_pl: editingFeature.tooltip_pl,
          display_order: features.length,
          is_active: true,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_features')
          .update({
            title_en: editingFeature.title_en,
            title_pl: editingFeature.title_pl,
            description_en: editingFeature.description_en,
            description_pl: editingFeature.description_pl,
            icon_name: editingFeature.icon_name,
            tooltip_en: editingFeature.tooltip_en,
            tooltip_pl: editingFeature.tooltip_pl,
          })
          .eq('id', editingFeature.id);
        if (error) throw error;
      }

      toast.success(language === 'pl' ? 'Funkcja zapisana!' : 'Feature saved!');
      setIsDialogOpen(false);
      setEditingFeature(null);
      loadFeatures();
    } catch (error) {
      console.error('Error saving feature:', error);
      toast.error(language === 'pl' ? 'Nie udało się zapisać funkcji' : 'Failed to save feature');
    }
  };

  const handleDeleteFeature = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć tę funkcję?' : 'Are you sure you want to delete this feature?')) return;

    try {
      const { error } = await supabase.from('homepage_features').delete().eq('id', id);
      if (error) throw error;
      toast.success(language === 'pl' ? 'Funkcja usunięta!' : 'Feature deleted!');
      loadFeatures();
    } catch (error) {
      console.error('Error deleting feature:', error);
      toast.error(language === 'pl' ? 'Nie udało się usunąć funkcji' : 'Failed to delete feature');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase.from('homepage_features').update({ is_active: isActive }).eq('id', id);
      if (error) throw error;
      loadFeatures();
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  const SortableFeature = ({ feature }: { feature: Feature }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: feature.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const IconComponent = (Icons as any)[feature.icon_name] || Sparkles;

    return (
      <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
        <div {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{language === 'pl' ? feature.title_pl : feature.title_en}</p>
              <p className="text-xs text-muted-foreground">{language === 'pl' ? feature.description_pl : feature.description_en}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Icon: <code className="bg-muted px-2 py-0.5 rounded">{feature.icon_name}</code>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Switch checked={feature.is_active} onCheckedChange={(checked) => handleToggleActive(feature.id, checked)} />
            <Button variant="ghost" size="icon" onClick={() => { setEditingFeature(feature); setIsDialogOpen(true); }}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteFeature(feature.id)}>
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              {language === 'pl' ? 'Edytor Funkcji (Why Spirit Candles)' : 'Features Editor (Why Spirit Candles)'}
            </CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Zarządzaj kartami funkcji wyświetlanymi na stronie głównej' : 'Manage feature cards displayed on the homepage'}
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingFeature({ id: 'new', title_en: '', title_pl: '', description_en: '', description_pl: '', icon_name: 'Sparkles', display_order: features.length, is_active: true })}>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Dodaj Funkcję' : 'Add Feature'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFeature?.id === 'new' ? (language === 'pl' ? 'Nowa Funkcja' : 'New Feature') : (language === 'pl' ? 'Edytuj Funkcję' : 'Edit Feature')}</DialogTitle>
              </DialogHeader>
              {editingFeature && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title (EN)</Label>
                      <Input value={editingFeature.title_en} onChange={(e) => setEditingFeature({ ...editingFeature, title_en: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tytuł (PL)</Label>
                      <Input value={editingFeature.title_pl} onChange={(e) => setEditingFeature({ ...editingFeature, title_pl: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Description (EN)</Label>
                      <Textarea value={editingFeature.description_en} onChange={(e) => setEditingFeature({ ...editingFeature, description_en: e.target.value })} rows={2} />
                    </div>
                    <div className="space-y-2">
                      <Label>Opis (PL)</Label>
                      <Textarea value={editingFeature.description_pl} onChange={(e) => setEditingFeature({ ...editingFeature, description_pl: e.target.value })} rows={2} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tooltip (EN)</Label>
                      <Input value={editingFeature.tooltip_en || ''} onChange={(e) => setEditingFeature({ ...editingFeature, tooltip_en: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Tooltip (PL)</Label>
                      <Input value={editingFeature.tooltip_pl || ''} onChange={(e) => setEditingFeature({ ...editingFeature, tooltip_pl: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Icon Name (Lucide)</Label>
                    <Input value={editingFeature.icon_name} onChange={(e) => setEditingFeature({ ...editingFeature, icon_name: e.target.value })} placeholder="Truck, Leaf, Heart, Sparkles" />
                    <p className="text-xs text-muted-foreground">See available icons at: <a href="https://lucide.dev/icons" target="_blank" className="text-primary hover:underline">lucide.dev/icons</a></p>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'pl' ? 'Anuluj' : 'Cancel'}</Button>
                    <Button onClick={handleSaveFeature}>{language === 'pl' ? 'Zapisz' : 'Save'}</Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="features-section-active" className="text-base font-semibold">
              {language === 'pl' ? 'Aktywna Sekcja Funkcji' : 'Features Section Active'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Wyświetl sekcję "Why Spirit Candles?" na stronie głównej'
                : 'Display the "Why Spirit Candles?" section on the homepage'}
            </p>
          </div>
          <Switch
            id="features-section-active"
            checked={sectionToggle}
            onCheckedChange={handleToggleSection}
          />
        </div>

        <div className="space-y-3 pt-4 border-t">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={features.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {features.map((feature) => (
                <SortableFeature key={feature.id} feature={feature} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeaturesEditor;
