import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface AdminEditCustomerModalProps {
  customer: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminEditCustomerModal = ({ customer, isOpen, onClose, onSuccess }: AdminEditCustomerModalProps) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: customer?.first_name || '',
    last_name: customer?.last_name || '',
    username: customer?.username || '',
    email: customer?.email || '',
    role: customer?.role || 'user'
  });

  if (!customer) return null;

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          username: formData.username,
          role: formData.role
        })
        .eq('user_id', customer.user_id);

      if (error) throw error;

      toast({
        title: t('success'),
        description: t('updating'),
      });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating customer:', error);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-playfair text-xl">
            {t('editUser')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="first_name">{t('firstName')}</Label>
            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="last_name">{t('lastName')}</Label>
            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="username">{t('username')}</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="role">{t('role')}</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">{t('user')}</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? t('updating') : t('updateUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditCustomerModal;