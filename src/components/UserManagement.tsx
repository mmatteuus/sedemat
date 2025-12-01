import { useEffect, useState } from 'react';
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
import { api } from '@/lib/api';
import { Department, User } from '@/types';

interface FormState {
  id?: string;
  name: string;
  cpf: string;
  login: string;
  role: User['role'];
  password?: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: '',
  cpf: '',
  login: '',
  role: 'SERVIDOR',
  password: '',
  active: true,
};

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const loadData = async () => {
    try {
      const [usersData, departmentsData] = await Promise.all([api.listUsers(), api.listDepartments()]);
      setUsers(usersData);
      setDepartments(departmentsData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: 'Verifique o acesso ao banco local',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleActive = async (user: User) => {
    try {
      const updated = await api.toggleUserStatus({ id: user.id, active: !user.active });
      setUsers((current) => current.map((u) => (u.id === updated.id ? updated : u)));
      toast({
        title: 'Status atualizado',
        description: `Usuario ${updated.active ? 'ativado' : 'inativado'}`,
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar status',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const handleSaveUser = async () => {
    if (!form.name || !form.cpf || !form.login) {
      toast({
        title: 'Campos obrigatorios',
        description: 'Preencha nome, CPF e login',
        variant: 'destructive',
      });
      return;
    }

    try {
      const saved = await api.saveUser({
        user: {
          id: form.id,
          name: form.name,
          cpf: form.cpf,
          login: form.login,
          role: form.role,
          active: form.active,
        },
        password: form.password,
      });

      setUsers((current) => {
        const exists = current.some((u) => u.id === saved.id);
        if (exists) {
          return current.map((u) => (u.id === saved.id ? saved : u));
        }
        return [...current, saved];
      });

      setDialogOpen(false);
      setForm(emptyForm);
      toast({
        title: 'Usuario salvo',
        description: 'Dados registrados com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar usuario',
        description: 'Confira os campos e tente novamente',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (user: User) => {
    setForm({
      id: user.id,
      name: user.name,
      cpf: user.cpf,
      login: user.login,
      role: user.role,
      password: '',
      active: user.active,
    });
    setDialogOpen(true);
  };

  const maskNumbers = (value: string) => value.replace(/\D/g, '').slice(0, 11);

  const departmentSummary = (user: User) => {
    const names = user.departments
      .map((id) => departments.find((d) => d.id === id)?.name)
      .filter(Boolean);
    return names.join(', ') || 'Sem permissoes';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gerenciamento de Usuarios</CardTitle>
            <CardDescription>Cadastre e mantenha logins de acesso</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setForm(emptyForm)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Novo usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{form.id ? 'Editar usuario' : 'Novo usuario'}</DialogTitle>
                <DialogDescription>Regra inicial: primeira letra do nome + 6 primeiros digitos do CPF</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input
                      placeholder="Digite o nome"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input
                      placeholder="Apenas numeros"
                      value={form.cpf}
                      onChange={(e) => setForm({ ...form, cpf: maskNumbers(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Login</Label>
                    <Input
                      placeholder="Login de acesso"
                      value={form.login}
                      onChange={(e) => setForm({ ...form, login: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Papel</Label>
                    <Select
                      value={form.role}
                      onValueChange={(value) => setForm({ ...form, role: value as User['role'] })}
                    >
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
                    <Label>Senha (opcional)</Label>
                    <Input
                      type="password"
                      placeholder="Deixe vazio para manter a senha atual"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2 col-span-2">
                    <Switch
                      id="active-user"
                      checked={form.active}
                      onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                    />
                    <Label htmlFor="active-user">Usuario ativo</Label>
                  </div>
                </div>
                <Button onClick={handleSaveUser} className="w-full">
                  Salvar usuario
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
              <TableHead className="text-right">Acoes</TableHead>
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
                  <Switch checked={user.active} onCheckedChange={() => handleToggleActive(user)} />
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">{departmentSummary(user)}</span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(user)}>
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
