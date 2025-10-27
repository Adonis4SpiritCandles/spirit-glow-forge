import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export const useAdminNotifications = () => {
  const { user } = useAuth();
  const [unseenCount, setUnseenCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasCheckedInitial, setHasCheckedInitial] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setHasCheckedInitial(true);
        return;
      }

      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const adminRole = data?.role === 'admin';
      setIsAdmin(adminRole);
      setHasCheckedInitial(true);

      if (adminRole) {
        loadUnseenCount();
      }
    };

    checkAdminRole();
  }, [user]);

  // Load unseen orders count - only paid orders
  const loadUnseenCount = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .is('deleted_at', null)
        .eq('admin_seen', false)
        .eq('status', 'paid');

      if (error) throw error;

      const count = data?.length || 0;
      setUnseenCount(count);
      
      return count;
    } catch (error) {
      console.error('Error loading unseen count:', error);
      return 0;
    }
  };

  // Setup realtime subscription for new paid orders
  useEffect(() => {
    if (!isAdmin || !hasCheckedInitial) return;

    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order notification:', payload);
          // Only increment if the new order is in 'paid' status
          if (payload.new && payload.new.status === 'paid') {
            setUnseenCount(prev => prev + 1);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAdmin, hasCheckedInitial]);

  // Mark orders as seen
  const markOrdersAsSeen = async (orderIds?: string[]) => {
    try {
      let query = supabase
        .from('orders')
        .update({ admin_seen: true });

      if (orderIds && orderIds.length > 0) {
        query = query.in('id', orderIds);
      } else {
        query = query.eq('admin_seen', false);
      }

      const { error } = await query;
      if (error) throw error;

      loadUnseenCount();
    } catch (error) {
      console.error('Error marking orders as seen:', error);
    }
  };

  return {
    unseenCount,
    isAdmin,
    hasCheckedInitial,
    loadUnseenCount,
    markOrdersAsSeen,
  };
};
