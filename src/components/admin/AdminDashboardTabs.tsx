import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Users, ShoppingCart, Trash2, Database, Tags, Gift, BarChart3, FileText, Settings, Globe, TrendingUp, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminDashboardTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const AdminDashboardTabs = ({ activeTab, setActiveTab }: AdminDashboardTabsProps) => {
  const { t, language } = useLanguage();

  const tabs = [
    { value: 'products', icon: <Package className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('products') },
    { value: 'collections', icon: <Tags className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('collections') },
    { value: 'orders', icon: <ShoppingCart className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('orders') },
    { value: 'trash', icon: <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('ordersTrash') },
    { value: 'customers', icon: <Users className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('customers') },
    { value: 'warehouse', icon: <Database className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('warehouse') },
    { value: 'coupons', icon: <Tags className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('coupons') },
    { value: 'settings', icon: <Settings className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('spiritToolsAndSite') },
    { value: 'social', icon: <Globe className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('socialMedia') },
    { value: 'statistics', icon: <BarChart3 className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('statistics') },
    { value: 'analytics', icon: <TrendingUp className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: language === 'pl' ? 'Analytics' : 'Analytics' },
    { value: 'referrals', icon: <Gift className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: language === 'pl' ? 'Referral' : 'Referral' },
    { value: 'export', icon: <FileText className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('export') },
    { value: 'email', icon: <Mail className="h-4 w-4 sm:h-3.5 sm:w-3.5 md:h-3.5 md:w-3.5 lg:h-4 lg:w-4" />, label: t('emailMarketing') },
  ];

  return (
    <>
      {/* Desktop/Tablet - Grid centrato con wrapping - max 5 per row */}
      <div className="hidden sm:grid sm:grid-cols-5 gap-2 md:gap-3 p-2 bg-muted/40 rounded-lg mb-6 place-items-center">
        {tabs.map(tab => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab(tab.value)}
            className={`gap-1.5 md:gap-2 px-3 py-2 transition-all w-full max-w-[180px] ${
              activeTab === tab.value 
                ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                : 'hover:bg-primary/20 hover:text-primary'
            }`}
          >
            {tab.icon}
            <span className="text-[11px] md:text-xs truncate">{tab.label}</span>
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
