import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Department, User } from '@/types';

const AccessControl = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.listUsers().then(setUsers);
    api.listDepartments().then(setDepartments);
  }, []);

  const defaultDepartments = useMemo(
    () => departments.filter((d) => d.defaultAccess && d.active).map((d) => d.id),
    [departments],
  );

  const handleUserChange = async (userId: string) => {
    setSelectedUserId(userId);
    if (!userId) {
      setSelectedDepartments([]);
      return;
    }
    try {
      const permissions = await api.getUserPermissions({ userId });
      const withDefaults = Array.from(new Set([...permissions, ...defaultDepartments]));
      setSelectedDepartments(withDefaults);
    } catch (error) {
      toast({
        title: 'Erro ao carregar acessos',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    }
  };

  const toggleDepartment = (deptId: string) => {
    if (defaultDepartments.includes(deptId)) return;
    setSelectedDepartments((current) =>
      current.includes(deptId) ? current.filter((id) => id !== deptId) : [...current, deptId],
    );
  };

  const savePermissions = async () => {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      await api.saveUserPermissions({ userId: selectedUserId, departmentIds: selectedDepartments });
      toast({
        title: 'Acessos atualizados',
        description: 'Permissoes salvas com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar',
        description: 'Tente novamente',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Acessos por usuario</CardTitle>
        <CardDescription>Defina quais pastas cada pessoa enxerga</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Usuario</Label>
          <Select value={selectedUserId} onValueChange={handleUserChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um usuario" />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name} ({user.role === 'GESTOR_TI' ? 'Gestor' : 'Servidor'})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedUserId && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              GERAL SEDEMAT e SCAN ficam ativos por padrao para todos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {departments
                .filter((d) => d.active)
                .map((dept) => (
                  <label
                    key={dept.id}
                    className="flex items-center gap-3 rounded-lg border p-3 hover:border-primary/60 transition-colors"
                  >
                    <Checkbox
                      checked={selectedDepartments.includes(dept.id)}
                      onCheckedChange={() => toggleDepartment(dept.id)}
                      disabled={defaultDepartments.includes(dept.id)}
                    />
                    <div>
                      <p className="font-medium">{dept.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{dept.path}</p>
                    </div>
                  </label>
                ))}
            </div>
            <Button className="w-full" onClick={savePermissions} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar acessos'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccessControl;
