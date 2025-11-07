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
      textColor: 'text-red-600',
      bgColor: 'bg-red-500/10 border border-red-600/20',
    },
    {
      status: 'awaiting-confirm',
      icon: AlertCircle,
      label: t('awaitingConfirm'),
      description: t('statusAwaitingConfirmDesc'),
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10 border border-yellow-600/20',
    },
    {
      status: 'complete',
      icon: Package,
      label: t('complete'),
      description: t('statusCompleteDesc'),
      textColor: 'text-green-700',
      bgColor: 'bg-green-700/10 border border-green-700/20',
    },
    {
      status: 'awaiting-shipping',
      icon: Package,
      label: t('awaitingShipping'),
      description: t('statusAwaitingShippingDesc'),
      textColor: 'text-sky-400',
      bgColor: 'bg-sky-400/10 border border-sky-400/20',
    },
    {
      status: 'shipped',
      icon: Truck,
      label: t('shipped'),
      description: t('statusShippedDesc'),
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-600/10 border border-blue-600/20',
    },
    {
      status: 'in-transit',
      icon: Truck,
      label: t('inTransit'),
      description: t('statusInTransitDesc'),
      textColor: 'text-green-400',
      bgColor: 'bg-green-400/10 border border-green-400/20',
    },
    {
      status: 'issue',
      icon: AlertCircle,
      label: t('issue'),
      description: t('statusIssueDesc'),
      textColor: 'text-red-600',
      bgColor: 'bg-red-500/10 border border-red-600/20',
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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <div
                key={status.status}
                className={`flex items-start gap-3 p-4 rounded-lg transition-all hover:shadow-md ${status.bgColor}`}
              >
                <div className="p-2.5 rounded-full bg-background/80 border border-border/50 shadow-sm">
                  <Icon className={`h-5 w-5 ${status.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${status.textColor} break-words mb-1`}>
                    {status.label}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{status.description}</p>
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
