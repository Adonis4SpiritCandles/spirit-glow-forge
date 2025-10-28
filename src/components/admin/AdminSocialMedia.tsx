import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Instagram, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  type: 'image' | 'video';
  media_url: string;
  embed_url?: string;
  external_link?: string;
  caption?: string;
  is_active: boolean;
  display_order: number;
}

interface SortableItemProps {
  post: SocialPost;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onUpdate: (post: SocialPost) => void;
}

const SortableItem = ({ post, onDelete, onToggle, onUpdate }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: post.id });
  const { language } = useLanguage();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4">
      <div className="flex items-start gap-4">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-2">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="flex-shrink-0">
          {post.type === 'image' ? (
            <img src={post.media_url} alt="Post preview" className="w-20 h-20 object-cover rounded" />
          ) : (
            <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
              <Instagram className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
              {post.platform}
            </span>
            <span className="text-xs text-muted-foreground">
              {post.type === 'image' ? '📷' : '🎥'} {post.type}
            </span>
          </div>
          
          {post.caption && (
            <p className="text-sm text-muted-foreground line-clamp-2">{post.caption}</p>
          )}
          
          {post.external_link && (
            <a
              href={post.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              {language === 'pl' ? 'Otwórz link' : 'Open link'}
            </a>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {post.is_active ? (language === 'pl' ? 'Aktywny' : 'Active') : (language === 'pl' ? 'Nieaktywny' : 'Inactive')}
            </span>
            <Switch
              checked={post.is_active}
              onCheckedChange={(checked) => onToggle(post.id, checked)}
            />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(post.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const AdminSocialMedia = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [embedUrl, setEmbedUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [caption, setCaption] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .order('display_order', { ascending: true });

    if (!error && data) {
      setPosts(data as SocialPost[]);
    }
    setLoading(false);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((p) => p.id === active.id);
      const newIndex = posts.findIndex((p) => p.id === over.id);

      const newPosts = arrayMove(posts, oldIndex, newIndex);
      
      // Update display_order for all posts
      const updates = newPosts.map((post, index) => ({
        id: post.id,
        display_order: index,
      }));

      setPosts(newPosts);

      // Update in database
      for (const update of updates) {
        await supabase
          .from('social_posts')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast({
        title: language === 'pl' ? 'Kolejność zaktualizowana' : 'Order updated',
      });
    }
  };

  const handleAddPost = async () => {
    if (!mediaUrl) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'URL mediów jest wymagany' : 'Media URL is required',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('social_posts').insert({
      platform,
      type,
      media_url: mediaUrl,
      embed_url: embedUrl || null,
      external_link: externalLink || null,
      caption: caption || null,
      display_order: posts.length,
      is_active: true,
    });

    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'pl' ? 'Post dodany' : 'Post added',
      });
      
      // Reset form
      setMediaUrl('');
      setEmbedUrl('');
      setExternalLink('');
      setCaption('');
      setShowAddForm(false);
      
      loadPosts();
    }
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase.from('social_posts').delete().eq('id', id);

    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: language === 'pl' ? 'Post usunięty' : 'Post deleted',
      });
      loadPosts();
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const { error } = await supabase
      .from('social_posts')
      .update({ is_active: isActive })
      .eq('id', id);

    if (error) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      loadPosts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === 'pl' ? 'Zarządzanie Social Media' : 'Social Media Management'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'pl' 
              ? 'Zarządzaj postami Instagram i TikTok wyświetlanymi na stronie głównej'
              : 'Manage Instagram and TikTok posts displayed on the homepage'}
          </p>
        </div>
        
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          {language === 'pl' ? 'Dodaj Post' : 'Add Post'}
        </Button>
      </div>

      {/* Add Post Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>{language === 'pl' ? 'Nowy Post' : 'New Post'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Platforma' : 'Platform'}</Label>
                <Select value={platform} onValueChange={(v: any) => setPlatform(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Typ' : 'Type'}</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">{language === 'pl' ? 'Zdjęcie' : 'Image'}</SelectItem>
                    <SelectItem value="video">{language === 'pl' ? 'Wideo' : 'Video'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{language === 'pl' ? 'URL Mediów (wymagany)' : 'Media URL (required)'}</Label>
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {type === 'video' && (
              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Embed URL (opcjonalny)' : 'Embed URL (optional)'}</Label>
                <Input
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Link Zewnętrzny (opcjonalny)' : 'External Link (optional)'}</Label>
              <Input
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Opis (opcjonalny)' : 'Caption (optional)'}</Label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={language === 'pl' ? 'Dodaj opis...' : 'Add caption...'}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddPost}>
                {language === 'pl' ? 'Dodaj' : 'Add'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              {language === 'pl' ? 'Brak postów. Dodaj pierwszy!' : 'No posts yet. Add your first one!'}
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={posts.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              {posts.map((post) => (
                <SortableItem
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  onToggle={handleToggleActive}
                  onUpdate={(updated) => {
                    setPosts(posts.map((p) => (p.id === updated.id ? updated : p)));
                  }}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
};

export default AdminSocialMedia;
