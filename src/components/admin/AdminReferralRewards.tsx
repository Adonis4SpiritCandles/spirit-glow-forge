import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Award, Users, Settings } from 'lucide-react';

export default function AdminReferralRewards() {
  const { t, language } = useLanguage();
  const [referralRewards, setReferralRewards] = useState<any[]>([]);
  const [badgeRewards, setBadgeRewards] = useState<any[]>([]);
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    points_per_referral: 200,
    referee_welcome_points: 100,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [refRewards, badRewards] = await Promise.all([
        supabase.from('referral_rewards').select('*').order('referrals_count'),
        supabase.from('badge_rewards').select('*').order('badge_id'),
      ]);

      if (refRewards.data) setReferralRewards(refRewards.data);
      if (badRewards.data) setBadgeRewards(badRewards.data);
    } catch (error: any) {
      console.error('Error loading data:', error);
    }
  };

  const saveReferralSettings = async () => {
    setLoading(true);
    try {
      // You can store these in a settings table or use existing structure
      toast({
        title: language === 'pl' ? 'Zapisano' : 'Saved',
        description: language === 'pl' ? 'Ustawienia zostały zaktualizowane' : 'Settings have been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleReferralReward = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('referral_rewards')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      toast({
        title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
        description: language === 'pl' ? 'Status nagrody zmieniony' : 'Reward status changed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleBadgeReward = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('badge_rewards')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      await loadData();
      toast({
        title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
        description: language === 'pl' ? 'Status nagrody zmieniony' : 'Reward status changed',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {language === 'pl' ? 'Polecenia i Nagrody' : 'Referrals & Rewards'}
        </h2>
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Zarządzaj systemem poleceń i nagrodami za odznaki'
            : 'Manage referral system and badge rewards'}
        </p>
      </div>

      <Tabs defaultValue="referrals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referrals" className="gap-2">
            <Users className="h-4 w-4" />
            {language === 'pl' ? 'Polecenia' : 'Referrals'}
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Award className="h-4 w-4" />
            {language === 'pl' ? 'Nagrody za Odznaki' : 'Badge Rewards'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {language === 'pl' ? 'Ustawienia' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        {/* Referral Rewards */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Nagrody za Polecenia' : 'Referral Rewards'}</CardTitle>
              <CardDescription>
                {language === 'pl' 
                  ? 'Nagrody przyznawane za polecanie znajomych'
                  : 'Rewards given for referring friends'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {referralRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="h-5 w-5 text-primary" />
                      <span className="font-semibold">
                        {reward.referrals_count} {language === 'pl' ? 'Polecenia' : 'Referrals'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'pl' ? reward.description_pl : reward.description_en}
                    </p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-secondary rounded">{reward.reward_type}</span>
                      <span className="px-2 py-1 bg-secondary rounded">{reward.reward_value}</span>
                    </div>
                  </div>
                  <Switch
                    checked={reward.is_active}
                    onCheckedChange={() => toggleReferralReward(reward.id, reward.is_active)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badge Rewards */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Nagrody za Odznaki' : 'Badge Rewards'}</CardTitle>
              <CardDescription>
                {language === 'pl' 
                  ? 'Nagrody przyznawane za zdobycie odznak'
                  : 'Rewards given for earning badges'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {badgeRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-primary" />
                      <span className="font-semibold">{reward.badge_id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'pl' ? reward.description_pl : reward.description_en}
                    </p>
                    <div className="mt-2 flex gap-2 text-xs">
                      <span className="px-2 py-1 bg-secondary rounded">{reward.reward_type}</span>
                      <span className="px-2 py-1 bg-secondary rounded">{reward.reward_value}</span>
                    </div>
                  </div>
                  <Switch
                    checked={reward.is_active}
                    onCheckedChange={() => toggleBadgeReward(reward.id, reward.is_active)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'pl' ? 'Ustawienia Poleceń' : 'Referral Settings'}</CardTitle>
              <CardDescription>
                {language === 'pl' 
                  ? 'Konfiguruj system poleceń'
                  : 'Configure referral system'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{language === 'pl' ? 'System Poleceń Włączony' : 'Referral System Enabled'}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'pl' 
                      ? 'Włącz/wyłącz cały system poleceń'
                      : 'Enable/disable entire referral system'}
                  </p>
                </div>
                <Switch
                  checked={referralSettings.enabled}
                  onCheckedChange={(checked) => 
                    setReferralSettings({ ...referralSettings, enabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'SpiritPoints za Polecenie' : 'SpiritPoints per Referral'}</Label>
                <Input
                  type="number"
                  value={referralSettings.points_per_referral}
                  onChange={(e) => 
                    setReferralSettings({ 
                      ...referralSettings, 
                      points_per_referral: parseInt(e.target.value) 
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {language === 'pl' 
                    ? 'SpiritPoints przyznawane polecającemu'
                    : 'SpiritPoints awarded to referrer'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Powitalne SpiritPoints' : 'Welcome SpiritPoints'}</Label>
                <Input
                  type="number"
                  value={referralSettings.referee_welcome_points}
                  onChange={(e) => 
                    setReferralSettings({ 
                      ...referralSettings, 
                      referee_welcome_points: parseInt(e.target.value) 
                    })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  {language === 'pl' 
                    ? 'SpiritPoints przyznawane nowemu użytkownikowi'
                    : 'SpiritPoints awarded to new user'}
                </p>
              </div>

              <Button onClick={saveReferralSettings} disabled={loading}>
                {loading 
                  ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') 
                  : (language === 'pl' ? 'Zapisz Ustawienia' : 'Save Settings')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
