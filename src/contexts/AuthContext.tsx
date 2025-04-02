
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin' | 'staff';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isStaff: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: any | null }>;
  signup: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // Try to create the profile if it doesn't exist and we have user metadata
        if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
          try {
            const { data: metaData } = await supabase.auth.getUser();
            if (metaData.user) {
              const userData = metaData.user.user_metadata;
              const newProfile = {
                id: userId,
                full_name: userData.full_name || metaData.user.email?.split('@')[0] || null,
                phone: userData.phone || null,
                role: userData.role || 'customer',
              };
              
              console.log("Creating missing profile:", newProfile);
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([newProfile]);
                
              if (insertError) {
                console.error('Error inserting profile:', insertError);
              } else {
                console.log('Profile created successfully');
                setProfile(newProfile as UserProfile);
                return;
              }
            }
          } catch (createError) {
            console.error('Error creating missing profile:', createError);
          }
        }
        
        // Set a default profile if we can't fetch or create one
        const defaultProfile: UserProfile = {
          id: userId,
          full_name: user?.email?.split('@')[0] || null,
          phone: null,
          role: 'customer',
        };
        setProfile(defaultProfile);
        return;
      }

      console.log("Fetched profile:", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      // Set default profile on error
      const defaultProfile: UserProfile = {
        id: userId,
        full_name: user?.email?.split('@')[0] || null,
        phone: null,
        role: 'customer',
      };
      setProfile(defaultProfile);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer loading profile with setTimeout if user exists
        if (session?.user) {
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      console.log("Login successful:", data.user?.id);
      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
        duration: 2000,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { error };
    }
  };

  const signup = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      console.log("Attempting to sign up user:", email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: 'customer',
          },
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("User signed up successfully:", data);
      
      // Check if we need to manually create a profile (happens if trigger fails)
      if (data.user) {
        // Give a small delay to allow trigger to work first
        setTimeout(async () => {
          const { data: profileCheck } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id || '')
            .single();
            
          if (!profileCheck) {
            console.log("Creating profile manually after signup");
            await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: fullName,
              phone: phone || null,
              role: 'customer'
            });
          }
        }, 1000);
      }
      
      toast({
        title: "Account created successfully",
        description: "You are now logged in",
        duration: 2000,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
      duration: 2000,
    });
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data as any)
        .eq('id', user.id);

      if (error) throw error;

      // Update local profile state
      setProfile(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        duration: 2000,
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Update profile error:', error);
      return { error };
    }
  };

  const value = {
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
