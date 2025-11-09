import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import spiritLogo from '@/assets/spirit-logo.png';
import { ResetPasswordModal } from '@/components/ResetPasswordModal';
import { useReferral } from '@/hooks/useReferral';
import { supabase } from '@/integrations/supabase/client';
import SEOManager from '@/components/SEO/SEOManager';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [referralCode, setReferralCode] = useState('');
  const [termsConsent, setTermsConsent] = useState(false);
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  const { user, signIn, signUp } = useAuth();
  const { t, language } = useLanguage();
  const { getReferralId, clearReferral } = useReferral();

  // Precompile referral code if available and set to Sign Up mode
  useEffect(() => {
    const refId = getReferralId();
    if (refId) {
      setReferralCode(refId);
      setIsLogin(false); // Open Sign Up tab when referral is present
    }
  }, [getReferralId]);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(emailOrUsername, password);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Fetch user profile for personalized toast
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name')
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
            .single();
          
          const userName = profile?.first_name || '';
          toast({
            title: language === 'pl' 
              ? `Witaj ponownie${userName ? `, ${userName}` : ''}! 😉`
              : `Welcome back${userName ? `, ${userName}` : ''}! 😉`,
            description: t('loginSuccessDesc'),
          });
        }
      } else {
        if (password !== confirmPassword) {
          toast({
            title: "Error",
            description: "Passwords do not match",
            variant: "destructive",
          });
          return;
        }

        if (!termsConsent) {
          toast({
            title: t('consentRequired') || "Consent Required",
            description: t('mustAcceptTerms') || "You must accept the Terms of Sale and Privacy Policy",
            variant: "destructive",
          });
          return;
        }
        
        // Validate referral code if provided
        let validatedReferralId: string | null = null;
        const referralInput = referralCode || getReferralId();
        
        if (referralInput) {
          // Check if it's a short code (8 chars) or UUID
          if (referralInput.match(/^[A-Za-z0-9]{8}$/)) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('referral_short_code', referralInput.toUpperCase())
              .single();
            
            if (!profileData) {
              toast({
                title: t('error') || "Error",
                description: language === 'pl' 
                  ? 'Nieprawidłowy kod polecający. Sprawdź kod i spróbuj ponownie.'
                  : 'Invalid referral code. Please check the code and try again.',
                variant: "destructive",
              });
              return;
            }
            validatedReferralId = profileData.user_id;
          } else if (referralInput.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('user_id')
              .eq('user_id', referralInput)
              .single();
            
            if (!profileData) {
              toast({
                title: t('error') || "Error",
                description: language === 'pl'
                  ? 'Nieprawidłowy link polecający. Sprawdź link i spróbuj ponownie.'
                  : 'Invalid referral link. Please check the link and try again.',
                variant: "destructive",
              });
              return;
            }
            validatedReferralId = referralInput;
          } else if (referralInput.trim() !== '') {
            // Invalid format
            toast({
              title: t('error') || "Error",
              description: language === 'pl'
                ? 'Nieprawidłowy format kodu polecającego.'
                : 'Invalid referral code format.',
              variant: "destructive",
            });
            return;
          }
        }
        
        const { error } = await signUp(emailOrUsername, password, firstName, lastName, username, preferredLanguage);
        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          // Send welcome email with WELCOME10 coupon
          const hasReferral = !!(referralCode || getReferralId());
          
          // Handle newsletter subscription if consented
          if (newsletterConsent) {
            try {
              await supabase.functions.invoke('newsletter-subscribe', {
                body: {
                  email: emailOrUsername,
                  name: `${firstName} ${lastName}`,
                  language: preferredLanguage,
                  source: 'registration'
                }
              });
            } catch (newsletterError) {
              console.error('Newsletter subscription error:', newsletterError);
            }
          }
          
          try {
            await supabase.functions.invoke('send-registration-welcome', {
              body: {
                userEmail: emailOrUsername,
                firstName,
                lastName,
                preferredLanguage,
                hasReferral
              }
            });
            console.log('Welcome email sent successfully');
          } catch (emailErr) {
            console.error('Failed to send welcome email:', emailErr);
          }

          // Handle referral if validated
          if (validatedReferralId) {
            setTimeout(async () => {
              try {
                const { data: userData } = await supabase.auth.getUser();
                if (userData.user) {
                  // Call centralized confirm-referral edge function
                  await supabase.functions.invoke('confirm-referral', {
                    body: {
                      referee_id: userData.user.id,
                      referral_code_or_id: validatedReferralId,
                      preferredLanguage,
                      refereeEmail: emailOrUsername,
                      refereeName: `${firstName} ${lastName}`
                    }
                  });
                  console.log('Referral confirmed via edge function');
                  clearReferral();
                }
              } catch (err) {
                console.error('Referral processing error:', err);
              }
            }, 1000);
          }

          toast({
            title: "Success!",
            description: "Please check your email to verify your account.",
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEOManager
        title={isLogin ? (language === 'en' ? 'Sign In' : 'Zaloguj się') : (language === 'en' ? 'Sign Up' : 'Zarejestruj się')}
        description={language === 'en'
          ? 'Sign in or create an account to access your SPIRIT CANDLES profile, track orders, and enjoy exclusive benefits.'
          : 'Zaloguj się lub utwórz konto, aby uzyskać dostęp do profilu SPIRIT CANDLES, śledzić zamówienia i korzystać z ekskluzywnych korzyści.'}
        noindex={true}
        nofollow={true}
      />
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur-sm border-border/40">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={spiritLogo} 
              alt="Spirit Logo" 
              className="h-40 w-40 md:h-48 md:w-48 object-contain filter brightness-0 invert"
              style={{
                filter: 'brightness(0) invert(1) drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))',
                animation: 'glow-soft 4s ease-in-out infinite'
              }}
            />
          </div>
          <CardTitle className="font-playfair text-2xl text-foreground">
            {isLogin ? t('signIn') : t('signUp')}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isLogin ? (language === 'pl' ? 'Witamy ponownie w Spirit of Candles' : 'Welcome back to Spirit of Candles') : (language === 'pl' ? 'Dołącz do rodziny Spirit of Candles' : 'Join the Spirit of Candles family')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="text"
                    placeholder={t('firstName')}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-background/50 border-border/40"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder={t('lastName')}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-background/50 border-border/40"
                  />
                </div>
              </div>
            )}
            
            {!isLogin && (
              <div>
                <Input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-background/50 border-border/40"
                />
              </div>
            )}
            
            <div>
              <Input
                type={isLogin ? "text" : "email"}
                placeholder={isLogin ? "Email or Username" : t('email')}
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={t('password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-background/50 border-border/40 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {isLogin && (
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto text-sm text-primary"
                  onClick={() => setShowResetPassword(true)}
                >
                  {t('forgotPassword') || 'Forgot Password?'}
                </Button>
              </div>
            )}
            
            {!isLogin && (
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t('confirmPassword')}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-background/50 border-border/40 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            )}
            
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="site-language">{language === 'pl' ? 'Język Witryny' : 'Website Language'}</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger id="site-language" className="bg-background/50 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pl">Polski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-language">{language === 'pl' ? 'Język Emaili' : 'Email Language'}</Label>
                  <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                    <SelectTrigger id="email-language" className="bg-background/50 border-border/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pl">Polski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="referral">
                  {language === 'pl' ? 'Kod Linku Polecającego / Kod (Opcjonalnie)' : 'Referral Link Code / Code (Optional)'}
                </Label>
                <Input
                  id="referral"
                  type="text"
                  placeholder={language === 'pl' ? 'Wprowadź kod linku lub krótki kod' : 'Enter link code or short code'}
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="bg-background/50 border-border/40"
                />
                {referralCode && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      🎁 {language === 'pl' ? 'Otrzymasz 100 Bonus SpiritPoints!' : 'You\'ll receive 100 Bonus SpiritPoints!'}
                    </p>
                    <p className="text-xs text-primary font-semibold">
                      {language === 'pl' ? 'Plus 10% zniżki na pierwsze zamówienie!' : 'Plus 10% discount on your first order!'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms-consent"
                    checked={termsConsent}
                    onCheckedChange={(checked) => setTermsConsent(checked as boolean)}
                    required
                  />
                  <Label htmlFor="terms-consent" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    {t('iAccept')} <Link to="/terms-of-sale" className="text-primary hover:underline">{t('termsOfSale')}</Link> {t('and')} <Link to="/privacy-policy" className="text-primary hover:underline">{t('privacyPolicy')}</Link> *
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="newsletter-consent-auth"
                    checked={newsletterConsent}
                    onCheckedChange={(checked) => setNewsletterConsent(checked as boolean)}
                  />
                  <Label htmlFor="newsletter-consent-auth" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                    {t('newsletterOptIn')}
                  </Label>
                </div>
              </div>
            )}
            
            {isLogin && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                  {t('rememberMe')}
                </Label>
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? t('loading') : (isLogin ? t('signIn') : t('signUp'))}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {isLogin ? t('dontHaveAccount') : t('alreadyHaveAccount')}
              <Button
                variant="link"
                className="p-0 ml-1 text-primary"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? t('signUp') : t('signIn')}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
      
      <ResetPasswordModal 
        isOpen={showResetPassword} 
        onClose={() => setShowResetPassword(false)} 
      />
      </div>
    </>
  );
};

export default Auth;
