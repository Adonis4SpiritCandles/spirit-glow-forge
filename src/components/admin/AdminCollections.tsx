import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2, Save, X, Upload, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Collection {
  id: string;
  name_en: string;
  name_pl: string;
  description_en: string;
  description_pl: string;
  image_url: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
  featured: boolean;
  icon_name: string | null;
  gradient_classes: string | null;
}

const AdminCollections = () => {
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Collection>>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCollections(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('collection-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('collection-images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      toast.success(language === 'pl' ? 'Obraz przesłany' : 'Image uploaded');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!formData.name_en || !formData.name_pl) {
        toast.error(language === 'pl' ? 'Wypełnij wymagane pola' : 'Fill required fields');
        return;
      }

      // Auto-generate slug if new
      if (editingId === 'new' && !formData.slug) {
        const slug = formData.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
        formData.slug = slug;
      }

      if (editingId === 'new') {
        const { error } = await supabase
          .from('collections')
          .insert([formData as any]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('collections')
          .update(formData as any)
          .eq('id', editingId);
        if (error) throw error;
      }

      toast.success(language === 'pl' ? 'Kolekcja zapisana' : 'Collection saved');
      setEditingId(null);
      setFormData({});
      loadCollections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Usunąć kolekcję?' : 'Delete collection?')) return;

    try {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success(language === 'pl' ? 'Kolekcja usunięta' : 'Collection deleted');
      loadCollections();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  if (loading) {
    return <div className="text-center py-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'pl' ? 'Zarządzaj Kolekcjami' : 'Manage Collections'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'pl' 
              ? 'Twórz i edytuj kolekcje produktów' 
              : 'Create and edit product collections'}
          </p>
        </div>
        <Button onClick={() => {
          setEditingId('new');
          setFormData({ is_active: true, featured: false, display_order: collections.length });
        }}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'pl' ? 'Nowa Kolekcja' : 'New Collection'}
        </Button>
      </div>

      {editingId && (
        <Card className="border-primary/50">
          <CardHeader>
            <CardTitle>
              {editingId === 'new' 
                ? (language === 'pl' ? 'Nowa Kolekcja' : 'New Collection')
                : (language === 'pl' ? 'Edytuj Kolekcję' : 'Edit Collection')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Obraz Kolekcji' : 'Collection Image'}</Label>
              {formData.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden mb-2">
                  <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="flex-1"
                />
                {uploading && <span className="text-sm text-muted-foreground">{language === 'pl' ? 'Przesyłanie...' : 'Uploading...'}</span>}
              </div>
              <div className="pt-2 border-t mt-2">
                <Label htmlFor="collection-image-url">
                  {language === 'pl' ? 'Lub użyj URL zewnętrznego obrazu' : 'Or use external image URL'}
                </Label>
                <Input
                  id="collection-image-url"
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => {
                    // Only set if it's a valid URL (not from upload)
                    if (e.target.value.startsWith('http://') || e.target.value.startsWith('https://') || !e.target.value) {
                      setFormData({ ...formData, image_url: e.target.value });
                    }
                  }}
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

            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">{language === 'pl' ? 'Nazwa (Angielski)*' : 'Name (English)*'}</Label>
                <Input
                  id="name_en"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Luxury Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_pl">{language === 'pl' ? 'Nazwa (Polski)*' : 'Name (Polish)*'}</Label>
                <Input
                  id="name_pl"
                  value={formData.name_pl || ''}
                  onChange={(e) => setFormData({ ...formData, name_pl: e.target.value })}
                  placeholder="Kolekcja Luksusowa"
                />
              </div>
            </div>

            {/* Descriptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description_en">{language === 'pl' ? 'Opis (Angielski)' : 'Description (English)'}</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Sophisticated fragrances..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_pl">{language === 'pl' ? 'Opis (Polski)' : 'Description (Polish)'}</Label>
                <Textarea
                  id="description_pl"
                  value={formData.description_pl || ''}
                  onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
                  placeholder="Wyrafinowane zapachy..."
                  rows={3}
                />
              </div>
            </div>

            {/* Slug, Icon, Gradient */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="slug">{language === 'pl' ? 'Slug (URL)' : 'Slug (URL)'}</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="luxury-collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon_name">{language === 'pl' ? 'Ikona' : 'Icon'}</Label>
                <Select
                  value={formData.icon_name || ''}
                  onValueChange={(value) => setFormData({ ...formData, icon_name: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crown">Crown</SelectItem>
                    <SelectItem value="Heart">Heart</SelectItem>
                    <SelectItem value="Leaf">Leaf</SelectItem>
                    <SelectItem value="Sparkles">Sparkles</SelectItem>
                    <SelectItem value="Star">Star</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display_order">{language === 'pl' ? 'Kolejność' : 'Display Order'}</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order || 0}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {/* Gradient Classes */}
            <div className="space-y-2">
              <Label htmlFor="gradient_classes">{language === 'pl' ? 'Klasy Gradientu' : 'Gradient Classes'}</Label>
              <Input
                id="gradient_classes"
                value={formData.gradient_classes || ''}
                onChange={(e) => setFormData({ ...formData, gradient_classes: e.target.value })}
                placeholder="from-amber-500/20 via-yellow-500/20 to-orange-500/20"
              />
            </div>

            {/* Toggles */}
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">{language === 'pl' ? 'Aktywna' : 'Active'}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                />
                <Label htmlFor="featured">{language === 'pl' ? 'Wyróżniona' : 'Featured'}</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {language === 'pl' ? 'Zapisz' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <Card key={collection.id} className="overflow-hidden">
            <div className="aspect-video bg-gradient-mystical relative">
              {collection.image_url ? (
                <img
                  src={collection.image_url}
                  alt={language === 'en' ? collection.name_en : collection.name_pl}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1">
                {collection.is_active && (
                  <Badge className="bg-green-500">
                    {language === 'pl' ? 'Aktywna' : 'Active'}
                  </Badge>
                )}
                {collection.featured && (
                  <Badge className="bg-amber-500">
                    {language === 'pl' ? 'Wyróżniona' : 'Featured'}
                  </Badge>
                )}
              </div>
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {language === 'en' ? collection.name_en : collection.name_pl}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Slug: {collection.slug}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {language === 'en' ? collection.description_en : collection.description_pl}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingId(collection.id);
                    setFormData(collection);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  {language === 'pl' ? 'Edytuj' : 'Edit'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(collection.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {collections.length === 0 && !editingId && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-4">
              {language === 'pl' 
                ? 'Brak kolekcji. Stwórz pierwszą!' 
                : 'No collections yet. Create your first one!'}
            </p>
            <Button onClick={() => {
              setEditingId('new');
              setFormData({ is_active: true, featured: false, display_order: 0 });
            }}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'pl' ? 'Dodaj Kolekcję' : 'Add Collection'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminCollections;
