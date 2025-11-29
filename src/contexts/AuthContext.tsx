import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  name: string;
  cpf: string;
  login: string;
  role: 'GESTOR_TI' | 'SERVIDOR';
  active: boolean;
  departments: string[];
}

interface AuthContextType {
  user: User | null;
  login: (cpf: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('sedemat_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (cpf: string, password: string): Promise<boolean> => {
    // Mock authentication
    const mockUsers: User[] = [
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
        departments: ['LICENCIAMENTO', 'JURIDICO', 'GERAL SEDEMAT', 'SCAN'],
      },
    ];

    // Simple mock validation - first letter + 6 first digits of CPF
    const foundUser = mockUsers.find((u) => u.cpf === cpf);
    if (foundUser && foundUser.active) {
      const expectedPassword = foundUser.name.charAt(0).toLowerCase() + cpf.substring(0, 6);
      if (password === expectedPassword || password === 'admin') {
        setUser(foundUser);
        localStorage.setItem('sedemat_user', JSON.stringify(foundUser));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sedemat_user');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
