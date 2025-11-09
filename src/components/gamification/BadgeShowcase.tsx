import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, MessageSquare, Users, Gift, Leaf } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BadgeConfig {
  id: string;
  name: { en: string; pl: string };
  description: { en: string; pl: string };
  icon: any;
  color: string;
}

interface BadgeShowcaseProps {
  userId?: string;
  variant?: 'default' | 'mini';
}

const BadgeShowcase = ({ userId: propUserId, variant = 'default' }: BadgeShowcaseProps = {}) => {
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const { user } = useAuth();
  const { language } = useLanguage();
  
  const userId = propUserId || user?.id;

  const allBadges: BadgeConfig[] = [
    {
      id: 'first_order',
      name: { en: 'First Light', pl: 'Pierwszy Płomień' },
      description: { en: 'Made your first order', pl: 'Złożono pierwsze zamówienie' },
      icon: Trophy,
      color: 'from-yellow-500 to-amber-500',
    },
    {
      id: 'loyal_customer',
      name: { en: 'Loyal Customer', pl: 'Lojalny Klient' },
      description: { en: 'Made 5+ orders', pl: 'Złożono 5+ zamówień' },
      icon: Star,
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'super_reviewer',
      name: { en: 'Super Reviewer', pl: 'Super Recenzent' },
      description: { en: 'Left 10+ reviews', pl: 'Dodano 10+ recenzji' },
      icon: MessageSquare,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'social_butterfly',
      name: { en: 'Social Butterfly', pl: 'Motyl Społeczny' },
      description: { en: 'Referred your first friend', pl: 'Poleciłeś pierwszego znajomego' },
      icon: Users,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 'ambassador',
      name: { en: 'Ambassador', pl: 'Ambasador' },
      description: { en: 'Referred 3+ friends', pl: 'Polecono 3+ znajomych' },
      icon: Users,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'gift_giver',
      name: { en: 'Gift Giver', pl: 'Dawca Prezentów' },
      description: { en: 'Sent gifts to others', pl: 'Wysłano prezenty innym' },
      icon: Gift,
      color: 'from-rose-500 to-pink-500',
    },
    {
      id: 'eco_warrior',
      name: { en: 'Eco Warrior', pl: 'Ekowoajownik' },
      description: { en: 'Bought 10+ eco-friendly products', pl: 'Kupiono 10+ produktów eko' },
      icon: Leaf,
      color: 'from-lime-500 to-green-500',
    },
  ];

  useEffect(() => {
    if (userId) {
      loadBadges();
    }
  }, [userId]);

  const loadBadges = async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('user_badges')
      .select('badge_id')
      .eq('user_id', userId);

    if (!error && data) {
      setEarnedBadges(data.map(b => b.badge_id));
    }
  };

  if (!userId) return null;

  // Mini variant - show only earned badges as compact chips
  if (variant === 'mini') {
    const earned = allBadges.filter(badge => earnedBadges.includes(badge.id));
    
    if (earned.length === 0) {
      return (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="w-4 h-4 text-primary" />
              {language === 'pl' ? 'Odznaki' : 'Badges'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground text-center">
              {language === 'pl' ? 'Brak zdobytych odznak' : 'No badges earned yet'}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="w-4 h-4 text-primary" />
            {language === 'pl' ? 'Odznaki' : 'Badges'}
            <Badge variant="secondary" className="ml-auto text-xs">
              {earned.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
            {earned.map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                className={`relative p-2 rounded-lg bg-gradient-to-br ${badge.color} border-2 border-primary/30 shadow-sm`}
              >
                <div className="flex flex-col items-center gap-1">
                  <badge.icon className="w-4 h-4 text-white" />
                  <span className="text-[10px] font-medium text-white text-center leading-tight">
                    {badge.name[language]}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - show all badges
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          {language === 'pl' ? 'Twoje Odznaki' : 'Your Badges'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {allBadges.map((badge, index) => {
            const earned = earnedBadges.includes(badge.id);
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: earned ? 1.05 : 1 }}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  earned
                    ? 'border-primary bg-gradient-to-br ' + badge.color + ' text-white'
                    : 'border-border/50 bg-muted/50 opacity-60 grayscale'
                }`}
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <badge.icon className={`w-8 h-8 ${earned ? 'text-white' : 'text-muted-foreground'}`} />
                  <h4 className={`font-semibold text-sm ${earned ? 'text-white' : 'text-foreground'}`}>
                    {badge.name[language]}
                  </h4>
                  <p className={`text-xs ${earned ? 'text-white/80' : 'text-muted-foreground'}`}>
                    {badge.description[language]}
                  </p>
                  {earned && (
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      {language === 'pl' ? 'Zdobyte' : 'Earned'}
                    </Badge>
                  )}
                </div>
                {!earned && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <span className="text-4xl">🔒</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {language === 'pl'
            ? `Zdobyto ${earnedBadges.length} z ${allBadges.length} odznak`
            : `Earned ${earnedBadges.length} of ${allBadges.length} badges`}
        </div>
      </CardContent>
    </Card>
  );
};

export default BadgeShowcase;
