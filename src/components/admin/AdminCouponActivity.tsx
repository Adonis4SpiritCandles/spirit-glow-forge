import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Filter, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface CouponRedemption {
  id: string;
  redeemed_at: string;
  amount_saved_pln: number | null;
  amount_saved_eur: number | null;
  coupon: {
    code: string;
    id: string;
  };
  order?: {
    order_number: number;
    id: string;
  };
  profile: {
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
  };
}

export default function AdminCouponActivity() {
  const { language } = useLanguage();
  const [redemptions, setRedemptions] = useState<CouponRedemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState<string>('all');
  const [coupons, setCoupons] = useState<{ id: string; code: string }[]>([]);

  useEffect(() => {
    loadCoupons();
    loadRedemptions();
  }, []);

  const loadCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('id, code')
      .order('code');
    
    if (data) {
      setCoupons(data);
    }
  };

  const loadRedemptions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupon_redemptions')
      .select(`
        id,
        redeemed_at,
        amount_saved_pln,
        amount_saved_eur,
        coupon:coupons(id, code),
        order:orders(id, order_number),
        profile:profiles!coupon_redemptions_user_id_fkey(user_id, first_name, last_name, email)
      `)
      .order('redeemed_at', { ascending: false });

    if (error) {
      console.error('Error loading redemptions:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Nie udało się załadować historii' : 'Failed to load redemption history',
        variant: 'destructive',
      });
    } else {
      setRedemptions(data as any || []);
    }
    setLoading(false);
  };

  const filteredRedemptions = redemptions.filter(r => {
    const matchesSearch = 
      r.coupon?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${r.profile?.first_name} ${r.profile?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.order?.order_number?.toString().includes(searchTerm);
    
    const matchesCoupon = selectedCoupon === 'all' || r.coupon?.id === selectedCoupon;
    
    return matchesSearch && matchesCoupon;
  });

  const exportToCSV = () => {
    const headers = ['Date', 'Coupon Code', 'User', 'Email', 'Order #', 'Saved (PLN)', 'Saved (EUR)'];
    const rows = filteredRedemptions.map(r => [
      format(new Date(r.redeemed_at), 'yyyy-MM-dd HH:mm'),
      r.coupon?.code || '',
      `${r.profile?.first_name || ''} ${r.profile?.last_name || ''}`,
      r.profile?.email || '',
      r.order?.order_number?.toString() || '',
      r.amount_saved_pln?.toFixed(2) || '0.00',
      r.amount_saved_eur?.toFixed(2) || '0.00'
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coupon-activity-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: language === 'pl' ? 'Sukces' : 'Success',
      description: language === 'pl' ? 'Plik CSV został pobrany' : 'CSV file downloaded successfully',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'pl' ? 'Aktywność Kuponów' : 'Coupon Activity'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {language === 'pl' 
              ? 'Historia realizacji kuponów przez użytkowników' 
              : 'Coupon redemption history by users'}
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          {language === 'pl' ? 'Eksportuj CSV' : 'Export CSV'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={language === 'pl' ? 'Szukaj po kodzie, użytkowniku, emailu...' : 'Search by code, user, email...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCoupon} onValueChange={setSelectedCoupon}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={language === 'pl' ? 'Filtruj po kuponie' : 'Filter by coupon'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'pl' ? 'Wszystkie kupony' : 'All coupons'}</SelectItem>
                {coupons.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'pl' ? 'Realizacje' : 'Redemptions'} ({filteredRedemptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredRedemptions.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {language === 'pl' ? 'Brak realizacji kuponów' : 'No coupon redemptions found'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'pl' ? 'Data' : 'Date'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Kod Kuponu' : 'Coupon Code'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Użytkownik' : 'User'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Email' : 'Email'}</TableHead>
                    <TableHead>{language === 'pl' ? 'Zamówienie' : 'Order'}</TableHead>
                    <TableHead className="text-right">{language === 'pl' ? 'Oszczędność (PLN)' : 'Saved (PLN)'}</TableHead>
                    <TableHead className="text-right">{language === 'pl' ? 'Oszczędność (EUR)' : 'Saved (EUR)'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedemptions.map((redemption) => (
                    <TableRow key={redemption.id}>
                      <TableCell className="font-mono text-sm">
                        {format(new Date(redemption.redeemed_at), 'dd MMM yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <code className="bg-primary/10 px-2 py-1 rounded text-xs font-semibold text-primary">
                          {redemption.coupon?.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Link 
                          to={`/profile/${redemption.profile?.user_id}`}
                          className="hover:underline flex items-center gap-1"
                        >
                          {redemption.profile?.first_name} {redemption.profile?.last_name}
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {redemption.profile?.email}
                      </TableCell>
                      <TableCell>
                        {redemption.order?.order_number ? (
                          <span className="font-mono text-sm">#{redemption.order.order_number}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {redemption.amount_saved_pln 
                          ? `${redemption.amount_saved_pln.toFixed(2)} zł`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {redemption.amount_saved_eur 
                          ? `€${redemption.amount_saved_eur.toFixed(2)}`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
