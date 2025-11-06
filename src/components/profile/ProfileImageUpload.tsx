import { useState, useRef } from 'react';
import Cropper, { Area, Point } from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Camera, Upload, Loader2, ZoomIn, ZoomOut, Move } from 'lucide-react';
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
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

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
    reader.addEventListener('load', () => {
      setImageSrc(reader.result as string);
      setIsOpen(true);
    });
    reader.readAsDataURL(file);
  };

  const createCroppedImage = async (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc!;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx || !croppedAreaPixels) {
          reject(new Error('No crop area'));
          return;
        }

        canvas.width = croppedAreaPixels.width;
        canvas.height = croppedAreaPixels.height;

        ctx.drawImage(
          image,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          croppedAreaPixels.width,
          croppedAreaPixels.height
        );

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob failed'));
          }
        }, 'image/jpeg', 0.95);
      };
    });
  };

  const handleUpload = async () => {
    if (!selectedFile || !croppedAreaPixels) return;

    setUploading(true);
    try {
      // Create cropped image
      const croppedBlob = await createCroppedImage();
      
      // Upload to Supabase
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${userId}/${imageType}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(fileName, croppedBlob, {
          cacheControl: '3600',
          upsert: true
        });

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
      setImageSrc(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      
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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Move className="h-5 w-5" />
              {language === 'pl' 
                ? `Dostosuj obraz ${imageType === 'profile' ? 'profilu' : 'okładki'}`
                : `Adjust ${imageType === 'profile' ? 'profile' : 'cover'} image`}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Cropper */}
            <div className="relative h-96 bg-muted rounded-lg overflow-hidden">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={imageType === 'profile' ? 1 : 16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            {/* Zoom Control */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <ZoomOut className="h-4 w-4 text-muted-foreground" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={(value) => setZoom(value[0])}
                  className="flex-1"
                />
                <ZoomIn className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {language === 'pl' 
                  ? 'Przeciągnij, aby przesunąć • Przewiń lub użyj suwaka, aby powiększyć'
                  : 'Drag to move • Scroll or use slider to zoom'}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsOpen(false)} disabled={uploading}>
                {language === 'pl' ? 'Anuluj' : 'Cancel'}
              </Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {language === 'pl' ? 'Zapisz Obraz' : 'Save Image'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}