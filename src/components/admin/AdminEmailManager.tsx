import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Mail, Check, X, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminEmailManager() {
  const { t, language } = useLanguage();
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_key');

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleTemplate = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      await loadTemplates();
      toast({
        title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
        description: language === 'pl' 
          ? 'Status szablonu email zmieniony' 
          : 'Email template status changed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEdgeFunction = (functionName: string) => {
    const projectId = 'fhtuqmdlgzmpsbflxhra';
    window.open(
      `https://supabase.com/dashboard/project/${projectId}/functions/${functionName}/details`,
      '_blank'
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold">
          {language === 'pl' ? 'Zarządzanie Email' : 'Email Management'}
        </h3>
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Zarządzaj szablonami email i monitoruj wysyłanie'
            : 'Manage email templates and monitor delivery'}
        </p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    {language === 'pl' ? template.name_pl : template.name_en}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {language === 'pl' ? template.description_pl : template.description_en}
                  </CardDescription>
                </div>
                <Switch
                  checked={template.is_active}
                  onCheckedChange={() => toggleTemplate(template.id, template.is_active)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subject Lines */}
              <div>
                <p className="text-sm font-medium mb-2">
                  {language === 'pl' ? 'Temat' : 'Subject'}:
                </p>
                <div className="space-y-1 text-sm">
                  <p><strong>EN:</strong> {template.subject_en}</p>
                  <p><strong>PL:</strong> {template.subject_pl}</p>
                </div>
              </div>

              {/* Edge Function */}
              <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                <div>
                  <p className="text-sm font-medium">Edge Function</p>
                  <p className="text-xs text-muted-foreground">{template.edge_function_name}</p>
                </div>
                <button
                  onClick={() => openEdgeFunction(template.edge_function_name)}
                  className="text-primary hover:underline text-sm flex items-center gap-1"
                >
                  {language === 'pl' ? 'Otwórz' : 'Open'}
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>

              {/* Last Sent */}
              {template.last_sent_at && (
                <div className="text-sm text-muted-foreground">
                  {language === 'pl' ? 'Ostatnio wysłano' : 'Last sent'}: {' '}
                  {format(new Date(template.last_sent_at), 'PPp')}
                </div>
              )}

              {/* Status Badge */}
              <div>
                <Badge variant={template.is_active ? 'default' : 'secondary'}>
                  {template.is_active 
                    ? (language === 'pl' ? 'Aktywny' : 'Active')
                    : (language === 'pl' ? 'Nieaktywny' : 'Inactive')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
