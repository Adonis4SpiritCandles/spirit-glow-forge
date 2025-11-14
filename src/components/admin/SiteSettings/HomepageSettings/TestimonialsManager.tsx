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
import { Plus, Edit, Trash2, MessageSquare, Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  comment: string;
  location: string;
  product?: string;
  is_featured: boolean;
}

const TestimonialsManager = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sectionToggle, setSectionToggle] = useState<boolean>(true);

  useEffect(() => {
    loadTestimonials();
    loadSectionToggle();
  }, []);

  const loadSectionToggle = async () => {
    try {
      const { data } = await supabase
        .from('homepage_sections_toggle')
        .select('testimonials_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (data) {
        setSectionToggle(data.testimonials_section_active ?? true);
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
          testimonials_section_active: checked,
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

  const loadTestimonials = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error loading testimonials:', error);
      toast.error(language === 'pl' ? 'Nie udało się załadować opinii' : 'Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTestimonial = async () => {
    if (!editingTestimonial) return;

    try {
      if (editingTestimonial.id === 'new') {
        const { error } = await supabase.from('testimonials').insert({
          name: editingTestimonial.name,
          avatar: editingTestimonial.avatar,
          rating: editingTestimonial.rating,
          comment: editingTestimonial.comment,
          location: editingTestimonial.location,
          product: editingTestimonial.product,
          is_featured: editingTestimonial.is_featured,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .update({
            name: editingTestimonial.name,
            avatar: editingTestimonial.avatar,
            rating: editingTestimonial.rating,
            comment: editingTestimonial.comment,
            location: editingTestimonial.location,
            product: editingTestimonial.product,
            is_featured: editingTestimonial.is_featured,
          })
          .eq('id', editingTestimonial.id);
        if (error) throw error;
      }

      toast.success(language === 'pl' ? 'Opinia zapisana!' : 'Testimonial saved!');
      setIsDialogOpen(false);
      setEditingTestimonial(null);
      loadTestimonials();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error(language === 'pl' ? 'Nie udało się zapisać opinii' : 'Failed to save testimonial');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć tę opinię?' : 'Are you sure you want to delete this testimonial?')) return;

    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast.success(language === 'pl' ? 'Opinia usunięta!' : 'Testimonial deleted!');
      loadTestimonials();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error(language === 'pl' ? 'Nie udało się usunąć opinii' : 'Failed to delete testimonial');
    }
  };

  const handleToggleFeatured = async (id: string, isFeatured: boolean) => {
    try {
      const { error } = await supabase.from('testimonials').update({ is_featured: isFeatured }).eq('id', id);
      if (error) throw error;
      loadTestimonials();
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
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
              <MessageSquare className="w-5 h-5" />
              {language === 'pl' ? 'Zarządzanie Opiniami' : 'Testimonials Manager'}
            </CardTitle>
            <CardDescription>
              {language === 'pl' ? 'Dodaj, edytuj i usuń opinie klientów' : 'Add, edit, and delete customer testimonials'}
            </CardDescription>
          </div>
        </div>
        
        {/* Section Toggle */}
        <div className="flex items-center justify-between mt-4 p-4 bg-muted/30 rounded-lg border">
          <div className="space-y-0.5">
            <Label htmlFor="testimonials-section-active" className="text-base font-semibold">
              {language === 'pl' ? 'Aktywna Sekcja Opinii' : 'Testimonials Section Active'}
            </Label>
            <p className="text-sm text-muted-foreground">
              {language === 'pl'
                ? 'Wyświetl sekcję opinii klientów na stronie głównej'
                : 'Display testimonials section on the homepage'}
            </p>
          </div>
          <Switch
            id="testimonials-section-active"
            checked={sectionToggle}
            onCheckedChange={handleToggleSection}
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTestimonial({ id: 'new', name: '', avatar: '', rating: 5, comment: '', location: '', product: '', is_featured: false })}>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'pl' ? 'Dodaj Opinię' : 'Add Testimonial'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTestimonial?.id === 'new' ? (language === 'pl' ? 'Nowa Opinia' : 'New Testimonial') : (language === 'pl' ? 'Edytuj Opinię' : 'Edit Testimonial')}</DialogTitle>
            </DialogHeader>
            {editingTestimonial && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Imię' : 'Name'}</Label>
                    <Input value={editingTestimonial.name} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Lokalizacja' : 'Location'}</Label>
                    <Input value={editingTestimonial.location} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, location: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'pl' ? 'URL Avatara (opcjonalnie)' : 'Avatar URL (optional)'}</Label>
                  <Input value={editingTestimonial.avatar || ''} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, avatar: e.target.value })} placeholder="https://..." />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'pl' ? 'Produkt (opcjonalnie)' : 'Product (optional)'}</Label>
                  <Input value={editingTestimonial.product || ''} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, product: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>{language === 'pl' ? 'Ocena' : 'Rating'}</Label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-8 h-8 cursor-pointer ${star <= editingTestimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                        onClick={() => setEditingTestimonial({ ...editingTestimonial, rating: star })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{language === 'pl' ? 'Komentarz' : 'Comment'}</Label>
                  <Textarea value={editingTestimonial.comment} onChange={(e) => setEditingTestimonial({ ...editingTestimonial, comment: e.target.value })} rows={4} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">{language === 'pl' ? 'Polecane na stronie głównej' : 'Featured on Homepage'}</Label>
                  <Switch id="featured" checked={editingTestimonial.is_featured} onCheckedChange={(checked) => setEditingTestimonial({ ...editingTestimonial, is_featured: checked })} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{language === 'pl' ? 'Anuluj' : 'Cancel'}</Button>
                  <Button onClick={handleSaveTestimonial}>{language === 'pl' ? 'Zapisz' : 'Save'}</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="flex items-start gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
            {testimonial.avatar ? (
              <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold">{testimonial.name.charAt(0)}</span>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">"{testimonial.comment}"</p>
              {testimonial.product && (
                <p className="text-xs text-primary/70">
                  {language === 'pl' ? 'Produkt' : 'Product'}: {testimonial.product}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={testimonial.is_featured} onCheckedChange={(checked) => handleToggleFeatured(testimonial.id, checked)} />
              <Button variant="ghost" size="icon" onClick={() => { setEditingTestimonial(testimonial); setIsDialogOpen(true); }}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteTestimonial(testimonial.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TestimonialsManager;
