import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Folders, ShieldCheck, Copy, Save, Loader2 } from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import DepartmentManagement from '@/components/DepartmentManagement';
import AccessControl from '@/components/AccessControl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [basePath, setBasePath] = useState('');
  const [savedBasePath, setSavedBasePath] = useState('');
  const [savingBasePath, setSavingBasePath] = useState(false);

  if (user?.role !== 'GESTOR_TI') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    api
      .bootstrap()
      .then((data) => {
        setBasePath(data.basePath);
        setSavedBasePath(data.basePath);
      })
      .catch(() => {
        setBasePath('');
        setSavedBasePath('');
      });
  }, []);

  const copyPath = async () => {
    const normalized = basePath.trim();
    if (!normalized) return;
    await navigator.clipboard.writeText(normalized);
    toast({
      title: 'Caminho copiado',
      description: normalized,
    });
  };

  const handleSaveBasePath = async () => {
    const normalized = basePath.trim();
    if (!normalized) {
      toast({
        title: 'Informe o caminho',
        description: 'Defina o caminho da pasta principal antes de salvar',
        variant: 'destructive',
      });
      return;
    }

    setSavingBasePath(true);
    try {
      const updated = await api.updateBasePath(normalized);
      setBasePath(updated);
      setSavedBasePath(updated);
      toast({
        title: 'Caminho base atualizado',
        description: updated,
      });
    } catch (error) {
      toast({
        title: 'Erro ao salvar caminho',
        description: 'Confira se o caminho e valido e tente novamente',
        variant: 'destructive',
      });
    } finally {
      setSavingBasePath(false);
    }
  };

  const hasPendingBaseChange = !!basePath.trim() && basePath.trim() !== savedBasePath;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Administracao</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Caminho base da pasta de rede</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                value={basePath}
                onChange={(e) => setBasePath(e.target.value)}
                placeholder="\\\\servidor\\compartilhamento\\PASTA_PRINCIPAL"
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBasePath}
                  disabled={!hasPendingBaseChange || savingBasePath}
                >
                  {savingBasePath ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar caminho
                </Button>
                <Button variant="outline" onClick={copyPath} disabled={!basePath.trim()}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar caminho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-xl grid-cols-3">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Folders className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Acessos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>

          <TabsContent value="permissions">
            <AccessControl />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
