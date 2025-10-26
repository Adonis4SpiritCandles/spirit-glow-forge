import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetPasswordModal = ({ isOpen, onClose }: ResetPasswordModalProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: t('error') || 'Error',
        description: t('emailRequired') || 'Email is required',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      toast({
        title: t('emailSent') || 'Email Sent',
        description: t('checkEmailForResetLink') || 'Check your email for the password reset link',
      });
      
      onClose();
      setEmail('');
    } catch (error: any) {
      toast({
        title: t('error') || 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('resetPassword') || 'Reset Password'}</DialogTitle>
          <DialogDescription>
            {t('resetPasswordDescription') || 'Enter your email and we\'ll send you a reset link'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder={t('email') || 'Email'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
          />
          <div className="flex gap-2">
            <Button onClick={handleResetPassword} disabled={loading} className="flex-1">
              {loading ? (t('sending') || 'Sending...') : (t('sendResetLink') || 'Send Reset Link')}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t('cancel') || 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
