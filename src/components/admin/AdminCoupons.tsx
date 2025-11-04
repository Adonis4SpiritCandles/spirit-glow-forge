import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit2, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Coupon {
  id: string;
  code: string;
  description_en?: string;
  description_pl?: string;
  percent_off?: number;
  amount_off_pln?: number;
  amount_off_eur?: number;
  active: boolean;
  valid_from?: string;
  valid_to?: string;
  max_redemptions?: number;
  redemptions_count: number;
  per_user_limit: number;
  created_at: string;
}

const AdminCoupons = () => {
  const { language } = useLanguage();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    description_en: '',
    description_pl: '',
    percent_off: '',
    amount_off_pln: '',
    amount_off_eur: '',
    active: true,
    valid_from: '',
    valid_to: '',
    max_redemptions: '',
    per_user_limit: '1',
    referral_only: false,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się załadować kuponów' : 'Failed to load coupons',
        variant: 'destructive',
      });
    } else {
      setCoupons(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description_en: '',
      description_pl: '',
      percent_off: '',
      amount_off_pln: '',
      amount_off_eur: '',
      active: true,
      valid_from: '',
      valid_to: '',
      max_redemptions: '',
      per_user_limit: '1',
      referral_only: false,
    });
    setEditingCoupon(null);
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description_en: coupon.description_en || '',
      description_pl: coupon.description_pl || '',
      percent_off: coupon.percent_off?.toString() || '',
      amount_off_pln: coupon.amount_off_pln?.toString() || '',
      amount_off_eur: coupon.amount_off_eur?.toString() || '',
      active: coupon.active,
      valid_from: coupon.valid_from?.split('T')[0] || '',
      valid_to: coupon.valid_to?.split('T')[0] || '',
      max_redemptions: coupon.max_redemptions?.toString() || '',
      per_user_limit: coupon.per_user_limit?.toString() || '1',
      referral_only: (coupon as any).referral_only || false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.code.trim()) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Kod kuponu jest wymagany' : 'Coupon code is required',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.percent_off && !formData.amount_off_pln) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Musisz ustawić procent lub kwotę rabatu' : 'You must set percent or amount discount',
        variant: 'destructive',
      });
      return;
    }

    const couponData: any = {
      code: formData.code.toUpperCase().trim(),
      description_en: formData.description_en || null,
      description_pl: formData.description_pl || null,
      percent_off: formData.percent_off ? parseFloat(formData.percent_off) : null,
      amount_off_pln: formData.amount_off_pln ? parseFloat(formData.amount_off_pln) : null,
      amount_off_eur: formData.amount_off_eur ? parseFloat(formData.amount_off_eur) : null,
      active: formData.active,
      valid_from: formData.valid_from || null,
      valid_to: formData.valid_to || null,
      max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
      per_user_limit: parseInt(formData.per_user_limit) || 1,
      referral_only: formData.referral_only,
    };

    if (editingCoupon) {
      // Update existing coupon
      const { error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('id', editingCoupon.id);

      if (error) {
        console.error('Error updating coupon:', error);
        toast({
          title: language === 'pl' ? 'Błąd' : 'Error',
          description: language === 'pl' ? 'Nie udało się zaktualizować kuponu' : 'Failed to update coupon',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'pl' ? 'Sukces' : 'Success',
          description: language === 'pl' ? 'Kupon został zaktualizowany' : 'Coupon updated successfully',
        });
        setIsDialogOpen(false);
        resetForm();
        loadCoupons();
      }
    } else {
      // Create new coupon
      const { error } = await supabase
        .from('coupons')
        .insert([couponData]);

      if (error) {
        console.error('Error creating coupon:', error);
        toast({
          title: language === 'pl' ? 'Błąd' : 'Error',
          description: language === 'pl' ? 'Nie udało się utworzyć kuponu' : 'Failed to create coupon',
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'pl' ? 'Sukces' : 'Success',
          description: language === 'pl' ? 'Kupon został utworzony' : 'Coupon created successfully',
        });
        setIsDialogOpen(false);
        resetForm();
        loadCoupons();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć ten kupon?' : 'Are you sure you want to delete this coupon?')) {
      return;
    }

    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się usunąć kuponu' : 'Failed to delete coupon',
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Kupon został usunięty' : 'Coupon deleted successfully',
      });
      loadCoupons();
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    const { error } = await supabase
      .from('coupons')
      .update({ active: !currentActive })
      .eq('id', id);

    if (error) {
      console.error('Error toggling coupon:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się zmienić statusu' : 'Failed to toggle status',
        variant: 'destructive',
      });
    } else {
      loadCoupons();
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'pl' ? 'Zarządzanie Kuponami' : 'Coupon Management'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language === 'pl' 
              ? 'Twórz i zarządzaj kodami rabatowymi' 
              : 'Create and manage discount codes'}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              {language === 'pl' ? 'Dodaj Kupon' : 'Add Coupon'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon 
                  ? (language === 'pl' ? 'Edytuj Kupon' : 'Edit Coupon')
                  : (language === 'pl' ? 'Nowy Kupon' : 'New Coupon')}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="code">{language === 'pl' ? 'Kod Kuponu' : 'Coupon Code'} *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SUMMER2025"
                    className="uppercase"
                  />
                </div>

                <div>
                  <Label htmlFor="description_en">{language === 'pl' ? 'Opis (EN)' : 'Description (EN)'}</Label>
                  <Textarea
                    id="description_en"
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    placeholder="10% off summer collection"
                  />
                </div>

                <div>
                  <Label htmlFor="description_pl">{language === 'pl' ? 'Opis (PL)' : 'Description (PL)'}</Label>
                  <Textarea
                    id="description_pl"
                    value={formData.description_pl}
                    onChange={(e) => setFormData({ ...formData, description_pl: e.target.value })}
                    placeholder="10% rabatu na kolekcję letnią"
                  />
                </div>

                <div>
                  <Label htmlFor="percent_off">{language === 'pl' ? 'Procent Rabatu (%)' : 'Percent Off (%)'}</Label>
                  <Input
                    id="percent_off"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.percent_off}
                    onChange={(e) => setFormData({ ...formData, percent_off: e.target.value })}
                    placeholder="10"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_off_pln">{language === 'pl' ? 'Kwota Rabatu (PLN)' : 'Amount Off (PLN)'}</Label>
                  <Input
                    id="amount_off_pln"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount_off_pln}
                    onChange={(e) => setFormData({ ...formData, amount_off_pln: e.target.value })}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <Label htmlFor="amount_off_eur">{language === 'pl' ? 'Kwota Rabatu (EUR)' : 'Amount Off (EUR)'}</Label>
                  <Input
                    id="amount_off_eur"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount_off_eur}
                    onChange={(e) => setFormData({ ...formData, amount_off_eur: e.target.value })}
                    placeholder="10.00"
                  />
                </div>

                <div>
                  <Label htmlFor="valid_from">{language === 'pl' ? 'Ważny Od' : 'Valid From'}</Label>
                  <Input
                    id="valid_from"
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="valid_to">{language === 'pl' ? 'Ważny Do' : 'Valid To'}</Label>
                  <Input
                    id="valid_to"
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="max_redemptions">{language === 'pl' ? 'Maks. Użyć (Total)' : 'Max Redemptions (Total)'}</Label>
                  <Input
                    id="max_redemptions"
                    type="number"
                    min="1"
                    value={formData.max_redemptions}
                    onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                    placeholder={language === 'pl' ? 'Bez limitu' : 'Unlimited'}
                  />
                </div>

                <div>
                  <Label htmlFor="per_user_limit">{language === 'pl' ? 'Limit Na Użytkownika' : 'Per User Limit'}</Label>
                  <Input
                    id="per_user_limit"
                    type="number"
                    min="1"
                    value={formData.per_user_limit}
                    onChange={(e) => setFormData({ ...formData, per_user_limit: e.target.value })}
                  />
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                  />
                  <Label htmlFor="active">{language === 'pl' ? 'Aktywny' : 'Active'}</Label>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    id="referral_only"
                    checked={formData.referral_only}
                    onCheckedChange={(checked) => setFormData({ ...formData, referral_only: checked })}
                  />
                  <div>
                    <Label htmlFor="referral_only">{language === 'pl' ? 'Tylko dla Poleceń' : 'Referral Only'}</Label>
                    <p className="text-xs text-muted-foreground">
                      {language === 'pl' 
                        ? 'Kupon może być użyty tylko przez użytkowników zarejestrowanych przez polecenie'
                        : 'This coupon can only be used by users registered via referral link'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {language === 'pl' ? 'Anuluj' : 'Cancel'}
                </Button>
                <Button type="submit">
                  {editingCoupon 
                    ? (language === 'pl' ? 'Zaktualizuj' : 'Update')
                    : (language === 'pl' ? 'Utwórz' : 'Create')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {coupons.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {language === 'pl' ? 'Brak kuponów. Dodaj pierwszy!' : 'No coupons yet. Add your first one!'}
              </p>
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <code className="bg-primary/10 px-3 py-1 rounded text-primary">{coupon.code}</code>
                      <Switch
                        checked={coupon.active}
                        onCheckedChange={() => toggleActive(coupon.id, coupon.active)}
                      />
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {language === 'pl' ? coupon.description_pl : coupon.description_en}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">{language === 'pl' ? 'Rabat' : 'Discount'}</div>
                    <div className="font-semibold">
                      {coupon.percent_off ? `${coupon.percent_off}%` : ''}
                      {coupon.amount_off_pln ? `${coupon.amount_off_pln} PLN` : ''}
                      {coupon.amount_off_eur ? ` / ${coupon.amount_off_eur} EUR` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{language === 'pl' ? 'Użyć' : 'Redemptions'}</div>
                    <div className="font-semibold">
                      {coupon.redemptions_count} / {coupon.max_redemptions || '∞'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{language === 'pl' ? 'Ważny Od' : 'Valid From'}</div>
                    <div className="font-semibold">
                      {coupon.valid_from ? new Date(coupon.valid_from).toLocaleDateString() : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">{language === 'pl' ? 'Ważny Do' : 'Valid To'}</div>
                    <div className="font-semibold">
                      {coupon.valid_to ? new Date(coupon.valid_to).toLocaleDateString() : '-'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
