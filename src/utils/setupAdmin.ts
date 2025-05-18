
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Setting up initial admin user if none exists...");

    // Check if admin role exists in profiles
    const { data: adminData, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1);
    
    if (adminError) {
      console.error("Error checking admin profiles:", adminError);
      return false;
    }
    
    console.log("Admin check result:", adminData);
    
    // If no admin exists, try to create one
    if (!adminData || adminData.length === 0) {
      console.log("No admin found, attempting to create one");
      
      try {
        // Create a hardcoded admin user for initial setup
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email: 'admin@mondocartonking.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'Admin User',
              role: 'admin' // Setting the correct role here
            }
          }
        });
        
        if (userError) {
          console.error("Error creating admin user:", userError);
          return false;
        } 
        
        console.log("Created admin user successfully");
        
        // Create profile for the admin user
        if (userData.user) {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userData.user.id,
              full_name: 'Admin User',
              role: 'admin' // Explicitly setting admin role
            });
          
          if (insertError) {
            console.error("Error creating admin profile:", insertError);
            return false;
          } else {
            console.log("Created admin profile successfully");
            return true;
          }
        }
      } catch (err) {
        console.log("Admin user may already exist, skipping creation");
        return true;
      }
    } else {
      console.log("Admin user already exists, skipping creation");
    }
    
    return true;
  } catch (err) {
    console.error("Error in setupAdmin:", err);
    return false;
  }
};
