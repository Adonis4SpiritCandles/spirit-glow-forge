import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Package, CreditCard, Wrench, Truck, CheckCircle, ArrowLeft, ExternalLink, Star } from 'lucide-react';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/LoadingSpinner';

interface TimelineEvent {
  status: string;
  date: string;
  notes?: string;
  completed: boolean;
}

export default function OrderTimeline() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [order, setOrder] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      loadOrderTimeline();
    }
  }, [user, orderId]);

  const loadOrderTimeline = async () => {
    try {
      // Load order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('user_id', user!.id)
        .single();

      if (orderError) throw orderError;
      if (!orderData) {
        toast.error(language === 'pl' ? 'Zamówienie nie znalezione' : 'Order not found');
        navigate('/dashboard');
        return;
      }

      setOrder(orderData);

      // Load order items with products
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('order_id', orderId);

      setProducts(itemsData || []);

      // Build timeline from order status
      const events: TimelineEvent[] = [
        {
          status: 'pending',
          date: orderData.created_at,
          completed: true,
          notes: language === 'pl' ? 'Zamówienie utworzone' : 'Order created'
        }
      ];

      if (orderData.status !== 'pending') {
        events.push({
          status: 'paid',
          date: orderData.updated_at,
          completed: ['paid', 'preparing', 'shipped', 'delivered'].includes(orderData.status),
          notes: language === 'pl' ? 'Płatność zweryfikowana' : 'Payment verified'
        });
      }

      if (['preparing', 'shipped', 'delivered'].includes(orderData.status)) {
        events.push({
          status: 'preparing',
          date: orderData.updated_at,
          completed: true,
          notes: language === 'pl' ? 'W przygotowaniu' : 'Being prepared'
        });
      }

      if (['shipped', 'delivered'].includes(orderData.shipping_status)) {
        events.push({
          status: 'shipped',
          date: orderData.updated_at,
          completed: true,
          notes: orderData.tracking_number || ''
        });
      }

      if (orderData.shipping_status === 'delivered') {
        events.push({
          status: 'delivered',
          date: orderData.updated_at,
          completed: true,
          notes: language === 'pl' ? 'Zamówienie dostarczone' : 'Order delivered'
        });
      }

      setTimeline(events);
    } catch (error) {
      console.error('Error loading timeline:', error);
      toast.error(language === 'pl' ? 'Błąd ładowania' : 'Error loading');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Package className="h-5 w-5" />;
      case 'paid':
        return <CreditCard className="h-5 w-5" />;
      case 'preparing':
        return <Wrench className="h-5 w-5" />;
      case 'shipped':
        return <Truck className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { en: string; pl: string }> = {
      pending: { en: 'Order Created', pl: 'Zamówienie utworzone' },
      paid: { en: 'Payment Confirmed', pl: 'Płatność potwierdzona' },
      preparing: { en: 'In Preparation', pl: 'W przygotowaniu' },
      shipped: { en: 'Shipped', pl: 'Wysłane' },
      delivered: { en: 'Delivered', pl: 'Dostarczone' }
    };
    return labels[status]?.[language] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container max-w-4xl py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {language === 'pl' ? 'Zamówienie nie znalezione' : 'Order not found'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {language === 'pl' ? 'Powrót do dashboardu' : 'Back to dashboard'}
        </Button>
        <h1 className="text-3xl font-bold">
          {language === 'pl' ? 'Historia zamówienia' : 'Order Timeline'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'pl' ? 'Zamówienie' : 'Order'} #{order.order_number || order.id.slice(0, 8)}
        </p>
      </div>

      {/* Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Status zamówienia' : 'Order Status'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {timeline.map((event, index) => (
              <div key={index} className="flex items-start gap-4 relative">
                {/* Vertical line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[20px] top-12 bottom-0 w-px bg-border" />
                )}

                {/* Icon */}
                <div 
                  className={`p-2 rounded-full z-10 ${
                    event.completed 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {getStatusIcon(event.status)}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">{getStatusLabel(event.status)}</h3>
                    {event.completed && (
                      <Badge variant="secondary">{language === 'pl' ? 'Ukończone' : 'Completed'}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.date), 'PPpp')}
                  </p>
                  {event.notes && (
                    <p className="text-sm mt-2">{event.notes}</p>
                  )}
                  {event.status === 'shipped' && order.tracking_url && (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        {language === 'pl' ? 'Śledź przesyłkę' : 'Track Package'}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>{language === 'pl' ? 'Produkty' : 'Products'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((item: any) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <img 
                  src={item.product.image_url} 
                  alt={language === 'en' ? item.product.name_en : item.product.name_pl}
                  className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <h4 className="font-semibold">
                    {language === 'en' ? item.product.name_en : item.product.name_pl}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'pl' ? 'Ilość' : 'Quantity'}: {item.quantity}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {item.price_pln} PLN
                  </p>
                  
                  {order.shipping_status === 'delivered' && (
                    <Button variant="outline" size="sm" asChild className="mt-2">
                      <Link to={`/product/${item.product_id}?review=true`}>
                        <Star className="h-4 w-4 mr-2" />
                        {language === 'pl' ? 'Zostaw opinię' : 'Leave Review'}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
