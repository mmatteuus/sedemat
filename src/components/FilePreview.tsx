import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText } from 'lucide-react';
import { FileItem, FilePreviewData } from '@/types';

interface FilePreviewProps {
  file: FileItem | null;
  preview: FilePreviewData | null;
  loading: boolean;
  onClose: () => void;
  onOpen: () => void;
  onDownload: () => void;
}

const FilePreview = ({ file, preview, loading, onClose, onOpen, onDownload }: FilePreviewProps) => {
  if (!file) return null;

  const renderPreview = () => {
    if (loading || !preview) {
      return (
        <div className="border rounded-lg p-8 bg-muted/30 min-h-[260px] flex items-center justify-center">
          <p className="text-muted-foreground">Gerando preview...</p>
        </div>
      );
    }

    if (preview.mode === 'image' && preview.src) {
      return (
        <div className="border rounded-lg bg-muted/30 flex items-center justify-center">
          <img src={preview.src} alt={file.name} className="max-h-[420px] object-contain rounded-lg" />
        </div>
      );
    }

    if (preview.mode === 'pdf' && preview.src) {
      return (
        <div className="border rounded-lg bg-muted/30 h-[420px]">
          <iframe src={preview.src} title={file.name} className="w-full h-full rounded-lg" />
        </div>
      );
    }

    return (
      <div className="border rounded-lg p-8 bg-muted/30 min-h-[260px] flex items-center justify-center">
        <div className="text-center space-y-3">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">
            {preview.message ?? 'Preview nao disponivel para este arquivo'}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>
            Modificado em {new Date(file.modifiedDate).toLocaleDateString('pt-BR')}
            {file.size && ` | ${file.size}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {renderPreview()}

          <div className="flex gap-3">
            <Button className="flex-1" variant="outline" onClick={onOpen}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir no aplicativo
            </Button>
            <Button className="flex-1" onClick={onDownload}>
              <Download className="mr-2 h-4 w-4" />
              Baixar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;
