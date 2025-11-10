import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CustomerSegmentation() {
  const { t } = useLanguage();
  const [segments, setSegments] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    filters: {}
  });

  useEffect(() => {
    loadSegments();
  }, []);

  const loadSegments = async () => {
    const { data } = await supabase
      .from('customer_segments' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setSegments(data);
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('customer_segments' as any)
      .insert([formData] as any);

    if (!error) {
      toast.success(t('segmentCreated'));
      setIsEditing(false);
      loadSegments();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('customerSegments')}</h3>
        <Button onClick={() => setIsEditing(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createSegment')}
        </Button>
      </div>

      <div className="grid gap-4">
        {segments.map((segment) => (
          <Card key={segment.id}>
            <CardHeader>
              <CardTitle>{segment.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{segment.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createSegment')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('name')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('description')}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}