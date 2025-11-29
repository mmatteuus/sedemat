import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const success = await login(cpf, password);
    
    if (success) {
      toast({
        title: 'Login realizado',
        description: 'Bem-vindo ao sistema Pastas SEDEMAT',
      });
      navigate('/');
    } else {
      toast({
        title: 'Erro no login',
        description: 'CPF ou senha inválidos',
        variant: 'destructive',
      });
    }
    
    setLoading(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.substring(0, 11);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-primary/20">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Folder className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Pastas SEDEMAT</CardTitle>
          <CardDescription>Sistema de Gestão de Arquivos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                type="text"
                placeholder="Digite apenas os números"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                required
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-primary/30 focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <div className="mt-6 text-sm text-muted-foreground text-center">
            <p>Usuário teste: <strong>12345678901</strong></p>
            <p>Senha: <strong>admin</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
