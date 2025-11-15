import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram, Play, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import tiktokIcon from "@/assets/tiktok-watermark.png";
import instagramIcon from "@/assets/instagram-watermark.png";

interface SocialPost {
  id: string;
  platform: 'instagram' | 'tiktok';
  type: 'image' | 'video';
  media_url: string;
  preview_image_url?: string;
  embed_url?: string;
  external_link?: string;
  caption?: string;
  is_active: boolean;
  display_order: number;
}

const SocialFeed = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string, platform: string, externalLink?: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [sectionActive, setSectionActive] = useState<boolean>(true);

  useEffect(() => {
    loadSectionToggle();
    loadSettings();
    loadSocialPosts();
  }, []);

  const loadSectionToggle = async () => {
    try {
      // Load toggle from homepage_sections_toggle - accessible to all users (guests, users, admins)
      const { data, error } = await supabase
        .from('homepage_sections_toggle')
        .select('community_section_active')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (error) {
        // If error (e.g., no row found), default to true
        console.warn('Error loading community section toggle:', error);
        setSectionActive(true);
        return;
      }
      
      if (data) {
        setSectionActive(data.community_section_active ?? true);
      } else {
        // No data found, default to true
        setSectionActive(true);
      }
    } catch (error) {
      console.error('Error loading section toggle:', error);
      // Default to true if error (section will show)
      setSectionActive(true);
    }
  };

  const loadSettings = async () => {
    try {
      // Load content settings regardless of active status
      const { data } = await supabase
        .from('homepage_community_settings')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();
      
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading community settings:', error);
      // Keep default if error (section will still show)
    }
  };

  const loadSocialPosts = async () => {
    const { data, error } = await supabase
      .from('social_posts')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (!error && data) {
      setSocialPosts(data as SocialPost[]);
    }
    setLoading(false);
  };

  const filteredPosts = filter === 'all' 
    ? socialPosts 
    : socialPosts.filter(post => post.platform === filter);

  // Use settings if available, otherwise fallback to defaults
  const sectionTitle = settings?.title_en && settings?.title_pl
    ? (language === 'en' ? settings.title_en : settings.title_pl)
    : (language === 'pl' ? 'Dołącz Do Społeczności' : 'Join Our Community');
  
  const sectionSubtitle = settings?.subtitle_en && settings?.subtitle_pl
    ? (language === 'en' ? settings.subtitle_en : settings.subtitle_pl)
    : (language === 'pl'
      ? 'Zobacz jak nasi klienci tworzą magiczną atmosferę z naszymi świecami'
      : 'See how our customers create magical ambiance with our candles');

  // Don't render if section is disabled - check toggle from homepage_sections_toggle
  if (!sectionActive) {
    return null;
  }

  return (
    <section ref={ref} className="py-20 bg-gradient-to-b from-background/50 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {sectionSubtitle}
          </p>

          {/* Filter tabs */}
          <div className="flex justify-center gap-4 mb-8">
            {['all', 'instagram', 'tiktok'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab as typeof filter)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  filter === tab
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground'
                }`}
              >
                {tab === 'all' ? (language === 'pl' ? 'Wszystkie' : 'All') : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {language === 'pl' ? 'Brak postów do wyświetlenia' : 'No posts to display'}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => {
              // Use preview_image_url for videos, media_url for images
              const thumbnailUrl = post.type === 'video' 
                ? (post.preview_image_url || post.media_url) 
                : post.media_url;
              
              return (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4, delay: 0.05 * index }}
                  whileHover={{ scale: 1.05 }}
                  className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => setSelectedMedia({ type: post.type, url: post.media_url, platform: post.platform, externalLink: post.external_link })}
                >
                  {/* Watermark icon */}
                  <div className="absolute top-2 left-2 z-10">
                    <img 
                      src={post.platform === 'tiktok' ? tiktokIcon : instagramIcon}
                      alt={post.platform}
                      className="w-10 h-10 sm:w-12 sm:h-12 opacity-95 drop-shadow-2xl"
                    />
                  </div>

                  <img
                    src={thumbnailUrl}
                    alt={`${post.platform} post`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <div className="flex items-center gap-2 text-white">
                      {post.platform === 'instagram' ? (
                        <Instagram className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium capitalize">{post.platform}</span>
                    </div>
                  </div>

                  {/* Video indicator */}
                  {post.type === 'video' && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                      <Play className="w-6 h-6 text-primary fill-primary ml-1" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        )}

        {/* Follow CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground mb-4">
            {language === 'pl' ? 'Oznacz nas w swoich zdjęciach!' : 'Tag us in your photos!'}
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://instagram.com/spiritcandles"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
              @spiritcandles
            </a>
            <a
              href="https://tiktok.com/@spiritcandles"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300"
            >
              <Play className="w-5 h-5" />
              @spiritcandles
            </a>
          </div>
        </motion.div>
      </div>

      {/* Lightbox Modal - Enhanced */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[95vh] p-0 bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-3 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/30 transition-all duration-200 z-50 border border-white/20 shadow-lg"
          >
            <X className="w-6 h-6" />
          </button>
          {selectedMedia && (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-6">
              {/* Media Container - Centered */}
              <div className="relative flex items-center justify-center w-full max-h-[80vh]">
                {selectedMedia.type === 'image' ? (
                  <img
                    src={selectedMedia.url}
                    alt="Social media post"
                    className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[75vh] w-auto h-auto object-contain"
                  />
                )}
              </div>
              
              {/* External Link Button - Always show if link exists */}
              {selectedMedia.externalLink && (
                <div className="mt-6">
                  <Button
                    asChild
                    className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-xl border border-white/20 backdrop-blur-sm"
                  >
                    <a
                      href={selectedMedia.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      {selectedMedia.platform === 'tiktok' ? (
                        <>
                          <Play className="w-4 h-4" />
                          {language === 'pl' ? 'Zobacz na TikTok' : 'View on TikTok'}
                        </>
                      ) : (
                        <>
                          <Instagram className="w-4 h-4" />
                          {language === 'pl' ? 'Zobacz na Instagram' : 'View on Instagram'}
                        </>
                      )}
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SocialFeed;
