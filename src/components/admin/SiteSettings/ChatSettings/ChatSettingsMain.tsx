import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import ChatResponsesManager from "./ChatResponsesManager";

interface ChatSettingsMainProps {
  onBack: () => void;
}

const ChatSettingsMain = ({ onBack }: ChatSettingsMainProps) => {
  const { language } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-playfair font-bold">
            {language === 'pl' ? 'Ustawienia Live Chat' : 'Live Chat Settings'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {language === 'pl' 
              ? 'Zarządzaj automatycznymi odpowiedziami bota czatu'
              : 'Manage automatic chat bot responses'}
          </p>
        </div>
      </div>

      {/* Content */}
      <ChatResponsesManager />
    </div>
  );
};

export default ChatSettingsMain;