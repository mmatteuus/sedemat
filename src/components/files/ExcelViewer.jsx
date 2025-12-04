import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  Grid3X3
} from "lucide-react";

// Simulated Excel data - in real app would parse from file
const generateMockExcelData = (fileName) => {
  const sheets = ['Planilha1', 'Dados', 'Resumo'];
  const headers = ['ID', 'Nome', 'Valor', 'Data', 'Status'];
  const rows = Array.from({ length: 15 }, (_, i) => ({
    ID: i + 1,
    Nome: `Item ${i + 1}`,
    Valor: `R$ ${(Math.random() * 1000).toFixed(2)}`,
    Data: `${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}/01/2025`,
    Status: ['Ativo', 'Pendente', 'Concluído'][Math.floor(Math.random() * 3)]
  }));
  
  return { sheets, headers, rows };
};

export default function ExcelViewer({ file }) {
  const [activeSheet, setActiveSheet] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const data = generateMockExcelData(file?.name);
  const { sheets, headers, rows } = data;
  
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const visibleRows = rows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="flex flex-col h-full">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 p-2 bg-gray-100 border-b overflow-x-auto">
        <FileSpreadsheet className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
        {sheets.map((sheet, index) => (
          <Button
            key={sheet}
            variant={activeSheet === index ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveSheet(index)}
            className={`h-7 text-xs ${
              activeSheet === index 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'hover:bg-gray-200'
            }`}
          >
            {sheet}
          </Button>
        ))}
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-green-50">
              <TableHead className="w-10 text-center text-xs text-gray-500 font-normal">
                #
              </TableHead>
              {headers.map((header, index) => (
                <TableHead 
                  key={header} 
                  className="text-xs font-semibold text-gray-700 border-l"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-gray-400">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {header}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleRows.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-green-50/50">
                <TableCell className="text-center text-xs text-gray-400 bg-gray-50 border-r">
                  {startIndex + rowIndex + 1}
                </TableCell>
                {headers.map((header) => (
                  <TableCell 
                    key={header} 
                    className="text-sm border-l py-2"
                  >
                    {header === 'Status' ? (
                      <Badge 
                        variant="secondary"
                        className={`text-xs ${
                          row[header] === 'Ativo' ? 'bg-green-100 text-green-700' :
                          row[header] === 'Pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {row[header]}
                      </Badge>
                    ) : (
                      row[header]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with Pagination */}
      <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Grid3X3 className="h-3 w-3" />
          <span>{rows.length} linhas × {headers.length} colunas</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <span>Página {currentPage} de {totalPages}</span>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}