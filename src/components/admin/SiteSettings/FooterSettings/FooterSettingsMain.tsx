import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Facebook, FileText, Mail, MessageSquare } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SocialIconsManager from "./SocialIconsManager";
import ContactInfoEditor from "./ContactInfoEditor";
import DisclaimerEditor from "./DisclaimerEditor";
import LegalDocumentsManager from "./LegalDocumentsManager";

interface FooterSettingsMainProps {
  onBack: () => void;
}

const FooterSettingsMain = ({ onBack }: FooterSettingsMainProps) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("social");

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-playfair font-bold text-foreground">
            {language === 'pl' ? 'Ustawienia Stopki' : 'Footer Settings'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'pl'
              ? 'Zarządzaj wszystkimi elementami stopki strony'
              : 'Manage all elements of the site footer'}
          </p>
        </div>
      </div>

      {/* Tabs for Different Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="social" className="gap-2">
            <Facebook className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'pl' ? 'Social Media' : 'Social Media'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'pl' ? 'Kontakt' : 'Contact'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="disclaimer" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'pl' ? 'Disclaimers' : 'Disclaimers'}
            </span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">
              {language === 'pl' ? 'Dokumenty' : 'Documents'}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="mt-6">
          <SocialIconsManager />
        </TabsContent>

        <TabsContent value="contact" className="mt-6">
          <ContactInfoEditor />
        </TabsContent>

        <TabsContent value="disclaimer" className="mt-6">
          <DisclaimerEditor />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <LegalDocumentsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FooterSettingsMain;