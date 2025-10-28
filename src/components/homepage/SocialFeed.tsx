import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Instagram, Play, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SocialFeed = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string, platform: string } | null>(null);
  const [filter, setFilter] = useState<'all' | 'instagram' | 'tiktok'>('all');

  // Sample data - sostituire con dati reali o API
  const socialPosts = [
    {
      id: 1,
      type: 'image' as const,
      platform: 'instagram',
      url: 'https://images.unsplash.com/photo-1602874801006-c2b8e1f8da95?w=500&h=500&fit=crop',
      link: 'https://instagram.com',
    },
    {
      id: 2,
      type: 'video' as const,
      platform: 'tiktok',
      url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=500&h=500&fit=crop',
      embedUrl: 'https://www.tiktok.com/embed/v2/7234567890123456789',
      link: 'https://tiktok.com',
    },
    {
      id: 3,
      type: 'image' as const,
      platform: 'instagram',
      url: 'https://images.unsplash.com/photo-1599899103623-bf207f6e26bc?w=500&h=500&fit=crop',
      link: 'https://instagram.com',
    },
    {
      id: 4,
      type: 'image' as const,
      platform: 'instagram',
      url: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=500&h=500&fit=crop',
      link: 'https://instagram.com',
    },
    {
      id: 5,
      type: 'video' as const,
      platform: 'tiktok',
      url: 'https://images.unsplash.com/photo-1608173488508-877f558bd5cc?w=500&h=500&fit=crop',
      embedUrl: 'https://www.tiktok.com/embed/v2/7234567890123456790',
      link: 'https://tiktok.com',
    },
    {
      id: 6,
      type: 'image' as const,
      platform: 'instagram',
      url: 'https://images.unsplash.com/photo-1615486511262-2fec2c9d7b4e?w=500&h=500&fit=crop',
      link: 'https://instagram.com',
    },
  ];

  const filteredPosts = filter === 'all' 
    ? socialPosts 
    : socialPosts.filter(post => post.platform === filter);

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
            {language === 'pl' ? 'Dołącz Do Społeczności' : 'Join Our Community'}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            {language === 'pl'
              ? 'Zobacz jak nasi klienci tworzą magiczną atmosferę z naszymi świecami'
              : 'See how our customers create magical ambiance with our candles'}
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

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          <AnimatePresence mode="popLayout">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4, delay: 0.05 * index }}
                whileHover={{ scale: 1.05 }}
                className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => setSelectedMedia({ type: post.type, url: post.url, platform: post.platform })}
              >
                <img
                  src={post.url}
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
            ))}
          </AnimatePresence>
        </div>

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

      {/* Lightbox Modal */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          <button
            onClick={() => setSelectedMedia(null)}
            className="absolute -top-12 right-0 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {selectedMedia && (
            <div className="relative">
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Social media post"
                  className="w-full h-auto rounded-lg"
                />
              ) : (
                <div className="aspect-video bg-black rounded-lg">
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full h-full rounded-lg"
                  />
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
