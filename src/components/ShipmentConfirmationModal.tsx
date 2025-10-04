import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/contexts/LanguageContext';
import { Separator } from '@/components/ui/separator';

interface ShipmentConfirmationModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (orderId: string, dimensions?: { width: number; height: number; length: number }, weight?: number) => void;
  isLoading?: boolean;
}

const ShipmentConfirmationModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onConfirm,
  isLoading = false 
}: ShipmentConfirmationModalProps) => {
  const { t } = useLanguage();
  const [enableEditing, setEnableEditing] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: 30,
    height: 30,
    length: 30
  });
  const [weight, setWeight] = useState(0.5);

  if (!order) return null;

  const shippingAddress = order.shipping_address || {};
  const customerName = `${order.profiles?.first_name || ''} ${order.profiles?.last_name || ''}`.trim() || 'N/A';
  const customerEmail = order.profiles?.email || shippingAddress.email || 'N/A';

  const handleConfirm = () => {
    if (enableEditing) {
      onConfirm(order.id, dimensions, weight);
    } else {
      onConfirm(order.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">
            {t('shipmentConfirmation')}
          </DialogTitle>
          <DialogDescription>
            Review shipment details and confirm.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Information */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t('orderInformation')}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">{t('orderNumber')}</p>
                <p className="font-medium">#{order.order_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Order ID</p>
                <p className="font-mono text-xs">{order.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Customer Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t('customerDetails')}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">{t('fullName')}</p>
                  <p className="font-medium">{customerName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('email')}</p>
                  <p className="font-medium">{customerEmail}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground mb-1">{t('shippingAddress')}</p>
                <div className="bg-muted/50 p-3 rounded-md space-y-1">
                  <p className="font-medium">{shippingAddress.name || 'N/A'}</p>
                  <p>{shippingAddress.street || ''}</p>
                  <p>{`${shippingAddress.postalCode || shippingAddress.post_code || ''} ${shippingAddress.city || ''}`.trim()}</p>
                  <p>{shippingAddress.country || 'PL'}</p>
                  {shippingAddress.phone && <p className="text-muted-foreground">{t('phone')}: {shippingAddress.phone}</p>}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Shipment Details */}
          <div>
            <h3 className="font-semibold text-lg mb-3">{t('shipmentDetails')}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground">{t('carrier')}</p>
                  <p className="font-medium">{order.carrier_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{t('serviceId')}</p>
                  <p className="font-medium">{order.service_id || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-md space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="enableEditing"
                    checked={enableEditing}
                    onCheckedChange={(checked) => setEnableEditing(checked as boolean)}
                  />
                  <label
                    htmlFor="enableEditing"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {t('enableEditingDimensions')}
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="width">{t('width')} (cm)</Label>
                    <Input
                      id="width"
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                      disabled={!enableEditing}
                      min={1}
                      max={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">{t('height')} (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions({ ...dimensions, height: Number(e.target.value) })}
                      disabled={!enableEditing}
                      min={1}
                      max={200}
                    />
                  </div>
                  <div>
                    <Label htmlFor="length">{t('length')} (cm)</Label>
                    <Input
                      id="length"
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                      disabled={!enableEditing}
                      min={1}
                      max={200}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="weight">{t('weight')} (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    disabled={!enableEditing}
                    min={0.1}
                    max={50}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? t('processing') : t('confirmAndCreateShipment')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentConfirmationModal;
