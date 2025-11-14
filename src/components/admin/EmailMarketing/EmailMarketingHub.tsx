import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { TemplateEditor } from './TemplateEditor';
import { CustomerSegmentation } from './CustomerSegmentation';
import { CampaignManager } from './CampaignManager';
import { EmailAnalytics } from './EmailAnalytics';
import { AutomatedCampaigns } from './AutomatedCampaigns';
import EmailMarketingSettings from './EmailMarketingSettings';
import { useLanguage } from '@/contexts/LanguageContext';
import { Mail, Users, Send, BarChart3, Zap, Settings } from 'lucide-react';

export function EmailMarketingHub() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('templates');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('emailMarketing')}</h2>
        <p className="text-muted-foreground">{t('emailMarketingDesc')}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">{t('templates')}</span>
          </TabsTrigger>
          <TabsTrigger value="segments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('segments')}</span>
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t('campaigns')}</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('analytics')}</span>
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">{t('automation')}</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <TemplateEditor />
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <CustomerSegmentation />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <CampaignManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <EmailAnalytics />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <AutomatedCampaigns />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <EmailMarketingSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}