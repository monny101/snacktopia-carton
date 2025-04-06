
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from './types';

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';
  const isCustomer = profile?.role === 'customer';

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
        
        // Create a profile for this user if it doesn't exist yet
        console.log("Creating missing profile for user:", userId);
        
        // Set default role to customer for new users
        const defaultProfile: UserProfile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || null,
          phone: null,
          role: 'customer'  // Set default role to customer
        };
        
        // Try to create profile
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: defaultProfile.full_name,
              phone: defaultProfile.phone,
              role: defaultProfile.role
            });
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
          } else {
            console.log("Profile created successfully with role:", defaultProfile.role);
          }
        } catch (insertErr) {
          console.error("Exception creating profile:", insertErr);
        }
        
        setProfile(defaultProfile);
        return;
      }

      console.log("Fetched profile:", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
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
      
      // Set default role to customer for new signups
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: 'customer'  // Set role to customer for new users
          },
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }
      
      console.log("User signed up successfully:", data);
      
      // Create profile immediately to ensure it exists
      if (data.user) {
        console.log("Creating profile immediately after signup");
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
            role: 'customer'  // Set role to customer for new users
          });
          
        if (profileError) {
          console.error("Error creating profile during signup:", profileError);
        } else {
          console.log("Profile created successfully during signup with customer role");
        }
        
        // Fetch the user's profile after signup
        fetchUserProfile(data.user.id);
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

  return {
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    isCustomer,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile
  };
};
