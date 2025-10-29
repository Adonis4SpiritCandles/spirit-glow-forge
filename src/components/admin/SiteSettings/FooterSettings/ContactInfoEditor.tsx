import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface ContactInfo {
  id: string;
  company_name: string;
  company_legal_name: string;
  address_line1: string;
  address_line2: string;
  nip: string;
  regon: string;
  phone: string;
  email: string;
  languages: string;
}

const ContactInfoEditor = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<ContactInfo>>({
    company_name: '',
    company_legal_name: '',
    address_line1: '',
    address_line2: '',
    nip: '',
    regon: '',
    phone: '',
    email: '',
    languages: '',
  });

  const loadContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('footer_contact_info')
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
    loadContactInfo();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: existingData } = await supabase
        .from('footer_contact_info')
        .select('id')
        .limit(1)
        .single();

      if (existingData) {
        const { error } = await supabase
          .from('footer_contact_info')
          .update(formData)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('footer_contact_info')
          .insert([formData]);

        if (error) throw error;
      }

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Informacje kontaktowe zaktualizowane' : 'Contact info updated',
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
        <CardTitle>{language === 'pl' ? 'Informacje Kontaktowe' : 'Contact Information'}</CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Edytuj informacje kontaktowe wyświetlane w stopce strony'
            : 'Edit contact information displayed in the footer'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>{language === 'pl' ? 'Nazwa Firmy' : 'Company Name'}</Label>
            <Input
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="SPIRIT CANDLES"
            />
          </div>

          <div>
            <Label>{language === 'pl' ? 'Pełna Nazwa Prawna' : 'Full Legal Name'}</Label>
            <Input
              value={formData.company_legal_name}
              onChange={(e) => setFormData({ ...formData, company_legal_name: e.target.value })}
              placeholder="M5M Limited Sp. z o.o. oddział w Polsce"
            />
          </div>

          <div>
            <Label>{language === 'pl' ? 'Adres Linia 1' : 'Address Line 1'}</Label>
            <Input
              value={formData.address_line1}
              onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
              placeholder="Grzybowska 2/31"
            />
          </div>

          <div>
            <Label>{language === 'pl' ? 'Adres Linia 2' : 'Address Line 2'}</Label>
            <Input
              value={formData.address_line2}
              onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
              placeholder="00‑131 Warszawa"
            />
          </div>

          <div>
            <Label>NIP</Label>
            <Input
              value={formData.nip}
              onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
              placeholder="5252998035"
            />
          </div>

          <div>
            <Label>REGON</Label>
            <Input
              value={formData.regon}
              onChange={(e) => setFormData({ ...formData, regon: e.target.value })}
              placeholder="528769795"
            />
          </div>

          <div>
            <Label>{language === 'pl' ? 'Telefon' : 'Phone'}</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+48 729877557"
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="m5moffice@proton.me"
            />
          </div>
        </div>

        <div>
          <Label>{language === 'pl' ? 'Dostępne Języki' : 'Available Languages'}</Label>
          <Input
            value={formData.languages}
            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            placeholder="Available in Polish and English"
          />
        </div>

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

export default ContactInfoEditor;