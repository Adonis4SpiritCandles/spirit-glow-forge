import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface AdminDeleteOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  isFromTrash?: boolean;
}

const AdminDeleteOrderDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false,
  isFromTrash = false
}: AdminDeleteOrderDialogProps) => {
  const { t, language } = useLanguage();

  // Different texts based on context
  const title = isFromTrash ? t('deleteOrder') : t('moveToTrash');
  const description = isFromTrash 
    ? t('permanentDeletionWarning')
    : t('moveToTrashWarning');
  const buttonText = isFromTrash 
    ? t('iUnderstandProceed')
    : (language === 'pl' ? 'Przenieś do kosza' : 'Move to Trash');

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>{description}</p>
            {isFromTrash && (
              <p className="text-destructive font-medium">
                {language === 'pl' 
                  ? 'Ta akcja jest nieodwracalna. Zamówienie zostanie trwale usunięte.'
                  : 'This action is permanent. The order will be deleted forever.'}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? t('deleting') : buttonText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AdminDeleteOrderDialog;