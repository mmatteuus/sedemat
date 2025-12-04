import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import Header from "@/components/ui/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FolderCog, Shield, Loader2 } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement.jsx";
import DepartmentManagement from "@/components/admin/DepartmentManagement.jsx";
import AccessManagement from "@/components/admin/AccessManagement.jsx";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const storedUser = localStorage.getItem('sedemat_user');
    if (!storedUser) {
      navigate(createPageUrl('Acesso'));
      return;
    }
    
    const userData = JSON.parse(storedUser);
    
    // Only GESTOR_TI can access admin
    if (userData.papel !== 'GESTOR_TI') {
      navigate(createPageUrl('Home'));
      return;
    }
    
    setUser(userData);
    setIsLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('sedemat_user');
    navigate(createPageUrl('Acesso'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header user={user} onLogout={handleLogout} showAdmin={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Administração</h1>
            <p className="text-gray-500 mt-1">Gerencie usuários, departamentos e permissões de acesso</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white shadow-sm mb-6">
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </TabsTrigger>
              <TabsTrigger 
                value="departments" 
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <FolderCog className="h-4 w-4 mr-2" />
                Departamentos
              </TabsTrigger>
              <TabsTrigger 
                value="access" 
                className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700"
              >
                <Shield className="h-4 w-4 mr-2" />
                Acessos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="departments">
              <DepartmentManagement />
            </TabsContent>
            
            <TabsContent value="access">
              <AccessManagement />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}