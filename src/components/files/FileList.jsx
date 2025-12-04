import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  Star,
  StarOff,
  Eye,
  CheckSquare,
  Square,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const getFileIcon = (type, isFolder) => {
  if (isFolder) return Folder;
  
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return Image;
  if (['pdf'].includes(ext)) return FileText;
  if (['doc', 'docx'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
};

const getFileColor = (type, isFolder) => {
  if (isFolder) return 'text-emerald-500';
  
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'text-purple-500';
  if (['pdf'].includes(ext)) return 'text-red-500';
  if (['doc', 'docx'].includes(ext)) return 'text-blue-500';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'text-green-600';
  return 'text-gray-500';
};

export default function FileList({ 
  files, 
  onFolderClick, 
  onFileClick, 
  onToggleFavorite,
  onMultiFilePreview,
  favorites = [],
  isLoading 
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const toggleFileSelection = (file, e) => {
    e.stopPropagation();
    if (selectedFiles.some(f => f.path === file.path)) {
      setSelectedFiles(selectedFiles.filter(f => f.path !== file.path));
    } else {
      setSelectedFiles([...selectedFiles, file]);
    }
  };

  const handlePreviewSelected = () => {
    if (selectedFiles.length > 0 && onMultiFilePreview) {
      onMultiFilePreview(selectedFiles);
    }
  };

  const clearSelection = () => {
    setSelectedFiles([]);
    setSelectionMode(false);
  };
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="text-center py-16">
        <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Pasta vazia</p>
        <p className="text-gray-400 text-sm">Nenhum arquivo encontrado nesta pasta</p>
      </div>
    );
  }

  const fileOnlyList = files.filter(f => !f.isFolder);

  // Sort: folders first, then files
  const sortedFiles = [...files].sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-1">
      {/* Selection Toolbar */}
      {fileOnlyList.length > 1 && (
        <div className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode);
                if (selectionMode) clearSelection();
              }}
              className={selectionMode ? "bg-emerald-600 hover:bg-emerald-700" : ""}
            >
              {selectionMode ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
              {selectionMode ? "Selecionando" : "Selecionar"}
            </Button>
            
            {selectionMode && selectedFiles.length > 0 && (
              <span className="text-sm text-gray-500">
                {selectedFiles.length} arquivo(s) selecionado(s)
              </span>
            )}
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={handlePreviewSelected}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Layers className="h-4 w-4 mr-1" />
                Visualizar {selectedFiles.length}
              </Button>
            </div>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {sortedFiles.map((file, index) => {
          const Icon = getFileIcon(file.extension, file.isFolder);
          const color = getFileColor(file.extension, file.isFolder);
          const isFavorite = favorites.some(f => f.file_path === file.path);
          
          return (
            <motion.div
              key={file.path || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.02 }}
              className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer border border-transparent hover:border-gray-100"
              onClick={() => file.isFolder ? onFolderClick(file) : onFileClick(file)}
            >
              {selectionMode && !file.isFolder ? (
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-50 cursor-pointer"
                  onClick={(e) => toggleFileSelection(file, e)}
                >
                  <Checkbox 
                    checked={selectedFiles.some(f => f.path === file.path)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                </div>
              ) : (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${file.isFolder ? 'bg-emerald-50' : 'bg-gray-50'} group-hover:scale-105 transition-transform`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate group-hover:text-emerald-600 transition-colors">
                  {file.name}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  {file.size && <span>{file.size}</span>}
                  {file.modifiedDate && (
                    <span>{format(new Date(file.modifiedDate), "dd MMM yyyy, HH:mm", { locale: ptBR })}</span>
                  )}
                </div>
              </div>
              
              {!file.isFolder && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(file);
                    }}
                  >
                    {isFavorite ? (
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFileClick(file);
                    }}
                  >
                    <Eye className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}