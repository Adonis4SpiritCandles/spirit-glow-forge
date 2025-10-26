import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
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
  const productSubtotalPLN = (order.total_pln - (order.shipping_cost_pln || 0)) / 100;
  const productSubtotalEUR = order.total_eur - (order.shipping_cost_eur || 0);
  const shippingCostPLN = (order.shipping_cost_pln || 0) / 100;
  const shippingCostEUR = order.shipping_cost_eur || 0;
  const totalPLN = order.total_pln / 100;
  const totalEUR = order.total_eur;

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
                <span>{productSubtotalPLN.toFixed(2)} PLN / {productSubtotalEUR} EUR</span>
              </div>
              {(order.shipping_cost_pln || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('shippingCost')}:</span>
                  <span>{shippingCostPLN.toFixed(2)} PLN / {shippingCostEUR} EUR</span>
                </div>
              )}
              {order.carrier_name && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{t('carrierSelected')}:</span>
                  <Badge variant="outline">{order.carrier_name}</Badge>
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
                <span>{totalPLN.toFixed(2)} PLN / {totalEUR} EUR</span>
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
                        <Badge variant="default">{order.carrier}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('sentVia')}:</span>
                        <span className="text-xs">Furgonetka</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('trackingNumber')}:</span>
                        <div className="flex items-center gap-2">
                          {order.tracking_url ? (
                            <a 
                              href={order.tracking_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-mono text-xs bg-muted px-2 py-1 rounded hover:bg-muted/80 transition-colors"
                            >
                              {order.tracking_number}
                            </a>
                          ) : (
                            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.tracking_number}</code>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">{t('status')}:</span>
                        <Badge variant="secondary" className="bg-green-500 text-white drop-shadow-md">
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
