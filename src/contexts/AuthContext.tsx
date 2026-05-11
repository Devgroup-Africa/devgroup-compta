import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiService } from '../services/api';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'accountant' | 'manager' | 'viewer';
  isActive: boolean;
  permissions?: Array<{
    module: string;
    actions: string[];
  }>;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login(email, password);
      if (response.data) {
        setUser(response.data.user);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    
    // Admin a tous les droits
    if (user.role === 'admin') return true;
    
    // Vérifier les permissions spécifiques
    if (user.permissions) {
      const modulePermission = user.permissions.find(p => p.module === module);
      return modulePermission?.actions.includes(action) || false;
    }
    
    // Permissions par défaut selon le rôle
    switch (user.role) {
      case 'accountant':
        return ['read', 'write'].includes(action);
      case 'manager':
        return action === 'read';
      case 'viewer':
        return action === 'read';
      default:
        return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};