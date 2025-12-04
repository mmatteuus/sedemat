import React from 'react';
import { motion } from 'framer-motion';
import { 
  Folder, 
  FileText, 
  Scale, 
  Building2, 
  Search, 
  Palmtree, 
  TrendingUp,
  ScanLine,
  FolderOpen,
  Shield
} from "lucide-react";

const iconMap = {
  'ADMINISTRATIVO': Building2,
  'LICENCIAMENTO': FileText,
  'FISCALIZAÇÃO': Search,
  'JURIDICO': Scale,
  'TURISMO': Palmtree,
  'DESENVOLVIMENTO ECONOMICO': TrendingUp,
  'GERAL MEIO AMBIENTE': Folder,
  'GERAL SEDEMAT': FolderOpen,
  'SCAN': ScanLine,
  'SCAN MEIO AMBIENTE': ScanLine,
  'default': Folder
};

const colorMap = {
  'ADMINISTRATIVO': 'from-emerald-500 to-emerald-600',
  'LICENCIAMENTO': 'from-teal-500 to-teal-600',
  'FISCALIZAÇÃO': 'from-green-500 to-green-600',
  'JURIDICO': 'from-emerald-600 to-emerald-700',
  'TURISMO': 'from-lime-500 to-lime-600',
  'DESENVOLVIMENTO ECONOMICO': 'from-green-600 to-green-700',
  'GERAL MEIO AMBIENTE': 'from-teal-600 to-teal-700',
  'GERAL SEDEMAT': 'from-emerald-400 to-emerald-500',
  'SCAN': 'from-slate-500 to-slate-600',
  'SCAN MEIO AMBIENTE': 'from-slate-500 to-slate-600',
  'default': 'from-emerald-500 to-emerald-600'
};

export default function DepartmentCard({ department, onClick, index }) {
  const Icon = iconMap[department.nome] || iconMap['default'];
  const gradient = colorMap[department.nome] || colorMap['default'];
  
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(department)}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      <div className="relative p-6 flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:bg-white/20 transition-all duration-300`}>
          <Icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
        </div>
        
        <h3 className="font-semibold text-gray-800 group-hover:text-white transition-colors text-sm leading-tight">
          {department.nome}
        </h3>
        
        {department.acesso_padrao && (
          <span className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700 group-hover:bg-white/20 group-hover:text-white transition-colors">
            <Shield className="h-3 w-3" />
            Acesso Geral
          </span>
        )}
      </div>
    </motion.button>
  );
}