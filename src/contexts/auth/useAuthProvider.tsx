
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
      console.log("Fetching profile for user:", userId);
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log("Profile fetched successfully:", profileData);
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
      console.log("Refreshing user session");
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (!currentSession) {
        console.log("No active session found");
        setUser(null);
        setProfile(null);
        return;
      }
      
      console.log("Active session found, user ID:", currentSession.user.id);
      const profileData = await fetchUserProfile(currentSession.user.id);
      
      if (profileData) {
        console.log("Setting profile:", profileData);
        setProfile(profileData);
        
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email!,
          fullName: profileData.full_name || '',
          phone: profileData.phone || '',
          role: profileData.role as UserRole,
        });
        
        console.log("User role set to:", profileData.role);
      } else {
        console.log("No profile data found, clearing user state");
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
    console.log("Initializing auth state");
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      refreshUser();
    });

    refreshUser();
    
    return () => subscription.unsubscribe();
  }, [refreshUser]);

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log("Login successful, refreshing user");
      await refreshUser();
      return { success: true };
    } catch (err: any) {
      console.error("Unexpected login error:", err);
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
      console.log("Registering new user:", email);
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
        console.error("Registration error:", error);
        setError(error.message);
        return { success: false, error: error.message };
      }
      
      console.log("Registration successful");
      // Don't immediately refresh user, wait for confirmation
      return { success: true };
    } catch (err: any) {
      console.error("Unexpected registration error:", err);
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
      console.log("Logging out user");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        setError(error.message);
        return;
      }
      
      console.log("Logout successful, clearing state");
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (err: any) {
      console.error("Unexpected logout error:", err);
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
