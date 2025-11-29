import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Folders } from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import DepartmentManagement from '@/components/DepartmentManagement';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user?.role !== 'GESTOR_TI') {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-primary/20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              size="icon"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Administração</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Folders className="h-4 w-4" />
              Departamentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="departments">
            <DepartmentManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
