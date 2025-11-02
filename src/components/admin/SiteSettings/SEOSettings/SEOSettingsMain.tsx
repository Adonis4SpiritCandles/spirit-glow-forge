import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SEOSettingsManager from "./SEOSettingsManager";

interface SEOSettingsMainProps {
  onBack: () => void;
}

const SEOSettingsMain = ({ onBack }: SEOSettingsMainProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {language === 'pl' ? 'Powrót' : 'Back'}
      </Button>

      <SEOSettingsManager />
    </div>
  );
};

export default SEOSettingsMain;
