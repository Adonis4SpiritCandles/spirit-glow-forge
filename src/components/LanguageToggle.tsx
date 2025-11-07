import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-0.5">
      <Button
        variant={language === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="text-[10px] md:text-[11px] px-1.5 md:px-2 py-1 h-6 md:h-7"
      >
        EN
      </Button>
      <Button
        variant={language === 'pl' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => setLanguage('pl')}
        className="text-[10px] md:text-[11px] px-1.5 md:px-2 py-1 h-6 md:h-7"
      >
        PL
      </Button>
    </div>
  );
};

export default LanguageToggle;