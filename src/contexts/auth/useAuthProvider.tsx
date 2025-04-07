
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole, UserProfile } from './types';
import { Session } from '@supabase/supabase-js';

export const useAuthProvider = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user's profile details including their role
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return profileData as UserProfile;
    } catch (err) {
      console.error('Unexpected error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  // Update auth context with the current session/user
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        setUser(null);
        setProfile(null);
        return;
      }
      
      const profileData = await fetchUserProfile(currentSession.user.id);
      
      if (profileData) {
        setProfile(profileData);
        
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email!,
          fullName: profileData.full_name || '',
          phone: profileData.phone || '',
          role: profileData.role,
        });
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
      setError('Failed to refresh user session');
    } finally {
      setIsLoading(false);
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
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, [refreshUser]);

  // Register function
  const register = useCallback(async (email: string, password: string, fullName: string, phone: string = '') => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Computed properties
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';

  // Create an object with all the authentication context values
  const authContextValue = useMemo(() => ({
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
  }), [user, session, profile, isAdmin, isStaff, isAuthenticated, isLoading, error, login, register, logout, refreshUser]);

  return authContextValue;
};
