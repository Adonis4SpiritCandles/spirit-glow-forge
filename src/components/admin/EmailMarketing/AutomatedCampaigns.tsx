import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Zap } from 'lucide-react';

export function AutomatedCampaigns() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t('automatedCampaigns')}</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('automationComingSoon')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('automationDescription')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}