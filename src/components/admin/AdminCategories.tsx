import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: string;
  slug: string;
  name_en: string;
  name_pl: string;
  description_en: string | null;
  description_pl: string | null;
  display_order: number;
  is_active: boolean;
}

export default function AdminCategories() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_pl: '',
    description_en: '',
    description_pl: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się załadować kategorii' : 'Failed to load categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const slug = generateSlug(formData.name_en);

      if (editingCategory) {
        // Update existing
        const { error } = await supabase
          .from('categories')
          .update({
            name_en: formData.name_en,
            name_pl: formData.name_pl,
            description_en: formData.description_en || null,
            description_pl: formData.description_pl || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
            slug
          })
          .eq('id', editingCategory.id);

        if (error) throw error;

        toast({
          title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
          description: language === 'pl' ? 'Kategoria została zaktualizowana' : 'Category updated successfully'
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('categories')
          .insert({
            name_en: formData.name_en,
            name_pl: formData.name_pl,
            description_en: formData.description_en || null,
            description_pl: formData.description_pl || null,
            display_order: formData.display_order,
            is_active: formData.is_active,
            slug
          });

        if (error) throw error;

        toast({
          title: language === 'pl' ? 'Utworzono' : 'Created',
          description: language === 'pl' ? 'Nowa kategoria została utworzona' : 'New category created successfully'
        });
      }

      loadCategories();
      handleCloseDialog();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message || (language === 'pl' ? 'Nie udało się zapisać kategorii' : 'Failed to save category'),
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name_en: category.name_en,
      name_pl: category.name_pl,
      description_en: category.description_en || '',
      description_pl: category.description_pl || '',
      display_order: category.display_order,
      is_active: category.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno usunąć tę kategorię?' : 'Are you sure you want to delete this category?')) {
      return;
    }

    try {
      // Check if any products use this category
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', categories.find(c => c.id === id)?.slug);

      if (count && count > 0) {
        toast({
          title: language === 'pl' ? 'Nie można usunąć' : 'Cannot delete',
          description: language === 'pl' 
            ? `Ta kategoria jest używana przez ${count} produktów` 
            : `This category is used by ${count} products`,
          variant: 'destructive'
        });
        return;
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Usunięto' : 'Deleted',
        description: language === 'pl' ? 'Kategoria została usunięta' : 'Category deleted successfully'
      });

      loadCategories();
    } catch (error: any) {
      console.error('Error deleting category:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name_en: '',
      name_pl: '',
      description_en: '',
      description_pl: '',
      display_order: 0,
      is_active: true
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {language === 'pl' ? 'Zarządzanie kategoriami' : 'Category Management'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'pl' ? 'Twórz i edytuj kategorie produktów' : 'Create and edit product categories'}
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {language === 'pl' ? 'Nowa kategoria' : 'New Category'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Kategorie' : 'Categories'}</CardTitle>
          <CardDescription>
            {language === 'pl' ? 'Zarządzaj kategoriami produktów' : 'Manage your product categories'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'pl' ? 'Nazwa EN' : 'Name EN'}</TableHead>
                <TableHead>{language === 'pl' ? 'Nazwa PL' : 'Name PL'}</TableHead>
                <TableHead>{language === 'pl' ? 'Slug' : 'Slug'}</TableHead>
                <TableHead>{language === 'pl' ? 'Kolejność' : 'Order'}</TableHead>
                <TableHead>{language === 'pl' ? 'Status' : 'Status'}</TableHead>
                <TableHead className="text-right">{language === 'pl' ? 'Akcje' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name_en}</TableCell>
                  <TableCell>{category.name_pl}</TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    {category.is_active ? (
                      <span className="text-green-600">{language === 'pl' ? 'Aktywna' : 'Active'}</span>
                    ) : (
                      <span className="text-muted-foreground">{language === 'pl' ? 'Nieaktywna' : 'Inactive'}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingCategory 
                ? (language === 'pl' ? 'Edytuj kategorię' : 'Edit Category')
                : (language === 'pl' ? 'Nowa kategoria' : 'New Category')
              }
            </DialogTitle>
            <DialogDescription>
              {language === 'pl' 
                ? 'Wypełnij informacje o kategorii w obu językach'
                : 'Fill in the category information in both languages'
              }
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name_en">{language === 'pl' ? 'Nazwa (EN)' : 'Name (EN)'} *</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_pl">{language === 'pl' ? 'Nazwa (PL)' : 'Name (PL)'} *</Label>
                <Input
                  id="name_pl"
                  value={formData.name_pl}
                  onChange={(e) => setFormData({ ...formData, name_pl: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="description_en">{language === 'pl' ? 'Opis (EN)' : 'Description (EN)'}</Label>
                <Textarea
                  id="description_en"
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description_pl">{language === 'pl' ? 'Opis (PL)' : 'Description (PL)'}</Label>
                <Textarea
                  id="description_pl"
                  value={formData.description_pl}
                  onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display_order">{language === 'pl' ? 'Kolejność wyświetlania' : 'Display Order'}</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="is_active">{language === 'pl' ? 'Status' : 'Status'}</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <span className="text-sm">
                    {formData.is_active 
                      ? (language === 'pl' ? 'Aktywna' : 'Active')
                      : (language === 'pl' ? 'Nieaktywna' : 'Inactive')
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
              <Button type="submit">
                <Save className="h-4 w-4 mr-2" />
                {language === 'pl' ? 'Zapisz' : 'Save'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
