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
  const [profileFetchAttempted, setProfileFetchAttempted] = useState(false);

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === 'admin';
  const isStaff = profile?.role === 'staff';

  // Fetch user profile with improved error handling
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for user ID:", userId);
      setProfileFetchAttempted(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile is found

      if (error) {
        console.error('Error fetching user profile:', error);
        toast({
          title: "Error",
          description: "Failed to load user profile. Please try refreshing.",
          variant: "destructive",
        });
        return;
      }

      if (!data) {
        console.log("Profile not found, creating new profile for user:", userId);
        
        // Create default profile with role from user metadata if available
        const defaultRole = user?.user_metadata?.role || 'customer';
        console.log("Using role from metadata:", defaultRole);
        
        const defaultProfile: UserProfile = {
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || null,
          phone: user?.user_metadata?.phone || null,
          role: defaultRole
        };
        
        try {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              full_name: defaultProfile.full_name,
              phone: defaultProfile.phone,
              role: defaultRole
            });
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
            toast({
              title: "Error",
              description: "Failed to create user profile. Please try again.",
              variant: "destructive",
            });
          } else {
            console.log("Profile created successfully with role:", defaultRole);
            // Set profile with role from metadata
            setProfile({
              ...defaultProfile,
              role: defaultRole
            });
            
            // Re-fetch the profile to make sure we have all fields
            setTimeout(async () => {
              const { data: newProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();
                
              if (newProfile) {
                setProfile(newProfile as UserProfile);
              }
            }, 500);
          }
        } catch (insertErr) {
          console.error("Exception creating profile:", insertErr);
        }
        return;
      }

      console.log("Fetched profile:", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;
    
    // Initialize auth state
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Set up auth state listener FIRST
        authSubscription = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed:", event, session?.user?.id);
          
          // Update auth state synchronously
          setSession(session);
          setUser(session?.user ?? null);
          
          // Defer profile fetching with setTimeout to avoid recursive auth checks
          if (session?.user) {
            setTimeout(() => {
              fetchUserProfile(session.user.id);
            }, 0);
          } else {
            setProfile(null);
            setProfileFetchAttempted(false);
          }
        }).data.subscription;

        // THEN check for existing session
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session?.user?.id);
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchUserProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        toast({
          title: "Authentication Error",
          description: "Failed to initialize authentication. Please refresh.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Clean up subscription when component unmounts
    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("Attempting login with:", email);
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, fullName: string, phone?: string) => {
    try {
      console.log("Attempting to sign up user:", email);
      setIsLoading(true);
      
      // Set default role to customer for new signups
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: 'customer'  // Use customer role
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
            role: 'customer'  // Use customer role
          });
          
        if (profileError) {
          console.error("Error creating profile during signup:", profileError);
        } else {
          console.log("Profile created successfully during signup with customer role");
        }
        
        // Update local profile state
        setProfile({
          id: data.user.id,
          full_name: fullName,
          phone: phone || null,
          role: 'customer'
        });
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      setProfileFetchAttempted(false);
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
        duration: 2000,
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: new Error("User not authenticated") };

    try {
      setIsLoading(true);
      
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
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    profile,
    isAdmin,
    isStaff,
    isAuthenticated,
    isLoading,
    profileFetchAttempted,
    login,
    signup,
    logout,
    updateProfile
  };
};
