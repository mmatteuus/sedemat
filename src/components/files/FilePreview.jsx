import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Image, 
  File,
  FileSpreadsheet,
  Star,
  StarOff,
  Calendar,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PdfViewer from "./PdfViewer";
import ExcelViewer from "./ExcelViewer";

const getFileIcon = (type) => {
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return Image;
  if (['pdf'].includes(ext)) return FileText;
  if (['doc', 'docx'].includes(ext)) return FileText;
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet;
  return File;
};

const getFileColor = (type) => {
  const ext = type?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return 'bg-purple-100 text-purple-600';
  if (['pdf'].includes(ext)) return 'bg-red-100 text-red-600';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'bg-green-100 text-green-600';
  return 'bg-emerald-100 text-emerald-600';
};

export default function FilePreview({ 
  file, 
  onClose, 
  onOpen, 
  onDownload,
  onToggleFavorite,
  isFavorite 
}) {
  if (!file) return null;
  
  const Icon = getFileIcon(file.extension);
  const colorClass = getFileColor(file.extension);
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(file.extension?.toLowerCase());
  const isPdf = file.extension?.toLowerCase() === 'pdf';
  const isExcel = ['xls', 'xlsx', 'csv'].includes(file.extension?.toLowerCase());
  
  const renderPreviewContent = () => {
    if (isImage && file.previewUrl) {
      return (
        <img 
          src={file.previewUrl} 
          alt={file.name}
          className="max-w-full max-h-[500px] rounded-lg shadow-lg object-contain"
        />
      );
    }
    
    if (isPdf) {
      return (
        <div className="w-full h-[500px]">
          <PdfViewer file={file} />
        </div>
      );
    }
    
    if (isExcel) {
      return (
        <div className="w-full h-[400px] bg-white rounded-lg overflow-hidden">
          <ExcelViewer file={file} />
        </div>
      );
    }
    
    return (
      <div className="text-center">
        <div className={`w-24 h-24 rounded-2xl ${colorClass} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
          <Icon className="h-12 w-12" />
        </div>
        <p className="text-gray-500 mb-2">
          Preview não disponível para este tipo de arquivo
        </p>
        <p className="text-gray-400 text-sm">
          Clique em "Abrir" para visualizar o arquivo completo
        </p>
      </div>
    );
  };
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-white rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-hidden ${
            isPdf || isExcel ? 'max-w-5xl' : 'max-w-3xl'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 truncate max-w-[300px]">
                  {file.name}
                </h3>
                <p className="text-xs text-gray-500 uppercase">{file.extension || 'Arquivo'}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Preview Area */}
          <div className={`bg-gray-100 flex items-center justify-center overflow-auto ${
            isPdf || isExcel ? 'p-0' : 'p-6 min-h-[300px]'
          }`}>
            {renderPreviewContent()}
          </div>
          
          {/* Info & Actions */}
          <div className="p-4 border-t">
            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-500">
              {file.size && (
                <div className="flex items-center gap-1">
                  <HardDrive className="h-4 w-4" />
                  <span>{file.size}</span>
                </div>
              )}
              {file.modifiedDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(file.modifiedDate), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                onClick={onOpen}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir no Aplicativo
              </Button>
              <Button 
                variant="outline"
                onClick={onDownload}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Baixar
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={onToggleFavorite}
              >
                {isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}