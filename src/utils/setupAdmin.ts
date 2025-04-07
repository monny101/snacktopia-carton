
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Setting up admin roles...");

    // Check if admin role exists in profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .limit(1);
    
    if (profileError) {
      console.error("Error checking admin profiles:", profileError);
      return false;
    }
    
    console.log("Admin check result:", profileData);
    
    // If no admin exists, try to create one
    if (!profileData || profileData.length === 0) {
      console.log("No admin found, attempting to create one");
      
      try {
        // Create a hardcoded admin user for initial setup
        const { data: userData, error: userError } = await supabase.auth.signUp({
          email: 'admin@mondocartonking.com',
          password: 'password123',
          options: {
            data: {
              full_name: 'Admin User',
              role: 'customer'
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
              role: 'customer'
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
    }
    
    return true;
  } catch (err) {
    console.error("Error in setupAdmin:", err);
    return false;
  }
};
