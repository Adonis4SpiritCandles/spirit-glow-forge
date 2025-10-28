import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useReferral = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    
    if (ref && ref.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Valid UUID format
      localStorage.setItem('referral_id', ref);
      localStorage.setItem('referral_timestamp', Date.now().toString());
      
      toast({
        title: '🎁 Referral Link Activated!',
        description: 'Sign up now to claim your welcome bonus!',
      });
    }
  }, [searchParams]);

  const getReferralId = (): string | null => {
    const ref = localStorage.getItem('referral_id');
    const timestamp = localStorage.getItem('referral_timestamp');
    
    // Expire referral after 30 days
    if (ref && timestamp) {
      const age = Date.now() - parseInt(timestamp);
      if (age > 30 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('referral_id');
        localStorage.removeItem('referral_timestamp');
        return null;
      }
      return ref;
    }
    return null;
  };

  const clearReferral = () => {
    localStorage.removeItem('referral_id');
    localStorage.removeItem('referral_timestamp');
  };

  return { getReferralId, clearReferral };
};
