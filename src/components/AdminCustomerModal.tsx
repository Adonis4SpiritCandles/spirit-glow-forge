import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDistanceToNow } from 'date-fns';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  role: string;
  created_at: string;
}

interface AdminCustomerModalProps {
  customer: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

const AdminCustomerModal = ({ customer, isOpen, onClose }: AdminCustomerModalProps) => {
  const { t } = useLanguage();

  if (!customer) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">
            {t('customerDetails')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t('name')}</label>
            <p className="text-foreground">
              {customer.first_name || customer.last_name 
                ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim()
                : 'Not provided'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t('email')}</label>
            <p className="text-foreground">{customer.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Username</label>
            <p className="text-foreground">{customer.username || 'Not set'}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">{t('status')}</label>
            <div className="mt-1">
              <Badge variant={customer.role === 'admin' ? 'destructive' : 'default'}>
                {customer.role}
              </Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Member since</label>
            <p className="text-foreground">
              {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminCustomerModal;