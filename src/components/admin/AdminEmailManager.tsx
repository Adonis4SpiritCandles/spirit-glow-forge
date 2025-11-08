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
      // Hardcoded templates since table doesn't exist yet
      const hardcodedTemplates = [
        {
          id: '1',
          template_key: 'order_confirmation',
          name_en: 'Order Confirmation',
          name_pl: 'Potwierdzenie Zamówienia',
          description_en: 'Sent when a customer places an order',
          description_pl: 'Wysyłane gdy klient składa zamówienie',
          subject_en: 'Order Confirmation - Spirit Candles',
          subject_pl: 'Potwierdzenie Zamówienia - Spirit Candles',
          edge_function_name: 'send-order-confirmation',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '2',
          template_key: 'order_accepted',
          name_en: 'Order Accepted',
          name_pl: 'Zamówienie Zaakceptowane',
          description_en: 'Sent when order is accepted by admin',
          description_pl: 'Wysyłane gdy zamówienie zostanie zaakceptowane',
          subject_en: 'Your Order Has Been Accepted',
          subject_pl: 'Twoje Zamówienie Zostało Zaakceptowane',
          edge_function_name: 'send-order-accepted',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '3',
          template_key: 'tracking_available',
          name_en: 'Tracking Available',
          name_pl: 'Śledzenie Dostępne',
          description_en: 'Sent when tracking number is available',
          description_pl: 'Wysyłane gdy numer śledzenia jest dostępny',
          subject_en: 'Your Order is On Its Way!',
          subject_pl: 'Twoje Zamówienie Jest W Drodze!',
          edge_function_name: 'send-tracking-available',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '4',
          template_key: 'delivery_confirmation',
          name_en: 'Delivery Confirmation',
          name_pl: 'Potwierdzenie Dostawy',
          description_en: 'Sent when order is delivered',
          description_pl: 'Wysyłane gdy zamówienie zostanie dostarczone',
          subject_en: 'Your Order Has Been Delivered',
          subject_pl: 'Twoje Zamówienie Zostało Dostarczone',
          edge_function_name: 'send-delivery-confirmation',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '5',
          template_key: 'custom_request',
          name_en: 'Custom Candle Request',
          name_pl: 'Prośba o Niestandardową Świecę',
          description_en: 'Sent when customer submits custom candle request',
          description_pl: 'Wysyłane gdy klient składa prośbę o niestandardową świecę',
          subject_en: 'Custom Candle Request Received',
          subject_pl: 'Otrzymano Prośbę o Niestandardową Świecę',
          edge_function_name: 'send-custom-request',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '6',
          template_key: 'contact_form',
          name_en: 'Contact Form Submission',
          name_pl: 'Przesłanie Formularza Kontaktowego',
          description_en: 'Sent when customer submits contact form',
          description_pl: 'Wysyłane gdy klient wysyła formularz kontaktowy',
          subject_en: 'We Received Your Message',
          subject_pl: 'Otrzymaliśmy Twoją Wiadomość',
          edge_function_name: 'contact-form',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '7',
          template_key: 'newsletter_welcome',
          name_en: 'Newsletter Welcome',
          name_pl: 'Powitanie Newsletter',
          description_en: 'Sent when user subscribes to newsletter',
          description_pl: 'Wysyłane gdy użytkownik zapisuje się do newslettera',
          subject_en: 'Welcome to Spirit Candles Newsletter',
          subject_pl: 'Witamy w Newsletterze Spirit Candles',
          edge_function_name: 'send-welcome-newsletter',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '8',
          template_key: 'registration_welcome',
          name_en: 'Registration Welcome',
          name_pl: 'Powitanie Po Rejestracji',
          description_en: 'Sent when new user registers account',
          description_pl: 'Wysyłane gdy nowy użytkownik rejestruje konto',
          subject_en: 'Welcome to Spirit Candles!',
          subject_pl: 'Witamy w Spirit Candles!',
          edge_function_name: 'send-registration-welcome',
          is_active: true,
          last_sent_at: null,
        },
        {
          id: '9',
          template_key: 'referral_emails',
          name_en: 'Referral Program Emails',
          name_pl: 'E-maile Programu Poleceń',
          description_en: 'Sent for referral program notifications',
          description_pl: 'Wysyłane dla powiadomień programu poleceń',
          subject_en: 'Referral Reward Unlocked!',
          subject_pl: 'Nagroda za Polecenie Odblokowana!',
          edge_function_name: 'send-referral-emails',
          is_active: true,
          last_sent_at: null,
        },
      ];

      setTemplates(hardcodedTemplates);
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
    // Since we're using hardcoded data, just update local state
    setTemplates(prev => 
      prev.map(t => t.id === id ? { ...t, is_active: !currentState } : t)
    );
    
    toast({
      title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
      description: language === 'pl' 
        ? 'Status szablonu email zmieniony (tylko w sesji)' 
        : 'Email template status changed (session only)',
    });
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
