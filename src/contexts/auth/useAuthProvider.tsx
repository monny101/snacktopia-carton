
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from './types';

export const useAuthProvider = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's profile details including their role
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profile;
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  // Update auth context with the current session/user
  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setUser(null);
        return;
      }
      
      const profile = await fetchUserProfile(session.user.id);
      const userRole = profile?.role as UserRole || 'customer';
      
      setUser({
        id: session.user.id,
        email: session.user.email!,
        fullName: profile?.full_name || '',
        phone: profile?.phone || '',
        role: userRole,
      });
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError('Failed to refresh user session');
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  // Initialize auth state on mount
  useEffect(() => {
    refreshUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      refreshUser();
    });

    return () => subscription.unsubscribe();
  }, [refreshUser]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      return { success: false, error: err.message || 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  // Register function
  const register = useCallback(async (email: string, password: string, fullName: string, phone: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'customer',
          },
        },
      });
      
      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      // Don't immediately refresh user, wait for confirmation
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      return { success: false, error: err.message || 'Unknown error' };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create an object with all the authentication context values
  const authContextValue = useMemo(() => ({
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser,
  }), [user, loading, error, login, register, logout, refreshUser]);

  return authContextValue;
};
