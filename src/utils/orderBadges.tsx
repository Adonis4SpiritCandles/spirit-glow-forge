import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle, Clock, Package, Truck, AlertCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Order {
  id: string;
  status: string;
  has_issue?: boolean;
  furgonetka_package_id?: string;
  tracking_number?: string;
  carrier?: string;
  shipping_status?: string;
}

interface BadgeItem {
  label: string;
  variant: string;
  icon: React.ReactNode;
}

export const getOrderBadges = (order: Order, t: (key: string) => string): BadgeItem[] => {
  const badges: BadgeItem[] = [];

  // Priority 1: Issue badge (ONLY this if has_issue is true)
  if (order.has_issue) {
    return [{
      label: t('issue'),
      variant: 'bg-red-500/10 text-red-600 border border-red-600/20',
      icon: <AlertCircle className="w-3 h-3" />
    }];
  }

  // Badge 2: Paid (ALWAYS present if status !== 'pending')
  if (order.status !== 'pending') {
    badges.push({
      label: t('paid'),
      variant: 'bg-red-500/10 text-red-600 border border-red-600/20',
      icon: <CreditCard className="w-3 h-3" />
    });
  }

  // Badge 3: Awaiting Confirm (if NOT yet completed)
  if (order.status !== 'completed' && !order.furgonetka_package_id) {
    badges.push({
      label: t('awaitingConfirm'),
      variant: 'bg-yellow-500/10 text-yellow-600 border border-yellow-600/20',
      icon: <Clock className="w-3 h-3" />
    });
  }

  // Badge 4: Complete (if admin has accepted)
  if (order.status === 'completed') {
    badges.push({
      label: t('complete'),
      variant: 'bg-green-700/10 text-green-700 border border-green-700/20',
      icon: <CheckCircle className="w-3 h-3" />
    });
  }

  // Badge 5: Awaiting Shipping (if complete but not yet shipped)
  if (order.status === 'completed' && !order.tracking_number) {
    badges.push({
      label: t('awaitingShipping'),
      variant: 'bg-sky-400/10 text-sky-400 border border-sky-400/20',
      icon: <Package className="w-3 h-3" />
    });
  }

  // Badge 6: Shipped (if tracking_number present)
  if (order.tracking_number) {
    badges.push({
      label: t('shipped'),
      variant: 'bg-blue-600/10 text-blue-600 border border-blue-600/20',
      icon: <Truck className="w-3 h-3" />
    });
  }

  // Badge 7: In Transit (if shipped and carrier synchronized)
  if (order.tracking_number && order.carrier) {
    badges.push({
      label: t('inTransit'),
      variant: 'bg-green-400/10 text-green-400 border border-green-400/20',
      icon: <TrendingUp className="w-3 h-3" />
    });
  }

  // Fallback: Pending if no other status
  if (badges.length === 0) {
    badges.push({
      label: t('pending'),
      variant: 'bg-yellow-500/10 text-yellow-600 border border-yellow-600/20',
      icon: <Clock className="w-3 h-3" />
    });
  }

  return badges;
};

export const OrderBadgesDisplay = ({ order }: { order: Order }) => {
  const { t } = useLanguage();
  const badges = getOrderBadges(order, t);

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, idx) => (
        <Badge
          key={idx}
          variant="outline"
          className={`text-xs px-2 py-1 h-auto ${badge.variant} flex items-center gap-1.5`}
        >
          {badge.icon}
          <span className="whitespace-nowrap">{badge.label}</span>
        </Badge>
      ))}
    </div>
  );
};

