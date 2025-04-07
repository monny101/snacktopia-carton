
import { supabase } from "@/integrations/supabase/client";

export const setupAdmin = async () => {
  try {
    console.log("Setting up admin roles and functions...");

    // Create or replace the handle_new_user function
    // Fix: Use any as type to bypass TypeScript error with function names
    const { error: functionError } = await supabase.rpc('create_handle_new_user_function' as any, {});
    
    if (functionError) {
      console.error("Error creating handle_new_user function:", functionError);
    } else {
      console.log("Created handle_new_user function successfully");
    }

    // Create SQL functions to update and create the handle_new_user function
    const { error: createFunctionsError } = await supabase.rpc('create_admin_functions' as any, {});
    
    if (createFunctionsError) {
      console.error("Error creating admin functions:", createFunctionsError);
    } else {
      console.log("Created admin functions successfully");
    }

    // Try to create a hardcoded admin user (this is for initial setup)
    try {
      // Fixed TypeScript error by properly checking the type
      const { data, error } = await supabase.auth.admin.createUser({
        email: 'admin@mondocartonking.com',
        password: 'password123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Admin User',
          role: 'admin'
        }
      });
      
      if (error) {
        console.error("Error creating admin user:", error);
        return false;
      } else {
        console.log("Created admin user successfully:", data);
        
        // Create the profile for the admin user
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: 'Admin User',
            role: 'admin'
          });
        
        if (profileError) {
          console.error("Error creating admin profile:", profileError);
          return false;
        } else {
          console.log("Created admin profile successfully");
          
          // Also create a staff user for testing
          const { data: staffData, error: staffError } = await supabase.auth.admin.createUser({
            email: 'staff@mondocartonking.com',
            password: 'password123',
            email_confirm: true,
            user_metadata: {
              full_name: 'Staff User',
              role: 'staff'
            }
          });
          
          if (staffError) {
            console.error("Error creating staff user:", staffError);
            // Continue anyway since admin was created successfully
          } else {
            console.log("Created staff user successfully");
            
            // Create the profile for the staff user
            const { error: staffProfileError } = await supabase
              .from('profiles')
              .upsert({
                id: staffData.user.id,
                full_name: 'Staff User',
                role: 'staff'
              });
            
            if (staffProfileError) {
              console.error("Error creating staff profile:", staffProfileError);
            } else {
              console.log("Created staff profile successfully");
            }
          }
          
          return true;
        }
      }
    } catch (err) {
      console.log("Admin user may already exist, skipping creation");
      return true;
    }
  } catch (err) {
    console.error("Error in setupAdmin:", err);
    return false;
  }
};
