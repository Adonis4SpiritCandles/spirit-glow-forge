import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Video, Type, Sparkles, MessageSquare, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import HeroVideoManager from "./HeroVideoManager";
import HeroTextEditor from "./HeroTextEditor";
import FeaturesEditor from "./FeaturesEditor";
import TestimonialsManager from "./TestimonialsManager";
import NewsletterManager from "./NewsletterManager";

interface HomepageSettingsMainProps {
  onBack: () => void;
}

const HomepageSettingsMain = ({ onBack }: HomepageSettingsMainProps) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("hero-video");

  const tabs = [
    {
      id: "hero-video",
      icon: Video,
      label: language === 'pl' ? 'Wideo Hero' : 'Hero Video',
    },
    {
      id: "hero-text",
      icon: Type,
      label: language === 'pl' ? 'Tekst Hero' : 'Hero Text',
    },
    {
      id: "features",
      icon: Sparkles,
      label: language === 'pl' ? 'Funkcje' : 'Features',
    },
    {
      id: "testimonials",
      icon: MessageSquare,
      label: language === 'pl' ? 'Opinie' : 'Testimonials',
    },
    {
      id: "newsletter",
      icon: Mail,
      label: 'Newsletter',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'pl' ? 'Powrót' : 'Back'}
        </Button>
        <div>
          <h2 className="text-2xl font-playfair font-bold">
            {language === 'pl' ? 'Ustawienia Strony Głównej' : 'Homepage Settings'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'pl'
              ? 'Zarządzaj wideo hero, tekstem, funkcjami i nie tylko'
              : 'Manage hero video, text, features, and more'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="hero-video">
            <HeroVideoManager />
          </TabsContent>

          <TabsContent value="hero-text">
            <HeroTextEditor />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesEditor />
          </TabsContent>

          <TabsContent value="testimonials">
            <TestimonialsManager />
          </TabsContent>

          <TabsContent value="newsletter">
            <NewsletterManager />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default HomepageSettingsMain;
