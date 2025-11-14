import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Confetti from "react-confetti";

const NewsletterSignup = () => {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [gdprConsent, setGdprConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sectionVisible, setSectionVisible] = useState(true);

  useEffect(() => {
    loadVisibilitySettings();
  }, []);

  const loadVisibilitySettings = async () => {
    try {
      // Check newsletter_settings.is_active
      const { data: newsletterSettings } = await supabase
        .from('newsletter_settings')
        .select('is_active')
        .single();

      // Check email_marketing_settings.show_newsletter_section_homepage
      const { data: emailMarketingSettings } = await supabase
        .from('email_marketing_settings')
        .select('show_newsletter_section_homepage')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .single();

      const newsletterActive = newsletterSettings?.is_active ?? true;
      const emailMarketingVisible = emailMarketingSettings?.show_newsletter_section_homepage ?? true;
      
      setSectionVisible(newsletterActive && emailMarketingVisible);
    } catch (error) {
      console.error('Error loading newsletter visibility settings:', error);
    }
  };

  if (!sectionVisible) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !gdprConsent) {
      toast.error(language === 'pl' 
        ? 'Wprowadź email i zaakceptuj politykę prywatności'
        : 'Please enter your email and accept the privacy policy');
      return;
    }

    setIsLoading(true);

    try {
      // Call new newsletter-subscribe function with double opt-in
      const { data, error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { 
          email,
          name: name || null,
          language: language,
          source: 'footer',
          consent: gdprConsent,
          consent_text: language === 'pl'
            ? 'Zgadzam się na otrzymywanie newslettera i akceptuję politykę prywatności.'
            : 'I agree to receive the newsletter and accept the privacy policy.',
          ip: null,
          ua: navigator.userAgent
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      toast.success(language === 'pl'
        ? 'Sprawdź swoją skrzynkę mailową, aby potwierdzić subskrypcję!'
        : 'Check your email to confirm your subscription!');
      
      // Reset form
      setEmail("");
      setName("");
      setGdprConsent(false);
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error(language === 'pl'
        ? 'Wystąpił błąd. Spróbuj ponownie.'
        : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={ref} className="py-20 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 relative overflow-hidden">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
        />
      )}

      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl"
        >
          {!isSuccess ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-center mb-8"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  {language === 'pl' ? 'Dołącz Do Naszej Społeczności' : 'Join Our Community'}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {language === 'pl'
                    ? 'Zapisz się i otrzymaj 10% zniżki na pierwsze zamówienie!'
                    : 'Subscribe and get 10% off your first order!'}
                </p>
              </motion.div>

              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="space-y-4"
              >
                <div>
                  <Input
                    type="email"
                    placeholder={language === 'pl' ? 'Twój adres email' : 'Your email address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>

                <div>
                  <Input
                    type="text"
                    placeholder={language === 'pl' ? 'Imię (opcjonalnie)' : 'Name (optional)'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 bg-background/50 border-border/50 focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="gdpr"
                    checked={gdprConsent}
                    onCheckedChange={(checked) => setGdprConsent(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="gdpr" className="text-sm text-muted-foreground cursor-pointer">
                    {language === 'pl'
                      ? 'Zgadzam się na otrzymywanie newslettera i akceptuję politykę prywatności. Mogę się wypisać w każdej chwili.'
                      : 'I agree to receive the newsletter and accept the privacy policy. I can unsubscribe at any time.'}
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !gdprConsent}
                  className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'pl' ? 'Zapisywanie...' : 'Subscribing...'}
                    </>
                  ) : (
                    language === 'pl' ? 'Zapisz Się Teraz' : 'Subscribe Now'
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {language === 'pl'
                    ? 'Nie spamujemy! Możesz się wypisać w każdej chwili.'
                    : 'We don\'t spam! Unsubscribe at any time.'}
                </p>
              </motion.form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-foreground">
                {language === 'pl' ? 'Dziękujemy!' : 'Thank You!'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {language === 'pl'
                  ? 'Sprawdź swoją skrzynkę email i kliknij link potwierdzający, aby otrzymać kod rabatowy 10%!'
                  : 'Check your email and click the confirmation link to receive your 10% discount code!'}
              </p>
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="hover:bg-primary/10"
              >
                {language === 'pl' ? 'Zapisz Kolejną Osobę' : 'Subscribe Another'}
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
