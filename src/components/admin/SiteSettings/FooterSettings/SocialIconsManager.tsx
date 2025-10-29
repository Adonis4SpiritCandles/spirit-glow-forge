import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, GripVertical, ExternalLink, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SocialIcon {
  id: string;
  name: string;
  icon_url: string | null;
  link_url: string;
  display_order: number;
  is_active: boolean;
}

interface SortableItemProps {
  id: string;
  icon: SocialIcon;
  onEdit: (icon: SocialIcon) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
}

const SortableItem = ({ id, icon, onEdit, onDelete, onToggle }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <p className="font-medium text-foreground">{icon.name}</p>
          {icon.icon_url && (
            <img src={icon.icon_url} alt={icon.name} className="w-6 h-6 mt-1" />
          )}
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <a
            href={icon.link_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline truncate"
          >
            {icon.link_url}
          </a>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Switch
            checked={icon.is_active}
            onCheckedChange={(checked) => onToggle(icon.id, checked)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(icon)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(icon.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const SocialIconsManager = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [icons, setIcons] = useState<SocialIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<SocialIcon | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon_url: '',
    link_url: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadIcons = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_social_icons')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setIcons(data || []);
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIcons();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = icons.findIndex((icon) => icon.id === active.id);
      const newIndex = icons.findIndex((icon) => icon.id === over.id);
      const newIcons = arrayMove(icons, oldIndex, newIndex);
      
      setIcons(newIcons);

      // Update display_order in database
      try {
        const updates = newIcons.map((icon, index) => ({
          id: icon.id,
          display_order: index,
        }));

        for (const update of updates) {
          await supabase
            .from('footer_social_icons')
            .update({ display_order: update.display_order })
            .eq('id', update.id);
        }

        toast({
          title: language === 'pl' ? 'Sukces' : 'Success',
          description: language === 'pl' ? 'Kolejność zaktualizowana' : 'Order updated',
        });
      } catch (error: any) {
        toast({
          title: language === 'pl' ? 'Błąd' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
        loadIcons();
      }
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name || !formData.link_url) {
        toast({
          title: language === 'pl' ? 'Błąd' : 'Error',
          description: language === 'pl' ? 'Wypełnij wszystkie pola' : 'Fill all required fields',
          variant: 'destructive',
        });
        return;
      }

      if (editingIcon) {
        const { error } = await supabase
          .from('footer_social_icons')
          .update(formData)
          .eq('id', editingIcon.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_social_icons')
          .insert({
            ...formData,
            display_order: icons.length,
          });

        if (error) throw error;
      }

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' 
          ? (editingIcon ? 'Ikona zaktualizowana' : 'Ikona dodana')
          : (editingIcon ? 'Icon updated' : 'Icon added'),
      });

      setIsDialogOpen(false);
      setEditingIcon(null);
      setFormData({ name: '', icon_url: '', link_url: '' });
      loadIcons();
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (icon: SocialIcon) => {
    setEditingIcon(icon);
    setFormData({
      name: icon.name,
      icon_url: icon.icon_url || '',
      link_url: icon.link_url,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć tę ikonę?' : 'Are you sure you want to delete this icon?')) return;

    try {
      const { error } = await supabase
        .from('footer_social_icons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Ikona usunięta' : 'Icon deleted',
      });

      loadIcons();
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('footer_social_icons')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      loadIcons();
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{language === 'pl' ? 'Ikony Social Media' : 'Social Media Icons'}</CardTitle>
            <CardDescription>
              {language === 'pl'
                ? 'Zarządzaj ikonami społecznościowymi w stopce. Przeciągnij aby zmienić kolejność.'
                : 'Manage social media icons in the footer. Drag to reorder.'}
            </CardDescription>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingIcon(null);
              setFormData({ name: '', icon_url: '', link_url: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Dodaj ikonę' : 'Add Icon'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingIcon
                    ? (language === 'pl' ? 'Edytuj ikonę' : 'Edit Icon')
                    : (language === 'pl' ? 'Dodaj nową ikonę' : 'Add New Icon')}
                </DialogTitle>
                <DialogDescription>
                  {language === 'pl'
                    ? 'Wypełnij poniższe pola aby dodać lub edytować ikonę social media.'
                    : 'Fill in the fields below to add or edit a social media icon.'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>{language === 'pl' ? 'Nazwa' : 'Name'}</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Facebook, Instagram, etc."
                  />
                </div>

                <div>
                  <Label>{language === 'pl' ? 'URL Ikony (opcjonalne)' : 'Icon URL (optional)'}</Label>
                  <Input
                    value={formData.icon_url}
                    onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })}
                    placeholder="https://example.com/icon.png"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {language === 'pl' ? 'Pozostaw puste aby użyć domyślnej ikony' : 'Leave empty to use default icon'}
                  </p>
                </div>

                <div>
                  <Label>{language === 'pl' ? 'Link URL' : 'Link URL'}</Label>
                  <Input
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {language === 'pl' ? 'Anuluj' : 'Cancel'}
                </Button>
                <Button onClick={handleSave}>
                  {language === 'pl' ? 'Zapisz' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={icons.map((icon) => icon.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {icons.map((icon) => (
                <SortableItem
                  key={icon.id}
                  id={icon.id}
                  icon={icon}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {icons.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {language === 'pl' ? 'Brak ikon. Dodaj pierwszą!' : 'No icons yet. Add your first!'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialIconsManager;