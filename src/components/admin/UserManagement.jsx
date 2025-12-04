import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Pencil, 
  Search, 
  UserCheck, 
  UserX,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    login: '',
    senha: '',
    papel: 'SERVIDOR',
    ativo: true,
    departamentos: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, deptsData] = await Promise.all([
        base44.entities.AppUser.list(),
        base44.entities.Department.filter({ ativo: true })
      ]);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDefaultPassword = (name, cpf) => {
    if (!name || !cpf) return '';
    const firstLetter = name.charAt(0).toLowerCase();
    const cpfDigits = cpf.replace(/\D/g, '').slice(0, 6);
    return firstLetter + cpfDigits;
  };

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        nome: user.nome || '',
        cpf: user.cpf || '',
        login: user.login || '',
        senha: '',
        papel: user.papel || 'SERVIDOR',
        ativo: user.ativo !== false,
        departamentos: user.departamentos || []
      });
    } else {
      setEditingUser(null);
      setFormData({
        nome: '',
        cpf: '',
        login: '',
        senha: '',
        papel: 'SERVIDOR',
        ativo: true,
        departamentos: []
      });
    }
    setShowPassword(false);
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        login: formData.login || formData.cpf,
        senha: formData.senha || (editingUser ? undefined : generateDefaultPassword(formData.nome, formData.cpf))
      };

      // Remove senha if empty on edit
      if (editingUser && !dataToSave.senha) {
        delete dataToSave.senha;
      }

      if (editingUser) {
        await base44.entities.AppUser.update(editingUser.id, dataToSave);
      } else {
        await base44.entities.AppUser.create(dataToSave);
      }

      await loadData();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving user:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await base44.entities.AppUser.update(user.id, { ativo: !user.ativo });
      await loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredUsers = users.filter(user => 
    user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf?.includes(searchTerm)
  );

  const getDepartmentNames = (deptIds = []) => {
    return deptIds
      .map(id => departments.find(d => d.id === id)?.nome)
      .filter(Boolean)
      .join(', ') || '-';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            onClick={() => handleOpenDialog()}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Departamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group"
                  >
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>{user.login || user.cpf}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.papel === 'GESTOR_TI' ? 'default' : 'secondary'}
                        className={user.papel === 'GESTOR_TI' ? 'bg-emerald-600' : ''}
                      >
                        {user.papel === 'GESTOR_TI' ? 'Gestor TI' : 'Servidor'}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {getDepartmentNames(user.departamentos)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.ativo ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                            <UserX className="h-3 w-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(user)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={user.ativo}
                          onCheckedChange={() => handleToggleStatus(user)}
                        />
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum usuário encontrado</p>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Altere os dados do usuário conforme necessário.'
                : 'Preencha os dados para criar um novo usuário.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Digite o nome completo"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => {
                    const cpf = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setFormData({
                      ...formData, 
                      cpf,
                      login: formData.login || cpf
                    });
                  }}
                  placeholder="Apenas números"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login">Login</Label>
                <Input
                  id="login"
                  value={formData.login}
                  onChange={(e) => setFormData({...formData, login: e.target.value})}
                  placeholder="Padrão: CPF"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="senha">
                {editingUser ? 'Nova Senha (deixe vazio para manter)' : 'Senha'}
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  placeholder={editingUser ? "Deixe vazio para manter" : "Padrão: letra + 6 dígitos"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!editingUser && (
                <p className="text-xs text-gray-400">
                  Padrão: primeira letra do nome + 6 primeiros dígitos do CPF
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="papel">Papel</Label>
              <Select
                value={formData.papel}
                onValueChange={(value) => setFormData({...formData, papel: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o papel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SERVIDOR">Servidor</SelectItem>
                  <SelectItem value="GESTOR_TI">Gestor TI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Usuário Ativo</Label>
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData({...formData, ativo: checked})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving || !formData.nome || !formData.cpf}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}