import { useState } from 'react';
import { motion } from 'framer-motion';
import { Parallax } from 'react-parallax';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Palette, Tag, Heart, Send } from 'lucide-react';
import SEOManager from '@/components/SEO/SEOManager';
import candleWax from '@/assets/candle-wax.png';

const CustomCandles = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fragrance: '',
    customFragrance: '',
    labelText: '',
    message: '',
    quantity: 1,
    email: user?.email || '',
    name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() : ''
  });

  const fragrances = [
    'Vanilla Dream',
    'Lavender Fields',
    'Ocean Breeze',
    'Sandalwood Musk',
    'Citrus Burst',
    'Rose Garden',
    'Custom Fragrance (Describe below)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: language === 'pl' ? 'Wymagane logowanie' : 'Login Required',
        description: language === 'pl' 
          ? 'Musisz być zalogowany, aby wysłać zapytanie.' 
          : 'You must be logged in to send a request.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { error } = await supabase.functions.invoke('send-custom-request', {
        body: { ...formData, language }
      });

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Zapytanie wysłane!' : 'Request Sent!',
        description: language === 'pl' 
          ? 'Skontaktujemy się z Tobą w ciągu 24-72 godzin z ofertą.' 
          : 'We will contact you within 24-72 hours with a quote.',
      });
      
      // Reset form
      setFormData({
        fragrance: '',
        customFragrance: '',
        labelText: '',
        message: '',
        quantity: 1,
        email: user?.email || '',
        name: user ? `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() : ''
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: language === 'pl' 
          ? 'Nie udało się wysłać zapytania. Spróbuj ponownie.' 
          : 'Failed to send request. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <>
      <SEOManager
        title={language === 'en' ? 'Custom Candles | SPIRIT CANDLES' : 'Personalizowane Świece | SPIRIT CANDLES'}
        description={language === 'en'
          ? 'Create your own personalized candle with custom label and fragrance of your choice. Perfect as a unique gift or for yourself.'
          : 'Stwórz swoją własną spersonalizowaną świecę z niestandardową etykietą i wybranym zapachem. Idealna jako unikalny prezent lub dla siebie.'}
        keywords={language === 'en'
          ? 'custom candles, personalized candles, custom fragrance candles, custom label candles, personalized gifts'
          : 'personalizowane świece, świece na zamówienie, świece z własnym zapachem, świece z własną etykietą, spersonalizowane prezenty'}
      />

      {/* Hero Section con Parallax */}
      <Parallax
        blur={0}
        bgImage={candleWax}
        strength={300}
        className="relative"
      >
        <div className="min-h-[50vh] flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 text-center px-4 max-w-4xl mx-auto"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-playfair font-bold text-white mb-6">
              {language === 'pl' ? 'Twoja Unikalna Świeca' : 'Your Unique Candle'}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-4">
              {language === 'pl' 
                ? 'Stwórz świecę idealną dla siebie lub jako wyjątkowy prezent'
                : 'Create the perfect candle for yourself or as a unique gift'}
            </p>
            <div className="flex gap-2 md:gap-3 justify-center items-center text-primary text-[10px] sm:text-xs md:text-sm flex-wrap">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
              <span className="whitespace-nowrap">{language === 'pl' ? '100% Wosk Sojowy' : '100% Soy Wax'}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{language === 'pl' ? 'Ręcznie Robione' : 'Handcrafted'}</span>
              <span>•</span>
              <span className="whitespace-nowrap">{language === 'pl' ? 'Personalizowane' : 'Personalized'}</span>
              <Sparkles className="h-4 w-4 md:h-5 md:w-5 animate-pulse" />
            </div>
          </motion.div>
        </div>
      </Parallax>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Palette className="h-6 w-6 text-primary" />
                  {language === 'pl' ? 'Czym jest personalizacja?' : 'What is Customization?'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  {language === 'pl'
                    ? 'Nasza usługa personalizacji pozwala stworzyć unikalną świecę dopasowaną do Twoich preferencji:'
                    : 'Our customization service allows you to create a unique candle tailored to your preferences:'}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                    <div className="flex-1">
                      <strong className="text-foreground">
                        {language === 'pl' ? 'Wybierz zapach:' : 'Choose Fragrance:'}
                      </strong>
                      {' '}
                      {language === 'pl'
                        ? 'Z naszej kolekcji lub stwórz własny unikalny aromat'
                        : 'From our collection or create your own unique scent'}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                    <div className="flex-1">
                      <strong className="text-foreground">
                        {language === 'pl' ? 'Personalizowana etykieta:' : 'Custom Label:'}
                      </strong>
                      {' '}
                      {language === 'pl'
                        ? 'Dodaj imię, dedykację lub specjalną wiadomość'
                        : 'Add a name, dedication, or special message'}
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                    <div className="flex-1">
                      <strong className="text-foreground">
                        {language === 'pl' ? 'Prezent idealny:' : 'Perfect Gift:'}
                      </strong>
                      {' '}
                      {language === 'pl'
                        ? 'Idealna na urodziny, rocznicę lub każdą specjalną okazję'
                        : 'Perfect for birthdays, anniversaries, or any special occasion'}
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
                  <Heart className="h-5 w-5 text-primary" />
                  {language === 'pl' ? 'Gwarancja Jakości' : 'Quality Guarantee'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>✓ {language === 'pl' ? '100% naturalny wosk sojowy' : '100% natural soy wax'}</p>
                <p>✓ {language === 'pl' ? 'Wysokiej jakości olejki zapachowe' : 'High-quality fragrance oils'}</p>
                <p>✓ {language === 'pl' ? 'Ręcznie robione z pasją' : 'Handcrafted with passion'}</p>
                <p>✓ {language === 'pl' ? 'Bezpieczne spalanie do 45 godzin' : 'Safe burning up to 45 hours'}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="shadow-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl md:text-2xl">
                  <Tag className="h-6 w-6 text-primary" />
                  {language === 'pl' ? 'Zaprojektuj Swoją Świecę' : 'Design Your Candle'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Fragrance Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="fragrance">
                      {language === 'pl' ? 'Wybierz zapach' : 'Choose Fragrance'} *
                    </Label>
                    <Select
                      value={formData.fragrance}
                      onValueChange={(value) => setFormData({ ...formData, fragrance: value })}
                      required
                    >
                      <SelectTrigger id="fragrance">
                        <SelectValue placeholder={language === 'pl' ? 'Wybierz...' : 'Select...'} />
                      </SelectTrigger>
                      <SelectContent>
                        {fragrances.map((frag) => (
                          <SelectItem key={frag} value={frag}>
                            {frag}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Custom Fragrance Description */}
                  {formData.fragrance === 'Custom Fragrance (Describe below)' && (
                    <div className="space-y-2">
                      <Label htmlFor="customFragrance">
                        {language === 'pl' ? 'Opisz swój wymarzony zapach' : 'Describe your dream fragrance'}
                      </Label>
                      <Textarea
                        id="customFragrance"
                        value={formData.customFragrance}
                        onChange={(e) => setFormData({ ...formData, customFragrance: e.target.value })}
                        placeholder={language === 'pl'
                          ? 'np. "Połączenie wanilii, lawendy i nuty cytrusowej..."'
                          : 'e.g., "A blend of vanilla, lavender, and citrus notes..."'}
                        rows={3}
                      />
                    </div>
                  )}

                  {/* Label Text */}
                  <div className="space-y-2">
                    <Label htmlFor="labelText">
                      {language === 'pl' ? 'Tekst na etykiecie' : 'Label Text'}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({language === 'pl' ? 'Opcjonalne' : 'Optional'})
                      </span>
                    </Label>
                    <Input
                      id="labelText"
                      value={formData.labelText}
                      onChange={(e) => setFormData({ ...formData, labelText: e.target.value })}
                      placeholder={language === 'pl' ? 'np. "Z miłością dla Mamy"' : 'e.g., "With Love for Mom"'}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.labelText.length}/50 {language === 'pl' ? 'znaków' : 'characters'}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      {language === 'pl' ? 'Ilość' : 'Quantity'} *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      required
                    />
                  </div>

                  {/* Additional Message */}
                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {language === 'pl' ? 'Dodatkowe uwagi' : 'Additional Notes'}
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={language === 'pl'
                        ? 'Podziel się dodatkowymi pomysłami lub pytaniami...'
                        : 'Share any additional ideas or questions...'}
                      rows={4}
                    />
                  </div>

                  {/* Contact Info (se non loggato) */}
                  {!user && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {language === 'pl' ? 'Imię i nazwisko' : 'Full Name'} *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {language === 'pl' ? 'Wyślij zapytanie' : 'Send Request'}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'pl'
                      ? 'Skontaktujemy się z Tobą w ciągu 24-72 godzin z ofertą i szczegółami płatności.'
                      : 'We will contact you within 24-72 hours with a quote and payment details.'}
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default CustomCandles;
