import { useState, useEffect } from 'react';
import { Heart, Flame, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface CommentReactionsProps {
  commentId: string;
}

interface Reaction {
  type: 'like' | 'love' | 'fire';
  count: number;
  userReacted: boolean;
  reactionId?: string;
}

const CommentReactions = ({ commentId }: CommentReactionsProps) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [reactions, setReactions] = useState<Reaction[]>([
    { type: 'like', count: 0, userReacted: false },
    { type: 'love', count: 0, userReacted: false },
    { type: 'fire', count: 0, userReacted: false },
  ]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    loadReactions();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel(`reactions-${commentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profile_comment_reactions',
        filter: `comment_id=eq.${commentId}`
      }, () => {
        loadReactions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [commentId, user?.id]);

  const loadReactions = async () => {
    const { data, error } = await supabase
      .from('profile_comment_reactions')
      .select('*')
      .eq('comment_id', commentId);

    if (error) {
      console.error('Error loading reactions:', error);
      return;
    }

    const reactionCounts: Record<string, { count: number; userReacted: boolean; reactionId?: string }> = {
      like: { count: 0, userReacted: false },
      love: { count: 0, userReacted: false },
      fire: { count: 0, userReacted: false },
    };

    data.forEach((reaction) => {
      reactionCounts[reaction.reaction_type].count++;
      if (user && reaction.user_id === user.id) {
        reactionCounts[reaction.reaction_type].userReacted = true;
        reactionCounts[reaction.reaction_type].reactionId = reaction.id;
      }
    });

    setReactions([
      { type: 'like', ...reactionCounts.like },
      { type: 'love', ...reactionCounts.love },
      { type: 'fire', ...reactionCounts.fire },
    ]);
  };

  const handleReaction = async (type: 'like' | 'love' | 'fire') => {
    if (!user) {
      toast({
        title: language === 'pl' ? 'Wymagane logowanie' : 'Login Required',
        description: language === 'pl' 
          ? 'Musisz być zalogowany, aby reagować na komentarze'
          : 'You must be logged in to react to comments',
        variant: 'destructive',
      });
      return;
    }

    const reaction = reactions.find(r => r.type === type);
    if (!reaction) return;

    setLoading(type);

    try {
      const { data, error } = await supabase.rpc('toggle_comment_reaction', {
        p_comment_id: commentId,
        p_type: type,
      });
      if (error) throw error;

      // Reload reactions to ensure sync
      await loadReactions();
    } catch (error: any) {
      console.error('Error toggling reaction:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl'
          ? 'Nie udało się zmienić reakcji'
          : 'Failed to toggle reaction',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return ThumbsUp;
      case 'love':
        return Heart;
      case 'fire':
        return Flame;
      default:
        return ThumbsUp;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {reactions.map((reaction) => {
        const Icon = getIcon(reaction.type);
        return (
          <Button
            key={reaction.type}
            variant="ghost"
            size="sm"
            className={`h-8 gap-1.5 transition-all duration-300 ${
              reaction.userReacted
                ? 'bg-primary/10 text-primary hover:bg-primary/20'
                : 'hover:bg-muted'
            }`}
            onClick={() => handleReaction(reaction.type)}
            disabled={loading === reaction.type}
          >
            <Icon
              className={`h-4 w-4 transition-transform ${
                reaction.userReacted ? 'scale-110' : 'scale-100'
              }`}
            />
            {reaction.count > 0 && (
              <span className="text-xs font-medium">{reaction.count}</span>
            )}
          </Button>
        );
      })}
    </div>
  );
};

export default CommentReactions;