import React from 'react';
import { ChevronRight, Home } from "lucide-react";
import { motion } from 'framer-motion';

export default function Breadcrumb({ path, onNavigate }) {
  const parts = path.filter(p => p);
  
  return (
    <nav className="flex items-center gap-1 text-sm overflow-x-auto pb-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate([])}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Início</span>
      </motion.button>
      
      {parts.map((part, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate(parts.slice(0, index + 1))}
            className={`px-3 py-1.5 rounded-lg transition-colors truncate max-w-[150px] ${
              index === parts.length - 1
                ? 'bg-emerald-600 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {part}
          </motion.button>
        </React.Fragment>
      ))}
    </nav>
  );
}