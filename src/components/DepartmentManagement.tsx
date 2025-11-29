import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { FolderPlus, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockDepartments } from '@/data/mockData';

const DepartmentManagement = () => {
  const { toast } = useToast();
  const [departments, setDepartments] = useState(mockDepartments);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleActive = (deptId: string) => {
    setDepartments(departments.map((d) => (d.id === deptId ? { ...d, active: !d.active } : d)));
    toast({
      title: 'Status atualizado',
      description: 'O status do departamento foi alterado',
    });
  };

  const handleToggleDefault = (deptId: string) => {
    setDepartments(departments.map((d) => (d.id === deptId ? { ...d, defaultAccess: !d.defaultAccess } : d)));
    toast({
      title: 'Acesso padrão atualizado',
      description: 'A configuração de acesso padrão foi alterada',
    });
  };

  const handleSave = () => {
    toast({
      title: 'Departamento salvo',
      description: 'As alterações foram salvas com sucesso',
    });
    setDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Departamentos</CardTitle>
            <CardDescription>Configure os departamentos e pastas do sistema</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Departamento</DialogTitle>
                <DialogDescription>Configure um novo departamento</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome do Departamento</Label>
                  <Input placeholder="Ex: ADMINISTRATIVO" />
                </div>
                <div className="space-y-2">
                  <Label>Caminho da Pasta</Label>
                  <Input placeholder="\\serv-arquivos\ARQUIVOS\MEIO AMBIENTE\..." />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="default-access" />
                  <Label htmlFor="default-access">Acesso padrão para todos</Label>
                </div>
                <Button onClick={handleSave} className="w-full">
                  Salvar Departamento
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
              <TableHead>Acesso Padrão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
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
                  <Switch
                    checked={dept.defaultAccess}
                    onCheckedChange={() => handleToggleDefault(dept.id)}
                  />
                </TableCell>
                <TableCell>
                  <Switch
                    checked={dept.active}
                    onCheckedChange={() => handleToggleActive(dept.id)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
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
