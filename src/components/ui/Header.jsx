import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Settings, FolderTree } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Header({ user, onLogout, showAdmin = false }) {
  return (
    <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={createPageUrl("Home")} className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <FolderTree className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Pastas SEDEMAT</h1>
              <p className="text-emerald-100 text-xs">Sistema de Arquivos</p>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Olá, {user?.nome?.split(' ')[0]}</p>
              <p className="text-xs text-emerald-200">
                {user?.papel === 'GESTOR_TI' ? 'Gestor TI' : 'Servidor'}
              </p>
            </div>
            
            {showAdmin && user?.papel === 'GESTOR_TI' && (
              <Link to={createPageUrl("Admin")}>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Administração
                </Button>
              </Link>
            )}
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onLogout}
              className="text-white hover:bg-white/20"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}