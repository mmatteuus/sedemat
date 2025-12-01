import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { FolderPlus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Department } from '@/types';

const emptyForm: Partial<Department> = {
  id: undefined,
  name: '',
  path: '',
  defaultAccess: false,
  active: true,
};

const DepartmentManagement = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Partial<Department>>(emptyForm);

  const loadDepartments = () => {
    api
      .listDepartments()
      .then(setDepartments)
      .catch(() =>
        toast({
          title: 'Erro ao carregar departamentos',
          description: 'Confirme se o compartilhamento esta disponivel',
          variant: 'destructive',
        }),
      );
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleToggleActive = async (dept: Department) => {
    try {
      const updated = await api.toggleDepartmentStatus({ id: dept.id, active: !dept.active });
      setDepartments((current) => current.map((d) => (d.id === updated.id ? updated : d)));
      toast({
        title: 'Status atualizado',
        description: `Departamento ${updated.active ? 'ativo' : 'inativo'}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleToggleDefault = async (dept: Department) => {
    try {
      const updated = await api.saveDepartment({ ...dept, defaultAccess: !dept.defaultAccess });
      setDepartments((current) => current.map((d) => (d.id === updated.id ? updated : d)));
      toast({
        title: 'Acesso padrao atualizado',
        description: `${updated.name} ${updated.defaultAccess ? 'liberado' : 'removido'} para todos`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar acesso padrao',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.path) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Informe nome e caminho da pasta',
        variant: 'destructive',
      });
      return;
    }
    try {
      const saved = await api.saveDepartment(form);
      setDepartments((current) => {
        const exists = current.some((d) => d.id === saved.id);
        if (exists) {
          return current.map((d) => (d.id === saved.id ? saved : d));
        }
        return [...current, saved];
      });
      setDialogOpen(false);
      setForm(emptyForm);
      toast({
        title: 'Departamento salvo',
        description: 'Configuracao registrada com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar departamento',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (dept: Department) => {
    setForm(dept);
    setDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Departamentos</CardTitle>
            <CardDescription>Configure os setores mapeados para a pasta de rede</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(emptyForm)}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{form.id ? 'Editar departamento' : 'Novo departamento'}</DialogTitle>
                <DialogDescription>Nome publico e caminho fisico na rede</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do departamento</Label>
                  <Input
                    placeholder="Ex: ADMINISTRATIVO"
                    value={form.name ?? ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Caminho da pasta</Label>
                  <Input
                    placeholder="\\\\serv-arquivos\\ARQUIVOS\\MEIO AMBIENTE\\"
                    value={form.path ?? ''}
                    onChange={(e) => setForm({ ...form, path: e.target.value })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="default-access"
                    checked={form.defaultAccess}
                    onCheckedChange={(checked) => setForm({ ...form, defaultAccess: checked })}
                  />
                  <Label htmlFor="default-access">Liberar por padrao para todos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                  />
                  <Label htmlFor="active">Departamento ativo</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  Salvar departamento
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Caminho</TableHead>
              <TableHead>Acesso padrao</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell className="font-medium">{dept.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                  {dept.path}
                </TableCell>
                <TableCell>
                  <Switch checked={dept.defaultAccess} onCheckedChange={() => handleToggleDefault(dept)} />
                </TableCell>
                <TableCell>
                  <Switch checked={dept.active} onCheckedChange={() => handleToggleActive(dept)} />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" onClick={() => startEdit(dept)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DepartmentManagement;
