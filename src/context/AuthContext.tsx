import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { AuthUser, UserRole, OWNER_CREDENTIALS, ADMIN_ID, User } from '@/types/auth';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: AuthUser | null;
  users: User[];
  adminPassword: string;
  login: (id: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  addUser: (user: Omit<User, 'id' | 'created_at'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateAdminPassword: (newPassword: string) => Promise<boolean>;
  getUserByMobile: (mobile: string) => User | undefined;
  paymentReceivers: { CASH: string[]; GPAY: string[] };
  addReceiver: (name: string, type: 'CASH' | 'GPAY') => Promise<void>;
  deleteReceiver: (name: string, type: 'CASH' | 'GPAY') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [adminPassword, setAdminPassword] = useState<string>('admin123'); // Default fallback
  const [paymentReceivers, setPaymentReceivers] = useState<{ CASH: string[]; GPAY: string[] }>({ CASH: [], GPAY: [] });
  const { toast } = useToast();

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      // Fetch users
      const { data: members, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('name');

      if (membersError) throw membersError;
      if (members) setUsers(members);

      // Fetch admin password
      const { data: settings, error: settingsError } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'admin_password')
        .single();

      if (!settingsError && settings) {
        setAdminPassword(settings.value);
      }

      // Fetch payment receivers
      const { data: receiversData, error: receiversError } = await supabase
        .from('payment_receivers')
        .select('*');

      if (!receiversError && receiversData) {
        const cashObj = receiversData.filter(r => r.type === 'CASH').map(r => r.name);
        const gpayObj = receiversData.filter(r => r.type === 'GPAY').map(r => r.name);
        setPaymentReceivers({ CASH: cashObj, GPAY: gpayObj });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Only show toast if it's a real connection error, to avoid spam
      // toast({
      //   title: 'Connection Error',
      //   description: 'Using offline/local mode until database connects.',
      //   variant: 'destructive',
      // });
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const addUser = useCallback(async (newUser: Omit<User, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUsers(prev => [...prev, data]);
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: 'Error',
        description: 'Failed to add member to database',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setUsers(prev => prev.map(u => u.id === id ? data : u));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member in database',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const deleteUser = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete member from database',
        variant: 'destructive',
      });
    }
  }, [toast]);

  const updateAdminPassword = useCallback(async (newPassword: string): Promise<boolean> => {
    if (newPassword.length < 4) return false;

    try {
      const { error } = await supabase
        .from('app_settings')
        .upsert({ key: 'admin_password', value: newPassword });

      if (error) throw error;

      setAdminPassword(newPassword);
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update admin password',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  const addReceiver = useCallback(async (name: string, type: 'CASH' | 'GPAY') => {
    try {
      const { error } = await supabase
        .from('payment_receivers')
        .insert([{ name, type }]);

      if (error) throw error;
      setPaymentReceivers(prev => ({
        ...prev,
        [type]: [...prev[type], name]
      }));
      toast({ title: 'Success', description: 'Receiver added successfully' });
    } catch (error) {
      console.error('Error adding receiver:', error);
      toast({ title: 'Error', description: 'Failed to add receiver', variant: 'destructive' });
    }
  }, [toast]);

  const deleteReceiver = useCallback(async (name: string, type: 'CASH' | 'GPAY') => {
    try {
      const { error } = await supabase
        .from('payment_receivers')
        .delete()
        .match({ name, type });

      if (error) throw error;
      setPaymentReceivers(prev => ({
        ...prev,
        [type]: prev[type].filter(n => n !== name)
      }));
      toast({ title: 'Success', description: 'Receiver removed successfully' });
    } catch (error) {
      console.error('Error removing receiver:', error);
      toast({ title: 'Error', description: 'Failed to remove receiver', variant: 'destructive' });
    }
  }, [toast]);


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
      paymentReceivers,
      addReceiver,
      deleteReceiver,
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
