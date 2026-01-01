import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthUser, UserRole, OWNER_CREDENTIALS, ADMIN_ID, User } from '@/types/auth';
import { mockUsers, mockAdminPassword } from '@/data/mockData';

interface AuthContextType {
  user: AuthUser | null;
  users: User[];
  adminPassword: string;
  login: (id: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateAdminPassword: (newPassword: string) => boolean;
  getUserByMobile: (mobile: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [adminPassword, setAdminPassword] = useState<string>(mockAdminPassword);

  const login = useCallback((id: string, password: string): { success: boolean; error?: string } => {
    // Check Owner credentials
    if (id === OWNER_CREDENTIALS.id) {
      if (password === OWNER_CREDENTIALS.password) {
        setUser({ id, role: 'owner', name: 'Owner' });
        return { success: true };
      }
      return { success: false, error: 'Invalid owner password' };
    }

    // Check Admin credentials
    if (id === ADMIN_ID) {
      if (password === adminPassword) {
        setUser({ id, role: 'admin', name: 'Admin' });
        return { success: true };
      }
      return { success: false, error: 'Invalid admin password' };
    }

    // Check User (devotee) credentials
    const devotee = users.find(u => u.mobile_number === id);
    if (devotee) {
      const expectedPassword = id.slice(-4);
      if (password === expectedPassword) {
        setUser({ 
          id: devotee.id, 
          role: 'user', 
          name: devotee.name,
          mobile_number: devotee.mobile_number 
        });
        return { success: true };
      }
      return { success: false, error: 'Invalid password. Use last 4 digits of your mobile number.' };
    }

    return { success: false, error: 'User not found. Please check your ID.' };
  }, [adminPassword, users]);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addUser = useCallback((newUser: Omit<User, 'id' | 'created_at'>) => {
    const user: User = {
      ...newUser,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };
    setUsers(prev => [...prev, user]);
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  }, []);

  const updateAdminPassword = useCallback((newPassword: string): boolean => {
    if (newPassword.length < 4) return false;
    setAdminPassword(newPassword);
    return true;
  }, []);

  const getUserByMobile = useCallback((mobile: string): User | undefined => {
    return users.find(u => u.mobile_number === mobile);
  }, [users]);

  return (
    <AuthContext.Provider value={{
      user,
      users,
      adminPassword,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      updateAdminPassword,
      getUserByMobile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
