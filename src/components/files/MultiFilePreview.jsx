import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  X, 
  ChevronLeft, 
  ChevronRight,
  Download,
  ExternalLink,
  Star,
  StarOff,
  FileText,
  Image,
  FileSpreadsheet,
  File,
  Layers,
  Grid2X2,
  LayoutList
} from "lucide-react";
import PdfViewer from "./PdfViewer";
import ExcelViewer from "./ExcelViewer";

const getFileIcon = (type) => {
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return Image;
  if (['pdf'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
};

const getFileColor = (type) => {
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'text-purple-500 bg-purple-50';
  if (['pdf'].includes(ext)) return 'text-red-500 bg-red-50';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'text-green-600 bg-green-50';
  return 'text-gray-500 bg-gray-50';
};

export default function MultiFilePreview({ 
  files, 
  onClose, 
  onOpen, 
  onDownload,
  onToggleFavorite,
  favorites = []
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState('single'); // 'single' | 'grid'
  
  if (!files || files.length === 0) return null;
  
  const activeFile = files[activeIndex];
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(activeFile?.extension?.toLowerCase());
  const isPdf = activeFile?.extension?.toLowerCase() === 'pdf';
  const isExcel = ['xls', 'xlsx', 'csv'].includes(activeFile?.extension?.toLowerCase());
  
  const handlePrev = () => setActiveIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setActiveIndex(prev => Math.min(files.length - 1, prev + 1));
  
  const isFavorite = (file) => favorites.some(f => f.file_path === file.path);

  const renderPreviewContent = (file) => {
    const ext = file?.extension?.toLowerCase();
    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
    const isPdfFile = ext === 'pdf';
    const isExcelFile = ['xls', 'xlsx', 'csv'].includes(ext);
    const Icon = getFileIcon(ext);
    const colorClass = getFileColor(ext);

    if (isImg && file.previewUrl) {
      return (
        <img 
          src={file.previewUrl} 
          alt={file.name}
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      );
    }
    
    if (isPdfFile) {
      return <PdfViewer file={file} />;
    }
    
    if (isExcelFile) {
      return <ExcelViewer file={file} />;
    }

    return (
      <div className="text-center">
        <div className={`w-24 h-24 rounded-2xl ${colorClass} flex items-center justify-center mx-auto mb-4`}>
          <Icon className="h-12 w-12" />
        </div>
        <p className="text-gray-500 mb-2">Preview não disponível</p>
        <p className="text-gray-400 text-sm">{file.name}</p>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex"
        onClick={onClose}
      >
        {/* Sidebar - File List */}
        {files.length > 1 && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="w-64 bg-white/95 backdrop-blur-xl border-r flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  Arquivos Selecionados
                </h3>
                <Badge variant="secondary">{files.length}</Badge>
              </div>
              
              <div className="flex gap-1">
                <Button
                  variant={viewMode === 'single' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 h-7 ${viewMode === 'single' ? 'bg-emerald-600' : ''}`}
                  onClick={() => setViewMode('single')}
                >
                  <LayoutList className="h-3 w-3 mr-1" />
                  Individual
                </Button>
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 h-7 ${viewMode === 'grid' ? 'bg-emerald-600' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="h-3 w-3 mr-1" />
                  Grade
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {files.map((file, index) => {
                  const Icon = getFileIcon(file.extension);
                  const colorClass = getFileColor(file.extension);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => setActiveIndex(index)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all text-left ${
                        activeIndex === index 
                          ? 'bg-emerald-100 border border-emerald-300' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-400 uppercase">
                          {file.extension}
                        </p>
                      </div>
                      {isFavorite(file) && (
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </motion.div>
        )}

        {/* Main Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="flex-1 flex flex-col bg-white/95 backdrop-blur-xl m-4 rounded-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              {(() => {
                const Icon = getFileIcon(activeFile?.extension);
                const colorClass = getFileColor(activeFile?.extension);
                return (
                  <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                );
              })()}
              <div>
                <h3 className="font-semibold text-gray-800 truncate max-w-[400px]">
                  {activeFile?.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 uppercase">{activeFile?.extension}</p>
                  {files.length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      {activeIndex + 1} de {files.length}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {files.length > 1 && viewMode === 'single' && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    disabled={activeIndex === files.length - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Preview Area */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'single' ? (
              <div className="h-full flex items-center justify-center p-6 bg-gray-100">
                {renderPreviewContent(activeFile)}
              </div>
            ) : (
              <ScrollArea className="h-full p-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {files.map((file, index) => {
                    const Icon = getFileIcon(file.extension);
                    const colorClass = getFileColor(file.extension);
                    const isImg = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(file.extension?.toLowerCase());
                    
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => {
                          setActiveIndex(index);
                          setViewMode('single');
                        }}
                      >
                        <div className="h-32 bg-gray-100 flex items-center justify-center">
                          {isImg && file.previewUrl ? (
                            <img 
                              src={file.previewUrl} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className={`w-16 h-16 rounded-xl ${colorClass} flex items-center justify-center`}>
                              <Icon className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-400">{file.size}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}
          </div>
          
          {/* Footer Actions */}
          <div className="p-4 border-t bg-gray-50 flex items-center gap-2">
            <Button 
              onClick={() => onOpen(activeFile)}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir no Aplicativo
            </Button>
            <Button 
              variant="outline"
              onClick={() => onDownload(activeFile)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => onToggleFavorite(activeFile)}
            >
              {isFavorite(activeFile) ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}