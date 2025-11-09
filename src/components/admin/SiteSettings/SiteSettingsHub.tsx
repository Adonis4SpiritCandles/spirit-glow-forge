import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageSquare, 
  Mail, 
  ChevronRight, 
  Settings, 
  Home, 
  Search,
  FileText,
  Sparkles,
  Gift,
  PenTool,
  Menu
} from 'lucide-react';

// Import sub-settings components
import FooterSettings from './FooterSettings/FooterSettingsMain';
import ChatSettings from './ChatSettings/ChatSettingsMain';
import HomepageSettings from './HomepageSettings/HomepageSettingsMain';
import SEOSettings from './SEOSettings/SEOSettingsMain';
import HeaderSettings from './HeaderSettings/HeaderSettingsMain';
import AdminEmailManager from '../AdminEmailManager';
import AdminReferralRewardsEnhanced from '../AdminReferralRewardsEnhanced';
import CustomCandlesSettingsMain from './CustomCandlesSettings/CustomCandlesSettingsMain';

export default function SiteSettingsHub() {
  const { language, t } = useLanguage();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Spirit Tools sections
  const spiritToolsSections = [
    {
      id: 'referrals',
      icon: <Gift className="h-6 w-6" />,
      title: t('referralSystemRewards'),
      description: language === 'pl'
        ? 'Zarządzaj systemem poleceń i nagrodami'
        : 'Manage referral system and rewards',
      itemCount: 5,
      color: 'text-yellow-500'
    },
    {
      id: 'chat',
      icon: <MessageSquare className="h-6 w-6" />,
      title: t('liveChatSettings'),
      description: language === 'pl'
        ? 'Personalizuj wiadomości czatu i odpowiedzi bota'
        : 'Customize chat messages and bot responses',
      itemCount: 3,
      color: 'text-purple-500'
    },
    {
      id: 'email',
      icon: <Mail className="h-6 w-6" />,
      title: t('emailManagement'),
      description: language === 'pl'
        ? 'Konfiguruj szablony emaili i powiadomienia'
        : 'Configure email templates and notifications',
      itemCount: 8,
      color: 'text-green-500'
    },
    {
      id: 'seo',
      icon: <Search className="h-6 w-6" />,
      title: t('seoSettings'),
      description: language === 'pl'
        ? 'Optymalizuj meta tagi, opisy i ustawienia SEO'
        : 'Optimize meta tags, descriptions, and SEO settings',
      itemCount: 6,
      color: 'text-pink-500'
    },
  ];

  // Site Settings sections
  const siteSettingsSections = [
    {
      id: 'header',
      icon: <Menu className="h-6 w-6" />,
      title: t('headerSettings'),
      description: language === 'pl'
        ? 'Dostosuj logo, nawigację i ikony nagłówka'
        : 'Customize header logo, navigation and icons',
      itemCount: 4,
      color: 'text-cyan-500',
      comingSoon: false
    },
    {
      id: 'homepage',
      icon: <Home className="h-6 w-6" />,
      title: t('homepageSettings'),
      description: language === 'pl'
        ? 'Dostosuj sekcję hero, funkcje, opinie i newsletter'
        : 'Customize hero section, features, testimonials, and newsletter',
      itemCount: 5,
      color: 'text-orange-500',
      comingSoon: false
    },
    {
      id: 'custom_candles',
      icon: <PenTool className="h-6 w-6" />,
      title: t('customCandlesPage'),
      description: language === 'pl'
        ? 'Dostosuj stronę Custom Candles'
        : 'Customize Custom Candles page',
      itemCount: 2,
      color: 'text-indigo-500',
      comingSoon: false
    },
    {
      id: 'footer',
      icon: <FileText className="h-6 w-6" />,
      title: t('footerSettings'),
      description: language === 'pl' 
        ? 'Zarządzaj treściami stopki, linkami do dokumentów prawnych i ikonami social media'
        : 'Manage footer content, legal document links, and social media icons',
      itemCount: 4,
      color: 'text-blue-500',
      comingSoon: false
    },
  ];

  // Conditional rendering for each setting section
  if (selectedSection === 'footer') {
    return <FooterSettings onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'header') {
    return <HeaderSettings onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'chat') {
    return <ChatSettings onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'homepage') {
    return <HomepageSettings onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'seo') {
    return <SEOSettings onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'email') {
    return <AdminEmailManager onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'referrals') {
    return <AdminReferralRewardsEnhanced onBack={() => setSelectedSection(null)} />;
  }

  if (selectedSection === 'custom_candles') {
    return <CustomCandlesSettingsMain onBack={() => setSelectedSection(null)} />;
  }

  // Main hub view with two sections
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2">{t('spiritToolsAndSite')}</h2>
        <p className="text-muted-foreground">
          {language === 'pl' 
            ? 'Zarządzaj narzędziami Spirit Candles i ustawieniami strony z jednego miejsca'
            : 'Manage Spirit Candles tools and site settings from one place'}
        </p>
      </div>

      {/* Spirit Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold">{t('spiritTools')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'pl'
            ? 'Narzędzia do zarządzania systemami Spirit Candles, gamifikacją i komunikacją'
            : 'Tools to manage Spirit Candles systems, gamification and communication'}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {spiritToolsSections.map((section) => (
            <Card 
              key={section.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
              onClick={() => setSelectedSection(section.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={section.color}>
                    {section.icon}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription className="text-sm">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                  <span>
                    {section.itemCount} {language === 'pl' ? 'ustawień' : 'settings'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Site Settings Section */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-bold">{t('siteSettings')}</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          {language === 'pl'
            ? 'Dostosuj wygląd i zawartość strony, nagłówek, stopkę i więcej'
            : 'Customize site appearance and content, header, footer and more'}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {siteSettingsSections.map((section) => (
            <Card 
              key={section.id}
              className={`cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
                section.comingSoon ? 'opacity-60' : ''
              }`}
              onClick={() => !section.comingSoon && setSelectedSection(section.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className={section.color}>
                    {section.icon}
                  </div>
                  {section.comingSoon && (
                    <span className="text-xs font-medium bg-muted px-2 py-1 rounded">
                      {language === 'pl' ? 'Wkrótce' : 'Coming Soon'}
                    </span>
                  )}
                  {!section.comingSoon && (
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <CardTitle className="text-lg">{section.title}</CardTitle>
                <CardDescription className="text-sm">{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Settings className="h-3.5 w-3.5" />
                  <span>
                    {section.itemCount} {language === 'pl' ? 'ustawień' : 'settings'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Sparkles className="h-6 w-6 text-primary flex-shrink-0" />
            <div className="space-y-1">
              <p className="font-medium text-sm">
                {language === 'pl' 
                  ? 'Wskazówka: Zmiany w ustawieniach są natychmiastowe'
                  : 'Tip: Changes to settings are immediate'}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === 'pl'
                  ? 'Wszystkie zmiany są zapisywane automatycznie i będą widoczne dla użytkowników od razu.'
                  : 'All changes are saved automatically and will be visible to users immediately.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
