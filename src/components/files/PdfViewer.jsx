import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Maximize2,
  Minimize2
} from "lucide-react";

export default function PdfViewer({ file }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handlePrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const handlePageInputChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setCurrentPage(value);
    }
  };

  // Simulated PDF URL - in real app would use actual file URL
  const pdfUrl = file?.previewUrl || file?.path;

  return (
    <div className={`flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-2 bg-gray-100 rounded-t-lg border-b">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handlePrevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 text-sm">
            <Input
              type="number"
              value={currentPage}
              onChange={handlePageInputChange}
              className="w-12 h-7 text-center text-sm p-1"
              min={1}
              max={totalPages}
            />
            <span className="text-gray-500">de {totalPages}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleNextPage}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={zoom <= 50}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={zoom >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Other Controls */}
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleRotate}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div 
        className={`flex-1 overflow-auto bg-gray-200 flex items-center justify-center p-4 ${
          isFullscreen ? 'h-[calc(100vh-48px)]' : 'min-h-[400px] max-h-[500px]'
        }`}
      >
        <div 
          className="bg-white shadow-lg"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease'
          }}
        >
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#page=${currentPage}`}
              className="w-[600px] h-[800px] border-0"
              title={file?.name || 'PDF Document'}
              onLoad={(e) => {
                // In real implementation, would get page count from PDF
                setTotalPages(10); // Simulated
              }}
            />
          ) : (
            <div className="w-[600px] h-[800px] flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium">Documento PDF</p>
                <p className="text-sm">{file?.name}</p>
                <p className="text-xs mt-2">Página {currentPage} de {totalPages}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}