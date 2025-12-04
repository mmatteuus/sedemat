import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Save,
  Loader2,
  Users,
  Folder,
  Shield,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function AccessManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        base44.entities.AppUser.filter({ ativo: true }),
        base44.entities.Department.filter({ ativo: true })
      ]);
      setUsers(usersData);
      setDepartments(deptsData.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    setSelectedDepts(user?.departamentos || []);
  };

  const handleDeptToggle = (deptId) => {
    if (selectedDepts.includes(deptId)) {
      setSelectedDepts(selectedDepts.filter(id => id !== deptId));
    } else {
      setSelectedDepts([...selectedDepts, deptId]);
    }
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    
    setIsSaving(true);
    try {
      await base44.entities.AppUser.update(selectedUser.id, {
        departamentos: selectedDepts
      });
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, departamentos: selectedDepts }
          : u
      ));
      
      toast.success('Permissões salvas com sucesso!');
    } catch (err) {
      console.error('Error saving permissions:', err);
      toast.error('Erro ao salvar permissões');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf?.includes(searchTerm)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Users List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-emerald-600" />
            Usuários
          </CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar usuário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-y-auto">
          <div className="space-y-1">
            {filteredUsers.map((user) => (
              <motion.button
                key={user.id}
                whileHover={{ x: 4 }}
                onClick={() => handleUserSelect(user.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedUser?.id === user.id 
                    ? 'bg-emerald-100 border border-emerald-300' 
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <p className="font-medium text-gray-800">{user.nome}</p>
                <p className="text-sm text-gray-500">{user.cpf}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {(user.departamentos || []).length} departamento(s)
                </p>
              </motion.button>
            ))}
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhum usuário encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Departments Selection */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Folder className="h-5 w-5 text-emerald-600" />
              Departamentos
            </CardTitle>
            {selectedUser && (
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Permissões
                  </>
                )}
              </Button>
            )}
          </div>
          {selectedUser && (
            <p className="text-sm text-gray-500 mt-2">
              Configurando acessos para: <span className="font-medium text-emerald-600">{selectedUser.nome}</span>
            </p>
          )}
        </CardHeader>
        <CardContent>
          {selectedUser ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {departments.map((dept) => {
                const isSelected = selectedDepts.includes(dept.id);
                const isDefault = dept.acesso_padrao;
                
                return (
                  <motion.div
                    key={dept.id}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      isDefault 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : isSelected 
                          ? 'bg-emerald-50 border-emerald-400' 
                          : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !isDefault && handleDeptToggle(dept.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${isDefault ? 'opacity-50' : ''}`}>
                        {isDefault ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Checkbox 
                            checked={isSelected}
                            className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Folder className={`h-4 w-4 ${isSelected || isDefault ? 'text-emerald-600' : 'text-gray-400'}`} />
                          <span className={`font-medium ${isSelected || isDefault ? 'text-emerald-800' : 'text-gray-700'}`}>
                            {dept.nome}
                          </span>
                        </div>
                        {isDefault && (
                          <div className="flex items-center gap-1 mt-2">
                            <Shield className="h-3 w-3 text-emerald-600" />
                            <span className="text-xs text-emerald-600">Acesso padrão para todos</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Selecione um usuário</p>
              <p className="text-gray-400 text-sm">Escolha um usuário na lista para configurar seus acessos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}