import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderSettingsMainProps {
  onBack: () => void;
}

export default function HeaderSettingsMain({ onBack }: HeaderSettingsMainProps) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{t('headerSettings')}</h2>
          <p className="text-muted-foreground text-sm">
            {language === 'pl' 
              ? 'Dostosuj wygląd i zachowanie nagłówka' 
              : 'Customize header appearance and behavior'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            {language === 'pl' ? 'Wkrótce dostępne' : 'Coming Soon'}
          </CardTitle>
          <CardDescription>
            {language === 'pl'
              ? 'Ustawienia nagłówka będą wkrótce dostępne. Będziesz mógł dostosować logo, elementy nawigacji, ikony i więcej.'
              : 'Header settings will be available soon. You will be able to customize logo, navigation items, icons and more.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground space-y-2">
            <p>{language === 'pl' ? 'Planowane funkcje:' : 'Planned features:'}</p>
            <ul className="list-disc list-inside space-y-1">
              <li>{language === 'pl' ? 'Zarządzanie logo' : 'Logo management'}</li>
              <li>{language === 'pl' ? 'Ukryj/pokaż elementy nawigacji' : 'Show/hide navigation items'}</li>
              <li>{language === 'pl' ? 'Dostosuj pozycję selektora języka' : 'Customize language selector position'}</li>
              <li>{language === 'pl' ? 'Ustawienia ikony koszyka' : 'Cart icon settings'}</li>
              <li>{language === 'pl' ? 'Kolory i styling' : 'Colors and styling'}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
