import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Users, Gift } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

const ReferralDashboard = () => {
  const [referralLink, setReferralLink] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [copiedRecently, setCopiedRecently] = useState(false);
  const [copiedCodeRecently, setCopiedCodeRecently] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const { user } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (user) {
      generateReferralLink();
      loadReferrals();
      loadShortCode();
      loadLoyaltyPoints();
    }
  }, [user]);

  const loadLoyaltyPoints = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('loyalty_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setLoyaltyPoints(data.points || 0);
      }
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    }
  };

  const loadShortCode = async () => {
    if (!user) return;

    try {
      // Try to load existing short code
      const { data: profile } = await supabase
        .from('profiles')
        .select('referral_short_code')
        .eq('user_id', user.id)
        .single();

      if (profile?.referral_short_code) {
        setShortCode(profile.referral_short_code);
      } else {
        // Generate new short code
        const { data, error } = await supabase.functions.invoke('generate-referral-code');
        if (!error && data?.code) {
          setShortCode(data.code);
        }
      }
    } catch (error) {
      console.error('Error loading short code:', error);
    }
  };

  const generateReferralLink = () => {
    if (!user) return;
    const baseUrl = 'https://www.spirit-candle.com';
    const link = `${baseUrl}?ref=${user.id}`;
    setReferralLink(link);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shortCode);
    setCopiedCodeRecently(true);
    toast.success(language === 'pl' ? 'Kod skopiowany!' : 'Code copied!');
    setTimeout(() => setCopiedCodeRecently(false), 2000);
  };

  const loadReferrals = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', user.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setReferrals(data);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedRecently(true);
    toast.success(language === 'pl' ? 'Link skopiowany!' : 'Link copied!');
    setTimeout(() => setCopiedRecently(false), 2000);
  };

  const completedReferrals = referrals.length;
  const earnedPoints = completedReferrals * 200;
  
  // Calculate progress for various thresholds
  const nextThreshold = completedReferrals < 3 ? 3 : completedReferrals < 5 ? 5 : completedReferrals < 10 ? 10 : null;
  const progressToNextReward = nextThreshold 
    ? (completedReferrals / nextThreshold) * 100 
    : 100;

  if (!user) return null;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          {language === 'pl' ? 'Program Poleceń' : 'Referral Program'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'pl' ? 'Udane Polecenia' : 'Successful Referrals'}
            </p>
            <p className="text-3xl font-bold text-primary">{completedReferrals}</p>
          </div>
          <div className="p-4 bg-accent/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">
              {language === 'pl' ? 'Twoje SpiritPoints' : 'Your SpiritPoints'}
            </p>
            <p className="text-3xl font-bold text-accent">{loyaltyPoints.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {language === 'pl' ? `+${earnedPoints} z poleceń` : `+${earnedPoints} from referrals`}
            </p>
          </div>
        </div>

        {/* Progress to next reward */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium">
              {language === 'pl' ? 'Do Następnej Nagrody' : 'Next Reward Progress'}
            </p>
            <span className="text-sm text-muted-foreground">
              {nextThreshold ? `${completedReferrals} / ${nextThreshold}` : language === 'pl' ? 'Wszystkie odblokowane!' : 'All unlocked!'}
            </span>
          </div>
          <Progress value={progressToNextReward} className="h-2" />
          <div className="mt-3 space-y-1">
            {completedReferrals < 3 && (
              <p className="text-xs text-muted-foreground">
                {language === 'pl'
                  ? '🎯 3 polecenia: Zdobądź odznakę Referral Master'
                  : '🎯 3 referrals: Earn Referral Master badge'}
              </p>
            )}
            {completedReferrals < 5 && (
              <p className="text-xs text-muted-foreground">
                {language === 'pl'
                  ? '🎁 5 poleceń: +500 bonusowych punktów'
                  : '🎁 5 referrals: +500 bonus points'}
              </p>
            )}
            {completedReferrals < 10 && (
              <p className="text-xs text-muted-foreground">
                {language === 'pl'
                  ? '💎 10 poleceń: Kupon VIP10 (15% zniżki)'
                  : '💎 10 referrals: VIP10 coupon (15% off)'}
              </p>
            )}
            {completedReferrals >= 10 && (
              <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                {language === 'pl'
                  ? '✨ Gratulacje! Odblokowałeś wszystkie nagrody polecające!'
                  : '✨ Congratulations! You\'ve unlocked all referral rewards!'}
              </p>
            )}
          </div>
        </div>

        {/* Short Referral Code */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {language === 'pl' ? 'Twój Kod Polecający' : 'Your Referral Code'}
          </label>
          <p className="text-xs text-muted-foreground mb-2">
            {language === 'pl' 
              ? 'Udostępnij ten krótki kod osobom, które chcą się zarejestrować'
              : 'Share this short code with people who want to register'}
          </p>
          <div className="flex gap-2">
            <Input
              value={shortCode}
              readOnly
              className="flex-1 bg-muted text-center text-2xl font-mono font-bold"
            />
            <Button onClick={handleCopyCode} variant="outline" className="gap-2">
              {copiedCodeRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'pl' ? 'Skopiowano' : 'Copied'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {language === 'pl' ? 'Kopiuj' : 'Copy'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Referral link */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            {language === 'pl' ? 'Twój Link Polecający' : 'Your Referral Link'}
          </label>
          <div className="flex gap-2">
            <Input
              value={referralLink}
              readOnly
              className="flex-1 bg-muted"
            />
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="gap-2"
            >
              {copiedRecently ? (
                <>
                  <Check className="w-4 h-4" />
                  {language === 'pl' ? 'Skopiowano' : 'Copied'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {language === 'pl' ? 'Kopiuj' : 'Copy'}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Gift className="w-4 h-4 text-primary" />
            {language === 'pl' ? 'Jak To Działa' : 'How It Works'}
          </h4>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <span className="font-bold text-primary">1.</span>
              {language === 'pl'
                ? 'Udostępnij swój unikalny link znajomym'
                : 'Share your unique link with friends'}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">2.</span>
              {language === 'pl'
                ? 'Twoi znajomi otrzymują 10% zniżki na pierwsze zamówienie'
                : 'Your friends get 10% off their first order'}
            </li>
            <li className="flex gap-2">
              <span className="font-bold text-primary">3.</span>
              {language === 'pl'
                ? 'Ty otrzymujesz 200 SpiritPoints za każde udane polecenie'
                : 'You earn 200 SpiritPoints for each successful referral'}
            </li>
          </ol>
        </div>

        {/* Recent referrals */}
        {referrals.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3">
              {language === 'pl' ? 'Ostatnie Polecenia' : 'Recent Referrals'}
            </h4>
            <div className="space-y-2">
              {referrals.slice(0, 5).map((referral) => (
                <motion.div
                  key={referral.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">{referral.referee_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === 'completed'
                        ? 'bg-green-500/20 text-green-700 dark:text-green-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {referral.status === 'completed'
                      ? (language === 'pl' ? 'Ukończono' : 'Completed')
                      : (language === 'pl' ? 'Oczekuje' : 'Pending')}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReferralDashboard;
