import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Truck, PackageCheck, AlertCircle, Clock, PackageSearch } from 'lucide-react';

const ShippingStatusLegend = () => {
  const { t } = useLanguage();

  const statuses = [
    {
      status: 'delivered',
      icon: PackageCheck,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      label: t('statusDelivered'),
    },
    {
      status: 'shipped',
      icon: Truck,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      label: t('shippedSuccessfully'),
    },
    {
      status: 'in-transit',
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      label: t('statusInTransit'),
    },
    {
      status: 'awaiting-pickup',
      icon: PackageSearch,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      label: t('statusAwaitingPickup'),
    },
    {
      status: 'collect-problem',
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      label: t('statusCollectProblem'),
    },
    {
      status: 'processing',
      icon: Clock,
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      label: t('statusProcessing'),
    },
    {
      status: 'pending',
      icon: Clock,
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      label: t('statusPending'),
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
                className={`flex items-start gap-3 p-3 rounded-lg border ${status.bgColor}`}
              >
                <div className={`p-2 rounded-full ${status.color} bg-opacity-20`}>
                  <Icon className={`h-4 w-4 ${status.textColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${status.textColor} break-words`}>
                    {status.label}
                  </p>
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
