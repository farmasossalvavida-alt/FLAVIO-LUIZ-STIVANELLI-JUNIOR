import React, { createContext, useContext, useState, useEffect } from 'react';
import { Profile } from '../types/database';

interface AuthContextType {
  user: Profile | null;
  isAuthenticated: boolean;
  loginAs: (role: 'admin' | 'partner') => void;
  logout: () => void;
}

const DEFAULT_USERS: Record<'admin' | 'partner', Profile> = {
  admin: {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Flavio',
    email: 'flavio@privilegecare.com.br',
    role: 'admin',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  partner: {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Sócia',
    email: 'socia@privilegecare.com.br',
    role: 'partner',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USERS.admin,
  isAuthenticated: true,
  loginAs: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('privilege_current_user');
    if (saved === 'partner') return DEFAULT_USERS.partner;
    return DEFAULT_USERS.admin;
  });

  const loginAs = (role: 'admin' | 'partner') => {
    setUser(DEFAULT_USERS[role]);
    localStorage.setItem('privilege_current_user', role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('privilege_current_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
