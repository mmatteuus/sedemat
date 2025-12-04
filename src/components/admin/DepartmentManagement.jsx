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
  Plus, 
  Pencil, 
  Search, 
  Folder,
  FolderCheck,
  FolderX,
  Loader2,
  Shield
} from "lucide-react";

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nome: '',
    caminho: '',
    acesso_padrao: false,
    ativo: true,
    ordem: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await base44.entities.Department.list();
      setDepartments(data.sort((a, b) => (a.ordem || 0) - (b.ordem || 0)));
    } catch (err) {
      console.error('Error loading departments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        nome: dept.nome || '',
        caminho: dept.caminho || '',
        acesso_padrao: dept.acesso_padrao || false,
        ativo: dept.ativo !== false,
        ordem: dept.ordem || 0
      });
    } else {
      setEditingDept(null);
      setFormData({
        nome: '',
        caminho: '\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\',
        acesso_padrao: false,
        ativo: true,
        ordem: departments.length
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingDept) {
        await base44.entities.Department.update(editingDept.id, formData);
      } else {
        await base44.entities.Department.create(formData);
      }
      await loadData();
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error saving department:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async (dept) => {
    try {
      await base44.entities.Department.update(dept.id, { ativo: !dept.ativo });
      await loadData();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const filteredDepartments = departments.filter(dept => 
    dept.nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              placeholder="Buscar departamento..."
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
            Novo Departamento
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ordem</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Caminho</TableHead>
                <TableHead>Acesso Padrão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filteredDepartments.map((dept, index) => (
                  <motion.tr
                    key={dept.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="group"
                  >
                    <TableCell className="font-medium">{dept.ordem || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-emerald-500" />
                        <span className="font-medium">{dept.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate text-gray-500 text-sm">
                      {dept.caminho}
                    </TableCell>
                    <TableCell>
                      {dept.acesso_padrao ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                          <Shield className="h-3 w-3 mr-1" />
                          Sim
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {dept.ativo ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          <FolderCheck className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                          <FolderX className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(dept)}
                          className="h-8 w-8"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={dept.ativo}
                          onCheckedChange={() => handleToggleStatus(dept)}
                        />
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        
        {filteredDepartments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum departamento encontrado</p>
          </div>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingDept ? 'Editar Departamento' : 'Novo Departamento'}
            </DialogTitle>
            <DialogDescription>
              {editingDept 
                ? 'Altere os dados do departamento conforme necessário.'
                : 'Configure um novo departamento para o sistema.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Departamento</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value.toUpperCase()})}
                placeholder="Ex: LICENCIAMENTO"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="caminho">Caminho da Pasta</Label>
              <Input
                id="caminho"
                value={formData.caminho}
                onChange={(e) => setFormData({...formData, caminho: e.target.value})}
                placeholder="\\serv-arquivos\ARQUIVOS\MEIO AMBIENTE\..."
              />
              <p className="text-xs text-gray-400">
                Caminho completo da pasta na rede
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ordem">Ordem de Exibição</Label>
              <Input
                id="ordem"
                type="number"
                value={formData.ordem}
                onChange={(e) => setFormData({...formData, ordem: parseInt(e.target.value) || 0})}
                min={0}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <Label htmlFor="acesso_padrao" className="text-emerald-800">Acesso Padrão para Todos</Label>
                <p className="text-xs text-emerald-600 mt-1">
                  Se ativado, todos os usuários terão acesso a este departamento
                </p>
              </div>
              <Switch
                id="acesso_padrao"
                checked={formData.acesso_padrao}
                onCheckedChange={(checked) => setFormData({...formData, acesso_padrao: checked})}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="ativo">Departamento Ativo</Label>
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
              disabled={isSaving || !formData.nome || !formData.caminho}
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