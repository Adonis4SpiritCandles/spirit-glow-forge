import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface Collection {
  id: string;
  name_en: string;
  name_pl: string;
  description_en: string;
  description_pl: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

const AdminCollections = () => {
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Collection>>({});

  useEffect(() => {
    // Mock data for now - replace with actual Supabase query
    setCollections([
      {
        id: "1",
        name_en: "Luxury Collection",
        name_pl: "Kolekcja Luksusowa",
        description_en: "Premium handcrafted soy candles with exquisite fragrances",
        description_pl: "Luksusowe ręcznie robione świece sojowe z wykwintnymi zapachami",
        image_url: "/placeholder.svg",
        display_order: 1,
        is_active: true,
      },
    ]);
  }, []);

  const handleEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setFormData(collection);
  };

  const handleSave = () => {
    // Save logic here - integrate with Supabase
    toast.success(language === 'pl' ? 'Kolekcja zapisana' : 'Collection saved');
    setEditingId(null);
    setFormData({});
  };

  const handleDelete = (id: string) => {
    // Delete logic here
    toast.success(language === 'pl' ? 'Kolekcja usunięta' : 'Collection deleted');
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

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
        <Button onClick={() => setEditingId('new')}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">
                  {language === 'pl' ? 'Nazwa (Angielski)' : 'Name (English)'}
                </Label>
                <Input
                  id="name_en"
                  value={formData.name_en || ''}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  placeholder="Luxury Collection"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_pl">
                  {language === 'pl' ? 'Nazwa (Polski)' : 'Name (Polish)'}
                </Label>
                <Input
                  id="name_pl"
                  value={formData.name_pl || ''}
                  onChange={(e) => setFormData({ ...formData, name_pl: e.target.value })}
                  placeholder="Kolekcja Luksusowa"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description_en">
                  {language === 'pl' ? 'Opis (Angielski)' : 'Description (English)'}
                </Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en || ''}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  placeholder="Premium handcrafted soy candles..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_pl">
                  {language === 'pl' ? 'Opis (Polski)' : 'Description (Polish)'}
                </Label>
                <Textarea
                  id="description_pl"
                  value={formData.description_pl || ''}
                  onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
                  placeholder="Luksusowe ręcznie robione świece..."
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">
                {language === 'pl' ? 'URL Obrazu' : 'Image URL'}
              </Label>
              <Input
                id="image_url"
                value={formData.image_url || ''}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
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
              <img
                src={collection.image_url}
                alt={language === 'en' ? collection.name_en : collection.name_pl}
                className="w-full h-full object-cover"
              />
              {collection.is_active && (
                <Badge className="absolute top-2 right-2 bg-green-500">
                  {language === 'pl' ? 'Aktywna' : 'Active'}
                </Badge>
              )}
            </div>
            <CardContent className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg">
                  {language === 'en' ? collection.name_en : collection.name_pl}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {language === 'en' ? collection.description_en : collection.description_pl}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(collection)}
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
            <Button onClick={() => setEditingId('new')}>
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
