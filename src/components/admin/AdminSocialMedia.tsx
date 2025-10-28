import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, ExternalLink, Edit2, Upload } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import tiktokLogo from '@/assets/tiktok-title.png';
import instagramLogo from '@/assets/instagram-title.png';
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
  preview_image_url?: string;
  embed_url?: string;
  external_link?: string;
  caption?: string;
  caption_en?: string;
  caption_pl?: string;
  is_active: boolean;
  display_order: number;
}

interface SortableItemProps {
  post: SocialPost;
  onDelete: (id: string) => void;
  onToggle: (id: string, isActive: boolean) => void;
  onEdit: (post: SocialPost) => void;
}

const SortableItem = ({ post, onDelete, onToggle, onEdit }: SortableItemProps) => {
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
          ) : post.preview_image_url ? (
            <img src={post.preview_image_url} alt="Video preview" className="w-20 h-20 object-cover rounded" />
          ) : (
            <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
              <span className="text-2xl">🎥</span>
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <img 
              src={post.platform === 'tiktok' ? tiktokLogo : instagramLogo} 
              alt={post.platform}
              className="h-6 w-auto object-contain"
            />
            <span className="text-xs font-bold uppercase px-2 py-1 bg-secondary/50 rounded">
              {post.type}
            </span>
          </div>
          
          {(post.caption_en || post.caption_pl) && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {language === 'pl' ? post.caption_pl : post.caption_en}
            </p>
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
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(post)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
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
    </div>
  );
};

const AdminSocialMedia = () => {
  const { language } = useLanguage();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<SocialPost | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [embedUrl, setEmbedUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [captionEn, setCaptionEn] = useState('');
  const [captionPl, setCaptionPl] = useState('');

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

  const resetForm = () => {
    setPlatform('instagram');
    setType('image');
    setMediaUrl('');
    setMediaFile(null);
    setPreviewImageUrl('');
    setPreviewImageFile(null);
    setEmbedUrl('');
    setExternalLink('');
    setCaptionEn('');
    setCaptionPl('');
    setEditingPost(null);
  };

  const handleEdit = (post: SocialPost) => {
    setEditingPost(post);
    setPlatform(post.platform);
    setType(post.type);
    setMediaUrl(post.media_url);
    setPreviewImageUrl(post.preview_image_url || '');
    setEmbedUrl(post.embed_url || '');
    setExternalLink(post.external_link || '');
    setCaptionEn(post.caption_en || '');
    setCaptionPl(post.caption_pl || '');
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `social_media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd uploadu' : 'Upload error',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = posts.findIndex((p) => p.id === active.id);
      const newIndex = posts.findIndex((p) => p.id === over.id);

      const newPosts = arrayMove(posts, oldIndex, newIndex);
      
      const updates = newPosts.map((post, index) => ({
        id: post.id,
        display_order: index,
      }));

      setPosts(newPosts);

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

  const handleSubmit = async () => {
    let finalMediaUrl = mediaUrl;
    let finalPreviewImageUrl = previewImageUrl;

    // Handle file uploads
    if (mediaFile) {
      const uploadedUrl = await handleFileUpload(mediaFile);
      if (!uploadedUrl) return;
      finalMediaUrl = uploadedUrl;
    }

    if (previewImageFile) {
      const uploadedUrl = await handleFileUpload(previewImageFile);
      if (!uploadedUrl) return;
      finalPreviewImageUrl = uploadedUrl;
    }

    if (!finalMediaUrl) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'URL mediów lub plik jest wymagany' : 'Media URL or file is required',
        variant: 'destructive',
      });
      return;
    }

    // Validate preview image for videos
    if (type === 'video' && !finalPreviewImageUrl) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' ? 'Obraz podglądu jest wymagany dla filmów' : 'Preview image is required for videos',
        variant: 'destructive',
      });
      return;
    }

    const postData = {
      platform,
      type,
      media_url: finalMediaUrl,
      preview_image_url: finalPreviewImageUrl || null,
      embed_url: embedUrl || null,
      external_link: externalLink || null,
      caption_en: captionEn || null,
      caption_pl: captionPl || null,
      is_active: true,
    };

    if (editingPost) {
      // Update existing post
      const { error } = await supabase
        .from('social_posts')
        .update(postData)
        .eq('id', editingPost.id);

      if (error) {
        toast({
          title: language === 'pl' ? 'Błąd' : 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: language === 'pl' ? 'Post zaktualizowany' : 'Post updated',
        });
        setIsDialogOpen(false);
        resetForm();
        loadPosts();
      }
    } else {
      // Add new post
      const { error } = await supabase.from('social_posts').insert({
        ...postData,
        display_order: posts.length,
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
        setIsDialogOpen(false);
        resetForm();
        loadPosts();
      }
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm(language === 'pl' ? 'Czy na pewno chcesz usunąć ten post?' : 'Are you sure you want to delete this post?')) {
      return;
    }

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
          <p className="text-muted-foreground text-sm">
            {language === 'pl' 
              ? 'Zarządzaj postami Instagram i TikTok wyświetlanymi na stronie głównej'
              : 'Manage Instagram and TikTok posts displayed on the homepage'}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {language === 'pl' ? 'Dodaj Post' : 'Add Post'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPost 
                  ? (language === 'pl' ? 'Edytuj Post' : 'Edit Post')
                  : (language === 'pl' ? 'Nowy Post' : 'New Post')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                      <SelectItem value="image">
                        <span className="font-bold uppercase">IMAGE</span>
                      </SelectItem>
                      <SelectItem value="video">
                        <span className="font-bold uppercase">VIDEO</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Upload Plik' : 'Upload File'}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept={type === 'image' ? 'image/*' : 'video/*'}
                    onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Upload className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {language === 'pl' ? 'Lub podaj URL poniżej' : 'Or provide URL below'}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'URL Mediów' : 'Media URL'}</Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              {type === 'video' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-red-500">
                      {language === 'pl' ? 'Obraz Podglądu (Wymagany dla wideo) *' : 'Preview Image (Required for videos) *'}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setPreviewImageFile(e.target.files?.[0] || null)}
                        className="flex-1"
                      />
                      <Upload className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {language === 'pl' ? 'Lub podaj URL obrazu podglądu poniżej' : 'Or provide preview image URL below'}
                    </p>
                    <Input
                      value={previewImageUrl}
                      onChange={(e) => setPreviewImageUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'pl' ? 'Embed URL (opcjonalny)' : 'Embed URL (optional)'}</Label>
                    <Input
                      value={embedUrl}
                      onChange={(e) => setEmbedUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                </>
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
                <Label>{language === 'pl' ? 'Opis (EN)' : 'Caption (EN)'}</Label>
                <Textarea
                  value={captionEn}
                  onChange={(e) => setCaptionEn(e.target.value)}
                  placeholder="Add caption in English..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>{language === 'pl' ? 'Opis (PL)' : 'Caption (PL)'}</Label>
                <Textarea
                  value={captionPl}
                  onChange={(e) => setCaptionPl(e.target.value)}
                  placeholder="Dodaj opis po polsku..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? (language === 'pl' ? 'Uploading...' : 'Uploading...') : 
                   editingPost ? (language === 'pl' ? 'Zaktualizuj' : 'Update') : 
                   (language === 'pl' ? 'Dodaj' : 'Add')}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {language === 'pl' ? 'Anuluj' : 'Cancel'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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
                  onEdit={handleEdit}
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
