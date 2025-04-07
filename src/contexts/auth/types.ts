
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'admin' | 'staff';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: any }>;
  register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ success: boolean; error?: any }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
