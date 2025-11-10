import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Save, Eye, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function TemplateEditor() {
  const { t } = useLanguage();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    html_content: ''
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTemplates(data);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.subject || !formData.html_content) {
      toast.error(t('fillAllFields'));
      return;
    }

    if (selectedTemplate) {
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTemplate.id);

      if (error) {
        toast.error(t('updateFailed'));
        return;
      }
      toast.success(t('templateUpdated'));
    } else {
      const { error } = await supabase
        .from('email_templates' as any)
        .insert([formData] as any);

      if (error) {
        toast.error(t('createFailed'));
        return;
      }
      toast.success(t('templateCreated'));
    }

    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({ name: '', subject: '', html_content: '' });
    loadTemplates();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return;

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (!error) {
      toast.success(t('templateDeleted'));
      loadTemplates();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('emailTemplates')}</h3>
        <Button onClick={() => {
          setIsEditing(true);
          setSelectedTemplate(null);
          setFormData({ name: '', subject: '', html_content: '' });
        }}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createTemplate')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
              <CardDescription>{template.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedTemplate(template);
                  setFormData(template);
                  setIsEditing(true);
                }}>
                  {t('edit')}
                </Button>
                <Button size="sm" variant="outline" onClick={() => {
                  setSelectedTemplate(template);
                  setPreview(true);
                }}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate ? t('editTemplate') : t('createTemplate')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('templateName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('enterTemplateName')}
              />
            </div>
            <div>
              <Label>{t('subject')}</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder={t('enterSubject')}
              />
            </div>
            <div>
              <Label>{t('htmlContent')}</Label>
              <Textarea
                value={formData.html_content}
                onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
                placeholder="<html>...</html>"
                rows={15}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {t('save')}
              </Button>
              <Button variant="outline" onClick={() => setPreview(true)}>
                <Eye className="mr-2 h-4 w-4" />
                {t('preview')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('preview')}</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: selectedTemplate?.html_content || formData.html_content }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}