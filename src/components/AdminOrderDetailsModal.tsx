import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw, Check, Clock, Truck, Package, CheckCircle2 } from 'lucide-react';
import { CarrierBadge } from '@/utils/carrierStyles';
import { useState } from 'react';

interface Order {
  id: string;
  user_id: string;
  status: string;
  total_pln: number;
  total_eur: number;
  shipping_cost_pln?: number;
  shipping_cost_eur?: number;
  carrier_name?: string;
  created_at: string;
  updated_at?: string;
  order_number?: number;
  shipping_status?: string;
  tracking_number?: string;
  tracking_url?: string;
  carrier?: string;
  shipping_label_url?: string;
  furgonetka_package_id?: string;
  shipping_address?: any;
  service_id?: number;
  profiles?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    preferred_language?: string;
  };
}

interface AdminOrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onTrackingUpdated?: () => void;
}

export default function AdminOrderDetailsModal({ order, isOpen, onClose, onTrackingUpdated }: AdminOrderDetailsModalProps) {
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncTracking = async () => {
    if (!order?.furgonetka_package_id) {
      toast.error('No Furgonetka package ID found');
      return;
    }

    setIsSyncing(true);
    let data: any = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Not authenticated');
        return;
      }

      const response = await supabase.functions.invoke('sync-furgonetka-tracking', {
        body: { orderId: order.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      data = response.data;

      if (data?.success === false) {
        toast.error(data.error || 'Failed to sync tracking');
        return;
      }

      if (data?.tracking_number) {
        const message = data.tracking_url 
          ? `Tracking synced: ${data.tracking_number}`
          : `Tracking number synced: ${data.tracking_number}`;
        toast.success(message);
        onTrackingUpdated?.();
      } else {
        toast.info('No tracking number available yet from Furgonetka');
      }
    } catch (error: any) {
      console.error('Error syncing tracking:', error);
      toast.error(data?.error || error.message || 'Failed to sync tracking');
    } finally {
      setIsSyncing(false);
    }
  };
  
  if (!order) return null;

  const customerName = order.profiles?.first_name && order.profiles?.last_name
    ? `${order.profiles.first_name} ${order.profiles.last_name}`
    : order.profiles?.email || 'N/A';

  const shippingAddress = order.shipping_address || {};
  const productSubtotalPLN = Number(order.total_pln - (order.shipping_cost_pln || 0));
  const productSubtotalEUR = Number(order.total_eur - (order.shipping_cost_eur || 0));
  const shippingCostPLN = Number(order.shipping_cost_pln || 0);
  const shippingCostEUR = Number(order.shipping_cost_eur || 0);
  const totalPLN = Number(order.total_pln);
  const totalEUR = Number(order.total_eur);

  // Timeline steps
  const timelineSteps = [
    {
      label: t('orderCreated'),
      completed: true,
      timestamp: order.created_at,
      icon: CheckCircle2,
    },
    {
      label: t('paymentConfirmed'),
      completed: order.status !== 'pending',
      timestamp: order.status !== 'pending' ? order.created_at : null,
      icon: Check,
    },
    {
      label: t('adminConfirmed'),
      completed: order.status === 'completed',
      timestamp: order.status === 'completed' ? order.updated_at : null,
      icon: Check,
    },
    {
      label: t('shipmentCreated'),
      completed: !!order.furgonetka_package_id,
      timestamp: order.furgonetka_package_id ? order.updated_at : null,
      icon: Package,
    },
    {
      label: t('inTransit'),
      completed: !!order.tracking_number,
      timestamp: order.tracking_number ? order.updated_at : null,
      icon: Truck,
    },
    {
      label: t('delivered'),
      completed: order.shipping_status === 'delivered',
      timestamp: order.shipping_status === 'delivered' ? order.updated_at : null,
      icon: CheckCircle2,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">{t('orderDetails')}</DialogTitle>
          <DialogDescription>
            {t('completeInformation')} #SPIRIT-{String(order.order_number).padStart(5, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div>
            <h3 className="font-semibold mb-3">{t('orderInformation')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Order ID:</span>
                <p className="font-mono text-xs mt-1">{order.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Order Number:</span>
                <p className="font-semibold mt-1">SPIRIT-{String(order.order_number).padStart(5, '0')}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Date:</span>
                <p className="mt-1">{new Date(order.created_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="mt-1">
                  <Badge variant="default">{order.status}</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Order Timeline */}
          <div>
            <h3 className="font-semibold mb-4">{t('orderTimeline')}</h3>
            <div className="space-y-3 relative">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4 relative">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${
                      step.completed 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className={`absolute left-[1.25rem] top-10 w-0.5 h-8 ${
                        step.completed ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                    )}
                    <div className="flex-1 pt-2">
                      <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </p>
                      {step.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(step.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div>
            <h3 className="font-semibold mb-3">{t('customerInformation')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="mt-1">{customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="mt-1">{order.profiles?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-mono text-xs mt-1">{order.user_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Role:</span>
                <div className="mt-1">
                  <Badge variant="secondary">USER</Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3">{t('shippingAddress')}</h3>
            <div className="text-sm space-y-1">
              {shippingAddress.name && <p className="font-medium">{shippingAddress.name}</p>}
              {shippingAddress.street && (
                <p>
                  {(() => {
                    const street = String(shippingAddress.street || '');
                    const apt = String(shippingAddress.apartmentNumber || '').trim();
                    if (!apt) return street;
                    const hasApt = new RegExp(`[\\/ ]${apt}(?:\\b|$)`).test(street);
                    return hasApt ? street : `${street}/${apt}`;
                  })()}
                </p>
              )}
              {(shippingAddress.city || shippingAddress.postalCode || shippingAddress.postal_code) && (
                <p>
                  {(shippingAddress.postalCode || shippingAddress.postal_code) ?? ''} {shippingAddress.city ?? ''}
                </p>
              )}
              {shippingAddress.country && <p>{shippingAddress.country}</p>}
              {shippingAddress.email && <p className="text-muted-foreground">Email: {shippingAddress.email}</p>}
              {shippingAddress.phone && <p className="text-muted-foreground">Phone: {shippingAddress.phone}</p>}
            </div>
          </div>

          <Separator />

          {/* Pricing Details */}
          <div>
            <h3 className="font-semibold mb-3">{t('pricingDetails')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('productsSubtotal')}:</span>
                <span>{productSubtotalPLN.toFixed(2)} PLN / {productSubtotalEUR.toFixed(2)} EUR</span>
              </div>
              {(order.shipping_cost_pln || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('shippingCost')}:</span>
                  <span>{shippingCostPLN.toFixed(2)} PLN / {shippingCostEUR.toFixed(2)} EUR</span>
                </div>
              )}
              {(order.carrier_name || order.carrier) && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('carrierSelected')}:</span>
                  <CarrierBadge carrierName={order.carrier_name || order.carrier} />
                </div>
              )}
              {order.service_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('serviceCarrierId')}:</span>
                  <span className="font-mono text-xs">{order.service_id}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>{t('totalPaid')}:</span>
                <span>{totalPLN.toFixed(2)} PLN / {totalEUR.toFixed(2)} EUR</span>
              </div>
            </div>
          </div>

          {/* Shipping Status */}
          {(order.tracking_number || order.carrier || order.shipping_status || order.furgonetka_package_id) && (
            <>
              <Separator />
              <div>
              <h3 className="font-semibold mb-3">{t('shippingStatus')}</h3>
                <div className="space-y-3 text-sm">
                  {order.tracking_number && order.carrier && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('carrier')}:</span>
                        <CarrierBadge carrierName={order.carrier_name || order.carrier} />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('sentVia')}:</span>
                        <Badge className="bg-blue-900 text-white">Furgonetka</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('trackingNumber')}:</span>
                        <div className="flex items-center gap-2">
                          {order.tracking_url ? (
                            <a 
                              href={order.tracking_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-mono text-sm md:text-base font-bold bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                            >
                              {order.tracking_number}
                            </a>
                          ) : (
                            <code className="font-mono text-sm md:text-base font-bold bg-muted px-2 py-1 rounded">{order.tracking_number}</code>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('status')}:</span>
                        <Badge variant="secondary" className="bg-green-500 text-white flex items-center gap-1 drop-shadow-md">
                          <Truck className="h-3 w-3" />
                          {t('shippedSuccessfully')}
                        </Badge>
                      </div>
                    </>
                  )}
                  
                  {!order.tracking_number && order.shipping_status && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{t('status')}:</span>
                      <Badge variant="secondary">{order.shipping_status}</Badge>
                    </div>
                  )}
                  
                  {order.furgonetka_package_id && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('packageId')}:</span>
                        <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.furgonetka_package_id}</code>
                      </div>
                      <div className="mt-3">
                        <Button 
                          onClick={handleSyncTracking} 
                          disabled={isSyncing}
                          size="sm"
                          variant="outline"
                          className="w-full"
                        >
                          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? t('syncingTracking') : t('syncTracking')}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
