
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Setting up admin role for standard user...");
    
    // Check if admin role exists in profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
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
              role: 'admin'
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
              role: 'admin'
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
        
        // Try to find the user by email and update role
        const { data: users, error: searchError } = await supabase.auth.admin.listUsers();
        
        if (searchError) {
          console.error("Error searching for users:", searchError);
        } else {
          const adminUser = users.users.find(u => u.email === 'admin@mondocartonking.com');
          
          if (adminUser) {
            console.log("Found existing admin user, updating role");
            
            // Update user to admin role
            const { error: updateError } = await supabase.auth.admin.updateUserById(
              adminUser.id,
              { user_metadata: { ...adminUser.user_metadata, role: 'admin' } }
            );
            
            if (updateError) {
              console.error("Error updating admin user:", updateError);
            } else {
              // Create or update profile to admin role
              const { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', adminUser.id)
                .single();
                
              if (!existingProfile) {
                const { error: insertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: adminUser.id,
                    full_name: adminUser.user_metadata.full_name || 'Admin User',
                    role: 'admin'
                  });
                  
                if (insertError) {
                  console.error("Error creating admin profile:", insertError);
                } else {
                  console.log("Created admin profile successfully");
                }
              } else {
                const { error: updateProfileError } = await supabase
                  .from('profiles')
                  .update({ role: 'admin' })
                  .eq('id', adminUser.id);
                  
                if (updateProfileError) {
                  console.error("Error updating admin profile:", updateProfileError);
                } else {
                  console.log("Updated user to admin role successfully");
                }
              }
            }
          }
        }
        
        return true;
      }
    } else {
      console.log("Admin user already exists, no need to create");
      return true;
    }
    
    return true;
  } catch (err) {
    console.error("Error in setupAdmin:", err);
    return false;
  }
};
