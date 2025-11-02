import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Save, Trash2, MessageSquare, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ChatResponse {
  id: string;
  category: string;
  trigger_keywords_en: string[];
  trigger_keywords_pl: string[];
  response_en: string;
  response_pl: string;
  display_order: number;
  is_active: boolean;
  is_default: boolean;
}

const ChatResponsesManager = () => {
  const { language } = useLanguage();
  const [responses, setResponses] = useState<ChatResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    trigger_keywords_en: "",
    trigger_keywords_pl: "",
    response_en: "",
    response_pl: "",
    is_active: true,
  });

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    const { data, error } = await supabase
      .from("chat_responses" as any)
      .select("*")
      .order("display_order", { ascending: true });

    if (!error && data) {
      setResponses(data as any);
    }
  };

  const handleSave = async () => {
    if (!formData.category || !formData.response_en || !formData.response_pl) {
      toast.error(language === 'pl' ? 'Wypełnij wszystkie pola' : 'Fill all fields');
      return;
    }

    const payload = {
      category: formData.category,
      trigger_keywords_en: formData.trigger_keywords_en.split(',').map(k => k.trim()).filter(Boolean),
      trigger_keywords_pl: formData.trigger_keywords_pl.split(',').map(k => k.trim()).filter(Boolean),
      response_en: formData.response_en,
      response_pl: formData.response_pl,
      is_active: formData.is_active,
      display_order: responses.length + 1,
    };

    if (editingId) {
      const { error } = await supabase
        .from("chat_responses" as any)
        .update(payload)
        .eq("id", editingId);

      if (error) {
        toast.error(language === 'pl' ? 'Błąd aktualizacji' : 'Update error');
        return;
      }
      toast.success(language === 'pl' ? 'Odpowiedź zaktualizowana' : 'Response updated');
    } else {
      const { error } = await supabase
        .from("chat_responses" as any)
        .insert(payload);

      if (error) {
        toast.error(language === 'pl' ? 'Błąd dodawania' : 'Add error');
        return;
      }
      toast.success(language === 'pl' ? 'Odpowiedź dodana' : 'Response added');
    }

    resetForm();
    loadResponses();
  };

  const handleEdit = (response: ChatResponse) => {
    setEditingId(response.id);
    setFormData({
      category: response.category,
      trigger_keywords_en: response.trigger_keywords_en.join(', '),
      trigger_keywords_pl: response.trigger_keywords_pl.join(', '),
      response_en: response.response_en,
      response_pl: response.response_pl,
      is_active: response.is_active,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from("chat_responses" as any)
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error(language === 'pl' ? 'Błąd usuwania' : 'Delete error');
      return;
    }

    toast.success(language === 'pl' ? 'Odpowiedź usunięta' : 'Response deleted');
    setDeleteId(null);
    loadResponses();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      category: "",
      trigger_keywords_en: "",
      trigger_keywords_pl: "",
      response_en: "",
      response_pl: "",
      is_active: true,
    });
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("chat_responses" as any)
      .update({ is_active: !currentState })
      .eq("id", id);

    if (!error) {
      loadResponses();
      toast.success(language === 'pl' ? 'Status zmieniony' : 'Status changed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {language === 'pl' ? 'Jak to działa?' : 'How it works?'}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                {language === 'pl' 
                  ? 'Bot będzie wyszukiwać słowa kluczowe w wiadomościach użytkowników i odpowiadać odpowiednią wiadomością. Możesz dodać wiele słów kluczowych oddzielonych przecinkami.'
                  : 'The bot will search for keywords in user messages and respond with the appropriate message. You can add multiple keywords separated by commas.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            {editingId 
              ? (language === 'pl' ? 'Edytuj Odpowiedź' : 'Edit Response')
              : (language === 'pl' ? 'Dodaj Nową Odpowiedź' : 'Add New Response')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'pl' ? 'Kategoria' : 'Category'}</Label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder={language === 'pl' ? 'np. shipping, orders' : 'e.g. shipping, orders'}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                {language === 'pl' ? 'Aktywna' : 'Active'}
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Słowa kluczowe (EN)' : 'Keywords (EN)'}</Label>
            <Input
              value={formData.trigger_keywords_en}
              onChange={(e) => setFormData({ ...formData, trigger_keywords_en: e.target.value })}
              placeholder="shipping, delivery, send"
            />
            <p className="text-xs text-muted-foreground">
              {language === 'pl' ? 'Oddziel przecinkami' : 'Separate with commas'}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Słowa kluczowe (PL)' : 'Keywords (PL)'}</Label>
            <Input
              value={formData.trigger_keywords_pl}
              onChange={(e) => setFormData({ ...formData, trigger_keywords_pl: e.target.value })}
              placeholder="wysyłka, dostawa, wysłać"
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Odpowiedź (EN)' : 'Response (EN)'}</Label>
            <Textarea
              value={formData.response_en}
              onChange={(e) => setFormData({ ...formData, response_en: e.target.value })}
              rows={6}
              placeholder="Enter the bot response in English..."
            />
          </div>

          <div className="space-y-2">
            <Label>{language === 'pl' ? 'Odpowiedź (PL)' : 'Response (PL)'}</Label>
            <Textarea
              value={formData.response_pl}
              onChange={(e) => setFormData({ ...formData, response_pl: e.target.value })}
              rows={6}
              placeholder="Wpisz odpowiedź bota po polsku..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {editingId 
                ? (language === 'pl' ? 'Zapisz' : 'Save')
                : (language === 'pl' ? 'Dodaj' : 'Add')}
            </Button>
            {editingId && (
              <Button onClick={resetForm} variant="outline">
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Responses List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          {language === 'pl' ? 'Zapisane Odpowiedzi' : 'Saved Responses'}
        </h3>
        {responses.map((response) => (
          <Card key={response.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={response.is_default ? "default" : "secondary"}>
                      {response.category}
                    </Badge>
                    {response.is_default && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">
                        {language === 'pl' ? 'Domyślna' : 'Default'}
                      </Badge>
                    )}
                    <Badge variant={response.is_active ? "default" : "destructive"}>
                      {response.is_active 
                        ? (language === 'pl' ? 'Aktywna' : 'Active')
                        : (language === 'pl' ? 'Nieaktywna' : 'Inactive')}
                    </Badge>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground mb-1">
                      {language === 'pl' ? 'Słowa kluczowe:' : 'Keywords:'}
                    </p>
                    <p className="text-xs">
                      EN: {response.trigger_keywords_en.join(', ') || '-'}
                    </p>
                    <p className="text-xs">
                      PL: {response.trigger_keywords_pl.join(', ') || '-'}
                    </p>
                  </div>

                  <div className="text-sm">
                    <p className="font-medium text-muted-foreground mb-1">
                      {language === 'pl' ? 'Odpowiedź:' : 'Response:'}
                    </p>
                    <p className="text-xs whitespace-pre-wrap bg-muted p-3 rounded-md">
                      {language === 'pl' ? response.response_pl : response.response_en}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActive(response.id, response.is_active)}
                  >
                    {response.is_active 
                      ? (language === 'pl' ? 'Wyłącz' : 'Disable')
                      : (language === 'pl' ? 'Włącz' : 'Enable')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(response)}
                  >
                    {language === 'pl' ? 'Edytuj' : 'Edit'}
                  </Button>
                  {!response.is_default && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setDeleteId(response.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'pl' ? 'Czy na pewno?' : 'Are you sure?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'pl' 
                ? 'Ta akcja nie może być cofnięta. Odpowiedź zostanie trwale usunięta.'
                : 'This action cannot be undone. The response will be permanently deleted.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'pl' ? 'Anuluj' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {language === 'pl' ? 'Usuń' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatResponsesManager;