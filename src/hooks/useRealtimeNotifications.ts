import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Orders channel - track order status changes
    const ordersChannel = supabase
      .channel(`user_orders_${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const order = payload.new as any;
        const oldOrder = payload.old as any;
        
        // Only notify on status changes
        if (order.status !== oldOrder.status) {
          if (order.status === 'shipped') {
            toast.success(
              language === 'pl' ? 'Il tuo ordine è stato spedito!' : 'Your order has been shipped!',
              {
                description: `${language === 'pl' ? 'Ordine' : 'Order'} #${order.order_number}`,
                action: {
                  label: language === 'pl' ? 'Visualizza' : 'View',
                  onClick: () => window.location.href = '/dashboard'
                },
                duration: 8000
              }
            );
          } else if (order.status === 'delivered') {
            toast.success(
              language === 'pl' ? 'Il tuo ordine è stato consegnato!' : 'Your order has been delivered!',
              {
                description: `${language === 'pl' ? 'Ordine' : 'Order'} #${order.order_number}`,
                action: {
                  label: language === 'pl' ? 'Lascia una recensione' : 'Leave a review',
                  onClick: () => window.location.href = '/dashboard'
                },
                duration: 10000
              }
            );
          } else if (order.status === 'cancelled') {
            toast.error(
              language === 'pl' ? 'Il tuo ordine è stato cancellato' : 'Your order has been cancelled',
              {
                description: `${language === 'pl' ? 'Ordine' : 'Order'} #${order.order_number}`,
                duration: 8000
              }
            );
          }
        }
      })
      .subscribe();

    channelsRef.current.push(ordersChannel);

    // Tracking updates channel
    const trackingChannel = supabase
      .channel(`user_tracking_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'order_tracking'
      }, async (payload) => {
        const tracking = payload.new as any;
        
        // Check if this tracking belongs to user's order
        const { data: order } = await supabase
          .from('orders')
          .select('order_number, user_id')
          .eq('id', tracking.order_id)
          .single();

        if (order && order.user_id === user.id) {
          toast.info(
            language === 'pl' ? 'Nuovo aggiornamento tracking!' : 'New tracking update!',
            {
              description: `${language === 'pl' ? 'Ordine' : 'Order'} #${order.order_number}`,
              action: {
                label: language === 'pl' ? 'Traccia' : 'Track',
                onClick: () => window.location.href = '/dashboard'
              },
              duration: 8000
            }
          );
        }
      })
      .subscribe();

    channelsRef.current.push(trackingChannel);

    // Notifications channel - general notifications
    const notificationsChannel = supabase
      .channel(`user_notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const notification = payload.new as any;
        console.debug('[Realtime] New notification:', notification);
        
        toast.info(notification.title, {
          description: notification.message,
          duration: 6000
        });
      })
      .subscribe();

    channelsRef.current.push(notificationsChannel);

    // Cleanup function
    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [user, language]);
}

export function useAdminRealtimeNotifications() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const channelsRef = useRef<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Check if user is admin
    const checkAdmin = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (profile?.role === 'admin') {
        setupAdminChannels();
      }
    };

    const setupAdminChannels = () => {
      // New orders channel
      const ordersChannel = supabase
        .channel('admin_new_orders')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          const order = payload.new as any;
          console.debug('[Admin Realtime] New order:', order);
          
          toast.success(
            language === 'pl' ? 'Nuovo ordine ricevuto!' : 'New order received!',
            {
              description: `${language === 'pl' ? 'Ordine' : 'Order'} #${order.order_number} - ${order.total_pln.toFixed(2)} PLN`,
              action: {
                label: language === 'pl' ? 'Gestisci' : 'Manage',
                onClick: () => window.location.href = '/admin'
              },
              duration: 10000
            }
          );
        })
        .subscribe();

      channelsRef.current.push(ordersChannel);

      // Contact form submissions
      const contactChannel = supabase
        .channel('admin_contact_forms')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'contact_submissions'
        }, (payload) => {
          const submission = payload.new as any;
          
          toast.info(
            language === 'pl' ? 'Nuova richiesta di contatto' : 'New contact request',
            {
              description: submission.subject,
              duration: 8000
            }
          );
        })
        .subscribe();

      channelsRef.current.push(contactChannel);
    };

    checkAdmin();

    return () => {
      channelsRef.current.forEach(channel => {
        supabase.removeChannel(channel);
      });
      channelsRef.current = [];
    };
  }, [user, language]);
}
