import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, SortAsc } from "lucide-react";

export default function FileFilters({ 
  searchTerm, 
  onSearchChange, 
  filterType, 
  onFilterChange,
  sortBy,
  onSortChange 
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar por nome do arquivo..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>
      
      <div className="flex gap-2">
        <Select value={filterType} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[130px] bg-white">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="word">Word</SelectItem>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px] bg-white">
            <SortAsc className="h-4 w-4 mr-2 text-gray-400" />
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nome</SelectItem>
            <SelectItem value="date">Data</SelectItem>
            <SelectItem value="type">Tipo</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}