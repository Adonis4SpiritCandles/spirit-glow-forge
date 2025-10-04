import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
}

export default function AdminOrderDetailsModal({ order, isOpen, onClose }: AdminOrderDetailsModalProps) {
  if (!order) return null;

  const customerName = order.profiles?.first_name && order.profiles?.last_name
    ? `${order.profiles.first_name} ${order.profiles.last_name}`
    : order.profiles?.email || 'N/A';

  const shippingAddress = order.shipping_address || {};
  const productSubtotalPLN = order.total_pln - (order.shipping_cost_pln || 0);
  const productSubtotalEUR = order.total_eur - (order.shipping_cost_eur || 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">Order Details</DialogTitle>
          <DialogDescription>
            Complete information for order #SPIRIT-{String(order.order_number).padStart(5, '0')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div>
            <h3 className="font-semibold mb-3">Order Information</h3>
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
            <h3 className="font-semibold mb-3">Customer Information</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="mt-1">{customerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>
                <p className="mt-1">{order.profiles?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold mb-3">Shipping Address</h3>
            <div className="text-sm space-y-1">
              {shippingAddress.name && <p className="font-medium">{shippingAddress.name}</p>}
              {shippingAddress.street && <p>{shippingAddress.street}</p>}
              {shippingAddress.line2 && <p>{shippingAddress.line2}</p>}
              {(shippingAddress.city || shippingAddress.postal_code) && (
                <p>
                  {shippingAddress.city}
                  {shippingAddress.postal_code && `, ${shippingAddress.postal_code}`}
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
            <h3 className="font-semibold mb-3">Pricing Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Products Subtotal:</span>
                <span>{productSubtotalPLN} PLN / {productSubtotalEUR} EUR</span>
              </div>
              {(order.shipping_cost_pln || 0) > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping Cost:</span>
                  <span>{order.shipping_cost_pln} PLN / {order.shipping_cost_eur} EUR</span>
                </div>
              )}
              {order.carrier_name && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Carrier Selected:</span>
                  <Badge variant="outline">{order.carrier_name}</Badge>
                </div>
              )}
              {order.service_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service ID:</span>
                  <span className="font-mono text-xs">{order.service_id}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between font-semibold text-base">
                <span>Total Paid:</span>
                <span>{order.total_pln} PLN / {order.total_eur} EUR</span>
              </div>
            </div>
          </div>

          {/* Shipping Status */}
          {(order.tracking_number || order.carrier || order.shipping_status) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3">Shipping Status</h3>
                <div className="space-y-2 text-sm">
                  {order.shipping_status && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="secondary">{order.shipping_status}</Badge>
                    </div>
                  )}
                  {order.carrier && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Carrier:</span>
                      <span>{order.carrier}</span>
                    </div>
                  )}
                  {order.tracking_number && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tracking Number:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.tracking_number}</code>
                    </div>
                  )}
                  {order.furgonetka_package_id && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Package ID:</span>
                      <code className="font-mono text-xs bg-muted px-2 py-1 rounded">{order.furgonetka_package_id}</code>
                    </div>
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
