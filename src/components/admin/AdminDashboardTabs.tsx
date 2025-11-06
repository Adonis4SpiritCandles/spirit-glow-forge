import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Users, ShoppingCart, Trash2, Database, Tags, Gift, BarChart3, FileText, Settings, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardTabs = ({ activeTab, setActiveTab }: AdminDashboardTabsProps) => {
  const { t } = useLanguage();

  const tabs = [
    { value: 'products', icon: <Package className="h-4 w-4" />, label: t('products') },
    { value: 'collections', icon: <Tags className="h-4 w-4" />, label: t('collections') },
    { value: 'orders', icon: <ShoppingCart className="h-4 w-4" />, label: t('orders') },
    { value: 'trash', icon: <Trash2 className="h-4 w-4" />, label: t('ordersTrash') },
    { value: 'customers', icon: <Users className="h-4 w-4" />, label: t('customers') },
    { value: 'warehouse', icon: <Database className="h-4 w-4" />, label: t('warehouse') },
    { value: 'coupons', icon: <Tags className="h-4 w-4" />, label: t('coupons') },
    { value: 'rewards', icon: <Gift className="h-4 w-4" />, label: t('referralsRewards') },
    { value: 'statistics', icon: <BarChart3 className="h-4 w-4" />, label: t('statistics') },
    { value: 'export', icon: <FileText className="h-4 w-4" />, label: t('export') },
    { value: 'settings', icon: <Settings className="h-4 w-4" />, label: t('siteSettings') },
    { value: 'social', icon: <Globe className="h-4 w-4" />, label: t('socialMedia') },
  ];

  return (
    <>
      {/* Desktop/Tablet - Pills con flex-wrap */}
      <div className="hidden sm:flex flex-wrap gap-2 p-2 bg-muted/40 rounded-lg mb-6">
        {tabs.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
            className={`gap-2 px-3 py-2 transition-all ${
              activeTab === tab.value 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'hover:bg-primary/20 hover:text-primary'
            }`}
          >
            {tab.icon}
            <span className="text-sm whitespace-nowrap">{tab.label}</span>
          </Button>
        ))}
      </div>

      {/* Mobile - Select dropdown */}
      <Select value={activeTab} onValueChange={setActiveTab}>
        <SelectTrigger className="sm:hidden mb-4">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {tabs.map(tab => (
            <SelectItem key={tab.value} value={tab.value}>
              <div className="flex items-center gap-2">
                {tab.icon}
                <span>{tab.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
};

export default AdminDashboardTabs;
