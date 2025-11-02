import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, FileText, Mail, MessageSquare, Home, Palette, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FooterSettings from "./FooterSettings/FooterSettingsMain";
import HomepageSettings from "./HomepageSettings/HomepageSettingsMain";
import ChatSettings from "./ChatSettings/ChatSettingsMain";
import SEOSettings from "./SEOSettings/SEOSettingsMain";

const SiteSettingsHub = () => {
  const { t, language } = useLanguage();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "footer",
      icon: Settings,
      title: language === 'pl' ? 'Ustawienia Stopki' : 'Footer Settings',
      description: language === 'pl' 
        ? 'Zarządzaj ikonami społecznościowymi, informacjami kontaktowymi i dokumentami prawnymi' 
        : 'Manage social icons, contact information, and legal documents',
      itemsCount: 12,
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: "chat",
      icon: MessageSquare,
      title: language === 'pl' ? 'Ustawienia Live Chat' : 'Live Chat Settings',
      description: language === 'pl'
        ? 'Zarządzaj automatycznymi odpowiedziami bota czatu'
        : 'Manage automatic chat bot responses',
      itemsCount: 7,
      color: "from-indigo-500/20 to-purple-500/20",
      comingSoon: false,
    },
    {
      id: "header",
      icon: Palette,
      title: language === 'pl' ? 'Ustawienia Nagłówka' : 'Header Settings',
      description: language === 'pl'
        ? 'Dostosuj logo, nawigację i wygląd nagłówka'
        : 'Customize logo, navigation, and header appearance',
      itemsCount: 6,
      color: "from-purple-500/20 to-pink-500/20",
      comingSoon: true,
    },
    {
      id: "homepage",
      icon: Home,
      title: language === 'pl' ? 'Ustawienia Strony Głównej' : 'Homepage Settings',
      description: language === 'pl'
        ? 'Edytuj sekcję hero, cechy produktów i testimoniale'
        : 'Edit hero section, product features, and testimonials',
      itemsCount: 8,
      color: "from-green-500/20 to-emerald-500/20",
      comingSoon: false,
    },
    {
      id: "seo",
      icon: Search,
      title: language === 'pl' ? 'Ustawienia SEO' : 'SEO Settings',
      description: language === 'pl'
        ? 'Zarządzaj meta tagami, tytułami i opisami dla wszystkich stron'
        : 'Manage meta tags, titles, and descriptions for all pages',
      itemsCount: 6,
      color: "from-orange-500/20 to-red-500/20",
      comingSoon: false,
    },
  ];

  if (selectedSection === "footer") {
    return (
      <div>
        <FooterSettings onBack={() => setSelectedSection(null)} />
      </div>
    );
  }

  if (selectedSection === "chat") {
    return (
      <div>
        <ChatSettings onBack={() => setSelectedSection(null)} />
      </div>
    );
  }

  if (selectedSection === "homepage") {
    return (
      <div>
        <HomepageSettings onBack={() => setSelectedSection(null)} />
      </div>
    );
  }

  if (selectedSection === "seo") {
    return (
      <div>
        <SEOSettings onBack={() => setSelectedSection(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-playfair font-bold text-foreground mb-4">
          {language === 'pl' ? 'Ustawienia Strony' : 'Site Settings'}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          {language === 'pl'
            ? 'Zarządzaj każdym aspektem swojej strony z jednego miejsca'
            : 'Manage every aspect of your site from one place'}
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card
              key={section.id}
              className={`group cursor-pointer border-2 transition-all duration-300 hover:shadow-luxury hover:border-primary/40 bg-gradient-to-br ${section.color} ${
                section.comingSoon ? 'opacity-60' : ''
              }`}
              onClick={() => !section.comingSoon && setSelectedSection(section.id)}
            >
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                  <IconComponent className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>

                <div>
                  <h3 className="text-xl font-playfair font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {section.itemsCount} {language === 'pl' ? 'elementów' : 'items'}
                  </Badge>
                  {section.comingSoon && (
                    <Badge className="text-xs bg-amber-500/20 text-amber-700 dark:text-amber-300">
                      {language === 'pl' ? 'Wkrótce' : 'Coming Soon'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <MessageSquare className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                {language === 'pl' ? 'Wskazówka' : 'Tip'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Zmiany wprowadzone w tych ustawieniach będą natychmiast widoczne na stronie. Zawsze możesz wrócić i edytować je w dowolnym momencie.'
                  : 'Changes made in these settings will be immediately visible on the site. You can always come back and edit them at any time.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteSettingsHub;