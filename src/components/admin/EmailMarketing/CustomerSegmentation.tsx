import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CustomerSegmentation() {
  const { language } = useLanguage();
  const [segments, setSegments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name_en: '',
    name_pl: '',
    description_en: '',
    description_pl: '',
    segment_type: 'custom',
    criteriaText: '{\n  "min_orders": 0,\n  "last_days": 90\n}'
  });

  useEffect(() => { loadSegments(); }, []);

  const loadSegments = async () => {
    const { data, error } = await supabase
      .from('customer_segments' as any)
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setSegments(data);
  };

  const handleSave = async () => {
    try {
      let criteria: any = {};
      try { criteria = JSON.parse(formData.criteriaText || '{}'); } catch {}
      const { error } = await supabase
        .from('customer_segments' as any)
        .insert([{
          name_en: formData.name_en,
          name_pl: formData.name_pl,
          description_en: formData.description_en,
          description_pl: formData.description_pl,
          segment_type: formData.segment_type,
          criteria
        }] as any);
      if (error) throw error;
      toast.success(language === 'pl' ? 'Segment utworzony' : 'Segment created');
      setIsEditing(false);
      setFormData({ name_en: '', name_pl: '', description_en: '', description_pl: '', segment_type: 'custom', criteriaText: '{\n  "min_orders": 0,\n  "last_days": 90\n}' });
      loadSegments();
    } catch (e:any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('customer_segments' as any).delete().eq('id', id);
    if (!error) {
      toast.success(language === 'pl' ? 'Segment usunięty' : 'Segment deleted');
      loadSegments();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{language === 'pl' ? 'Segmenty Klientów' : 'Customer Segments'}</h3>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {language === 'pl' ? 'Utwórz Segment' : 'Create Segment'}
        </Button>
      </div>

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>{language === 'pl' ? segment.name_pl : segment.name_en}</CardTitle>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(segment.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{language === 'pl' ? segment.description_pl : segment.description_en}</p>
              <p className="text-xs text-muted-foreground">{language === 'pl' ? 'Członkowie' : 'Members'}: {segment.member_count || 0}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'pl' ? 'Nowy Segment' : 'New Segment'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>English Name</Label>
                <Input value={formData.name_en} onChange={(e) => setFormData({ ...formData, name_en: e.target.value })} />
              </div>
              <div>
                <Label>Nazwa PL</Label>
                <Input value={formData.name_pl} onChange={(e) => setFormData({ ...formData, name_pl: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>EN Description</Label>
                <Input value={formData.description_en} onChange={(e) => setFormData({ ...formData, description_en: e.target.value })} />
              </div>
              <div>
                <Label>Opis PL</Label>
                <Input value={formData.description_pl} onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={formData.segment_type} onValueChange={(v) => setFormData({ ...formData, segment_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="purchase_based">Purchase-based</SelectItem>
                  <SelectItem value="engagement_based">Engagement-based</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Criteria (JSON)</Label>
              <Textarea rows={6} value={formData.criteriaText} onChange={(e) => setFormData({ ...formData, criteriaText: e.target.value })} />
              <p className="text-xs text-muted-foreground mt-1">e.g. {`{ "min_orders": 3, "last_days": 180 }`}</p>
            </div>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {language === 'pl' ? 'Zapisz' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
