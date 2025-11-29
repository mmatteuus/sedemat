import { FileItem } from '@/data/mockData';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText } from 'lucide-react';

interface FilePreviewProps {
  file: FileItem | null;
  onClose: () => void;
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  if (!file) return null;

  const canPreview = ['pdf', 'image', 'word'].includes(file.type);

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{file.name}</DialogTitle>
          <DialogDescription>
            Modificado em {new Date(file.modifiedDate).toLocaleDateString('pt-BR')}
            {file.size && ` • ${file.size}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {canPreview ? (
            <div className="border rounded-lg p-8 bg-muted/30 min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Preview de {file.type.toUpperCase()} seria exibido aqui
                </p>
                <p className="text-sm text-muted-foreground">
                  Em produção, este espaço mostraria o conteúdo do arquivo
                </p>
              </div>
            </div>
          ) : (
            <div className="border rounded-lg p-8 bg-muted/30 min-h-[200px] flex items-center justify-center">
              <div className="text-center space-y-3">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">
                  Preview não disponível para este tipo de arquivo
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button className="flex-1" variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              Abrir no aplicativo
            </Button>
            <Button className="flex-1">
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
