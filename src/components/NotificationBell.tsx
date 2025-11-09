import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Notification {
  id: string;
  type: 'comment' | 'reply' | 'like' | 'rating';
  profile_user_id: string;
  comment_id: string;
  actor_id: string;
  read: boolean;
  created_at: string;
  actor_profile?: {
    first_name: string;
    last_name: string;
    username: string;
    profile_image_url: string;
  };
}

export default function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    loadNotifications();

    // Real-time subscription for new notifications
    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profile_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('profile_notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      // Load actor profiles
      const actorIds = data.map((n) => n.actor_id);
      const { data: profiles } = await supabase
        .from('public_profile_directory')
        .select('*')
        .in('user_id', actorIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      const notificationsWithProfiles = data.map((n) => ({
        ...n,
        type: n.type as 'comment' | 'reply' | 'like' | 'rating',
        actor_profile: profileMap.get(n.actor_id),
      }));

      setNotifications(notificationsWithProfiles as Notification[]);
      setUnreadCount(data.filter((n) => !n.read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('profile_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    loadNotifications();
  };

  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profile_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (!error) {
      loadNotifications();
      toast({
        title: language === 'pl' ? 'Oznaczono' : 'Marked',
        description: language === 'pl'
          ? 'Wszystkie notyfikacje oznaczone jako przeczytane'
          : 'All notifications marked as read',
      });
    }
  };

  const deleteSingle = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const { error } = await supabase
      .from('profile_notifications')
      .delete()
      .eq('id', notificationId);

    if (!error) {
      loadNotifications();
      toast({
        title: language === 'pl' ? 'Usunięto' : 'Deleted',
        description: language === 'pl' ? 'Notyfikacja usunięta' : 'Notification deleted',
      });
    }
  };

  const deleteAll = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profile_notifications')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      loadNotifications();
      toast({
        title: language === 'pl' ? 'Usunięto' : 'Deleted',
        description: language === 'pl'
          ? 'Wszystkie notyfikacje usunięte'
          : 'All notifications deleted',
      });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Verify profile exists before navigation
    const { data: profileExists } = await supabase
      .from('public_profile_directory')
      .select('user_id')
      .eq('user_id', notification.profile_user_id)
      .single();

    if (!profileExists) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl'
          ? 'Profil nie został znaleziony'
          : 'Profile not found',
        variant: 'destructive',
      });
      await markAsRead(notification.id);
      return;
    }

    await markAsRead(notification.id);
    navigate(`/profile/${notification.profile_user_id}`);
    setOpen(false);
  };

  const getNotificationText = (notification: Notification) => {
    const actor = notification.actor_profile;
    const name = actor?.first_name
      ? `${actor.first_name} ${actor.last_name || ''}`
      : actor?.username || 'Someone';

    switch (notification.type) {
      case 'comment':
        return language === 'pl' 
          ? `${name} skomentował Twój profil`
          : `${name} commented on your profile`;
      case 'reply':
        return language === 'pl'
          ? `${name} odpowiedział na Twój komentarz`
          : `${name} replied to your comment`;
      case 'like':
        return language === 'pl'
          ? `${name} polubił Twój komentarz`
          : `${name} liked your comment`;
      case 'rating':
        return language === 'pl'
          ? `${name} ocenił Twój komentarz`
          : `${name} rated your comment`;
      default:
        return language === 'pl' ? 'Nowe powiadomienie' : 'New notification';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        {/* Header with action buttons */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold">
            {language === 'pl' ? 'Powiadomienia' : 'Notifications'}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={markAllAsRead}
              >
                {language === 'pl' ? 'Oznacz wszystkie' : 'Mark all read'}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={deleteAll}
              >
                {language === 'pl' ? 'Usuń wszystkie' : 'Delete all'}
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              {language === 'pl' ? 'Brak powiadomień' : 'No notifications yet'}
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`group relative p-3 cursor-pointer transition-colors ${
                  !notification.read
                    ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary'
                    : 'hover:bg-accent/20'
                }`}
              >
                <div
                  onClick={() => handleNotificationClick(notification)}
                  className="flex flex-col gap-1.5 pr-8"
                >
                  <p className="text-sm">{getNotificationText(notification)}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => deleteSingle(notification.id, e)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
