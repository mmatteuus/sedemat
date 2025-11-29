import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Edit, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MockUser {
  id: string;
  name: string;
  cpf: string;
  login: string;
  role: 'GESTOR_TI' | 'SERVIDOR';
  active: boolean;
  departments: string[];
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<MockUser[]>([
    {
      id: '1',
      name: 'Admin Silva',
      cpf: '12345678901',
      login: '12345678901',
      role: 'GESTOR_TI',
      active: true,
      departments: ['ALL'],
    },
    {
      id: '2',
      name: 'João Santos',
      cpf: '98765432100',
      login: '98765432100',
      role: 'SERVIDOR',
      active: true,
      departments: ['LICENCIAMENTO', 'JURIDICO'],
    },
  ]);

  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggleActive = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, active: !u.active } : u)));
    toast({
      title: 'Status atualizado',
      description: 'O status do usuário foi alterado',
    });
  };

  const handleSaveUser = () => {
    toast({
      title: 'Usuário salvo',
      description: 'As alterações foram salvas com sucesso',
    });
    setDialogOpen(false);
    setEditingUser(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuários</CardTitle>
            <CardDescription>Cadastre e gerencie os usuários do sistema</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingUser(null)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
                <DialogDescription>
                  Preencha os dados do usuário
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input placeholder="Digite o nome" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input placeholder="Apenas números" />
                  </div>
                  <div className="space-y-2">
                    <Label>Login</Label>
                    <Input placeholder="Login de acesso" />
                  </div>
                  <div className="space-y-2">
                    <Label>Papel</Label>
                    <Select defaultValue="SERVIDOR">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVIDOR">Servidor</SelectItem>
                        <SelectItem value="GESTOR_TI">Gestor TI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Senha inicial</Label>
                    <Input type="password" placeholder="Defina a senha" />
                  </div>
                </div>
                <Button onClick={handleSaveUser} className="w-full">
                  Salvar Usuário
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
              <TableHead>CPF</TableHead>
              <TableHead>Login</TableHead>
              <TableHead>Papel</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Departamentos</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.cpf}</TableCell>
                <TableCell>{user.login}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'GESTOR_TI' ? 'default' : 'secondary'}>
                    {user.role === 'GESTOR_TI' ? 'Gestor TI' : 'Servidor'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={user.active}
                    onCheckedChange={() => handleToggleActive(user.id)}
                  />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {user.departments.join(', ')}
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Key className="h-4 w-4" />
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

export default UserManagement;
