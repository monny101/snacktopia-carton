import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: "customer" | "admin" | "staff";
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
  signup: (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => Promise<{ error: any | null }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "staff";

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        // Create profile if it doesn't exist
        if (error.code === "PGRST116") {
          console.log("Profile not found, creating one...");
          await createUserProfile(userId);
          return;
        }
        return;
      }

      console.log("Fetched profile:", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error("Unexpected error fetching profile:", err);
    }
  };

  // Create user profile if it doesn't exist
  const createUserProfile = async (userId: string) => {
    try {
      const userData = user?.user_metadata;
      const { data, error } = await supabase
        .from("profiles")
        .insert([
          {
            id: userId,
            full_name: userData?.full_name || null,
            phone: userData?.phone || null,
            role: userData?.role || "customer",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Error creating user profile:", error);
        return;
      }

      console.log("Created profile:", data);
      setProfile(data as UserProfile);
    } catch (err) {
      console.error("Unexpected error creating profile:", err);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      // Handle profile loading based on event
      if (session?.user) {
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          console.log(`${event} event detected, fetching profile...`);
          await fetchUserProfile(session.user.id);
        }
      } else {
        setProfile(null);
      }
    });

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Initial session check:", session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

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

      // Check if profile exists, create if it doesn't
      if (data.user) {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.user.id)
          .single();

        if (profileError) {
          console.log("Profile not found after login, creating one...");
          await createUserProfile(data.user.id);
        } else {
          console.log("Profile found after login:", profileData);
          setProfile(profileData as UserProfile);
        }
      }

      toast({
        title: "Logged in successfully",
        description: "Welcome back!",
        duration: 2000,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Login error:", error);
      return { error };
    }
  };

  const signup = async (
    email: string,
    password: string,
    fullName: string,
    phone?: string,
  ) => {
    try {
      console.log("Attempting signup with:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      console.log("Signup successful:", data);

      // Manually create profile in profiles table
      if (data.user) {
        const { error: profileError } = await supabase.from("profiles").insert([
          {
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
            role: "customer",
          },
        ]);

        if (profileError) {
          console.error("Error creating profile after signup:", profileError);
        } else {
          console.log("Profile created successfully after signup");
        }
      }

      toast({
        title: "Account created successfully",
        description: "You are now logged in",
        duration: 2000,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Signup error:", error);
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
        .from("profiles")
        .update(data as any)
        .eq("id", user.id);

      if (error) throw error;

      // Update local profile state
      setProfile((prev) => (prev ? { ...prev, ...data } : null));

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
        duration: 2000,
      });

      return { error: null };
    } catch (error: any) {
      console.error("Update profile error:", error);
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
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Define useAuth as a named function declaration instead of an arrow function
// This helps with Fast Refresh compatibility in Vite
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
