import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Camera, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  imageType: 'profile' | 'cover';
  onUploadComplete: (url: string) => void;
}

export default function ProfileImageUpload({ 
  userId, 
  currentImageUrl, 
  imageType,
  onUploadComplete 
}: ProfileImageUploadProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [zoom, setZoom] = useState([1]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: language === 'pl' 
          ? 'Proszę wybrać plik obrazu' 
          : 'Please select an image file',
        variant: 'destructive',
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${imageType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('products')
        .upload(fileName, selectedFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(fileName);

      // Update profile
      const updateField = imageType === 'profile' ? 'profile_image_url' : 'cover_image_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onUploadComplete(publicUrl);
      setIsOpen(false);
      
      toast({
        title: language === 'pl' ? 'Sukces' : 'Success',
        description: language === 'pl' 
          ? 'Obraz został przesłany' 
          : 'Image has been uploaded',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="gap-2"
      >
        {currentImageUrl ? <Camera className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
        {currentImageUrl 
          ? (language === 'pl' ? 'Zmień' : 'Change')
          : (language === 'pl' ? 'Prześlij' : 'Upload')}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'pl' 
                ? `Dostosuj obraz ${imageType === 'profile' ? 'profilu' : 'okładki'}`
                : `Adjust ${imageType === 'profile' ? 'profile' : 'cover'} image`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {preview && (
              <div className="relative overflow-hidden rounded-lg border">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full"
                  style={{
                    transform: `scale(${zoom[0]})`,
                    transition: 'transform 0.2s',
                  }}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'pl' ? 'Powiększenie' : 'Zoom'}
              </label>
              <Slider
                value={zoom}
                onValueChange={setZoom}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1"
              >
                {uploading 
                  ? (language === 'pl' ? 'Przesyłanie...' : 'Uploading...')
                  : (language === 'pl' ? 'Zapisz' : 'Save')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
