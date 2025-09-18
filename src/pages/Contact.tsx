import { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const contactInfo = [
    {
      icon: <Mail className="w-5 h-5 text-primary" />,
      title: "Email Us",
      details: "info@spiritcandles.com",
      description: "Send us your questions anytime"
    },
    {
      icon: <Phone className="w-5 h-5 text-primary" />,
      title: "Call Us",
      details: "+48 123 456 789",
      description: "Mon-Fri 9:00-18:00 CET"
    },
    {
      icon: <MapPin className="w-5 h-5 text-primary" />,
      title: "Visit Us",
      details: "Warsaw, Poland",
      description: "Luxury candle studio"
    },
    {
      icon: <Clock className="w-5 h-5 text-primary" />,
      title: "Response Time",
      details: "24-48 hours",
      description: "We aim to respond quickly"
    }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Simulate form submission
    toast({
      title: "Message Sent Successfully!",
      description: "Thank you for contacting us. We'll get back to you within 24-48 hours.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: ""
    });
  };

  return (
    <main className="min-h-screen bg-gradient-mystical">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have questions about our candles or need personalized recommendations? 
            We'd love to hear from you and help you find the perfect fragrance for your space.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="bg-card border-border/40 shadow-elegant">
            <CardHeader>
              <CardTitle className="text-2xl font-playfair text-foreground">
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input
                    id="subject"
                    name="subject"
                    type="text"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us how we can help you..."
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
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="bg-card border-border/40 shadow-elegant">
              <CardHeader>
                <CardTitle className="text-2xl font-playfair text-foreground">
                  Contact Information
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
                    How long do your candles burn?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Our 180g candles burn for approximately 45-50 hours, while our 320g candles 
                    provide 80-90 hours of beautiful fragrance.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Are your candles eco-friendly?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! We use 100% natural soy wax, wooden wicks, and recyclable glass containers. 
                    Our candles are vegan and cruelty-free.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Do you ship internationally?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Currently, we ship within Poland and to select EU countries. 
                    Contact us for specific shipping information.
                  </p>
                </div>

                <Button variant="outline" className="w-full mt-4">
                  View All FAQs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Business Hours */}
        <Card className="mt-12 bg-card border-border/40 shadow-elegant max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-playfair text-foreground">
              Customer Service Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-center">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Email Support</h4>
                <p className="text-sm text-muted-foreground">
                  24/7 - We respond within 24-48 hours
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Phone Support</h4>
                <p className="text-sm text-muted-foreground">
                  Monday - Friday: 9:00 AM - 6:00 PM CET
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