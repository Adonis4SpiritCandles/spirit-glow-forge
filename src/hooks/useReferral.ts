import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export const useReferral = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref');
    
    if (ref) {
      // Check if it's a UUID
      if (ref.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        localStorage.setItem('referral_id', ref);
        localStorage.setItem('referral_timestamp', Date.now().toString());
      } 
      // Check if it's an 8-character short code
      else if (ref.match(/^[A-Za-z0-9]{8}$/)) {
        // Convert short code to UUID
        supabase
          .from('profiles')
          .select('user_id')
          .eq('referral_short_code', ref)
          .single()
          .then(({ data }) => {
            if (data?.user_id) {
              localStorage.setItem('referral_id', data.user_id);
              localStorage.setItem('referral_timestamp', Date.now().toString());
            }
          });
      }
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
