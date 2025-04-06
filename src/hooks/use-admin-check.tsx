import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function useAdminCheck() {
  const { isAuthenticated, profile, isAdmin } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      setIsLoading(true);
      setError(null);

      try {
        if (!isAuthenticated || !profile) {
          setIsAuthorized(false);
          return;
        }

        // First check the profile role from context
        if (isAdmin) {
          setIsAuthorized(true);
          return;
        }

        // Double-check with the database as a fallback
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", profile.id)
          .single();

        if (error) {
          console.error("Error checking admin status:", error);
          setError(error.message);
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(data?.role === "admin");
      } catch (err) {
        console.error("Unexpected error in admin check:", err);
        setError("Failed to verify admin status");
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAdminStatus();
  }, [isAuthenticated, profile, isAdmin]);

  return { isAuthorized, isLoading, error };
}
