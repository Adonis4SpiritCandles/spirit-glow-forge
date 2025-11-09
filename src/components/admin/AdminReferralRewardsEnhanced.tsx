import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Award, Users, Settings, Plus, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface ReferralReward {
  id: string;
  referrals_count: number;
  reward_type: string;
  reward_value: string;
  description_en: string;
  description_pl: string;
  is_active: boolean;
}

interface BadgeReward {
  id: string;
  badge_id: string;
  reward_type: string;
  reward_value: string;
  description_en: string;
  description_pl: string;
  is_active: boolean;
}

export default function AdminReferralRewardsEnhanced() {
  const { language } = useLanguage();
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>([]);
  const [badgeRewards, setBadgeRewards] = useState<BadgeReward[]>([]);
  const [referralSettings, setReferralSettings] = useState({
    enabled: true,
    points_per_referral: 200,
    referee_welcome_points: 100,
  });
  const [loading, setLoading] = useState(false);
  
  // Edit/Create modals
  const [editingReferral, setEditingReferral] = useState<ReferralReward | null>(null);
  const [editingBadge, setEditingBadge] = useState<BadgeReward | null>(null);
  const [isReferralDialogOpen, setIsReferralDialogOpen] = useState(false);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'referral' | 'badge', id: string } | null>(null);

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

  const handleSaveReferralReward = async (reward: Partial<ReferralReward>) => {
    setLoading(true);
    try {
      if (editingReferral?.id) {
        // Update existing
        const { error } = await supabase
          .from('referral_rewards')
          .update(reward as any)
          .eq('id', editingReferral.id);
        if (error) throw error;
        toast({
          title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
          description: language === 'pl' ? 'Nagroda została zaktualizowana' : 'Reward has been updated',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('referral_rewards')
          .insert([reward as any]);
        if (error) throw error;
        toast({
          title: language === 'pl' ? 'Utworzono' : 'Created',
          description: language === 'pl' ? 'Nowa nagroda została utworzona' : 'New reward has been created',
        });
      }
      await loadData();
      setIsReferralDialogOpen(false);
      setEditingReferral(null);
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

  const handleSaveBadgeReward = async (reward: Partial<BadgeReward>) => {
    setLoading(true);
    try {
      if (editingBadge?.id) {
        // Update existing
        const { error } = await supabase
          .from('badge_rewards')
          .update(reward as any)
          .eq('id', editingBadge.id);
        if (error) throw error;
        toast({
          title: language === 'pl' ? 'Zaktualizowano' : 'Updated',
          description: language === 'pl' ? 'Nagroda została zaktualizowana' : 'Reward has been updated',
        });
      } else {
        // Create new
        const { error } = await supabase
          .from('badge_rewards')
          .insert([reward as any]);
        if (error) throw error;
        toast({
          title: language === 'pl' ? 'Utworzono' : 'Created',
          description: language === 'pl' ? 'Nowa nagroda została utworzona' : 'New reward has been created',
        });
      }
      await loadData();
      setIsBadgeDialogOpen(false);
      setEditingBadge(null);
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

  const handleDeleteReward = async () => {
    if (!deleteConfirm) return;
    
    setLoading(true);
    try {
      const table = deleteConfirm.type === 'referral' ? 'referral_rewards' : 'badge_rewards';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', deleteConfirm.id);

      if (error) throw error;

      await loadData();
      toast({
        title: language === 'pl' ? 'Usunięto' : 'Deleted',
        description: language === 'pl' ? 'Nagroda została usunięta' : 'Reward has been deleted',
      });
      setDeleteConfirm(null);
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
            {language === 'pl' ? 'Odznaki' : 'Badges'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            {language === 'pl' ? 'Ustawienia' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        {/* Referral Rewards */}
        <TabsContent value="referrals" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'pl' ? 'Nagrody za Polecenia' : 'Referral Rewards'}</CardTitle>
                <CardDescription>
                  {language === 'pl' 
                    ? 'Nagrody przyznawane za polecanie znajomych'
                    : 'Rewards given for referring friends'}
                </CardDescription>
              </div>
              <Dialog open={isReferralDialogOpen} onOpenChange={setIsReferralDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingReferral(null)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {language === 'pl' ? 'Dodaj Nagrodę' : 'Add Reward'}
                  </Button>
                </DialogTrigger>
                <ReferralRewardDialog
                  reward={editingReferral}
                  onSave={handleSaveReferralReward}
                  loading={loading}
                  language={language}
                />
              </Dialog>
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingReferral(reward);
                        setIsReferralDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ type: 'referral', id: reward.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={reward.is_active}
                      onCheckedChange={() => toggleReferralReward(reward.id, reward.is_active)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badge Rewards */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{language === 'pl' ? 'Nagrody za Odznaki' : 'Badge Rewards'}</CardTitle>
                <CardDescription>
                  {language === 'pl' 
                    ? 'Nagrody przyznawane za zdobycie odznak'
                    : 'Rewards given for earning badges'}
                </CardDescription>
              </div>
              <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingBadge(null)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    {language === 'pl' ? 'Dodaj Nagrodę' : 'Add Reward'}
                  </Button>
                </DialogTrigger>
                <BadgeRewardDialog
                  reward={editingBadge}
                  onSave={handleSaveBadgeReward}
                  loading={loading}
                  language={language}
                />
              </Dialog>
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
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingBadge(reward);
                        setIsBadgeDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm({ type: 'badge', id: reward.id })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={reward.is_active}
                      onCheckedChange={() => toggleBadgeReward(reward.id, reward.is_active)}
                    />
                  </div>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'pl' ? 'Czy na pewno?' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'pl'
                ? 'Ta akcja nie może być cofnięta. Nagroda zostanie trwale usunięta.'
                : 'This action cannot be undone. The reward will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{language === 'pl' ? 'Anuluj' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReward}>
              {language === 'pl' ? 'Usuń' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Dialog components
function ReferralRewardDialog({ reward, onSave, loading, language }: any) {
  const [formData, setFormData] = useState({
    referrals_count: reward?.referrals_count || 3,
    reward_type: reward?.reward_type || 'points',
    reward_value: reward?.reward_value || '500',
    description_en: reward?.description_en || '',
    description_pl: reward?.description_pl || '',
    is_active: reward?.is_active ?? true,
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {reward 
            ? (language === 'pl' ? 'Edytuj Nagrodę' : 'Edit Reward')
            : (language === 'pl' ? 'Nowa Nagroda' : 'New Reward')}
        </DialogTitle>
        <DialogDescription>
          {language === 'pl' 
            ? 'Skonfiguruj nagrodę za osiągnięcie liczby poleceń'
            : 'Configure reward for reaching referral count'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Liczba Poleceń' : 'Referral Count'}</Label>
          <Input
            type="number"
            value={formData.referrals_count}
            onChange={(e) => setFormData({ ...formData, referrals_count: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Typ Nagrody' : 'Reward Type'}</Label>
          <Select value={formData.reward_type} onValueChange={(v) => setFormData({ ...formData, reward_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="coupon">Coupon</SelectItem>
              <SelectItem value="badge">Badge</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Wartość' : 'Value'}</Label>
          <Input
            value={formData.reward_value}
            onChange={(e) => setFormData({ ...formData, reward_value: e.target.value })}
            placeholder={language === 'pl' ? 'np. 500, COUPON10, badge_name' : 'e.g. 500, COUPON10, badge_name'}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Opis (EN)' : 'Description (EN)'}</Label>
          <Textarea
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            placeholder="Refer 5 friends to earn 500 bonus points"
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Opis (PL)' : 'Description (PL)'}</Label>
          <Textarea
            value={formData.description_pl}
            onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
            placeholder="Poleć 5 znajomych, aby zdobyć 500 bonusowych punktów"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>{language === 'pl' ? 'Aktywna' : 'Active'}</Label>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onSave(formData)} disabled={loading}>
          {loading 
            ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') 
            : (language === 'pl' ? 'Zapisz' : 'Save')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function BadgeRewardDialog({ reward, onSave, loading, language }: any) {
  const [formData, setFormData] = useState({
    badge_id: reward?.badge_id || '',
    reward_type: reward?.reward_type || 'points',
    reward_value: reward?.reward_value || '50',
    description_en: reward?.description_en || '',
    description_pl: reward?.description_pl || '',
    is_active: reward?.is_active ?? true,
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {reward 
            ? (language === 'pl' ? 'Edytuj Nagrodę za Odznakę' : 'Edit Badge Reward')
            : (language === 'pl' ? 'Nowa Nagroda za Odznakę' : 'New Badge Reward')}
        </DialogTitle>
        <DialogDescription>
          {language === 'pl' 
            ? 'Skonfiguruj nagrodę za zdobycie odznaki'
            : 'Configure reward for earning a badge'}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>{language === 'pl' ? 'ID Odznaki' : 'Badge ID'}</Label>
          <Input
            value={formData.badge_id}
            onChange={(e) => setFormData({ ...formData, badge_id: e.target.value })}
            placeholder="first_order, loyal_customer, super_reviewer"
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Typ Nagrody' : 'Reward Type'}</Label>
          <Select value={formData.reward_type} onValueChange={(v) => setFormData({ ...formData, reward_type: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="points">Points</SelectItem>
              <SelectItem value="coupon">Coupon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Wartość' : 'Value'}</Label>
          <Input
            value={formData.reward_value}
            onChange={(e) => setFormData({ ...formData, reward_value: e.target.value })}
            placeholder={language === 'pl' ? 'np. 50, LOYAL15' : 'e.g. 50, LOYAL15'}
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Opis (EN)' : 'Description (EN)'}</Label>
          <Textarea
            value={formData.description_en}
            onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
            placeholder="Earn 50 bonus points on your first order"
          />
        </div>

        <div className="space-y-2">
          <Label>{language === 'pl' ? 'Opis (PL)' : 'Description (PL)'}</Label>
          <Textarea
            value={formData.description_pl}
            onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
            placeholder="Zdobądź 50 dodatkowych punktów przy pierwszym zamówieniu"
          />
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label>{language === 'pl' ? 'Aktywna' : 'Active'}</Label>
        </div>
      </div>

      <DialogFooter>
        <Button onClick={() => onSave(formData)} disabled={loading}>
          {loading 
            ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') 
            : (language === 'pl' ? 'Zapisz' : 'Save')}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
