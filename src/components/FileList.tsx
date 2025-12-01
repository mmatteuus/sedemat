import { useMemo, useState } from 'react';
import { FileItem } from '@/types';
import { Folder, FileText, FileImage, File, FileSpreadsheet, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FileListProps {
  files: FileItem[];
  breadcrumb: { label: string; path: string }[];
  onBreadcrumbClick?: (path: string) => void;
  onFileClick: (file: FileItem) => void;
  onFolderClick: (folder: FileItem) => void;
  loading?: boolean;
}

const FileList = ({ files, breadcrumb, onBreadcrumbClick, onFileClick, onFolderClick, loading }: FileListProps) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'folder':
        return <Folder className="h-5 w-5 text-primary" />;
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'word':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <FileImage className="h-5 w-5 text-amber-500" />;
      case 'excel':
        return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
      default:
        return <File className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const filteredFiles = useMemo(() => {
    const filtered = files.filter((file) => {
      if (search && !file.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filter !== 'all' && file.type !== filter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') {
        return new Date(b.modifiedDate).getTime() - new Date(a.modifiedDate).getTime();
      }
      return 0;
    });
  }, [files, search, filter, sortBy]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {breadcrumb.map((item, index) => (
          <div key={item.path || item.label} className="flex items-center gap-2">
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <button
              className="font-medium text-foreground hover:text-primary transition-colors"
              onClick={() => onBreadcrumbClick?.(item.path)}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <Input
          placeholder="Buscar por nome do arquivo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="word">Word</SelectItem>
              <SelectItem value="excel">Excel</SelectItem>
              <SelectItem value="image">Imagens</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nome</SelectItem>
              <SelectItem value="date">Data</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg divide-y">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground">Carregando...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Nenhum arquivo encontrado</div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-4 hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => (file.type === 'folder' ? onFolderClick(file) : onFileClick(file))}
            >
              {getFileIcon(file.type)}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(file.modifiedDate).toLocaleDateString('pt-BR')}
                  {file.size ? ` | ${file.size}` : ''}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FileList;
