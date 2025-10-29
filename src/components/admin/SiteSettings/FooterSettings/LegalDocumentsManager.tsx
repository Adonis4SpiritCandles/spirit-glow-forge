import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface LegalDocument {
  id: string;
  document_type: string;
  title_en: string;
  title_pl: string;
  pdf_url_en: string | null;
  pdf_url_pl: string | null;
  page_route: string;
}

const LegalDocumentsManager = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<LegalDocument>>({});

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .order('document_type');

      if (error) throw error;
      setDocuments(data || []);
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
    loadDocuments();
  }, []);

  const handleSave = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('legal_documents')
        .update({
          pdf_url_en: editFormData.pdf_url_en,
          pdf_url_pl: editFormData.pdf_url_pl,
        })
        .eq('id', docId);

      if (error) throw error;

      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' ? 'Dokument zaktualizowany' : 'Document updated',
      });

      setEditingDoc(null);
      loadDocuments();
    } catch (error: any) {
      toast({
        title: language === 'pl' ? 'Błąd' : 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (doc: LegalDocument) => {
    setEditingDoc(doc.id);
    setEditFormData({
      pdf_url_en: doc.pdf_url_en || '',
      pdf_url_pl: doc.pdf_url_pl || '',
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">{language === 'pl' ? 'Ładowanie...' : 'Loading...'}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{language === 'pl' ? 'Dokumenty Prawne' : 'Legal Documents'}</CardTitle>
        <CardDescription>
          {language === 'pl'
            ? 'Zarządzaj linkami PDF do dokumentów prawnych wyświetlanych w stopce'
            : 'Manage PDF links to legal documents displayed in the footer'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{language === 'pl' ? 'Dokument' : 'Document'}</TableHead>
              <TableHead>{language === 'pl' ? 'PDF Angielski' : 'English PDF'}</TableHead>
              <TableHead>{language === 'pl' ? 'PDF Polski' : 'Polish PDF'}</TableHead>
              <TableHead className="text-right">{language === 'pl' ? 'Akcje' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium">
                  <div>
                    <p className="font-semibold">{language === 'pl' ? doc.title_pl : doc.title_en}</p>
                    <p className="text-xs text-muted-foreground">{doc.page_route}</p>
                  </div>
                </TableCell>

                <TableCell>
                  {editingDoc === doc.id ? (
                    <Input
                      value={editFormData.pdf_url_en}
                      onChange={(e) => setEditFormData({ ...editFormData, pdf_url_en: e.target.value })}
                      placeholder="/documents/file-en.pdf"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {doc.pdf_url_en && (
                        <a
                          href={doc.pdf_url_en}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {language === 'pl' ? 'Zobacz' : 'View'}
                        </a>
                      )}
                      {!doc.pdf_url_en && (
                        <span className="text-xs text-muted-foreground">
                          {language === 'pl' ? 'Brak' : 'None'}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell>
                  {editingDoc === doc.id ? (
                    <Input
                      value={editFormData.pdf_url_pl}
                      onChange={(e) => setEditFormData({ ...editFormData, pdf_url_pl: e.target.value })}
                      placeholder="/documents/file-pl.pdf"
                      className="w-full"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      {doc.pdf_url_pl && (
                        <a
                          href={doc.pdf_url_pl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          {language === 'pl' ? 'Zobacz' : 'View'}
                        </a>
                      )}
                      {!doc.pdf_url_pl && (
                        <span className="text-xs text-muted-foreground">
                          {language === 'pl' ? 'Brak' : 'None'}
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>

                <TableCell className="text-right">
                  {editingDoc === doc.id ? (
                    <div className="flex justify-end gap-2">
                      <Button size="sm" onClick={() => handleSave(doc.id)}>
                        {language === 'pl' ? 'Zapisz' : 'Save'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingDoc(null)}>
                        {language === 'pl' ? 'Anuluj' : 'Cancel'}
                      </Button>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => handleEdit(doc)}>
                      {language === 'pl' ? 'Edytuj' : 'Edit'}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 p-4 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground">
            <strong>{language === 'pl' ? 'Wskazówka:' : 'Tip:'}</strong>{' '}
            {language === 'pl'
              ? 'Wklej ścieżkę do pliku PDF (np. /documents/privacy-policy-en.pdf) lub pełny URL. Pliki PDF powinny znajdować się w folderze public/documents/.'
              : 'Paste the path to the PDF file (e.g., /documents/privacy-policy-en.pdf) or full URL. PDF files should be in the public/documents/ folder.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LegalDocumentsManager;