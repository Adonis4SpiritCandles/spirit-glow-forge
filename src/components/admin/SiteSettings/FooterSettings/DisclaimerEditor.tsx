import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface Disclaimer {
  id: string;
  inspiration_notice_en: string;
  inspiration_notice_pl: string;
  independent_brand_en: string;
  independent_brand_pl: string;
}

const DisclaimerEditor = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Disclaimer>>({
    inspiration_notice_en: '',
    inspiration_notice_pl: '',
    independent_brand_en: '',
    independent_brand_pl: '',
  });

  const loadDisclaimers = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_disclaimers')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setFormData(data);
      }
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDisclaimers();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existingData } = await supabase
        .from('footer_disclaimers')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
        const { error } = await supabase
          .from('footer_disclaimers')
          .update(formData)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_disclaimers')
          .insert([formData]);

        if (error) throw error;
      }

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Disclaimery zaktualizowane' : 'Disclaimers updated',
      });
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'pl' ? 'Teksty Disclaimerów' : 'Disclaimer Texts'}</CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Edytuj teksty disclaimerów wyświetlane w stopce w języku angielskim i polskim'
            : 'Edit disclaimer texts displayed in the footer in English and Polish'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Tabs defaultValue="inspiration" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inspiration">
              {language === 'pl' ? 'Inspiracja' : 'Inspiration Notice'}
            </TabsTrigger>
            <TabsTrigger value="brand">
              {language === 'pl' ? 'Niezależna Marka' : 'Independent Brand'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inspiration" className="space-y-4 mt-4">
            <div>
              <Label>{language === 'pl' ? 'Angielski' : 'English'}</Label>
              <Textarea
                value={formData.inspiration_notice_en}
                onChange={(e) => setFormData({ ...formData, inspiration_notice_en: e.target.value })}
                rows={3}
                placeholder="All Spirit Candles products are inspired by..."
              />
            </div>

            <div>
              <Label>{language === 'pl' ? 'Polski' : 'Polish'}</Label>
              <Textarea
                value={formData.inspiration_notice_pl}
                onChange={(e) => setFormData({ ...formData, inspiration_notice_pl: e.target.value })}
                rows={3}
                placeholder="Wszystkie produkty Spirit Candles są inspirowane..."
              />
            </div>
          </TabsContent>

          <TabsContent value="brand" className="space-y-4 mt-4">
            <div>
              <Label>{language === 'pl' ? 'Angielski' : 'English'}</Label>
              <Textarea
                value={formData.independent_brand_en}
                onChange={(e) => setFormData({ ...formData, independent_brand_en: e.target.value })}
                rows={2}
                placeholder="Spirit Candles is an independent brand of..."
              />
            </div>

            <div>
              <Label>{language === 'pl' ? 'Polski' : 'Polish'}</Label>
              <Textarea
                value={formData.independent_brand_pl}
                onChange={(e) => setFormData({ ...formData, independent_brand_pl: e.target.value })}
                rows={2}
                placeholder="Spirit Candles jest niezależną marką..."
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving 
              ? (language === 'pl' ? 'Zapisywanie...' : 'Saving...') 
              : (language === 'pl' ? 'Zapisz zmiany' : 'Save Changes')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DisclaimerEditor;