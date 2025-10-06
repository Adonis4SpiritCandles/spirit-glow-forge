import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";

const Contact = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "info",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-primary" />,
      title: t('emailUs'),
      details: "m5moffice@proton.me",
      description: t('sendUsQuestionsAnytime')
    },
    {
      icon: <Phone className="w-5 h-5 text-primary" />,
      title: t('callUs'),
      details: "+48 729877557",
      description: t('monFri9to18CET')
    },
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      title: t('visitUs'),
      details: "87-100 Toruń (PL)",
      description: "M5Moffice"
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: t('responseTime'),
      details: "24-48 hours",
      description: t('weAimToRespondQuickly')
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: t('missingInformation'),
        description: t('pleaseFillRequired'),
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare email with category in subject
      const categoryLabel = language === 'pl' ? 
        (formData.category === 'info' ? 'Informacje' :
         formData.category === 'generic' ? 'Ogólne' :
         formData.category === 'order' ? 'Zamówienie' :
         formData.category === 'shipping' ? 'Wysyłka' : 'Inne') :
        (formData.category === 'info' ? 'Info' :
         formData.category === 'generic' ? 'Generic' :
         formData.category === 'order' ? 'Order' :
         formData.category === 'shipping' ? 'Shipping' : 'Other');
      
      const emailSubject = formData.subject ? 
        `[${categoryLabel}] ${formData.subject}` : 
        `[${categoryLabel}] New Contact Form Message`;

      const { data, error } = await supabase.functions.invoke('contact-form', {
        body: {
          ...formData,
          subject: emailSubject
        }
      });

      if (error) throw error;

      toast({
        title: t('messageSentSuccessfully'),
        description: t('thankYouContact'),
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        category: "info",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('error'),
        description: t('errorSendingMessage'),
        variant: "destructive"
      });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-mystical">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
                {t('getInTouch')}
              </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('contactIntro')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-card border-border/40 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair text-foreground">
                {t('sendUsAMessage')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      {t('name')} *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t('yourFullName')}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      {t('email')} *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t('yourEmail')}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    {t('category')} *
                  </label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">{t('categoryInfo')}</SelectItem>
                      <SelectItem value="generic">{t('categoryGeneric')}</SelectItem>
                      <SelectItem value="order">{t('categoryOrder')}</SelectItem>
                      <SelectItem value="shipping">{t('categoryShipping')}</SelectItem>
                      <SelectItem value="other">{t('categoryOther')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    {t('subject')}
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder={t('whatsThisAbout')}
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    {t('message')} *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t('tellUsHowWeCanHelp')}
                    rows={6}
                    required
                  />
                </div>

                <Button 
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-luxury hover:scale-[1.02] transition-all duration-300"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {t('sendMessage')}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-card border-border/40 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-foreground">
                  {t('contactInformation')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {info.title}
                        </h3>
                        <p className="text-primary font-medium mb-1">
                          {info.details}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Card */}
            <Card className="bg-card border-border/40 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-xl font-playfair text-foreground">
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('howLongBurn')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('burnTimeAnswer')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('areEcoFriendly')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('ecoAnswer')}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    {t('shipInternationally')}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {t('shippingAnswer')}
                  </p>
                </div>

                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link to="/faq">{t('viewAllFaqs')}</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Google Maps */}
        <Card className="mt-12 bg-card border-border/40 shadow-elegant overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-playfair text-foreground text-center">
              {t('visitUs')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full h-[400px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2405.7821!2d18.5933!3d53.0238!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47033107f3b64e15%3A0x3e0e0e0e0e0e0e0e!2sK%C4%85kolowa%203%2C%2087-100%20Toru%C5%84%2C%20Poland!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Spirit Candles Location"
              ></iframe>
            </div>
          </CardContent>
        </Card>

        {/* Business Hours */}
        <Card className="mt-12 bg-card border-border/40 shadow-elegant max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-playfair text-foreground">
              {t('customerServiceHours')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('emailSupport')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('responseTime24')}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">{t('phoneSupport')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('phoneHours')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Contact;