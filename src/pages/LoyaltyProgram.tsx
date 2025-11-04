import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Trophy, Gift, Star, TrendingUp, Award, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Confetti from "react-confetti";
import { useNavigate } from "react-router-dom";
import SEOManager from "@/components/SEO/SEOManager";
import { getFullUrl, generateAlternateUrls } from "@/utils/seoUtils";

interface LoyaltyData {
  points: number;
  lifetime_points: number;
  tier: string;
}

interface Reward {
  id: string;
  name: { en: string; pl: string };
  description: { en: string; pl: string };
  pointsCost: number;
  icon: any;
  color: string;
}

const LoyaltyProgram = () => {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(true);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const tiers = [
    { name: "bronze", min: 0, max: 499, color: "from-amber-700 to-amber-900", icon: Star },
    { name: "silver", min: 500, max: 1499, color: "from-gray-400 to-gray-600", icon: Award },
    { name: "gold", min: 1500, max: 2999, color: "from-yellow-400 to-yellow-600", icon: Trophy },
    { name: "platinum", min: 3000, max: Infinity, color: "from-cyan-400 to-blue-600", icon: Zap },
  ];

  const rewards: Reward[] = [
    {
      id: "discount-10",
      name: { en: "10% Off Coupon", pl: "Kupon 10% Zniżki" },
      description: { en: "Save 10% on your next order", pl: "Zaoszczędź 10% przy następnym zamówieniu" },
      pointsCost: 500,
      icon: Gift,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "free-shipping",
      name: { en: "Free Shipping", pl: "Darmowa Dostawa" },
      description: { en: "Get free shipping on any order", pl: "Uzyskaj darmową dostawę przy każdym zamówieniu" },
      pointsCost: 300,
      icon: TrendingUp,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "discount-20",
      name: { en: "20% Off Coupon", pl: "Kupon 20% Zniżki" },
      description: { en: "Save 20% on your next order", pl: "Zaoszczędź 20% przy następnym zamówieniu" },
      pointsCost: 1000,
      icon: Gift,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "free-candle",
      name: { en: "Free Candle", pl: "Darmowa Świeca" },
      description: { en: "Get a free candle of your choice", pl: "Otrzymaj darmową świecę do wyboru" },
      pointsCost: 1500,
      icon: Award,
      color: "from-amber-500 to-orange-500",
    },
  ];

  useEffect(() => {
    if (user) {
      loadLoyaltyData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadLoyaltyData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("loyalty_points")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error loading loyalty data:", error);
    } else if (data) {
      setLoyaltyData(data);
    } else {
      // Create initial loyalty record
      const { data: newData } = await supabase
        .from("loyalty_points")
        .insert({ user_id: user.id, points: 0, lifetime_points: 0, tier: "bronze" })
        .select()
        .single();
      
      if (newData) setLoyaltyData(newData);
    }
    
    setLoading(false);
  };

  const handleRedeemReward = async (reward: Reward) => {
    if (!loyaltyData || loyaltyData.points < reward.pointsCost) {
      toast.error(language === 'pl'
        ? 'Nie masz wystarczającej liczby punktów!'
        : 'You don\'t have enough points!');
      return;
    }

    // Deduct points
    const newPoints = loyaltyData.points - reward.pointsCost;
    const { error } = await supabase
      .from("loyalty_points")
      .update({ points: newPoints })
      .eq("user_id", user?.id);

    if (error) {
      toast.error(language === 'pl' ? 'Wystąpił błąd' : 'An error occurred');
    } else {
      setLoyaltyData({ ...loyaltyData, points: newPoints });
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      toast.success(language === 'pl'
        ? `Wykorzystano nagrodę: ${reward.name.pl}!`
        : `Redeemed: ${reward.name.en}!`);
    }
  };

  const getCurrentTier = () => {
    if (!loyaltyData) return tiers[0];
    return tiers.find(t => t.name === loyaltyData.tier) || tiers[0];
  };

  const getNextTier = () => {
    const currentTierIndex = tiers.findIndex(t => t.name === loyaltyData?.tier);
    return currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
  };

  const getTierProgress = () => {
    if (!loyaltyData) return 0;
    const currentTier = getCurrentTier();
    const nextTier = getNextTier();
    
    if (!nextTier) return 100;
    
    const progress = ((loyaltyData.lifetime_points - currentTier.min) / (nextTier.min - currentTier.min)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  if (!user) {
    return (
      <>
        <SEOManager
          title={language === 'pl' ? 'Program Lojalnościowy' : 'Loyalty Program'}
          description={language === 'en'
            ? 'Join SPIRIT CANDLES Loyalty Program. Earn points, unlock exclusive rewards, and enjoy special benefits with every purchase.'
            : 'Dołącz do Programu Lojalnościowego SPIRIT CANDLES. Zdobywaj punkty, odblokowuj ekskluzywne nagrody i ciesz się specjalnymi korzyściami przy każdym zakupie.'}
          url={getFullUrl('/loyalty', language)}
          alternateUrls={generateAlternateUrls('/loyalty')}
        />
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background py-20">
        <div className="container mx-auto px-4 text-center">
          <Trophy className="w-20 h-20 mx-auto mb-6 text-primary" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            {language === 'pl' ? 'Program Lojalnościowy' : 'Loyalty Program'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'pl'
              ? 'Zaloguj się, aby zobaczyć swoje punkty i nagrody'
              : 'Please log in to view your points and rewards'}
          </p>
          <Button onClick={() => navigate('/auth')}>
            {language === 'pl' ? 'Zaloguj Się' : 'Log In'}
          </Button>
        </div>
      </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SEOManager
          title={language === 'pl' ? 'Program Lojalnościowy' : 'Loyalty Program'}
          description={language === 'en'
            ? 'Join SPIRIT CANDLES Loyalty Program. Earn points, unlock exclusive rewards, and enjoy special benefits with every purchase.'
            : 'Dołącz do Programu Lojalnościowego SPIRIT CANDLES. Zdobywaj punkty, odblokowuj ekskluzywne nagrody i ciesz się specjalnymi korzyściami przy każdym zakupie.'}
          url={getFullUrl('/loyalty', language)}
          alternateUrls={generateAlternateUrls('/loyalty')}
        />
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background py-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</p>
          </div>
        </div>
      </>
    );
  }

  const currentTier = getCurrentTier();
  const nextTier = getNextTier();
  const tierProgress = getTierProgress();

  return (
    <>
      <SEOManager
        title={language === 'pl' ? 'Program Lojalnościowy' : 'Loyalty Program'}
        description={language === 'en'
          ? 'Join SPIRIT CANDLES Loyalty Program. Earn points, unlock exclusive rewards, and enjoy special benefits with every purchase.'
          : 'Dołącz do Programu Lojalnościowego SPIRIT CANDLES. Zdobywaj punkty, odblokowuj ekskluzywne nagrody i ciesz się specjalnymi korzyściami przy każdym zakupie.'}
        url={getFullUrl('/loyalty', language)}
        alternateUrls={generateAlternateUrls('/loyalty')}
      />
      <div ref={ref} className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background py-20">
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} />}
      
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {language === 'pl' ? 'Program Lojalnościowy' : 'Loyalty Program'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {language === 'pl'
              ? 'Zdobywaj punkty za zakupy i wymieniaj je na ekskluzywne nagrody'
              : 'Earn points with every purchase and redeem them for exclusive rewards'}
          </p>
        </motion.div>

        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className={`mb-8 bg-gradient-to-br ${currentTier.color} border-0 text-white`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-white/80 mb-2">
                    {language === 'pl' ? 'Twoje SpiritPoints' : 'Your SpiritPoints'}
                  </p>
                  <motion.h2
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-5xl font-bold"
                  >
                    {loyaltyData?.points || 0}
                  </motion.h2>
                </div>
                <currentTier.icon className="w-20 h-20 opacity-50" />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Badge className="bg-white/20 text-white border-0 capitalize">
                    {currentTier.name} {language === 'pl' ? 'Poziom' : 'Tier'}
                  </Badge>
                  {nextTier && (
                    <span className="text-sm text-white/80">
                      {loyaltyData?.lifetime_points || 0} / {nextTier.min} {language === 'pl' ? 'pkt' : 'pts'}
                    </span>
                  )}
                </div>
                <Progress value={tierProgress} className="h-2 bg-white/20" />
                {nextTier && (
                  <p className="text-sm text-white/80 mt-2">
                    {language === 'pl'
                      ? `${nextTier.min - (loyaltyData?.lifetime_points || 0)} punktów do następnego poziomu`
                      : `${nextTier.min - (loyaltyData?.lifetime_points || 0)} points to next tier`}
                  </p>
                )}
              </div>

              <p className="text-sm text-white/60">
                {language === 'pl' ? 'SpiritPoints Życiowe:' : 'Lifetime SpiritPoints:'} {loyaltyData?.lifetime_points || 0}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* How to Earn Points */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {language === 'pl' ? 'Jak Zdobywać SpiritPoints' : 'How to Earn SpiritPoints'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: Gift, title: { en: "Every Purchase", pl: "Każdy Zakup" }, points: "1 PLN = 1 pt" },
              { icon: Star, title: { en: "Write Review", pl: "Napisz Recenzję" }, points: "+50 pts" },
              { icon: TrendingUp, title: { en: "Refer a Friend", pl: "Poleć Znajomemu" }, points: "+200 pts" },
            ].map((item, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardContent className="p-6 text-center">
                  <item.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2 text-foreground">{item.title[language]}</h3>
                  <p className="text-2xl font-bold text-primary">{item.points}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Rewards Catalog */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            {language === 'pl' ? 'Katalog Nagród' : 'Rewards Catalog'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${reward.color} flex items-center justify-center`}>
                        <reward.icon className="w-6 h-6 text-white" />
                      </div>
                      <Badge className="bg-primary/20 text-primary border-0">
                        {reward.pointsCost} {language === 'pl' ? 'pkt' : 'pts'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{reward.name[language]}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{reward.description[language]}</p>
                    <Button
                      onClick={() => handleRedeemReward(reward)}
                      disabled={!loyaltyData || loyaltyData.points < reward.pointsCost}
                      className="w-full bg-gradient-to-r from-primary to-accent"
                    >
                      {language === 'pl' ? 'Wykorzystaj' : 'Redeem'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      </div>
    </>
  );
};

export default LoyaltyProgram;
