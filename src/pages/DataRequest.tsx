import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Download } from 'lucide-react';

const DataRequest = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const pdfUrl = language === 'pl' 
    ? '/documents/wniosek-o-dane-pl.pdf' 
    : '/documents/data-request-en.pdf';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    requestType: '',
    details: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name,
          email: formData.email,
          subject: `GDPR Data Request: ${formData.requestType}`,
          message: `Request Type: ${formData.requestType}\n\nDetails:\n${formData.details}`,
          category: 'Data Request',
        },
      });

      if (error) throw error;

      toast({
        title: t('requestSent'),
        description: t('dataRequestSentDesc'),
      });

      setFormData({
        name: '',
        email: '',
        requestType: '',
        details: '',
      });
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: t('error'),
        description: t('errorSendingRequest'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('dataRequestForm')}</h1>
        
        <div className="mb-6 text-center">
          <Button asChild variant="outline">
            <a href={pdfUrl} download>
              <Download className="mr-2 h-4 w-4" />
              {t('downloadPDF')}
            </a>
          </Button>
        </div>
        
        <Card className="p-8 space-y-6">
          <section>
            <p className="mb-6">{t('dataRequestIntro')}</p>
          </section>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')} *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestType">{t('requestType')} *</Label>
              <Select
                value={formData.requestType}
                onValueChange={(value) => setFormData({ ...formData, requestType: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRequestType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="access">{t('rightAccess')}</SelectItem>
                  <SelectItem value="rectification">{t('rightRectification')}</SelectItem>
                  <SelectItem value="erasure">{t('rightErasure')}</SelectItem>
                  <SelectItem value="restriction">{t('rightRestrict')}</SelectItem>
                  <SelectItem value="portability">{t('rightPortability')}</SelectItem>
                  <SelectItem value="objection">{t('rightObject')}</SelectItem>
                  <SelectItem value="withdraw">{t('withdrawConsent')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">{t('additionalDetails')}</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                rows={6}
                placeholder={t('dataRequestDetailsPlaceholder')}
              />
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm">{t('dataRequestProcessingTime')}</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? t('sending') : t('submitRequest')}
            </Button>
          </form>

          <section className="pt-6 border-t">
            <h2 className="text-2xl font-semibold mb-4">{t('yourRights')}</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>{t('rightAccess')}:</strong> {t('rightAccessDesc')}</li>
              <li><strong>{t('rightRectification')}:</strong> {t('rightRectificationDesc')}</li>
              <li><strong>{t('rightErasure')}:</strong> {t('rightErasureDesc')}</li>
              <li><strong>{t('rightRestrict')}:</strong> {t('rightRestrictDesc')}</li>
              <li><strong>{t('rightPortability')}:</strong> {t('rightPortabilityDesc')}</li>
              <li><strong>{t('rightObject')}:</strong> {t('rightObjectDesc')}</li>
            </ul>
          </section>
        </Card>
      </div>
    </div>
  );
};

export default DataRequest;
