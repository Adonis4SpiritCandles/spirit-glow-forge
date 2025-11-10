import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, Trash2, Package, MessageCircle, Gift, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useSwipeable } from 'react-swipeable';

interface Notification {
  id: string;
  user_id: string;
  type: 'order' | 'tracking' | 'message' | 'referral' | 'general';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface NotificationCenterProps {
  isBurgerMenu?: boolean;
  onNotificationClick?: () => void;
}

export default function NotificationCenter({ isBurgerMenu = false, onNotificationClick }: NotificationCenterProps = {}) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedAll, setSelectedAll] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const cleanup = subscribeToNotifications();
      return () => cleanup && cleanup();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Base app notifications
      const { data: baseNotifs, error: baseErr } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (baseErr) throw baseErr;

      // Social/profile notifications (comments, replies, likes)
      const { data: socialNotifs, error: socialErr } = await supabase
        .from('profile_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      if (socialErr) throw socialErr;

      // Map social notifications into unified shape
      const mappedSocial = (socialNotifs as any[] || []).map((n) => ({
        id: `pn_${n.id}`,
        user_id: n.user_id,
        type: 'message' as const,
        title: language === 'pl' ? 'Wiadomość społeczności' : 'Social activity',
        message:
          n.type === 'comment'
            ? (language === 'pl' ? 'Nowy komentarz na Twoim profilu' : 'New comment on your profile')
            : n.type === 'reply'
            ? (language === 'pl' ? 'Nowa odpowiedź do Twojego komentarza' : 'New reply to your comment')
            : (language === 'pl' ? 'Nowe polubienie Twojego komentarza' : 'New like on your comment'),
        read: n.read,
        created_at: n.created_at,
        action_url:
          n.type === 'comment' || n.type === 'reply'
            ? `/profile/${n.profile_user_id}`
            : undefined,
      }));

      const merged = [
        ...((baseNotifs as any[]) || []),
        ...mappedSocial,
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setNotifications(merged as any);
      setUnreadCount(merged.filter((n: any) => !n.read).length || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    if (!user) return;

    const channelBase = supabase
      .channel(`notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadNotifications();
      })
      .subscribe();

    const channelSocial = supabase
      .channel(`profile_notifications_${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'profile_notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        loadNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelBase);
      supabase.removeChannel(channelSocial);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(language === 'pl' ? 'Tutte le notifiche segnate come lette' : 'All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success(language === 'pl' ? 'Powiadomienie usunięte' : 'Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;

    try {
      await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      setNotifications([]);
      setUnreadCount(0);
      setSelectedAll(false);
      toast.success(language === 'pl' ? 'Wszystkie powiadomienia usunięte' : 'All notifications deleted');
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      toast.error(language === 'pl' ? 'Błąd usuwania powiadomień' : 'Error deleting notifications');
    }
  };

  const handleSelectAll = () => {
    setSelectedAll(!selectedAll);
  };

  const handleMarkRead = async () => {
    await markAllAsRead();
    setSelectedAll(false);
  };

  const handleDeleteAll = async () => {
    if (confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć wszystkie powiadomienia?' : 'Are you sure you want to delete all notifications?')) {
      await deleteAllNotifications();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order':
      case 'tracking':
        return <Package className="h-4 w-4" />;
      case 'message':
        return <MessageCircle className="h-4 w-4" />;
      case 'referral':
        return <Gift className="h-4 w-4" />;
      case 'general':
        return <Bell className="h-4 w-4" />;
      default:
        console.warn('Unknown notification type:', type);
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  // Swipe gesture handlers (mobile only)
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    },
    trackMouse: false,
    trackTouch: true,
  });

  return (
    isBurgerMenu ? (
      <div 
        className={`flex items-center gap-2 rounded-xl border border-destructive/30 bg-background/60 px-4 py-3 hover:bg-destructive/10 transition hover:border-destructive/50 cursor-pointer font-normal text-[15px] relative ${unreadCount > 0 ? 'animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}
        onClick={() => {
          setIsOpen(true);
          onNotificationClick?.();
        }}
      >
        <Bell className="h-5 w-5 text-destructive" />
        <span className="text-destructive">{language === 'pl' ? 'Powiadomienia' : 'Notifications'}</span>
        {unreadCount > 0 && (
          <Badge className="ml-auto bg-destructive text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </div>
    ) : (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent 
        className="w-full sm:max-w-lg overflow-y-auto"
        {...swipeHandlers}
      >

        <SheetHeader className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <SheetTitle className="text-2xl">
              {language === 'pl' ? 'Powiadomienia' : 'Notifications'}
            </SheetTitle>
          </div>

          {/* New Select All / Mark Read / Delete Section */}
          {notifications.length > 0 && (
            <div className="flex flex-col gap-3 py-3 border-b border-border">
              {/* Select All Button - Centered */}
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                  className="gap-2"
                >
                  <Check className="h-4 w-4" />
                  {language === 'pl' ? 'Zaznacz wszystkie' : 'Select All'}
                </Button>
              </div>

              {/* Mark Read & Delete Buttons */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleMarkRead}
                  disabled={!selectedAll}
                  className="gap-2 bg-[#D4AF37] hover:bg-[#B8941F] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4" />
                  {language === 'pl' ? 'Oznacz przeczytane' : 'Mark Read'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteAll}
                  disabled={!selectedAll}
                  className="gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">
              {language === 'pl' ? 'Wszystkie' : 'All'}
            </TabsTrigger>
            <TabsTrigger value="order">
              {language === 'pl' ? 'Zamówienia' : 'Orders'}
            </TabsTrigger>
            <TabsTrigger value="message">
              {language === 'pl' ? 'Wiadomości' : 'Messages'}
            </TabsTrigger>
            <TabsTrigger value="referral">
              {language === 'pl' ? 'Polecenia' : 'Referral'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-2">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>{language === 'pl' ? 'Brak powiadomień' : 'No notifications'}</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    notification.read ? 'bg-background' : 'bg-primary/5 border-primary/20'
                  } hover:bg-accent/50 transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary/10'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {(() => {
                              const d = new Date(notification.created_at);
                              return isNaN(d.getTime()) ? '' : format(d, 'PPp');
                            })()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {notification.action_url && (
                        <Button
                          variant="link"
                          size="sm"
                          className="px-0 mt-2 h-auto"
                          onClick={() => window.location.href = notification.action_url!}
                        >
                          {language === 'pl' ? 'Zobacz' : 'View'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
    )
  );
}
