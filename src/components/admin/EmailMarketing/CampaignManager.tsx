import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { Plus, Send, TestTube } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function CampaignManager() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    template_id: '',
    segment_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [campaignsRes, templatesRes, segmentsRes] = await Promise.all([
      supabase.from('email_campaigns' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('email_templates' as any).select('*'),
      supabase.from('customer_segments' as any).select('*')
    ]);

    if (campaignsRes.data) setCampaigns(campaignsRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
    if (segmentsRes.data) setSegments(segmentsRes.data);
  };

  const handleCreate = async () => {
    const { error } = await supabase
      .from('email_campaigns' as any)
      .insert([formData] as any);

    if (!error) {
      toast.success(t('campaignCreated'));
      setIsCreating(false);
      loadData();
    }
  };

  const handleSendTest = async (campaignId: string) => {
    const testEmail = prompt(t('enterTestEmail'));
    if (!testEmail) return;

    const { error } = await supabase.functions.invoke('send-campaign-email', {
      body: { campaign_id: campaignId, test_mode: true, test_email: testEmail }
    });

    if (!error) {
      toast.success(t('testEmailSent'));
    } else {
      toast.error(t('testEmailFailed'));
    }
  };

  const handleLaunch = async (campaignId: string) => {
    if (!confirm(t('confirmLaunchCampaign'))) return;

    const { error } = await supabase.functions.invoke('send-campaign-email', {
      body: { campaign_id: campaignId }
    });

    if (!error) {
      toast.success(t('campaignLaunched'));
      loadData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{t('emailCampaigns')}</h3>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createCampaign')}
        </Button>
      </div>

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <CardTitle>{campaign.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleSendTest(campaign.id)}>
                  <TestTube className="mr-2 h-4 w-4" />
                  {t('sendTest')}
                </Button>
                {campaign.status === 'draft' && (
                  <Button size="sm" onClick={() => handleLaunch(campaign.id)}>
                    <Send className="mr-2 h-4 w-4" />
                    {t('launch')}
                  </Button>
                )}
                <span className="ml-auto text-sm text-muted-foreground">{campaign.status}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('createCampaign')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('campaignName')}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('subject')}</Label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>{t('template')}</Label>
              <Select value={formData.template_id} onValueChange={(value) => setFormData({ ...formData, template_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t('segment')}</Label>
              <Select value={formData.segment_id} onValueChange={(value) => setFormData({ ...formData, segment_id: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {segments.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate}>{t('create')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}