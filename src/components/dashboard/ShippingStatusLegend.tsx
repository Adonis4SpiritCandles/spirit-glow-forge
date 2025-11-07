import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Truck, AlertCircle, CreditCard } from 'lucide-react';

const ShippingStatusLegend = () => {
  const { t } = useLanguage();

  const statuses = [
    {
      status: 'paid',
      icon: CreditCard,
      label: t('paid'),
      description: t('statusPaidDesc'),
      textColor: 'text-accent',
      bgColor: 'bg-accent/10 border border-accent/20',
    },
    {
      status: 'shipped',
      icon: Truck,
      label: t('shipped'),
      description: t('statusShippedDesc'),
      textColor: 'text-primary',
      bgColor: 'bg-primary/10 border border-primary/20',
    },
    {
      status: 'awaiting-pickup',
      icon: Package,
      label: t('awaitingPickup'),
      description: t('statusAwaitingPickupDesc'),
      textColor: 'text-primary',
      bgColor: 'bg-primary/10 border border-primary/20',
    },
    {
      status: 'issue',
      icon: AlertCircle,
      label: t('issue'),
      description: t('statusIssueDesc'),
      textColor: 'text-destructive',
      bgColor: 'bg-destructive/10 border border-destructive/20',
    },
  ];

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Package className="h-5 w-5" />
          {t('shippingStatusLegend')}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {t('shippingStatusInfo')}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <div
                key={status.status}
                className={`flex items-start gap-3 p-3 rounded-lg ${status.bgColor}`}
              >
                <div className="p-2 rounded-full bg-background/60 border border-border/50">
                  <Icon className={`h-4 w-4 ${status.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${status.textColor} break-words`}>
                    {status.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{status.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ShippingStatusLegend;
