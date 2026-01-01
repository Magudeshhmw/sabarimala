export type UserRole = 'owner' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  mobile_number: string;
  bag_number: string;
  bus_number: string;
  seat_number?: string;
  payment_status: 'PAID' | 'UNPAID';
  amount: number;
  created_at: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name?: string;
  mobile_number?: string;
}

export interface AdminSettings {
  admin_id: string;
  admin_password: string;
  updated_at: string;
}

// Owner credentials (hardcoded as per requirements)
export const OWNER_CREDENTIALS = {
  id: '8132381323',
  password: '81323',
};

// Admin ID (password stored in database/state)
export const ADMIN_ID = '03012026';
