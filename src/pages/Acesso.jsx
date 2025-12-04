import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FolderTree, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Acesso() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('sedemat_user');
    if (storedUser) {
      navigate(createPageUrl('Home'));
    }
  }, [navigate]);

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 11);
  };

  const handleCPFChange = (e) => {
    setCpf(formatCPF(e.target.value));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (cpf.length !== 11) {
      setError('CPF deve conter 11 dígitos');
      return;
    }
    
    if (!senha) {
      setError('Digite sua senha');
      return;
    }

    setIsLoading(true);
    
    try {
      // Buscar usuário pelo CPF
      const users = await base44.entities.AppUser.filter({ cpf: cpf, ativo: true });
      
      if (users.length === 0) {
        setError('Usuário não encontrado ou inativo');
        setIsLoading(false);
        return;
      }
      
      const user = users[0];
      
      // Verificar senha
      if (user.senha !== senha) {
        setError('Senha incorreta');
        setIsLoading(false);
        return;
      }
      
      // Salvar sessão
      localStorage.setItem('sedemat_user', JSON.stringify(user));
      
      // Redirecionar para home
      navigate(createPageUrl('Home'));
      
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative"
      >
        <Card className="border-0 shadow-2xl shadow-emerald-500/10 bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2 pt-8">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30"
            >
              <FolderTree className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">Pastas SEDEMAT</h1>
            <p className="text-gray-500 text-sm mt-1">Sistema de Arquivos da Secretaria</p>
          </CardHeader>
          
          <CardContent className="p-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cpf" className="text-gray-700 font-medium">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  placeholder="Digite apenas números"
                  value={cpf}
                  onChange={handleCPFChange}
                  className="h-12 text-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-400">Apenas números, sem pontos ou traços</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senha" className="text-gray-700 font-medium">Senha</Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={senha}
                    onChange={(e) => { setSenha(e.target.value); setError(''); }}
                    className="h-12 text-lg pr-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-600 text-sm"
                >
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 text-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-center text-xs text-gray-400">
                Para teste: CPF <span className="font-mono bg-gray-100 px-1 rounded">12345678901</span> / Senha <span className="font-mono bg-gray-100 px-1 rounded">a123456</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <p className="text-center text-gray-400 text-xs mt-6">
          SEDEMAT - Secretaria de Desenvolvimento Econômico e Meio Ambiente
        </p>
      </motion.div>
    </div>
  );
}