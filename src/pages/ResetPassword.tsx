import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import spiritLogo from '@/assets/spirit-logo.png';

const ResetPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Verify that there is a recovery hash in the URL
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery mode activated');
      }
    });
  }, []);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: t('error') || 'Error',
        description: t('passwordsDoNotMatch') || 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: t('error') || 'Error',
        description: t('passwordTooShort') || 'Password must be at least 8 characters',
        variant: 'destructive'
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: t('success') || 'Success',
        description: t('passwordResetSuccess') || 'Password reset successfully! Redirecting...',
      });
      
      // Redirect to home after 2 seconds
      setTimeout(() => navigate('/'), 2000);
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/40">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={spiritLogo} 
              alt="Spirit Logo" 
              className="h-24 w-24 object-contain filter brightness-0 invert candle-glow"
            />
          </div>
          <CardTitle className="font-playfair text-2xl text-foreground">
            {t('resetPassword') || 'Reset Password'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t('newPassword') || 'New Password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                className="bg-background/50 border-border/40 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder={t('confirmNewPassword') || 'Confirm New Password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-background/50 border-border/40 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (t('resetting') || 'Resetting...') : (t('resetPassword') || 'Reset Password')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
